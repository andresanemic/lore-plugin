#!/usr/bin/env node
// SessionStart + PostToolUse hook — Lore Plugin (2.4.6, declaración federada 2.4.8).
//
// Codex adapter of the same guard. `SessionStart` records a silent per-session
// baseline and never evaluates Lore state; since 2.4.8 it adds one static check:
// when the cwd is a federated bot whose always-on block does not declare its
// load, it emits exactly one line, else zero bytes. `PostToolUse` evaluates
// only once the current Lore digest departs from that baseline — i.e. once THIS
// session has touched the Lore. A receipt that was already stale when the
// session opened stays silent until the first in-session Lore edit.
// Fails open on any error.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { evaluateState, formatIntervention } from "./lore-guard.mjs";
import {
  loreDeparted,
  readReceipt,
  readSessionBaseline,
  snapshot,
  writeReceipt,
  writeSessionBaseline,
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

if (!["session_start", "post_tool_use"].includes(event)) OK();
if (event === "post_tool_use" && typeof data.turn_id !== "string") OK();

const root = typeof data.cwd === "string" && data.cwd ? data.cwd : process.cwd();
const sessionId = typeof data.session_id === "string" ? data.session_id : null;
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

/** Una línea cuando un bot federado no declara su carga; null en otro caso. */
function federatedRedLine(root) {
  const contract = ["CLAUDE.md", "AGENTS.md"].map((n) => join(root, n)).find((p) => existsSync(p));
  if (!contract || !existsSync(join(root, "lore", "enrutamiento.md"))) return null;
  const text = readFileSync(contract, "utf8");
  const block = (text.match(/<!-- lore:always-on -->([\s\S]*?)<!-- \/lore:always-on -->/) || [])[1] || "";
  const missing = [];
  if (!/canon\//.test(block)) missing.push("canon/");
  if (!/enrutamiento\.md/.test(block)) missing.push("lore/enrutamiento.md");
  if (!/FASES\.md|PHASES\.md/.test(block)) missing.push("FASES.md");
  if (missing.length === 0) return null;
  return `Lore: el always-on no declara ${missing.join(", ")} — corre el verificador o transmute-lore UPGRADE.`;
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
