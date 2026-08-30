// Estado del Lore de un árbol, por contenido — Lore Plugin.
//
// El único piso común que tienen los dos hosts y todos los usuarios es el sistema
// de archivos. No `git` (no es requisito del kit, y hay árboles de Lore sin él),
// no el transcript (invisible a las escrituras por script), no lo que el agente
// diga haber corrido (una frase no es un hecho).
//
// Se usa desde `hooks/mycelium-guard.mjs` y desde `lore-plugin mycelium receipt`.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

// Un archivo de Lore: un `.md` dentro de un `lore/`, o uno de los nombres
// distintivos del kit en cualquier nivel. Mismos criterios que usaba el guard.
const LORE_DIR = /(^|[/\\])lore[/\\][^/\\]+\.md$/i;
const LORE_FILE = /(^|[/\\])(FASES|PHASES|principios|principles|identidad|identity|enrutamiento|routing)\.md$/i;

// Directorios universales de dependencias y artefactos, más las dos formas en que
// un árbol contiene Lore que no es suyo: **fixtures** (dato de prueba) y **backups**
// (una copia de otro árbol). El principio detrás de las dos es el mismo — *una copia
// de un Lore no es el Lore del árbol que la contiene* — y la frontera es honesta: el
// recorrido no puede distinguir una copia cualquiera de un original, así que se apoya
// en convenciones de nombre. Un árbol que guarde copias con otro nombre las verá
// contadas, y su digest se moverá cuando esas copias se regeneren.
//
// No se listan nombres de carpeta propios de ningún ecosistema: generalizar desde un
// solo caso es cómo una forma se lleva puesto lo que era propio de ese caso.
const SKIP = new Set([
  "node_modules", ".git", ".venv", "venv", "dist", "build", "coverage",
  ".next", "__pycache__",
  "fixtures", "__fixtures__", "test-fixtures",
  "_backup", "backup", "backups", ".backup",
]);

const MAX_DEPTH = 6;
const MAX_BYTES = 2_000_000;

export const RECEIPT = ".lore-mycelium";

export function loreFiles(root, { maxDepth = MAX_DEPTH } = {}) {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP.has(e.name)) walk(full, depth + 1);
      } else if (e.isFile() && (LORE_DIR.test(full) || LORE_FILE.test(full))) {
        found.push(full);
      }
    }
  };
  walk(root, 0);
  return found.sort();
}

// Digest por CONTENIDO, no por mtime: tocar un archivo sin cambiarlo no cuenta,
// y el mismo árbol da el mismo digest en otra máquina.
export function digest(root) {
  const h = createHash("sha256");
  for (const file of loreFiles(root)) {
    let body = "";
    try {
      if (statSync(file).size > MAX_BYTES) continue;
      body = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    } catch {
      continue;
    }
    h.update(relative(root, file).split(sep).join("/"));
    h.update("\0");
    h.update(createHash("sha256").update(body).digest("hex"));
    h.update("\n");
  }
  return h.digest("hex");
}

export function readReceipt(root) {
  try {
    const raw = readFileSync(join(root, RECEIPT), "utf8").trim();
    return /^[0-9a-f]{64}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeReceipt(root, value = digest(root)) {
  writeFileSync(join(root, RECEIPT), `${value}\n`);
  return value;
}
