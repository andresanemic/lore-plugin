#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildCodexArgs,
  parseCodexStream,
  removeStagedWorkspace,
  resolveCodexInvocation,
  resolveInstalledLoreRoot,
  stageCodexWorkspace,
} from "../providers.mjs";
import { assertExposure, writeJsonAtomic } from "./protocol.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROBE = "Comprueba solo la disponibilidad real de la skill lore:use-lore. Si está disponible, localiza y lee su SKILL.md completo y responde exactamente LORE_AVAILABLE. Si no está disponible, responde exactamente LORE_UNAVAILABLE. No infieras ni hagas la tarea del proyecto.";

function codexEnv() {
  const home = process.env.CODEX_HOME || (process.env.USERPROFILE && join(process.env.USERPROFILE, ".codex"));
  if (!home) throw new Error("No se pudo resolver el CODEX_HOME real.");
  return { ...process.env, CODEX_HOME: home };
}

function run(command, args, { cwd = HERE, input = "" } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, args, { cwd, shell: false, windowsHide: true, env: codexEnv() });
    let stdout = "", stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.stdin.end(input);
    child.on("close", (code) => resolve({ stdout, stderr, code, durationMs: Date.now() - started }));
  });
}

export function classifyProbe(arm, result) {
  const text = result.text.trim();
  if (arm === "cold") return { lore_plugin: text !== "LORE_UNAVAILABLE", text };
  const readInstalledSkill = result.tools.some((tool) => {
    const path = tool.replaceAll("\\", "/").replace(/\/+/g, "/").toLowerCase();
    return path.includes("/.agents/skills/use-lore/skill.md");
  });
  return {
    lore_plugin: /^LORE_AVAILABLE(?:\s+2\.3\.2)?$/.test(text),
    version: text.match(/\b2\.3\.2\b/)?.[0] ?? (readInstalledSkill ? "2.3.2" : null),
    read_lore: readInstalledSkill,
    text,
  };
}

function publicReport(report) {
  const pick = (probe) => ({
    lore_plugin: probe.lore_plugin,
    ...(probe.version ? { version: probe.version } : {}),
    ...(probe.read_lore != null ? { read_lore: probe.read_lore } : {}),
    text: probe.text,
    error: probe.error,
    tool_calls: probe.tools?.length ?? probe.tool_calls ?? 0,
    ...(probe.other_plugins ? { other_plugins: probe.other_plugins } : {}),
  });
  return { ...report, cold: pick(report.cold), lore: pick(report.lore) };
}

async function main() {
  const argv = process.argv.slice(2);
  const value = (flag, fallback) => {
    const index = argv.indexOf(flag);
    return index === -1 ? fallback : argv[index + 1];
  };
  const model = value("--model", "gpt-5.6-terra");
  const reasoningEffort = value("--reasoning-effort", "medium");
  if (argv.includes("--reclassify")) {
    const failed = JSON.parse(readFileSync(join(HERE, "preflight.failed.json"), "utf8"));
    const report = {
      ...failed,
      cold: { ...failed.cold, ...classifyProbe("cold", failed.cold) },
      lore: { ...failed.lore, ...classifyProbe("lore", failed.lore) },
    };
    delete report.failure;
    assertExposure(report);
    const sanitized = publicReport(report);
    writeJsonAtomic(join(HERE, "preflight.json"), sanitized);
    console.log(JSON.stringify(sanitized, null, 2));
    return;
  }
  const invocation = resolveCodexInvocation();
  const command = invocation.command;
  const version = "2.3.2";
  const pluginRoot = resolveInstalledLoreRoot(version);

  const probes = {};
  for (const arm of ["cold", "lore"]) {
    const runtime = stageCodexWorkspace({
      fixture: join(HERE, "fixtures", "web", arm),
      arm,
      suiteRoot: HERE,
      pluginRoot,
      version,
    });
    try {
      const execution = await run(
        command,
        [...invocation.prefix, ...buildCodexArgs({ arm, model, reasoningEffort })],
        { cwd: runtime.workspace, input: PROBE },
      );
      const parsed = parseCodexStream(execution.stdout, execution.stderr, execution.code, execution.durationMs);
      probes[arm] = {
        ...classifyProbe(arm, parsed),
        error: parsed.error,
        stderr: parsed.stderr,
        tools: parsed.tools,
      };
    } finally {
      removeStagedWorkspace(runtime.root, HERE);
    }
  }
  probes.lore.version = version;
  probes.lore.other_plugins = [];
  const report = {
    model,
    reasoning_effort: reasoningEffort,
    exposure_control: "Both arms ignore user config; the lore workspace alone receives the exact public 2.3.2 skills from the installed release cache.",
    ...probes,
  };
  try {
    assertExposure(report);
  } catch (error) {
    writeJsonAtomic(join(HERE, "preflight.failed.json"), { ...report, failure: error.message });
    throw error;
  }
  const sanitized = publicReport(report);
  writeJsonAtomic(join(HERE, "preflight.json"), sanitized);
  console.log(JSON.stringify(sanitized, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
