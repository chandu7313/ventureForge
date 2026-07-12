# AI Investment Research Agent

An AI-powered investment research tool that analyzes companies and provides clear **Invest/Pass** verdicts with reasoning, key metrics, and risks.

Built with a **React** frontend and **Node.js/Express** backend, using **LangGraph.js** for agent orchestration and **Google Gemini** as the LLM.

## How It Works

Enter a company name → the agent runs a 4-step research pipeline:

```
resolveCompany → gatherResearch → synthesize → decide
```

1. **resolveCompany** — Gemini identifies the stock ticker and sector from the company name
2. **gatherResearch** — Fetches financial data (Financial Modeling Prep) and recent news (Tavily) in parallel
3. **synthesize** — Gemini writes a plain-language investment research summary
4. **decide** — Gemini outputs a structured verdict with confidence score, reasoning, risks, and key metrics

## Setup

### Prerequisites
- Node.js 20+
- API keys for:
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)
  - [Financial Modeling Prep](https://financialmodelingprep.com/developer) (free tier)
  - [Tavily](https://tavily.com) (free tier)

### 1. Backend

```bash
cd backend
cp .env .env.local   # optional — or edit .env directly
```

Fill in your API keys in `backend/.env`:

```
GOOGLE_API_KEY=your_key_here
FMP_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
PORT=3001
```

```bash
npm install
npm run dev
```

Backend runs on **http://localhost:3001**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**.

The frontend hits `http://localhost:3001` by default (configured in `frontend/.env`).

## API

### POST /api/research

```bash
curl -X POST http://localhost:3001/api/research \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Apple"}'
```

**Response:**
```json
{
  "company": "Apple",
  "ticker": "AAPL",
  "sector": "Technology",
  "isPublic": true,
  "summary": "Apple Inc. remains one of the most...",
  "decision": {
    "verdict": "INVEST",
    "confidence": 78,
    "reasoning": [
      "Dominant market position in consumer electronics",
      "Strong services revenue growth",
      "Massive cash reserves and share buyback program"
    ],
    "risks": [
      "China supply chain concentration",
      "Regulatory scrutiny on App Store practices",
      "Smartphone market saturation"
    ],
    "keyMetrics": {
      "Market Cap": "$3.4T",
      "P/E Ratio": "33.2",
      "Revenue Growth": "5.1%",
      "Debt/Equity": "1.87",
      "ROE": "157%",
      "Sector": "Technology"
    }
  }
}
```

## Example Runs

### Apple (Large Public Company)
- **Verdict:** INVEST (78% confidence)
- Full financial data from FMP + recent news
- Strong metrics across the board, risks around China and regulation

### Stripe (Private Company)
- **Verdict:** INVEST (62% confidence)
- No FMP data (private) — analysis based on news/qualitative data
- High growth potential, risks around competition and IPO timing

### Tesla (Controversial Stock)
- **Verdict:** PASS (45% confidence)
- Full financial data + polarizing news sentiment
- High valuation concerns, CEO risk, but strong EV market position

## Project Structure

```
backend/
  src/
    agent/
      state.ts    — LangGraph state definition (Annotation)
      nodes.ts    — 4 node functions
      graph.ts    — StateGraph wiring
    tools/
      financials.ts — FMP API wrapper
      news.ts       — Tavily API wrapper
    index.ts      — Express server + route

frontend/
  src/
    App.jsx
    components/
      SearchForm.jsx
      ResultCard.jsx
    main.jsx
    index.css
```

## Ports

| App | Port |
|-----|------|
| Backend | 3001 |
| Frontend | 5173 |

## License

MIT
# AI-Research-Agent
