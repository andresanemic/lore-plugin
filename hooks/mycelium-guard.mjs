#!/usr/bin/env node
// UserPromptSubmit hook — Lore Plugin (2.4.6).
//
// If the tree's Lore changed DURING this session and the change has not been
// swept into `.lore-mycelium`, inject one plain action via
// `hookSpecificOutput.additionalContext`. Claude Code injects that field silently
// at prompt time — the agent sees it, the user does not see a hook block or an
// extra thinking loop. The 2.4.5 `Stop` path used the same field on the `Stop`
// event, where Claude Code surfaces it as a visible `<system-reminder>`; moving
// the check to `UserPromptSubmit` is what makes it imperceptible.
//
// Two things changed from 2.4.5:
//   1. Event: `Stop` -> `UserPromptSubmit` (silent injection).
//   2. Deferred arming: the guard does NOT evaluate against the receipt on
//      session entry. `SessionStart` records a silent per-session baseline; this
//      hook only evaluates once the current Lore digest departs from that
//      baseline, i.e. once THIS session has touched the Lore. A receipt that was
//      already stale when the session opened stays silent until the first
//      in-session Lore edit. The guard witnesses in-session change, not the
//      receipt's historical debt.
//
// Detection is by CONTENT of the Lore files, not by what the transcript shows and
// not by what the agent says it ran:
//
//   - tool names miss every write made with sed, a heredoc or a script, which is the
//     default working mode of this host;
//   - `git` is not a requirement of this kit, and Lore trees without it exist;
//   - a sentence naming the mode is not evidence that the mode ran.
//
// Contract: reads the UserPromptSubmit JSON on stdin ({ cwd, session_id }).
// Emits {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":...}}
// to inject silently, or exits 0 silently. Fails open on any error — a hook must
// never break a session.

import { readFileSync } from "node:fs";
import { evaluateState, formatIntervention } from "./lore-guard.mjs";
import {
  loreDeparted,
  readReceipt,
  readSessionBaseline,
  snapshot,
  writeReceipt,
  writeSessionBaseline,
} from "./lore-state.mjs";

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

const root = typeof data.cwd === "string" && data.cwd ? data.cwd : process.cwd();
const sessionId = typeof data.session_id === "string" ? data.session_id : null;

let state, recorded;
try {
  state = snapshot(root);
  if (state.fileCount === 0) OK(); // no Lore in this tree: nothing this hook governs
} catch {
  OK();
}

// Deferred arming. Without a session baseline (SessionStart hook did not run, or
// the tmp dir is unavailable) the first sight of the tree becomes the baseline
// and bootstraps the receipt if missing — never an intervention. Arming is on the
// CHANGE, not on the first observation.
const baseline = readSessionBaseline(sessionId, root);
if (!baseline) {
  writeSessionBaseline(sessionId, root, state);
  try {
    if (readReceipt(root) === null) writeReceipt(root, state);
  } catch {
    /* read-only tree: fail open */
  }
  OK();
}
if (!loreDeparted(baseline, state)) OK(); // this session has not touched the Lore

// The Lore changed within this session. Now — and only now — the receipt matters.
try {
  recorded = readReceipt(root);
} catch {
  OK();
}
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
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: formatIntervention(result),
  },
}));
process.exit(0);
