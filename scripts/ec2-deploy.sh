#!/usr/bin/env bash
# ec2-deploy.sh — run on the EC2 instance to pull and restart all services.
# Called by the GitHub Actions deploy workflow via SSH.
set -euo pipefail

DEPLOY_DIR="/opt/movu"
COMPOSE="docker compose -f $DEPLOY_DIR/docker-compose.prod.yml"

if [[ -z "${GHCR_USERNAME:-}" || -z "${GHCR_TOKEN:-}" ]]; then
	echo "❌ GHCR credentials are missing. Set GHCR_USERNAME and GHCR_TOKEN."
	exit 1
fi

if [[ -z "${IMAGE_TAG:-}" ]]; then
	echo "❌ IMAGE_TAG is missing. Set IMAGE_TAG to the commit image tag to deploy."
	exit 1
fi

echo "🔐 Logging in to GHCR..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
echo "🏷️  Deploying image tag: $IMAGE_TAG"

echo "🔐 Refreshing secrets from AWS Secrets Manager..."
bash "$DEPLOY_DIR/fetch-secrets.sh"

echo "🧹 Pruning unused Docker images/cache to free disk..."
docker image prune -af || true
docker builder prune -af || true

echo "🚀 Pulling images for tag $IMAGE_TAG..."
$COMPOSE pull

echo "♻️  Restarting services..."
$COMPOSE up -d --remove-orphans

echo "🗄️  Running database migrations..."
$COMPOSE exec -T api node apps/api/dist/db/migrate.js

echo "✅ Deployment complete."
