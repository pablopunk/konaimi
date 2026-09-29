import type { Catalog } from "./models";

export const apiKeyStorage = "konaimi:api-key:v1";

export async function loadCatalog(key?: string): Promise<Catalog> {
  const response = await fetch("/api/models", key ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
    cache: "no-store",
  } : { cache: "no-store" });
  if (!response.ok) {
    const body: unknown = await response.json();
    const message = body && typeof body === "object" && "error" in body ? body.error : null;
    throw new Error(typeof message === "string" ? message : "The model list is not available right now.");
  }
  return await response.json() as Catalog;
}

export async function loadInitialCatalog(key: string | null): Promise<{ catalog: Catalog; keyFailed: boolean }> {
  if (key) {
    try { return { catalog: await loadCatalog(key), keyFailed: false }; }
    catch { return { catalog: await loadCatalog(), keyFailed: true }; }
  }
  return { catalog: await loadCatalog(), keyFailed: false };
}
