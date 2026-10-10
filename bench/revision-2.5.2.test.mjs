// Pruebas de la superreview que dio origen a 2.5.2 (hallazgos 1, 2, 3 y 4 de
// hooks/, comprobados contra el código antes de arreglarlos).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { SESSION_DIR, readSessionBaseline } from "../hooks/lore-state.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const roots = [];
const mk = (p) => { const d = mkdtempSync(join(tmpdir(), p)); roots.push(d); return d; };
test.after(() => { for (const d of roots) rmSync(d, { recursive: true, force: true }); });

// Hallazgo 2: `UserPromptSubmit` no evalúa nada del Lore. Con el recordatorio apagado no hay nada
// que inyectar, y antes la ejecución seguía hasta el código de PostToolUse y armaba la línea base
// de la sesión desde un turno humano.
test("2.5.2 · UserPromptSubmit sin recordatorio termina sin armar la línea base de la sesión", () => {
  const own = mk("rev252-own-");
  mkdirSync(join(own, "lore"), { recursive: true });
  writeFileSync(join(own, "lore", "principios.md"), "# Propio\n");
  const sessionId = `rev252-${Date.now()}`;
  const out = execFileSync("node", [join(repo, "hooks", "codex-guard.mjs"), "user_prompt_submit"], {
    input: JSON.stringify({ cwd: own, hook_event_name: "UserPromptSubmit", session_id: sessionId, prompt: "hola" }),
    encoding: "utf8",
    env: { ...process.env, LORE_NIVEL: "off" },
  });
  assert.equal(out, "", "sin recordatorio no hay salida");
  assert.equal(readSessionBaseline(sessionId, own), null, "un turno humano no arma la línea base");
});

// Hallazgo 1: en OpenChamber el arreglo `pendiente` solo se escribía; los avisos no llegaban a nadie.
test("2.5.2 · OpenChamber entrega lo que encola en el hook de contexto", () => {
  const src = readFileSync(join(repo, "hooks", "openchamber-plugin.mjs"), "utf8");
  const ctx = src.slice(src.indexOf('ctx.session.hook("context"'), src.indexOf("// 4. Guardia"));
  assert.match(ctx, /pendiente\.shift\(\)/, "el hook de contexto vacía `pendiente`");
  assert.match(ctx, /output\.system\.push\(aviso\)/, "y lo entrega al sistema del modelo");
});

// Hallazgo 3: la puerta de cada turno mostraba una sola operación y callaba `also_open`.
test("2.5.2 · la puerta del turno nombra las operaciones abiertas además de la primera", () => {
  const src = readFileSync(join(repo, "hooks", "lore-turno.mjs"), "utf8");
  const puerta = src.slice(src.indexOf("function puertaDeOperacion"));
  assert.match(puerta, /entrada\.also_open/, "puertaDeOperacion usa also_open");
  assert.match(puerta, /tambien abiertas/, "y las nombra");
});

// Hallazgo 4: un aviso de PreToolUse en una escritura permitida se pinta en rojo en Claude Code móvil.
test("2.5.2 · PreToolUse no emite systemMessage en una escritura permitida fuera del árbol", () => {
  const src = readFileSync(join(repo, "hooks", "codex-guard.mjs"), "utf8");
  const pre = src.slice(src.indexOf("const foreign = foreignWrites"), src.indexOf("let current;"));
  assert.doesNotMatch(pre, /process.stdout.write/, "una escritura permitida no es un fallo: no se anuncia");
  assert.match(pre, /anotarDesconocidos/, "la constancia sigue en disco");
});

test("2.5.2 · la ayuda de operation no repite líneas", () => {
  const src = readFileSync(join(repo, "scripts", "operation-cli.mjs"), "utf8");
  assert.equal(src.split('"  trace      {events}').length - 1, 1);
  assert.equal(src.split('"  self-report {report|null}').length - 1, 1);
});
