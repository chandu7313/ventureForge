import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { resolveCompany, gatherResearch, synthesize, decide } from "./nodes.js";

const workflow = new StateGraph(AgentState)
  .addNode("resolveCompany", resolveCompany)
  .addNode("gatherResearch", gatherResearch)
  .addNode("synthesize", synthesize)
  .addNode("decide", decide)
  .addEdge(START, "resolveCompany")
  .addEdge("resolveCompany", "gatherResearch")
  .addEdge("gatherResearch", "synthesize")
  .addEdge("synthesize", "decide")
  .addEdge("decide", END);

export const researchAgent = workflow.compile();
