import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface Ec2ConstructProps {
  vpc: ec2.Vpc;
  /** The movu/production Secrets Manager secret — EC2 role is granted read access. */
  appSecret: secretsmanager.ISecret;
}

export class Ec2Construct extends Construct {
  public readonly instance: ec2.Instance;
  public readonly elasticIp: ec2.CfnEIP;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly keyPair: ec2.KeyPair;

  constructor(scope: Construct, id: string, props: Ec2ConstructProps) {
    super(scope, id);

    // ── Security group ──────────────────────────────────────────────────────
    this.securityGroup = new ec2.SecurityGroup(this, 'Sg', {
      vpc: props.vpc,
      description: 'Movu EC2 - public web traffic and SSH',
      allowAllOutbound: true,
    });
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH');
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(443), 'HTTPS HTTP/3 (QUIC)');

    // ── SSH key pair — private key stored in SSM Parameter Store ───────────
    this.keyPair = new ec2.KeyPair(this, 'KeyPair', {
      keyPairName: 'movu-key',
      type: ec2.KeyPairType.RSA,
      format: ec2.KeyPairFormat.PEM,
    });

    // ── IAM role ────────────────────────────────────────────────────────────
    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        // Enables SSM Session Manager for in-browser terminal access (optional but free)
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });
    // Allow the instance to read its own app secret (for fetch-secrets.sh)
    props.appSecret.grantRead(role);

    // ── Instance ────────────────────────────────────────────────────────────
    this.instance = new ec2.Instance(this, 'Instance', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroup: this.securityGroup,
      role,
      keyPair: this.keyPair,
      userData: ec2.UserData.custom(buildUserData()),
      requireImdsv2: true,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(30, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
    });

    // ── Elastic IP ──────────────────────────────────────────────────────────
    this.elasticIp = new ec2.CfnEIP(this, 'Eip', { domain: 'vpc' });
    new ec2.CfnEIPAssociation(this, 'EipAssociation', {
      allocationId: this.elasticIp.attrAllocationId,
      instanceId: this.instance.instanceId,
    });
  }
}

/**
 * Builds the EC2 user data script that runs on first launch.
 *
 * Installs Docker + Docker Compose, creates /opt/movu, and sets up
 * a helper script + systemd unit that fetches app secrets from
 * AWS Secrets Manager and writes /opt/movu/.env on each boot.
 */
function buildUserData(): string {
  const lines = [
    '#!/bin/bash',
    'set -euo pipefail',
    '',
    '# Install Docker and utilities (Amazon Linux 2023)',
    'dnf install -y docker jq',
    'systemctl enable --now docker',
    'usermod -aG docker ec2-user',
    '',
    '# Install Docker Compose plugin',
    "COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r '.tag_name')",
    'mkdir -p /usr/local/lib/docker/cli-plugins',
    'curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \\',
    '  -o /usr/local/lib/docker/cli-plugins/docker-compose',
    'chmod +x /usr/local/lib/docker/cli-plugins/docker-compose',
    '',
    '# Create deployment directory',
    'mkdir -p /opt/movu/docs',
    'chown ec2-user:ec2-user /opt/movu /opt/movu/docs',
    '',
    '# Write fetch-secrets.sh — pulls movu/production from Secrets Manager into .env',
    "cat > /opt/movu/fetch-secrets.sh << 'FETCHSCRIPT'",
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    // Single-quoted heredoc: content is written verbatim. Double-quoted " inside is literal.
    "aws secretsmanager get-secret-value --secret-id movu/production --query SecretString --output text | python3 -c 'import json,sys; [print(k+\"=\"+str(v)) for k,v in json.loads(sys.stdin.read()).items()]' > /opt/movu/.env",
    'chmod 600 /opt/movu/.env',
    'FETCHSCRIPT',
    'chmod +x /opt/movu/fetch-secrets.sh',
    '',
    '# Systemd unit: re-fetch secrets on every instance boot',
    "cat > /etc/systemd/system/movu-secrets.service << 'SERVICEUNIT'",
    '[Unit]',
    'Description=Fetch Movu app secrets from AWS Secrets Manager',
    'After=network-online.target',
    'Wants=network-online.target',
    '',
    '[Service]',
    'Type=oneshot',
    'ExecStart=/opt/movu/fetch-secrets.sh',
    'RemainAfterExit=yes',
    '',
    '[Install]',
    'WantedBy=multi-user.target',
    'SERVICEUNIT',
    '',
    'systemctl daemon-reload',
    'systemctl enable movu-secrets.service',
  ];

  return lines.join('\n');
}
