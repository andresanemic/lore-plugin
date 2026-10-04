import { existsSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

// A skill with a `modes/` directory keeps SKILL.md as a lean dispatcher and moves each mode's
// full procedure to its own file, loaded on demand by the agent (not preloaded — see the SDO
// section of writing-skills). Tests that check a mode's content still need to see it as one body,
// in the same order the dispatcher lists it (some tests slice between two mode headers) — so this
// reads SKILL.md, finds every `modes/<name>.md` reference in the order it appears there, and
// appends those files in that order. A modes/*.md file the dispatcher does not reference is
// appended last (alphabetically), so it is never silently dropped from a content check.
// Las pruebas escriben sus regex contra `\n`, y en Windows `core.autocrlf` deja los archivos con
// `\r\n` en el working copy — asi que un patron que cruza un salto de linea deja de matchear en un
// clon recien hecho, sin que nada haya cambiado en la skill. Se normaliza aca, que es por donde
// pasan todas: arreglarlo regex por regex deja el siguiente sin cubrir.
const read = (path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");

export function skillText(skillDir) {
  const head = read(join(skillDir, "SKILL.md"));
  const modesDir = join(skillDir, "modes");
  if (!existsSync(modesDir)) return head;

  const referenced = [...head.matchAll(/modes\/([a-z0-9-]+)\.md/g)].map((m) => m[1]);
  const onDisk = readdirSync(modesDir).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  const seen = new Set();
  const order = [];
  for (const name of referenced) {
    if (onDisk.includes(name) && !seen.has(name)) { order.push(name); seen.add(name); }
  }
  for (const name of onDisk.sort()) {
    if (!seen.has(name)) { order.push(name); seen.add(name); }
  }

  let text = head;
  for (const name of order) text += "\n\n" + read(join(modesDir, `${name}.md`));
  return text;
}

// The physical files a skill is made of, as paths relative to `root` — `skills/<name>/SKILL.md`
// plus every `modes/*.md` it has, if any. For a full-corpus sweep (a test grepping every live
// artifact for a retired name) `join("skills", name, "SKILL.md")` alone silently skips a mode's
// content once it has moved out of SKILL.md; this is the list that does not skip it.
export function skillFiles(root, name) {
  const skillDir = join(root, "skills", name);
  const files = [join("skills", name, "SKILL.md")];
  const modesDir = join(skillDir, "modes");
  if (existsSync(modesDir)) {
    for (const f of readdirSync(modesDir).filter((f) => f.endsWith(".md")).sort()) {
      files.push(join("skills", name, "modes", f));
    }
  }
  return files;
}

// Los comandos que la prosa de las skills ORDENA CORRER, leídos del paquete real y no de un
// fixture: un fixture repetiría el defecto que produjo esta lista — certificar el mecanismo
// bajo las condiciones que su autor imaginó (RC de 2.4.8 en Codex, 2026-09-03).
//
// `lore-plugin` es la entrada de la vía npm/marketplace; `lore-cli` es la entrada local que
// instala cada host. La prosa puede nombrar cualquiera de las dos, y lo que se afirma es que
// el comando ordenado exista en lo INSTALADO, no cuál de los dos nombres usa la frase.
//
// Vuelve como mapa `comando -> [subcomandos]`, y no como una lista plana de palabras, porque
// la exención se declara por comando y arrastra a sus subcomandos: `crystallize` no viaja y
// entonces `pack` y `extract` tampoco, que es lo que pasa. Aplanar la lista obligaría a
// exentar cada subcomando por su cuenta, y una lista de exenciones larga es una lista que
// nadie lee.
//
// Vive acá y no en una prueba porque hay dos guardas que lo necesitan —la que mira las
// entradas instaladas y la que mira las del repo— y dos extractores serían dos verdades
// sobre la misma prosa: el segundo se queda viejo y no lo dice.
export function comandosOrdenados(root) {
  const pares = new Map();
  const agregar = (comando, sub) => {
    const subs = pares.get(comando) ?? [];
    if (sub && !subs.includes(sub)) subs.push(sub);
    pares.set(comando, subs);
  };
  const skills = join(root, "skills");
  for (const entry of readdirSync(skills, { recursive: true })) {
    const name = String(entry);
    if (!name.endsWith(".md")) continue;
    const prosa = read(join(skills, name));
    for (const [, comando, sub] of prosa.matchAll(/(?:lore-plugin|lore-cli)\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/g)) {
      agregar(comando, sub);
    }
  }
  return pares;
}

// Lo que una entrada ANUNCIA: su `--help`. No se lee el archivo buscando el token, porque en
// el archivo la palabra aparece también en los comentarios —`crystallize` está en el encabezado
// de `lore-cli.mjs` justamente para explicar por qué NO viaja— y una guarda que busca
// substrings no distingue código de explicación. La fricción se encontró leyendo la ayuda, así
// que la guarda mira la ayuda: es la superficie que la persona ve antes de correr nada.
export function ayudaDe(entrada) {
  const r = spawnSync(process.execPath, [entrada, "--help"], { encoding: "utf8" });
  return String(r.stdout ?? "") + String(r.stderr ?? "");
}


// Los que la entrada local NO ofrece, cada uno con su razón. Una lista sin razón es una
// exención silenciosa, y una exención silenciosa es el defecto con otra forma: por eso la
// prueba exige que cada razón esté escrita y que la exención no se quede vieja.
//
// Y son tres, por tres razones distintas, que es lo que hace que la lista sea corta:
// `crystallize` lanza `skills/transmute-lore/scripts/crystallize.mjs`, que no viaja en una
// cadena corta; `opencode-permissions` y `opencode-sandbox` escriben la configuración del
// host, y la entrada local es de solo lectura por lo que hace MYCELIUM. Lo que no hace
// ninguna de las dos es offering una capacidad que no trae.
export const NO_VIAJA_EN_LA_ENTRADA_LOCAL = new Map([
  ["crystallize", "shells out to skills/transmute-lore/scripts/crystallize.mjs, which does not travel in a short chain"],
  ["opencode-permissions", "writes the host's OpenCode config; the local entry stays read-only"],
  ["opencode-sandbox", "writes the host's OpenCode config; the local entry stays read-only"],
]);
