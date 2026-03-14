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
  AWS Aurora PostgreSQL
  Clerk (auth SaaS)
  OpenAI (LLM SaaS)
```

**Recommended EC2 instance:** `t3.medium` (2 vCPU, 4 GB RAM). Upgrade to `t3.large` when traffic warrants.

> The Next.js web app is deployed on **Vercel** (existing setup). Only the NestJS API and FastAPI RAG service run on EC2, exposed via Caddy with automatic HTTPS.

---

## Vercel Environment Variables

Set these in your Vercel project settings for the production environment:

| Variable | Value |
|---|---|
| `MOVU_API_URL` | `https://your-ec2-domain.com/api` |
| `RAG_API_URL` | `https://your-ec2-domain.com/rag` |
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
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_USER` | SSH user — `ec2-user` on Amazon Linux |
| `EC2_SSH_KEY` | Full contents of the EC2 private key (PEM format) |
| `CLERK_SECRET_KEY` | Clerk production secret key |
| `CLERK_JWT_KEY` | Clerk JWT public key (from Clerk dashboard → Advanced) |
| `DATABASE_URL` | Aurora PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key |

### Variables (not secret)
| Name | Description |
|---|---|
| `TURBO_TEAM` | Turbo remote cache team (existing) |

---

## EC2 Bootstrap (one-time, manual)

SSH into the instance (`ssh -i your-key.pem ec2-user@<EC2_HOST>`) and run:

```bash
# Install Docker (Amazon Linux 2023)
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
newgrp docker

# Install Docker Compose plugin
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f4)
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create the deployment directory and docs folder
sudo mkdir -p /opt/movu/docs
sudo chown ec2-user:ec2-user /opt/movu /opt/movu/docs

# Create the .env file with production values (see .env.production.example)
cp .env.production.example /opt/movu/.env
nano /opt/movu/.env   # fill in all values, including DOMAIN=your-domain.com
```

> **Amazon Linux 2 (AL2)?** Replace `dnf` with `yum` and add `amazon-linux-extras install docker` before the `yum install` step.

Caddy takes care of TLS automatically on first startup — no certbot or extra steps needed. Just make sure:
1. Your domain's DNS A record points to the EC2 instance's public IP.
2. EC2 security group allows inbound TCP **80** and **443** (and UDP **443** for HTTP/3).

Caddy will obtain a Let's Encrypt certificate on first request and auto-renew it. Certificates are persisted in the `caddy-data` Docker volume.

---

## AWS Infrastructure Setup

### 1. Elastic IP

Allocate an Elastic IP and associate it with your EC2 instance **before** pointing your domain's DNS. This gives the instance a stable public IP that survives reboots.

1. EC2 Console → **Elastic IPs** → **Allocate Elastic IP address**
2. Select the new IP → **Actions** → **Associate Elastic IP address** → pick your instance
3. Use this IP for your domain's DNS A record and as `EC2_HOST` in GitHub Secrets

> Elastic IPs are free while associated with a running instance. You're only charged if the IP is allocated but unattached.

### 2. Aurora PostgreSQL

1. Create an **Aurora PostgreSQL** cluster (Serverless v2 or provisioned, `t3.medium` compatible instance class).
2. Set the initial database name to `movu`.
3. Create a user and password; use those in `DATABASE_URL`.
4. Add the EC2 instance's **security group** to the Aurora cluster's inbound rules on port **5432**.
5. Paste the **writer endpoint** into `DATABASE_URL`:
   ```
   postgresql://movu_user:password@cluster-writer.xxxx.us-east-1.rds.amazonaws.com:5432/movu
   ```

---

## First Deploy

After bootstrapping the EC2 instance, push a commit to `main`. The CI workflow runs first; once it passes, the Deploy workflow automatically:

1. Builds and pushes three Docker images to GHCR (`movu-api`, `movu-web`, `movu-rag`).
2. SCPs the compose config, nginx, and scripts to `/opt/movu/` on EC2.
3. SSHs in and runs `scripts/ec2-deploy.sh`, which:
   - Pulls new images
   - Restarts all containers
   - Runs Drizzle migrations against Aurora

---

## Document Ingestion (RAG)

Documents are served to the RAG container from `/opt/movu/docs` on the EC2 host via a bind mount. To add new documents:

```bash
# Copy a document to the EC2 instance
scp my-doc.pdf ec2-user@<EC2_HOST>:/opt/movu/docs/

# Then trigger ingestion inside the running container
docker compose -f /opt/movu/docker-compose.prod.yml exec rag python src/ingest.py
```

The ingest script caches processed chunks, so re-running it only processes new files.

---

## Useful Commands

```bash
# View logs
docker compose -f /opt/movu/docker-compose.prod.yml logs -f

# Restart a single service
docker compose -f /opt/movu/docker-compose.prod.yml restart api

# Run migrations manually
docker compose -f /opt/movu/docker-compose.prod.yml exec api node dist/db/migrate.js

# Connect to ChromaDB admin (localhost only)
curl http://localhost:8001/api/v1/heartbeat

# Inspect Caddy's TLS certificate status
docker compose -f /opt/movu/docker-compose.prod.yml exec caddy caddy list-certificates
```

---

## Environment Variable Reference

See [`.env.production.example`](.env.production.example) for all required variables.

### Internal Service URLs

The Next.js server communicates with the API and RAG service over the Docker network. These are set in `docker-compose.prod.yml` and never exposed publicly:

| Variable | Value |
|---|---|
| `MOVU_API_URL` | `http://api:3001` |
| `RAG_API_URL` | `http://rag:8000` |
