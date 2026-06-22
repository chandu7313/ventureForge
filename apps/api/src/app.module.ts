import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdeasModule } from './modules/ideas/ideas.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { ToolsModule } from './modules/tools/tools.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    AppConfigModule,
    MetricsModule,
    ToolsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    ScheduleModule.forRoot(),

    // In-memory cache for cache-manager
    CacheModule.register({
      isGlobal: true,
    }),

    // BullMQ connection
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: false,
      },
    }),

    // Bull Board admin UI at /admin/queues
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    PrismaModule,
    RedisModule,
    AuthModule,
    IdeasModule,
    ReportsModule,
    AiModule,
    PaymentsModule,
    UsersModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
