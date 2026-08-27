import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { prepareBlind } from "./blind.mjs";

test("prepares arm-blind packets and a separate key", () => {
  const root = mkdtempSync(join(tmpdir(), "blind-bench-"));
  const raw = join(root, "raw");
  const out = join(root, "blind");
  mkdirSync(raw);
  const task = { id: "task", criteria: [{ id: "C-01", description: "Criterion" }] };
  for (const arm of ["cold", "lore"]) for (const trial of [1, 2]) {
    writeFileSync(join(raw, `task__${arm}__t${trial}.json`), JSON.stringify({ task: "task", arm, trial, verdict: "pending", error: false, text: `${arm}-${trial}` }));
  }
  assert.equal(prepareBlind({ tasks: [task], rawRoot: raw, outputRoot: out, randomized: (items) => items }), 4);
  const packet = readFileSync(join(out, "packets", "R01.md"), "utf8");
  assert.doesNotMatch(packet, /Arm:|Trial:|__cold|__lore/);
  assert.match(packet, /C-01: Criterion/);
  const key = JSON.parse(readFileSync(join(out, "key.json"), "utf8"));
  assert.equal(key.length, 4);
  assert.throws(() => prepareBlind({ tasks: [task], rawRoot: raw, outputRoot: out }), /already exists/);
});
