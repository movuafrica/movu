# Deployment Guide

## Architecture Overview

```
                   Vercel
                   Next.js web
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
Caddy (EC2 :80/:443, automatic HTTPS)
  ├─► /api/*  → NestJS API    (internal :3001)
  └─► /rag/*  → FastAPI RAG   (internal :8000)
                    │
                    └─► ChromaDB  (internal :8000, host 127.0.0.1:8001)

External:
  AWS Aurora PostgreSQL (provisioned by CDK)
  Clerk (auth SaaS)
  OpenAI (LLM SaaS)
```

**EC2 instance:** `t3.medium` (2 vCPU, 4 GB RAM). Upgrade to `t3.large` when traffic warrants.

> The Next.js web app is deployed on **Vercel** (existing setup). Only the NestJS API and FastAPI RAG service run on EC2, exposed via Caddy with automatic HTTPS.

Infrastructure (VPC, EC2, Elastic IP, Aurora) is managed by **AWS CDK** (`infra/`). Code deployment is handled by **GitHub Actions**.

---

## Infrastructure Deployment (AWS CDK)

The `infra/` directory contains the CDK TypeScript app that provisions all AWS resources. Run CDK commands from inside that directory.

### Prerequisites

- AWS CLI configured: `aws configure` (or use a named profile)
- Node.js 20+ and pnpm installed

```bash
cd infra
pnpm install
```

### First-time bootstrap (once per AWS account/region)

```bash
pnpm bootstrap   # runs: cdk bootstrap
```

### Deploying infrastructure

```bash
pnpm deploy      # runs: cdk deploy --require-approval broadening
```

CDK will print all stack outputs when the deployment completes:

| Output | Description |
|---|---|
| `ElasticIp` | Public IP for your domain DNS A record |
| `InstanceId` | EC2 instance ID |
| `SshKeyPairSsmPath` | SSM path to retrieve the private SSH key |
| `AuroraWriterEndpoint` | Aurora cluster writer endpoint |
| `DbCredentialsSecretArn` | ARN of the auto-generated DB credentials secret |
| `AppSecretArn` | ARN of the `movu/production` app secret |

### Previewing changes

```bash
pnpm diff        # runs: cdk diff
```

---

## Post-Deploy Setup (one-time)

After the first `cdk deploy`, complete these steps before triggering a code deploy.

### 1. Retrieve the SSH private key

```bash
# The SSM path is printed in the SshKeyPairSsmPath output
aws ssm get-parameter \
  --name <SshKeyPairSsmPath> \
  --with-decryption \
  --query Parameter.Value \
  --output text > movu-key.pem
chmod 600 movu-key.pem
```

Add the contents of `movu-key.pem` to the `EC2_SSH_KEY` GitHub Secret.

### 2. Point your domain DNS

Set your domain's DNS A record to the `ElasticIp` output value. This must be done before Caddy can obtain a TLS certificate.

Caddy handles TLS automatically on first startup — no certbot needed. Ensure the EC2 security group allows:
- TCP **80** and **443** (already set by CDK)
- UDP **443** for HTTP/3 (already set by CDK)

### 3. Build the DATABASE_URL

1. Open the `DbCredentialsSecretArn` secret in the AWS Console → Secrets Manager to get the DB username and password.
2. Use the `AuroraWriterEndpoint` output for the hostname.
3. Construct the connection string:
   ```
   postgresql://movu_user:<password>@<AuroraWriterEndpoint>:5432/movu
   ```

### 4. Populate the app secret

Open the `movu/production` secret in the AWS Console (or use the CLI) and fill in all values:

```bash
aws secretsmanager put-secret-value \
  --secret-id movu/production \
  --secret-string '{
    "DOMAIN": "your-domain.com",
    "GITHUB_REPOSITORY": "owner/movu",
    "DATABASE_URL": "postgresql://movu_user:password@cluster.xxxx.rds.amazonaws.com:5432/movu",
    "CLERK_SECRET_KEY": "sk_live_...",
    "CLERK_JWT_KEY": "-----BEGIN PUBLIC KEY-----...",
    "CLERK_AUTHORIZED_PARTIES": "https://your-vercel-domain.vercel.app",
    "OPENAI_API_KEY": "sk-...",
    "HF_TOKEN": "hf_...",
    "CORS_ORIGINS": "https://your-vercel-domain.vercel.app"
  }'
```

---

## Vercel Environment Variables

Set these in your Vercel project settings for the production environment:

| Variable | Value |
|---|---|
| `MOVU_API_URL` | `https://your-domain.com/api` |
| `RAG_API_URL` | `https://your-domain.com/rag` |
| `CLERK_SECRET_KEY` | Clerk production secret key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production publishable key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/signup` |

---

## GitHub Secrets & Variables

Configure these in **Settings → Secrets and variables → Actions**:

### Secrets
| Name | Description |
|---|---|
| `EC2_HOST` | Elastic IP (from CDK output) |
| `EC2_USER` | SSH user — `ec2-user` on Amazon Linux |
| `EC2_SSH_KEY` | Contents of `movu-key.pem` (retrieved from SSM — see above) |
| `CLERK_SECRET_KEY` | Clerk production secret key |
| `CLERK_JWT_KEY` | Clerk JWT public key (from Clerk dashboard → Advanced) |
| `DATABASE_URL` | Aurora PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key |

> **Note:** `CLERK_SECRET_KEY`, `CLERK_JWT_KEY`, `DATABASE_URL`, and `OPENAI_API_KEY` are still needed by the CI workflow. The EC2 instance reads these from AWS Secrets Manager (`movu/production`) at deploy and boot time — the GitHub secrets are only used during the CI build step.

### Variables (not secret)
| Name | Description |
|---|---|
| `TURBO_TEAM` | Turbo remote cache team (existing) |

---

## Code Deployment (GitHub Actions)

Push a commit to `main`. The CI workflow runs first; once it passes, the Deploy workflow automatically:

1. Builds and pushes Docker images to GHCR (`movu-api`, `movu-rag`).
2. SCPs the compose config, Caddyfile, and scripts to `/opt/movu/` on EC2.
3. SSHs in and runs `scripts/ec2-deploy.sh`, which:
   - Refreshes `/opt/movu/.env` from AWS Secrets Manager
   - Pulls new images
   - Restarts all containers
   - Runs Drizzle migrations against Aurora

---

## SSH Access

```bash
ssh -i movu-key.pem ec2-user@<ElasticIp>
```

---

## Document Ingestion (RAG)

Documents are served to the RAG container from `/opt/movu/docs` on the EC2 host. To add new documents:

```bash
# Copy a document to the EC2 instance
scp -i movu-key.pem my-doc.pdf ec2-user@<EC2_HOST>:/opt/movu/docs/

# Then trigger ingestion inside the running container
docker compose -f /opt/movu/docker-compose.prod.yml exec rag python src/ingest.py
```

---

## Useful Commands

```bash
# View logs
docker compose -f /opt/movu/docker-compose.prod.yml logs -f

# Restart a single service
docker compose -f /opt/movu/docker-compose.prod.yml restart api

# Run migrations manually
docker compose -f /opt/movu/docker-compose.prod.yml exec api node dist/db/migrate.js

# Refresh .env from Secrets Manager
bash /opt/movu/fetch-secrets.sh

# Connect to ChromaDB admin (localhost only)
curl http://localhost:8001/api/v1/heartbeat

# Inspect Caddy's TLS certificate status
docker compose -f /opt/movu/docker-compose.prod.yml exec caddy caddy list-certificates
```

---

## Updating Infrastructure

To modify AWS resources (resize EC2, adjust Aurora capacity, add security group rules, etc.):

```bash
cd infra
# Edit the relevant construct in infra/lib/
pnpm diff    # preview changes
pnpm deploy  # apply changes
```

---

## Environment Variable Reference

See [`.env.production.example`](.env.production.example) for all required variables.

The runtime `.env` at `/opt/movu/.env` is automatically generated from the `movu/production` Secrets Manager secret on each EC2 boot and on every GitHub Actions deploy.
