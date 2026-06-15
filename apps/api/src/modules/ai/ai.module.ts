import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiOrchestrator } from './orchestrator';
import { AiProcessor } from './ai.processor';
import { MarketAgent } from './agents/market.agent';
import { CompetitorAgent } from './agents/competitor.agent';
import { ProductAgent } from './agents/product.agent';
import { VcAgent } from './agents/vc.agent';
import { ReportGateway } from '../reports/report.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-report-generation',
    }),
  ],
  providers: [
    AiOrchestrator,
    AiProcessor,
    MarketAgent,
    CompetitorAgent,
    ProductAgent,
    VcAgent,
    ReportGateway,
  ],
  exports: [AiOrchestrator],
})
export class AiModule {}
