import type { Catalog } from "./models";

export const demoCatalog: Catalog = {
  source: "demo",
  updatedAt: "",
  indexVersion: null,
  models: [
    { id: "demo-atlas-max", name: "Atlas (max)", creator: "Demo models", intelligence: 52, coding: 49, agentic: 47, costPerTask: 2.8 },
    { id: "demo-atlas-medium", name: "Atlas (medium)", creator: "Demo models", intelligence: 46, coding: 45, agentic: 43, costPerTask: 1.25 },
    { id: "demo-sprint-high", name: "Sprint (high)", creator: "Demo models", intelligence: 43, coding: 47, agentic: 38, costPerTask: 0.42 },
    { id: "demo-ember-max", name: "Ember (max)", creator: "Demo models", intelligence: 49, coding: 42, agentic: 50, costPerTask: 1.8 },
  ],
};
