#!/usr/bin/env node
// Stop hook — Lore Plugin.
// If the tree's Lore changed since the last recorded MYCELIUM sweep, block the stop
// once and route the pass. Claude Code only; Codex ignores this file. Fails open on
// any error — a hook must never break a session.
//
// Detection is by CONTENT of the Lore files, not by what the transcript shows and
// not by what the agent says it ran:
//
//   - tool names miss every write made with sed, a heredoc or a script, which is the
//     default working mode of this host;
//   - `git` is not a requirement of this kit, and Lore trees without it exist;
//   - a sentence naming the mode is not evidence that the mode ran.
//
// Contract: reads the Stop-hook JSON on stdin ({ cwd, stop_hook_active }).
// Emits {"decision":"block","reason":...} to force one more turn, or exits 0 silently.

import { readFileSync } from "node:fs";
import { evaluateState, formatIntervention } from "./lore-guard.mjs";
import { readReceipt, snapshot, writeReceipt } from "./lore-state.mjs";

const OK = () => process.exit(0);

let data = {};
try {
  data = JSON.parse(readAll() || "{}");
} catch {
  OK();
}

function readAll() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

// Already blocked once this stop — do not loop.
if (data.stop_hook_active) OK();

const root = typeof data.cwd === "string" && data.cwd ? data.cwd : process.cwd();

let state, recorded;
try {
  state = snapshot(root);
  if (state.fileCount === 0) OK(); // no Lore in this tree: nothing this hook governs
  recorded = readReceipt(root);
} catch {
  OK();
}

// Bootstrap: adopting the kit on an existing tree must not produce a standing block.
if (!recorded) {
  try {
    writeReceipt(root, state);
  } catch {
    /* read-only tree: fail open */
  }
  OK();
}

const result = evaluateState(state, recorded);
if (!result.pendingLore && !result.requiresApproval) {
  if (recorded.version === 1) {
    try {
      writeReceipt(root, state);
    } catch {
      /* read-only tree: fail open */
    }
  }
  OK();
}

process.stdout.write(JSON.stringify({
  decision: "block",
  reason: formatIntervention(result),
}));
process.exit(0);
