import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { ProductAgentInput, ProductAgentOutput } from '../types';
import { buildProductPrompt } from '../prompts/product.prompt';

const MvpPhaseSchema = z.object({
  phase: z.number(),
  title: z.string(),
  duration: z.string(),
  tasks: z.array(z.string()),
  milestone: z.string(),
});

const GtmChannelSchema = z.object({
  channel: z.string(),
  strategy: z.string(),
  expectedCAC: z.string(),
});

const RiskItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  severity: z.enum(['High', 'Medium', 'Low']),
  mitigation: z.string(),
});

const ProductOutputSchema = z.object({
  mvp: z.array(MvpPhaseSchema).length(4),
  gtm: z.array(GtmChannelSchema).length(5),
  risks: z.array(RiskItemSchema).length(6),
  recommendedStack: z.array(z.string()),
});

@Injectable()
export class ProductAgent {
  private readonly logger = new Logger(ProductAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-3-5-sonnet-20241022';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: ProductAgentInput): Promise<ProductAgentOutput> {
    let prompt = buildProductPrompt(input);
    this.logger.log(`[ProductAgent] Building MVP plan for stage: ${input.stage}`);

    const maxAttempts = 3;
    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.MODEL,
          max_tokens: 3072,
          messages: [{ role: 'user', content: prompt }],
        });

        const rawText = (response.content[0] as Anthropic.TextBlock).text;
        
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawText;

        const parsed = JSON.parse(jsonStr);
        const validated = ProductOutputSchema.parse(parsed);

        const duration = Date.now() - startTime;
        this.logger.log(
          `[ProductAgent] SUCCESS (Attempt ${attempt}/${maxAttempts}). Duration: ${duration}ms. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
        );

        return validated as ProductAgentOutput;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`[ProductAgent] Validation/Parse failed on attempt ${attempt}. Error: ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          prompt += '\n\nIMPORTANT: You previously returned invalid JSON or it did not match the required schema. You MUST return ONLY the raw JSON object, no other text, and strictly follow the requested structure.';
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }
      }
    }

    this.logger.error(`[ProductAgent] ALL ATTEMPTS FAILED for stage: ${input.stage}`);
    throw new Error(`ProductAgent failed to generate valid JSON after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }
}
