FROM node:20-alpine AS base
WORKDIR /app
RUN npm i -g pnpm

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @startupsaarthi/db db:generate
RUN pnpm --filter @startupsaarthi/workers build

FROM base AS runner
ENV NODE_ENV production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/workers/dist ./dist
COPY --from=builder /app/packages/db ./packages/db

CMD ["node", "dist/index.js"]
