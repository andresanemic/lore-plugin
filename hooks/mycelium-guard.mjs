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
import { digest, loreFiles, readReceipt, writeReceipt, RECEIPT } from "./lore-state.mjs";

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

let current, recorded, files;
try {
  files = loreFiles(root);
  if (files.length === 0) OK(); // no Lore in this tree: nothing this hook governs
  current = digest(root);
  recorded = readReceipt(root);
} catch {
  OK();
}

// Bootstrap: adopting the kit on an existing tree must not produce a standing block.
if (!recorded) {
  try {
    writeReceipt(root, current);
  } catch {
    /* read-only tree: fail open */
  }
  OK();
}

if (recorded === current) OK();

const reason =
  `Lore changed in this tree since the last recorded MYCELIUM sweep (${files.length} Lore file(s) tracked). ` +
  "The pass is not finished. Two things close it, in order. " +
  "First, route the writing: criteria written by hand is what `save-to-lore` — or the matching write mode " +
  "of `transmute-lore` — exists to replace, so if this criteria was hand-edited, say so and route it. " +
  "Second, run `transmute-lore` in MYCELIUM mode over what changed, write each finding as a two-sided " +
  "junction or decline it in writing with its reason, and then record the sweep with " +
  "`npx lore-plugin mycelium receipt` so this bracket can close. " +
  `If these edits are not Lore criteria, say which and stop — the receipt lives at ./${RECEIPT}.`;

process.stdout.write(JSON.stringify({ decision: "block", reason }));
process.exit(0);
