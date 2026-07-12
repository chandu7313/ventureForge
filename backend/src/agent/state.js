import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({
  companyName: Annotation({ reducer: (_, b) => b, default: () => "" }),
  ticker: Annotation({ reducer: (_, b) => b, default: () => "" }),
  sector: Annotation({ reducer: (_, b) => b, default: () => "" }),
  isPublic: Annotation({ reducer: (_, b) => b, default: () => true }),
  financials: Annotation({ reducer: (_, b) => b, default: () => null }),
  news: Annotation({ reducer: (_, b) => b, default: () => [] }),
  summary: Annotation({ reducer: (_, b) => b, default: () => "" }),
  decision: Annotation({ reducer: (_, b) => b, default: () => null }),
});
