#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MovuStack } from '../lib/movu-stack';

const app = new cdk.App();
new MovuStack(app, 'MovuStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Movu production infrastructure — EC2, Aurora PostgreSQL, VPC',
});
