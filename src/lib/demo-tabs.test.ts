import assert from "node:assert/strict";
import test from "node:test";
import { restoreDemoTabs } from "./demo-tabs";

const ids = ["opus", "astra", "fable", "sol"];
const saved = (modelIds: string[]) => JSON.stringify({ tabs: [{ id: "saved", name: "Clean Sheet", modelIds }], activeTabId: "saved" });

test("a prior two-model default gains the third model once without losing its tab", () => {
  const restored = restoreDemoTabs(saved(ids.slice(0, 2)), null, ids, true);
  assert.equal(restored.tabs[0].name, "Clean Sheet");
  assert.equal(restored.activeTabId, "saved");
  assert.deepEqual(restored.tabs[0].modelIds, ids.slice(0, 3));
});

test("later intentional removals and other saved selections stay unchanged", () => {
  assert.deepEqual(restoreDemoTabs(saved(ids.slice(0, 2)), null, ids, false).tabs[0].modelIds, ids.slice(0, 2));
  assert.deepEqual(restoreDemoTabs(saved([ids[0], ids[3]]), null, ids, true).tabs[0].modelIds, [ids[0], ids[3]]);
  assert.deepEqual(restoreDemoTabs(saved([]), null, ids, true).tabs[0].modelIds, []);
});

test("new visitors and obsolete demo selections start with three models", () => {
  assert.deepEqual(restoreDemoTabs(null, null, ids, true).tabs[0].modelIds, ids.slice(0, 3));
  assert.deepEqual(restoreDemoTabs(saved(["old-id"]), null, ids, true).tabs[0].modelIds, ids.slice(0, 3));
});
