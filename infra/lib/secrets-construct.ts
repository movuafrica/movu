import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

// Keys that must be populated in the AWS Console (or via CLI) after `cdk deploy`.
const APP_SECRET_TEMPLATE = {
  DOMAIN: '',
  GITHUB_REPOSITORY: '',
  DATABASE_URL: '',
  CLERK_SECRET_KEY: '',
  CLERK_JWT_KEY: '',
  CLERK_AUTHORIZED_PARTIES: '',
  OPENAI_API_KEY: '',
  HF_TOKEN: '',
  CORS_ORIGINS: '',
  RAG_S3_BUCKET: '',
};

export class SecretsConstruct extends Construct {
  public readonly appSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Import an existing app secret by name to avoid create collisions.
    this.appSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'AppSecret',
      'movu/production',
    );
  }
}
