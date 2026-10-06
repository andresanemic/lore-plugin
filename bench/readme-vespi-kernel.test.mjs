import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const README = readFileSync(join(REPO, "README.md"), "utf8");

// El README no puede presentar a Vespi solo como carga bajo presión:
// es el kernel que mantiene viva la operación. La presión es un caso, no la puerta.
test("el README dice que Vespi mantiene viva la operacion", () => {
  assert.match(README, /keeps .*operation alive/i, "falta el kernel que mantiene viva");
  assert.doesNotMatch(README, /\| `vespi` \|[^|]*\| when the work is a live operation under pressure \|/, "la puerta sigue siendo la presión");
});
