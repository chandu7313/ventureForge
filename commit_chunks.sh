#!/bin/bash
set -e

# 1. Workspace
git add pnpm-workspace.yaml pnpm-lock.yaml packages/db/package-lock.json packages/ui/package.json packages/db/package.json
git commit -m "chore: update pnpm workspace and shared package configs" || true

# 2. Dockerignore
git add .dockerignore
git commit -m "chore: add .dockerignore to prevent local node_modules leak" || true

# 3. Docs
git add ARCHITECTURE.md
git commit -m "docs: add enterprise ARCHITECTURE.md documentation" || true

# 4. Docker compose
git add docker-compose.yml
git commit -m "chore: update docker-compose.yml with new services architecture" || true

# 5. DB Schema
git add packages/db/prisma/schema.prisma packages/db/prisma/seed.ts
git commit -m "feat: update prisma schema and seed scripts for new data model" || true

# 6. Common Interceptors and Filters
git add apps/api/src/common/filters/ apps/api/src/common/interceptors/ apps/api/src/common/metrics/
git commit -m "feat(api): create metrics, logging interceptors and exception filters" || true

# 7. Common Guards and Decorators
git add apps/api/src/common/guards/ apps/api/src/common/decorators/
git commit -m "feat(api): add auth, plan guards and user decorators" || true

# 8. Redis cache
git add apps/api/src/common/redis/
git commit -m "feat(api): implement redis caching module and interceptors" || true

# 9. Pipes
git add apps/api/src/common/pipes/
git commit -m "feat(api): add zod validation pipes for DTOs" || true

# 10. Config
git add apps/api/src/config/
git commit -m "feat(api): implement structured nestjs configuration module" || true

# 11. Prisma
git add apps/api/src/prisma/
git commit -m "feat(api): setup prisma module and core repositories" || true

# 12. Auth
git add apps/api/src/modules/auth/
git commit -m "feat(api): implement jwt-based authentication module" || true

# 13. Users
git add apps/api/src/modules/users/
git commit -m "feat(api): implement users management module" || true

# 14. Ideas & Payments
git add apps/api/src/modules/ideas/ apps/api/src/modules/payments/
git commit -m "feat(api): implement ideas and payments modules" || true

# 15. Reports
git add apps/api/src/modules/reports/
git commit -m "feat(api): implement reports generation module and websockets" || true

# 16. AI Orchestrator
git add apps/api/src/modules/ai/
git commit -m "feat(api): implement ai agent orchestrator and prompts" || true

# 17. Analytics
git add apps/api/src/modules/analytics/
git commit -m "feat(api): implement analytics and usage tracking module" || true

# 18. API Entrypoint
git add apps/api/src/app.module.ts apps/api/src/app.module.js apps/api/src/main.ts apps/api/src/main.js
git commit -m "feat(api): setup nestjs main entrypoint and root app module" || true

# 19. API Configs
git add apps/api/Dockerfile apps/api/package.json apps/api/tsconfig.json
git commit -m "chore(api): configure api dockerfile, dependencies, and tsconfig" || true

# 20. Web Styling
git add apps/web/tailwind.config.js apps/web/postcss.config.js apps/web/src/styles/
git commit -m "feat(web): integrate Sovereign Analyst design system tokens" || true

# 21. Web Layout
git add apps/web/src/app/layout.tsx apps/web/src/components/providers.tsx apps/web/src/components/features/
git commit -m "feat(web): implement root layout, providers and sidebar components" || true

# 22. Web Auth & Public
git add apps/web/src/app/\(auth\)/ apps/web/src/app/\(public\)/ apps/web/src/app/api/
git commit -m "feat(web): implement jwt auth pages and public landing page" || true

# 23. Web Dashboard
git add apps/web/src/app/\(dashboard\)/
git commit -m "feat(web): implement dashboard, report and settings views" || true

# 24. Web Configs
git add apps/web/Dockerfile apps/web/package.json apps/web/tsconfig.json apps/web/next-env.d.ts apps/web/middleware.ts
git commit -m "chore(web): configure web dockerfile, middleware and dependencies" || true

# 25. Remove workers
git rm -r apps/workers/ || true
git commit -m "chore: remove deprecated standalone workers service" || true

# 26. Final catch-all
git add .
git commit -m "chore: formatting and minor configuration updates" || true

# Push all commits
git push origin main
