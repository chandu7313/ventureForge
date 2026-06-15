import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { CompetitorAgentInput, CompetitorAgentOutput } from '../types';
import { buildCompetitorPrompt } from '../prompts/competitor.prompt';

@Injectable()
export class CompetitorAgent {
  private readonly logger = new Logger(CompetitorAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-sonnet-4-5';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: CompetitorAgentInput): Promise<CompetitorAgentOutput> {
    const prompt = buildCompetitorPrompt(input);
    this.logger.log(`[CompetitorAgent] Scouting competitors for: ${input.industry}`);

    const response = await this.client.messages.create({
      model: this.MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text;

    this.logger.log(
      `[CompetitorAgent] Done. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
    );

    return JSON.parse(rawText) as CompetitorAgentOutput;
  }
}
