import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportGateway } from './report.gateway';
import { ReportWorker } from './report.worker';
import { SectionWorker } from './section.worker';
import { ReportProducer } from './report.producer';
import { IdeaDedupService } from './idea-dedup.service';
import { PdfService } from './pdf.service';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';

const REPORT_QUEUE = 'report-generation';
const DLQ_NAME = 'report-generation-dlq';
const SECTION_QUEUE = 'section-generation';

@Module({
  imports: [
    forwardRef(() => AiModule),
    UsersModule,
    BullModule.registerQueue({ name: REPORT_QUEUE }),
    // Progressive sections queue
    BullModule.registerQueue({ name: SECTION_QUEUE }),
    // Dead Letter Queue — failed jobs land here after all retries exhausted
    BullModule.registerQueue({ name: DLQ_NAME }),
    // Bull Board admin panel entries
    BullBoardModule.forFeature({
      name: REPORT_QUEUE,
      adapter: BullMQAdapter as any,
    }),
    BullBoardModule.forFeature({
      name: DLQ_NAME,
      adapter: BullMQAdapter as any,
    }),
    BullBoardModule.forFeature({
      name: SECTION_QUEUE,
      adapter: BullMQAdapter as any,
    }),
  ],
  providers: [
    ReportsService,
    ReportGateway,
    ReportWorker,
    SectionWorker,
    ReportProducer,
    IdeaDedupService,
    PdfService,
  ],
  controllers: [ReportsController],
  exports: [ReportProducer, IdeaDedupService, ReportsService, PdfService, ReportGateway],
})
export class ReportsModule {}
