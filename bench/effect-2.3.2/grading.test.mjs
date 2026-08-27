import assert from "node:assert/strict";
import test from "node:test";

import { gradeTask, validateTaskGrader } from "./grading.mjs";

test("semantic tasks remain pending until blind adjudication", () => {
  const task = { criteria: Array.from({ length: 8 }, (_, index) => ({ id: `X-${index + 1}` })) };
  assert.deepEqual(gradeTask(task, "artifact", "full"), {
    verdict: "pending",
    compliance: [],
    violation: [],
    failed_criteria: [],
  });
  assert.doesNotThrow(() => validateTaskGrader(task));
});

test("legacy regex grading remains unchanged", () => {
  const task = {
    compliance: ["required"],
    violation: ["forbidden"],
    selftest: { bad: "forbidden", good: "required" },
  };
  assert.equal(gradeTask(task, "required", "full").verdict, "pass");
  assert.equal(gradeTask(task, "required forbidden", "full").verdict, "fail");
  assert.doesNotThrow(() => validateTaskGrader(task));
});

test("semantic grading rejects any count other than eight", () => {
  assert.throws(() => validateTaskGrader({ criteria: [{ id: "X-1" }] }), /ocho|8/i);
});
