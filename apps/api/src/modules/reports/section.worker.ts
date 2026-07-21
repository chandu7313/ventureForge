import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiOrchestrator } from '../ai/ai.orchestrator';
import { ReportGateway } from './report.gateway';
import { RedisService, CacheKeys, CacheTTL } from '../../common/redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';
import {
  GENERATABLE_SECTIONS,
  getSection,
  TOTAL_GENERATABLE,
} from '../ai/section-registry';

export interface SectionJobData {
  sectionId: string;
  reportId: string;
  input: {
    reportId: string;
    ideaDescription: string;
    industry: string;
    geography: string;
    stage: string;
    teamSize: number;
    budget: string;
    language?: string;
    state?: string;
    businessType?: string;
    country?: string;
  };
}

/**
 * SectionWorker — BullMQ Processor for individual report sections.
 *
 * Each job generates ONE section of the report, then:
 *  1. Caches result in Redis (section-level)
 *  2. Persists to Postgres (correct JSON column)
 *  3. Pushes result to frontend via WebSocket
 *  4. Updates progress counter
 *
 * Concurrency: 4 — prevents API rate-limit saturation.
 */
@Processor('section-generation', { concurrency: 4 })
export class SectionWorker extends WorkerHost {
  private readonly logger = new Logger(SectionWorker.name);

  constructor(
    @Inject(forwardRef(() => AiOrchestrator)) private readonly orchestrator: AiOrchestrator,
    @Inject(forwardRef(() => ReportGateway)) private readonly gateway: ReportGateway,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<SectionJobData>): Promise<any> {
    const { sectionId, reportId, input } = job.data;
    const sectionDef = getSection(sectionId);

    if (!sectionDef) {
      this.logger.error(`Unknown section: ${sectionId}`);
      return null;
    }

    // Skip derived sections (estimatedMs === 0) — they are sub-views of parent data
    if (sectionDef.estimatedMs === 0) {
      this.logger.debug(`Skipping derived section: ${sectionId}`);
      return null;
    }

    // Check if report was cancelled
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { cancelledAt: true, status: true },
    });
    if (report?.cancelledAt || report?.status === ReportStatus.FAILED) {
      this.logger.warn(`⏭️ Skipping section "${sectionId}" — report ${reportId} was cancelled`);
      return null;
    }

    // Check if already cached (idempotency)
    const cached = await this.redis.get(CacheKeys.section(reportId, sectionId));
    if (cached) {
      this.logger.log(`♻️ Cache HIT for section "${sectionId}" of report ${reportId}`);
      this.gateway.emitSectionComplete(reportId, sectionId, cached);
      return cached;
    }

    this.logger.log(`🔄 Generating section "${sectionId}" for report ${reportId}`);
    this.gateway.emitSectionProcessing(reportId, sectionId);

    const startTime = Date.now();

    try {
      // Generate the section via orchestrator
      const data = await this.generateSection(sectionId, input);
      const durationMs = Date.now() - startTime;

      if (!data) {
        throw new Error(`Section "${sectionId}" returned null data`);
      }

      // 1. Cache in Redis
      await this.redis.set(CacheKeys.section(reportId, sectionId), data, CacheTTL.SECTION);

      // 2. Persist to Postgres
      await this.persistToDb(reportId, sectionId, data);

      // 3. Update progress counter
      const completedCount = await this.incrementProgress(reportId);

      // 4. Emit to frontend
      this.gateway.emitSectionComplete(reportId, sectionId, data, {
        completedCount,
        totalCount: TOTAL_GENERATABLE,
      });

      // 5. Check if all sections are done
      if (completedCount >= TOTAL_GENERATABLE) {
        await this.finalizeReport(reportId);
      }

      this.logger.log(`✅ Section "${sectionId}" done in ${durationMs}ms (${completedCount}/${TOTAL_GENERATABLE})`);
      return data;

    } catch (err) {
      const errorMsg = (err as Error).message;
      this.logger.error(`❌ Section "${sectionId}" failed: ${errorMsg}`);

      // Record failure
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          failedSectionIds: { push: sectionId },
        },
      });

      // Emit failure to frontend
      this.gateway.emitSectionFailed(reportId, sectionId, errorMsg);

      // Still increment progress (so we don't get stuck)
      const completedCount = await this.incrementProgress(reportId);
      if (completedCount >= TOTAL_GENERATABLE) {
        await this.finalizeReport(reportId);
      }

      throw err; // Re-throw for BullMQ retry
    }
  }

  // ─── Section Generation Router ──────────────────────────────────

  private async generateSection(sectionId: string, input: any): Promise<any> {
    switch (sectionId) {
      case 'executive_summary':
        return this.orchestrator.generateFastOverview(input);

      case 'business_score':
        return this.orchestrator.generateFastOverview(input);

      case 'market_analysis':
        return this.orchestrator.generateSection(input, 'market');

      case 'competitors':
        return this.orchestrator.generateSection(input, 'competitors');

      case 'product':
        return this.orchestrator.generateSection(input, 'product');

      case 'financial':
        return this.orchestrator.generateSection(input, 'financial');

      case 'formation':
        return this.orchestrator.generateSection(input, 'formation');

      case 'compliance':
        return this.orchestrator.generateSection(input, 'compliance');

      case 'operations':
        return this.orchestrator.generateSection(input, 'operations');

      case 'vc_synthesis': {
        // VC needs market, competitor, product data from Redis
        const [marketData, competitorData, productData] = await Promise.all([
          this.redis.get(CacheKeys.section(input.reportId, 'market_analysis')),
          this.redis.get(CacheKeys.section(input.reportId, 'competitors')),
          this.redis.get(CacheKeys.section(input.reportId, 'product')),
        ]);
        const vcInput = {
          ...input,
          marketData: marketData || { tam: { value: 0, currency: '$' }, sam: { value: 0, currency: '$' }, som: { value: 0, currency: '$' }, analysis: '' },
          competitorData: competitorData || { competitors: [] },
          productData: productData || { mvp: [], risks: [] },
        };
        return this.orchestrator.generateSection(vcInput, 'vc_synthesis');
      }

      case 'diagrams': {
        // Diagrams need operations, compliance, product, and market data
        const [opsData, compData, prodData, mktData] = await Promise.all([
          this.redis.get<any>(CacheKeys.section(input.reportId, 'operations')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'compliance')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'product')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'market_analysis')),
        ]);
        return this.orchestrator.generateDiagrams(input, mktData, opsData, compData, prodData);
      }

      case 'charts': {
        // Charts need financial, market, product data
        const [finData, mktData, prodData] = await Promise.all([
          this.redis.get<any>(CacheKeys.section(input.reportId, 'financial')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'market_analysis')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'product')),
        ]);
        return this.orchestrator.generateCharts(input, finData, mktData, prodData);
      }

      case 'ai_recommendations': {
        // Recommendations need market, financial, competitor, product data
        const [mktData, finData, compData, prodData] = await Promise.all([
          this.redis.get<any>(CacheKeys.section(input.reportId, 'market_analysis')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'financial')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'competitors')),
          this.redis.get<any>(CacheKeys.section(input.reportId, 'product')),
        ]);
        return this.orchestrator.generateSynthesis(input, mktData, finData, prodData, compData);
      }

      default:
        this.logger.warn(`No generator mapped for section: ${sectionId}`);
        return null;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────

  private async persistToDb(reportId: string, sectionId: string, data: any): Promise<void> {
    const sectionDef = getSection(sectionId);
    if (!sectionDef?.dbField) return;

    const updateData: Record<string, any> = {};

    // Map section output to the correct Prisma column
    switch (sectionId) {
      case 'executive_summary':
      case 'business_score':
        // These produce scores — update score fields
        if (data?.data) {
          const scores = data.data;
          updateData.ideaScore = scores.ideaScore;
          updateData.marketScore = scores.marketScore;
          updateData.riskScore = scores.riskScore;
          updateData.investorScore = scores.investorScore;
          updateData.overallScore = scores.overallScore;
          updateData.verdict = scores.verdict;
        }
        break;

      case 'market_analysis':
        updateData.marketData = data;
        break;

      case 'competitors':
        updateData.competitorData = data;
        break;

      case 'product':
        updateData.productServiceData = data;
        updateData.riskData = data?.risks;
        updateData.gtmData = data?.gtm;
        break;

      case 'financial':
        updateData.financialData = data;
        updateData.fundingData = data?.fundingOptions;
        break;

      case 'formation':
        updateData.businessFormationData = data;
        break;

      case 'compliance':
        updateData.complianceData = data;
        break;

      case 'operations':
        updateData.sopData = data?.sops || data;
        updateData.teamData = data?.teamPlan;
        updateData.technologyData = data?.technologyStack;
        updateData.infrastructureData = data?.infrastructure;
        updateData.supplierData = data?.suppliers;
        updateData.launchChecklistData = data?.launchChecklist;
        break;

      case 'vc_synthesis':
        updateData.pitchData = data?.pitch;
        updateData.investorData = data?.dimensions;
        updateData.monetizationData = { monetization: data?.monetization, fundingRecommendation: data?.fundingRecommendation };
        updateData.investorScore = data?.investorScore;
        break;

      case 'diagrams':
        updateData.diagramData = data;
        break;

      case 'charts':
        updateData.chartData = data;
        break;

      case 'ai_recommendations':
        updateData.aiRecommendations = data?.aiRecommendations || data;
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.report.update({
        where: { id: reportId },
        data: updateData,
      });
    }
  }

  private async incrementProgress(reportId: string): Promise<number> {
    // Atomic increment in Postgres
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { completedSections: { increment: 1 } },
      select: { completedSections: true },
    });
    return updated.completedSections ?? 0;
  }

  private async finalizeReport(reportId: string): Promise<void> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { createdAt: true, failedSectionIds: true },
    });

    const generationTimeMs = report ? Date.now() - report.createdAt.getTime() : 0;

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.DONE,
        generationTimeMs,
      },
    });

    // Cache the full report for fast dashboard loading
    const fullReport = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { idea: true },
    });
    if (fullReport) {
      await this.redis.set(CacheKeys.report(reportId), fullReport, CacheTTL.REPORT);
    }

    this.gateway.emitReportFullyComplete(reportId);
    this.logger.log(`🏁 Report ${reportId} fully complete in ${(generationTimeMs / 1000).toFixed(1)}s`);
  }

  // ─── BullMQ Lifecycle Events ────────────────────────────────────

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`✔️ Section job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`💀 Section job ${job.id} failed: ${err.message}`);
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`⚠️ Section job ${jobId} stalled`);
  }
}
