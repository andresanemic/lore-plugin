import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";

export function resolveCodexBin(platform = process.platform, env = process.env, exists = existsSync) {
  if (env.CODEX_BIN) return env.CODEX_BIN;
  if (platform === "win32" && env.APPDATA) {
    const npmBin = join(env.APPDATA, "npm", "codex.cmd");
    if (exists(npmBin)) return npmBin;
  }
  return "codex";
}

export function resolveCodexInvocation(platform = process.platform, env = process.env, exists = existsSync) {
  const bin = resolveCodexBin(platform, env, exists);
  if (platform !== "win32" || !env.APPDATA || env.CODEX_BIN) return { command: bin, prefix: [] };
  const cli = join(env.APPDATA, "npm", "node_modules", "@openai", "codex", "bin", "codex.js");
  return exists(cli) ? { command: process.execPath, prefix: [cli] } : { command: bin, prefix: [] };
}

export function resolveInstalledLoreRoot(version, env = process.env) {
  if (!env.USERPROFILE) throw new Error("No se pudo resolver USERPROFILE.");
  return join(env.USERPROFILE, ".codex", "plugins", "cache", "lore-plugin", "lore", version);
}

export function stageCodexWorkspace({ fixture, arm, suiteRoot, pluginRoot, version }) {
  if (!["cold", "lore"].includes(arm)) throw new Error(`Brazo inválido: ${arm}`);
  const root = mkdtempSync(join(suiteRoot, ".runtime-"));
  const workspace = join(root, basename(fixture));
  try {
    cpSync(fixture, workspace, { recursive: true });
    const dossier = join(dirname(fixture), "dossier.md");
    if (existsSync(dossier)) cpSync(dossier, join(root, "dossier.md"));
    if (arm === "lore") {
      const manifest = JSON.parse(readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
      if (manifest.version !== version) throw new Error(`Lore instalado ${manifest.version}; se requiere ${version}.`);
      const skills = join(workspace, ".agents", "skills");
      mkdirSync(dirname(skills), { recursive: true });
      cpSync(join(pluginRoot, "skills"), skills, { recursive: true });
    }
    return { root, workspace };
  } catch (error) {
    rmSync(root, { recursive: true, force: true });
    throw error;
  }
}

export function removeStagedWorkspace(root, suiteRoot) {
  const target = resolve(root);
  const parent = `${resolve(suiteRoot)}${sep}`;
  if (!target.startsWith(parent) || !basename(target).startsWith(".runtime-")) {
    throw new Error(`Limpieza insegura rechazada: ${target}`);
  }
  rmSync(target, { recursive: true, force: true });
}

export function buildCodexArgs({ arm, model, reasoningEffort }) {
  if (!["cold", "lore"].includes(arm)) throw new Error(`Brazo inválido: ${arm}`);
  return [
    "--ask-for-approval", "never",
    "--model", model,
    "-c", `model_reasoning_effort=\"${reasoningEffort}\"`,
    "exec", "--ephemeral", "--json",
    "--ignore-user-config", "--ignore-rules", "--sandbox", "read-only", "-",
  ];
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
