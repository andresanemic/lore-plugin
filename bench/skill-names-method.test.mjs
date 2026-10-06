import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = readFileSync(join(REPO, "skills", "vespi", "SKILL.md"), "utf8");

// H3: el qué hacer del coordinador no puede vivir solo en method.md.
// La secuencia acotada tiene que tener el paso que lo nombra.
test("la secuencia nombra el metodo que la gobierna", () => {
  const seq = SKILL.split("## Coordination when the work already has a shape")[1] ?? "";
  assert.match(seq, /method\.md/, "ningún paso nombra method.md");
});
