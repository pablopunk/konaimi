import assert from "node:assert/strict";
import test from "node:test";
import { canChartModel, chartPositions, hasCompleteStats } from "./compare";
import type { Model } from "./models";

const makeModel = (id: string, intelligence: number, costPerTask: number): Model => ({
  id, name: id, creator: "Test", intelligence, coding: 40, agentic: 40, costPerTask,
});

test("small differences stay small, and lower task cost extends farther", () => {
  const positions = chartPositions([makeModel("a", 50, 1), makeModel("b", 50.2, 2)]);
  assert.ok(positions.b.intelligence - positions.a.intelligence < 1);
  assert.equal(positions.a.costPerTask, 55);
  assert.equal(positions.b.costPerTask, 45);
});

test("ties overlap and an outlier cannot flatten the other points", () => {
  const positions = chartPositions([
    makeModel("a", 50, 1), makeModel("b", 50, 1), makeModel("c", 100, 1000),
  ]);
  assert.equal(positions.a.intelligence, positions.b.intelligence);
  assert.equal(positions.c.intelligence, 80);
  assert.equal(positions.c.costPerTask, 20);
});

test("one model cannot form a comparison, while missing Coding or Agentic plots at zero", () => {
  const single = makeModel("a", 50, 1);
  assert.deepEqual(chartPositions([single]), {});
  const missing = { ...makeModel("b", 40, 2), coding: null, agentic: null };
  assert.equal(hasCompleteStats(missing), false);
  assert.equal(canChartModel(missing), true);
  const positions = chartPositions([single, missing]);
  assert.equal(positions.b.coding, 0);
  assert.equal(positions.b.agentic, 0);
  assert.equal(positions.a.coding, 50);
  assert.ok(positions.b.intelligence > 0);
});

test("missing Intelligence or task cost still prevents a chart shape", () => {
  const single = makeModel("a", 50, 1);
  assert.equal(canChartModel({ ...single, intelligence: null }), false);
  assert.equal(canChartModel({ ...single, costPerTask: null }), false);
  assert.deepEqual(chartPositions([single, { ...makeModel("b", 40, 2), costPerTask: null }]), {});
});

test("zero cost remains valid without an infinite radius", () => {
  const positions = chartPositions([makeModel("a", 50, 0), makeModel("b", 50, 1)]);
  assert.equal(positions.a.costPerTask, 80);
  assert.equal(positions.b.costPerTask, 20);
});
