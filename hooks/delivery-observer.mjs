#!/usr/bin/env node
// PreToolUse + PostToolUse de la herramienta de agentes (Agent/Task) — Lore Plugin.
//
// Observa, desde el host, que un encargo de Vespi cruzo el limite hacia un trabajador, y lo entrega cuando
// el coordinador lo pide por referencia. Dos formas de prompt le conciernen:
//
// - La referencia corta `@lore-task <operacion> <tarea> sha256:<huella>`. En PreToolUse el hook lee la
//   operacion en `<cwd>/FASES.md`, renderiza el encargo canonico y, solo si su huella es la referida,
//   reescribe la entrada de la herramienta con ese encargo (`updatedInput`). Asi el metodo cruza byte a byte
//   sin que el modelo lo copie: la prueba real del 2026-10-20 mostro que una copia de 10 KB pierde bytes.
// - El encargo ya renderizado (cabecera `# Task <t> of operation <id>` y bloque de metodo), que solo se
//   registra.
//
// Escribe una linea por evento en `<cwd>/.lore-deliveries.jsonl` con huellas, nunca con el contenido. Nunca
// decide el permiso de la herramienta (no devuelve `permissionDecision`), nunca bloquea y falla abierto.
//
// Limites, dichos aqui para que nadie los infiera de un verde: ve la intencion de lanzar (Pre) y la
// respuesta de la herramienta (Post), no la conducta del trabajador; un lanzamiento por Bash no pasa por
// aqui; y el registro lo puede escribir el mismo usuario del sistema operativo. `confirm-delivery` contrasta
// cada par con el transcript de la sesion y declara esa integridad como `same-os-user`.

import { closeSync, constants, lstatSync, openSync, readFileSync, writeSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

const AGENT_TOOLS = new Set(["Agent", "Task"]);
const TASK_HEADER = /^# Task (\S+) of operation (\S+)$/m;
const TASK_REFERENCE = /^@lore-task (\S+) (\S+) sha256:([0-9a-f]{64})$/;
const sha256 = (text) => createHash("sha256").update(text).digest("hex");
function appendLocal(path, text) {
  try { if (lstatSync(path).isSymbolicLink()) throw new Error("delivery log is a symbolic link"); }
  catch (error) { if (error?.code !== "ENOENT") throw error; }
  const fd = openSync(path, constants.O_WRONLY | constants.O_APPEND | constants.O_CREAT | (constants.O_NOFOLLOW ?? 0), 0o600);
  try { writeSync(fd, text); } finally { closeSync(fd); }
}

function excludeDeliveryLog(cwd) {
  try {
    const path = resolve(cwd, execFileSync("git", ["-C", cwd, "rev-parse", "--git-path", "info/exclude"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim());
    const entry = ".lore-deliveries.jsonl";
    let current = "";
    try { current = readFileSync(path, "utf8"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
    if (!current.split(/\r?\n/).includes(entry)) appendLocal(path, `${current && !current.endsWith("\n") ? "\n" : ""}${entry}\n`);
  } catch { /* no git repository or exclude unavailable: observation stays best-effort */ }
}

// La huella del metodo que trae la definicion del trabajador del kit que el host carga en esta sesion
// (`${CLAUDE_PLUGIN_ROOT}/agents/lore-worker.md`). null si no se puede leer.
function kitWorkerMethodSha() {
  const root = process.env.CLAUDE_PLUGIN_ROOT;
  if (!root) return null;
  let text;
  try { text = readFileSync(join(root, "agents", "lore-worker.md"), "utf8"); } catch { return null; }
  const start = text.indexOf("\n<<<METHOD\n");
  const end = text.lastIndexOf("\nMETHOD>>>\n");
  if (start < 0 || end <= start) return null;
  return sha256(text.slice(start + "\n<<<METHOD\n".length, end));
}

async function main() {
  const event = process.argv[2];
  if (event !== "pre" && event !== "post") return;
  const data = JSON.parse(readFileSync(0, "utf8") || "{}");
  if (!AGENT_TOOLS.has(data.tool_name)) return;
  const prompt = data.tool_input?.prompt;
  if (typeof prompt !== "string") return;
  const cwd = typeof data.cwd === "string" && data.cwd ? data.cwd : process.cwd();
  const base = {
    event,
    tool_use_id: typeof data.tool_use_id === "string" ? data.tool_use_id : null,
    session_id: typeof data.session_id === "string" ? data.session_id : null,
    transcript_path: typeof data.transcript_path === "string" ? data.transcript_path : null,
    tool_name: data.tool_name,
  };
  const post = event === "post"
    ? { agent_id: data.tool_response?.agentId ?? data.tool_response?.agent_id ?? null, response_sha256: sha256(JSON.stringify(data.tool_response ?? null)) }
    : {};
  const write = (line) => {
    excludeDeliveryLog(cwd);
    appendLocal(join(cwd, ".lore-deliveries.jsonl"), `${JSON.stringify({ ...line, at: new Date().toISOString() })}\n`);
  };

  const reference = prompt.trim().match(TASK_REFERENCE);
  if (reference) {
    const [, operation, task, referred] = reference;
    const line = { ...base, operation, task, prompt_sha256: referred, reference: true, ...post };
    if (event === "post") return write(line);
    let commission;
    try {
      const { readOperation } = await import("../skills/vespi/core/vespi.mjs");
      const { taskPrompt } = await import("../skills/vespi/core/coordinator.mjs");
      const artifact = await readOperation({ root: cwd, id: operation });
      commission = taskPrompt(artifact, task);
    } catch (error) {
      return write({ ...line, expanded: false, refused: `commission not found: ${error?.message ?? String(error)}` });
    }
    if (commission.prompt_sha256 === referred) {
      write({ ...line, route: "prompt", expanded: true });
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", updatedInput: { ...data.tool_input, prompt: commission.prompt } } }));
      return;
    }
    if (commission.commission_sha256 === referred) {
      // El encargo sin metodo solo va al trabajador de ESTE plugin, por su identidad completa
      // (`<nombre del manifiesto>:lore-worker`), y solo si su definicion trae el metodo fijado. El nombre
      // corto lo puede usar cualquier otro plugin (H1, revision de Codex del 2026-10-20).
      const requested = String(data.tool_input?.subagent_type ?? "");
      let expected = null;
      try {
        const { kitWorkerAgentType } = await import("../skills/vespi/core/task-method.mjs");
        expected = process.env.CLAUDE_PLUGIN_ROOT ? kitWorkerAgentType(process.env.CLAUDE_PLUGIN_ROOT) : null;
      } catch {
        expected = null;
      }
      if (expected === null || requested !== expected) {
        return write({ ...line, route: "kit-worker", expanded: false, worker_agent_type: requested, expected_agent_type: expected, refused: "a commission without its method goes only to this plugin's kit worker" });
      }
      const definitionMethod = kitWorkerMethodSha();
      if (definitionMethod !== commission.method_sha256) {
        return write({ ...line, route: "kit-worker", expanded: false, worker_agent_type: requested, definition_method_sha256: definitionMethod, refused: "the kit worker definition does not carry the pinned method" });
      }
      write({ ...line, route: "kit-worker", expanded: true, worker_agent_type: requested, definition_method_sha256: definitionMethod });
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", updatedInput: { ...data.tool_input, prompt: commission.commission } } }));
      return;
    }
    return write({ ...line, expanded: false, refused: "referenced fingerprint differs from the current commission" });
  }

  // Un encargo ya renderizado: con el metodo dentro (ruta `prompt`) o sin el, para el trabajador del kit
  // (ruta `kit-worker`). PostToolUse lo recibe asi cuando el PreToolUse expandio una referencia: el host le
  // pasa la entrada reescrita, no la que escribio el modelo (observado en la prueba real del 2026-10-20).
  const header = prompt.match(TASK_HEADER);
  if (!header) return;
  const route = prompt.includes("\n<<<METHOD\n") ? "prompt" : /\nMethod: delivered in the lore-worker agent definition \(sha256 [0-9a-f]{64}\)\.\n$/.test(prompt) ? "kit-worker" : null;
  if (route === null) return;
  write({ ...base, operation: header[2], task: header[1], prompt_sha256: sha256(prompt), route, ...post });
}

try {
  await main();
} catch {
  // Falla abierto: un observador que rompe la herramienta del host deja de ser observador.
}
process.exit(0);
