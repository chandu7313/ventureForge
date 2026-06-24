#!/bin/bash
set -e

echo "🚀 Starting VentureForge AI Development Environment"

# 1. Start Infrastructure
echo "📦 Starting Postgres & Redis..."
docker-compose up -d postgres redis

# 2. Wait for Postgres
echo "⏳ Waiting for Database..."
sleep 5

# 3. Database Push & Seed
echo "🗄️ Pushing Prisma Schema & Seeding..."
pnpm db:push
pnpm run db:seed

# 4. Start Dev Servers
echo "⚡ Starting Web and API servers..."
pnpm dev
