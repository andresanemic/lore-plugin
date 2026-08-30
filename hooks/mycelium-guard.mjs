#!/usr/bin/env node
// Stop hook — Lore Plugin.
// If Lore files were written this session and no MYCELIUM exit scan ran since the
// last such write, block the stop once and tell the agent to close the bracket.
// Claude Code only; Codex ignores this file. Fails open on any error — a hook
// must never break a session.
//
// Contract: reads the Stop-hook JSON on stdin ({ transcript_path, stop_hook_active }).
// Emits {"decision":"block","reason":...} to force one more turn, or exits 0 silently.

import { readFileSync } from "node:fs";

const OK = () => process.exit(0);

let input = "";
try {
  input = readFileSync(0, "utf8");
} catch {
  OK();
}

let data;
try {
  data = JSON.parse(input || "{}");
} catch {
  OK();
}

// Already blocked once this stop — do not loop.
if (data.stop_hook_active) OK();

const transcriptPath = data.transcript_path;
if (!transcriptPath) OK();

let lines;
try {
  lines = readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
} catch {
  OK();
}

// A Lore write: an Edit/Write/MultiEdit whose target path sits in a `lore/`
// directory, or is one of the distinctive Lore artifact filenames.
const LORE_DIR = /(^|[\/\\])lore[\/\\][^\/\\]+\.md$/i;
const LORE_FILE = /(^|[\/\\])(FASES|PHASES|principios|principles|identidad|identity|enrutamiento|routing)\.md$/i;
const isLoreWrite = (name, inp) => {
  if (!["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(name)) return false;
  const p = inp && (inp.file_path || inp.path || inp.notebook_path);
  if (!p || typeof p !== "string") return false;
  return LORE_DIR.test(p) || LORE_FILE.test(p);
};

// Evidence a MYCELIUM scan ran: the token appears in assistant text, or a
// skill/agent invocation names transmute-lore + mycelium.
const mentionsMycelium = (s) => typeof s === "string" && /MYCELIUM|mycelium|micelio/.test(s);

let lastLoreWriteIdx = -1;
let myceliumAfterIdx = -1;

lines.forEach((raw, i) => {
  let ev;
  try {
    ev = JSON.parse(raw);
  } catch {
    return;
  }
  const msg = ev.message || ev;
  const content = msg && msg.content;
  const blocks = Array.isArray(content) ? content : content ? [content] : [];

  for (const b of blocks) {
    if (!b || typeof b !== "object") {
      if (mentionsMycelium(b)) myceliumAfterIdx = i;
      continue;
    }
    if (b.type === "tool_use") {
      if (isLoreWrite(b.name, b.input)) lastLoreWriteIdx = i;
      if (b.name === "Skill" && mentionsMycelium(JSON.stringify(b.input || {}))) myceliumAfterIdx = i;
      if ((b.name === "Task" || b.name === "Agent") && mentionsMycelium(JSON.stringify(b.input || {}))) myceliumAfterIdx = i;
    }
    if (b.type === "text" && mentionsMycelium(b.text)) myceliumAfterIdx = i;
  }
});

if (lastLoreWriteIdx === -1) OK();
if (myceliumAfterIdx > lastLoreWriteIdx) OK();

const reason =
  "Lore files were edited this session and no MYCELIUM exit scan has run since the last edit. " +
  "Before finishing: run `transmute-lore` in MYCELIUM mode over what changed, then write each " +
  "finding as a two-sided junction or decline it in writing with its reason. This is the exit " +
  "bracket from save-to-lore / transmute-lore — the pass is not done until it closes. " +
  "If MYCELIUM already ran, or these edits are not Lore criteria (kit source, a docs-site index), " +
  "say which and stop.";

process.stdout.write(JSON.stringify({ decision: "block", reason }));
process.exit(0);
