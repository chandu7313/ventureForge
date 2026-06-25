import { VcAgentInput } from '../ai.types';
import { getCountryContext, getCountryCurrency, getLanguageInstruction } from './country-context';

export function buildVcPrompt(input: VcAgentInput): string {
  const { currency, symbol } = getCountryCurrency(input.country || input.geography);
  const countryContext = getCountryContext({ country: input.country || input.geography, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  // Serialize previous agent outputs so the VC agent can synthesize them
  const market = JSON.stringify(input.marketData);
  const comp = JSON.stringify(input.competitorData);
  const prod = JSON.stringify(input.productData);

  return `You are a Tier-1 Venture Capital Partner (e.g., Sequoia, a16z, Peak XV) making an investment decision.
You have been presented with comprehensive diligence reports on Market, Competitors, and Product.

STARTUP IDEA:
${input.ideaDescription}

PRIMARY GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}

${countryContext}

DILIGENCE DATA:
--- MARKET DATA ---
${market}
--- COMPETITOR DATA ---
${comp}
--- PRODUCT DATA ---
${prod}

INSTRUCTIONS:
1. Synthesize the provided diligence data into an Executive Summary.
2. Score the startup on a scale of 0-100 (investorScore) based on Market Size, Competitive Moat, and Execution Viability.
3. Provide a breakdown of the score across 5-6 dimensions (e.g., Team/Execution, Market Size, Defensibility).
4. Create an Investor Pitch Deck outline (title, key points, data points).
5. Generate a final Verdict: 'Fund', 'Pass', or 'Watch'.
6. Match the startup with relevant VC funds or Angel Investor profiles active in this geography.
7. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}
