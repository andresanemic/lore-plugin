import assert from "node:assert/strict";
import test from "node:test";

import { summarize } from "./summary.mjs";

const run = (arm, trial, verdict, passed, duration_ms) => ({
  task: "task", arm, trial, verdict, duration_ms,
  compliance: Array.from({ length: passed }, (_, index) => `C-${index}`),
  violation: Array.from({ length: 8 - passed }, (_, index) => `F-${index}`),
  input_tokens: 10, output_tokens: 2, cache_read: 4, tool_calls: 1, read_lore: arm === "lore",
});

test("derives compliance, attempt distribution and censored time to goal", () => {
  const summary = summarize({
    primary: [run("cold", 1, "pass", 8, 10), run("cold", 2, "fail", 7, 20), run("lore", 1, "pass", 8, 30), run("lore", 2, "fail", 6, 40)],
    repairs: [run("cold", 2, "pass", 8, 5), run("lore", 2, "fail", 7, 6)],
  });
  assert.equal(summary.first_pass.cold.passed, 15);
  assert.equal(summary.first_pass.lore.passed, 14);
  assert.equal(summary.first_pass.delta_pp, -6.25);
  assert.deepEqual(summary.attempts_to_goal.cold, { attempt_1: 1, attempt_2: 1, over_2: 0, reached: 2, total: 2 });
  assert.deepEqual(summary.attempts_to_goal.lore, { attempt_1: 1, attempt_2: 0, over_2: 1, reached: 1, total: 2 });
  assert.equal(summary.time_to_goal.cold.mean_ms, 17.5);
  assert.equal(summary.time_to_goal.lore.mean_ms, 30);
  assert.equal(summary.time_to_goal.lore.censored, 1);
});
