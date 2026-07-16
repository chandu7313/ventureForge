# AI Research Agent

## Overview
This is a web app that researches companies using AI and tells you if you should invest or not. It uses React for the frontend and Node.js/Express for the backend.

## How to run it
You need Node.js and Redis installed.

1. Add your API keys to `backend/.env`:
```
GOOGLE_API_KEY=your_key
FMP_API_KEY=your_key
TAVILY_API_KEY=your_key
PORT=3001
REDIS_URL=redis://localhost:6379
```

2. Start the backend:
```bash
cd backend
npm install
npm run dev
```

3. Start the frontend:
```bash
cd frontend
npm install
npm run dev
```

The app will run on `http://localhost:5173`.

## How it works
The backend uses LangGraph to run a 4-step workflow:
1. It resolves the company name to find the stock ticker.
2. It fetches financial data from Financial Modeling Prep and news from Tavily Search.
3. The AI (Gemini) reads the data and writes a summary.
4. The AI decides if it's an "INVEST" or "PASS" and outputs JSON with reasoning and risks.

The frontend is a simple React app that sends the company name to the backend and displays the results in a grid. We also use Redis to cache the results for 24 hours so we don't waste API calls.

## Key decisions & trade-offs
- I used Express instead of Next.js because it was simpler to set up a custom LangGraph agent in a standard Node environment.
- I used plain CSS instead of a component library to keep the frontend lightweight.
- I used Redis for caching because financial data doesn't change every minute, but I skipped adding a real database (like PostgreSQL) because there are no user accounts in this MVP.
- I used JavaScript instead of TypeScript on the frontend to save time and reduce build complexity.

## Example runs
- **Apple (AAPL)**: Returned "INVEST" because of their strong brand and services revenue, but warned about slowing hardware sales.
- **Tesla (TSLA)**: Returned "PASS" because of high valuation multiples and increased competition in the EV market.

## What I would improve with more time
- Add user accounts so people can save their favorite companies.
- Show historical stock price charts using a library like Chart.js.
- Make the frontend show step-by-step progress while the LangGraph agent is running, instead of just a single loading screen.
