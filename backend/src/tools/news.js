import { tavily } from "@tavily/core";

export async function searchNews(companyName) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not set");

  const client = tavily({ apiKey });

  const response = await client.search(
    `${companyName} investment analysis latest news financial outlook`,
    { searchDepth: "basic", maxResults: 5 }
  );

  return response.results.map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }));
}
