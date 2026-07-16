import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiOrchestrator } from './ai.orchestrator';
import { PrismaService } from '../../prisma/prisma.service';

interface GenerateReportJob {
  reportId: string;
  ideaId: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  stage: string;
  teamSize: number;
  budget: string;
}

@Processor('ai-report-generation')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly orchestrator: AiOrchestrator,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<GenerateReportJob>) {
    const { reportId, ideaId, ideaDescription, industry, geography, stage, teamSize, budget } = job.data;

    this.logger.log(`[AiProcessor] Processing job for reportId: ${reportId}`);

    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'PROCESSING' },
    });

    try {
      const result = await this.orchestrator.run({
        reportId,
        // removed ideaId
        ideaDescription,
        industry,
        geography,
        stage,
        teamSize,
        budget,
      });

      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'DONE',
          marketScore: result.vc.investorScore,
          marketData: result.market as any,
          competitorData: result.competitors as any,
          riskData: result.product.risks as any,
          mvpData: result.product.mvp as any,
          pitchData: result.vc.pitch as any,
        },
      });

      this.logger.log(`[AiProcessor] Report ${reportId} completed successfully.`);
    } catch (err) {
      this.logger.error(`[AiProcessor] Report ${reportId} FAILED: ${(err as Error).message}`);
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'FAILED' },
      });
      throw err; // Re-throw so BullMQ marks job as failed
    }
  }
}
