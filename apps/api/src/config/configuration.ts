export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },
  database: {
    url: process.env.DATABASE_URL,
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ttl: {
      report: parseInt(process.env.REDIS_TTL_REPORT || '86400', 10),
      user: parseInt(process.env.REDIS_TTL_USER || '3600', 10),
      ideaDedup: parseInt(process.env.REDIS_TTL_IDEA_DEDUP || '604800', 10),
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '3072', 10),
    timeoutMs: parseInt(process.env.ANTHROPIC_TIMEOUT_MS || '120000', 10),
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    prices: {
      pro: parseInt(process.env.RAZORPAY_PRO_PRICE_PAISE || '49900', 10),
      premium: parseInt(process.env.RAZORPAY_PREMIUM_PRICE_PAISE || '149900', 10),
    },
  },
  monitoring: {
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
    lokiUrl: process.env.LOKI_URL,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  },
  admin: {
    tokens: (process.env.ADMIN_TOKENS || '').split(',').filter(Boolean),
  },
  bullmq: {
    boardEnabled: process.env.BULL_BOARD_ENABLED === 'true',
  },
});
