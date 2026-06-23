#!/bin/bash
set -e

ENV=$1
if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "Usage: bash scripts/deploy.sh [staging|production]"
  exit 1
fi

echo "Starting deployment for $ENV environment..."

# In a real CI/CD pipeline, AWS_ACCOUNT_ID and AWS_REGION are injected via env vars.
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-"YOUR_ACCOUNT_ID"}
AWS_REGION=${AWS_REGION:-"ap-south-1"}
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Assume we are already SSH'd into the target machine or this is running natively on the EC2
cd /opt/startupiq

echo "1. Pulling latest images from ECR..."
docker-compose -f docker-compose.prod.yml pull

echo "2. Applying zero-downtime deployment..."
docker-compose -f docker-compose.prod.yml up -d --no-recreate

echo "3. Running Prisma Migrations..."
docker-compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy

echo "4. Running Health Checks..."
MAX_RETRIES=5
SLEEP_TIME=15
ATTEMPT=1
SUCCESS=0

while [ $ATTEMPT -le $MAX_RETRIES ]; do
  echo "Health check attempt $ATTEMPT of $MAX_RETRIES..."
  
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/v1/health || true)
  WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || true)

  if [ "$API_STATUS" == "200" ] && [ "$WEB_STATUS" == "200" ]; then
    echo "Health check passed!"
    SUCCESS=1
    break
  fi

  echo "API: $API_STATUS, WEB: $WEB_STATUS. Waiting $SLEEP_TIME seconds..."
  sleep $SLEEP_TIME
  ATTEMPT=$((ATTEMPT+1))
done

if [ $SUCCESS -eq 0 ]; then
  echo "Deployment failed health checks! Rolling back..."
  docker-compose -f docker-compose.prod.yml down
  # In a robust setup, you would tag previous images and roll back to them here.
  # For simplicity, bringing back up will use the currently cached images if tagged correctly.
  docker-compose -f docker-compose.prod.yml up -d
  echo "Rollback initiated. Check logs immediately!"
  exit 1
fi

echo "Deployment completed successfully!"
