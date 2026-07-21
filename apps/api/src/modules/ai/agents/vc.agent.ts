import { Injectable, Inject, Logger } from '@nestjs/common';
import { z } from 'zod';
import { VcAgentInput, VcAgentOutput } from '../ai.types';
import { AiProvider } from '../providers/ai-provider.interface';
import { buildVcPrompt } from '../prompts/vc.prompt';
import { GEMINI_PRO } from '../ai.module';

const InvestorDimensionSchema = z.object({
  name: z.string(),
  score: z.number(),
  reasoning: z.string(),
});

const PitchSlideSchema = z.object({
  title: z.string(),
  content: z.string(),
  dataPoints: z.array(z.string()),
});

const VcOutputSchema = z.object({
  investorScore: z.number(),
  dimensions: z.array(InvestorDimensionSchema),
  pitch: z.array(PitchSlideSchema),
  verdict: z.enum(['Fund', 'Pass', 'Watch']),
  monetization: z.string(),
  fundingRecommendation: z.string(),
  investorMatch: z.object({
    vcFunds: z.array(z.object({
      name: z.string(),
      sector: z.string(),
      stage: z.string(),
      ticketSize: z.string(),
    })),
    angelInvestors: z.array(z.object({
      name: z.string(),
      sector: z.string(),
      portfolio: z.string(),
    })),
    fundingProbabilityScore: z.number(),
  }).optional().default({ vcFunds: [], angelInvestors: [], fundingProbabilityScore: 0 }),
  executiveSummary: z.object({
    overview: z.string(),
    opportunity: z.string(),
    solution: z.string(),
    marketSize: z.string(),
    competitiveAdvantage: z.string(),
    financialHighlights: z.string(),
    askAmount: z.string().optional(),
  }).optional(),
});

/**
 * VcAgent — VC / Synthesis Agent powered by Gemini.
 *
 * Takes all Layer 1 outputs and synthesizes them into an investor
 * score, executive summary, pitch deck, and verdict.
 */
@Injectable()
export class VcAgent {
  private readonly logger = new Logger(VcAgent.name);

  constructor(@Inject(GEMINI_PRO) private readonly gemini: AiProvider) {}

  async run(input: VcAgentInput): Promise<VcAgentOutput> {
    this.logger.log(`[VcAgent] Evaluating investment potential...`);

    const prompt = buildVcPrompt(input);

    const response = await this.gemini.generateStructuredJson(prompt, VcOutputSchema, {
      maxTokens: 8192,
      temperature: 0.4, // Lower temperature for more analytical synthesis
    });

    this.logger.log(
      `[VcAgent] SUCCESS. Verdict: ${response.data.verdict}. Score: ${response.data.investorScore}. Duration: ${response.durationMs}ms`,
    );

    return response.data as VcAgentOutput;
  }
}
