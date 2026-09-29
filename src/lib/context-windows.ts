import "server-only";
import type { Model } from "./models";

type OpenRouterModel = { name?: unknown; context_length?: unknown };

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

export const contextLookupName = (model: Pick<Model, "name" | "creator">): string =>
  normalize(`${model.creator}: ${model.name.split(" (")[0]}`);

export async function contextWindows(): Promise<Map<string, number>> {
  const response = await fetch("https://openrouter.ai/api/v1/models", { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error("OpenRouter model list unavailable");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("data" in body) || !Array.isArray(body.data)) throw new Error("Invalid OpenRouter model list");
  const windows = new Map<string, number>();
  for (const row of body.data as OpenRouterModel[]) {
    if (typeof row.name === "string" && typeof row.context_length === "number" && row.context_length > 0) {
      const name = normalize(row.name);
      if (!windows.has(name)) windows.set(name, row.context_length);
    }
  }
  return windows;
}
