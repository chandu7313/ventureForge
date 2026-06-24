import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { BusinessFormationAgentInput, BusinessFormationAgentOutput } from '../ai.types';
import { getBusinessFormationPrompt } from '../prompts/business-formation.prompt';

/**
 * BusinessFormationAgent recommends optimal legal structures,
 * banking setup, and branding for the startup based on the
 * founder's goals, team size, industry, and Indian state.
 */
@Injectable()
export class BusinessFormationAgent {
  private readonly logger = new Logger(BusinessFormationAgent.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') });
    this.model = this.config.get('ANTHROPIC_MODEL') || 'claude-sonnet-4-5';
  }

  async run(input: BusinessFormationAgentInput): Promise<BusinessFormationAgentOutput> {
    this.logger.log('[BusinessFormationAgent] Generating business formation recommendations...');

    const prompt = getBusinessFormationPrompt(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const parsed: BusinessFormationAgentOutput = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || '{}');

    this.logger.log(`[BusinessFormationAgent] Recommended structure: ${parsed.recommendedStructure}`);
    return parsed;
  }
}
