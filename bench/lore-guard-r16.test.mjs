// R16 (RC4, obligatoria): la guardia clasifica cada destino en propio / ajeno / desconocido.
// Diseño: bots/proyectos/bot-lus-lore/specs/012-rc4/diseno-guardia-r16.md
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { anotarDesconocidos as annotate, classifyWrite, jurisdictionBlock, unknownWrites } from "../hooks/lore-guard.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(repo, "hooks", "codex-guard.mjs");
const roots = [];
const mk = (prefix) => { const d = mkdtempSync(join(tmpdir(), prefix)); roots.push(d); return d; };
const put = (root, rel, body = "x\n") => { const f = join(root, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, body); return f; };
test.after(() => { for (const d of roots) rmSync(d, { recursive: true, force: true }); });

test("R16: la memoria de la sesión es propia y nunca se bloquea (regresión NC-B-2)", () => {
  const own = mk("r16-own-"); put(own, "lore/principios.md");
  // El nombre de proyecto de Claude se DERIVA de la raíz propia; la prueba lo pide derivado y
  // no inventado, porque un nombre inventado solo pasaba con el arreglo anterior —que miraba
  // la forma de la ruta— y hoy sería una memoria de otro dueño (ver NC-B-2.2 en
  // `scripts/lore-guard-jurisdiccion.test.mjs`, que es donde vive la regresión permanente).
  const memory = join(homedir(), ".claude", "projects", own.replace(/[^A-Za-z0-9]/g, "-"), "memory", "nota.md");
  assert.equal(classifyWrite(own, memory), "own");
  assert.equal(jurisdictionBlock(own, "Write", { file_path: memory }), null);
});

test("R16: el scratchpad de la sesión es propio", () => {
  const own = mk("r16-own-"); put(own, "lore/principios.md");
  const scratch = join(tmpdir(), "claude", "sesion", "scratchpad", "x.md");
  assert.equal(classifyWrite(own, scratch), "own");
});

test("R16: la raíz propia es propia", () => {
  const own = mk("r16-own-"); put(own, "lore/principios.md");
  assert.equal(classifyWrite(own, join(own, "lore", "nuevo.md")), "own");
});

test("R16: un árbol gobernado hermano que el enrutamiento no declara es ajeno y se bloquea", () => {
  const hive = mk("r16-hive-");
  const own = join(hive, "bot"); put(own, "lore/principios.md");
  const other = join(hive, "otro"); put(other, "lore/principios.md");
  assert.equal(classifyWrite(own, join(other, "lore", "principios.md")), "foreign");
  assert.match(jurisdictionBlock(own, "Edit", { file_path: join(other, "lore", "principios.md") }) ?? "", /jurisdicci/i);
});

test("R16: un árbol que el enrutamiento declara sigue siendo ajeno para escritura", () => {
  const hive = mk("r16-hive-");
  const own = join(hive, "bot");
  put(own, "lore/enrutamiento.md", "| Área | Cuándo | Dónde |\n|---|---|---|\n| X | siempre | `area-x` |\n");
  put(hive, "area-x/lore/principios.md");
  assert.equal(classifyWrite(own, join(hive, "area-x", "lore", "principios.md")), "foreign");
});

test("R16: una ruta fuera de todo árbol gobernado es desconocida, pasa y se reporta", () => {
  const own = mk("r16-own-"); put(own, "lore/principios.md");
  const loose = join(mk("r16-suelto-"), "notas", "x.md");
  assert.equal(classifyWrite(own, loose), "unknown");
  assert.equal(jurisdictionBlock(own, "Write", { file_path: loose }), null);
  assert.deepEqual(unknownWrites(own, "Write", { file_path: loose }), [loose]);
});

test("R16: en una colmena con intercambio/, el hermano sin Lore también es ajeno", () => {
  const hive = mk("r16-colmena-");
  const own = join(hive, "agentes", "vendedor"); put(own, "lore/principios.md");
  mkdirSync(join(hive, "intercambio"), { recursive: true });
  mkdirSync(join(hive, "agentes", "cliente"), { recursive: true });
  assert.equal(classifyWrite(own, join(hive, "intercambio", "m.md")), "own");
  assert.equal(classifyWrite(own, join(hive, "agentes", "cliente", "canon", "f.md")), "foreign");
});

test("R16: el hook deja pasar lo desconocido con aviso y constancia en el registro", () => {
  const own = mk("r16-own-"); put(own, "lore/principios.md");
  const logDir = mk("r16-log-");
  const loose = join(mk("r16-suelto-"), "x.md");
  const out = execFileSync("node", [hook, "pre_tool_use"], {
    input: JSON.stringify({ cwd: own, hook_event_name: "PreToolUse", session_id: `r16-${Date.now()}`, tool_name: "Write", tool_input: { file_path: loose } }),
    encoding: "utf8",
    env: { ...process.env, LORE_GUARD_LOG_DIR: logDir },
  });
  const parsed = JSON.parse(out);
  assert.equal(parsed.hookSpecificOutput, undefined, "lo desconocido no se deniega");
  assert.match(parsed.systemMessage, /fuera de un árbol con Lore/);
  const log = join(logDir, "desconocidos.log");
  assert.ok(existsSync(log));
  assert.ok(readFileSync(log, "utf8").includes(loose), "la constancia nombra la ruta");
});

// H12: el log de escrituras desconocidas se creaba con `mkdirSync(dir, { recursive: true })`
// sin modo ni comprobación de enlace, y las rutas se anexaban sin acotar: un directorio de log
// apuntando a un enlace escribía dentro del destino, y una ruta con tabulador o salto forjaba
// filas de log que nadie escribió.
test("H12: el log de lo desconocido no sigue un enlace y una sola ruta da una sola fila", () => {
  const base = mkdtempSync(join(tmpdir(), "lore-log-"));
  const victim = mkdtempSync(join(tmpdir(), "lore-victima-"));
  try {
    const dir = join(base, "log");
    annotate(base, "Write", [join(victim, "nota.md"), "con\ttabulador", "con\nsalto"], dir);
    const bytes = readFileSync(join(dir, "desconocidos.log"), "utf8");
    const filas = bytes.split("\n").filter(Boolean);
    assert.equal(filas.length, 3, `una ruta por fila, sin filas forzadas: ${JSON.stringify(filas)}`);
    for (const fila of filas) {
      assert.equal(fila.split("\t").length, 4, `una fila con un tabulador no forja otra: ${JSON.stringify(fila)}`);
      assert.ok(!fila.includes("con\tsalto") && !fila.includes("con\nsalto"));
    }
    assert.ok(bytes.includes("nota.md"), "la ruta se nombra entera en su fila");

    // Con el directorio de log apuntado a un enlace, no se escribe nada en el destino.
    const redirect = join(base, "enlace");
    symlinkSync(victim, redirect, "junction");
    annotate(base, "Write", [join(victim, "otro.md")], redirect);
    assert.equal(existsSync(join(victim, "desconocidos.log")), false,
      "un directorio de log que es un enlace no recibe el log");
  } finally { rmSync(base, { recursive: true, force: true }); rmSync(victim, { recursive: true, force: true }); }
});
