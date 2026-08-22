import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = (name) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");

// Ponytail: one minimal check that fails if routing regresses — no fixtures.

test("LEAVE vive en transmute-lore, no en save-to-lore (H14 for skills)", () => {
  assert.match(skill("transmute-lore"), /## LEAVE mode/);
  assert.match(skill("transmute-lore"), /<!-- lore:always-on -->/);
  assert.match(skill("transmute-lore"), /H13.*unmeasurable/);
  assert.doesNotMatch(skill("save-to-lore"), /## LEAVE mode/);
  assert.doesNotMatch(skill("save-to-lore"), /## Exit — leaving/);
});

test("use-lore enruta LEAVE a transmute-lore (gate antes de escribir)", () => {
  const use = skill("use-lore");
  assert.match(use, /transmute-lore.*\(\*\*LEAVE\*\*\)/);
  assert.match(use, /Gate before adding a mode/);
  assert.match(use, /brainstorming-lore.*before choosing a skill/);
  const save = skill("save-to-lore");
  assert.match(save, /Routing gate — before you write/);
  assert.match(save, /transmute-lore.*LEAVE.*not CAPTURE\/GRAFT/);
});

test("LEAVE deja criterio vivo y reversible (A+B) sin fantasma", () => {
  const t = skill("transmute-lore");
  assert.match(t, /Verify `lore\/` exists/);
  assert.match(t, /Remove the `<!-- lore:always-on -->` block/);
  assert.match(t, /Convert `FASES\.md` to the host/);
  assert.match(t, /enrutamiento\.md/);
  assert.match(t, /plain/);
  assert.match(t, /project must remain buildable without the kit/);
  assert.match(t, /Why here and not in `save-to-lore`/);
});
