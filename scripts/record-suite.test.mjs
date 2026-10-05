import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("el script que guarda el resultado de la suite existe y la salida guardada, si está, trae sus campos", () => {
  assert.ok(existsSync(resolve(root, "scripts/record-suite.mjs")));
  const out = resolve(root, "docs/SUITE_RESULT.txt");
  if (!existsSync(out)) return;
  const text = readFileSync(out, "utf8");
  for (const field of ["Date (UTC):", "Node version:", "HEAD SHA:", "Command: npm test", "Tests:", "Passed:", "Failed:", "Skipped:"]) {
    assert.ok(text.includes(field), `falta el campo ${field}`);
  }
});
