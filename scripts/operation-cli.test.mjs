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

function run(args, { input } = {}) {
  const r = spawnSync(process.execPath, [CLI, "operation", ...args], { encoding: "utf8", input });
  let json = null;
  const line = r.stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  try { json = line ? JSON.parse(line) : null; } catch { json = null; }
  return { code: r.status, out: r.stdout, err: r.stderr, json };
}
const j = (o) => JSON.stringify(o);
const futuro = (ms = 600_000) => new Date(Date.now() + ms).toISOString();

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

test("status resume el estado en una linea por tarea y marca la tarea vencida", async (t) => {
  const { root, id } = await conOperacion(t);
  run(["plan", "--root", root, "--id", id, "--json", j({ ...encargoDaimon(root), timeoutMs: 1 })]);
  run(["dispatch", "--root", root, "--id", id, "--task", "t1", "--tools", "execute", "--json", j({ hostName: "opencode", model: "m" })]);
  const ob = run(["observe", "--root", root, "--id", id, "--task", "t1", "--json", j({ text: "sigue vivo", alive: true, at: new Date(Date.now() + 60_000).toISOString() })]);
  assert.equal(ob.json.task.overdue, true);
  const s = run(["status", "--root", root, "--id", id]);
  assert.equal(s.json.state, "running");
  assert.deepEqual(Object.keys(s.json.tasks[0]).sort(), ["by", "id", "nextCheckAt", "overdue", "role", "state"]);
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
