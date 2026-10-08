import { proofAt } from "../bench/verification-fixture.mjs";
// RC7 - la CLI de la operacion: lo que el coordinador hace con la mano, comando por comando, contra FASES.md.
// Contrato: `node scripts/lore-plugin.mjs operation <sub> --root <dir> [--id <op>] [--task <t>] [--json '<obj>' | --file <ruta>]`.
// Cada comando imprime UNA linea JSON en stdout ({ok, ...}); un error sale con codigo 1 y {ok:false, error}.
// Las tareas se despachan declarando las herramientas del host que quien opera OBSERVO (--tools); la CLI no las simula.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { closeOperation, observeTask } from "../skills/vespi/core/coordinator.mjs";
import { readOperation } from "../skills/vespi/core/vespi.mjs";
import { createArtifact, saveOperationState, transitionArtifact } from "../skills/vespi/core/operation-state.mjs";

const CLI = resolve(dirname(fileURLToPath(import.meta.url)), "lore-plugin.mjs");
const MODULO = resolve(dirname(fileURLToPath(import.meta.url)), "operation-cli.mjs");

function run(args, { input, cli = CLI } = {}) {
  const r = spawnSync(process.execPath, [cli, "operation", ...args], { encoding: "utf8", input });
  let json = null;
  const line = r.stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  try { json = line ? JSON.parse(line) : null; } catch { json = null; }
  return { code: r.status, out: r.stdout, err: r.stderr, json };
}
const j = (o) => JSON.stringify(o);
const futuro = (ms = 600_000) => new Date(Date.now() + ms).toISOString();

// El mismo `run`, pero con el modulo de la operacion como proceso: sin la facade por delante.
// Es la via que dice el `usage()` y la que cualquiera copiaba del codigo.
function directo(args) {
  const r = spawnSync(process.execPath, [MODULO, ...args], { encoding: "utf8" });
  let json = null;
  const line = r.stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  try { json = line ? JSON.parse(line) : null; } catch { json = null; }
  return { code: r.status, out: r.stdout, err: r.stderr, json };
}

async function proyecto(t) {
  const root = await mkdtemp(join(tmpdir(), "vespi-opcli-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function conOperacion(t, { autorizar = true } = {}) {
  const root = await proyecto(t);
  const h = run(["hold", "--root", root, "--json", j({ goal: "Cotejar la propuesta", intent: "Cotejar la propuesta", owner: "coordinador", authority: { spend: [] }, scope: "solo el arbol temporal", expected_effect: { kind: "none" }, done: "evidencia observada y recibo persistido", roles: ["worker", "advisor", "verifier"], verifier: "coordinador" })]);
  assert.equal(h.code, 0, h.err);
  assert.equal(h.json.ok, true);
  const id = h.json.id;
  if (autorizar) {
    const a = run(["authorize", "--root", root, "--id", id, "--json", j({ by: "Andres", words: "Publicar no; correr el cotejo si" })]);
    assert.equal(a.code, 0, a.err);
  }
  return { root, id };
}

const encargoDaimon = (root) => ({
  role: "daimon", question: "Que dicen las fuentes?", sources: ["https://example.test/norma"],
  output: { path: join(root, "daimon.md") }, timeoutMs: 600_000, nextCheckAt: futuro(60_000),
});

test("hold crea la operacion en FASES.md y la deja preparada, no autorizada", async (t) => {
  const root = await proyecto(t);
  const h = run(["hold", "--root", root, "--json", j({ goal: "Cotejar", owner: "coordinador", authority: { spend: [] } })]);
  assert.equal(h.json.ok, true);
  assert.match(h.json.id, /\S/);
  assert.equal(h.json.state, "prepared");
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  assert.match(fases, new RegExp(`<!-- vespi:operacion ${h.json.id} -->`));
});

test("authorize exige quien y sus palabras: una autorizacion sin cita no existe", async (t) => {
  const { root, id } = await conOperacion(t, { autorizar: false });
  const sinPalabras = run(["authorize", "--root", root, "--id", id, "--json", j({ by: "Andres" })]);
  assert.equal(sinPalabras.code, 1);
  assert.equal(sinPalabras.json.ok, false);
  assert.match(sinPalabras.json.error, /words/);
  const ok = run(["authorize", "--root", root, "--id", id, "--json", j({ by: "Andres", words: "corre el cotejo" })]);
  assert.equal(ok.json.ok, true);
  assert.equal(ok.json.state, "authorized");
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  assert.match(fases, /corre el cotejo/);
});

test("plan agrega la tarea t1 con su encargo y la persiste", async (t) => {
  const { root, id } = await conOperacion(t);
  const p = run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  assert.equal(p.json.ok, true);
  assert.equal(p.json.task, "t1");
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.tasks.length, 1);
  assert.equal(s.json.tasks[0].state, "proposed");
});

test("plan rechaza el encargo incompleto y no escribe nada", async (t) => {
  const { root, id } = await conOperacion(t);
  const antes = await readFile(join(root, "FASES.md"), "utf8");
  const p = run(["plan", "--root", root, "--id", id, "--json", j({ role: "worker", question: "x" })]);
  assert.equal(p.code, 1);
  assert.equal(p.json.ok, false);
  assert.equal(await readFile(join(root, "FASES.md"), "utf8"), antes);
});

// La ruta no se abre por escribir un nombre. Este proceso no expone `execute` —no tiene con quien
// llamarlo— y `--tools execute` no lo cambia: antes se fabricaba una funcion por cada nombre para que
// `routeOperation` la diera por expuesta, y la tarea quedaba `running` con un ejecutor que no
// existe, esperando un archivo que nadie iba a escribir. Ahora el nombre queda como DECLARACION y la
// tarea como NO ejecutada.
test("dispatch con la herramienta declarada deja la tarea bloqueada y marcada como no ejecutada", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const d = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute",
    "--json", j({ hostName: "opencode", model: "space-bunny-free", effort: "low", process: 4242 })]);
  assert.equal(d.json.ok, true);
  assert.equal(d.json.task.state, "blocked", "una declaracion no lanza nada");
  assert.equal(d.json.task.executor, null, "no hay ejecutor: no se inventa");
  assert.equal(d.json.task.blocked.executed, false);
  assert.match(d.json.task.blocked.cause, /does not expose execute/);
  // Lo que si se conserva es el nombre del que declara, y como declaracion: `executed: false`.
  assert.equal(d.json.task.declared_route.tools.includes("execute"), true);
  assert.equal(d.json.task.declared_route.by, "opencode/space-bunny-free");
  assert.equal(d.json.task.declared_route.executed, false);
  assert.ok(Date.parse(d.json.task.declared_route.at));
  assert.match(d.json.task.blocked.next_action, /no se ejecuto/);
  // Y nada de eso se escribe como `running` en FASES.md, que es donde el sucesor lo lee.
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  assert.match(fases, /"executed": false/);
  assert.doesNotMatch(fases, /"executor": \{[^}]*"by"/);
});

test("una tarea declarada y no ejecutada se puede observar: el muro vive ahi", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const visto = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ text: "aun no hay archivo", alive: false })]);
  assert.equal(visto.json.ok, true);
  assert.equal(visto.json.task.observations.at(-1).alive, false);
  // Observar no inventa un ejecutor ni un plazo: nadie lanzo esta tarea.
  assert.equal(visto.json.task.executor, null);
  assert.equal(visto.json.task.deadline, null);
});

test("dispatch sin la herramienta queda blocked con su salida y NO simula un ejecutor", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const d = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "delegate", "--json", j({ hostName: "claude", model: "x" })]);
  assert.equal(d.code, 0);
  assert.equal(d.json.task.state, "blocked");
  assert.equal(d.json.task.executor, null);
  assert.match(d.json.task.blocked.next_action, /\S/);
  // La ruta de daimon pide `execute`: declarar `delegate` no es declararla a ella.
  assert.match(d.json.task.blocked.next_action, /exponga execute/);
});

test("dispatch sin --tools declara que la herramienta no fue observada: bloquea, no supone", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const d = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--json", j({ hostName: "claude" })]);
  assert.equal(d.json.task.state, "blocked");
});

test("dispatch de una operacion sin autorizar falla y dice authoriz", async (t) => {
  const { root, id } = await conOperacion(t, { autorizar: false });
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const d = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  assert.equal(d.code, 1);
  assert.match(d.json.error, /authoriz/);
});

test("el ciclo completo: receive, review, verify, integrate y close, con la verificacion de otro", async (t) => {
  const { root, id } = await conOperacion(t);
  const spec = encargoDaimon(root);
  run(["plan", "--root", root, "--id", id, "--json", j(spec)]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m", effort: "low" })]);
  await writeFile(spec.output.path, "evidencia: ...\nlimites: ...\n");
  const rc = run(["receive", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(rc.json.task.state, "received");
  assert.match(rc.json.task.received.sha256, /^[0-9a-f]{64}$/);
  const rv = run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ verdict: "accepted", reviewer: "advisor/model", advisorRoute: { available: true, tool: "decide", observedBy: "coordinator" }, checked: ["scope", "sources", "risks"], notes: "ok" })]);
  assert.equal(rv.json.task.state, "reviewed");
  const propio = run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "opencode/m", observed: true, evidence: "x" })]);
  assert.equal(propio.code, 1, "quien ejecuto no verifica");
  assert.match(propio.json.error, /independent/);
  const vf = run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: proofAt(root, id) })]);
  assert.equal(vf.json.task.state, "verified");
  const trust = run(["trust", "--root", root, "--id", id]);
  assert.equal(trust.code, 0, trust.out);
  assert.ok(trust.json.trust.coverage.length >= 1, JSON.stringify(trust.json));
  assert.equal(trust.json.trust.observations[0].execution.completed, true);
  const valid = await readOperation({ root, id });
  const { operationTrust } = await import("../skills/vespi/core/coordinator.mjs");
  const alteredEvidence = structuredClone(valid);
  alteredEvidence.tasks[0].verification.evidence.checks[0].observation = "forged observation";
  assert.equal(operationTrust(alteredEvidence).coverage.length, 0);
  const alteredSignature = structuredClone(valid);
  alteredSignature.tasks[0].verification.evidence.execution_receipt.signature = "0".repeat(64);
  assert.equal(operationTrust(alteredSignature).coverage.length, 0);
  const alteredSummary = structuredClone(valid);
  alteredSummary.tasks[0].verification.execution.adapter = "forged adapter";
  assert.deepEqual(operationTrust(alteredSummary).observations[0].execution,
    { ...valid.tasks[0].verification.evidence.execution_receipt.execution, certifiesCurrentState: true, currentStateWitness: null });
  await writeFile(spec.output.path, "changed after verification");
  assert.equal(operationTrust(valid).coverage.length, 0);
  await writeFile(spec.output.path, "evidencia: ...\nlimites: ...\n");
  const ig = run(["integrate", "--root", root, "--id", id, "--task", "t1", "--json", j({ destination: "notas/cotejo.md" })]);
  assert.equal(ig.json.task.state, "integrated");
  const sinVerificar = run(["close", "--root", root, "--id", id, "--json", j({ verification: { verified: false } })]);
  assert.equal(sinVerificar.code, 1);
  const cl = run(["close", "--root", root, "--id", id, "--json", j({ verification: { verified: true, by: "Andres", observed: true } })]);
  assert.equal(cl.json.ok, true);
  assert.equal(cl.json.state, "closed");
});

test("close nombra la tarea que no esta integrada", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const cl = run(["close", "--root", root, "--id", id, "--json", j({ verification: { verified: true, by: "Andres", observed: true } })]);
  assert.equal(cl.code, 1);
  assert.match(cl.json.error, /t1/);
});

test("receive de un archivo que no existe dice does not exist y no marca recibida", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const rc = run(["receive", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(rc.code, 1);
  assert.match(rc.json.error, /does not exist/);
  assert.equal(run(["status", "--root", root, "--id", id]).json.tasks[0].state, "blocked");
});

test("receive registra blocked si el delegado reporta un proveedor rechazado aunque haya archivo", async (t) => {
  const { root, id } = await conOperacion(t);
  const spec = encargoDaimon(root);
  run(["plan", "--root", root, "--id", id, "--json", j(spec)]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  await writeFile(spec.output.path, "partial");
  const rc = run(["receive", "--root", root, "--id", id, "--task", "t1", "--json", j({ text: "Upstream request failed", exitCode: 0 })]);
  assert.equal(rc.json.task.state, "blocked");
  assert.equal(rc.json.task.blocked.cause, "proveedor-gratuito");
});

test("status distingue una ruta declarada de una tarea ejecutada y vencida", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j({ ...encargoDaimon(root), timeoutMs: 1 })]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const ob = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ text: "sigue vivo", alive: true, at: new Date().toISOString() })]);
  assert.equal(ob.json.ok, true);
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.state, "running");
  assert.equal(s.json.tasks[0].state, "blocked", "la ruta declarada no acredita ejecución");
  assert.equal(s.json.tasks[0].overdue, false, "timeoutMs no empezó porque nadie ejecutó la tarea");
  assert.deepEqual(Object.keys(s.json.tasks[0]).sort(), ["by", "id", "nextCheckAt", "overdue", "role", "state"]);
  assert.match(s.json.calibrationNote, /calibraci[oó]n no medida/);
  assert.equal(s.json.suggestions, undefined);
  assert.equal(s.json.calibrationLines[0].line, "sin referencia");
});

test("status imprime referencia inicial por tipo y la medición propia con 3 muestras la reemplaza", async (t) => {
  const { root, id } = await conOperacion(t);
  const base = { ...encargoDaimon(root), role: "worker", question: "q", scope: "s", done_criterion: "d", proof: "p", estimateMs: 100, kind: "review" };
  const one = { ...base, output: { path: join(root, "one.md") } };
  run(["plan", "--root", root, "--id", id, "--json", j(one)]);
  let status = run(["status", "--root", root, "--id", id]);
  assert.equal(status.json.calibrationLines.length, 1);
  assert.equal(status.json.calibrationLines[0].line, "referencia inicial (no medida en tu máquina): suele tardar del orden de 13 min, hasta unos 15 min; viene de 25 trabajos de una sesión del 2026-10-04 al 2026-10-05; tu propia medición la reemplaza con 3 muestras");
  assert.equal(status.json.tasks[0].timeoutMs, undefined);
  for (let n = 0; n < 3; n++) {
    const taskSpec = { ...base, output: { path: join(root, `measured${n}.md`) } };
    run(["plan", "--root", root, "--id", id, "--json", j(taskSpec)]);
    const started = Date.parse("2026-10-05T10:00:00.000Z") + n * 1000;
    run(["dispatch", "--root", root, "--id", id, "--task", `t${n + 2}`, "--tools", "delegate", "--json", j({ hostName: "oc", model: "m", now: new Date(started).toISOString() })]);
    await writeFile(taskSpec.output.path, "evidencia");
    run(["receive", "--root", root, "--id", id, "--task", `t${n + 2}`, "--json", j({ now: new Date(started + 1000 * (n + 1)).toISOString() })]);
  }
  status = run(["status", "--root", root, "--id", id]);
  assert.equal(status.json.calibrationLines.length, 1);
  assert.match(status.json.calibrationLines[0].line, /referencia inicial/);
  const ownKey = "worker|host=oc|model=m";
  assert.equal(status.json.calibration[ownKey].samples, 3);
  assert.ok(!status.json.calibrationLines.some(({ task }) => task !== "t1"));
  // La medicion propia manda: la linea que la reemplaza nombra la proporcion medida, no un tope.
  assert.match(status.json.suggestions[ownKey], /sugerencia, no regla/);
});

test("una semilla ausente o corrupta no rompe el estado: sale sin referencia", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j({ ...encargoDaimon(root), timeoutMs: 60000, kind: "build" })]);
  // Mutate an isolated CLI tree, never the source concurrently copied by installer tests.
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const isolated = join(root, 'isolated-kit');
  await cp(join(repo, 'scripts'), join(isolated, 'scripts'), { recursive: true });
  await cp(join(repo, 'hooks'), join(isolated, 'hooks'), { recursive: true });
  await cp(join(repo, 'skills'), join(isolated, 'skills'), { recursive: true });
  await cp(join(repo, 'package.json'), join(isolated, 'package.json'));
  const semilla = join(isolated, 'skills', 'vespi', 'core', 'calibration-seed.json');
  const isolatedRun = args => run(args, { cli: join(isolated, 'scripts', 'lore-plugin.mjs') });
  // El top es proteccion contra colgados (ley #53), no una estimacion: la semilla no lo toca.
  const conSemilla = isolatedRun(["status", "--root", root, "--id", id]);
  assert.equal(conSemilla.code, 0, conSemilla.err + conSemilla.out);
  assert.match(conSemilla.json.calibrationLines[0].line, /^referencia inicial \(no medida en tu máquina\)/);
  assert.match(conSemilla.json.calibrationLines[0].line, /del orden de 22 min, hasta unos 32 min/);
  assert.equal(conSemilla.json.calibrationLines[0].line.includes(String(conSemilla.json.tasks[0].timeoutMs)), false);
  for (const cuerpo of ["{ corrupt", "[]", "null", JSON.stringify({ entries: [{ kind: "build", samples: 1, medianMinutes: 1, p80Minutes: 1, minMinutes: 1, maxMinutes: 1 }] })]) {
    await writeFile(semilla, cuerpo);
    const status = isolatedRun(["status", "--root", root, "--id", id]);
    assert.equal(status.code, 0, `${cuerpo}: el estado se cae`);
    assert.equal(status.json.ok, true);
    assert.deepEqual(status.json.calibrationLines.map(({ line }) => line), ["sin referencia"], cuerpo);
  }
});

test("status muestra calibracion agrupada y no sugiere cifras con pocas muestras", async (t) => {
  const { root, id } = await conOperacion(t);
  const spec = { ...encargoDaimon(root), role: "worker", question: "q", scope: "s", done_criterion: "d", proof: "p", estimateMs: 100 };
  for (let n = 0; n < 3; n++) {
    const taskSpec = { ...spec, output: { path: join(root, `out${n}.md`) } };
    run(["plan", "--root", root, "--id", id, "--json", j(taskSpec)]);
    const startedAt = Date.parse("2026-10-05T10:00:00.000Z");
    run(["dispatch", "--root", root, "--id", id, "--task", `t${n + 1}`, "--tools", "delegate", "--json", j({ hostName: "oc", model: "m", now: new Date(startedAt).toISOString() })]);
    await writeFile(taskSpec.output.path, "evidencia");
    run(["receive", "--root", root, "--id", id, "--task", `t${n + 1}`, "--json", j({ now: new Date(startedAt + 100 * (n + 1)).toISOString() })]);
  }
  const status = run(["status", "--root", root, "--id", id]);
  const stored = await (await import("../skills/vespi/core/vespi.mjs")).readOperation({ root, id });
  assert.ok(status.json.calibration, JSON.stringify({ status: status.json, tasks: stored.tasks }));
  const measured = status.json.calibration["worker|host=oc|model=m"];
  assert.equal(measured.samples, 3);
  assert.equal(measured.measured, undefined);
  assert.equal(typeof measured.medianRatio, "number");
  assert.match(status.json.suggestions["worker|host=oc|model=m"], /^sugerencia, no regla: el tiempo suele ser [\d.]+ de lo estimado \(3 muestras\)$/);
});

test("status expone el muro y stop_and_search tras tres fallos iguales", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  for (let n = 1; n <= 3; n++) {
    const observed = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ signature: "same failure 42", text: `intenté el paso ${n}`, at: new Date().toISOString() })]);
    assert.equal(observed.json.ok, true);
    if (n === 3) {
      assert.equal(observed.json.wall.instruction, "stop_and_search");
      assert.match(observed.json.wall.attempted[2], /intenté el paso 3/);
    }
  }
  const status = run(["status", "--root", root, "--id", id]);
  assert.equal(status.json.wall.instruction, "stop_and_search");
  assert.equal(status.json.wall.attempted.length, 3);
  assert.match(status.json.wall.attempted[0], /intenté el paso 1/);
});

test("consult conecta lectura LUS situada con decisión y conserva procedencia", async t => {
  const { root, id } = await conOperacion(t);
  const source = join(root, "lus-fixture.md");
  await writeFile(source, "Synthetic criterion: distinguish claim from observation.\n");
  const input = { sourceRoot: root, sourceRootObservedBy: "fixture-coordinator", source: "lus-fixture.md", reference: "fixture criterion", pertinent: true, interpretation: "require observed proof", limit: "synthetic source; product interpretation, not scientific result", decision: { id: "choose-proof", before: "trust exit", after: "read evidence", reason: "criterion distinguishes claims" }, mcpConfigured: true };
  const result = run(["consult", "--root", root, "--id", id, "--json", j(input)]);
  assert.equal(result.code, 0, result.err + result.out);
  let stored = await readOperation({ root, id });
  const entry = stored.loaded.at(-1);
  assert.equal(entry.transport, "local");
  assert.equal(entry.status, "consulted");
  assert.equal(entry.requested_source, "lus-fixture.md");
  assert.equal(entry.source, source);
  assert.equal(entry.decision.after, "read evidence");
  assert.match(entry.digest, /^[a-f0-9]{64}$/);
  assert.match(entry.transport_limit, /MCP.*unavailable/i);
  assert.equal(stored.provenance.consultations.at(-1).digest, entry.digest);
  assert.equal(entry.source_root.source, "coordinator-attestation");
  assert.equal(await readFile(source, "utf8"), "Synthetic criterion: distinguish claim from observation.\n");
  const ignored = run(["consult", "--root", root, "--id", id, "--json", j({ ...input, pertinent: false, discardReason: "different domain" })]);
  assert.equal(ignored.code, 0);
  stored = await readOperation({ root, id });
  assert.equal(stored.loaded.at(-1).status, "discarded");
  const missing = run(["consult", "--root", root, "--id", id, "--json", j({ ...input, source: join(root, "missing.md"), mcpConfigured: false })]);
  assert.equal(missing.code, 0);
  stored = await readOperation({ root, id });
  assert.equal(stored.loaded.at(-1).status, "unavailable");
  assert.equal(stored.loaded.at(-1).digest, null);
});

test("consult usa MCP solo con herramienta real y rechaza escapes de raíz", async t => {
  const { root, id } = await conOperacion(t);
  const api = await import("../skills/vespi/core/coordinator.mjs");
  assert.equal(typeof api.consultCriterion, "function");
  const op = await readOperation({ root, id });
  const input = { source: "lus://fixture/criterion", reference: "fixture section", pertinent: true, interpretation: "interpretation", limit: "synthetic MCP only", decision: { id: "d", before: "a", after: "b", reason: "applied criterion" }, mcpConfigured: true };
  let calls = 0;
  const consulted = await api.consultCriterion(op, input, { readMcp: async uri => { calls++; assert.equal(uri, input.source); return { text: "fixture criterion", source: uri }; } });
  assert.equal(calls, 1);
  assert.equal(consulted.loaded.at(-1).transport, "mcp");
  await assert.rejects(() => api.consultCriterion(op, { ...input, source: join(root, "..", "escape.md"), sourceRoot: root, sourceRootObservedBy: "fixture", mcpConfigured: false }), /outside|root/i);
  await assert.rejects(() => api.consultCriterion(op, { ...input, source: join(root, "f.md"), sourceRoot: root, mcpConfigured: false }), /observer/i);
});

test("compare conserva elección tecnológica situada y trust enumera omisiones", async t => {
  const { root, id } = await conOperacion(t);
  const option = { benefit: "local project assistance", cost: "local compute", authority: "project owner", privacy: "local fixture", reversibility: "restore file", expected_effect: "none", source: "fixture://observed-run", limit: "simulation only" };
  const options = [{ ...option, id: "ia", technology: "ia" }, { ...option, id: "chain", technology: "blockchain", benefit: "shared ordered commitment record", cost: "coordination and consensus overhead", reversibility: "append a correction" }];
  // Executed local simulation: independent mutable views diverge; one ordered registry exposes both events.
  const ownerView = [{ actor: "a", delivered: true }];
  const peerView = [{ actor: "b", delivered: false }];
  assert.notDeepEqual(ownerView, peerView);
  const sharedRegistry = [];
  for (const event of [...ownerView, ...peerView]) sharedRegistry.push(Object.freeze({ sequence: sharedRegistry.length + 1, ...event }));
  const readView = () => structuredClone(sharedRegistry);
  assert.deepEqual(readView(), readView());
  assert.deepEqual(readView().map(event => event.sequence), [1, 2]);
  await writeFile(join(root, "comparison-fixture.json"), j({ ownerView, peerView, registryView: readView(), limit: "central local registry, no decentralized consensus" }));
  for (const selected of ["ia", "chain"]) {
    const comparison = run(["compare", "--root", root, "--id", id, "--json", j({ options, selected, reason: selected === "ia" ? "single owner needs no shared registry" : "disputed local logs need a shared ordering under fixture assumptions", observations: [{ id: "local", source: "fixture://separate-logs", result: "contradictory records" }, { id: "shared", source: "fixture://shared-order", result: "same ordered records" }], mode: "simulation", limit: "no real blockchain; not proof of necessity, consensus or economic security" })]);
    assert.equal(comparison.code, 0, comparison.err + comparison.out);
    assert.equal(comparison.json.choice.selected, selected);
    assert.equal(comparison.json.choice.mode, "simulation");
  }
  const trust = run(["trust", "--root", root, "--id", id]);
  assert.equal(trust.code, 0, trust.err + trust.out);
  assert.equal(trust.json.trust.operation_id, id);
  assert.equal(trust.json.trust.score, undefined);
  assert.ok(trust.json.trust.notCovered.includes("no executed domain verification"));
  assert.deepEqual(trust.json.trust.authority, (await readOperation({ root, id })).authority);
  const bad = run(["compare", "--root", root, "--id", id, "--json", j({ options: options.map(x => ({ ...x, privacy: "" })), selected: "chain" })]);
  assert.equal(bad.code, 1);
});

test("capability distingue puerto configurado de presencia del módulo", async t => {
  const { root, id } = await conOperacion(t);
  const api = await import("../skills/vespi/core/coordinator.mjs");
  assert.equal(typeof api.describeOperationCapability, "function");
  const input = { id: "zk", observedBy: "fixture-coordinator", privacy: "local fixture only", limit: "backend function observed, not audited or invoked" };
  const op = await readOperation({ root, id });
  const configured = api.describeOperationCapability(op, input, { capabilities: { zk: () => {} } });
  assert.equal(configured.configured, true);
  assert.equal(configured.executed, false);
  const absent = run(["capability", "--root", root, "--id", id, "--json", j(input)]);
  assert.equal(absent.code, 0, absent.err + absent.out);
  assert.equal(absent.json.capability.configured, false);
  assert.equal(absent.json.capability.status, "not-integrated");
});

test("card offer answer arbitrate conserva recibo entre procesos", async t => {
  const { root, id } = await conOperacion(t);
  const point = { dimension: "sequence", options: [{ id: "a", viable: true, consequence: "write then check" }, { id: "b", viable: true, consequence: "check then write" }] };
  const offered = run(["card", "offer", "--root", root, "--id", id, "--json", j({ decisionPoint: point, decisionBefore: "write then check", semilla: 19 })]);
  assert.equal(offered.code, 0, offered.err + offered.out);
  const card = offered.json.card;
  assert.equal(card.classification, null);
  const answer = run(["card", "answer", "--root", root, "--id", id, "--json", j({ id: card.id, response: "accepted" })]);
  assert.equal(answer.code, 0, answer.err + answer.out);
  const arbitrated = run(["card", "arbitrate", "--root", root, "--id", id, "--json", j({ id: card.id, evidence: { cardId: card.id, source: "fixture://decision", by: "fixture-verifier", at: new Date().toISOString(), decisionBefore: "write then check", decisionAfter: "check then write", kind: "opening", distinction: "check assumptions before acting", description: "changed order after evaluating the offered option" } })]);
  assert.equal(arbitrated.code, 0, arbitrated.err + arbitrated.out);
  assert.equal(arbitrated.json.card.classification, "germen");
  const stored = await readOperation({ root, id });
  assert.equal(stored.perturbations[0].response_status, "accepted");
  assert.equal(stored.id, id);
  assert.equal(run(["card", "offer", "--root", root, "--id", id, "--json", j({ decisionPoint: point, decisionBefore: "a" })]).code, 1);
});

test("retry-search guarda la búsqueda del host sin atribuirla al CLI", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute"]);
  for (let n = 1; n <= 3; n++) run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ signature: "same failure", text: `attempt ${n}`, at: new Date().toISOString() })]);
  const unavailable = run(["retry-search", "--root", root, "--id", id, "--json", j({ available: false, observedBy: "fixture-coordinator", reason: "host has no search" })]);
  assert.equal(unavailable.code, 0, unavailable.err + unavailable.out);
  let stored = await readOperation({ root, id });
  assert.equal(stored.retry_stop.status, "requires_search");
  assert.equal(stored.retry_searches.at(-1).executed_by_cli, false);
  const searched = run(["retry-search", "--root", root, "--id", id, "--json", j({ available: true, observedBy: "fixture-coordinator", tool: "fixture-search", query: "same failure", findings: [{ source: "fixture://manual", finding: "change local timeout", limit: "synthetic test only", applies: true }], change: "adjust local timeout", same_scope: true })]);
  assert.equal(searched.code, 0, searched.err + searched.out);
  stored = await readOperation({ root, id });
  assert.equal(stored.id, id);
  assert.equal(stored.retry_stop.status, "resolved");
  assert.equal(stored.tasks[0].observations.length, 3);
  assert.equal(stored.retry_searches.at(-1).findings[0].limit, "synthetic test only");
});

test("--file lee el JSON de un archivo y un JSON invalido falla sin tocar FASES.md", async (t) => {
  const root = await proyecto(t);
  const f = join(root, "payload.json");
  await writeFile(f, j({ goal: "Desde archivo", owner: "coordinador", authority: { spend: [] } }));
  const h = run(["hold", "--root", root, "--file", f]);
  assert.equal(h.json.ok, true);
  const malo = run(["hold", "--root", root, "--json", "{no es json"]);
  assert.equal(malo.code, 1);
  assert.equal(malo.json.ok, false);
});

test("resume entrega el veredicto del kernel sobre una operacion guardada", async (t) => {
  const { root, id } = await conOperacion(t);
  const r = run(["resume", "--root", root, "--id", id]);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.json.ok, true);
  assert.equal(typeof r.json.allowed, "boolean");
  assert.equal(r.json.reason, "fresh");
});

test("un subcomando desconocido sale con 2 y la lista de comandos", () => {
  const r = run(["bogus"]);
  assert.equal(r.code, 2);
  assert.match(r.out + r.err, /hold/);
  assert.match(r.out + r.err, /dispatch/);
});

test("observe rechaza firmas no textuales antes de persistir y status sigue legible", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const before = await readFile(join(root, "FASES.md"), "utf8");
  for (const signature of [{}, { toString: null }, 17, ["failure"]]) {
    const rejected = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ signature, text: "bad" })]);
    assert.equal(rejected.code, 1);
    assert.match(rejected.json.error, /signature.*string/i);
    assert.equal(await readFile(join(root, "FASES.md"), "utf8"), before);
    const status = run(["status", "--root", root, "--id", id]);
    assert.equal(status.code, 0);
    assert.equal(status.json.ok, true);
  }
});

test("observe rechaza at inválido por API y CLI sin alterar el estado", async (t) => {
  const running = { id: "op-observe-test", intent: "observar fixture", owner: "coordinator", authority: { spend: [] }, scope: "fixture local", expected_effect: { kind: "none" }, done: "observacion guardada", roles: ["worker", "advisor", "verifier"], verifier: "coordinator", receipt: { status: "pending" }, state: "running", next_legitimate_action: "observe t1", uncertainty: [], tasks: [{ id: "t1", state: "running", observations: [], deadline: "2020-01-01T00:00:00.000Z", overdue: true }] };
  for (const at of ["", "not-a-date", 17.5, [], {}, NaN]) {
    assert.throws(() => observeTask(running, "t1", { at, signature: "E" }), /at.*(ISO|fecha|tiempo|inválid)/i);
  }
  assert.equal(observeTask(running, "t1", { at: Date.parse("2025-01-01T00:00:00Z") }).tasks[0].overdue, true);
  assert.match(observeTask(running, "t1", { signature: "E" }).tasks[0].observations[0].at, /^\d{4}-\d\d-/);

  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const file = join(root, "FASES.md");
  const before = await readFile(file);
  for (const at of ["", "not-a-date", 17.5, [], {}]) {
    const rejected = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ at, signature: "E" })]);
    assert.notEqual(rejected.code, 0);
    assert.match(rejected.json.error, /at.*(ISO|fecha|tiempo|inválid)/i);
    assert.deepEqual(await readFile(file), before);
  }
  const notJsonNumber = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", '{"at":NaN,"signature":"E"}']);
  assert.notEqual(notJsonNumber.code, 0);
  assert.deepEqual(await readFile(file), before);
});

// --- RC2: el reloj consultado ------------------------------------------------------------------
//
// El kernel trae `deadlineMs` y `delegationStatus`, y su propia declaracion dice que los plazos
// INFORMAN el estado solo cuando los consultas y nunca programan ni ejecutan trabajo. Es decir: el
// reloj existe y depende de que alguien pregunte, y nadie preguntaba. Una tarea con su plazo
// vencido no aparecia vencida en ninguna parte —no en `status`, no en `entry`— y eso no es que
// estuviera bien: es que nadie miraba.
//
// `deadlineMs` es una DURACION en milisegundos, como en el kernel: el plazo se cuenta desde que la
// tarea se planifico. El rojo usa `1`, que vence un milisegundo despues de planificarse: asi el
// caso es "una tarea con `deadlineMs` en el pasado" sin escribir una fecha en el test.

const encargoVencido = (root) => ({ ...encargoDaimon(root), deadlineMs: 1 });

test("RC2: plan acepta deadlineMs y lo persiste por tarea", async (t) => {
  const { root, id } = await conOperacion(t);
  const p = run(["plan", "--root", root, "--id", id, "--json", j(encargoVencido(root))]);
  assert.equal(p.json.ok, true, p.err);
  assert.equal(p.json.taskRecord.deadlineMs, 1);
  assert.ok(Number.isFinite(Date.parse(p.json.taskRecord.due_at)),
    `el plazo tiene que quedar congelado en un instante: ${JSON.stringify(p.json.taskRecord)}`);
  assert.equal(Date.parse(p.json.taskRecord.due_at), Date.parse(p.json.taskRecord.planned_at) + 1);
  // Y sobrevive al archivo: la consulta de otro proceso tiene que poder leerlo.
  const s = run(["status", "--root", root, "--id", id]);
  assert.ok(s.json.ok, s.err);
});

test("RC2: status declara vencida la tarea con el plazo vencido y dice su edad", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoVencido(root))]);
  // Nadie observo nada: el rojo es justamente que la vencimiento se vea SIN que alguien la mire.
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.tasks[0].overdue, true, "la tarea vencida no aparece vencida");
  assert.equal(s.json.muro.length, 1, `el muro no se declara: ${JSON.stringify(s.json)}`);
  assert.equal(s.json.muro[0].task, "t1");
  assert.ok(s.json.muro[0].age_ms > 0, "un muro sin edad no dice cuanto lleva ahi");
});

test("RC2: entry declara el mismo muro: la puerta lo nombra, no solo el comando de estado", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoVencido(root))]);
  const e = run(["entry", "--root", root]);
  assert.equal(e.json.muro.length, 1, `la puerta no nombra el muro: ${JSON.stringify(e.json)}`);
  assert.equal(e.json.muro[0].task, "t1");
  assert.match(e.json.instruction, /vencid/i, "el muro tiene que decirselo a quien lee, no solo al JSON");
});

test("RC2: un plazo que todavia no vence no declara muro", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j({ ...encargoDaimon(root), deadlineMs: 600_000 })]);
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.tasks[0].overdue, false);
  assert.equal(s.json.muro, undefined, "un plazo por vencer no es un muro");
});

test("RC2: una tarea ya integrada no es un muro, porque su plazo dejo de informar", async (t) => {
  const { root, id } = await conOperacion(t);
  const spec = encargoVencido(root);
  run(["plan", "--root", root, "--id", id, "--json", j(spec)]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m", effort: "low" })]);
  await writeFile(spec.output.path, "evidencia: ...\n");
  run(["receive", "--root", root, "--id", id, "--task", "t1"]);
  run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ verdict: "accepted", reviewer: "advisor/model", advisorRoute: { available: true, tool: "decide", observedBy: "coordinator" }, checked: ["scope", "sources", "risks"], notes: "ok" })]);
  run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: proofAt(root, id) })]);
  const ig = run(["integrate", "--root", root, "--id", id, "--task", "t1", "--json", j({ destination: "notas/cotejo.md" })]);
  assert.equal(ig.json.task.state, "integrated");
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.muro, undefined, "una tarea integrada ya no esta vencida: su plazo no informa");
});

test("RC2: el reloj INFORMA y no juzga — una tarea vencida se integra igual", async (t) => {
  // Lo que la revision adversarial quito de la primera redaccion: `integrate` no rechaza
  // vencidas. Eso no seria consultar el reloj, seria ejecutar juicio con el reloj, y el kernel
  // declara que los plazos informan solo cuando los consultas. Un muro declarado es capacidad
  // prometida; que la vencimiento tenga consecuencia la decide el host.
  const { root, id } = await conOperacion(t);
  const spec = encargoVencido(root);
  run(["plan", "--root", root, "--id", id, "--json", j(spec)]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m", effort: "low" })]);
  await writeFile(spec.output.path, "evidencia: ...\n");
  run(["receive", "--root", root, "--id", id, "--task", "t1"]);
  run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ verdict: "accepted", reviewer: "advisor/model", advisorRoute: { available: true, tool: "decide", observedBy: "coordinator" }, checked: ["scope", "sources", "risks"], notes: "ok" })]);
  run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: proofAt(root, id) })]);
  // El plazo sigue vencido ahi —la tarea lleva su due_at en el pasado— y aun asi integra.
  const ig = run(["integrate", "--root", root, "--id", id, "--task", "t1", "--json", j({ destination: "notas/cotejo.md" })]);
  assert.equal(ig.code, 0, `una tarea vencida no se bloquea: ${ig.json?.error}`);
  assert.equal(ig.json.task.state, "integrated");
});

test("RC2: plan rechaza un deadlineMs que no sea un entero positivo y no escribe nada", async (t) => {
  const { root, id } = await conOperacion(t);
  const antes = await readFile(join(root, "FASES.md"), "utf8");
  for (const malo of [0, -1, 1.5, "600000", null]) {
    const rc = run(["plan", "--root", root, "--id", id, "--json", j({ ...encargoDaimon(root), deadlineMs: malo })]);
    assert.notEqual(rc.code, 0, `deadlineMs ${JSON.stringify(malo)} deberia rechazarse`);
    assert.match(rc.json.error, /deadlineMs/);
  }
  assert.equal(await readFile(join(root, "FASES.md"), "utf8"), antes);
});

test("status inexistente indica raíz, id y comando de recuperación sin crear archivos", async (t) => {
  const root = await proyecto(t);
  const rc = run(["status", "--root", root, "--id", "op-inexistente"]);
  assert.notEqual(rc.code, 0);
  assert.match(rc.json.error, new RegExp(root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(rc.json.error, /op-inexistente/);
  assert.match(rc.json.error, /lore-plugin operation status --root <ruta> --id <id>|lista las operaciones/);
  assert.match(rc.err, /root|FASES\.md|lore-plugin operation status/i);
  assert.deepEqual(await import("node:fs/promises").then(({ readdir }) => readdir(root)), []);
});

test("status sin raíz nombra el id, cómo completar la raíz y no crea archivos", async (t) => {
  const root = await proyecto(t);
  const rc = run(["status", "--id", "op-sin-raiz"]);
  assert.notEqual(rc.code, 0);
  assert.match(rc.json.error, /root: <missing>/);
  assert.match(rc.json.error, /op-sin-raiz/);
  assert.match(rc.json.error, /--root <ruta>/);
  assert.match(rc.err, /root: <missing>/);
  assert.deepEqual(await import("node:fs/promises").then(({ readdir }) => readdir(root)), []);
});

// --- la puerta de entrada: `entry` ------------------------------------------
//
// `resume` es lo que el coordinador corre cuando YA sabe que hay una operacion. `entry` es lo que
// responde a la pregunta anterior: si hay algo abierto, y que es lo primero. Por eso no necesita
// `--id`: lo lee de FASES.md, y si no hay nada abierto dice que no hay y sale 0. Si hay algo abierto
// devuelve el veredicto del kernel, el siguiente paso y el pendiente por rol, y sale distinto de
// cero nombrando el archivo exacto: un puntero que no puede fallar en voz alta no es una puerta.

test("entry en una raiz sin operacion responde breve y sale 0", async (t) => {
  const root = await proyecto(t);
  const e = run(["entry", "--root", root]);
  assert.equal(e.code, 0, e.err);
  assert.equal(e.json.ok, true);
  assert.equal(e.json.open, false);
});

test("entry con una operacion abierta da el veredicto, el siguiente paso y el pendiente por rol", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const e = run(["entry", "--root", root]);
  assert.equal(e.json.open, true);
  assert.equal(e.json.id, id);
  assert.equal(e.json.allowed, true);
  assert.equal(e.json.reason, "fresh");
  assert.equal(e.json.state, "authorized");
  assert.equal(e.json.next_step, "dispatch t1");
  assert.equal(e.json.pending_by_role.length, 1);
  assert.equal(e.json.pending_by_role[0].role, "daimon");
  assert.equal(e.json.pending_by_role[0].tasks[0].id, "t1");
  assert.equal(e.json.pending_by_role[0].tasks[0].state, "proposed");
});

test("entry con una operacion abierta SALE DISTINTO DE CERO y nombra el archivo a abrir", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const e = run(["entry", "--root", root]);
  assert.notEqual(e.code, 0, "una operacion abierta no puede salir como si no hubiera nada que abrir");
  assert.equal(e.json.ok, false);
  assert.equal(e.json.file, `FASES.md#${id}`);
  assert.equal(e.json.file_to_open, join(root, "FASES.md"));
  assert.match(e.err, new RegExp(`FASES\\.md#${id}`));
});

test("entry no necesita --id: lee la operacion abierta de FASES.md", async (t) => {
  const { root, id } = await conOperacion(t);
  const e = run(["entry", "--root", root]);
  assert.equal(e.json.id, id);
});

test("entry sin --root falla nombrando la raiz y no crea archivos", async (t) => {
  const root = await proyecto(t);
  const e = run(["entry"]);
  assert.notEqual(e.code, 0);
  assert.match(e.json.error, /--root/);
  assert.deepEqual(await import("node:fs/promises").then(({ readdir }) => readdir(root)), []);
});

test("entry de una operacion solo preparada dice que hay que autorizar, y sigue sin ser 0", async (t) => {
  const { root, id } = await conOperacion(t, { autorizar: false });
  const e = run(["entry", "--root", root]);
  assert.equal(e.json.open, true);
  assert.equal(e.json.state, "prepared");
  // `prepared` no bloquea la reanudacion: lo que no deja correr una tarea sin autorizacion es el
  // dispatch, no el veredicto. La puerta por eso dice lo que falta, `authorize`, en vez de
  // inventarse un motivo de parada.
  assert.equal(e.json.reason, "fresh");
  assert.equal(e.json.next_step, "authorize");
  assert.equal(e.json.declared_next_action, "authorize");
  assert.notEqual(e.code, 0);
});

test("entry delega el veredicto en el mismo camino que resume", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const entry = run(["entry", "--root", root]).json;
  const resume = run(["resume", "--root", root, "--id", id]).json;
  assert.equal(entry.id, resume.id);
  assert.equal(entry.allowed, resume.allowed);
  assert.equal(entry.reason, resume.reason);
  assert.equal(entry.state, resume.state);
});

// --- el modulo tiene que poder ejecutarse a si mismo ------------------------------
//
// `operation-cli.mjs` exportaba `runOperationCli` y no se llamaba: invocado como comando
// —la forma que su propio `usage()` anuncia— no imprimia nada y salia 0. Un ok vacio es peor
// que un fallo: quien lo copiaba se iba con la certeza de haber preguntado. Y la puerta que
// acababa de construirse quedaba sin usar justo por ese camino.

test("invocado directo, el modulo responde: la capacidad central no devuelve un ok vacio", async (t) => {
  const root = await proyecto(t);
  const e = directo(["entry", "--root", root]);
  assert.equal(e.code, 0, `sin linea JSON: ${JSON.stringify({ code: e.code, out: e.out, err: e.err })}`);
  assert.notEqual(e.json, null, `stdout vacio y salida 0: ${JSON.stringify(e.out)}`);
  assert.equal(e.json.gate, "operation_entry");
  assert.equal(e.json.open, false);
});

test("invocado directo, la puerta sale distinto de cero igual que por la facade", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const e = directo(["entry", "--root", root]);
  assert.notEqual(e.code, 0, "una operacion abierta no puede salir 0 por el camino directo");
  assert.equal(e.json.ok, false);
  assert.equal(e.json.id, id);
  assert.match(e.err, new RegExp(`FASES\\.md#${id}`));
});

test("invocado directo, un subcomando desconocido sale con 2 y el uso", () => {
  const r = directo(["bogus"]);
  assert.equal(r.code, 2, `salio ${r.code} sin decir nada: ${JSON.stringify(r)}`);
  assert.match(r.err, /hold/);
  assert.match(r.err, /dispatch/);
});

test("invocado directo, un error sale con 1 y su motivo, no con un silencio", async (t) => {
  const root = await proyecto(t);
  const e = directo(["status", "--root", root, "--id", "op-inexistente"]);
  assert.equal(e.code, 1);
  assert.equal(e.json.ok, false);
  assert.match(e.json.error, /op-inexistente/);
  assert.match(e.err, /op-inexistente/);
});

test("la facade y el modulo directo dicen exactamente lo mismo", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const porFacade = run(["status", "--root", root, "--id", id]);
  const porModulo = directo(["status", "--root", root, "--id", id]);
  assert.equal(porModulo.code, porFacade.code);
  assert.deepEqual(porModulo.json, porFacade.json);
});

test("recommend ofrece modalidad y pregunta sin crear ni mutar una operación", async (t) => {
  const root = await proyecto(t);
  const oferta = run(["recommend", "--root", root, "--json", j({
    modalidad: "secuencial-party-checkpoints",
    motivo: "cruza dos repositorios y exige gates",
    tradeoff: "requiere checkpoints antes de avanzar",
    alternativas: ["acompanada"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto: { instruccion: "Retomar una campaña entre repositorios", pistas: [], motivoSinPistas: "La consulta no incluyó una Pista pertinente para esta prueba", catalogoSkills: [], catalogoSkillsOrigen: "fixture T1", skillsSugeridas: [] },
  })]);
  assert.equal(oferta.code, 0, oferta.err);
  assert.equal(oferta.json.ok, true);
  assert.equal(oferta.json.offer.modalidad, "secuencial-party-checkpoints");
  assert.equal(oferta.json.offer.requiere_eleccion, true);
  assert.deepEqual(await import("node:fs/promises").then(({ readdir }) => readdir(root)), []);
});

test("recommend exige el rastro de contexto antes de ofrecer una modalidad", async (t) => {
  const root = await proyecto(t);
  const resultado = run(["recommend", "--root", root, "--json", j({
    modalidad: "secuencial-party-checkpoints",
    motivo: "cruza dos repositorios y exige gates",
    tradeoff: "requiere checkpoints antes de avanzar",
    alternativas: ["acompanada"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
  })]);
  assert.equal(resultado.code, 1);
  assert.match(resultado.json.error, /contexto/i);
});

test("recommend muestra la Pista usada y skills sugeridas verificadas en el catálogo", async (t) => {
  const root = await proyecto(t);
  const resultado = run(["recommend", "--root", root, "--json", j({
    modalidad: "secuencial-party-checkpoints",
    motivo: "cruza dos repositorios y exige gates",
    tradeoff: "requiere checkpoints antes de avanzar",
    alternativas: ["acompanada"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto: {
      instruccion: "Construir 2.5.1 con TDD y autorización específica",
      pistas: [{ referencia: "plugins/andamiaje/lore-plugin/lore/principios.md#4", pertinente: true, razon: "la regla se coloca en la skill donde se toma la decisión", contenido: "Cuando una regla se incumple, la pregunta no es dónde más escribirla sino qué skill está corriendo en el momento en que se toma esa decisión — la guardia va ahí. Escribirla en un cuarto sitio es el mismo error una vez más, con más prosa. Y una skill que delega en otra declara el retorno: una entrega sin vuelta deja abierta la petición original mientras el primer artefacto sale con aspecto de terminado." }],
      motivoSinPistas: null,
      catalogoSkillsOrigen: "Catálogo de skills de Codex observado en esta sesión (2026-10-07)",
      catalogoSkills: [
        { id: "lore:vespi", nombre: "Vespi" },
        { id: "lore:use-lore", nombre: "use-lore" },
        { id: "lore:brainstorming-lore", nombre: "brainstorming-lore" },
        { id: "lore:save-to-lore", nombre: "save-to-lore" },
      ],
      skillsSugeridas: [{ id: "lore:vespi", proposito: "mantener la operación y sus gates" }, { id: "lore:use-lore", proposito: "enrutar las Pistas pertinentes" }],
    },
  })]);
  assert.equal(resultado.code, 0, resultado.err);
  assert.ok(resultado.json.offer.fundamento, "la oferta expone el fundamento consultado");
  assert.equal(resultado.json.offer.fundamento.pistas.length, 1);
  assert.equal(resultado.json.offer.fundamento.pistas[0].referencia, "plugins/andamiaje/lore-plugin/lore/principios.md#4");
  assert.deepEqual(resultado.json.offer.skillsSugeridas.map(({ id }) => id), ["lore:vespi", "lore:use-lore"]);
  assert.match(resultado.json.offer.mensaje, /Vamos paso a paso/);
  assert.match(resultado.json.offer.mensaje, /Vespi/);
  assert.match(resultado.json.offer.mensaje, /¿Cómo prefieres avanzar\?$/);
  assert.doesNotMatch(resultado.json.offer.mensaje, /\.\./);
});

test("recommend no presenta una Pista explícitamente irrelevante como fundamento", async (t) => {
  const root = await proyecto(t);
  const resultado = run(["recommend", "--root", root, "--json", j({
    modalidad: "secuencial-checkpoints",
    motivo: "la instrucción pide una sola entrega local",
    tradeoff: "se detiene en cada revisión",
    alternativas: ["acompanada"],
    capacidades: {},
    contexto: {
      instruccion: "Preparar una entrega local simple",
      pistas: [{ referencia: "plugins/andamiaje/lore-plugin/lore/principios.md#22", pertinente: false, razon: "trata la adopción del kernel, no la entrega solicitada" }],
      motivoSinPistas: "La Pista encontrada no aplica a esta tarea",
      catalogoSkillsOrigen: "fixture: inventario de skills disponible",
      catalogoSkills: [],
      skillsSugeridas: [],
    },
  })]);
  assert.equal(resultado.code, 0, resultado.err);
  assert.ok(resultado.json.offer.fundamento, "la oferta distingue que no aplicó la Pista");
  assert.equal(resultado.json.offer.fundamento.pistas.length, 0);
  assert.equal(resultado.json.offer.fundamento.motivoSinPistas, "La Pista encontrada no aplica a esta tarea");
});

test("recommend rechaza una skill que no existe en el catálogo disponible", async (t) => {
  const root = await proyecto(t);
  const resultado = run(["recommend", "--root", root, "--json", j({
    modalidad: "acompanada",
    motivo: "la tarea cabe en una operación",
    tradeoff: "menos revisión separada",
    alternativas: ["secuencial-checkpoints"],
    capacidades: {},
    contexto: {
      instruccion: "Empezar una tarea pequeña",
      pistas: [],
      motivoSinPistas: "No hay Pista pertinente para este caso",
      catalogoSkillsOrigen: "fixture: inventario de skills disponible",
      catalogoSkills: [{ id: "vespi", nombre: "Vespi" }],
      skillsSugeridas: [{ id: "acompanar", proposito: "seguir al usuario" }],
    },
  })]);
  assert.equal(resultado.code, 1);
  assert.match(resultado.json.error, /catálogo|catalogo/i);
});

test("hold conserva modalidad y decisiones de skills al releer el artifact", async (t) => {
  const root = await proyecto(t);
  const coordinacion = {
    modalidad: "secuencial-party-checkpoints",
    skills: [
      { sugerida: "vespi", decision: "accepted", elegida: "vespi" },
      { sugerida: "use-lore", decision: "corrected", elegida: "brainstorming-lore" },
      { sugerida: "save-to-lore", decision: "declined", elegida: null },
    ],
  };
  const creado = run(["hold", "--root", root, "--json", j({
    goal: "Retomar la campaña acordada",
    owner: "coordinador",
    authority: { spend: [] },
    coordinacion,
  })]);
  assert.equal(creado.code, 0, creado.err);
  const artefacto = await readOperation({ root, id: creado.json.id });
  assert.deepEqual(artefacto.coordinacion, coordinacion);
});
test("el cierre conserva coordinacion en el snapshot terminal de FASES", async (t) => {
  const root = await proyecto(t);
  const coordinacion = { modalidad: "secuencial-party-checkpoints", skills: [{ sugerida: "vespi", decision: "accepted", elegida: "vespi" }] };
  let artifact = createArtifact({ goal: "Cerrar sin perder el acuerdo", owner: "coordinador", coordinacion, scope: "cotejo local", expected_effect: { kind: "none" }, done: "recibo verificado", roles: ["worker", "advisor", "verifier"], verifier: "coordinador" });
  for (const state of ["authorized", "running", "received", "reviewed", "verified"]) {
    artifact = transitionArtifact(artifact, { state, note: `avanza a ${state}` });
  }
  artifact = {
    ...artifact,
    tasks: [{ id: "t1", state: "integrated", executor: { by: "worker/model" }, review: { by: "advisor/model" }, verification: { by: "verifier/model", executed: true, evidence: {} } }],
    verification: { verified: true, by: "verificador", observed: true },
  };
  artifact = transitionArtifact(artifact, { state: "closed", note: "cierre verificado" });
  await saveOperationState(root, artifact);
  const reread = await readOperation({ root, id: artifact.id });
  assert.equal(reread.state, "closed");
  assert.deepEqual(reread.coordinacion, coordinacion);
});
test("recommend retoma la preferencia de la misma operación desde FASES", async (t) => {
  const root = await proyecto(t);
  const crearContexto = (instruccion, { contenido = "Cuando una regla se incumple, la pregunta no es dónde más escribirla sino qué skill está corriendo en el momento en que se toma esa decisión — la guardia va ahí. Escribirla en un cuarto sitio es el mismo error una vez más, con más prosa. Y una skill que delega en otra declara el retorno: una entrega sin vuelta deja abierta la petición original mientras el primer artefacto sale con aspecto de terminado.", razon = "la Pista ubica la regla en la skill que decide", catalogoSkills = [{ id: "lore:vespi", nombre: "Vespi" }, { id: "lore:use-lore", nombre: "use-lore" }, { id: "lore:brainstorming-lore", nombre: "brainstorming-lore" }, { id: "lore:save-to-lore", nombre: "save-to-lore" }] } = {}) => ({
    instruccion,
    pistas: [{ referencia: "plugins/andamiaje/lore-plugin/lore/principios.md#4", pertinente: true, razon, contenido }],
    motivoSinPistas: null,
    catalogoSkillsOrigen: "Catálogo de skills de Codex observado en esta sesión (2026-10-07)",
    catalogoSkills,
    skillsSugeridas: [{ id: "lore:vespi", proposito: "coordinar la operación" }, { id: "lore:use-lore", proposito: "consultar el routing" }],
  });
  const recomendar = (contexto) => run(["recommend", "--root", root, "--json", j({
    modalidad: "secuencial-party-checkpoints",
    motivo: "la operación cruza áreas y tiene gates",
    tradeoff: "más checkpoints",
    alternativas: ["acompanada"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto,
  })]);
  const primera = recomendar(crearContexto("Continuar la misma operación Stradale 33"));
  assert.equal(primera.code, 0, primera.err);
  const huellaContexto = primera.json.offer.fundamento.huellaContexto;
  assert.match(huellaContexto, /^[0-9a-f]{64}$/);
  const coordinacion = {
    modalidad: primera.json.offer.modalidad,
    huellaContexto,
    skills: [
      { sugerida: "lore:vespi", decision: "accepted", elegida: "lore:vespi" },
      { sugerida: "lore:use-lore", decision: "accepted", elegida: "lore:use-lore" },
    ],
  };
  const hold = run(["hold", "--root", root, "--json", j({ goal: "Continuar Stradale 33", owner: "coordinador", authority: { spend: [] }, coordinacion })]);
  assert.equal(hold.code, 0, hold.err);

  const estable = run(["recommend", "--root", root, "--id", hold.json.id, "--json", j({
    modalidad: "acompanada",
    motivo: "la tarea solo requiere acompañamiento directo",
    tradeoff: "sin Advisor, Daimon o checkpoints",
    alternativas: ["secuencial-checkpoints"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto: {
      ...crearContexto("Continuar la misma operación Stradale 33", {
        razon: "la fuente ubica la regla junto a quien decide",
      }),
    },
  })]);
  assert.equal(estable.code, 0, estable.err);
  assert.equal(estable.json.offer.modalidad, "secuencial-party-checkpoints");
  assert.equal(estable.json.offer.requiere_eleccion, false);
  assert.equal(estable.json.offer.reanudada, true);
  assert.equal(estable.json.offer.motivo, null);
  assert.equal(estable.json.offer.tradeoff, null);
  assert.doesNotMatch(estable.json.offer.mensaje, /solo requiere acompañamiento|sin Advisor/i);
  assert.match(estable.json.offer.mensaje, /ya elegida para esta operación/i);
  assert.deepEqual(estable.json.offer.preferencia.skills, coordinacion.skills);

  const cambiado = run(["recommend", "--root", root, "--id", hold.json.id, "--json", j({
    modalidad: "secuencial-party-checkpoints",
    motivo: "la tarea ahora despliega un efecto externo",
    tradeoff: "más checkpoints y revisión de autoridad",
    alternativas: ["acompanada"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto: crearContexto("Continuar la misma operación Stradale 33", {
      contenido: "el criterio operativo cambió bajo la misma referencia",
    }),
  })]);
  assert.equal(cambiado.code, 0, cambiado.err);
  assert.equal(cambiado.json.offer.requiere_eleccion, true);
  assert.match(cambiado.json.offer.mensaje, /contexto cambió materialmente/i);
  assert.notEqual(cambiado.json.offer.fundamento.huellaContexto, huellaContexto);

  const catalogoCambio = run(["recommend", "--root", root, "--id", hold.json.id, "--json", j({
    modalidad: "secuencial-party-checkpoints",
    motivo: "la operación cruza áreas y tiene gates",
    tradeoff: "más checkpoints",
    alternativas: ["acompanada"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto: crearContexto("Continuar la misma operación Stradale 33", {
      catalogoSkills: [{ id: "lore:vespi", nombre: "Vespi" }, { id: "lore:use-lore", nombre: "use-lore" }, { id: "lore:brainstorming-lore", nombre: "brainstorming-lore" }, { id: "lore:save-to-lore", nombre: "save-to-lore" }, { id: "lore:create-area", nombre: "create-area" }],
    }),
  })]);
  assert.equal(catalogoCambio.code, 0, catalogoCambio.err);
  assert.equal(catalogoCambio.json.offer.requiere_eleccion, true);
  assert.notEqual(catalogoCambio.json.offer.fundamento.huellaContexto, huellaContexto);
});
test("la revision del Advisor debe ser independiente y la proxima accion sigue el gate", async (t) => {
  const { root, id } = await conOperacion(t);
  const spec = encargoDaimon(root);
  run(["plan", "--root", root, "--id", id, "--json", j(spec)]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  await writeFile(spec.output.path, "evidencia: entregada\n");
  run(["receive", "--root", root, "--id", id, "--task", "t1"]);

  const advisorAusente = run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ verdict: "accepted", reviewer: "advisor/model", checked: ["scope", "sources", "risks"], advisorRoute: { available: false, tool: "decide", observedBy: "coordinator" } })]);
  assert.equal(advisorAusente.code, 1);
  assert.match(advisorAusente.json.error, /blocked|decide/i);
  const bloqueada = await readOperation({ root, id });
  assert.equal(bloqueada.tasks[0].state, "blocked");
  assert.match(bloqueada.tasks[0].blocked.cause, /advisor.*unavailable|decide/i);
  assert.equal(bloqueada.next_legitimate_action, "resolve t1");
  const entregaOriginal = bloqueada.tasks[0].received;
  await writeFile(spec.output.path, "evidencia: alterada mientras faltaba Advisor\n");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const alterada = run(["receive", "--root", root, "--id", id, "--task", "t1"]);
    assert.equal(alterada.json.task.state, "blocked", "bytes nuevos no sustituyen la entrega pendiente de revision");
    const conservada = await readOperation({ root, id });
    assert.deepEqual(conservada.tasks[0].received, entregaOriginal);
    assert.match(conservada.tasks[0].blocked.cause, /advisor.*delivery.*changed/);
    assert.equal(conservada.next_legitimate_action, "resolve t1");
  }
  await writeFile(spec.output.path, "evidencia: entregada\n");
  const reporteFallido = run(["receive", "--root", root, "--id", id, "--task", "t1", "--json", j({ text: "Upstream request failed", exitCode: 0 })]);
  assert.equal(reporteFallido.json.task.state, "blocked", "una entrega identica no borra el fallo informado");
  assert.deepEqual(reporteFallido.json.task.received, entregaOriginal);
  const recibidaDeNuevo = run(["receive", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(recibidaDeNuevo.code, 0, recibidaDeNuevo.err);
  assert.deepEqual(recibidaDeNuevo.json.task.received, entregaOriginal);
  assert.equal((await readOperation({ root, id })).next_legitimate_action, "review t1");

  const autoRevision = run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ verdict: "accepted", reviewer: "opencode/m", checked: ["scope", "sources", "risks"], notes: "listo", advisorRoute: { available: true, tool: "decide", observedBy: "coordinator" } })]);
  assert.equal(autoRevision.code, 1);
  assert.match(autoRevision.json.error, /independent/i);

  const recibida = await readOperation({ root, id });
  assert.equal(recibida.next_legitimate_action, "review t1");

  const revision = run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ verdict: "accepted", reviewer: "advisor/model", checked: ["scope", "sources", "risks"], notes: "revisado", advisorRoute: { available: true, tool: "decide", observedBy: "coordinator" } })]);
  assert.equal(revision.json.task.state, "reviewed");
  assert.equal((await readOperation({ root, id })).next_legitimate_action, "verify t1");

  const mismoAdvisor = run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "advisor/model", observed: true, evidence: proofAt(root, id) })]);
  assert.equal(mismoAdvisor.code, 1);
  assert.match(mismoAdvisor.json.error, /independent/i);

  const verificacion = run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: proofAt(root, id) })]);
  assert.equal(verificacion.json.task.state, "verified");
  assert.equal((await readOperation({ root, id })).next_legitimate_action, "integrate t1");

  run(["integrate", "--root", root, "--id", id, "--task", "t1", "--json", j({ destination: "notas/cotejo.md" })]);
  assert.equal((await readOperation({ root, id })).next_legitimate_action, "close");
});

test("Gate B exige cada campo estructural y no confunde estructura con cierre", async () => {
  const { validateGateBContract } = await import("../skills/vespi/core/operation-state.mjs");
  const contract = {
    intent: "Completar la operacion",
    owner: "coordinador",
    authority: { spend: [] },
    scope: "solo el arbol local",
    expected_effect: "none",
    done: "evidencia observada y recibo guardado",
    roles: ["worker", "advisor", "verifier"],
    verifier: "verifier/model",
    receipt: { status: "pending" },
    state: "verified",
    next_action: "close",
  };
  assert.equal(typeof validateGateBContract, "function");
  assert.deepEqual(validateGateBContract(contract), { valid: true, missing: [] });
  for (const [field, label] of [
    ["intent", "intent"], ["owner", "owner"], ["authority", "authority"], ["scope", "scope"],
    ["expected_effect", "expected_effect"], ["done", "done"], ["roles", "tasks/roles"],
    ["verifier", "verifier"], ["receipt", "receipt"], ["state", "state"], ["next_action", "next_action"],
  ]) {
    const incomplete = { ...contract };
    delete incomplete[field];
    assert.throws(() => validateGateBContract(incomplete), new RegExp(label.replace("/", "\\/")));
    const advancing = { ...incomplete, state: "prepared", checkpoints: [], next_legitimate_action: "authorize" };
    if (field === "state") delete advancing.state;
    if (field === "next_action") delete advancing.next_legitimate_action;
    assert.throws(() => transitionArtifact(advancing, { state: "authorized", note: "authorize" }), new RegExp(label.replace("/", "\\/")));
  }
  const incompleteAuthorized = { ...contract, state: "authorized", next_legitimate_action: "dispatch", checkpoints: [] };
  for (const [field, label] of [
    ["intent", "intent"], ["owner", "owner"], ["authority", "authority"], ["scope", "scope"],
    ["expected_effect", "expected_effect"], ["done", "done"], ["roles", "tasks/roles"],
    ["verifier", "verifier"], ["receipt", "receipt"], ["state", "state"], ["next_action", "next_action"],
  ]) {
    const incomplete = { ...incompleteAuthorized };
    delete incomplete[field];
    if (field === "next_action") delete incomplete.next_legitimate_action;
    assert.throws(() => transitionArtifact(incomplete, { state: "running", note: "advance" }), new RegExp(label.replace("/", "\\/")));
  }
  assert.throws(() => closeOperation({
    ...contract, id: "op-gate-b", working_goal: contract.intent, tasks: [], effects: [], uncertainty: [], checkpoints: [],
    verification: null, state: "verified", next_legitimate_action: "close",
  }, { verification: { verified: true, by: "verifier/model", observed: true } }), /integrated task with independent verification/i);
});

test("la traza relacional se valida aparte del recibo y conserva el auto-reporte literal", async () => {
  const coordinator = await import("../skills/vespi/core/coordinator.mjs");
  const state = await import("../skills/vespi/core/operation-state.mjs");
  assert.equal(typeof coordinator.validateRelationalTrace, "function");
  assert.equal(typeof coordinator.recordInteractionTrace, "function");
  assert.equal(typeof coordinator.recordSelfReport, "function");
  const trace = [
    { id: "m1", type: "mismatch.observed", by: "assistant", at: 1, content: "La respuesta perdió la distinción." },
    { id: "c1", type: "correction.received", by: "user", at: 2, ref: "m1", content: "Separa picor e intensidad de velocidad." },
    { id: "r1", type: "response.revised", by: "assistant", at: 3, ref: "c1", before: "La velocidad sube con el picor.", after: "El picor acumula intensidad; la velocidad responde al último tramo." },
    { id: "d1", type: "distinction.proposed", by: "assistant", at: 4, content: "El picor se acumula; la velocidad no." },
    { id: "d2", type: "distinction.corrected", by: "user", at: 5, ref: "d1", content: "El picor se acumula; la velocidad no se acumula." },
    { id: "a1", type: "decision.applied", by: "assistant", at: 6, ref: "d2", input: "Elegir el ritmo de respuesta.", output: "Responder al último tramo de velocidad.", evidence: "La regla cambió la recomendación." },
  ];
  assert.equal(coordinator.validateRelationalTrace(trace).valid, true);
  for (let index = 0; index < trace.length; index += 1) {
    const broken = trace.filter((_, candidate) => candidate !== index);
    assert.throws(() => coordinator.validateRelationalTrace(broken), /trace|event|sequence|relation/i);
  }
  assert.throws(() => coordinator.validateRelationalTrace([...trace].reverse()), /trace|event|sequence|relation/i);
  assert.throws(() => coordinator.validateRelationalTrace(trace.map((event) => event.id === "r1" ? { ...event, after: trace[1].content } : event)), /echo|revised|response/i);
  assert.throws(() => coordinator.validateRelationalTrace(trace.map((event) => event.id === "d2" ? { ...event, ref: "missing" } : event)), /distinction|reference|relation/i);
  const otherPartyCanCorrect = trace.map((event) => event.id === "d1" ? { ...event, by: "user" } : event).map((event) => event.id === "d2" ? { ...event, by: "assistant" } : event);
  assert.equal(coordinator.validateRelationalTrace(otherPartyCanCorrect).valid, true);

  const artifact = state.createArtifact({ goal: "Relational trace", owner: "coordinator" });
  const traced = coordinator.recordInteractionTrace(artifact, trace);
  assert.deepEqual(traced.interaction_trace, trace);
  assert.deepEqual(traced.receipt, artifact.receipt);
  assert.equal(traced.verification, null);
  assert.equal(traced.self_report, null);
  const selfReport = coordinator.recordSelfReport(traced, {
    reported_by: "user",
    yo_tu: "uncertain",
    fertility: "negative",
    simplicity: "not_declared",
    recommend: "absent",
    raw_quote: "el entre fértil es aquel en el que uno desea volver",
  });
  assert.equal(selfReport.self_report.raw_quote, "el entre fértil es aquel en el que uno desea volver");
  assert.equal(selfReport.self_report.fertility, "negative");
  assert.equal(selfReport.self_report.yo_tu, "uncertain");
  assert.deepEqual(coordinator.recordSelfReport(selfReport, null).self_report, selfReport.self_report);
  assert.throws(() => coordinator.validateRelationalTrace(trace.map((event) => event.id === "m1" ? { ...event, content: "" } : event)), /mismatch|content/i);
  assert.equal(selfReport.id, artifact.id);
  assert.equal(coordinator.recordSelfReport(artifact, null).self_report, null);
});


test("la traza CLI conserva identidad y separación al guardar y reanudar", async (t) => {
  const { root, id } = await conOperacion(t);
  const trace = [
    { id: "m1", type: "mismatch.observed", by: "assistant", at: 1, content: "Se perdió la distinción." },
    { id: "c1", type: "correction.received", by: "user", at: 2, ref: "m1", content: "Separa el acuerdo de la ejecución." },
    { id: "r1", type: "response.revised", by: "assistant", at: 3, ref: "c1", before: "El plan ya ejecuta.", after: "El plan acuerda; el recibo demuestra ejecución." },
    { id: "d1", type: "distinction.proposed", by: "assistant", at: 4, content: "Acuerdo y ejecución tienen registros distintos." },
    { id: "d2", type: "distinction.corrected", by: "user", at: 5, ref: "d1", content: "El acuerdo fija límites; el recibo muestra qué se ejecutó." },
    { id: "a1", type: "decision.applied", by: "assistant", at: 6, ref: "d2", input: "Definir el cierre.", output: "Exigir recibo de ejecución independiente.", evidence: "La regla añadió un gate al cierre." },
  ];
  const traced = run(["trace", "--root", root, "--id", id, "--json", j({ events: trace })]);
  assert.equal(traced.code, 0, traced.err);
  const report = { reported_by: "user", yo_tu: "uncertain", fertility: "negative", raw_quote: "el entre fértil es aquel en el que uno desea volver" };
  const reported = run(["self-report", "--root", root, "--id", id, "--json", j({ report })]);
  assert.equal(reported.code, 0, reported.err);
  const firstSession = await readOperation({ root, id });
  const resumedSession = await readOperation({ root, id });
  assert.equal(resumedSession.id, id);
  assert.equal(resumedSession.state, firstSession.state);
  assert.deepEqual(resumedSession.authority, firstSession.authority);
  assert.equal(resumedSession.scope, firstSession.scope);
  assert.equal(resumedSession.next_legitimate_action, firstSession.next_legitimate_action);
  assert.deepEqual(resumedSession.interaction_trace, trace);
  assert.equal(resumedSession.receipt.status, "pending");
  assert.equal(resumedSession.verification, null);
  assert.deepEqual(resumedSession.self_report, { ...report, source: "coordinator-attestation" });
});


test("el snapshot terminal conserva Gate B y la identidad de la operacion", async (t) => {
  const root = await proyecto(t);
  let artifact = createArtifact({ goal: "Preservar el acuerdo", intent: "cerrar sin perder contexto", owner: "coordinador", authority: { spend: [], approvals: [] }, scope: "solo fixture", expected_effect: { kind: "none" }, done: "recibo observado", roles: ["worker", "advisor", "verifier"], verifier: "coordinador", receipt: { status: "observed", digest: "sha256:fixture" } });
  artifact.uncertainty = ["resultado externo no probado"];
  artifact.interaction_trace = [{ id: "event-1", type: "mismatch.observed", by: "assistant", at: 1 }];
  artifact.self_report = { reported_by: "user", fertility: "uncertain", raw_quote: "cita literal" };
  artifact.effect = "external";
  artifact.economy = { cost: { asset: "fixture", amount: "1" }, grant: "fixture-grant", settlement: "fixture-settlement" };
  artifact.chain = { placement: "off", class: "fixture", reason: "serialization only" };
  artifact.declared_effect = { asset: "fixture", amount: "1", to: "fixture-target" };
  const identity = artifact.id;
  for (const state of ["authorized", "running", "received", "reviewed", "verified"]) artifact = transitionArtifact(artifact, { state, note: state });
  artifact.tasks = [{ id: "t1", state: "integrated", executor: { by: "worker/model" }, review: { by: "advisor/model" }, verification: { by: "verifier/model", executed: true, evidence: {} } }];
  // Serialization fixture only: these records do not claim an executed review.
  artifact.tasks[0].received = { path: "fixture/result.md", sha256: "corrected-fixture" };
  artifact.tasks[0].review = { by: "advisor/model", verdict: "accepted", artifact_sha256: "corrected-fixture" };
  artifact.tasks[0].review_history = [{ received: { sha256: "rejected-fixture" }, review: { by: "advisor/model", verdict: "rejected", notes: "criterion not met", artifact_sha256: "rejected-fixture" }, verification: null }];
  artifact.verification = { verified: true, by: "verifier/model", observed: true };
  artifact = transitionArtifact(artifact, { state: "closed", note: "cierre" });
  await saveOperationState(root, artifact);
  const closed = await readOperation({ root, id: identity });
  assert.equal(closed.id, identity);
  assert.deepEqual(closed.authority, artifact.authority);
  assert.equal(closed.scope, artifact.scope);
  assert.deepEqual(closed.uncertainty, artifact.uncertainty);
  assert.equal(closed.next_legitimate_action, artifact.next_legitimate_action);
  assert.deepEqual(closed.receipt, artifact.receipt);
  assert.deepEqual(closed.interaction_trace, artifact.interaction_trace);
  assert.deepEqual(closed.self_report, artifact.self_report);
  for (const key of ["effect", "economy", "chain", "declared_effect"]) assert.deepEqual(closed[key], artifact[key], `terminal state keeps ${key}`);
  assert.deepEqual(closed.task_reviews, artifact.tasks.map(task => ({ task_id: task.id, received: task.received, review: task.review, review_history: task.review_history })));
});


test("un efecto externo exige permiso vigente para accion y destino exactos", async () => {
  const state = await import("../skills/vespi/core/operation-state.mjs");
  assert.equal(typeof state.requestExternalEffect, "function");
  assert.equal(typeof state.approveExternalEffect, "function");
  assert.equal(typeof state.revokeExternalEffectApproval, "function");
  assert.equal(typeof state.authorizeExternalEffect, "function");
  const requestedAt = "2026-10-07T12:00:00.000Z";
  const now = "2026-10-07T12:05:00.000Z";
  const artifact = createArtifact({ goal: "Gate externo", owner: "Andres", authority: { spend: [], generic: "avancemos" } });
  const request = state.requestExternalEffect(artifact, { action: "commit", destination: "lore-plugin:release/2.5-prep", at: requestedAt });
  assert.equal(state.authorizeExternalEffect(request, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:release/2.5-prep", now }).allowed, false);
  const approved = state.approveExternalEffect(request, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:release/2.5-prep", by: "Andres", words: "Autorizo solo commit en release/2.5-prep", approvedAt: "2026-10-07T12:01:00.000Z", expiresAt: "2026-10-07T12:10:00.000Z" });
  assert.equal(state.authorizeExternalEffect(approved, { requestId: request.external_effect_requests[0].id, action: "push", destination: "lore-plugin:release/2.5-prep", now }).allowed, false);
  assert.equal(state.authorizeExternalEffect(approved, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:main", now }).allowed, false);
  assert.equal(state.authorizeExternalEffect(approved, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:release/2.5-prep", requestedAt: "2026-10-07T12:02:00.000Z", now }).allowed, false);
  const permission = state.authorizeExternalEffect(approved, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:release/2.5-prep", now });
  assert.equal(permission.allowed, true);
  const receivedByAdapter = [];
  const adapter = (input) => receivedByAdapter.push(input);
  adapter(permission.adapterInput);
  assert.deepEqual(receivedByAdapter, [{ action: "commit", destination: "lore-plugin:release/2.5-prep" }]);
  const revoked = state.revokeExternalEffectApproval(approved, { approvalId: permission.approvalId, at: "2026-10-07T12:04:00.000Z" });
  assert.equal(state.authorizeExternalEffect(revoked, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:release/2.5-prep", now }).allowed, false);
  assert.equal(state.authorizeExternalEffect(approved, { requestId: request.external_effect_requests[0].id, action: "commit", destination: "lore-plugin:release/2.5-prep", now: "2026-10-07T12:11:00.000Z" }).allowed, false);
});


test("la CLI solo devuelve permiso exacto y vigente sin ejecutar el efecto", async (t) => {
  const { root, id } = await conOperacion(t);
  const request = run(["request-effect", "--root", root, "--id", id, "--json", j({ action: "commit", destination: "lore-plugin:release/2.5-prep", at: "2026-10-07T12:00:00.000Z" })]);
  assert.equal(request.code, 0, request.err);
  const requestId = request.json.request.id;
  const before = run(["effect-permission", "--root", root, "--id", id, "--json", j({ requestId, action: "commit", destination: "lore-plugin:release/2.5-prep", now: "2026-10-07T12:05:00.000Z" })]);
  assert.equal(before.json.allowed, false);
  const approval = run(["approve-effect", "--root", root, "--id", id, "--json", j({ requestId, action: "commit", destination: "lore-plugin:release/2.5-prep", by: "Andres", words: "Autorizo solo commit en release/2.5-prep", approvedAt: "2026-10-07T12:01:00.000Z", expiresAt: "2026-10-07T12:10:00.000Z" })]);
  assert.equal(approval.code, 0, approval.err);
  const permission = run(["effect-permission", "--root", root, "--id", id, "--json", j({ requestId, action: "commit", destination: "lore-plugin:release/2.5-prep", now: "2026-10-07T12:05:00.000Z" })]);
  assert.equal(permission.json.allowed, true);
  assert.deepEqual(permission.json.adapterInput, { action: "commit", destination: "lore-plugin:release/2.5-prep" });
  const mismatch = run(["effect-permission", "--root", root, "--id", id, "--json", j({ requestId, action: "push", destination: "lore-plugin:release/2.5-prep", now: "2026-10-07T12:05:00.000Z" })]);
  assert.equal(mismatch.json.allowed, false);
  assert.equal(mismatch.json.effect, undefined);
});


test("el reporte ausente no borra una declaracion previa", async (t) => {
  const { root, id } = await conOperacion(t);
  const report = run(["self-report", "--root", root, "--id", id, "--json", j({ report: { reported_by: "user", fertility: "affirmative" } })]);
  assert.equal(report.code, 0, report.err);
  const absent = run(["self-report", "--root", root, "--id", id, "--json", j({})]);
  assert.equal(absent.code, 1);
  const saved = await readOperation({ root, id });
  assert.equal(saved.self_report.fertility, "affirmative");
});


test("cambiar de rol, modelo y herramienta declarados conserva el artifact y su gate", async (t) => {
  const root = await proyecto(t);
  const coordinacion = { modalidad: "secuencial-party-checkpoints", skills: [{ sugerida: "lore:vespi", decision: "accepted", elegida: "lore:vespi" }, { sugerida: "lore:use-lore", decision: "accepted", elegida: "lore:use-lore" }] };
  const held = run(["hold", "--root", root, "--json", j({ goal: "Misma operación", owner: "coordinador", authority: { spend: [] }, scope: "solo fixture", expected_effect: { kind: "none" }, done: "recibo observado", roles: ["worker", "advisor", "verifier"], verifier: "coordinador", coordinacion })]);
  const id = held.json.id;
  run(["authorize", "--root", root, "--id", id, "--json", j({ by: "Andres", words: "corre el cotejo local" })]);
  const worker = { role: "worker", scope: "fixture local", question: "producir evidencia", output: { path: join(root, "worker.md") }, timeoutMs: 600000, nextCheckAt: futuro(60000), done_criterion: "evidencia", proof: "digest" };
  const advisor = { role: "advisor", scope: "fixture local", context: "artefacto local y acuerdo", question: "contrastar el artefacto", output: { path: join(root, "advisor.md") }, timeoutMs: 600000, nextCheckAt: futuro(60000), done_criterion: "veredicto", proof: "respuesta de revisión" };
  const planWorker = run(["plan", "--root", root, "--id", id, "--json", j(worker)]);
  assert.equal(planWorker.json.ok, true, planWorker.err);
  const dispatchWorker = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "delegate", "--json", j({ hostName: "opencode", model: "zen-model-a", effort: "medium" })]);
  assert.equal(dispatchWorker.json.ok, true, dispatchWorker.err);
  const before = await readOperation({ root, id });
  const planAdvisor = run(["plan", "--root", root, "--id", id, "--json", j(advisor)]);
  assert.equal(planAdvisor.json.ok, true, planAdvisor.err);
  const dispatchAdvisor = run(["dispatch", "--root", root, "--id", id, "--task", "t2", "--tools", "decide", "--json", j({ hostName: "codex", model: "zen-model-b", effort: "high" })]);
  assert.equal(dispatchAdvisor.json.ok, true, dispatchAdvisor.err);
  const after = await readOperation({ root, id });
  assert.equal(after.id, before.id);
  assert.equal(after.state, before.state);
  assert.deepEqual(after.uncertainty, before.uncertainty);
  assert.deepEqual(after.authority, before.authority);
  assert.equal(after.scope, before.scope);
  assert.equal(after.next_legitimate_action, before.next_legitimate_action);
  assert.deepEqual(after.coordinacion, before.coordinacion);
  assert.equal(after.tasks[0].declared_route.model, "zen-model-a");
  assert.equal(after.tasks[1].declared_route.model, "zen-model-b");
  assert.equal(after.tasks[0].executor, null);
  assert.equal(after.tasks[1].executor, null);
});
