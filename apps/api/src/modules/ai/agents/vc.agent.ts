import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { VcAgentInput, VcAgentOutput } from '../types';
import { buildVcPrompt } from '../prompts/vc.prompt';

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
});

@Injectable()
export class VcAgent {
  private readonly logger = new Logger(VcAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-3-5-sonnet-20241022';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: VcAgentInput): Promise<VcAgentOutput> {
    let prompt = buildVcPrompt(input);
    this.logger.log(`[VcAgent] Evaluating investment potential...`);

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
        const validated = VcOutputSchema.parse(parsed);

        const duration = Date.now() - startTime;
        this.logger.log(
          `[VcAgent] SUCCESS (Attempt ${attempt}/${maxAttempts}). Duration: ${duration}ms. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
        );

        return validated as VcAgentOutput;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`[VcAgent] Validation/Parse failed on attempt ${attempt}. Error: ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          prompt += '\n\nIMPORTANT: You previously returned invalid JSON or it did not match the required schema. You MUST return ONLY the raw JSON object, no other text, and strictly follow the requested structure.';
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }
      }
    }

    this.logger.error(`[VcAgent] ALL ATTEMPTS FAILED for VC evaluation.`);
    throw new Error(`VcAgent failed to generate valid JSON after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }
}
