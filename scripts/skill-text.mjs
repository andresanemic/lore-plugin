import { existsSync, readdirSync, readFileSync } from "node:fs";
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
