import assert from "node:assert/strict";
import test from "node:test";
import { parseModel } from "./models";

test("keeps separately listed thinking levels and maps Free API fields", () => {
  const base = {
    model_creator: { name: "Example Lab" },
    evaluations: {
      artificial_analysis_intelligence_index: 52,
      artificial_analysis_coding_index: 48,
      artificial_analysis_agentic_index: 46,
    },
    artificial_analysis_intelligence_index_cost: { cost_per_task: { total_cost: 1.25 } },
  };
  const max = parseModel({ ...base, id: "max-id", name: "Example (max)" });
  const medium = parseModel({ ...base, id: "medium-id", name: "Example (medium)" });
  assert.equal(max?.costPerTask, 1.25);
  assert.equal(max?.coding, 48);
  assert.notEqual(max?.id, medium?.id);
});

test("missing scores remain missing, not zero", () => {
  const model = parseModel({ id: "id", name: "Partial", evaluations: { artificial_analysis_intelligence_index: 0 } });
  assert.equal(model?.intelligence, 0);
  assert.equal(model?.agentic, null);
  assert.equal(model?.costPerTask, null);
  assert.equal(parseModel({ name: "No id" }), null);
});
