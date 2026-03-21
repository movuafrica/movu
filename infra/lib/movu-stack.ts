import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcConstruct } from './vpc-construct';
import { SecretsConstruct } from './secrets-construct';
import { AuroraConstruct } from './aurora-construct';
import { Ec2Construct } from './ec2-construct';
import { S3Construct } from './s3-construct';

export class MovuStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpcConstruct = new VpcConstruct(this, 'Vpc');
    const secretsConstruct = new SecretsConstruct(this, 'Secrets');
    const s3Construct = new S3Construct(this, 'S3');

    // EC2 is created first so its security group can be passed to the Aurora construct.
    const ec2Construct = new Ec2Construct(this, 'Ec2', {
      vpc: vpcConstruct.vpc,
      appSecret: secretsConstruct.appSecret,
    });

    const auroraConstruct = new AuroraConstruct(this, 'Aurora', {
      vpc: vpcConstruct.vpc,
      ec2SecurityGroup: ec2Construct.securityGroup,
    });

    // Allow the instance to read the auto-generated Aurora DB credentials secret.
    auroraConstruct.credentialsSecret.grantRead(ec2Construct.instance.role);
    s3Construct.bucket.grantRead(ec2Construct.instance.role);

    // ── Stack outputs ───────────────────────────────────────────────────────

    new cdk.CfnOutput(this, 'ElasticIp', {
      value: ec2Construct.elasticIp.attrPublicIp,
      description:
        'EC2 Elastic IP - point your domain DNS A record here and set as EC2_HOST in GitHub Secrets',
    });

    new cdk.CfnOutput(this, 'InstanceId', {
      value: ec2Construct.instance.instanceId,
      description: 'EC2 instance ID',
    });

    new cdk.CfnOutput(this, 'SshKeyPairSsmPath', {
      value: ec2Construct.keyPair.privateKey.parameterName,
      description:
        'SSM path to the private SSH key - retrieve with: aws ssm get-parameter --name <path> --with-decryption --query Parameter.Value --output text > movu-key.pem',
    });

    new cdk.CfnOutput(this, 'AuroraWriterEndpoint', {
      value: auroraConstruct.cluster.clusterEndpoint.hostname,
      description: 'Aurora cluster writer endpoint - use when building DATABASE_URL',
    });

    new cdk.CfnOutput(this, 'DbCredentialsSecretArn', {
      value: auroraConstruct.credentialsSecret.secretArn,
      description:
        'ARN of the auto-generated Aurora credentials (movu/db-credentials) - open in AWS Console to get username/password for DATABASE_URL',
    });

    new cdk.CfnOutput(this, 'AppSecretArn', {
      value: secretsConstruct.appSecret.secretArn,
      description:
        'ARN of the app secret (movu/production) - populate all fields before first deploy',
    });

    new cdk.CfnOutput(this, 'RagDocumentsBucketName', {
      value: s3Construct.bucket.bucketName,
      description: 'S3 bucket for RAG documents - upload PDFs here before running ingest',
    });
  }
}
