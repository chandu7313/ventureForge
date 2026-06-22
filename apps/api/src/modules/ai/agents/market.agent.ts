import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { MarketAgentInput, MarketAgentOutput } from '../types';
import { buildMarketPrompt } from '../prompts/market.prompt';

const MarketOutputSchema = z.object({
  tam: z.object({
    inrCr: z.number(),
    usdM: z.number(),
    cagr: z.number(),
  }),
  sam: z.object({
    inrCr: z.number(),
    usdM: z.number(),
  }),
  som: z.object({
    inrCr: z.number(),
    usdM: z.number(),
  }),
  analysis: z.string(),
  icp: z.string(),
  tailwinds: z.array(z.string()).length(3),
  governmentSchemes: z.array(z.string()),
});

@Injectable()
export class MarketAgent {
  private readonly logger = new Logger(MarketAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-3-5-sonnet-20241022'; // Updated to valid model name

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: MarketAgentInput): Promise<MarketAgentOutput> {
    let prompt = buildMarketPrompt(input);
    this.logger.log(`[MarketAgent] Running analysis for: ${input.industry}`);

    const maxAttempts = 3;
    let lastError: Error | null = null;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.MODEL,
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        });

        const rawText = (response.content[0] as Anthropic.TextBlock).text;
        
        // Find JSON block if it's wrapped in markdown
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawText;

        const parsed = JSON.parse(jsonStr);
        const validated = MarketOutputSchema.parse(parsed);

        const duration = Date.now() - startTime;
        this.logger.log(
          `[MarketAgent] SUCCESS (Attempt ${attempt}/${maxAttempts}). Duration: ${duration}ms. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
        );

        return validated as MarketAgentOutput;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`[MarketAgent] Validation/Parse failed on attempt ${attempt}. Error: ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          prompt += '\n\nIMPORTANT: You previously returned invalid JSON or it did not match the required schema. You MUST return ONLY the raw JSON object, no other text, and strictly follow the requested structure.';
          // Small exponential backoff
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }
      }
    }

    this.logger.error(`[MarketAgent] ALL ATTEMPTS FAILED for: ${input.industry}`);
    throw new Error(`MarketAgent failed to generate valid JSON after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }
}
