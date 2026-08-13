import assert from "node:assert/strict";
import test from "node:test";

import { parseCodexStream, resolveCodexBin } from "./providers.mjs";

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
