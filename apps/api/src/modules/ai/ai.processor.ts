import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { ReportGateway } from '../reports/report.gateway';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('ai-report-generation')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly gateway: ReportGateway,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ reportId: string; ideaId: string }>) {
    const { reportId, ideaId } = job.data;
    
    await this.prisma.report.update({ where: { id: reportId }, data: { status: 'processing' } });

    const idea = await this.prisma.idea.findUnique({ where: { id: ideaId } });
    const ideaText = `${idea.name}: ${idea.description}`;

    // Stage 1: Market Analysis
    this.gateway.emitProgress(reportId, 'market_analysis', 25, { message: 'Analyzing market size and competitors...' });
    const marketData = await this.aiService.runMarketAnalysis(ideaText);

    // Stage 2: Risk Assessment
    this.gateway.emitProgress(reportId, 'risk_assessment', 50, { message: 'Identifying potential risks...' });
    const risks = await this.aiService.runRiskAssessment(ideaText, marketData);

    // Stage 3: Tech Lead & Timeline
    this.gateway.emitProgress(reportId, 'tech_lead', 75, { message: 'Drafting MVP timeline and slides...' });
    const techData = await this.aiService.runTechLead(ideaText);

    // Finalize
    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'completed',
        marketScore: marketData.marketScore,
        insights: marketData.insights,
        competitors: marketData.competitors,
        risks,
        timeline: techData.timeline,
        slides: techData.slides,
      },
    });

    this.gateway.emitProgress(reportId, 'completed', 100, { message: 'Report generation complete!' });
  }
}
