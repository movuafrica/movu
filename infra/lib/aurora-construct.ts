import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface AuroraConstructProps {
  vpc: ec2.Vpc;
  /** Security group of the EC2 instance — granted inbound access on port 5432. */
  ec2SecurityGroup: ec2.SecurityGroup;
}

export class AuroraConstruct extends Construct {
  public readonly cluster: rds.DatabaseCluster;
  public readonly securityGroup: ec2.SecurityGroup;
  /** Auto-generated Secrets Manager secret containing the DB username & password. */
  public readonly credentialsSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: AuroraConstructProps) {
    super(scope, id);

    this.securityGroup = new ec2.SecurityGroup(this, 'DbSg', {
      vpc: props.vpc,
      description: 'Aurora PostgreSQL - inbound from EC2 only',
      allowAllOutbound: false,
    });

    this.securityGroup.addIngressRule(
      ec2.Peer.securityGroupId(props.ec2SecurityGroup.securityGroupId),
      ec2.Port.tcp(5432),
      'PostgreSQL from EC2',
    );

    this.cluster = new rds.DatabaseCluster(this, 'Cluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_4,
      }),
      // Auto-generates a username/password secret at movu/db-credentials
      credentials: rds.Credentials.fromGeneratedSecret('movu_user', {
        secretName: 'movu/db-credentials',
      }),
      writer: rds.ClusterInstance.serverlessV2('writer'),
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      defaultDatabaseName: 'movu',
      securityGroups: [this.securityGroup],
      storageEncrypted: true,
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      backup: {
        retention: cdk.Duration.days(7),
      },
    });

    this.credentialsSecret = this.cluster.secret!;
  }
}
