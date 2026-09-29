import assert from "node:assert/strict";
import test from "node:test";
import { createTab, restoreTabs } from "./tabs";

test("new tabs have distinct ids, names, and independent selections", () => {
  const first = createTab(["a"]);
  const second = createTab([], [first]);
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.name, second.name);
  assert.deepEqual(second.modelIds, []);
});

test("restores named tabs and the active tab", () => {
  const raw = JSON.stringify({ tabs: [
    { id: "a", name: "Coding", modelIds: ["one", "one"] },
    { id: "b", name: "Value", modelIds: ["two"] },
  ], activeTabId: "b" });
  const saved = restoreTabs(raw, null);
  assert.equal(saved.activeTabId, "b");
  assert.deepEqual(saved.tabs[0].modelIds, ["one"]);
  assert.equal(saved.tabs[1].name, "Value");
});

test("migrates the old selection once and survives invalid saved data", () => {
  const migrated = restoreTabs(null, '["one","two"]');
  assert.deepEqual(migrated.tabs[0].modelIds, ["one", "two"]);
  assert.deepEqual(restoreTabs("invalid", "invalid", ["demo"]).tabs[0].modelIds, ["demo"]);
});
