# 🚀 StartupIQ AI — Intelligent Startup Validation Platform

<p align="center">
  <strong>AI-powered multi-agent platform that validates, scores, and generates comprehensive reports for startup ideas — tailored for the Indian ecosystem.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/pnpm-%3E%3D8-orange?logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-10-red?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/AI-Claude%20Sonnet-blueviolet?logo=anthropic" alt="Claude" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-blue?logo=razorpay" alt="Razorpay" />
  <img src="https://img.shields.io/badge/IaC-Terraform-purple?logo=terraform" alt="Terraform" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Repository Structure](#-repository-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Frontend Pages](#-frontend-pages)
- [AI Agents Pipeline](#-ai-agents-pipeline)
- [Credits & Billing System](#-credits--billing-system)
- [Infrastructure & Deployment](#-infrastructure--deployment)
- [Monitoring & Observability](#-monitoring--observability)
- [Testing](#-testing)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**StartupIQ AI** is a production-grade, full-stack SaaS platform designed to help founders, investors, and incubators validate startup ideas with AI-driven intelligence. Instead of months of manual market research, users describe their idea and receive a comprehensive validation report — complete with market sizing, competitor analysis, financial projections, risk assessment, and investor-ready pitch materials — in under 2 minutes.

The platform is purpose-built for the **Indian startup ecosystem**, with deep localization for DPIIT regulations, UPI-first monetization models, Tier-2/3 market insights, and Hindi language support.

---

## ✨ Key Features

### 🤖 Multi-Agent AI Analysis
Five specialized AI agents powered by **Anthropic Claude** work in parallel to evaluate every angle of a startup idea:
- **Market Analyst** — TAM/SAM/SOM sizing, growth trends, regulatory landscape
- **Competitor Scout** — Identifies direct/indirect competitors, funding data, positioning gaps
- **Product Strategist** — MVP roadmap, GTM channels, risk matrix, tech stack recommendations
- **VC Agent** — Investor scorecard, fundability verdict (FUND / WATCH / PASS), pitch deck content
- **Synthesis Engine** — Merges all agent outputs into a unified, scored report

### 🇮🇳 Deep Indian Localization
- DPIIT/Startup India regulatory context baked into every analysis
- UPI, RuPay, and India Stack integration suggestions
- Tier-1 vs Tier-2/3 city market segmentation
- Vernacular naming recommendations for Indian audiences
- Geography-aware competitor and market data

### 🌐 Multilingual Reports (English + Hindi)
- Full reports generated in **Hindi (Devanagari script)** when requested
- Language toggle in the UI with persistent preference
- i18n framework with extensible translation files (`en.ts`, `hi.ts`)

### 🏷️ AI Startup Name & Domain Generator
- Claude-powered name brainstorming (catchy, 1-2 words, culturally appropriate)
- Real-time `.com` and `.in` domain availability checking via `whois-json`
- Results cached in Redis (TTL: 1 hour) for fast repeat lookups

### 💳 Credits-Based Billing (Razorpay)
- New users start with **1,000 free credits**
- 1 report generation = **100 credits**
- Three top-up packages via Razorpay Standard Checkout:
  - **Starter Pack** — 500 credits for ₹499
  - **Pro Pack** — 2,000 credits for ₹1,499
  - **Agency Pack** — 5,000 credits for ₹2,999
- Secure server-side signature verification before credits are added
- Admin can directly edit credits in the database

### ⚡ Asynchronous Report Generation
- Heavy AI workloads processed via **BullMQ** job queues (backed by Redis)
- HTTP 202 Accepted — user never waits for a response
- Real-time progress updates pushed to the frontend via **WebSockets** (Socket.IO)
- Configurable retry policies and dead letter queues

### 📊 Reports Dashboard
- Paginated list of all user reports with status indicators
- Interactive charts: Industry Distribution (Pie), Report Trends (Line), Radar Comparisons
- Composite scoring: Idea Score, Market Score, Moat Score, Risk Score, Investor Score

### 🔀 Side-by-Side Idea Comparison
- Compare any two reports with AI-generated comparative analysis
- Radar chart overlay for visual score comparison
- Clear winner recommendation with reasoning

### 📄 PDF Export
- Generate polished, branded PDF reports using `@react-pdf/renderer`
- Pre-signed S3 URLs with configurable expiry (default: 1 hour)

### 🔗 Public Report Sharing
- Generate unique `nanoid`-based share tokens
- Public read-only report view (no authentication required)
- Revocable share links

### 💡 Idea Deduplication
- SHA-256 hash-based deduplication prevents duplicate report generation
- Cached in Redis with 7-day TTL
- Returns existing report instantly if duplicate detected

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion, Recharts, Lucide Icons, Sonner (toast notifications) |
| **Backend** | NestJS 10, TypeScript 5.3, Express 5, Prisma ORM, BullMQ, Socket.IO |
| **AI** | Anthropic Claude Sonnet 4.5 (`@anthropic-ai/sdk`) |
| **Database** | PostgreSQL 16 (Supabase / AWS RDS) |
| **Cache & Queues** | Redis 7 (AWS ElastiCache in production) |
| **Auth** | JWT (custom stateless implementation) with HTTP-Only cookie storage |
| **Payments** | Razorpay Orders API + Webhook verification |
| **Storage** | AWS S3 (PDF reports, pre-signed URLs) |
| **PDF Generation** | `@react-pdf/renderer` |
| **Monitoring** | Prometheus, Grafana, Loki, Promtail, Alertmanager |
| **Infrastructure** | Docker, Docker Compose, Terraform (AWS), Nginx |
| **Testing** | Playwright (E2E), Jest (Unit) |
| **Monorepo** | Turborepo + pnpm workspaces |

---

## 🏗 Architecture

StartupIQ follows an **event-driven, multi-agent orchestration** architecture:

```
┌─────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│   Next.js Web   │────▶│    NestJS API        │────▶│   PostgreSQL DB   │
│   (Port 3000)   │◀────│    (Port 3001)        │◀────│   (Prisma ORM)    │
└─────────────────┘     └──────────┬───────────┘     └───────────────────┘
        │                          │
        │ WebSocket (Socket.IO)    │ BullMQ Job Queue
        │                          ▼
        │                ┌──────────────────┐
        │                │   Report Worker   │
        │                └────────┬─────────┘
        │                         │
        │                         ▼
        │                ┌──────────────────┐
        │                │  AI Orchestrator  │
        │                │                  │
        │                │  ┌────────────┐  │
        │                │  │  Market     │  │
        │                │  │  Agent      │  │     ┌──────────────────┐
        ◀────────────────│  ├────────────┤  │────▶│  Anthropic Claude │
         Progress Events │  │ Competitor │  │     │  (Sonnet 4.5)     │
                         │  │  Agent      │  │     └──────────────────┘
                         │  ├────────────┤  │
                         │  │  Product   │  │     ┌──────────────────┐
                         │  │  Agent      │  │────▶│   Redis Cache    │
                         │  ├────────────┤  │     └──────────────────┘
                         │  │  VC Agent  │  │
                         │  └────────────┘  │     ┌──────────────────┐
                         │                  │────▶│   AWS S3 (PDFs)   │
                         └──────────────────┘     └──────────────────┘
```

### Report Generation Flow
1. User submits idea via `POST /api/v1/reports/generate`
2. Controller deduplicates, deducts 100 credits, creates a `PENDING` report record
3. Job is pushed to BullMQ queue — HTTP returns `202 Accepted` immediately
4. Background `ReportWorker` picks up the job and invokes `AiOrchestrator`
5. Orchestrator runs 4 specialist agents in **parallel** (`Promise.all`)
6. Each agent calls Claude with domain-specific prompts + Indian context
7. Results are merged, scored, and the report status is set to `DONE`
8. Progress events are emitted via WebSocket throughout the pipeline

---

## 📁 Repository Structure

```text
StartupIQ/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── main.ts               # App bootstrap (CORS, Swagger, Helmet)
│   │       ├── app.module.ts         # Root module with all imports
│   │       ├── common/               # Shared infrastructure
│   │       │   ├── guards/           # AuthGuard (JWT verification)
│   │       │   ├── interceptors/     # Logging, timeout interceptors
│   │       │   ├── metrics/          # Prometheus metrics module
│   │       │   └── redis/            # Redis service & HTTP cache interceptor
│   │       ├── config/               # Joi-based env validation
│   │       ├── prisma/               # PrismaService (database access)
│   │       └── modules/
│   │           ├── ai/               # AI orchestration engine
│   │           │   ├── agents/       # Market, Competitor, Product, VC agents
│   │           │   ├── prompts/      # Prompt templates (per agent + India context)
│   │           │   ├── ai.orchestrator.ts
│   │           │   └── ai.types.ts
│   │           ├── analytics/        # User analytics & metrics aggregation
│   │           ├── auth/             # JWT login/register, /me endpoint
│   │           ├── ideas/            # CRUD for startup ideas
│   │           ├── payments/         # Razorpay credit purchase & webhook
│   │           ├── reports/          # Report CRUD, BullMQ producer/worker/gateway
│   │           │   ├── reports.controller.ts
│   │           │   ├── reports.service.ts
│   │           │   ├── report.producer.ts   # BullMQ job enqueue
│   │           │   ├── report.worker.ts     # Background job processor
│   │           │   ├── report.gateway.ts    # WebSocket real-time events
│   │           │   ├── idea-dedup.service.ts
│   │           │   └── pdf.service.tsx       # React PDF generation
│   │           ├── tools/            # Name generator & domain checker
│   │           └── users/            # User profile & credit management
│   │
│   └── web/                          # Next.js Frontend
│       ├── Dockerfile
│       ├── playwright.config.ts      # E2E test configuration
│       ├── e2e/                      # Playwright E2E test suites
│       └── src/
│           ├── app/
│           │   ├── (auth)/           # /sign-in, /sign-up pages
│           │   ├── (dashboard)/      # Protected app shell
│           │   │   ├── billing/      # Credits balance & top-up packages
│           │   │   ├── compare/      # Side-by-side report comparison
│           │   │   ├── competitors/  # Competitor analysis view
│           │   │   ├── dashboard/    # Main dashboard with charts
│           │   │   ├── report/[id]/  # Individual report detail page
│           │   │   ├── settings/     # User settings
│           │   │   └── validate/new/ # New idea submission form
│           │   ├── share/[token]/    # Public shared report view
│           │   └── api/              # Next.js API routes (BFF)
│           ├── components/
│           │   └── features/         # Domain-specific components
│           │       ├── AppSidebar.tsx
│           │       ├── BillingStatus.tsx
│           │       ├── CompareReportsView.tsx
│           │       ├── DownloadReportBtn.tsx
│           │       ├── IndustryDistChart.tsx
│           │       ├── LanguageToggle.tsx
│           │       ├── NameGeneratorWidget.tsx
│           │       ├── PlanUpgradeModal.tsx
│           │       ├── RadarCompare.tsx
│           │       ├── ReportProgressBar.tsx
│           │       ├── ReportTrendChart.tsx
│           │       └── ShareReportBtn.tsx
│           ├── hooks/
│           │   └── useReportSocket.ts # WebSocket hook for live progress
│           ├── lib/
│           │   ├── api-client.ts     # Axios-like fetch wrapper
│           │   └── i18n/             # Internationalization (en, hi)
│           └── middleware.ts         # JWT route protection
│
├── packages/
│   ├── config/                       # Shared ESLint, Prettier, TSConfig
│   ├── db/                           # Prisma schema, migrations, seed
│   │   └── prisma/schema.prisma
│   ├── types/                        # Shared TypeScript interfaces
│   └── ui/                           # Shared Tailwind/Shadcn components
│
├── infrastructure/
│   ├── monitoring/                   # Prometheus, Grafana, Loki, Alertmanager
│   │   ├── prometheus.yml
│   │   ├── alertmanager.yml
│   │   ├── alerts.yml
│   │   ├── promtail.yml
│   │   └── docker-compose.monitoring.yml
│   ├── nginx/                        # Nginx reverse proxy config
│   │   └── conf.d/startupiq.conf
│   └── terraform/                    # AWS Infrastructure as Code
│       ├── main.tf                   # Provider & backend config
│       ├── vpc.tf                    # VPC, subnets, NAT, IGW
│       ├── ec2.tf                    # EC2 instances, ASG, ALB
│       ├── rds.tf                    # PostgreSQL RDS
│       ├── elasticache.tf            # Redis ElastiCache
│       ├── ecr.tf                    # Docker container registry
│       ├── s3.tf                     # S3 buckets for reports
│       ├── variables.tf
│       ├── outputs.tf
│       └── userdata.sh               # EC2 bootstrap script
│
├── scripts/
│   ├── deploy.sh                     # Automated deployment script
│   ├── ec2-bootstrap.sh              # EC2 instance setup
│   └── ssl-setup.sh                  # Let's Encrypt SSL certificate
│
├── nginx/nginx.conf                  # Root Nginx configuration
├── docker-compose.yml                # Local development environment
├── docker-compose.prod.yml           # Production Docker Compose
├── turbo.json                        # Turborepo pipeline configuration
├── pnpm-workspace.yaml               # pnpm workspace definition
└── ARCHITECTURE.md                   # Detailed architecture document
```

---

## 🗄 Database Schema

The platform uses **PostgreSQL** with **Prisma ORM**. Key models:

| Model | Description |
|-------|------------|
| **User** | Accounts with email/password auth, credit balance (default: 1000) |
| **Idea** | Startup ideas with industry, geography, stage, team size, budget |
| **Report** | AI-generated validation reports with composite scores and JSON payloads per agent |
| **Comparison** | Side-by-side comparison of two reports with AI analysis |
| **Payment** | Razorpay order/payment tracking |
| **UsageLog** | Audit trail for all user actions |

### Enums
- **ReportStatus**: `PENDING` → `PROCESSING` → `DONE` / `FAILED`
- **Industry**: `EDTECH`, `FINTECH`, `AGRITECH`, `HEALTHTECH`, `SAAS`, `D2C`, `ECOMMERCE`, `LOGISTICS`, `HRTECH`, `PROPTECH`, `LEGALTECH`, `CLIMATETECH`, `DEEPTECH`, `CREATOR_ECONOMY`, `OTHER`
- **Geography**: `INDIA_TIER1`, `INDIA_TIER2_3`, `PAN_INDIA`, `SOUTH_ASIA`, `SOUTHEAST_ASIA`, `GLOBAL`
- **Verdict**: `FUND`, `WATCH`, `PASS`

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20.x | Runtime |
| pnpm | ≥ 8.x | Package manager |
| Docker & Docker Compose | Latest | Local PostgreSQL + Redis |
| Git | Latest | Version control |

### 1. Clone the Repository

```bash
git clone https://github.com/chandu7313/StartupIQ.git
cd StartupIQ
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section below)
```

### 4. Start Infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d postgres redis
```

### 5. Initialize the Database

```bash
# Push Prisma schema to PostgreSQL
pnpm --filter @startupiq/db exec prisma db push

# Generate Prisma client
pnpm --filter @startupiq/db exec prisma generate

# (Optional) Seed with sample data
pnpm --filter @startupiq/db run seed
```

### 6. Start Development Servers

```bash
pnpm run dev
```

This starts both apps concurrently via Turborepo:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

---

## 🔐 Environment Variables

Create a `.env` file in the project root. See [`.env.example`](.env.example) for the full template.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_HOST` | ✅ | Redis hostname (default: `localhost`) |
| `REDIS_PORT` | ✅ | Redis port (default: `6379`) |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic Claude API key |
| `ANTHROPIC_MODEL` | ❌ | Model name (default: `claude-sonnet-4-5`) |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | ❌ | For webhook signature verification |
| `AWS_ACCESS_KEY_ID` | ❌ | AWS credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | ❌ | AWS credentials for S3 |
| `AWS_REGION` | ❌ | AWS region (default: `ap-south-1`) |
| `S3_BUCKET_NAME` | ❌ | S3 bucket for PDF storage |
| `PORT` | ❌ | API port (default: `3001`) |
| `APP_URL` | ❌ | Public application URL |
| `CORS_ORIGINS` | ❌ | Allowed CORS origins |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Client-side Razorpay key (for checkout) |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user (returns JWT) |
| `POST` | `/api/v1/auth/login` | Login (returns JWT) |
| `GET` | `/api/v1/auth/me` | Get current user profile |

### Ideas
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ideas` | Create a new startup idea |
| `GET` | `/api/v1/ideas` | List user's ideas (paginated) |
| `GET` | `/api/v1/ideas/:id` | Get idea by ID |
| `DELETE` | `/api/v1/ideas/:id` | Delete an idea |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/reports/generate` | Queue AI report generation (costs 100 credits) |
| `GET` | `/api/v1/reports` | List user's reports (paginated) |
| `GET` | `/api/v1/reports/:id` | Get report by ID |
| `GET` | `/api/v1/reports/compare` | Compare two reports side-by-side |
| `GET` | `/api/v1/reports/:id/pdf` | Generate PDF export (S3 pre-signed URL) |
| `POST` | `/api/v1/reports/:id/share` | Generate public share link |
| `DELETE` | `/api/v1/reports/:id/share` | Revoke share link |
| `GET` | `/api/v1/reports/public/:token` | Fetch public report (no auth) |
| `DELETE` | `/api/v1/reports/:id` | Soft-delete a report |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/payments/buy-credits` | Create Razorpay order for credit pack |
| `POST` | `/api/v1/payments/verify-payment` | Verify payment & add credits |
| `GET` | `/api/v1/payments/invoices` | Get payment history |
| `POST` | `/api/v1/payments/webhook` | Razorpay webhook handler |

### Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/tools/name-generator` | Generate AI startup names + check domains |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/analytics/summary` | Get user's report metrics and credit balance |

---

## 🖥 Frontend Pages

| Route | Description |
|-------|-------------|
| `/sign-in` | Login page |
| `/sign-up` | Registration page |
| `/dashboard` | Main dashboard with charts and recent reports |
| `/validate/new` | Submit a new startup idea for validation |
| `/report/[id]` | Detailed AI report view with scores and analysis |
| `/compare` | Side-by-side comparison of two reports |
| `/competitors` | Competitor landscape analysis |
| `/billing` | Credit balance, top-up packages, payment history |
| `/settings` | User profile settings |
| `/share/[token]` | Public read-only report view |

---

## 🤖 AI Agents Pipeline

Each agent receives the user's idea + Indian market context and returns structured JSON:

| Agent | Responsibilities | Output Fields |
|-------|-----------------|---------------|
| **Market Analyst** | TAM/SAM/SOM, growth rate, regulatory factors, market trends | `marketData` |
| **Competitor Scout** | Direct/indirect competitors, funding history, positioning gaps | `competitorData` |
| **Product Strategist** | MVP roadmap, GTM channels, risk matrix, tech stack | `riskData`, `mvpData`, `gtmData` |
| **VC Agent** | Investability scoring, monetization models, pitch deck slides | `investorData`, `monetizationData`, `pitchData` |

All agents run in **parallel** via `Promise.all()` and their outputs are merged into a single report with composite scores (0–100) and a final `Verdict` (FUND / WATCH / PASS).

---

## 💳 Credits & Billing System

### How Credits Work
- Every new user receives **1,000 free credits** upon registration
- Generating a report costs **100 credits** (deducted at queue time)
- If a user has insufficient credits, the API returns `402 Payment Required`
- Admin users can directly edit credit balances via the database

### Credit Packages (Razorpay)

| Package | Credits | Price (INR) | Per-Credit Cost |
|---------|---------|-------------|-----------------|
| Starter | 500 | ₹499 | ₹1.00 |
| Pro | 2,000 | ₹1,499 | ₹0.75 |
| Agency | 5,000 | ₹2,999 | ₹0.60 |

### Payment Flow
1. User selects a package on the `/billing` page
2. Frontend calls `POST /api/v1/payments/buy-credits` to create a Razorpay Order
3. Razorpay Checkout opens in a modal
4. On success, frontend calls `POST /api/v1/payments/verify-payment` with the payment signature
5. Backend verifies the HMAC signature and atomically increments the user's credit balance

---

## ☁️ Infrastructure & Deployment

### Local Development
```bash
docker compose up -d    # PostgreSQL + Redis + Nginx
pnpm run dev            # Next.js + NestJS dev servers
```

### Production (Docker Compose)
```bash
docker compose -f docker-compose.prod.yml up -d
```

### AWS Infrastructure (Terraform)

The `infrastructure/terraform/` directory provisions a complete AWS environment:

| Resource | Terraform File | Description |
|----------|---------------|-------------|
| **VPC** | `vpc.tf` | VPC with public/private subnets, NAT Gateway, IGW |
| **EC2** | `ec2.tf` | Application servers with Auto Scaling Group and ALB |
| **RDS** | `rds.tf` | PostgreSQL 16 in private subnet |
| **ElastiCache** | `elasticache.tf` | Redis cluster for caching and BullMQ |
| **ECR** | `ecr.tf` | Docker container registry |
| **S3** | `s3.tf` | PDF report storage with lifecycle policies |

```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file=terraform.tfvars.staging
terraform apply -var-file=terraform.tfvars.staging
```

### Nginx Reverse Proxy
- Routes `/api/*` to NestJS (port 3001)
- Routes everything else to Next.js (port 3000)
- SSL termination with Let's Encrypt certificates
- WebSocket upgrade support for Socket.IO

---

## 📊 Monitoring & Observability

The `infrastructure/monitoring/` directory includes a complete observability stack:

| Tool | Purpose | Config File |
|------|---------|-------------|
| **Prometheus** | Metrics collection (request latency, queue depth, error rates) | `prometheus.yml` |
| **Grafana** | Dashboards and visualization | (via Docker Compose) |
| **Loki** | Log aggregation | (via Docker Compose) |
| **Promtail** | Log shipping from containers to Loki | `promtail.yml` |
| **Alertmanager** | Alert routing to Slack/email | `alertmanager.yml`, `alerts.yml` |

Start the monitoring stack:
```bash
cd infrastructure/monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Application Metrics
The NestJS API exposes Prometheus metrics at `/metrics`:
- `http_request_duration_seconds` — Request latency histogram
- `http_requests_total` — Request counter by method, route, status
- `bullmq_jobs_total` — Queue job counter by status

---

## 🧪 Testing

### End-to-End Tests (Playwright)

```bash
# Install Playwright browsers
pnpm --filter @startupiq/web exec playwright install

# Run E2E tests
pnpm --filter @startupiq/web exec playwright test
```

Test suites cover:
- **Authentication** (`auth.spec.ts`) — Login, registration, session management
- **Idea Validation** (`validate.spec.ts`) — Form submission and queue response
- **Report Viewing** (`report.spec.ts`) — Report loading, score display, PDF export

Page Object Models are located in `apps/web/e2e/pages/` for maintainable test code.

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start all dev servers (Turborepo) |
| `pnpm run build` | Build all packages for production |
| `pnpm run lint` | Lint all packages |
| `pnpm run test` | Run all test suites |
| `pnpm run db:push` | Push Prisma schema changes to DB |
| `scripts/deploy.sh` | Automated deployment to EC2 |
| `scripts/ec2-bootstrap.sh` | Bootstrap a fresh EC2 instance |
| `scripts/ssl-setup.sh` | Set up Let's Encrypt SSL certificates |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat(module): add amazing feature'`)
4. Push to your branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- **NestJS Files**: `kebab-case` suffix naming — `[name].[type].ts` (e.g., `ai.orchestrator.ts`)
- **React Components**: `PascalCase` naming (e.g., `BillingStatus.tsx`)
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`)
- **JSDoc**: Required for all public service methods

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ for Indian Founders
</p>
