import { Injectable, Inject, Logger } from '@nestjs/common';
import { z } from 'zod';
import { CompetitorAgentInput, CompetitorAgentOutput } from '../ai.types';
import { AiProvider } from '../providers/ai-provider.interface';
import { TavilyProvider } from '../providers/tavily.provider';
import { buildCompetitorPrompt } from '../prompts/competitor.prompt';
import { GEMINI_PRO } from '../ai.module';

const CompetitorSchema = z.object({
  name: z.string(),
  type: z.enum(['Direct', 'Indirect']),
  hq: z.string(),
  fundingStage: z.string(),
  totalFunding: z.string(),
  weakness: z.string(),
  pricing: z.string(),
  features: z.array(z.string()).optional(),
});

const SwotSchema = z.object({
  name: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  opportunities: z.array(z.string()),
  threats: z.array(z.string()),
});

const CompetitorOutputSchema = z.object({
  competitors: z.array(CompetitorSchema).min(3),
  swotAnalysis: z.array(SwotSchema).optional().default([]),
  positioningMap: z.object({
    xAxis: z.string(),
    yAxis: z.string(),
    competitors: z.array(z.object({ name: z.string(), x: z.number(), y: z.number() })),
  }).optional().default({ xAxis: 'Price', yAxis: 'Quality', competitors: [] }),
  whitespaceOpportunities: z.array(z.string()).optional().default([]),
});

/**
 * CompetitorAgent — Competitive Intelligence powered by Gemini + Tavily.
 *
 * Uses Tavily to discover REAL competitors (names, funding, features).
 * Never lets the LLM invent competitor names — all are search-verified.
 * Uses Gemini to synthesize SWOT analysis and positioning insights.
 */
@Injectable()
export class CompetitorAgent {
  private readonly logger = new Logger(CompetitorAgent.name);

  constructor(
    @Inject(GEMINI_PRO) private readonly gemini: AiProvider,
    private readonly tavily: TavilyProvider,
  ) {}

  async run(input: CompetitorAgentInput): Promise<CompetitorAgentOutput> {
    this.logger.log(`[CompetitorAgent] Scouting competitors for: ${input.industry}`);

    // Step 1: Tavily search for real competitors
    const competitorResults = await this.tavily.searchCompetitors(
      input.industry,
      input.country || input.geography,
    );

    // Step 2: Build prompt with real competitor data
    const searchContext = this.tavily.formatForPrompt(
      competitorResults,
      'Real Competitor Intelligence (from live search)',
    );

    const prompt = buildCompetitorPrompt(input, searchContext);

    // Step 3: Gemini structured generation
    const response = await this.gemini.generateStructuredJson(prompt, CompetitorOutputSchema, {
      maxTokens: 6144,
      temperature: 0.5,
    });

    this.logger.log(
      `[CompetitorAgent] SUCCESS. Found ${response.data.competitors.length} competitors. Duration: ${response.durationMs}ms`,
    );

    return response.data as CompetitorAgentOutput;
  }
}
