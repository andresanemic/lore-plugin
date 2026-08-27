#!/usr/bin/env node
// Harness del benchmark de Lore.
//
// Corre la misma tarea en dos brazos idénticos salvo por una cosa: si el `lore/`
// del área está o no está. La Pista Invariante que originó cada tarea ES la rúbrica:
// se verifica con regex, sin modelo juez.
//
//   node bench/run.mjs --selftest                    # el grader detecta lo que dice detectar
//   node bench/run.mjs --task animation-fouc -n 3    # piloto
//   node bench/run.mjs -n 3                          # corrida completa (12 x 2 x 3 = 72)
//
// Escribe bench/results/raw/<tarea>__<brazo>__t<n>.json y bench/results/results.csv.

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isRateLimit, shouldRun } from "./resume.mjs";
import { buildCodexArgs, parseCodexStream, removeStagedWorkspace, resolveCodexInvocation, resolveInstalledLoreRoot, sanitizeCommand, stageCodexWorkspace } from "./providers.mjs";
import { resolveSuite } from "./suite.mjs";
import { buildRepairPrompt, failedOriginal } from "./repair.mjs";
import { gradeTask, validateTaskGrader } from "./effect-2.3.2/grading.mjs";
import { assertFrozenExecution, selectRuns, writeJsonAtomic } from "./effect-2.3.2/protocol.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(name);
  return i === -1 ? def : argv[i + 1];
};
const SUITE = resolveSuite(HERE, flag("--suite", null));
const TASK_DATA = JSON.parse(readFileSync(join(SUITE.root, "tasks.json"), "utf8"));
const TASKS = TASK_DATA.tasks;
const GRADE_SCOPE = TASK_DATA._grade_scope ?? "code";
const ARMS = ["cold", "lore"];
const TIMEOUT_MS = 300_000;

// --- una corrida ------------------------------------------------------------
function runOne(task, arm, model, provider, reasoningEffort, repairPrompt = null) {
  return new Promise((resolve) => {
    const claudeArgs = [
      "-p",
      "--model", model,
      "--output-format", "stream-json",
      "--verbose",
      "--setting-sources", "project",   // sin las settings de usuario: ni hooks ni plugins ni skills
      "--strict-mcp-config",            // sin MCP heredado
      "--allowed-tools", "Read,Grep,Glob",
    ];
    const codexArgs = buildCodexArgs({ arm, model, reasoningEffort });
    const invocation = provider === "codex" ? resolveCodexInvocation() : { command: "claude", prefix: [] };
    const command = invocation.command;
    const args = [...invocation.prefix, ...(provider === "codex" ? codexArgs : claudeArgs)];
    const fixture = task.fixture
      ? join(SUITE.root, "fixtures", task.fixture, arm)
      : join(SUITE.root, "fixtures", arm);
    const runtime = provider === "codex" && TASK_DATA.execution?.plugin_version
      ? stageCodexWorkspace({
          fixture,
          arm,
          suiteRoot: SUITE.root,
          pluginRoot: resolveInstalledLoreRoot(TASK_DATA.execution.plugin_version),
          version: TASK_DATA.execution.plugin_version,
        })
      : null;
    const started = Date.now();
    const child = spawn(command, args, {
      cwd: runtime?.workspace ?? fixture,
      shell: false,
      windowsHide: true,
    });

    let out = "", err = "";
    const timer = setTimeout(() => child.kill(), TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    const taskPrompt = repairPrompt ?? task.prompt;
    const prompt = provider === "codex"
      ? `Antes de responder, lee CLAUDE.md completo y sigue su contrato.\n\n${taskPrompt}`
      : taskPrompt;
    child.stdin.end(prompt);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (runtime) removeStagedWorkspace(runtime.root, SUITE.root);
      resolve(provider === "codex"
        ? parseCodexStream(out, err, code, Date.now() - started)
        : parseStream(out, err, code));
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      if (runtime) removeStagedWorkspace(runtime.root, SUITE.root);
      resolve({ text: error.message, error: true, stderr: error.stack ?? error.message, read_lore: false, tool_calls: 0, cost_usd: null, input_tokens: 0, output_tokens: 0, cache_read: 0, duration_ms: Date.now() - started, num_turns: 0, tools: [] });
    });
  });
}

// El stream-json trae NDJSON: eventos de asistente (con los tool_use) y un `result` final
// del que salen gratis costo, tokens, duración y turnos.
function parseStream(out, err, code) {
  const events = out
    .split(/\r?\n/)
    .filter((l) => l.trim().startsWith("{"))
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);

  const result = events.findLast((e) => e.type === "result") ?? {};
  const tools = toolsOf(events);

  const u = result.usage ?? {};
  return {
    text: result.result ?? "",
    error: result.is_error === true || code !== 0 || !result.result,
    stderr: err.slice(-2000),
    read_lore: tools.some((t) => /lore[\\/]/i.test(t)),
    tool_calls: tools.length,
    cost_usd: result.total_cost_usd ?? 0,
    input_tokens: u.input_tokens ?? 0,
    output_tokens: u.output_tokens ?? 0,
    cache_read: u.cache_read_input_tokens ?? 0,
    duration_ms: result.duration_ms ?? 0,
    num_turns: result.num_turns ?? 0,
    tools,
  };
}

// Qué abrió el agente, en una línea por llamada. Es lo que hace auditable la corrida
// (¿leyó el lore o acertó de memoria?) sin guardar el transcript entero: los eventos
// completos pesan ~300 KB por corrida y no aportan nada que no esté acá o en `text`.
function toolsOf(events) {
  const out = [];
  for (const e of events) {
    for (const c of e?.message?.content ?? []) {
      if (c.type === "tool_use") out.push(`${c.name} ${JSON.stringify(c.input ?? {}).slice(0, 300)}`);
    }
  }
  return out;
}

// --- selftest ---------------------------------------------------------------
// Cada tarea trae un par: una respuesta que viola la Pista y una que la respeta.
// Si el grader no separa ese par, no está midiendo nada.
function selftest() {
  let failed = 0;
  for (const t of TASKS) {
    try { validateTaskGrader(t); }
    catch (error) { console.error(`FALLA: "${t.id}": ${error.message}`); failed++; }
  }
  if (failed) { console.error(`\n${failed} fallo(s) en el self-check del grader.`); process.exit(1); }
  console.log(`Self-check OK: ${TASKS.length} tareas tienen grader o rúbrica válida.`);
}

// --- salida -----------------------------------------------------------------
const providerArg = process.argv.indexOf("--provider");
const provider = providerArg === -1 ? "claude" : process.argv[providerArg + 1];
if (!["claude", "codex"].includes(provider)) {
  console.error(`Proveedor inválido: "${provider}". Usa claude o codex.`);
  process.exit(2);
}
const repair = argv.includes("--repair");
const BASE_RESULTS = provider === "claude"
  ? join(SUITE.root, "results")
  : join(SUITE.root, "results", provider);
const RESULTS = repair ? join(BASE_RESULTS, "repair") : BASE_RESULTS;
const RAW = join(RESULTS, "raw");
const CSV = join(RESULTS, "results.csv");
const HEAD = "task,arm,trial,verdict,read_lore,compliance_hits,violation_hits,cost_usd,input_tokens,output_tokens,cache_read,tool_calls,duration_ms,num_turns\n";

const csvRow = (r) => [
  r.task, r.arm, r.trial, r.verdict, r.read_lore,
  r.compliance.length, r.violation.length,
  r.cost_usd == null ? "" : Number(r.cost_usd).toFixed(6), r.input_tokens, r.output_tokens, r.cache_read,
  r.tool_calls, r.duration_ms, r.num_turns,
].join(",");

function summary(rows) {
  console.log("\n" + "=".repeat(64));
  for (const arm of ARMS) {
    const a = rows.filter((r) => r.arm === arm);
    if (!a.length) continue;
    const pass = a.filter((r) => r.verdict === "pass").length;
    const na = a.filter((r) => r.verdict === "n/a").length;
    const pending = a.filter((r) => r.verdict === "pending").length;
    const mean = (k) => a.reduce((s, r) => s + Number(r[k]), 0) / a.length;
    console.log(
      `${arm.padEnd(5)} ${pending === a.length ? `${pending} pendiente(s) de adjudicación` : `${pass}/${a.length} pistas respetadas`}` +
      (a.some((r) => r.cost_usd != null) ? `   $${mean("cost_usd").toFixed(4)}/tarea` : "") +
      `   ${mean("output_tokens").toFixed(0)} tok out` +
      `   ${(mean("duration_ms") / 1000).toFixed(0)}s` +
      (na ? `   (${na} n/a)` : "")
    );
  }
  const blind = rows.filter((r) => r.arm === "lore" && !r.read_lore).length;
  if (blind) console.log(`\nAviso: ${blind} corrida(s) del brazo lore nunca abrieron un archivo de lore/.`);
  console.log(`\n${CSV}`);
}

// --- main -------------------------------------------------------------------
if (argv.includes("--selftest")) { selftest(); process.exit(0); }

// Re-califica los transcripts guardados sin gastar un peso. Necesario cada vez que
// se afina una regex: el veredicto tiene que poder recalcularse sobre la misma evidencia.
function regradeSaved() {
  selftest();
  const files = readdirSync(RAW).filter((f) => f.endsWith(".json"));
  const rows = [];
  for (const f of files) {
    const r = JSON.parse(readFileSync(join(RAW, f), "utf8"));
    if (Array.isArray(r.tools)) r.tools = r.tools.map(sanitizeCommand);
    if (!r.error) r.stderr = "";
    const task = TASKS.find((t) => t.id === r.task);
    const g = r.error ? { verdict: "n/a", compliance: [], violation: [] } : gradeTask(task, r.text, GRADE_SCOPE);
    if (g.verdict !== r.verdict) console.log(`  ${r.verdict} → ${g.verdict}   ${f}`);
    if (r.events) { r.tools = toolsOf(r.events); delete r.events; }  // transcripts viejos
    writeFileSync(join(RAW, f), JSON.stringify({ ...r, ...g }, null, 2));
    rows.push({ ...r, ...g });
  }
  rows.sort((a, b) => a.task.localeCompare(b.task) || a.arm.localeCompare(b.arm) || a.trial - b.trial);
  writeFileSync(CSV, HEAD + rows.map(csvRow).join("\n") + "\n");
  summary(rows);
}

if (argv.includes("--regrade")) {
  regradeSaved();
  process.exit(0);
}

const only = flag("--task", null);
const trials = Number(flag("-n", flag("--trials", 3)));
const model = flag("--model", provider === "codex" ? "gpt-5.6-sol" : "sonnet");
const reasoningEffort = flag("--reasoning-effort", "medium");
const retryNa = argv.includes("--retry-na");
const waveFlag = flag("--wave", null);
const wave = waveFlag == null ? null : Number(waveFlag);
const tasks = only ? TASKS.filter((t) => t.id === only) : TASKS;
if (!tasks.length) { console.error(`No existe la tarea "${only}".`); process.exit(2); }

if (TASK_DATA.execution?.plugin_version) {
  const preflight = JSON.parse(readFileSync(join(SUITE.root, "preflight.json"), "utf8"));
  assertFrozenExecution({ execution: TASK_DATA.execution, model, reasoningEffort, trials, preflight });
}

selftest();

mkdirSync(RAW, { recursive: true });
if (!existsSync(CSV)) writeFileSync(CSV, HEAD);

const runs = selectRuns(tasks, trials, wave).filter(({ task, arm, trial }) => {
  const name = `${task.id}__${arm}__t${trial}.json`;
  if (repair) {
    const originalPath = join(BASE_RESULTS, "raw", name);
    if (!existsSync(originalPath)) return false;
    const original = JSON.parse(readFileSync(originalPath, "utf8"));
    return failedOriginal(original) && !existsSync(join(RAW, name));
  }
  return shouldRun(join(RAW, name), retryNa);
});
const total = runs.length;
let done = 0;
const rows = [];

for (const { task, arm, trial } of runs) {
      const t0 = Date.now();
      const name = `${task.id}__${arm}__t${trial}.json`;
      const original = repair
        ? JSON.parse(readFileSync(join(BASE_RESULTS, "raw", name), "utf8"))
        : null;
      const repairPrompt = original
        ? buildRepairPrompt(task, original.text, original.failed_criteria ?? [])
        : null;
      const r = await runOne(task, arm, model, provider, reasoningEffort, repairPrompt);
      const g = r.error
        ? { verdict: "n/a", compliance: [], violation: [], failed_criteria: [] }
        : gradeTask(task, r.text, GRADE_SCOPE);

      writeJsonAtomic(
        join(RAW, name),
        { task: task.id, arm, trial, attempt: repair ? 2 : 1, model, reasoning_effort: reasoningEffort, ...g, ...r },
      );

      if (isRateLimit(r.text)) {
        console.error(`Límite de uso detectado: ${r.text}`);
        regradeSaved();
        process.exit(3);
      }

      const row = { task: task.id, arm, trial, ...g, ...r };
      if (!retryNa) appendFileSync(CSV, csvRow(row) + "\n");
      rows.push(row);

      done++;
      const mark = g.verdict === "pass" ? "PASS" : g.verdict === "fail" ? "fail" : "n/a ";
      console.log(
        `[${String(done).padStart(3)}/${total}] ${mark}  ${arm.padEnd(4)} ${task.id.padEnd(28)}` +
        ` ${((Date.now() - t0) / 1000).toFixed(0)}s` +
        (r.cost_usd == null ? "" : `  $${r.cost_usd.toFixed(4)}`) +
        (arm === "lore" && !r.read_lore ? "  [no leyó el lore]" : "")
      );
}

if (retryNa) regradeSaved();
else summary(rows);
