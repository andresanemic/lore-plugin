// RED — Fase 1 de specs/008-guardia-mycelium.
//
// Estos dos escenarios DEBEN FALLAR contra 2.4.1. Documentan los dos agujeros del
// Stop hook, y por eso viven fuera del glob de `npm test` (`bench/*.test.mjs`): la
// suite de main se queda verde y el rojo se corre a mano.
//
//   node --test bench/exit-mycelium-2.4.2/red.mjs
//
// La Fase 2 los promueve a `bench/mycelium-guard.test.mjs` cuando pasen. Si alguno
// pasa HOY, el spec 008 está mal diagnosticado y se detiene ahí.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const hook = join(root, "hooks", "mycelium-guard.mjs");
const tmp = mkdtempSync(join(tmpdir(), "mycelium-red-"));

function run(events) {
  const transcriptPath = join(tmp, `t-${Math.random().toString(36).slice(2)}.jsonl`);
  writeFileSync(transcriptPath, events.map((e) => JSON.stringify(e)).join("\n"));
  const stdin = JSON.stringify({ transcript_path: transcriptPath, stop_hook_active: false });
  try {
    return { stdout: execFileSync("node", [hook], { input: stdin, encoding: "utf8" }), status: 0 };
  } catch (err) {
    return { stdout: err.stdout ?? "", status: err.status ?? 1 };
  }
}

const assistant = (...blocks) => ({ type: "assistant", message: { role: "assistant", content: blocks } });
const say = (text) => ({ type: "text", text });
const bash = (command) => ({ type: "tool_use", name: "Bash", input: { command } });
const edit = (file_path) => ({ type: "tool_use", name: "Edit", input: { file_path } });

// ---------------------------------------------------------------------------
// R1 — la escritura por script es invisible para el guard.
//
// `mycelium-guard.mjs:47` solo cuenta Edit/Write/MultiEdit/NotebookEdit. Una pasada
// que escribe Lore con `sed`, un heredoc o un script de python deja lastLoreWriteIdx
// en -1 y el guard sale en silencio en la línea 85.
//
// No es un caso de borde: el prompt de sesión de Claude Code instruye textualmente
// «make file changes with sed, heredocs, or short scripts, rather than using the
// dedicated Read, Edit, or Write tools». La garantía es ciega donde el entorno empuja.
// ---------------------------------------------------------------------------

test("R1 · bloquea cuando el Lore se escribió por Bash y no corrió MYCELIUM", () => {
  const { stdout, status } = run([
    assistant(
      say("guardo la Pista"),
      bash("python - <<'EOF'\nimport io\np='C:/proj/lore/principios.md'\ns=io.open(p,encoding='utf-8').read()\nio.open(p,'w',encoding='utf-8').write(s + '\\n## Pista nueva\\n')\nEOF"),
    ),
    assistant(say("listo, quedó escrita")),
  ]);
  assert.equal(status, 0);
  assert.notEqual(stdout.trim(), "", "el guard no vio la escritura de Lore hecha por Bash");
  assert.equal(JSON.parse(stdout).decision, "block");
});

test("R1b · también con sed y con un heredoc directo sobre un archivo de lore/", () => {
  for (const cmd of [
    "sed -i 's/vieja/nueva/' C:/proj/lore/identidad.md",
    "cat > C:/proj/lore/enrutamiento.md <<'EOF'\n# Enrutamiento\nEOF",
    "head -n 40 FASES.md > /tmp/f && cat nuevo.md >> /tmp/f && mv /tmp/f FASES.md",
  ]) {
    const { stdout } = run([assistant(bash(cmd)), assistant(say("hecho"))]);
    assert.notEqual(stdout.trim(), "", `el guard no vio: ${cmd.slice(0, 40)}`);
  }
});

// ---------------------------------------------------------------------------
// R2 — nombrar el modo cuenta como haberlo corrido.
//
// `mycelium-guard.mjs:55` define la evidencia de que el barrido corrió como una
// expresión regular sobre CUALQUIER bloque de texto del asistente (línea 81). No
// distingue «lo corrí» de «no lo corrí»: las dos frases contienen la palabra.
//
// El caso de abajo no es hipotético. Es la transcripción del incidente que motivó
// la 2.4.1, registrado en andamiaje/lore-plugin/FASES.md: `save-to-lore` escribió un
// módulo, declaró que conectar la junta era «una pasada futura de transmute-lore» y
// paró. El hook que se publicó para cerrar ese incidente no lo detiene.
// ---------------------------------------------------------------------------

test("R2 · bloquea aunque el agente NOMBRE el modo diciendo que no lo corrió", () => {
  const { stdout, status } = run([
    assistant(edit("C:/proj/lore/principios.md")),
    assistant(say("Módulo escrito. Todavía no corrí MYCELIUM: conectar la junta queda para una pasada futura de transmute-lore.")),
  ]);
  assert.equal(status, 0);
  assert.notEqual(stdout.trim(), "", "el guard aceptó la palabra como si fuera el hecho");
  assert.equal(JSON.parse(stdout).decision, "block");
});

test("R2b · y aunque el modo solo se mencione hablando de otra cosa", () => {
  const { stdout } = run([
    assistant(edit("C:/proj/lore/index.md")),
    assistant(say("Nota: el modo MYCELIUM del kit corre en silencio y tiene tres disparadores. Mañana lo miramos.")),
  ]);
  assert.notEqual(stdout.trim(), "", "una mención de pasada cerró el bracket");
});
