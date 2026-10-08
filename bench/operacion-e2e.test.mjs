import { proofAt } from "./verification-fixture.mjs";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { saveOperationState } from "../skills/vespi/core/operation-state.mjs";
import { proposeHandoff } from "../skills/vespi/core/vespi.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(REPO, "scripts", "lore-plugin.mjs");
const HOME_TEST = "C:/Users/andre/AppData/Local/Temp/claude/C--Claude-bots-proyectos-bot-lus-lore/cb64e85b-ef54-40fb-b1ef-58412e18e892/scratchpad/jobs/home-prueba-e2e";
const ENV = { ...process.env, HOME: HOME_TEST, USERPROFILE: HOME_TEST, TEMP: HOME_TEST, TMP: HOME_TEST };
const json = (value) => JSON.stringify(value);
const later = () => new Date(Date.now() + 60_000).toISOString();

function command(args) {
  const result = spawnSync(process.execPath, [CLI, "operation", ...args], { encoding: "utf8", env: ENV });
  const line = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  let body = null;
  try { body = line ? JSON.parse(line) : null; } catch {}
  return { code: result.status, out: result.stdout, err: result.stderr, body };
}

function call(args) {
  const result = command(args);
  assert.equal(result.code, 0, `${args[0]}: ${result.err} ${result.out}`);
  assert.equal(result.body?.ok, true, `${args[0]} returned no successful JSON result`);
  return result.body;
}

function opArgs(action, root, id, extra = []) {
  return [action, "--root", root, "--id", id, ...extra];
}

const tasks = [
  { role: "worker", question: "Implementa la comprobación acotada", scope: "solo el fixture", done_criterion: "archivo de evidencia presente", proof: "releer archivo", output: "worker.md" },
  { role: "daimon", question: "Contrasta evidencia y límites", sources: ["fixture:fuente"], output: "daimon.md" },
  { role: "advisor", question: "¿La evidencia responde el propósito?", context: "hoja y evidencia del fixture", output: "advisor.md" },
];

// This root intentionally has no owner criterion: only state, byte checks and recovery are covered.
test("flujo mecánico sin criterio propietario conserva FASES, compactación y propuesta", async (t) => {
  mkdirSync(HOME_TEST, { recursive: true });
  const root = mkdtempSync(join(HOME_TEST, "operacion-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const fasesPath = join(root, "FASES.md");
  writeFileSync(fasesPath, [
    "# Fases del fixture", "", "## Operaciones", "", "### Hoja: cotejo ficticio",
    "- Propósito: decidir si el artefacto de prueba cumple el criterio.",
    "- Roles: worker implementa, daimon coteja fuente y límites, advisor responde una pregunta acotada.",
    "- Evidencia de cierre: los tres artefactos leídos y cotejados; incertidumbre residual declarada.",
    "- Verifica: coordinador, con observación directa distinta de los ejecutores.", "",
  ].join("\n"));

  const held = call(["hold", "--root", root, "--json", json({
    goal: "Cotejar un artefacto ficticio contra su criterio", owner: "coordinador",
    authority: { spend: [], granted_by: "persona", scope: "solo fixture", valid: true },
    scope: "Cotejo local del fixture", expected_effect: { kind: "none" }, done: "Entrega cotejada con evidencia", roles: ["daimon", "advisor", "worker", "verifier"], verifier: "coordinador",
  })]);
  const id = held.id;
  let disk = readFileSync(fasesPath, "utf8");
  assert.match(disk, /## Operaciones[\s\S]*Propósito:[\s\S]*Roles:[\s\S]*Evidencia de cierre:[\s\S]*Verifica:/);
  assert.match(disk, new RegExp(`<!-- vespi:operacion ${id} -->`));
  assert.equal(held.state, "prepared");

  call(opArgs("authorize", root, id, ["--json", json({ by: "persona", words: "Autoriza solo este cotejo local, sin efectos externos" })]));
  for (const task of tasks) {
    task.outputPath = join(root, task.output);
    const planned = call(opArgs("plan", root, id, ["--json", json({
      ...task, output: { path: task.outputPath }, timeoutMs: 120_000, nextCheckAt: later(),
    })]));
    assert.equal(planned.taskRecord.role, task.role);
    assert.equal(planned.taskRecord.state, "proposed");
    assert.ok(planned.taskRecord.timeoutMs > 0);
    assert.ok(Date.parse(planned.taskRecord.nextCheckAt));
  }
  let artifact = JSON.parse(readFileSync(fasesPath, "utf8").match(/```json\s*([\s\S]*?)\s*```/)[1]);
  assert.equal(artifact.tasks.length, 3);

  const routeTools = { worker: "delegate", daimon: "execute", advisor: "decide" };
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const dispatched = call(opArgs("dispatch", root, id, ["--task", `t${i + 1}`, "--tools", routeTools[task.role], "--json", json({ hostName: "fixture-host", model: `${task.role}-model`, effort: "low" })]));
    assert.equal(dispatched.task.state, "blocked", "declarar no ejecuta: la tarea queda bloqueada");
    assert.equal(dispatched.task.executor, null, "no hay ejecutor inventado");
    assert.equal(dispatched.task.declared_route.executed, false);
    const observed = call(opArgs("observe", root, id, ["--task", `t${i + 1}`, "--json", json({ text: `${task.role} responde`, alive: true })]));
    assert.equal(observed.task.observations.at(-1).alive, true);
  }
  for (let n = 1; n <= 3; n++) {
    const failure = call(opArgs("observe", root, id, ["--task", "t1", "--json", json({
      signature: "same fixture failure 42", text: `fallo repetido ${n}`, at: new Date(Date.now() + n).toISOString(),
    })]));
    if (n === 3) assert.equal(failure.wall.instruction, "stop_and_search");
  }
  const wall = call(opArgs("status", root, id));
  assert.equal(wall.wall.instruction, "stop_and_search");
  assert.equal(wall.wall.attempts.length, 3);

  writeFileSync(tasks[0].outputPath, "criterio observado: sí\nfuente: fixture\nriesgo: límite local\n");
  // t1 quedó bloqueada (declarada, no ejecutada): receive con root la marca received
  const rc1 = call(opArgs("receive", root, id, ["--task", "t1"]));
  assert.equal(rc1.task.state, "received", "receive con root acepta la entrega dentro del proyecto");
  assert.equal(call(opArgs("review", root, id, ["--task", "t1", "--json", json({ verdict: "accepted", reviewer: "advisor", advisorRoute: { available: true, tool: "decide", observedBy: "coordinador" }, checked: ["scope", "sources", "risks"], notes: "evidencia local releída" })])).task.state, "reviewed");
  artifact = JSON.parse(readFileSync(fasesPath, "utf8").match(/```json\s*([\s\S]*?)\s*```/)[1]);
  const executor = artifact.tasks[0].executor?.by ?? artifact.tasks[0].declared_route?.by ?? "unknown";
  const selfVerify = command(opArgs("verify", root, id, ["--task", "t1", "--json", json({ verifier: executor, observed: true, evidence: "observación" })]));
  assert.equal(selfVerify.code, 1);
  assert.match(selfVerify.body.error, /independent/);
  const unseen = command(opArgs("verify", root, id, ["--task", "t1", "--json", json({ verifier: "coordinador", observed: false, evidence: "no observado" })]));
  assert.equal(unseen.code, 1);
  assert.match(unseen.body.error, /proof_runner|adapter|commission/i);
  proofAt(root, id);
  assert.equal(call(opArgs("verify", root, id, ["--task", "t1", "--json", json({ verifier: "coordinador" })])).task.state, "verified");
  assert.equal(call(opArgs("integrate", root, id, ["--task", "t1", "--json", json({ destination: "fixture/revisado.md" })])).task.state, "integrated");

  // Simula el registro de una incertidumbre material que ya existe antes de la pausa.
  artifact = JSON.parse(readFileSync(fasesPath, "utf8").match(/```json\s*([\s\S]*?)\s*```/)[1]);
  const pendingEffect = { id: "fx-1", status: "unknown", reconciliation: "required", detail: "el fixture no confirma si recibió la escritura" };
  await saveOperationState(root, { ...artifact, effects: [...artifact.effects, pendingEffect], uncertainty: [...artifact.uncertainty, "fx-1 requiere reconciliación"] });
  const paused = command(opArgs("pause", root, id, ["--json", json({ note: "checkpoint antes de reanudar" })]));
  assert.equal(paused.code, 0, paused.err || paused.body?.error);
  assert.equal(paused.body.state, "paused");
  artifact = JSON.parse(readFileSync(fasesPath, "utf8").match(/```json\s*([\s\S]*?)\s*```/)[1]);
  assert.equal(artifact.authority.scope, "solo fixture");
  assert.equal(artifact.tasks[0].observations.filter((item) => item.signature).length, 3);
  assert.deepEqual(artifact.effects.at(-1), pendingEffect);
  assert.ok(artifact.uncertainty.includes("fx-1 requiere reconciliación"));

  const sessionId = `e2e-${process.pid}-${Date.now()}`;
  const hook = spawnSync(process.execPath, [join(REPO, "hooks", "codex-guard.mjs"), "pre_compact"], {
    encoding: "utf8", env: ENV, input: json({ cwd: root, session_id: sessionId, trigger: "auto" }),
  });
  assert.equal(hook.status, 0);
  assert.equal(hook.stdout, "", "pre_compact debe ser silencioso");
  const markPath = join(HOME_TEST, "lore-plugin-sessions", `compactacion-${sessionId}.json`);
  assert.equal(existsSync(markPath), true, "la marca silenciosa debe quedar en disco");
  const mark = JSON.parse(readFileSync(markPath, "utf8"));
  assert.equal(mark.raiz, root);
  assert.deepEqual(mark.triplete, ["FASES.md"]);
  rmSync(markPath, { force: true });

  const resumed = call(opArgs("resume", root, id));
  assert.equal(resumed.allowed, true);
  assert.equal(resumed.state, "running");
  artifact = JSON.parse(readFileSync(fasesPath, "utf8").match(/```json\s*([\s\S]*?)\s*```/)[1]);
  assert.equal(artifact.state, "running");
  assert.equal(artifact.authority.scope, "solo fixture");
  assert.equal(artifact.tasks[0].observations.filter((item) => item.signature).length, 3);
  assert.deepEqual(artifact.effects.at(-1), pendingEffect);
  assert.ok(artifact.uncertainty.includes("fx-1 requiere reconciliación"));

  for (const [index, task] of tasks.slice(1).entries()) {
    const taskId = `t${index + 2}`;
    writeFileSync(task.outputPath, `${task.role}: evidencia y límites del fixture\n`);
    // Recibir una entrega externa no inventa su ejecución; sí permite cotejarla.
    assert.equal(call(opArgs("receive", root, id, ["--task", taskId])).task.state, "received");
    call(opArgs("review", root, id, ["--task", taskId, "--json", json({ verdict: "accepted", reviewer: "advisor", advisorRoute: { available: true, tool: "decide", observedBy: "coordinador" }, checked: ["scope", "sources", "risks"] })]));
    proofAt(root, id, taskId);
    call(opArgs("verify", root, id, ["--task", taskId, "--json", json({ verifier: "coordinador" })]));
    call(opArgs("integrate", root, id, ["--task", taskId, "--json", json({ destination: task.output })]));
  }
  const closed = call(opArgs("close", root, id, ["--json", json({ verification: {
    verified: true, observed: true, by: "coordinador", evidence: "tres tareas verificadas; fx-1 sigue incierto",
    verified_tasks: ["t1", "t2", "t3"], unverified_effects: ["fx-1"],
  } })]));
  assert.equal(closed.state, "closed");
  artifact = JSON.parse(readFileSync(fasesPath, "utf8").match(/```json\s*([\s\S]*?)\s*```/)[1]);
  assert.equal(artifact.verification.verified, false, "unverified effect prevents claiming complete verification");
  assert.equal(artifact.verification.completion, "partial");
  assert.deepEqual(artifact.verification.unverified_effects, ["fx-1"]);
  const handoff = proposeHandoff({ kind: "proposal", evidence: artifact.verification, provenance: { operation: id, path: "FASES.md" }, source: `FASES.md#${id}` });
  assert.equal(handoff.kind, "proposal");
  assert.equal(handoff.writesLore, false);
  assert.equal(existsSync(join(root, "lore")), false);
});


test("compactación conserva contrato y FASES sin certificar una entrega", (t) => {
  mkdirSync(HOME_TEST, { recursive: true });
  const root = mkdtempSync(join(HOME_TEST, "compact-contract-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, "CLAUDE.md"), "# No publicar sin revisión humana\n");
  writeFileSync(join(root, "FASES.md"), "# Fases\n\n## Operaciones\n");
  const sessionId = "contract-" + process.pid + "-" + Date.now();
  const hook = spawnSync(process.execPath, [join(REPO, "hooks", "codex-guard.mjs"), "pre_compact"], {
    encoding: "utf8", env: ENV, input: json({ cwd: root, session_id: sessionId, trigger: "auto" }),
  });
  assert.equal(hook.status, 0);
  assert.equal(hook.stdout, "");
  const markPath = join(HOME_TEST, "lore-plugin-sessions", "compactacion-" + sessionId + ".json");
  const mark = JSON.parse(readFileSync(markPath, "utf8"));
  assert.equal(mark.raiz, root);
  assert.deepEqual(mark.triplete, ["CLAUDE.md", "FASES.md"]);
  rmSync(markPath, { force: true });
});
