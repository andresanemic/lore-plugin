import { existsSync } from "node:fs";
import { join } from "node:path";

export function resolveCodexBin(platform = process.platform, env = process.env, exists = existsSync) {
  if (env.CODEX_BIN) return env.CODEX_BIN;
  if (platform === "win32" && env.APPDATA) {
    const npmBin = join(env.APPDATA, "npm", "codex.cmd");
    if (exists(npmBin)) return npmBin;
  }
  return "codex";
}

export function parseCodexStream(out, err, code, durationMs) {
  const events = out
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("{"))
    .map((line) => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);
  const messages = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item.text)
    .filter(Boolean);
  const failed = events.findLast((event) => event.type === "turn.failed");
  const completed = events.findLast((event) => event.type === "turn.completed");
  const tools = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "command_execution")
    .map((event) => event.item.command ?? "");
  const usage = completed?.usage ?? {};
  const text = messages.at(-1) ?? failed?.error?.message ?? "";

  return {
    text,
    error: code !== 0 || Boolean(failed) || !text,
    stderr: err.slice(-2000),
    read_lore: tools.some((tool) => /lore[\\/]/i.test(tool)),
    tool_calls: tools.length,
    cost_usd: null,
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    cache_read: usage.cached_input_tokens ?? 0,
    duration_ms: durationMs,
    num_turns: events.filter((event) => event.type === "turn.completed").length,
    tools,
  };
}
