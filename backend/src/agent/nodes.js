import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { fetchFinancials } from "../tools/financials.js";
import { searchNews } from "../tools/news.js";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.2,
});

// Node 1: Resolve the company name to a ticker and sector
export async function resolveCompany(state) {
  const response = await llm.invoke([
    {
      role: "system",
      content: `You are a financial research assistant. Given a company name, identify:
1. Its stock ticker symbol (if publicly traded)
2. Its sector/industry
3. Whether it is publicly traded

Respond ONLY with valid JSON, no markdown:
{"ticker": "AAPL", "sector": "Technology", "isPublic": true}

If the company is private or you can't find a ticker, use:
{"ticker": "PRIVATE", "sector": "best guess sector", "isPublic": false}`,
    },
    { role: "user", content: state.companyName },
  ]);

  const text = typeof response.content === "string" ? response.content : "";
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      ticker: parsed.ticker || "PRIVATE",
      sector: parsed.sector || "Unknown",
      isPublic: parsed.isPublic ?? false,
    };
  } catch {
    return { ticker: "PRIVATE", sector: "Unknown", isPublic: false };
  }
}

// Node 2: Gather financial data and news in parallel
export async function gatherResearch(state) {
  const newsPromise = searchNews(state.companyName);

  // Only fetch financials for public companies with a valid ticker
  const financialsPromise = state.isPublic && state.ticker !== "PRIVATE"
    ? fetchFinancials(state.ticker)
    : Promise.resolve(null);

  const [financialsResult, newsResult] = await Promise.allSettled([
    financialsPromise,
    newsPromise,
  ]);

  return {
    financials: financialsResult.status === "fulfilled" ? financialsResult.value : null,
    news: newsResult.status === "fulfilled" ? newsResult.value : [],
  };
}

// Node 3: Synthesize all research into a plain-language summary
export async function synthesize(state) {
  const context = buildResearchContext(state);

  const response = await llm.invoke([
    {
      role: "system",
      content: `You are a senior investment analyst. Write a concise (3-5 paragraph) investment research summary based on the provided data. Cover:
- Company overview and market position
- Financial health and key metrics (if available)
- Recent news and market sentiment
- Growth outlook and competitive landscape
Be factual and balanced. If financial data is missing (private company), focus on qualitative analysis.`,
    },
    { role: "user", content: context },
  ]);

  return {
    summary: typeof response.content === "string" ? response.content : "",
  };
}

// Node 4: Make the final investment decision
export async function decide(state) {
  const context = buildResearchContext(state);

  const response = await llm.invoke([
    {
      role: "system",
      content: `You are a senior investment analyst making a final investment decision. Based on all the research provided, output your decision as valid JSON (no markdown fences):

{
  "verdict": "INVEST" or "PASS",
  "confidence": number between 0-100,
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "keyMetrics": {"Metric Name": "value", ...}
}

Rules:
- confidence is your certainty in the verdict (0-100)
- reasoning should have 3-5 clear bullet points
- risks should have 2-4 specific risks
- keyMetrics should include 4-6 relevant metrics (use "N/A" if data unavailable)
- For keyMetrics, include things like: Market Cap, P/E Ratio, Revenue Growth, Debt/Equity, ROE, Sector
- Output ONLY the JSON, nothing else`,
    },
    {
      role: "user",
      content: `Research Summary:\n${state.summary}\n\nRaw Data:\n${context}`,
    },
  ]);

  const text = typeof response.content === "string" ? response.content : "";
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const decision = JSON.parse(cleaned);
    return { decision };
  } catch {
    // Fallback if parsing fails
    return {
      decision: {
        verdict: "PASS",
        confidence: 30,
        reasoning: ["Unable to fully analyze — data parsing issue"],
        risks: ["Insufficient data for confident analysis"],
        keyMetrics: { "Status": "Analysis incomplete" },
      },
    };
  }
}

function buildResearchContext(state) {
  const parts = [
    `Company: ${state.companyName}`,
    `Ticker: ${state.ticker}`,
    `Sector: ${state.sector}`,
    `Public: ${state.isPublic}`,
  ];

  if (state.financials?.profile) {
    const p = state.financials.profile;
    parts.push(`\n--- Company Profile ---`);
    parts.push(`Market Cap: $${(p.mktCap / 1e9).toFixed(2)}B`);
    parts.push(`Price: $${p.price}`);
    parts.push(`Industry: ${p.industry}`);
    parts.push(`Country: ${p.country}`);
    parts.push(`Exchange: ${p.exchange}`);
    parts.push(`Description: ${p.description?.slice(0, 500)}`);
  }

  if (state.financials?.ratios) {
    const r = state.financials.ratios;
    parts.push(`\n--- Financial Ratios (TTM) ---`);
    const interesting = [
      "peRatioTTM", "returnOnEquityTTM", "debtEquityRatioTTM",
      "currentRatioTTM", "grossProfitMarginTTM", "netProfitMarginTTM",
      "dividendYielTTM", "priceToBookRatioTTM",
    ];
    for (const key of interesting) {
      if (r[key] !== undefined) {
        parts.push(`${key}: ${Number(r[key]).toFixed(4)}`);
      }
    }
  }

  if (state.news.length > 0) {
    parts.push(`\n--- Recent News & Analysis ---`);
    for (const article of state.news) {
      parts.push(`[${article.title}](${article.url})\n${article.content.slice(0, 300)}\n`);
    }
  }

  return parts.join("\n");
}
