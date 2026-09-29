import assert from "node:assert/strict";
import test from "node:test";
import { searchModels } from "./search";
import type { Model } from "./models";

const model = (name: string, creator = "Meta"): Model => ({
  id: name, name, creator, intelligence: 40, coding: 40, agentic: 40, costPerTask: 1, outputSpeed: 80, contextWindow: 128000,
});

const models = [
  model("Muse Spark 1.2 (xhigh)"),
  model("Muse Glimmer (high)"),
  model("Muse Spark 1.3 (max)"),
  model("Muse Spark 1.3 (xhigh)"),
  model("Claude Opus 5.5 (medium)", "Anthropic"),
  model("DeepSeek V4.1 Flash (Non-Reasoning)", "DeepSeek"),
  model("DeepSeek V4.1 Flash (Reasoning, Max Effort)", "DeepSeek"),
  model("JT-4.1 Flash 236B A21B", "China Mobile"),
];

test("finds separated name and version words in either order", () => {
  assert.deepEqual(searchModels(models, "muse 1.3").map((item) => item.name), [
    "Muse Spark 1.3 (max)", "Muse Spark 1.3 (xhigh)",
  ]);
  assert.equal(searchModels(models, "1.3 muse").length, 2);
});

test("allows small name typos but does not confuse version numbers", () => {
  assert.equal(searchModels(models, "muse sparc 1.3").length, 2);
  assert.equal(searchModels(models, "muse 1.4").length, 0);
});

test("matches versions with an optional V prefix without mixing nearby versions", () => {
  assert.deepEqual(searchModels(models, "flash 4.1").map((item) => item.name), [
    "JT-4.1 Flash 236B A21B",
    "DeepSeek V4.1 Flash (Non-Reasoning)",
    "DeepSeek V4.1 Flash (Reasoning, Max Effort)",
  ]);
  assert.equal(searchModels(models, "deepseek flash 4.1").length, 2);
  assert.equal(searchModels(models, "flash 4.11").length, 0);
});

test("supports creator and effort words", () => {
  assert.equal(searchModels(models, "anthropic medium")[0]?.name, "Claude Opus 5.5 (medium)");
  assert.deepEqual(searchModels(models, ""), models);
});

test("sorts search results and the default list by intelligence, with missing scores last", () => {
  const ranked = [
    { ...model("Flash A"), intelligence: 42 },
    { ...model("Flash B"), intelligence: null },
    { ...model("Flash C"), intelligence: 51 },
  ];
  assert.deepEqual(searchModels(ranked, "flash").map((item) => item.name), ["Flash C", "Flash A", "Flash B"]);
  assert.deepEqual(searchModels(ranked, "").map((item) => item.name), ["Flash C", "Flash A", "Flash B"]);
});
