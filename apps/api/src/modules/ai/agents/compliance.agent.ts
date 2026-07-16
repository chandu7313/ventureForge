import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { ComplianceAgentInput, ComplianceAgentOutput } from '../ai.types';
import { GeminiProvider } from '../providers/gemini.provider';
import { TavilyProvider } from '../providers/tavily.provider';
import { getCompliancePrompt } from '../prompts/compliance.prompt';

const RegistrationItemSchema = z.object({
  name: z.string(),
  authority: z.string(),
  estimatedCost: z.string(),
  processingTime: z.string(),
  documentsRequired: z.array(z.string()),
  portalLink: z.string().optional(),
  isMandatory: z.boolean(),
  priority: z.number(), // 1 = highest
});

const ComplianceOutputSchema = z.object({
  registrations: z.array(RegistrationItemSchema).min(1),
  taxStructure: z.object({
    incomeTax: z.object({ type: z.string(), rate: z.string(), slabs: z.array(z.string()).optional() }),
    gst: z.object({ required: z.boolean(), threshold: z.string(), applicableRate: z.string(), hsnSacCode: z.string().optional() }),
    tds: z.object({ applicable: z.boolean(), sections: z.array(z.string()) }),
    advanceTaxCalendar: z.array(z.object({ quarter: z.string(), dueDate: z.string() })),
    filingDeadlines: z.array(z.object({ filing: z.string(), dueDate: z.string(), penalty: z.string() })),
  }),
  accountingSetup: z.object({
    recommendedSoftware: z.array(z.object({
      name: z.string(),
      pricing: z.string(),
      features: z.array(z.string()),
    })),
    bookkeepingGuide: z.string(),
  }),
});

/**
 * ComplianceAgent — Real-time tax & compliance checklist powered by Gemini + Tavily.
 */
@Injectable()
export class ComplianceAgent {
  private readonly logger = new Logger(ComplianceAgent.name);

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly tavily: TavilyProvider,
  ) {}

  async run(input: ComplianceAgentInput): Promise<ComplianceAgentOutput> {
    this.logger.log(`[ComplianceAgent] Generating compliance checklist for: ${input.industry}`);

    const [taxData, regData] = await Promise.all([
      this.tavily.searchTaxInfo(input.country || input.geography, input.businessType || 'business'),
      this.tavily.searchRegulations(input.country || input.geography, input.businessType || 'business', input.industry),
    ]);

    const searchContext = [
      this.tavily.formatForPrompt(taxData, 'Current Tax Regulations'),
      this.tavily.formatForPrompt(regData, 'Current Registration Requirements'),
    ].join('\n');

    const prompt = getCompliancePrompt(input, searchContext);

    const response = await this.gemini.generateStructuredJson(prompt, ComplianceOutputSchema, {
      maxTokens: 6144,
      temperature: 0.4, // Lower temp for factual accuracy
    });

    this.logger.log(`[ComplianceAgent] Generated ${response.data.registrations.length} registrations. Duration: ${response.durationMs}ms`);
    return response.data as ComplianceAgentOutput;
  }
}
