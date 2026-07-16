import { ProductAgentInput } from '../ai.types';
import { getCountryContext, getLanguageInstruction } from './country-context';

export function buildProductPrompt(input: ProductAgentInput): string {
  const countryContext = getCountryContext({ country: input.country || input.geography, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  return `You are an elite CPO (Chief Product Officer) and Growth Head.
Your job is to define the product strategy, MVP roadmap, and marketing strategy for a new startup.

STARTUP IDEA:
${input.ideaDescription}

STAGE: ${input.stage}
TEAM SIZE: ${input.teamSize}
BUDGET: ${input.budget}
PRIMARY GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}

${countryContext}

INSTRUCTIONS:
1. Break down the MVP (Minimum Viable Product) into exactly 4 distinct phases (e.g., Validation, Alpha, Beta, Launch). Include timeframes and key tasks.
2. Define a Pricing Strategy with rationale and tiers based on the target audience.
3. Propose a clear Marketing Strategy (positioning, brand voice, content plan, KPIs).
4. List 5 key Go-to-Market (GTM) channels optimized for this geography and budget.
5. Identify 6 critical risks across categories (market, financial, regulatory, technical, operational) and provide concrete mitigations.
6. Recommend a modern, practical technology stack (if it's a tech product) or operational stack (if non-tech).
7. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}
