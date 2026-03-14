# Deployment Guide

## Architecture Overview

```
Internet
  │
  ▼
Caddy (EC2 :80/:443, automatic HTTPS)
  └─► Next.js web  (internal :3000)
        │
        ├─► NestJS API   (internal :3001, server-side only)
        └─► FastAPI RAG  (internal :8000, server-side only)
                │
                └─► ChromaDB  (internal :8000, host 127.0.0.1:8001)

External:
  AWS Aurora PostgreSQL
  Clerk (auth SaaS)
  OpenAI (LLM SaaS)
```

**Recommended EC2 instance:** `t3.medium` (2 vCPU, 4 GB RAM). Upgrade to `t3.large` when traffic warrants.

> **Why Caddy?** Caddy automatically obtains and renews TLS certificates from Let's Encrypt — no certbot, no cron jobs, no manual cert management. Just set your `DOMAIN` and it works.

---

## GitHub Secrets & Variables

Configure these in **Settings → Secrets and variables → Actions**:

### Secrets
| Name | Description |
|---|---|
| `EC2_HOST` | EC2 public IP or hostname |
| `EC2_USER` | SSH user (e.g. `ubuntu`) |
| `EC2_SSH_KEY` | Full contents of the EC2 private key (PEM format) |
| `CLERK_SECRET_KEY` | Clerk production secret key |
| `CLERK_JWT_KEY` | Clerk JWT public key (from Clerk dashboard → Advanced) |
| `DATABASE_URL` | Aurora PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key |

### Variables (not secret)
| Name | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk production publishable key |
| `TURBO_TEAM` | Turbo remote cache team (existing) |

---

## EC2 Bootstrap (one-time, manual)

SSH into the EC2 instance and run:

```bash
# Install Docker
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker

# Create the deployment directory
sudo mkdir -p /opt/movu
sudo chown ubuntu:ubuntu /opt/movu

# Create the .env file with production values (see .env.production.example)
cp .env.production.example /opt/movu/.env
nano /opt/movu/.env   # fill in all values, including DOMAIN=your-domain.com
```

Caddy takes care of TLS automatically on first startup — no certbot or extra steps needed. Just make sure:
1. Your domain's DNS A record points to the EC2 instance's public IP.
2. EC2 security group allows inbound TCP **80** and **443** (and UDP **443** for HTTP/3).

Caddy will obtain a Let's Encrypt certificate on first request and auto-renew it. Certificates are persisted in the `caddy-data` Docker volume.

---

## AWS Aurora Setup

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

Documents must be ingested separately — this is a manual step after new docs are added.

```bash
# On EC2: copy your docs into the rag-docs volume, then run ingest
docker compose -f /opt/movu/docker-compose.prod.yml exec rag python src/ingest.py
```

Or use a bind mount by adjusting the `rag` volumes section in `docker-compose.prod.yml`:
```yaml
volumes:
  - /opt/movu/docs:/app/docs
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
