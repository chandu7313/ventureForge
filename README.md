# AI Investment Research Agent

An AI-powered investment research tool that analyzes companies and provides clear **Invest/Pass** verdicts with reasoning, key metrics, and risks.

Built with a **React** frontend and **Node.js/Express** backend, using **LangGraph.js** for agent orchestration, **Google Gemini** as the LLM, and **Redis** for caching.

## How It Works

Enter a company name → the agent runs a 4-step research pipeline:

```
resolveCompany → gatherResearch → synthesize → decide
```

1. **resolveCompany** — Gemini identifies the stock ticker and sector from the company name
2. **gatherResearch** — Fetches financial data (Financial Modeling Prep) and recent news (Tavily) in parallel
3. **synthesize** — Gemini writes a plain-language investment research summary
4. **decide** — Gemini outputs a structured verdict with confidence score, reasoning, risks, and key metrics

### Caching and Recent Searches
To prevent redundant API calls, the backend uses **Redis** to cache results.
- **Result Cache**: The full verdict JSON is cached for **24 hours**. If you search for the same company again within that time, the result is returned instantly.
- **Recent Searches**: The last 10 successful searches are stored in Redis and displayed on the frontend home screen. Clicking a recent search card immediately loads the cached result.

## Setup

### Prerequisites
- Node.js 20+
- Redis (Local or Cloud)
- API keys for:
  - [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)
  - [Financial Modeling Prep](https://financialmodelingprep.com/developer) (free tier)
  - [Tavily](https://tavily.com) (free tier)

### 1. Redis Setup
You need a running Redis instance. You can use Docker locally:
```bash
docker run -d -p 6379:6379 --name redis redis
```
*(Alternatively, create a free database on [Redis Cloud](https://redis.com/try-free/) and get the connection URL).*

### 2. Backend

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
REDIS_URL=redis://localhost:6379
```

```bash
npm install
npm run dev
```

Backend runs on **http://localhost:3001**.

### 3. Frontend

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

Returns the decision JSON. If cached, it includes `"cached": true`.

### GET /api/recent-searches

Returns an array of the last 10 searches:
```json
[
  {
    "companyName": "Apple",
    "verdict": "INVEST",
    "timestamp": "2026-07-12T15:45:00.000Z"
  }
]
```

## Project Structure

```
backend/
  src/
    agent/
      state.js    — LangGraph state definition
      nodes.js    — 4 node functions
      graph.js    — StateGraph wiring
    tools/
      financials.js — FMP API wrapper
      news.js       — Tavily API wrapper
    index.js      — Express server + route
    redis.js      — Redis client initialization

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
