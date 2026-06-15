import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { ProductAgentInput, ProductAgentOutput } from '../types';
import { buildProductPrompt } from '../prompts/product.prompt';

@Injectable()
export class ProductAgent {
  private readonly logger = new Logger(ProductAgent.name);
  private readonly client: Anthropic;
  private readonly MODEL = 'claude-sonnet-4-5';

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async run(input: ProductAgentInput): Promise<ProductAgentOutput> {
    const prompt = buildProductPrompt(input);
    this.logger.log(`[ProductAgent] Building MVP plan for stage: ${input.stage}`);

    const response = await this.client.messages.create({
      model: this.MODEL,
      max_tokens: 3072,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text;

    this.logger.log(
      `[ProductAgent] Done. Input tokens: ${response.usage.input_tokens}, Output tokens: ${response.usage.output_tokens}`,
    );

    return JSON.parse(rawText) as ProductAgentOutput;
  }
}
