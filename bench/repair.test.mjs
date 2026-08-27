import assert from "node:assert/strict";
import test from "node:test";

import { buildRepairPrompt, failedOriginal } from "./repair.mjs";

test("solo selecciona fallos válidos para reparar", () => {
  assert.equal(failedOriginal({ verdict: "fail", error: false }), true);
  assert.equal(failedOriginal({ verdict: "pass", error: false }), false);
  assert.equal(failedOriginal({ verdict: "n/a", error: true }), false);
});

test("la reparación conserva encargo, respuesta y feedback", () => {
  const prompt = buildRepairPrompt(
    { prompt: "Haz X", clue: "lore/x.md — usa Y" },
    "respuesta anterior",
  );
  assert.match(prompt, /Haz X/);
  assert.match(prompt, /respuesta anterior/);
  assert.match(prompt, /usa Y/);
  assert.match(prompt, /respuesta completa corregida/);
});

test("la reparación semántica revela solo los criterios fallidos", () => {
  const prompt = buildRepairPrompt(
    { prompt: "Haz X", criteria: [
      { id: "X-01", description: "cumple uno" },
      { id: "X-02", description: "cumple dos" },
    ] },
    "respuesta anterior",
    ["X-02"],
  );
  assert.match(prompt, /X-02.*cumple dos/s);
  assert.doesNotMatch(prompt, /X-01|cumple uno/);
});
