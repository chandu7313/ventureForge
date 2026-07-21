import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, FlowProducer } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import {
  GENERATABLE_SECTIONS,
  SectionDefinition,
  TOTAL_GENERATABLE,
} from '../ai/section-registry';
import { SectionJobData } from './section.worker';

export interface GenerateReportJobData {
  reportId: string;
  ideaId: string;
  ideaDescription: string;
  industry: string;
  geography: string;
  stage: string;
  teamSize: number;
  budget: string;
  language: string;
  state?: string;
  businessType?: string;
  country?: string;
  ideaHash?: string;
}

/** Exponential backoff delays in ms: 30s, 2m, 10m */
const BACKOFF_DELAYS = [30_000, 120_000, 600_000];

@Injectable()
export class ReportProducer {
  private readonly logger = new Logger(ReportProducer.name);
  private readonly flowProducer: FlowProducer;

  constructor(
    @InjectQueue('report-generation') private readonly queue: Queue,
    @InjectQueue('report-generation-dlq') private readonly dlq: Queue,
    @InjectQueue('section-generation') private readonly sectionQueue: Queue,
    private readonly config: ConfigService,
  ) {
    // FlowProducer connects to the same Redis as BullMQ
    const redisHost = this.config.get('REDIS_HOST') || 'localhost';
    const redisPort = parseInt(this.config.get('REDIS_PORT') || '6379', 10);
    this.flowProducer = new FlowProducer({
      connection: { host: redisHost, port: redisPort },
    });
  }

  /**
   * Enqueues all generatable sections as individual BullMQ jobs.
   * 
   * Sections are ordered by priority (1 = first).
   * Sections with dependencies are delayed until their parents complete
   * (handled by checking Redis cache in the worker).
   * 
   * Returns the number of jobs enqueued.
   */
  async addSectionJobs(data: GenerateReportJobData): Promise<number> {
    const sortedSections = [...GENERATABLE_SECTIONS].sort(
      (a, b) => a.priority - b.priority,
    );

    const input = {
      reportId: data.reportId,
      ideaDescription: data.ideaDescription,
      industry: data.industry,
      geography: data.geography,
      stage: data.stage,
      teamSize: data.teamSize,
      budget: data.budget,
      language: data.language,
      state: data.state,
      businessType: data.businessType,
      country: data.country,
    };

    let enqueued = 0;

    for (const section of sortedSections) {
      const jobData: SectionJobData = {
        sectionId: section.sectionId,
        reportId: data.reportId,
        input,
      };

      // Sections with dependencies get a delay to let parents finish first
      const delay = section.dependsOn.length > 0
        ? this.estimateDelay(section)
        : 0;

      await this.sectionQueue.add(
        `section:${section.sectionId}`,
        jobData,
        {
          priority: section.priority,
          delay,
          attempts: 2,
          backoff: { type: 'exponential', delay: 15_000 },
          removeOnComplete: { count: 500, age: 60 * 60 * 24 * 3 }, // keep 3 days
          removeOnFail: false,
          jobId: `${data.reportId}:${section.sectionId}`, // Idempotent: prevents double-enqueue
        },
      );

      enqueued++;
    }

    this.logger.log(
      `📥 Enqueued ${enqueued} section jobs for report ${data.reportId}`,
    );
    return enqueued;
  }

  /**
   * Estimate a delay for dependent sections based on their parents' estimated generation times.
   * This is a heuristic — the worker also checks Redis for parent data availability.
   */
  private estimateDelay(section: SectionDefinition): number {
    // Give parent sections time to complete
    // Use a base delay of 20s for each dependency level
    const maxParentPriority = Math.max(
      ...section.dependsOn.map(depId => {
        const dep = GENERATABLE_SECTIONS.find(s => s.sectionId === depId);
        return dep?.priority ?? 5;
      }),
    );
    return maxParentPriority * 8_000; // 8s per priority level
  }

  /**
   * Cancel all pending section jobs for a report.
   * Running jobs will check the cancellation flag in Postgres.
   */
  async cancelSectionJobs(reportId: string): Promise<number> {
    let cancelled = 0;

    for (const section of GENERATABLE_SECTIONS) {
      const jobId = `${reportId}:${section.sectionId}`;
      try {
        const job = await this.sectionQueue.getJob(jobId);
        if (job) {
          const state = await job.getState();
          if (state === 'waiting' || state === 'delayed') {
            await job.remove();
            cancelled++;
          }
        }
      } catch (err) {
        // Job may have already been processed or removed
      }
    }

    this.logger.log(`🛑 Cancelled ${cancelled} pending section jobs for report ${reportId}`);
    return cancelled;
  }

  /**
   * Retry a single failed section.
   */
  async retrySectionJob(data: GenerateReportJobData, sectionId: string): Promise<string> {
    const section = GENERATABLE_SECTIONS.find(s => s.sectionId === sectionId);
    if (!section) throw new Error(`Unknown section: ${sectionId}`);

    const jobData: SectionJobData = {
      sectionId,
      reportId: data.reportId,
      input: {
        reportId: data.reportId,
        ideaDescription: data.ideaDescription,
        industry: data.industry,
        geography: data.geography,
        stage: data.stage,
        teamSize: data.teamSize,
        budget: data.budget,
        language: data.language,
        state: data.state,
        businessType: data.businessType,
        country: data.country,
      },
    };

    const job = await this.sectionQueue.add(
      `section:${sectionId}:retry`,
      jobData,
      {
        priority: 1, // High priority for retries
        attempts: 2,
        backoff: { type: 'exponential', delay: 10_000 },
        removeOnComplete: { count: 100 },
        removeOnFail: false,
      },
    );

    this.logger.log(`🔄 Retry job ${job.id} queued for section "${sectionId}" of report ${data.reportId}`);
    return job.id as string;
  }

  // ─── Legacy Methods (backward compatibility) ────────────────────

  /** @deprecated Use addSectionJobs() for progressive generation */
  async addJob(data: GenerateReportJobData): Promise<string> {
    const priority = 5;

    const job = await this.queue.add('generate-report', data, {
      priority,
      attempts: 3,
      backoff: { type: 'exponential', delay: BACKOFF_DELAYS[0] },
      removeOnComplete: { count: 200, age: 60 * 60 * 24 * 7 },
      removeOnFail: false,
    });

    this.logger.log(
      `📥 Job ${job.id} queued | report: ${data.reportId} | priority: ${priority}`,
    );
    return job.id as string;
  }

  /** Move a permanently failed job to the Dead Letter Queue for manual review */
  async moveToDlq(jobData: GenerateReportJobData, failReason: string): Promise<void> {
    await this.dlq.add('dead-report', { ...jobData, failReason }, {
      attempts: 1,
      removeOnFail: false,
    });
    this.logger.warn(
      `☠️  Job for report ${jobData.reportId} moved to DLQ. Reason: ${failReason}`,
    );
  }
}
