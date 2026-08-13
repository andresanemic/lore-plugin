import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { isRateLimit, shouldRun } from "./resume.mjs";

test("--retry-na conserva corridas validas y reintenta solo errores", () => {
  const dir = mkdtempSync(join(tmpdir(), "lore-bench-"));
  const valid = join(dir, "valid.json");
  const failed = join(dir, "failed.json");
  const missing = join(dir, "missing.json");

  writeFileSync(valid, JSON.stringify({ error: false }));
  writeFileSync(failed, JSON.stringify({ error: true }));

  assert.equal(shouldRun(valid, true), false);
  assert.equal(shouldRun(failed, true), true);
  assert.equal(shouldRun(missing, true), true);
});

test("detecta limites de uso para abortar la corrida", () => {
  assert.equal(isRateLimit("You've hit your weekly limit · resets Aug 14"), true);
  assert.equal(isRateLimit("You've hit your session limit · resets 9pm"), true);
  assert.equal(isRateLimit("API Error: Connection refused"), false);
});
