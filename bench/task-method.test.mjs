// L1 de 2.5.3 - el metodo viaja dentro del encargo. Un trabajador recibe, en el limite de
// host.delegate(request), el texto de skills/vespi/method.md que distribuye el kit, junto con el mismo
// objetivo, las fuentes y el criterio de terminado. No depende de ninguna skill Fable instalada en el
// home: el home de la prueba esta vacio. Sin metodo no hay ejecucion, y una tarea no queda `running`
// porque el host exponga una funcion que nadie llamo.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const V = "../skills/vespi/core/vespi.mjs";
const METODO = fileURLToPath(new URL("../skills/vespi/method.md", import.meta.url));
const MANDATO = { spend: [{ asset: "lectura", maxAmount: "1", to: "portal-clientes" }] };
const OBJETIVO = "Fusionar los tres ensayos en una sola pieza";
const futuro = (ms = 600_000) => new Date(Date.now() + ms).toISOString();
const sha = (text) => createHash("sha256").update(text).digest("hex");

async function homeVacio(t) {
  const home = await mkdtemp(join(tmpdir(), "task-method-home-"));
  const previo = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE };
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  t.after(async () => {
    for (const [key, value] of Object.entries(previo)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(home, { recursive: true, force: true });
  });
  return home;
}

async function trabajadorPlanificado(t) {
  const root = await mkdtemp(join(tmpdir(), "task-method-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const f = await import(V);
  let a = f.createArtifact({ goal: OBJETIVO, owner: "coordinador", authority: MANDATO, scope: "tres ensayos y su fusion", expected_effect: { kind: "none" }, done: "fusion revisada contra el encargo", roles: ["worker", "verifier"], verifier: "verificador" });
  a = f.transitionArtifact(a, { state: "authorized", note: "la persona autorizo correr" });
  const planned = f.planTask(a, {
    role: "worker",
    question: "Fusiona confianza, valor de los aportes y apelacion en una sola pieza",
    sources: ["ensayos/confianza.md", "ensayos/aportes.md", "ensayos/apelacion.md"],
    scope: "solo la pieza fusionada; los originales no se tocan",
    done_criterion: "una pieza que cubre los tres ensayos y ningun otro tema",
    proof: "contraste de la pieza contra los tres originales y el encargo",
    output: { path: join(root, "fusion.md") },
    timeoutMs: 600_000,
    nextCheckAt: futuro(60_000),
  });
  return { f, root, artifact: planned.artifact };
}

function hostQueRegistra() {
  const recibido = [];
  return {
    recibido,
    host: { delegate: async (request) => { recibido.push(structuredClone(request)); return { recipient: "trabajador-1", received_sha256: sha(request.prompt), kind: request.kind }; } },
  };
}

test("worker receives the shipped method without an external skill", async (t) => {
  const home = await homeVacio(t);
  assert.deepEqual(await readdir(home), [], "el home de la prueba debe estar vacio: ninguna skill Fable instalada");
  const { f, artifact } = await trabajadorPlanificado(t);
  const { host, recibido } = hostQueRegistra();
  const metodo = await readFile(METODO, "utf8");

  const despachada = await f.deliverTask(artifact, "t1", { host, hostName: "host-prueba", model: "m" });

  assert.equal(recibido.length, 1, "el host recibe exactamente una entrega");
  const paquete = recibido[0].package;
  assert.equal(paquete.method.content, metodo, "el trabajador recibe el texto distribuido por el kit, no un enlace");
  assert.equal(paquete.method.sha256, sha(metodo));
  assert.equal(paquete.operationId, artifact.id);
  assert.equal(paquete.taskId, "t1");
  assert.equal(paquete.goal, OBJETIVO);
  assert.deepEqual(paquete.sources, ["ensayos/confianza.md", "ensayos/aportes.md", "ensayos/apelacion.md"]);
  assert.equal(paquete.done, "una pieza que cubre los tres ensayos y ningun otro tema");
  assert.equal(paquete.proof, "contraste de la pieza contra los tres originales y el encargo");
  assert.equal(paquete.scope, "solo la pieza fusionada; los originales no se tocan");

  const tarea = despachada.tasks[0];
  assert.equal(tarea.state, "running");
  assert.equal(tarea.delivery.method_sha256, sha(metodo));
  assert.equal(tarea.delivery.recipient, "trabajador-1", "el destinatario lo dice el host, no el trabajador");
  assert.equal(tarea.delivery.observed_by, "adapter-acknowledgement", "un acuse del adaptador no es una observacion del host");
  assert.equal(tarea.delivery.host_observation, null);
  assert.equal(recibido[0].kind, "task");
  assert.equal(typeof recibido[0].prompt, "string");
  assert.ok(recibido[0].prompt.includes(metodo), "el prompt que cruza el limite lleva el metodo entero");
  assert.equal(tarea.delivery.package_sha256, sha(recibido[0].prompt), "la huella es la del prompt que cruzo el limite");
  assert.deepEqual(paquete.limits, MANDATO, "el trabajador recibe los limites de la operacion");
  assert.equal(despachada.method.sha256, sha(metodo), "la operacion fija el metodo con que se planifico");
});

test("suppressing the method fails before the worker runs", async (t) => {
  await homeVacio(t);
  const { f, artifact } = await trabajadorPlanificado(t);
  const { host, recibido } = hostQueRegistra();
  await assert.rejects(() => f.deliverTask(artifact, "t1", { host, hostName: "host-prueba", methodText: "" }), /method/i);
  await assert.rejects(() => f.deliverTask(artifact, "t1", { host, hostName: "host-prueba", methodText: "   \n" }), /method/i);
  assert.equal(recibido.length, 0, "sin metodo no se llama al host");
});

test("a worker is never running because the host merely exposes delegate", async (t) => {
  const { f, artifact } = await trabajadorPlanificado(t);
  const { host, recibido } = hostQueRegistra();
  let resultado = null;
  try {
    resultado = f.dispatchTask(artifact, "t1", { host, hostName: "host-prueba", model: "m" });
  } catch (error) {
    assert.match(error.message, /deliver/i, "el rechazo nombra la entrega que falta");
  }
  if (resultado !== null) assert.notEqual(resultado.tasks[0].state, "running", "exponer delegate no ejecuta nada");
  assert.equal(recibido.length, 0);
});

test("a host that fails to take the package leaves the task blocked, not running", async (t) => {
  const { f, artifact } = await trabajadorPlanificado(t);
  const host = { delegate: async () => { throw new Error("host sin cupo"); } };
  const despachada = await f.deliverTask(artifact, "t1", { host, hostName: "host-prueba" });
  const tarea = despachada.tasks[0];
  assert.equal(tarea.state, "blocked");
  assert.match(tarea.blocked.cause, /host sin cupo/);
  assert.equal(tarea.executor, null);
});

test("an adapter that does not acknowledge the exact prompt leaves the task blocked", async (t) => {
  const { f, artifact } = await trabajadorPlanificado(t);
  for (const respuesta of [undefined, {}, { recipient: "w" }, { recipient: "", received_sha256: "x" }, { recipient: "w", received_sha256: "0".repeat(64) }]) {
    const host = { delegate: async () => respuesta };
    const tarea = (await f.deliverTask(artifact, "t1", { host, hostName: "host-prueba" })).tasks[0];
    assert.equal(tarea.state, "blocked", `respuesta ${JSON.stringify(respuesta)} no acredita la entrega`);
    assert.equal(tarea.executor, null);
    assert.equal(tarea.delivery.delivered, false);
  }
});

test("a caller cannot pass a delivery to dispatchTask to skip the host", async (t) => {
  const { f, artifact } = await trabajadorPlanificado(t);
  const { host, recibido } = hostQueRegistra();
  const forjada = { delivered: true, recipient: "nadie", package_sha256: "0".repeat(64), method_sha256: "0".repeat(64) };
  assert.throws(() => f.dispatchTask(artifact, "t1", { host, hostName: "host-prueba", delivery: forjada }), /deliver/i);
  assert.equal(recibido.length, 0);
});

test("a method text that differs from the one pinned in the operation is refused before the host", async (t) => {
  const { f, artifact } = await trabajadorPlanificado(t);
  const { host, recibido } = hostQueRegistra();
  await assert.rejects(() => f.deliverTask(artifact, "t1", { host, hostName: "host-prueba", methodText: "otro metodo escrito a mano" }), /pinned|fijad/i);
  assert.equal(recibido.length, 0);
});

test("planning pins the shipped method in the operation and the pin survives persistence", async (t) => {
  const { f, root, artifact } = await trabajadorPlanificado(t);
  const metodo = await readFile(METODO, "utf8");
  assert.equal(artifact.method.sha256, sha(metodo));
  await f.saveOperationState(root, artifact);
  const leida = await f.loadOperationState(root, artifact.id);
  assert.equal(leida.method.sha256, sha(metodo));
});


async function delegacionDurable(t, assignment) {
  const root = await mkdtemp(join(tmpdir(), "task-method-durable-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const f = await import(V);
  const vistos = [];
  const delegate = async (request) => { vistos.push(structuredClone(request)); return { ok: true, output: "entrega", evidence: { artifact: "src/index.mjs", reviewed: false } }; };
  delegate.effectiveTerms = async () => ({ asset: "lectura", amount: "1", to: "portal-clientes" });
  const run = () => f.runDurableOperation({
    scope: "fixture", expected_effect: { kind: "none" }, done: "recibo real", roles: ["worker", "verifier"], verifier: "fixture-verifier",
    root, goal: OBJETIVO, owner: "coordinador", authority: MANDATO, intent: "delegation", assignment,
    declaredEffect: { asset: "lectura", amount: "1", to: "portal-clientes" },
    capability: { id: "leer", required: () => ({ spend: [{ asset: "lectura", amount: "1", to: "portal-clientes" }] }), perform: async () => ({}) },
    host: { delegate },
    io: { verify: async () => ({ verified: true, checks: { leido: true }, reason: "fixture" }) },
  });
  return { f, run, vistos };
}

test("a durable delegation without the shipped method never reaches the worker", async (t) => {
  const { run, vistos } = await delegacionDurable(t, { task: "Lee el modulo", medium: { cwd: "/repo" } });
  await assert.rejects(run, /method/i);
  assert.equal(vistos.length, 0, "sin metodo no se llama al adaptador");
});

test("a durable delegation carries the shipped method to the worker", async (t) => {
  const metodo = await readFile(METODO, "utf8");
  const f = await import(V);
  const { content, sha256 } = f.loadShippedMethod();
  const { run, vistos } = await delegacionDurable(t, { task: "Lee el modulo", medium: { cwd: "/repo" }, method: { content, sha256 } });
  await run();
  assert.equal(vistos.length, 1);
  assert.equal(vistos[0].assignment.method.content, metodo);
  assert.equal(vistos[0].assignment.method.sha256, sha(metodo));
});

test("a durable delegation with a method other than the shipped one is refused", async (t) => {
  const { run, vistos } = await delegacionDurable(t, { task: "Lee el modulo", method: { content: "otro", sha256: sha("otro") } });
  await assert.rejects(run, /method/i);
  assert.equal(vistos.length, 0);
});

test("the pinned method survives a resume from disk and still reaches the worker", async (t) => {
  const { f, root, artifact } = await trabajadorPlanificado(t);
  await f.saveOperationState(root, artifact);
  const retomada = await f.loadOperationState(root, artifact.id);
  const { host, recibido } = hostQueRegistra();
  const metodo = await readFile(METODO, "utf8");
  const despachada = await f.deliverTask(retomada, "t1", { host, hostName: "host-prueba" });
  assert.equal(despachada.tasks[0].state, "running");
  assert.equal(recibido[0].package.method.content, metodo, "tras reanudar, el trabajador recibe el mismo metodo fijado");
  assert.equal(despachada.method.sha256, artifact.method.sha256);
});
