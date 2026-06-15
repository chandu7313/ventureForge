import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiOrchestrator } from './orchestrator';
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
      data: { status: 'processing' },
    });

    try {
      const result = await this.orchestrator.run({
        reportId,
        ideaId,
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
          status: 'completed',
          marketScore: result.vc.investorScore,
          insights: result.market as any,
          competitors: result.competitors as any,
          risks: result.product.risks as any,
          timeline: result.product.mvp as any,
          slides: result.vc.pitch as any,
        },
      });

      this.logger.log(`[AiProcessor] Report ${reportId} completed successfully.`);
    } catch (err) {
      this.logger.error(`[AiProcessor] Report ${reportId} FAILED: ${(err as Error).message}`);
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'failed' },
      });
      throw err; // Re-throw so BullMQ marks job as failed
    }
  }
}
