# StartupSaarthi (Startup-Validator)

An intelligent, multi-agent AI platform that automatically validates, analyzes, and provides comprehensive reports for startup ideas. StartupSaarthi helps founders instantly generate market research, financial projections, competitor analysis, technical feasibility, and localized product strategies.

## 🚀 Key Features

*   **Multi-Agent AI Analysis**: Employs a chorus of specialized AI agents (Market, Competitor, Product, Financial, Technical) powered by Anthropic's Claude to thoroughly evaluate every angle of a startup idea.
*   **Deep Localization (Indian Context)**: Built-in support for generating reports with strong Indian market context (DPIIT regulations, UPI integrations, Tier-2/3 insights).
*   **Multilingual Support**: Generate complete startup validation reports in both English and Hindi (Devanagari script) with a seamless UI language toggle.
*   **Startup Name & Domain Generator**: AI-powered tool that brainstorms culturally appropriate, catchy startup names and instantly checks for `.com` and `.in` domain availability using Redis-backed caching.
*   **Credits-Based Billing**: Integrated Razorpay checkout flow. Users start with 1,000 free credits and can top up their account via one-time payments (Starter, Pro, Agency packs).
*   **Asynchronous Report Generation**: Heavy AI workflows are processed in the background using BullMQ and Redis, delivering real-time progress updates via WebSockets.
*   **Export & Compare**: Side-by-side idea comparison, public shareable links, and polished PDF exports.

## 🛠 Tech Stack

This project is structured as a full-stack **Turborepo** monorepo using **pnpm**.

*   **Frontend**: Next.js 14, React 18, TailwindCSS, Framer Motion, Recharts.
*   **Backend**: NestJS, TypeScript, Prisma ORM, BullMQ.
*   **Database**: PostgreSQL (via Supabase / RDS).
*   **Caching & Queues**: Redis / ElastiCache.
*   **AI Integration**: Anthropic Claude API (`@anthropic-ai/sdk`).
*   **Payments**: Razorpay Standard Checkout.

## 📁 Repository Structure

```text
.
├── apps/
│   ├── api/            # NestJS backend API, BullMQ workers, and AI Agents
│   └── web/            # Next.js frontend dashboard and landing pages
├── packages/
│   ├── config/         # Shared ESLint/TS configs
│   ├── db/             # Prisma schema, migrations, and generated client
│   ├── types/          # Shared TypeScript interfaces
│   └── ui/             # Shared React components
└── docker-compose.yml  # Local development environment (Redis)
```

## ⚙️ Local Development Setup

### 1. Prerequisites

*   **Node.js** (v18+ recommended)
*   **pnpm** (v8+)
*   **PostgreSQL** (running locally or via Supabase)
*   **Redis** (running locally via Docker)

### 2. Installation

Clone the repository and install all workspace dependencies:

```bash
pnpm install
```

### 3. Environment Variables

Create `.env` files in both `apps/api` and `apps/web` based on their respective `.env.example` files. 

**Key variables needed:**
*   `DATABASE_URL`: Your PostgreSQL connection string.
*   `REDIS_URL`: Your Redis connection string (e.g., `redis://localhost:6379`).
*   `ANTHROPIC_API_KEY`: Your Claude API key for AI generation.
*   `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: For local payment testing.

### 4. Database Setup

Push the Prisma schema to your database and generate the Prisma client:

```bash
pnpm --filter @startupiq/db exec prisma db push
pnpm --filter @startupiq/db exec prisma generate
```

*(Optional)* Seed the database with initial data:
```bash
pnpm --filter @startupiq/db run seed
```

### 5. Running the Application

Start the Redis container (if not running natively):
```bash
docker compose up -d redis
```

Start the development servers for both Next.js and NestJS concurrently:
```bash
pnpm run dev
```

*   **Frontend**: [http://localhost:3000](http://localhost:3000)
*   **Backend API**: [http://localhost:3001](http://localhost:3001)

## 🐳 Production Deployment

The project is configured for containerized deployment (e.g., AWS EC2, ECS, or Vercel/Render). 
*   **Next.js**: Can be deployed via Vercel or Docker (`Dockerfile` in `apps/web`).
*   **NestJS API & Workers**: Can be run concurrently or separated into an API container and a Worker container using the `apps/api/Dockerfile`.
*   **Nginx**: Reverse proxy configuration provided in `/infrastructure/nginx`.

## 📜 License

Private Repository. All rights reserved.
