#!/bin/bash
set -e

# 1
git add apps/api/src/common/metrics/metrics.interceptor.ts
git commit -m "feat(api): add metrics interceptor for request monitoring" || true

# 2
git add apps/api/src/common/metrics/metrics.module.ts apps/api/src/common/metrics/metrics.service.ts
git commit -m "feat(api): update metrics module and service" || true

# 3
git add apps/api/src/modules/ai/prompts/india-context.ts
git commit -m "feat(ai): introduce Indian context localization" || true

# 4
git add apps/api/src/modules/ai/prompts/competitor.prompt.ts apps/api/src/modules/ai/prompts/market.prompt.ts
git commit -m "feat(ai): enhance competitor and market prompts" || true

# 5
git add apps/api/src/modules/ai/prompts/product.prompt.ts apps/api/src/modules/ai/prompts/vc.prompt.ts
git commit -m "feat(ai): update product and vc prompts for better analysis" || true

# 6
git add apps/api/src/modules/ai/agents/competitor.agent.ts apps/api/src/modules/ai/agents/market.agent.ts
git commit -m "feat(ai): refactor competitor and market agents" || true

# 7
git add apps/api/src/modules/ai/agents/product.agent.ts apps/api/src/modules/ai/agents/vc.agent.ts
git commit -m "feat(ai): improve product and vc agents" || true

# 8
git add apps/api/src/modules/ai/ai.orchestrator.ts apps/api/src/modules/ai/ai.types.ts
git commit -m "refactor(ai): update orchestrator and types" || true

# 9
git add apps/api/src/modules/reports/pdf.service.tsx
git commit -m "feat(reports): implement PDF export service" || true

# 10
git add apps/api/src/modules/tools/
git commit -m "feat(tools): add name generator and domain checker tools" || true

# 11
git add apps/web/e2e/ apps/web/playwright.config.ts
git commit -m "test(web): setup playwright e2e tests" || true

# 12
git add apps/web/src/app/\(dashboard\)/billing/ apps/web/src/components/features/BillingStatus.tsx apps/web/src/components/features/PlanUpgradeModal.tsx
git commit -m "feat(web): overhaul billing UI to use credit-based system" || true

# 13
git add apps/web/src/app/\(dashboard\)/compare/ apps/web/src/components/features/CompareReportsView.tsx apps/web/src/components/features/RadarCompare.tsx
git commit -m "feat(web): add side-by-side report comparison views" || true

# 14
git add apps/web/src/app/\(dashboard\)/competitors/
git commit -m "feat(web): add standalone competitors view" || true

# 15
git add apps/web/src/app/share/ apps/web/src/components/features/ShareReportBtn.tsx apps/web/src/components/features/DownloadReportBtn.tsx
git commit -m "feat(web): implement public report sharing and downloads" || true

# 16
git add apps/web/src/components/features/IndustryDistChart.tsx apps/web/src/components/features/ReportTrendChart.tsx apps/web/src/components/features/ReportProgressBar.tsx
git commit -m "feat(web): add new data visualization charts and progress bars" || true

# 17
git add apps/web/src/components/features/LanguageToggle.tsx apps/web/src/lib/i18n/
git commit -m "feat(web): add multi-language support and toggle" || true

# 18
git add apps/web/src/components/features/NameGeneratorWidget.tsx
git commit -m "feat(web): integrate AI name generator widget" || true

# 19
git add infrastructure/monitoring/
git commit -m "chore(infra): add prometheus and alertmanager configs" || true

# 20
git add infrastructure/nginx/ nginx/nginx.conf
git commit -m "chore(infra): update nginx reverse proxy configuration" || true

# 21
git add infrastructure/terraform/
git commit -m "chore(infra): update terraform provisioning scripts" || true

# 22
git add scripts/
git commit -m "chore: add utility scripts" || true

# 23
git add apps/api/Dockerfile apps/web/Dockerfile docker-compose*.yml
git commit -m "chore(docker): update container configs for production and dev" || true

# 24
git add packages/db/
git commit -m "feat(db): transition Prisma schema to credit-based models" || true

# 25
git add apps/api/src/modules/reports/
git commit -m "feat(api): refactor reports module for credit deductions" || true

# 26
git add apps/api/src/modules/payments/
git commit -m "feat(api): migrate payments to Razorpay one-time credit orders" || true

# 27
git add apps/api/src/modules/auth/ apps/api/src/modules/users/ apps/api/src/modules/analytics/ apps/api/src/common/guards/plan.guard.ts
git commit -m "feat(api): update user profiles, auth, and analytics for credits" || true

# 28
git add apps/api/src/main.ts apps/api/src/app.module.ts apps/api/src/common/redis/redis.service.ts
git commit -m "chore(api): update app bootstraps and redis configs" || true

# 29
git add apps/web/src/app/\(dashboard\)/dashboard/page.tsx apps/web/src/app/\(dashboard\)/report/\[id\]/page.tsx apps/web/src/app/\(dashboard\)/validate/new/page.tsx apps/web/src/components/features/AppSidebar.tsx
git commit -m "feat(web): wire up frontend dashboard and report views" || true

# 30
git add apps/web/src/components/providers.tsx apps/web/src/hooks/useReportSocket.ts apps/web/src/lib/api-client.ts
git commit -m "refactor(web): improve providers and socket hooks" || true

# 31
git add .
git commit -m "chore: update dependencies, README, and lockfiles" || true

echo "Pushing changes..."
git push origin feat/terraform-infra-config
