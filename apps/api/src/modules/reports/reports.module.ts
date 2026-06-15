import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportGateway } from './report.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-report-generation',
    }),
  ],
  providers: [ReportsService, ReportGateway],
  controllers: [ReportsController],
})
export class ReportsModule {}
