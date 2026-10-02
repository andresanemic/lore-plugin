#!/usr/bin/env node
// SessionStart + PreToolUse + PostToolUse + UserPromptSubmit hook — Lore Plugin.
//
// Codex adapter of the same guard. `SessionStart` records a silent per-session
// baseline and never evaluates Lore state; since 2.4.8 it adds one static check:
// when the cwd is a federated bot whose always-on block does not declare its
// load, it emits exactly one line, else zero bytes. `PostToolUse` evaluates
// only once the current Lore digest departs from that baseline — i.e. once THIS
// session has touched the Lore. A receipt that was already stale when the
// session opened stays silent until the first in-session Lore edit.
// Fails open on any error.
//
// `UserPromptSubmit` es otra cosa y no es la guardia: es el recordatorio por turno
// (R28). Pone delante, en cada turno y sin que la persona lo vea, el registro que esta
// en vigor y donde vive el estado. No evalua nada del Lore y no bloquea nunca.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  anotarDesconocidos,
  evaluateState,
  foreignWrites,
  formatIntervention,
  unknownWrites,
} from "./lore-guard.mjs";
import { inyeccion, nivel as nivelActivo, estadoDir } from "./lore-turno.mjs";
import {
  loreDeparted,
  nextTurn,
  readReceipt,
  readSessionBaseline,
  readSessionRoot,
  snapshot,
  writeReceipt,
  writeSessionBaseline,
  writeSessionRoot,
} from "./lore-state.mjs";

const event = process.argv[2];
const OK = () => process.exit(0);
let data;

try {
  const raw = readFileSync(0, "utf8");
  data = JSON.parse(raw || "{}");
} catch {
  OK();
}

if (!["session_start", "pre_tool_use", "post_tool_use", "user_prompt_submit"].includes(event)) OK();
if (event === "post_tool_use" && typeof data.turn_id !== "string") OK();

const root = typeof data.cwd === "string" && data.cwd ? data.cwd : process.cwd();
const sessionId = typeof data.session_id === "string" ? data.session_id : null;

// El recordatorio por turno (R28) corre antes que todo lo demás, y con el guard alrededor:
// la guardia solo tiene algo que decir cuando ESTA sesion toco el Lore, y esto se dice
// siempre. El payload de Codex trae `nivel`; Claude Code no lo trae nunca, asi que la
// perilla se lee del archivo y del entorno, y el campo es solo una via para probarla.
function recordatorioDe(turno) {
  try {
    const bruto = typeof data.nivel === "string" ? data.nivel : nivelActivo({ estadoDir: estadoDir() });
    return inyeccion({ raiz: root, turno, nivel: bruto });
  } catch {
    return { inyectar: false, texto: null };
  }
}

function emite(turno) {
  const r = recordatorioDe(turno);
  if (!r.inyectar || !r.texto) return;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: turno === null ? "SessionStart" : "UserPromptSubmit",
      additionalContext: r.texto,
    },
  }));
  OK();
}

// Un turno por peticion, y el numero sale de un contador por sesion. Un `turn_id`
// ausente o repetido no es una razon para callar: el recordatorio es un piso, y un piso
// que se salta porque falto un campo no es un piso.
// El recordatorio por turno (R28), y la razon por que NO esta en `hooks.json`.
//
// El evento existe y el guard lo contesta, porque es el canal que el host con forma
// Codex usa para hablar por turno. Lo que NO se hace es engancharlo a Claude Code, y la
// razon no es una preferencia: se midio. En Claude Code 2.1.284, sesion fresca con el
// plugin cargado y dos turnos, el `UserPromptSubmit` con `additionalContext` SI llega al
// modelo — y el modelo lo clasifica como instruccion de la persona y lo narra:
// "Contexto de tu hook: «Turno 2: hablo cercana…». Lo tomo como indicaciones tuyas."
// Eso es exactamente el defecto que 2.4.7 registro y por el que se retiro el adaptador,
// y en esta version sigue igual. Un recordatorio "que la persona no ve" del que el
// agente responde no es un recordatorio privado: es una frase mas en la conversacion.
//
// Lo que si es privado en Claude Code es la marca de la linea de estado, que no entra al
// contexto del modelo por construccion. Por eso R46 la puso ahi y no en la prosa.
if (event === "user_prompt_submit") {
  let turno = 1;
  try {
    turno = nextTurn(sessionId, root);
  } catch {
    /* sin tmp: el numero no avanza y el recordatorio sigue llegando */
  }
  emite(turno);
}


// Solo la primera vez: Claude Code re-dispara SessionStart al compactar/reanudar con el cwd ya
// derivado, y sobrescribir ahí re-anclaba la jurisdicción en ese cwd (ocurrió en uso real el
// 2026-09-25 y salió como NC-B-2, junto con el de la memoria de sesión).
if (event === "session_start" && !readSessionRoot(sessionId)) writeSessionRoot(sessionId, root);

if (event === "pre_tool_use") {
  // La jurisdicción es la raíz donde abrió la sesión; el cwd solo si no hay raíz registrada.
  const jurisdiction = readSessionRoot(sessionId) ?? root;
  // RC7: una escritura en otro árbol con Lore se anota y se avisa, y la decide el permiso
  // nativo del host (allow, ask o deny), que ya recoge lo que la persona concedió. Ni deny ni
  // ask: un segundo veto de Lore sobre una ruta que la persona ya concedió obligaba a un humano
  // a hacer de mensajero o paraba una operación legítima (NC del 2026-10-02).
  const foreign = foreignWrites(jurisdiction, data.tool_name, data.tool_input);
  if (foreign.length > 0) {
    anotarDesconocidos(jurisdiction, data.tool_name, foreign);
    process.stdout.write(JSON.stringify({
      systemMessage: `Lore Plugin: escritura en otro árbol con Lore, la decide el permiso de tu host y queda anotada: ${foreign.join(", ")}`,
    }));
    OK();
  }
  // R16: lo desconocido pasa con aviso y constancia; nunca se bloquea.
  const unknown = unknownWrites(jurisdiction, data.tool_name, data.tool_input);
  if (unknown.length > 0) {
    anotarDesconocidos(jurisdiction, data.tool_name, unknown);
    process.stdout.write(JSON.stringify({
      systemMessage: `Lore Plugin: escritura fuera de un árbol con Lore, permitida y anotada: ${unknown.join(", ")}`,
    }));
  }
  OK();
}

let current;

try {
  current = snapshot(root);
  if (current.fileCount === 0) OK();
} catch {
  OK();
}

// SessionStart: fix the silent baseline, bootstrap the receipt if missing, and
// never evaluate. Nobody checks whether something is broken in the first second
// of a session — that is exactly the entry noise this defers.
if (event === "session_start") {
  writeSessionBaseline(sessionId, root, current);
  try {
    if (readReceipt(root) === null) writeReceipt(root, current);
  } catch {
    /* read-only tree: fail open */
  }
  // Declaración federada, solo-en-rojo (2.4.8-rc.3): si el cwd es un bot federado
  // y su always-on no nombra los tres cuerpos, una línea y nada más. Verde = 0
  // bytes. No evalúa estado del Lore — solo la declaración escrita. Fail open.
  try {
    const line = federatedRedLine(root);
    if (line) process.stdout.write(line + "\n");
  } catch {
    /* fail open */
  }
  OK();
}

/** Una línea cuando un bot federado no declara la regla del triplete; null en otro caso.
 *  Mismo predicado que `mycelium federated` y que bots/scripts/verificar-triplete.mjs:
 *  la regla (palabra + marca de hermano), nunca cuerpos literales —un bot empaquetado
 *  legítimo no tiene canon/ y no debe sonar el rojo. */
function federatedRedLine(root) {
  const contract = ["CLAUDE.md", "AGENTS.md"].map((n) => join(root, n)).find((p) => existsSync(p));
  if (!contract || !existsSync(join(root, "lore", "enrutamiento.md"))) return null;
  const text = readFileSync(contract, "utf8");
  const block = (text.match(/<!-- lore:always-on -->([\s\S]*?)<!-- \/lore:always-on -->/) || [])[1] || "";
  const hasRule = /triplete/i.test(block)
    && /(hermano|no ancestro|no los inyecta|no lo inyecta)/i.test(block);
  if (hasRule) return null;
  return `Lore: el always-on no declara la regla del triplete — corre lore-plugin mycelium federated en este árbol o transmute-lore UPGRADE.`;
}

// PostToolUse: deferred arming. Without a baseline the first sight becomes it —
// never an intervention. Arming is on the CHANGE.
const baseline = readSessionBaseline(sessionId, root);
if (!baseline) {
  writeSessionBaseline(sessionId, root, current);
  OK();
}
if (!loreDeparted(baseline, current)) OK(); // this session has not touched the Lore

let recorded;
try {
  recorded = readReceipt(root);
} catch {
  OK();
}
if (recorded === null) {
  try {
    writeReceipt(root, current);
  } catch {
    /* read-only tree: fail open */
  }
  OK();
}

const result = evaluateState(current, recorded);
if (!result.pendingLore && !result.requiresApproval) {
  if (recorded.version === 1) {
    try {
      writeReceipt(root, current);
    } catch {
      /* read-only tree: fail open */
    }
  }
  OK();
}

const additionalContext = formatIntervention(result);
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext,
  },
}));
