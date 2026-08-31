import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { performance } from "node:perf_hooks";

const started = performance.now();
const event = process.argv[2];
const raw = readFileSync(0, "utf8");
const payload = raw.trim() ? JSON.parse(raw) : {};
const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
const modeFile = join(cwd, ".lore-hook-probe-mode");
let modes = {};

try {
  modes = JSON.parse(readFileSync(modeFile, "utf8"));
} catch {}

const outputs = {
  observe: "",
  block: JSON.stringify({ decision: "block", reason: "CODEX_HOOK_PROBE_BLOCK" }),
  inject: JSON.stringify({
    hookSpecificOutput: {
      hookEventName: {
        session_start: "SessionStart",
        session_end: "SessionEnd",
        post_tool_use: "PostToolUse",
      }[event],
      additionalContext: "CODEX_HOOK_PROBE_INJECT",
    },
  }),
};
const elapsedMs = performance.now() - started;

appendFileSync(
  join(cwd, ".lore-hook-probe.jsonl"),
  `${JSON.stringify({
    event,
    at: new Date().toISOString(),
    cwd,
    keys: Object.keys(payload).sort(),
    elapsedMs,
  })}\n`,
);
process.stdout.write(outputs[modes[event] ?? "observe"] ?? "");
