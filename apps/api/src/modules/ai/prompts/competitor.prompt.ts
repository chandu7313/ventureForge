import { CompetitorAgentInput } from '../ai.types';
import { getCountryContext, getCountryCurrency, getLanguageInstruction } from './country-context';

export function buildCompetitorPrompt(input: CompetitorAgentInput, searchContext: string = ''): string {
  const { currency, symbol } = getCountryCurrency(input.country || input.geography);
  const countryContext = getCountryContext({ country: input.country || input.geography, language: input.language });
  const langInstruction = getLanguageInstruction(input.language);

  return `You are a Competitive Intelligence Specialist at a tier-1 strategy firm.
Your job is to map out the competitive landscape for a new startup idea based on REAL market data.

STARTUP IDEA:
${input.ideaDescription}

INDUSTRY: ${input.industry}
PRIMARY GEOGRAPHY: ${input.geography}
COUNTRY: ${input.country || input.geography}

${searchContext}

${countryContext}

INSTRUCTIONS:
1. Synthesize the provided Real Competitor Intelligence. NEVER invent or hallucinate competitors. Only use real companies operating in this space.
2. For each competitor, provide accurate funding data (in ${currency} or USD if global), headquarters, strengths, and weaknesses.
3. Conduct a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the top 3 competitors.
4. Generate data for a Positioning Map (e.g., Price vs Quality). Assign reasonable X and Y coordinates (from 0 to 100) for each competitor.
5. Identify clear "Whitespace Opportunities" — gaps in the market that current competitors are missing.
6. Return the response strictly as a JSON object matching the requested schema. No markdown fences.

${langInstruction}
`;
}
