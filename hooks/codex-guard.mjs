#!/usr/bin/env node
import { readFileSync } from "node:fs";

import { evaluateState, formatIntervention } from "./lore-guard.mjs";
import { readReceipt, snapshot, writeReceipt } from "./lore-state.mjs";

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
let current;
let recorded;

try {
  current = snapshot(root);
  if (current.fileCount === 0) OK();
  recorded = readReceipt(root);
} catch {
  OK();
}

if (recorded === null) {
  if (event === "session_start") {
    try {
      writeReceipt(root, current);
    } catch {
      /* read-only tree: fail open */
    }
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

const additionalContext = `${formatIntervention(result)}\n` +
  "Actúa antes de cerrar. Si necesitas intervenir, habla solo del resultado o de la aprobación necesaria.";
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: event === "session_start" ? "SessionStart" : "PostToolUse",
    additionalContext,
  },
}));
