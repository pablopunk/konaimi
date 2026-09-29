import type { Model } from "./models";

export const axes = [
  { key: "intelligence", name: "Intelligence", subtitle: "AA Intelligence Index" },
  { key: "coding", name: "Coding", subtitle: "AA Coding Index" },
  { key: "agentic", name: "Agentic", subtitle: "AA Agentic Index" },
  { key: "costPerTask", name: "Cheap", subtitle: "Cost per task" },
  { key: "outputSpeed", name: "Speed", subtitle: "Output tokens / sec" },
  { key: "contextWindow", name: "Context", subtitle: "OpenRouter context" },
] as const;

export type Axis = (typeof axes)[number]["key"];

export const hasCompleteStats = (model: Model): boolean =>
  axes.every(({ key }) => model[key] !== null && (key !== "costPerTask" || model[key] >= 0));

export const canChartModel = (model: Model): boolean =>
  model.intelligence !== null && model.costPerTask !== null && model.costPerTask >= 0;

const median = (numbers: number[]): number => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const axisValue = (value: number, axis: Axis): number => {
  if (axis === "costPerTask") return -Math.log2(Math.max(value, 0.001));
  if (axis === "outputSpeed" || axis === "contextWindow") return Math.log2(Math.max(value, 1));
  return value;
};

export function chartPositions(models: Model[]): Record<string, Record<Axis, number>> {
  const chartable = models.filter(canChartModel);
  if (chartable.length < 2) return {};
  const centers = Object.fromEntries(
    axes.map(({ key }) => {
      const values = chartable.map((model) => model[key]).filter((value): value is number => value !== null);
      return [key, values.length ? median(values.map((value) => axisValue(value, key))) : 0];
    }),
  ) as Record<Axis, number>;

  return Object.fromEntries(chartable.map((model) => [model.id, Object.fromEntries(
    axes.map(({ key }) => {
      const value = model[key];
      if (value === null) return [key, 0];
       const steps = key === "costPerTask" ? 10 : key === "outputSpeed" ? 18 : key === "contextWindow" ? 12 : 2;
      return [key, 50 + Math.max(-30, Math.min(30, (axisValue(value, key) - centers[key]) * steps))];
    }),
  )])) as Record<string, Record<Axis, number>>;
}
