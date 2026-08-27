import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { assertExposure, assertFrozenExecution, selectRuns, writeJsonAtomic } from "./protocol.mjs";

const tasks = ["web", "news", "community", "founder"].map((id) => ({ id }));

test("wave 1 selects one paired trial for every task", () => {
  const runs = selectRuns(tasks, 2, 1);
  assert.equal(runs.length, 8);
  assert.deepEqual(runs.map(({ trial }) => trial), Array(8).fill(1));
  for (const task of tasks) {
    assert.deepEqual(runs.filter((run) => run.task.id === task.id).map(({ arm }) => arm).sort(), ["cold", "lore"]);
  }
});

test("wave 2 reverses each pair's first arm", () => {
  const first = selectRuns(tasks, 2, 1);
  const second = selectRuns(tasks, 2, 2);
  for (const task of tasks) {
    assert.notEqual(
      first.find((run) => run.task.id === task.id).arm,
      second.find((run) => run.task.id === task.id).arm,
    );
  }
});

test("rejects waves outside the frozen two-trial design", () => {
  assert.throws(() => selectRuns(tasks, 2, 0), /wave/i);
  assert.throws(() => selectRuns(tasks, 2, 3), /wave/i);
});

test("preflight accepts only cold unavailable and routed Lore 2.3.2", () => {
  assert.doesNotThrow(() => assertExposure({
    cold: { lore_plugin: false, text: "LORE_UNAVAILABLE" },
    lore: { lore_plugin: true, version: "2.3.2", read_lore: true, other_plugins: [] },
  }));
});

test("preflight rejects plugin exposure in cold", () => {
  assert.throws(() => assertExposure({
    cold: { lore_plugin: true, text: "LORE_AVAILABLE" },
    lore: { lore_plugin: true, version: "2.3.2", read_lore: true, other_plugins: [] },
  }), /cold/i);
});

test("preflight rejects wrong or unread Lore and unrelated plugins", () => {
  assert.throws(() => assertExposure({
    cold: { lore_plugin: false, text: "LORE_UNAVAILABLE" },
    lore: { lore_plugin: true, version: "2.3.1", read_lore: false, other_plugins: ["ponytail"] },
  }), /2\.3\.2|read|plugin/i);
});

test("refuses drift from the frozen execution", () => {
  const execution = { model: "gpt-5.6-terra", reasoning_effort: "medium", trials: 2 };
  const preflight = {
    model: execution.model,
    reasoning_effort: execution.reasoning_effort,
    cold: { lore_plugin: false, text: "LORE_UNAVAILABLE" },
    lore: { lore_plugin: true, version: "2.3.2", read_lore: true, other_plugins: [] },
  };
  assert.doesNotThrow(() => assertFrozenExecution({ execution, model: execution.model, reasoningEffort: "medium", trials: 2, preflight }));
  assert.throws(() => assertFrozenExecution({ execution, model: "gpt-5.6-sol", reasoningEffort: "medium", trials: 2, preflight }), /fuera del preregistro/);
});

test("writes complete JSON through an atomic rename", () => {
  const root = mkdtempSync(join(tmpdir(), "lore-bench-"));
  const path = join(root, "result.json");
  writeJsonAtomic(path, { ok: true });
  assert.deepEqual(JSON.parse(readFileSync(path, "utf8")), { ok: true });
});
