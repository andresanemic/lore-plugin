// RC7 - la CLI de la operacion: lo que el coordinador hace con la mano, comando por comando, contra FASES.md.
// Contrato: `node scripts/lore-plugin.mjs operation <sub> --root <dir> [--id <op>] [--task <t>] [--json '<obj>' | --file <ruta>]`.
// Cada comando imprime UNA linea JSON en stdout ({ok, ...}); un error sale con codigo 1 y {ok:false, error}.
// Las tareas se despachan declarando las herramientas del host que quien opera OBSERVO (--tools); la CLI no las simula.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { observeTask } from "../skills/vespi/core/coordinator.mjs";

const CLI = resolve(dirname(fileURLToPath(import.meta.url)), "lore-plugin.mjs");
const MODULO = resolve(dirname(fileURLToPath(import.meta.url)), "operation-cli.mjs");

function run(args, { input } = {}) {
  const r = spawnSync(process.execPath, [CLI, "operation", ...args], { encoding: "utf8", input });
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
  const h = run(["hold", "--root", root, "--json", j({ goal: "Cotejar la propuesta", owner: "coordinador", authority: { spend: [] } })]);
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

test("dispatch con la herramienta observada deja la tarea running con su ejecutor real", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const d = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute",
    "--json", j({ hostName: "opencode", model: "space-bunny-free", effort: "low", process: 4242 })]);
  assert.equal(d.json.ok, true);
  assert.equal(d.json.task.state, "running");
  assert.equal(d.json.task.executor.by, "opencode/space-bunny-free");
});

test("dispatch sin la herramienta queda blocked con su salida y NO simula un ejecutor", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j(encargoDaimon(root))]);
  const d = run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "delegate", "--json", j({ hostName: "claude", model: "x" })]);
  assert.equal(d.code, 0);
  assert.equal(d.json.task.state, "blocked");
  assert.equal(d.json.task.executor, null);
  assert.match(d.json.task.blocked.next_action, /\S/);
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
  const rv = run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ reviewer: "coordinador", checked: ["scope", "sources", "risks"], notes: "ok" })]);
  assert.equal(rv.json.task.state, "reviewed");
  const propio = run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "opencode/m", observed: true, evidence: "x" })]);
  assert.equal(propio.code, 1, "quien ejecuto no verifica");
  assert.match(propio.json.error, /independent/);
  const vf = run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: "releido el archivo" })]);
  assert.equal(vf.json.task.state, "verified");
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
  assert.equal(run(["status", "--root", root, "--id", id]).json.tasks[0].state, "running");
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

test("status resume el estado en una linea por tarea y marca la tarea vencida", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j({ ...encargoDaimon(root), timeoutMs: 1 })]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const ob = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ text: "sigue vivo", alive: true, at: new Date(Date.now() + 60_000).toISOString() })]);
  assert.equal(ob.json.task.overdue, true);
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.state, "running");
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
  const semilla = resolve(dirname(fileURLToPath(import.meta.url)), "..", "skills", "vespi", "core", "calibration-seed.json");
  const original = await readFile(semilla, "utf8");
  t.after(() => writeFile(semilla, original));
  // El top es proteccion contra colgados (ley #53), no una estimacion: la semilla no lo toca.
  const conSemilla = run(["status", "--root", root, "--id", id]);
  assert.match(conSemilla.json.calibrationLines[0].line, /^referencia inicial \(no medida en tu máquina\)/);
  assert.match(conSemilla.json.calibrationLines[0].line, /del orden de 22 min, hasta unos 32 min/);
  assert.equal(conSemilla.json.calibrationLines[0].line.includes(String(conSemilla.json.tasks[0].timeoutMs)), false);
  for (const cuerpo of ["{ corrupt", "[]", "null", JSON.stringify({ entries: [{ kind: "build", samples: 1, medianMinutes: 1, p80Minutes: 1, minMinutes: 1, maxMinutes: 1 }] })]) {
    await writeFile(semilla, cuerpo);
    const status = run(["status", "--root", root, "--id", id]);
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
  const running = { tasks: [{ id: "t1", state: "running", observations: [], deadline: "2020-01-01T00:00:00.000Z", overdue: true }] };
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
  run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ reviewer: "coordinador", checked: ["scope", "sources", "risks"], notes: "ok" })]);
  run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: "releido" })]);
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
  run(["review", "--root", root, "--id", id, "--task", "t1", "--json", j({ reviewer: "coordinador", checked: ["scope", "sources", "risks"], notes: "ok" })]);
  run(["verify", "--root", root, "--id", id, "--task", "t1", "--json", j({ verifier: "coordinador", observed: true, evidence: "releido" })]);
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
