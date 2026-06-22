import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { CompetitorAgentInput, CompetitorAgentOutput } from '../types';
import { buildCompetitorPrompt } from '../prompts/competitor.prompt';

const CompetitorSchema = z.object({
  name: z.string(),
  type: z.enum(['Direct', 'Indirect']),
  hq: z.string(),
  fundingStage: z.string(),
  totalFunding: z.string(),
  weakness: z.string(),
  pricing: z.string(),
});

const CompetitorOutputSchema = z.object({
  competitors: z.array(CompetitorSchema).length(6),
});

@Injectable()
export class CompetitorAgent {
  private readonly logger = new Logger(CompetitorAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-3-5-sonnet-20241022';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: CompetitorAgentInput): Promise<CompetitorAgentOutput> {
    let prompt = buildCompetitorPrompt(input);
    this.logger.log(`[CompetitorAgent] Scouting competitors for: ${input.industry}`);

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
        
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawText;

        const parsed = JSON.parse(jsonStr);
        const validated = CompetitorOutputSchema.parse(parsed);

        const duration = Date.now() - startTime;
        this.logger.log(
          `[CompetitorAgent] SUCCESS (Attempt ${attempt}/${maxAttempts}). Duration: ${duration}ms. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
        );

        return validated as CompetitorAgentOutput;
      } catch (err) {
        lastError = err as Error;
        this.logger.warn(`[CompetitorAgent] Validation/Parse failed on attempt ${attempt}. Error: ${lastError.message}`);
        
        if (attempt < maxAttempts) {
          prompt += '\n\nIMPORTANT: You previously returned invalid JSON or it did not match the required schema. You MUST return ONLY the raw JSON object, no other text, and strictly follow the requested structure.';
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }
      }
    }

    this.logger.error(`[CompetitorAgent] ALL ATTEMPTS FAILED for: ${input.industry}`);
    throw new Error(`CompetitorAgent failed to generate valid JSON after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
  }
}
