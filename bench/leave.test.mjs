import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = (name) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");

// Ponytail: one minimal check that fails if routing regresses — no fixtures.
// Enrutar y enchufar son dos operaciones. El gate del kit cubre la primera; esta cubre la segunda.
// Forma estructural, no prosa: writing-skills manda automatizar lo que un regex verifica.

const SKILLS = ["use-lore", "brainstorming-lore", "create-area", "create-project",
                "create-bot", "save-to-lore", "transmute-lore", "obsidian-lore"];

export function orphanSections(read = skill) {
  const orphans = [];
  for (const name of SKILLS) {
    const txt = read(name);
    for (const m of txt.matchAll(/^#{2,3} +(.+)$/gm)) {
      const title = m[1];
      if (/^Phase/i.test(title)) continue;              // un paso no se llama a si mismo
      if (!/check|mode|scan|gate/i.test(title)) continue;
      const key = (title.match(/[A-Z]{4,}/) || [])[0];
      if (!key) continue;
      if (!new RegExp(key, "i").test(txt.slice(0, m.index))) orphans.push(`${name}: ## ${title.trim()}`);
    }
  }
  return orphans;
}



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
  assert.match(t, /plain `enrutamiento\.md`/);
  assert.match(t, /project must remain buildable without the kit/);
  assert.match(t, /Why here and not in `save-to-lore`/);
});

// Auditoría 2.3.0 con Opus high (2026-08-22): tres defectos verificados sobre el borrador
// escrito con opencode+muse-spark. Cada test falla contra dc83986 y pasa con la corrección.

test("LEAVE escribe la marca `leave:` — sin ella UPGRADE no puede volver y H13 sigue sin instrumento", () => {
  const t = skill("transmute-lore");
  const leave = t.slice(t.indexOf("## LEAVE mode"), t.indexOf("## CRYSTALLIZE mode"));
  assert.match(leave, /`leave:`/);
});

test("ORPHAN está enchufado en una fase de PRUNE, no solo escrito al lado (H14 sobre sí mismo)", () => {
  const t = skill("transmute-lore");
  const prune = t.slice(t.indexOf("## PRUNE mode"), t.indexOf("## ORPHAN check"));
  assert.match(prune, /ORPHAN/);
});

test("el gate de enrutamiento no se dispara con el `index.md` que todo CAPTURE toca", () => {
  assert.match(skill("save-to-lore"), /index\.md[^\n]*does not count|no cuenta|not the second artifact/);
});

test("ningún frontmatter supera los 1024 caracteres de la especificación", () => {
  for (const name of ["use-lore", "brainstorming-lore", "create-area", "create-project",
                      "create-bot", "save-to-lore", "transmute-lore", "obsidian-lore"]) {
    const fm = skill(name).split("---")[1];
    assert.ok(fm.length <= 1024, `${name}: frontmatter de ${fm.length} caracteres`);
  }
});

test("el predicado del gate no cuenta artefactos en NINGUNA skill — index.md lo rompía en las dos", () => {
  for (const name of ["save-to-lore", "use-lore"]) {
    assert.doesNotMatch(skill(name), /touches ≥2 artifacts/,
      `${name}: el umbral por conteo se dispara con el módulo + index.md que todo CAPTURE escribe`);
  }
});

// Enrutar y enchufar son dos operaciones. El gate del kit cubre la primera; esta cubre la segunda.
// Forma estructural, no prosa: writing-skills manda automatizar lo que un regex verifica.

test("una capacidad nueva declara el paso que la corre — ninguna seccion queda huerfana", () => {
  assert.deepEqual(orphanSections(), [], "capacidad que ningun paso anterior nombra");
});
