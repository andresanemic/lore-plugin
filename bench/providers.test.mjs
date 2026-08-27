import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { buildCodexArgs, parseCodexStream, removeStagedWorkspace, resolveCodexBin, resolveCodexInvocation, stageCodexWorkspace } from "./providers.mjs";

test("resuelve el codex.cmd global de npm en Windows", () => {
  const seen = [];
  const bin = resolveCodexBin("win32", { APPDATA: "C:\\Users\\ana\\AppData\\Roaming" }, (path) => {
    seen.push(path);
    return true;
  });
  assert.equal(bin, "C:\\Users\\ana\\AppData\\Roaming\\npm\\codex.cmd");
  assert.equal(seen.length, 1);
});

test("respeta CODEX_BIN y conserva codex como fallback", () => {
  assert.equal(resolveCodexBin("win32", { CODEX_BIN: "D:\\cli\\codex.cmd" }), "D:\\cli\\codex.cmd");
  assert.equal(resolveCodexBin("linux", {}), "codex");
});

test("parsea respuesta, uso y lecturas de lore del JSONL de Codex", () => {
  const stream = [
    { type: "item.completed", item: { type: "command_execution", command: "Get-Content lore/scroll.md" } },
    { type: "item.completed", item: { type: "agent_message", text: "respuesta final" } },
    { type: "turn.completed", usage: { input_tokens: 100, cached_input_tokens: 40, output_tokens: 20 } },
  ].map(JSON.stringify).join("\n");

  const result = parseCodexStream(stream, "", 0, 1234);
  assert.equal(result.text, "respuesta final");
  assert.equal(result.error, false);
  assert.equal(result.read_lore, true);
  assert.equal(result.tool_calls, 1);
  assert.equal(result.input_tokens, 100);
  assert.equal(result.cache_read, 40);
  assert.equal(result.output_tokens, 20);
  assert.equal(result.duration_ms, 1234);
});

test("marca como error un turno fallido de Codex", () => {
  const stream = JSON.stringify({ type: "turn.failed", error: { message: "rate limit" } });
  const result = parseCodexStream(stream, "detalle", 1, 50);
  assert.equal(result.error, true);
  assert.match(result.text, /rate limit/);
});

test("evita shell en Windows ejecutando el wrapper JS con Node", () => {
  const invocation = resolveCodexInvocation("win32", { APPDATA: "C:\\Users\\ana\\AppData\\Roaming" }, () => true);
  assert.equal(invocation.command, process.execPath);
  assert.deepEqual(invocation.prefix, ["C:\\Users\\ana\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js"]);
});

test("aísla cold de la configuración de usuario", () => {
  const args = buildCodexArgs({ arm: "cold", model: "gpt-5.6-terra", reasoningEffort: "medium" });
  assert.ok(args.includes("--ignore-user-config"));
  assert.ok(args.includes("--ignore-rules"));
  assert.ok(args.includes("read-only"));
});

test("aísla lore de la configuración de usuario", () => {
  const args = buildCodexArgs({ arm: "lore", model: "gpt-5.6-terra", reasoningEffort: "medium" });
  assert.ok(args.includes("--ignore-user-config"));
  assert.doesNotMatch(args.join("\n"), /plugins\./);
});

test("monta el release sólo en lore y limpia únicamente su runtime", () => {
  const sandbox = mkdtempSync(join(tmpdir(), "lore-stage-test-"));
  try {
    const suite = join(sandbox, "suite");
    const fixture = join(suite, "fixtures", "web", "lore");
    const plugin = join(sandbox, "plugin");
    mkdirSync(join(fixture, "lore"), { recursive: true });
    mkdirSync(join(plugin, ".codex-plugin"), { recursive: true });
    mkdirSync(join(plugin, "skills", "use-lore"), { recursive: true });
    writeFileSync(join(fixture, "CLAUDE.md"), "contract");
    writeFileSync(join(fixture, "lore", "index.md"), "index");
    writeFileSync(join(suite, "fixtures", "web", "dossier.md"), "facts");
    writeFileSync(join(plugin, ".codex-plugin", "plugin.json"), JSON.stringify({ version: "2.3.2" }));
    writeFileSync(join(plugin, "skills", "use-lore", "SKILL.md"), "skill");
    const staged = stageCodexWorkspace({ fixture, arm: "lore", suiteRoot: suite, pluginRoot: plugin, version: "2.3.2" });
    assert.equal(readFileSync(join(staged.workspace, ".agents", "skills", "use-lore", "SKILL.md"), "utf8"), "skill");
    assert.equal(readFileSync(join(staged.root, "dossier.md"), "utf8"), "facts");
    assert.equal(existsSync(join(staged.root, "cold")), false);
    removeStagedWorkspace(staged.root, suite);
    assert.equal(existsSync(staged.root), false);
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
