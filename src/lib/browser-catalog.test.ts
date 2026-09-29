import assert from "node:assert/strict";
import { test } from "node:test";
import { loadInitialCatalog } from "./browser-catalog";

const demo = { source: "demo", models: [], updatedAt: "", indexVersion: null };
const live = { ...demo, source: "live" };

test("a saved key loads live data without requesting the demo first", async () => {
  const original = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (_, options) => {
    requests.push(options?.method ?? "GET");
    return Response.json(live);
  };
  try {
    const result = await loadInitialCatalog("saved-key");
    assert.equal(result.catalog.source, "live");
    assert.equal(result.keyFailed, false);
    assert.deepEqual(requests, ["POST"]);
  } finally { globalThis.fetch = original; }
});

test("a failed saved key falls back to demo data", async () => {
  const original = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = async (_, options) => {
    requests.push(options?.method ?? "GET");
    return options?.method === "POST" ? Response.json({ error: "Invalid key" }, { status: 401 }) : Response.json(demo);
  };
  try {
    const result = await loadInitialCatalog("bad-key");
    assert.equal(result.catalog.source, "demo");
    assert.equal(result.keyFailed, true);
    assert.deepEqual(requests, ["POST", "GET"]);
  } finally { globalThis.fetch = original; }
});
