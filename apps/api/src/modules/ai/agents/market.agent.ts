import { Injectable, Inject, Logger } from '@nestjs/common';
import { z } from 'zod';
import { MarketAgentInput, MarketAgentOutput } from '../ai.types';
import { AiProvider } from '../providers/ai-provider.interface';
import { TavilyProvider } from '../providers/tavily.provider';
import { buildMarketPrompt } from '../prompts/market.prompt';
import { GEMINI_PRO } from '../ai.module';

const MarketOutputSchema = z.object({
  tam: z.object({ value: z.number(), currency: z.string(), cagr: z.number() }),
  sam: z.object({ value: z.number(), currency: z.string() }),
  som: z.object({ value: z.number(), currency: z.string() }),
  analysis: z.string(),
  icp: z.string(),
  tailwinds: z.array(z.string()).min(2),
  governmentSchemes: z.array(z.string()),
  marketTrends: z.array(z.string()),
  pestleAnalysis: z.object({
    political: z.array(z.string()),
    economic: z.array(z.string()),
    social: z.array(z.string()),
    technological: z.array(z.string()),
    legal: z.array(z.string()),
    environmental: z.array(z.string()),
  }).optional(),
  customerPersonas: z.array(z.object({
    name: z.string(),
    age: z.string(),
    occupation: z.string(),
    income: z.string(),
    goals: z.array(z.string()),
    painPoints: z.array(z.string()),
    buyingBehavior: z.string(),
    channels: z.array(z.string()),
  })).optional(),
});

/**
 * MarketAgent — Market Analyst powered by Gemini + Tavily.
 *
 * Uses Tavily to fetch real-time market data, statistics, and government schemes.
 * Uses Gemini to synthesize the data into a structured market analysis with
 * TAM/SAM/SOM calculations, PESTLE analysis, and customer personas.
 */
@Injectable()
export class MarketAgent {
  private readonly logger = new Logger(MarketAgent.name);

  constructor(
    @Inject(GEMINI_PRO) private readonly gemini: AiProvider,
    private readonly tavily: TavilyProvider,
  ) {}

  async run(input: MarketAgentInput): Promise<MarketAgentOutput> {
    this.logger.log(`[MarketAgent] Running analysis for: ${input.industry} in ${input.geography}`);

    // Step 1: Tavily search for real-time market data
    const [marketData, trends, schemes] = await Promise.all([
      this.tavily.searchMarketData(input.industry, input.geography),
      this.tavily.searchTrends(input.industry),
      this.tavily.searchGovernmentSchemes(input.country || input.geography, input.industry),
    ]);

    // Step 2: Build Gemini prompt with Tavily search context
    const searchContext = [
      this.tavily.formatForPrompt(marketData, 'Market Data & Statistics'),
      this.tavily.formatForPrompt(trends, 'Industry Trends'),
      this.tavily.formatForPrompt(schemes, 'Government Schemes & Programs'),
    ].join('\n');

    const prompt = buildMarketPrompt(input, searchContext);

    // Step 3: Gemini structured generation
    const response = await this.gemini.generateStructuredJson(prompt, MarketOutputSchema, {
      maxTokens: 8192,
      temperature: 0.6,
      reportId: input.reportId,
      serviceName: 'Market Analysis',
    });

    this.logger.log(
      `[MarketAgent] SUCCESS. Duration: ${response.durationMs}ms. Tokens: ${response.usage.totalTokens}`,
    );

    return response.data as MarketAgentOutput;
  }
}
