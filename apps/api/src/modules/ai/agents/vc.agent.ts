import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { VcAgentInput, VcAgentOutput } from '../types';
import { buildVcPrompt } from '../prompts/vc.prompt';

@Injectable()
export class VcAgent {
  private readonly logger = new Logger(VcAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-sonnet-4-5';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: VcAgentInput): Promise<VcAgentOutput> {
    const prompt = buildVcPrompt(input);
    this.logger.log(`[VcAgent] Evaluating investment potential...`);

    const response = await this.client.messages.create({
      model: this.MODEL,
      max_tokens: 3072,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text;

    this.logger.log(
      `[VcAgent] Done. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
    );

    return JSON.parse(rawText) as VcAgentOutput;
  }
}
