import { ComplianceAgentInput } from '../ai.types';
import { getCountryContext, getCountryCurrency, getLanguageInstruction } from './country-context';

export function getCompliancePrompt(input: ComplianceAgentInput, searchContext: string = ''): string {
  const { currency, symbol } = getCountryCurrency(input.country || input.geography);
  const countryContext = getCountryContext({ country: input.country || input.geography, state: input.state, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  return `You are an expert Chartered Accountant (CA) and Corporate Secretary.
Your task is to generate a comprehensive, accurate compliance and tax checklist based on real regulations.

STARTUP IDEA:
${input.ideaDescription}

INDUSTRY: ${input.industry}
BUSINESS TYPE: ${input.businessType || 'business'}
STRUCTURE: ${input.businessStructure || 'Not decided'}
GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}
STATE/REGION: ${input.state || 'N/A'}

${searchContext}

${countryContext}

INSTRUCTIONS:
1. Extract ALL mandatory and highly recommended registrations from the provided search context. Do not hallucinate laws.
2. Provide accurate Tax Structure details (Income Tax, Sales Tax/VAT/GST, Payroll Tax) applicable to this geography.
3. Provide filing deadlines and compliance calendar based on local laws.
4. Recommend local accounting software and bookkeeping practices.
5. Provide monetary values in ${currency} (${symbol}).
6. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}
