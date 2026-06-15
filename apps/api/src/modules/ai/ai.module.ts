import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiService } from './ai.service';
import { AiProcessor } from './ai.processor';
import { ReportGateway } from '../reports/report.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-report-generation',
    }),
  ],
  providers: [AiService, AiProcessor, ReportGateway],
})
export class AiModule {}
