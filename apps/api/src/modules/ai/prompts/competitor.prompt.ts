import { CompetitorAgentInput } from '../types';

export function buildCompetitorPrompt(input: CompetitorAgentInput): string {
  return `You are a competitive intelligence analyst with 8 years specialising in Indian and global startup landscapes. You have researched over 500 startups for primary investors at Nexus, Kalaari, and Elevation Capital. You track Crunchbase, Tracxn, Inc42, and PitchBook daily. You understand competitive dynamics in both VC-funded and bootstrapped ecosystems.

Your task is to identify the top competitors for the startup idea described below and analyze each with the precision of a pre-deal due diligence report.

STARTUP IDEA:
${input.ideaDescription}

INDUSTRY: ${input.industry}

INSTRUCTIONS:
- Identify EXACTLY 6 competitors: 3 Direct (same solution to same problem) and 3 Indirect (alternative solution to same problem).
- Prioritise Indian competitors first. If fewer than 3 Indian players exist in a category, include global ones.
- The "weakness" field must be a specific, actionable competitive gap — not generic (e.g., "no regional language support for Tier 2/3 India" is good; "poor UX" is not).
- The "pricing" field must state the actual pricing tier or model (e.g., "₹2,999/month per seat, no free tier").
- "fundingStage" must be one of: Bootstrapped, Pre-Seed, Seed, Series A, Series B, Series C+, Public.
- Do NOT include any preamble, markdown, or commentary outside of the JSON.

OUTPUT FORMAT — return ONLY this JSON object, no other text:
{
  "competitors": [
    {
      "name": "<string: Company name>",
      "type": "<'Direct' | 'Indirect'>",
      "hq": "<string: City, Country>",
      "fundingStage": "<string: e.g. Series B>",
      "totalFunding": "<string: e.g. $12M or Bootstrapped>",
      "weakness": "<string: A specific, exploitable competitive gap or blind spot>",
      "pricing": "<string: Actual pricing model and tiers>"
    },
    {
      "name": "<string: Company name>",
      "type": "<'Direct' | 'Indirect'>",
      "hq": "<string: City, Country>",
      "fundingStage": "<string>",
      "totalFunding": "<string>",
      "weakness": "<string: A specific, exploitable competitive gap or blind spot>",
      "pricing": "<string>"
    },
    {
      "name": "<string: Company name>",
      "type": "<'Direct' | 'Indirect'>",
      "hq": "<string: City, Country>",
      "fundingStage": "<string>",
      "totalFunding": "<string>",
      "weakness": "<string: A specific, exploitable competitive gap or blind spot>",
      "pricing": "<string>"
    },
    {
      "name": "<string: Company name>",
      "type": "<'Direct' | 'Indirect'>",
      "hq": "<string: City, Country>",
      "fundingStage": "<string>",
      "totalFunding": "<string>",
      "weakness": "<string: A specific, exploitable competitive gap or blind spot>",
      "pricing": "<string>"
    },
    {
      "name": "<string: Company name>",
      "type": "<'Direct' | 'Indirect'>",
      "hq": "<string: City, Country>",
      "fundingStage": "<string>",
      "totalFunding": "<string>",
      "weakness": "<string: A specific, exploitable competitive gap or blind spot>",
      "pricing": "<string>"
    },
    {
      "name": "<string: Company name>",
      "type": "<'Direct' | 'Indirect'>",
      "hq": "<string: City, Country>",
      "fundingStage": "<string>",
      "totalFunding": "<string>",
      "weakness": "<string: A specific, exploitable competitive gap or blind spot>",
      "pricing": "<string>"
    }
  ]
}`;
}
