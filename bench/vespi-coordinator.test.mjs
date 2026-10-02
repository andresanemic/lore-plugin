// RC7 - el flujo del coordinador: tareas por rol dentro de una operacion, con lo que exige la Spec 014 (estado,
// responsables reales, timeout y proxima observacion antes de lanzar, recibida/revisada/verificada/integrada
// como hechos distintos) y la Spec 015 (Daimon, Advisor y trabajador con su encargo; una herramienta ausente es
// un bloqueo, nunca una invocacion simulada; la verificacion no la hace quien ejecuto). Incluye la economia
// declarada de una operacion con efecto externo (criterio 10) y la declaracion de lo que va en cadena (criterio 11).
// Todo corre contra la fachada real y un directorio temporal; no abre una sesion de host ni simula un permiso nativo.
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const V = "../skills/vespi/core/vespi.mjs";
const MANDATO = { spend: [{ asset: "lectura", maxAmount: "1", to: "portal-clientes" }] };
const OBJETIVO = "Cotejar la propuesta contra sus fuentes";

async function proyecto(t) {
  const root = await mkdtemp(join(tmpdir(), "vespi-coordinator-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function autorizada() {
  const f = await import(V);
  let a = f.createArtifact({ goal: OBJETIVO, owner: "coordinador", authority: MANDATO });
  a = f.transitionArtifact(a, { state: "authorized", note: "la persona autorizo correr" });
  return { f, a };
}

const futuro = (ms = 600_000) => new Date(Date.now() + ms).toISOString();
const daimon = (root, extra = {}) => ({
  role: "daimon",
  question: "Que dicen las fuentes oficiales sobre el pasaje X?",
  sources: ["https://example.test/norma"],
  output: { path: join(root, "daimon.md") },
  timeoutMs: 600_000,
  nextCheckAt: futuro(60_000),
  ...extra,
});
const HOST_CON_EJECUTOR = { execute: async () => ({}) };

test("la fachada expone el flujo del coordinador", async () => {
  const f = await import(V);
  for (const name of ["declareEffect", "planTask", "dispatchTask", "observeTask", "receiveTask", "reviewTask", "verifyTask", "integrateTask", "closeOperation", "taskSummary"]) {
    assert.equal(typeof f[name], "function", `la fachada no expone ${name}`);
  }
});

// A - el encargo de cada rol

test("planificar una tarea exige timeout y proxima observacion antes de lanzar", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  assert.throws(() => f.planTask(a, daimon(root, { timeoutMs: undefined })), /timeout/i);
  assert.throws(() => f.planTask(a, daimon(root, { nextCheckAt: undefined })), /next check|nextCheckAt/i);
  assert.throws(() => f.planTask(a, daimon(root, { timeoutMs: 0 })), /timeout/i);
  const { artifact, task } = f.planTask(a, daimon(root));
  assert.equal(task.id, "t1");
  assert.equal(task.state, "proposed");
  assert.equal(artifact.tasks.length, 1);
  assert.deepEqual([...task.must_declare].sort(), ["evidence", "limits"], "Daimon debe declarar evidencia y limites");
});

test("cada rol recibe su encargo completo o no se planifica", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  assert.throws(() => f.planTask(a, { ...daimon(root), role: "inventado" }), /role/i);
  assert.throws(() => f.planTask(a, daimon(root, { sources: [] })), /sources|fuentes/i);
  const advisor = { role: "advisor", question: "Hay un hueco en esta decision?", output: { path: join(root, "advisor.md") }, timeoutMs: 300_000, nextCheckAt: futuro(60_000) };
  assert.throws(() => f.planTask(a, advisor), /context/i);
  assert.ok(f.planTask(a, { ...advisor, context: "extracto minimo de la decision" }).task);
  const worker = { role: "worker", question: "Implementa la funcion X", output: { path: join(root, "worker.md") }, timeoutMs: 900_000, nextCheckAt: futuro(60_000) };
  assert.throws(() => f.planTask(a, worker), /scope|done_criterion|proof/i);
  assert.ok(f.planTask(a, { ...worker, scope: "src/x.js", done_criterion: "la prueba pasa", proof: "node --test" }).task);
});

// B - lanzar: una herramienta ausente bloquea, y lo real queda registrado

test("sin la herramienta del host la tarea queda bloqueada, nunca ejecutandose, y no se inventa un ejecutor", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const planned = f.planTask(a, daimon(root));
  const out = f.dispatchTask(planned.artifact, "t1", { host: {}, hostName: "opencode", model: "m", effort: "high" });
  const task = out.tasks[0];
  assert.equal(task.state, "blocked");
  assert.match(task.blocked.cause, /does not expose execute/);
  assert.ok(task.blocked.next_action.length > 0, "un bloqueo sin siguiente accion no se puede retomar");
  assert.equal(task.executor, null);
});

test("lanzar registra el ejecutor real, la hora, el deadline y deja la operacion corriendo", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const planned = f.planTask(a, daimon(root));
  const out = f.dispatchTask(planned.artifact, "t1", { host: HOST_CON_EJECUTOR, hostName: "opencode", model: "space-bunny-free", effort: "default", process: "pid 1234" });
  const task = out.tasks[0];
  assert.equal(task.state, "running");
  assert.equal(task.executor.by, "opencode/space-bunny-free");
  assert.equal(task.executor.effort, "default");
  assert.equal(task.executor.process, "pid 1234");
  assert.ok(Date.parse(task.executor.startedAt) <= Date.now());
  assert.equal(Date.parse(task.deadline) - Date.parse(task.executor.startedAt), 600_000);
  assert.equal(out.state, "running");
});

test("un modelo o esfuerzo no informados se registran como desconocidos, no se inventan", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const planned = f.planTask(a, daimon(root));
  const task = f.dispatchTask(planned.artifact, "t1", { host: HOST_CON_EJECUTOR, hostName: "opencode" }).tasks[0];
  assert.equal(task.executor.model, "unknown");
  assert.equal(task.executor.effort, "unknown");
});

test("no se lanza dentro de una operacion que nadie autorizo a correr", async (t) => {
  const root = await proyecto(t);
  const f = await import(V);
  const preparada = f.createArtifact({ goal: OBJETIVO, owner: "coordinador", authority: MANDATO });
  const planned = f.planTask(preparada, daimon(root));
  assert.throws(() => f.dispatchTask(planned.artifact, "t1", { host: HOST_CON_EJECUTOR, hostName: "opencode", model: "m", effort: "e" }), /authoriz/i);
});

test("la ruta de cada rol sale de lo que el host expone: advisor decide, trabajador delega", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const advisor = f.planTask(a, { role: "advisor", question: "Hay un hueco?", context: "extracto", output: { path: join(root, "a.md") }, timeoutMs: 1000, nextCheckAt: futuro() });
  assert.equal(f.dispatchTask(advisor.artifact, "t1", { host: { execute: () => {} } }).tasks[0].state, "blocked");
  assert.equal(f.dispatchTask(advisor.artifact, "t1", { host: { decide: () => {} }, hostName: "claude", model: "opus" }).tasks[0].state, "running");
  const worker = f.planTask(a, { role: "worker", question: "q", scope: "s", done_criterion: "d", proof: "p", output: { path: join(root, "w.md") }, timeoutMs: 1000, nextCheckAt: futuro() });
  assert.equal(f.dispatchTask(worker.artifact, "t1", { host: { delegate: () => {} }, hostName: "opencode", model: "m" }).tasks[0].state, "running");
});

// C - observar y recibir: lo que se dice haber visto, y el archivo que existe

test("observar registra que se vio y cuando; una fecha pasada sin observacion nueva marca vencida, no viva", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  let art = f.planTask(a, daimon(root, { timeoutMs: 1000 })).artifact;
  art = f.dispatchTask(art, "t1", { host: HOST_CON_EJECUTOR, hostName: "opencode", model: "m", effort: "e" });
  const luego = new Date(Date.now() + 60_000).toISOString();
  const obs = f.observeTask(art, "t1", { text: "el proceso sigue sin salida", alive: false, at: luego });
  assert.equal(obs.tasks[0].observations.at(-1).at, luego);
  assert.equal(obs.tasks[0].overdue, true);
  const planificada = f.planTask(a, daimon(root));
  assert.throws(() => f.observeTask(planificada.artifact, "t1", { text: "x" }), /running/i);
});

test("recibida significa que el artefacto existe en la ruta declarada, con su huella real", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  let art = f.planTask(a, daimon(root)).artifact;
  art = f.dispatchTask(art, "t1", { host: HOST_CON_EJECUTOR, hostName: "opencode", model: "m", effort: "e" });
  await assert.rejects(() => f.receiveTask(art, "t1", {}), /does not exist|ENOENT|no existe/i);
  const contenido = "# hallazgos\n- uno\n";
  await writeFile(join(root, "daimon.md"), contenido);
  const recibida = await f.receiveTask(art, "t1", {});
  const t1 = recibida.tasks[0];
  assert.equal(t1.state, "received");
  assert.equal(t1.received.sha256, createHash("sha256").update(contenido).digest("hex"));
  assert.equal(t1.received.bytes, Buffer.byteLength(contenido));
  assert.equal(t1.received.path, join(root, "daimon.md"));
});

// D - revisada, verificada, integrada: tres hechos y ninguno se infiere del anterior

async function recibidaDe(f, a, root) {
  let art = f.planTask(a, daimon(root)).artifact;
  art = f.dispatchTask(art, "t1", { host: HOST_CON_EJECUTOR, hostName: "opencode", model: "space-bunny-free", effort: "e" });
  await writeFile(join(root, "daimon.md"), "salida");
  return f.receiveTask(art, "t1", {});
}

test("revisar exige haber cotejado alcance, fuentes y riesgos", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const recibida = await recibidaDe(f, a, root);
  assert.throws(() => f.reviewTask(recibida, "t1", { reviewer: "coordinador", checked: ["scope"] }), /scope|sources|risks/i);
  const revisada = f.reviewTask(recibida, "t1", { reviewer: "coordinador", checked: ["scope", "sources", "risks"], notes: "coincide con el encargo" });
  assert.equal(revisada.tasks[0].state, "reviewed");
});

test("verificar no lo hace quien ejecuto, y exige haber observado el criterio", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const recibida = await recibidaDe(f, a, root);
  const revisada = f.reviewTask(recibida, "t1", { reviewer: "coordinador", checked: ["scope", "sources", "risks"] });
  assert.throws(() => f.verifyTask(revisada, "t1", { verifier: "opencode/space-bunny-free", observed: true, evidence: "x" }), /independent/i);
  assert.throws(() => f.verifyTask(revisada, "t1", { verifier: "coordinador", observed: false, evidence: "x" }), /observed/i);
  assert.throws(() => f.verifyTask(revisada, "t1", { verifier: "coordinador", observed: true, evidence: "" }), /evidence/i);
  const verificada = f.verifyTask(revisada, "t1", { verifier: "coordinador", observed: true, evidence: "volvi a abrir las dos fuentes citadas" });
  assert.equal(verificada.tasks[0].state, "verified");
  assert.equal(verificada.tasks[0].verification.by, "coordinador");
});

test("no se salta un paso: verificar sin revisar, integrar sin verificar", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const recibida = await recibidaDe(f, a, root);
  assert.throws(() => f.verifyTask(recibida, "t1", { verifier: "coordinador", observed: true, evidence: "x" }), /reviewed/i);
  const revisada = f.reviewTask(recibida, "t1", { reviewer: "coordinador", checked: ["scope", "sources", "risks"] });
  assert.throws(() => f.integrateTask(revisada, "t1", { destination: "tramos/0/fuentes.md" }), /verified/i);
  const verificada = f.verifyTask(revisada, "t1", { verifier: "coordinador", observed: true, evidence: "e" });
  assert.throws(() => f.integrateTask(verificada, "t1", {}), /destination/i);
  assert.equal(f.integrateTask(verificada, "t1", { destination: "tramos/0/fuentes.md" }).tasks[0].state, "integrated");
});

// E - cerrar la operacion

test("no se cierra con una tarea abierta; con todo integrado y verificado por quien observo, si", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const recibida = await recibidaDe(f, a, root);
  assert.throws(() => f.closeOperation(recibida, { verification: { verified: true, by: "coordinador", observed: true } }), /t1/);
  let art = f.reviewTask(recibida, "t1", { reviewer: "coordinador", checked: ["scope", "sources", "risks"] });
  art = f.verifyTask(art, "t1", { verifier: "coordinador", observed: true, evidence: "e" });
  art = f.integrateTask(art, "t1", { destination: "tramos/0/fuentes.md" });
  assert.throws(() => f.closeOperation(art, { verification: { verified: false, by: "coordinador", observed: true } }), /verified/i);
  const cerrada = f.closeOperation(art, { verification: { verified: true, by: "coordinador", observed: true } });
  assert.equal(cerrada.state, "closed");
  assert.equal(f.resumeArtifact(cerrada).allowed, false);
});

test("las tareas se leen en una vista corta y sobreviven al ciclo guardar y leer de FASES.md", async (t) => {
  const root = await proyecto(t);
  const { f, a } = await autorizada();
  const recibida = await recibidaDe(f, a, root);
  const filas = f.taskSummary(recibida);
  assert.deepEqual(Object.keys(filas[0]).sort(), ["by", "id", "nextCheckAt", "role", "state"]);
  assert.equal(filas[0].state, "received");
  await f.saveOperationState(root, recibida);
  const leida = await f.readOperation({ root, id: recibida.id });
  assert.deepEqual(leida.tasks, recibida.tasks);
  assert.match(await readFile(join(root, "FASES.md"), "utf8"), /t1/);
});

// F - economia y cadena de una operacion

test("un efecto externo declara su economia completa o no corre", async () => {
  const { f, a } = await autorizada();
  const cadena = { placement: "on", class: "money_moved", reason: "hay un pago entre dos partes que no se conocen" };
  assert.throws(() => f.declareEffect(a, { effect: "external", chain: cadena }), /economy/i);
  assert.throws(() => f.declareEffect(a, { effect: "external", economy: { cost: { amount: "0.01", asset: "USDC" } }, chain: cadena }), /grant|settlement/i);
  assert.throws(() => f.declareEffect(a, { effect: "external", economy: { cost: { amount: "0.01", asset: "USDC" }, grant: "lectura:1", settlement: "x402" } }), /chain/i);
  const ok = f.declareEffect(a, { effect: "external", economy: { cost: { amount: "0.01", asset: "USDC" }, grant: "lectura:1", settlement: "x402 testnet" }, chain: cadena });
  assert.equal(ok.effect, "external");
  assert.equal(ok.economy.settlement, "x402 testnet");
  assert.deepEqual(ok.defects ?? [], []);
});

test("una operacion sin efecto externo no necesita economia; lo que va en cadena sin desconfianza se marca como defecto", async () => {
  const { f, a } = await autorizada();
  const sin = f.declareEffect(a, { effect: "none" });
  assert.equal(sin.effect, "none");
  const lore = f.declareEffect(a, { effect: "none", chain: { placement: "off", class: "lore", reason: "es criterio, no una disputa" } });
  assert.deepEqual(lore.defects ?? [], []);
  const mal = f.declareEffect(a, { effect: "none", chain: { placement: "on", class: "session_state", reason: "para que quede" } });
  assert.ok(mal.defects.some((d) => d.code === "chain_without_distrust"), "el estado de sesion en cadena es un defecto");
});

test("runDurableOperation se niega a correr un efecto externo sin economia y la conserva en el recibo cuando la hay", async (t) => {
  const root = await proyecto(t);
  const f = await import(V);
  let corrio = 0;
  const capability = { id: "pago", required: () => ({ spend: [{ asset: "lectura", amount: "1", to: "portal-clientes" }] }), perform: async () => { corrio += 1; return { ok: true, evidence: { status: "ok" } }; } };
  const io = { verify: async () => ({ verified: true, checks: { ok: true }, reason: "ok" }) };
  await assert.rejects(() => f.runDurableOperation({ root, goal: OBJETIVO, owner: "c", authority: MANDATO, capability, io, effect: "external" }), /economy/i);
  assert.equal(corrio, 0, "corrio un efecto sin economia declarada");
  const economy = { cost: { amount: "0.01", asset: "USDC" }, grant: "lectura:1", settlement: "x402 testnet" };
  const chain = { placement: "on", class: "money_moved", reason: "pago entre partes que no se conocen" };
  const out = await f.runDurableOperation({ root, goal: OBJETIVO, owner: "c", authority: MANDATO, capability, io, effect: "external", economy, chain });
  assert.equal(corrio, 1);
  assert.deepEqual(out.receipt.economy, economy);
  assert.deepEqual(out.receipt.chain.class, "money_moved");
});
