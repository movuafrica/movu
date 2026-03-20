#!/usr/bin/env bash
# ec2-deploy.sh — run on the EC2 instance to pull and restart all services.
# Called by the GitHub Actions deploy workflow via SSH.
set -euo pipefail

DEPLOY_DIR="/opt/movu"
COMPOSE="docker compose -f $DEPLOY_DIR/docker-compose.prod.yml"

echo "🔐 Refreshing secrets from AWS Secrets Manager..."
bash "$DEPLOY_DIR/fetch-secrets.sh"

echo "🚀 Pulling latest images..."
$COMPOSE pull

echo "♻️  Restarting services..."
$COMPOSE up -d --remove-orphans

echo "🗄️  Running database migrations..."
$COMPOSE exec -T api node dist/db/migrate.js

echo "✅ Deployment complete."
