// SC-002 del spec 2.1: estampar N veces deja exactamente un bloque y el diff
// queda vacío. Hasta ahora el criterio de éxito solo existía escrito.
//
// Lo que este archivo prueba es la **regla** de estampado tal como la documenta
// `use-lore` —marcadores literales, match de línea completa tras trim, inserción
// después del H1—, no la ejecución del agente que la sigue. Esa distinción es la
// misma que anuló el pre-registro del banco: no hay camino determinista entre
// editar un `SKILL.md` y observar a un modelo obedecerlo. La regla sí se puede
// fijar, y una regla ambigua es la causa raíz que un fallo de idempotencia
// tendría.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const OPEN = "<!-- lore:always-on -->";
const CLOSE = "<!-- /lore:always-on -->";
const CEILING = 25;

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Estampado idempotente: reemplaza el bloque si existe, lo inserta tras el H1 si no. */
function stamp(text, block) {
  const lines = text.split("\n");
  let open = null;
  let close = null;
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed === OPEN && open === null) open = i;
    else if (trimmed === CLOSE) close = i;
  });
  const body = [OPEN, ...block.trim().split("\n"), CLOSE];
  if (open !== null && close !== null && close > open) {
    return [...lines.slice(0, open), ...body, ...lines.slice(close + 1)].join("\n");
  }
  const h1 = lines.findIndex((line) => line.startsWith("# "));
  if (h1 === -1) return [...body, "", ...lines].join("\n");
  return [...lines.slice(0, h1 + 1), "", ...body, ...lines.slice(h1 + 1)].join("\n");
}

const BLOCK = [
  "## The criteria that governs here",
  "- `lore/` — what good work is in this project.",
  "- `FASES.md` — state, outside `lore/`.",
  "",
  "> Writing criteria by hand feels like competence — that feeling is the signal to invoke the skill.",
].join("\n");

test("SC-002 — tres pasadas dejan un solo bloque y el diff vacío", () => {
  const virgin = "# proyecto-x\n\nUn contrato escrito a mano.\n\n## Notas\n\ntexto previo.\n";
  const runs = [];
  let current = virgin;
  for (let i = 0; i < 3; i += 1) {
    current = stamp(current, BLOCK);
    runs.push(current);
  }
  assert.equal(current.split(OPEN).length - 1, 1, "debe quedar exactamente un marcador de apertura");
  assert.equal(current.split(CLOSE).length - 1, 1, "debe quedar exactamente un marcador de cierre");
  assert.equal(runs[0], runs[1], "la segunda pasada debe producir un diff vacío");
  assert.equal(runs[1], runs[2], "la tercera pasada debe producir un diff vacío");
});

test("SC-002 — la inserción conserva el H1 y la prosa preexistente", () => {
  const virgin = "# proyecto-x\n\nUn contrato escrito a mano.\n\n## Notas\n\ntexto previo.\n";
  const stamped = stamp(virgin, BLOCK);
  assert.ok(stamped.startsWith("# proyecto-x"), "el H1 sigue siendo la primera línea");
  assert.match(stamped, /texto previo\./, "no se pierde contenido escrito a mano");
});

test("SC-002 — un archivo ya estampado queda intacto byte a byte", () => {
  const stamped = stamp("# proyecto-x\n\ntexto.\n", BLOCK);
  assert.equal(stamp(stamped, BLOCK), stamped);
});

test("SC-002 — los marcadores se reconocen con sangría y espacios finales", () => {
  const stamped = stamp("# proyecto-x\n\ntexto.\n", BLOCK);
  const sloppy = stamped.replace(OPEN, `  ${OPEN}  `).replace(CLOSE, `\t${CLOSE} `);
  const restamped = stamp(sloppy, BLOCK);
  assert.equal(restamped.split(OPEN).length - 1, 1, "un marcador con sangría no debe duplicar el bloque");
  assert.equal(restamped, stamped, "el reestampado normaliza y no acumula");
});

test("FR-003 — ningún bloque canónico de las skills supera el techo de 25 líneas", () => {
  const skills = readdirSync(join(root, "skills"), { withFileTypes: true }).filter((e) => e.isDirectory());
  let found = 0;
  for (const skill of skills) {
    const text = readFileSync(join(root, "skills", skill.name, "SKILL.md"), "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].trim() !== OPEN) continue;
      const close = lines.findIndex((line, j) => j > i && line.trim() === CLOSE);
      assert.notEqual(close, -1, `${skill.name}: marcador de apertura sin cierre`);
      const height = close - i + 1;
      assert.ok(
        height <= CEILING,
        `${skill.name}: bloque de ${height} líneas, por encima del techo de ${CEILING}`,
      );
      found += 1;
      i = close;
    }
  }
  assert.ok(found > 0, "se esperaba al menos un bloque canónico en las skills");
});
