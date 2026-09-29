export type Model = {
  id: string;
  name: string;
  creator: string;
  intelligence: number | null;
  coding: number | null;
  agentic: number | null;
  costPerTask: number | null;
};

export type Catalog = {
  models: Model[];
  source: "live" | "demo";
  updatedAt: string;
  indexVersion: number | null;
  stale?: boolean;
};

const numberOrNull = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export function parseModel(value: unknown): Model | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  const evaluations = (row.evaluations ?? {}) as Record<string, unknown>;
  const costs = (row.artificial_analysis_intelligence_index_cost ?? {}) as Record<string, unknown>;
  const task = (costs.cost_per_task ?? {}) as Record<string, unknown>;
  const creator = (row.model_creator ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    name: row.name,
    creator: typeof creator.name === "string" ? creator.name : "Unknown creator",
    intelligence: numberOrNull(evaluations.artificial_analysis_intelligence_index),
    coding: numberOrNull(evaluations.artificial_analysis_coding_index),
    agentic: numberOrNull(evaluations.artificial_analysis_agentic_index),
    costPerTask: numberOrNull(task.total_cost),
  };
}
