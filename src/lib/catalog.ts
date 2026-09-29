import "server-only";
import { parseModel, type Catalog } from "./models";

const endpoint = "https://artificialanalysis.ai/api/v2/language/models/free";

export async function fetchCatalog(key: string): Promise<Catalog> {
  const models: Catalog["models"] = [];
  let version: number | null = null;
  for (let page = 1; page <= 20; page += 1) {
    const response = await fetch(`${endpoint}?page=${page}`, {
      headers: { "x-api-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status === 401 || response.status === 403) throw new InvalidKeyError();
    if (!response.ok) throw new Error(`Artificial Analysis returned ${response.status}`);
    const body: unknown = await response.json();
    if (!body || typeof body !== "object") throw new Error("Invalid model list");
    const result = body as Record<string, unknown>;
    if (!Array.isArray(result.data) || !result.pagination || typeof result.pagination !== "object") {
      throw new Error("Incomplete model list");
    }
    const pagination = result.pagination as Record<string, unknown>;
    version = typeof result.intelligence_index_version === "number" ? result.intelligence_index_version : null;
    models.push(...result.data.map(parseModel).filter((model) => model !== null));
    if (pagination.has_more === false) {
      if (!models.length) throw new Error("Empty model list");
      return { source: "live", updatedAt: new Date().toISOString(), indexVersion: version, models };
    }
    if (pagination.has_more !== true) throw new Error("Incomplete pagination");
  }
  throw new Error("Model list exceeds 20 pages");
}

export class InvalidKeyError extends Error {}
