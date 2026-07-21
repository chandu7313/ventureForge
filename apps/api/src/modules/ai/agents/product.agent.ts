import { Injectable, Inject, Logger } from '@nestjs/common';
import { z } from 'zod';
import { ProductAgentInput, ProductAgentOutput } from '../ai.types';
import { AiProvider } from '../providers/ai-provider.interface';
import { buildProductPrompt } from '../prompts/product.prompt';
import { GEMINI_PRO } from '../ai.module';

const ProductOutputSchema = z.object({
  mvp: z.array(z.object({
    phase: z.number(),
    title: z.string(),
    duration: z.string(),
    tasks: z.array(z.string()),
    milestone: z.string(),
  })).min(3),
  gtm: z.array(z.object({
    channel: z.string(),
    strategy: z.string(),
    expectedCAC: z.string(),
  })).min(3),
  risks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    severity: z.enum(['High', 'Medium', 'Low']),
    mitigation: z.string(),
  })).min(3),
  recommendedStack: z.array(z.string()),
  successPrediction: z.object({
    survivalProbability: z.number(),
    fundingProbability: z.number(),
    threeYearGrowthPotential: z.string(),
    estimatedValuation: z.string(),
  }).optional().default({
    survivalProbability: 0,
    fundingProbability: 0,
    threeYearGrowthPotential: 'N/A',
    estimatedValuation: 'N/A',
  }),
  pricingStrategy: z.object({
    model: z.string(),
    tiers: z.array(z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      target: z.string(),
    })),
    rationale: z.string(),
    competitiveBenchmark: z.string(),
  }).optional(),
  productsAndServices: z.array(z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    revenueModel: z.string(),
    targetSegment: z.string(),
  })).optional(),
  marketingStrategy: z.object({
    positioning: z.string(),
    channels: z.array(z.object({
      name: z.string(),
      strategy: z.string(),
      budget: z.string(),
      expectedROI: z.string(),
    })),
    contentPlan: z.array(z.string()),
    brandVoice: z.string(),
    kpis: z.array(z.string()),
  }).optional(),
});

/**
 * ProductAgent — Product Strategy & GTM powered by Gemini.
 *
 * Generates MVP roadmap, go-to-market strategy, risk assessment,
 * pricing strategy, product catalog, and marketing strategy.
 */
@Injectable()
export class ProductAgent {
  private readonly logger = new Logger(ProductAgent.name);

  constructor(@Inject(GEMINI_PRO) private readonly gemini: AiProvider) {}

  async run(input: ProductAgentInput): Promise<ProductAgentOutput> {
    this.logger.log(`[ProductAgent] Building product strategy for stage: ${input.stage}`);

    const prompt = buildProductPrompt(input);

    const response = await this.gemini.generateStructuredJson(prompt, ProductOutputSchema, {
      maxTokens: 8192,
      temperature: 0.7,
      reportId: input.reportId,
      serviceName: 'Product Strategy',
    });

    this.logger.log(
      `[ProductAgent] SUCCESS. ${response.data.mvp.length} MVP phases, ${response.data.risks.length} risks. Duration: ${response.durationMs}ms`,
    );

    return response.data as ProductAgentOutput;
  }
}
