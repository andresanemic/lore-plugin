import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const skill = (name) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");

test("obsidian-lore enruta peticiones sobre notas antes que la skill de dominio", () => {
  const text = skill("obsidian-lore");
  assert.match(text, /Cross-skill routing rule/);
  assert.match(text, /research-lus/);
  assert.match(text, /invokes this skill first/);
});

test("las notas minadas permanecen en su inbox con trazabilidad", () => {
  const text = skill("obsidian-lore");
  assert.match(text, /Never move\s+or delete the note after mining/);
  assert.match(text, /processed inbox is not an empty inbox/);
});

test("UPGRADE diagnostica antes de exigir un arbol limpio para escribir", () => {
  const text = skill("transmute-lore");
  assert.match(text, /do not stop the diagnosis/);
  assert.match(text, /precondition for \*\*Phase 4 \(writing\)\*\*/);
  assert.match(text, /invoke\s+`obsidian-lore`/);
});

test("use-lore declara precedencia de la fuente inbox", () => {
  assert.match(skill("use-lore"), /Source-side precedence/);
});

test("brainstorming-lore carga criterio y estado antes de diseñar", () => {
  const text = skill("brainstorming-lore");
  assert.match(text, /CLAUDE\.md/);
  assert.match(text, /FASES\.md/);
  assert.match(text, /lore\/index\.md/);
  assert.match(text, /read before asking/);
});

test("brainstorming-lore es neutral al dominio y entrega al plan nativo", () => {
  const text = skill("brainstorming-lore");
  assert.match(text, /domain-neutral/);
  assert.match(text, /native Plan Mode/);
  assert.match(text, /does not require `writing-plans`/);
  assert.match(text, /does not create a spec file or commit by default/);
});

test("brainstorming-lore preserva las puertas de las skills propietarias", () => {
  const text = skill("brainstorming-lore");
  assert.match(text, /owner\s+skill's threshold/);
  assert.match(text, /one question at a time/);
  assert.match(text, /two or three approaches/);
});

test("las skills que piden diseño de Lore enrutan a brainstorming-lore", () => {
  for (const name of ["use-lore", "create-area", "create-project", "create-bot"]) {
    const text = skill(name);
    assert.match(text, /Lore Plugin's own\s+`brainstorming-lore` skill/);
    assert.match(text, /lore:brainstorming-lore/);
  }
});

test("ninguna skill depende del brainstorming de Superpowers", () => {
  const root = new URL("../skills/", import.meta.url);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "brainstorming-lore") continue;
    const text = skill(entry.name);
    assert.doesNotMatch(text, /Superpowers.{0,80}brainstorm|brainstorm.{0,80}Superpowers/i);
  }
});

test("create-bot puede crear Lore in the Shell sin depender de la skill separada", () => {
  const createBot = skill("create-bot");
  assert.match(createBot, /must\s+remain available even when the separate `lore-in-the-shell` skill is not installed/i);
  assert.match(createBot, /If it is absent, create the minimum launcher locally/i);
});

test("brainstorming-lore no se activa para brainstorming genérico", () => {
  const text = skill("brainstorming-lore");
  assert.match(text, /Explicit non-triggers/);
  assert.match(text, /merely says «hagamos brainstorming»/);
  assert.match(text, /not changing Lore itself/);
});

test("CRYSTALLIZE produce una fotografía derivada sin reemplazar el Lore vivo", () => {
  const text = skill("transmute-lore");
  assert.match(text, /\*\*CRYSTALLIZE\*\*/);
  assert.match(text, /single Markdown derivative/);
  assert.match(text, /does not replace the six live artifacts/);
  assert.match(text, /snapshot may become stale/);
});

test("CRYSTALLIZE protege material privado y exige vista previa", () => {
  const text = skill("transmute-lore");
  assert.match(text, /conversations, secrets, ignored files, undistilled notes/);
  assert.match(text, /threshold/);
  assert.match(text, /exact source manifest/);
  assert.match(text, /writes no source artifact/);
});
