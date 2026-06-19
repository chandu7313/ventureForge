#!/bin/bash
set -e

# 24. Web Configs
git add apps/web/Dockerfile apps/web/package.json apps/web/tsconfig.json apps/web/next-env.d.ts apps/web/src/middleware.ts || true
git commit -m "chore(web): configure web dockerfile, middleware and dependencies" || true

# 25. Remove workers
git rm -r apps/workers/ || true
git commit -m "chore: remove deprecated standalone workers service" || true

# 26. Final catch-all
git add .
git commit -m "chore: formatting and minor configuration updates" || true

# Push all commits
git push origin main || true
