import assert from "node:assert/strict";
import test from "node:test";

import { adjudicate, resolveAdjudicationPaths } from "./adjudicate.mjs";

test("reveals frozen binary judgments into their raw run", () => {
  const criteria = Array.from({ length: 8 }, (_, index) => ({ id: `C-${index + 1}` }));
  const key = [{ label: "R01", file: "task__cold__t1.json", task: "task", arm: "cold", trial: 1, packet_sha256: "hash" }];
  const [row] = adjudicate({
    tasks: [{ id: "task", criteria }], key,
    manifest: [{ label: "R01", task: "task", packet_sha256: "hash" }],
    judgments: { runs: [{ label: "R01", criteria: criteria.map(({ id }, index) => ({ id, verdict: index === 7 ? "fail" : "pass", evidence: "observed" })) }] },
    records: [{ file: key[0].file, task: "task", arm: "cold", trial: 1, verdict: "pending" }],
  });
  assert.equal(row.record.verdict, "fail");
  assert.deepEqual(row.record.failed_criteria, ["C-8"]);
  assert.equal(row.record.criterion_results.length, 8);
});

test("routes repair adjudication to the repair artifacts", () => {
  assert.deepEqual(resolveAdjudicationPaths("C:\\suite", true), {
    blindRoot: "C:\\suite\\results\\repair-blind",
    rawRoot: "C:\\suite\\results\\codex\\repair\\raw",
    reviewPath: "C:\\suite\\results\\repair-blind-review.csv",
    resultsPath: "C:\\suite\\results\\codex\\repair\\results.csv",
  });
});
