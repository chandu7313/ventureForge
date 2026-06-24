import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { ComplianceAgentInput, ComplianceAgentOutput } from '../ai.types';
import { getCompliancePrompt } from '../prompts/compliance.prompt';

/**
 * ComplianceAgent generates a complete, state-specific and
 * industry-specific compliance checklist including all required
 * registrations, tax structure, and accounting setup.
 */
@Injectable()
export class ComplianceAgent {
  private readonly logger = new Logger(ComplianceAgent.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({ apiKey: this.config.get('ANTHROPIC_API_KEY') });
    this.model = this.config.get('ANTHROPIC_MODEL') || 'claude-sonnet-4-5';
  }

  async run(input: ComplianceAgentInput): Promise<ComplianceAgentOutput> {
    this.logger.log('[ComplianceAgent] Generating compliance & registration checklist...');

    const prompt = getCompliancePrompt(input);

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const parsed: ComplianceAgentOutput = JSON.parse(jsonMatch?.[1] || jsonMatch?.[0] || '{}');

    this.logger.log(`[ComplianceAgent] Generated ${parsed.registrations?.length || 0} registration items`);
    return parsed;
  }
}
