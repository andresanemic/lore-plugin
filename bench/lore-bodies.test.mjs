import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { unnamedBodies } from "../hooks/lore-state.mjs";

// La pregunta que MYCELIUM no tenía: ¿el contrato del árbol nombra su propio `lore/`?
//
// Su universo son las Pistas que exigen artefacto o paso, y por cada una pregunta qué
// paso obliga a correrla. Nunca pregunta si el CUERPO que las contiene se carga. Por
// eso un barrido corrido sobre `bot-lus-lore` el 2026-08-24 no vio que el contrato de
// ese bot no nombraba su propio `lore/` — nueve módulos inertes de una vez.
//
// Un `lore/` sin loader no es una Pista huérfana: es un archivo que el barrido abre
// para leer sus Pistas sin notar que la sesión real nunca lo abre.

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "lore-bodies-"));
  for (const [rel, body] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  }
  return dir;
}

const withBlock = (lines) => `# Proyecto\n\n<!-- lore:always-on -->\n${lines}\n<!-- /lore:always-on -->\n\nProsa.\n`;

const LORE = {
  "lore/identidad.md": "# Identidad\n",
  "lore/principios.md": "# Principios\n",
  "lore/index.md": "# Índice\n",
};

test("un contrato que nombra su propio lore/ no reporta nada", () => {
  const dir = tree({
    ...LORE,
    "CLAUDE.md": withBlock("- `lore/identidad.md`\n- `lore/principios.md`\n- `lore/index.md`\n- `FASES.md`"),
  });
  const r = unnamedBodies(dir);
  assert.equal(r.contract, "CLAUDE.md");
  assert.equal(r.hasBlock, true);
  assert.deepEqual(r.unnamed, []);
  rmSync(dir, { recursive: true, force: true });
});

test("el caso que lo motivó: el bloque nombra canon y estado, y no su propio lore/", () => {
  const dir = tree({
    ...LORE,
    "canon/frontera.md": "# Frontera\n",
    "CLAUDE.md": withBlock("- `canon/frontera.md`\n- `lore/enrutamiento.md`\n- `FASES.md`"),
    "lore/enrutamiento.md": "# Enrutamiento\n",
  });
  const r = unnamedBodies(dir);
  assert.deepEqual(r.unnamed.sort(), ["lore/identidad.md", "lore/index.md", "lore/principios.md"]);
  rmSync(dir, { recursive: true, force: true });
});

test("sin bloque always-on, la pregunta cae sobre el contrato entero", () => {
  const dir = tree({
    ...LORE,
    "CLAUDE.md": "# Proyecto\n\nLee `lore/identidad.md` y `lore/principios.md` antes de decidir.\n",
  });
  const r = unnamedBodies(dir);
  assert.equal(r.hasBlock, false);
  assert.deepEqual(r.unnamed, ["lore/index.md"]);
  rmSync(dir, { recursive: true, force: true });
});

test("AGENTS.md cuenta como contrato", () => {
  const dir = tree({ ...LORE, "AGENTS.md": withBlock("- `lore/identidad.md`") });
  const r = unnamedBodies(dir);
  assert.equal(r.contract, "AGENTS.md");
  assert.deepEqual(r.unnamed.sort(), ["lore/index.md", "lore/principios.md"]);
  rmSync(dir, { recursive: true, force: true });
});

test("sin contrato no se inventa un veredicto: se dice que no hay dónde mirar", () => {
  const dir = tree(LORE);
  const r = unnamedBodies(dir);
  assert.equal(r.contract, null);
  assert.deepEqual(r.unnamed, [], "sin contrato no hay cuerpo «no nombrado», hay un contrato ausente");
  rmSync(dir, { recursive: true, force: true });
});

test("un árbol sin lore/ no es asunto de esta pregunta", () => {
  const dir = tree({ "CLAUDE.md": "# Proyecto\n", "src/a.js": "1\n" });
  assert.deepEqual(unnamedBodies(dir).unnamed, []);
  rmSync(dir, { recursive: true, force: true });
});

test("hereda las exclusiones: un fixture o un backup no son el lore/ del árbol", () => {
  const dir = tree({
    ...LORE,
    "CLAUDE.md": withBlock("- `lore/identidad.md`\n- `lore/principios.md`\n- `lore/index.md`"),
    "bench/fixtures/lore/principios.md": "# ajeno\n",
    "informes/_backup/otro/lore/identidad.md": "# ajeno\n",
  });
  assert.deepEqual(unnamedBodies(dir).unnamed, []);
  rmSync(dir, { recursive: true, force: true });
});

test("devuelve datos, no un veredicto: el reparo lo decide quien lee", () => {
  const dir = tree({ ...LORE, "CLAUDE.md": withBlock("- `FASES.md`") });
  const r = unnamedBodies(dir);
  assert.ok(Array.isArray(r.unnamed), "una lista de rutas, no una frase");
  const flat = JSON.stringify(r).toLowerCase();
  for (const word of ["huérfan", "orphan", "conecta", "connect", "arregl", "fix"]) {
    assert.ok(!flat.includes(word), `no prescribe reparación: apareció «${word}»`);
  }
  rmSync(dir, { recursive: true, force: true });
});

// --- eslabón 2: contrato → índice → módulo temático --------------------------

test("un módulo temático que el índice no nombra se reporta aparte", () => {
  const dir = tree({
    ...LORE,
    "lore/index.md": "# Índice\n\n- rutas · al enrutar · enrutamiento.md\n",
    "lore/enrutamiento.md": "# Enrutamiento\n",
    "lore/sitio-web.md": "# Sitio\n",
    "CLAUDE.md": withBlock("- `lore/identidad.md`\n- `lore/principios.md`\n- `lore/index.md`"),
  });
  const r = unnamedBodies(dir);
  assert.deepEqual(r.unnamed, [], "el núcleo está nombrado");
  assert.deepEqual(r.unindexed, ["lore/sitio-web.md"]);
  rmSync(dir, { recursive: true, force: true });
});

test("un módulo temático fuera del bloque siempre-activo NO es un defecto", () => {
  const dir = tree({
    ...LORE,
    "lore/index.md": "# Índice\n\n- sitio · al diseñar · sitio-web.md\n",
    "lore/sitio-web.md": "# Sitio\n",
    "CLAUDE.md": withBlock("- `lore/identidad.md`\n- `lore/principios.md`\n- `lore/index.md`"),
  });
  const r = unnamedBodies(dir);
  assert.deepEqual(r.unnamed, []);
  assert.deepEqual(r.unindexed, [], "se abre por tarea desde el índice: así es el diseño");
  rmSync(dir, { recursive: true, force: true });
});

test("si el índice no está cargado no se apila ruido sobre el primer eslabón", () => {
  const dir = tree({
    ...LORE,
    "lore/sitio-web.md": "# Sitio\n",
    "CLAUDE.md": withBlock("- `FASES.md`"),
  });
  const r = unnamedBodies(dir);
  assert.ok(r.unnamed.includes("lore/index.md"), "el eslabón roto es el primero");
  assert.deepEqual(r.unindexed, [], "no se reporta el segundo mientras el primero esté roto");
  rmSync(dir, { recursive: true, force: true });
});
