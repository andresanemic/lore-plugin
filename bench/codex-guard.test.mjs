import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(repo, "hooks", "codex-guard.mjs");
const receipt = ".lore-mycelium";
const roots = [];

function tree(files = { "lore/principios.md": "# Principios\n" }) {
  const dir = mkdtempSync(join(tmpdir(), "codex-lore-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) write(dir, rel, body);
  return dir;
}

function write(dir, rel, body) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
}

function run(cwd, event, payload = {}) {
  const input = {
    cwd,
    hook_event_name: event === "session_start" ? "SessionStart" : "PostToolUse",
    session_id: "probe-session",
    transcript_path: join(cwd, "transcript.jsonl"),
    model: "probe-model",
    permission_mode: "never",
  };
  if (event === "post_tool_use") {
    Object.assign(input, {
      turn_id: "probe-turn",
      tool_name: "exec_command",
      tool_input: {},
      tool_response: {},
      tool_use_id: "probe-tool",
    });
  }
  Object.assign(input, payload);
  return execFileSync("node", [hook, event], {
    input: JSON.stringify(input), encoding: "utf8",
  });
}

function injected(stdout, event = "PostToolUse") {
  assert.notEqual(stdout.trim(), "");
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, event);
  return parsed.hookSpecificOutput.additionalContext;
}

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});

test("SessionStart establishes a silent baseline before the first tool", () => {
  const dir = tree();
  assert.equal(run(dir, "session_start"), "");
  assert.equal(existsSync(join(dir, receipt)), true);
  assert.equal(JSON.parse(readFileSync(join(dir, receipt), "utf8")).version, 2);
});

test("SessionStart is silent even when the receipt was already stale from before", () => {
  const dir = tree();
  writeFileSync(join(dir, receipt),
    `${JSON.stringify({ version: 2, digest: "0".repeat(64), alwaysOnBytes: 0 })}\n`);
  assert.equal(run(dir, "session_start"), "");
  // no evalúa en el arranque: no reescribe el recibo desfasado
  assert.equal(JSON.parse(readFileSync(join(dir, receipt), "utf8")).digest, "0".repeat(64));
});

test("a receipt stale from before the session stays silent until an in-session change", () => {
  const dir = tree();
  writeFileSync(join(dir, receipt),
    `${JSON.stringify({ version: 2, digest: "0".repeat(64), alwaysOnBytes: 0 })}\n`);
  run(dir, "session_start");
  assert.equal(run(dir, "post_tool_use"), "");
  write(dir, "lore/principios.md", "# Principios\n\n## Nueva\n");
  assert.match(injected(run(dir, "post_tool_use")), /cambios de criterio.*trabajo que deben guiar/i);
});

test("clean PostToolUse stays silent", () => {
  const dir = tree();
  run(dir, "session_start");
  assert.equal(run(dir, "post_tool_use"), "");
});

test("a Lore change injects one plain action before close", () => {
  const dir = tree();
  run(dir, "session_start");
  write(dir, "lore/principios.md", "# Principios\n\n## Nueva\n");
  const context = injected(run(dir, "post_tool_use"));
  assert.match(context, /Mensaje del hook, no del usuario/);
  assert.match(context, /no le informes al usuario que revisaste/i);
  assert.match(context, /cambios de criterio.*trabajo que deben guiar/i);
  assert.match(context, /conserva una sola parte: la respuesta que ya ibas a dar/i);
  assert.doesNotMatch(context, /MYCELIUM|save-to-lore|transmute-lore|receipt|junction/i);
});

test("an always-on expansion injects only the approval needed", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(9_000),
  });
  run(dir, "session_start");
  write(dir, "CLAUDE.md",
    "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n");
  const context = injected(run(dir, "post_tool_use"));
  assert.doesNotMatch(context, /trabajo que deben guiar/i);
  assert.match(context, /9,0 KB/);
  assert.match(context, /aprobación/i);
});

test("both pending conditions share one injection", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(29_855),
  });
  run(dir, "session_start");
  write(dir, "lore/criterio.md", "x".repeat(68_608));
  const stdout = run(dir, "post_tool_use");
  const context = injected(stdout);
  assert.equal(stdout.trim().split("\n").length, 1);
  assert.match(context, /cambios de criterio.*trabajo que deben guiar/i);
  assert.match(context, /29,9 KB.*68,6 KB.*130%/s);
});

test("phase state changes do not inject Lore work", () => {
  const dir = tree({
    "lore/principios.md": "# Principios\n",
    "FASES.md": "# Estado. NO es Lore.\n",
  });
  run(dir, "session_start");
  write(dir, "FASES.md", "# Estado. NO es Lore.\n\n- avance\n");
  assert.equal(run(dir, "post_tool_use"), "");
});

test("a Claude-shaped PostToolUse payload is ignored", () => {
  const dir = tree();
  run(dir, "session_start");
  write(dir, "lore/principios.md", "# Cambio\n");
  assert.equal(run(dir, "post_tool_use", { turn_id: undefined }), "");
});

test("invalid input fails open", () => {
  assert.equal(execFileSync("node", [hook, "post_tool_use"], {
    input: "{", encoding: "utf8",
  }), "");
});
