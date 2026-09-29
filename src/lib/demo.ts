import type { Catalog } from "./models";

export const demoCatalog: Catalog = {
  source: "demo",
  updatedAt: "2026-09-29T00:00:00.000Z",
  indexVersion: null,
  models: [
    { id: "demo-claude-opus-5", name: "Claude Opus 5", creator: "Anthropic", intelligence: 50, coding: 53, agentic: 49, costPerTask: 3, outputSpeed: 57, contextWindow: 1000000 },
    { id: "demo-gpt-6-astra", name: "GPT-6 Astra", creator: "OpenAI", intelligence: 52, coding: 54, agentic: 55, costPerTask: 2, outputSpeed: 70, contextWindow: 1050000 },
    { id: "demo-claude-fable-5", name: "Claude Fable 5", creator: "Anthropic", intelligence: 54, coding: 55, agentic: 52, costPerTask: 4, outputSpeed: 62, contextWindow: 1000000 },
    { id: "demo-gpt-5-6-sol", name: "GPT-5.6 Sol", creator: "OpenAI", intelligence: 45, coding: 44, agentic: 42, costPerTask: 0.5, outputSpeed: 90, contextWindow: 1050000 },
  ],
};
