import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = readFileSync(join(REPO, "skills", "vespi", "SKILL.md"), "utf8");

// H1: la Skill no puede eximir la operación ordinaria. Si esta frase vuelve,
// el kit se decrece a sí mismo y la unidad deja de existir en la prosa.
test("SKILL no exime la operacion ordinaria", () => {
  assert.doesNotMatch(SKILL, /Ordinary work does not need this skill/, "exención global presente");
  assert.match(SKILL, /ordinary operation is still an operation/i, "falta la cláusula que la mantiene operación");
});
