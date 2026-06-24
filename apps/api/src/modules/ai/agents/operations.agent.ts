import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { OperationsAgentInput, OperationsAgentOutput } from '../ai.types';
import { getOperationsPrompt } from '../prompts/operations.prompt';

/**
 * OperationsAgent generates operational intelligence including:
 * infrastructure requirements, team/HR plans, technology stack,
 * supplier intelligence, SOPs, and launch checklists.
 */
@Injectable()
export class OperationsAgent {
  private readonly logger = new Logger(OperationsAgent.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') });
    this.model = this.config.get('ANTHROPIC_MODEL') || 'claude-sonnet-4-5';
  }

  async run(input: OperationsAgentInput): Promise<OperationsAgentOutput> {
    this.logger.log('[OperationsAgent] Generating operations, team, SOPs & launch plan...');

    const prompt = getOperationsPrompt(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 10000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const parsed: OperationsAgentOutput = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || '{}');

    this.logger.log(`[OperationsAgent] Generated ${parsed.sops?.length || 0} SOPs, ${parsed.launchChecklist?.length || 0} checklist items`);
    return parsed;
  }
}
