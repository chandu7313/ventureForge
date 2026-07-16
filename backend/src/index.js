import "dotenv/config";
import express from "express";
import cors from "cors";
import { researchAgent } from "./agent/graph.js";
import redis from "./redis.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/research", async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== "string" || companyName.trim().length === 0) {
    res.status(400).json({ error: "companyName is required" });
    return;
  }

  const normalizedCompany = companyName.trim();
  const cacheKey = `company:${normalizedCompany.toLowerCase()}`;

  try {
    // 1. Check Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`\nCache hit for: ${normalizedCompany}`);
      const parsed = JSON.parse(cachedData);
      return res.json({ ...parsed, cached: true });
    }

    // 2. Run Agent
    console.log(`\nResearching: ${normalizedCompany}`);
    const startTime = Date.now();

    const result = await researchAgent.invoke({
      companyName: normalizedCompany,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Done in ${elapsed}s — Verdict: ${result.decision?.verdict}`);

    const responseData = {
      company: normalizedCompany,
      ticker: result.ticker,
      sector: result.sector,
      isPublic: result.isPublic,
      summary: result.summary,
      decision: result.decision,
    };

    // 3. Update Cache & Recent Searches
    if (result.decision) {
      // 24-hour TTL for the cache (86400 seconds)
      await redis.setex(cacheKey, 86400, JSON.stringify(responseData));

      // Push to recent searches list
      const recentEntry = JSON.stringify({
        companyName: normalizedCompany,
        verdict: result.decision.verdict,
        timestamp: new Date().toISOString()
      });
      await redis.lpush("recent-searches", recentEntry);
      await redis.ltrim("recent-searches", 0, 9); // keep latest 10
    }

    res.json(responseData);
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({
      error: "Research failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/recent-searches
app.get("/api/recent-searches", async (req, res) => {
  try {
    const list = await redis.lrange("recent-searches", 0, 9);
    const parsed = list.map(item => JSON.parse(item));
    res.json(parsed);
  } catch (error) {
    console.error("Redis error fetching recent searches:", error);
    res.status(500).json({ error: "Failed to fetch recent searches" });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Investment Research Agent running on http://localhost:${PORT}`);
  });
}

export default app;
