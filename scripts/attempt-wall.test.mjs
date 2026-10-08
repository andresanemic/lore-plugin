import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { attemptWall } from "../skills/vespi/core/operation-state.mjs";
import * as state from "../skills/vespi/core/operation-state.mjs";
import * as coordinator from "../skills/vespi/core/coordinator.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const host = { delegate: async () => ({}) };
async function stopped(t, count = 3) {
  const root = await mkdtemp(join(tmpdir(), "retry-wall-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  let op = state.createArtifact({ goal: "Recover the local check", owner: "fixture-owner", scope: "local fixture", expected_effect: { kind: "none" }, done: "observed check", roles: ["worker", "advisor", "verifier"], verifier: "verifier" });
  op = state.transitionArtifact(op, { state: "authorized", note: "fixture authorization" });
  op = coordinator.planTask(op, { role: "worker", question: "Run check", scope: "local", done_criterion: "check observed", proof: "read result", output: { path: join(root, "result.txt") }, timeoutMs: 1000, nextCheckAt: "2026-10-07T10:05:00Z" }).artifact;
  op = coordinator.dispatchTask(op, "t1", { host, hostName: "fixture-host", model: "worker" });
  for (let i = 0; i < count; i++) op = coordinator.observeTask(op, "t1", { signature: "HTTP 503 timeout", text: `attempt ${i + 1}: local check`, at: `2026-10-07T10:0${i}:00Z` });
  return { root, op };
}
const findings = [{ source: "local official adapter guide", finding: "The adapter accepts an explicit transport", limit: "fixture observation, not live endpoint evidence", applies: true }];
const search = { available: true, tool: "host-search", observedBy: "coordinator", query: "HTTP 503 adapter transport", findings, change: "Use the documented transport instead of the failing default", same_scope: true, at: "2026-10-07T10:04:00Z" };

test("tres fallos frenan dispatch y el bloqueo sobrevive a FASES", async t => {
  const { root, op } = await stopped(t);
  assert.equal(op.state, "blocked");
  assert.equal(op.tasks[0].state, "blocked");
  assert.equal(op.next_legitimate_action, "stop_and_search");
  await state.saveOperationState(root, op);
  const reread = await state.loadOperationState(root, op.id);
  const denied = coordinator.dispatchTask(reread, "t1", { host, hostName: "other-host", model: "other-worker" });
  assert.equal(denied.state, "blocked");
  assert.equal(denied.tasks[0].state, "blocked");
  assert.deepEqual(denied.tasks[0].observations, op.tasks[0].observations);
  assert.equal(denied.tasks[0].executor.startedAt, op.tasks[0].executor.startedAt);
  const f = await import("../skills/vespi/core/vespi.mjs");
  let calls = 0;
  await assert.rejects(() => f.runDurableOperation({ root, id: op.id, capability: { id: "local", required: () => { calls++; return { spend: [] }; }, perform: async () => { calls++; return {}; } } }), /stop_and_search|search before retry/i);
  assert.equal(calls, 0);
});

test("una búsqueda antigua no cubre fallos observados después del freno", async t => {
  const { op } = await stopped(t);
  const later = coordinator.observeTask(op, "t1", { signature: "HTTP 503 timeout", text: "late failure report", at: "2026-10-07T10:07:00Z" });
  assert.throws(() => coordinator.recordRetrySearch(later, search), /predates/i);
});

test("ni éxito ni firma nueva borran un freno pendiente", async t => {
  const { op } = await stopped(t);
  for (const extra of [{ outcome: "success" }, { signature: "another failure" }]) {
    const next = coordinator.observeTask(op, "t1", { ...extra, text: "late observation", at: "2026-10-07T10:07:00Z" });
    assert.equal(state.retryGate(next).blocked, true);
    assert.equal(coordinator.dispatchTask(next, "t1", { host }).tasks[0].state, "blocked");
  }
});

test("sin búsqueda disponible se preservan intentos y condición de reanudación", async t => {
  const { op } = await stopped(t);
  assert.equal(typeof coordinator.recordRetrySearch, "function");
  const blocked = coordinator.recordRetrySearch(op, { available: false, observedBy: "coordinator", reason: "host has no search tool" });
  assert.equal(blocked.state, "blocked");
  assert.equal(blocked.retry_stop.status, "requires_search");
  assert.match(blocked.retry_stop.reason, /search.*unavailable|no search/i);
  assert.deepEqual(blocked.tasks[0].observations, op.tasks[0].observations);
  assert.equal(blocked.retry_searches.at(-1).executed_by_cli, false);
});

test("hallazgo pertinente abre un reintento acotado, no borra historial ni cubre otro fallo", async t => {
  const { op } = await stopped(t);
  assert.equal(typeof coordinator.recordRetrySearch, "function");
  for (const invalid of [{ ...search, findings: [] }, { ...search, change: "" }, { ...search, same_scope: false }, { ...search, findings: [{ ...findings[0], limit: "" }] }]) {
    assert.throws(() => coordinator.recordRetrySearch(op, invalid), /finding|change|scope|limit/i);
  }
  const ready = coordinator.recordRetrySearch(op, search);
  assert.equal(ready.retry_stop.status, "resolved");
  assert.equal(ready.retry_searches[0].findings[0].source, findings[0].source);
  assert.equal(ready.retry_searches[0].executed_by_cli, false);
  assert.equal(ready.id, op.id);
  const retry = coordinator.dispatchTask(ready, "t1", { host, hostName: "fixture-host", model: "worker", retryChange: search.change });
  assert.equal(retry.tasks[0].state, "running");
  const failed = coordinator.observeTask(retry, "t1", { signature: "HTTP 503 timeout", text: "documented transport also failed", at: "2026-10-07T10:06:00Z" });
  assert.equal(failed.retry_stop.status, "requires_search");
  assert.equal(failed.tasks[0].observations.length, 4);
});

test("reintento exige la tarea detenida y el cambio aplicado al encargo", async t => {
  const { op } = await stopped(t);
  const ready = coordinator.recordRetrySearch(op, search);
  assert.throws(() => coordinator.dispatchTask(ready, "t1", { host }), /retry change/i);
  const withOther = { ...ready, tasks: [...ready.tasks, { ...ready.tasks[0], id: "other" }] };
  assert.throws(() => coordinator.dispatchTask(withOther, "other", { host, retryChange: search.change }), /stopped task/i);
  const applied = coordinator.dispatchTask(ready, "t1", { host, retryChange: search.change });
  assert.equal(applied.tasks[0].retry_execution.change, search.change);
  assert.equal(applied.tasks[0].retry_execution.search_digest, ready.retry_stop.digest);
  assert.ok(applied.tasks[0].question.includes(search.change));
  assert.notEqual(applied.tasks[0].retry_execution.commission_before_sha256, applied.tasks[0].retry_execution.commission_after_sha256);
  assert.throws(() => coordinator.dispatchTask(applied, "t1", { host }), /already running/i);
  for (const terminal of ["reviewed", "verified", "integrated"]) {
    const completed = { ...applied, tasks: [{ ...applied.tasks[0], state: terminal }] };
    assert.throws(() => coordinator.dispatchTask(completed, "t1", { host }), /dispatch.*state|completed/i);
  }
});

test("búsqueda con fecha futura se rechaza", async t => {
  const { op } = await stopped(t);
  assert.throws(() => coordinator.recordRetrySearch(op, { ...search, at: "2099-01-01T00:00:00Z" }), /future/i);
  assert.throws(() => coordinator.observeTask(op, "t1", { signature: "E", at: "2099-01-01T00:00:00Z" }), /future/i);
});

test("búsqueda resuelta no permite evadir dispatch por la capacidad durable", async t => {
  const { root, op } = await stopped(t);
  const ready = coordinator.recordRetrySearch(op, search);
  await state.saveOperationState(root, ready);
  const { runDurableOperation } = await import("../skills/vespi/core/vespi.mjs");
  let performed = 0;
  await assert.rejects(() => runDurableOperation({ root, id: ready.id, capability: { id: "fixture", required: () => ({ spend: [] }), perform: async () => { performed++; return {}; } } }), /retry.*dispatch/i);
  assert.equal(performed, 0);
});

test("el freno pendiente no se convierte en cierre parcial", async t => {
  const { op } = await stopped(t);
  assert.throws(() => coordinator.closeOperation(op, {}), /stop_and_search/i);
  assert.throws(() => state.transitionArtifact(op, { state: "verified" }), /stop_and_search/i);
});

test("observar otra tarea no reasigna el origen del freno", async t => {
  const { op } = await stopped(t);
  const withOther = { ...op, tasks: [...op.tasks, { ...op.tasks[0], id: "other" }] };
  const observed = coordinator.observeTask(withOther, "other", { text: "diagnostic report" });
  assert.equal(observed.retry_stop.task_id, "t1");
  assert.throws(() => coordinator.recordRetrySearch(op, { ...search, change: " " }), /change/i);
});

test("un conflicto con Lore no se auto-aplica ni se borra con otra búsqueda", async t => {
  const { op } = await stopped(t);
  assert.equal(typeof coordinator.recordRetrySearch, "function");
  const conflicted = coordinator.recordRetrySearch(op, { ...search, conflicts: [{ source: "owner Lore", conflict: "suggested transport widens scope", proposal: "ask owning governance to arbitrate" }] });
  assert.equal(conflicted.retry_stop.status, "requires_arbitration");
  assert.equal(coordinator.recordRetrySearch(conflicted, search).retry_stop.status, "requires_arbitration");
  assert.equal(coordinator.dispatchTask(conflicted, "t1", { host }).tasks[0].state, "blocked");
});

const observation = (signature, text, outcome = "failure") => ({ signature, text, outcome });
const artifact = (...observations) => ({ tasks: [{ observations }] });

test("dos fallos iguales no activan el muro", () => {
  const result = attemptWall(artifact(observation("TypeError 42", "intenté ejecutar una"), observation("TypeError 91", "intenté ejecutar dos")));
  assert.equal(result.stop, false);
});

test("tres fallos iguales normalizados y seguidos activan el muro", () => {
  const result = attemptWall(artifact(
    observation("TypeError 42 en C:\\tmp\\run42.js", "npm test -- a"),
    observation("typeerror 91 en C:\\tmp\\run91.js", "npm test -- b"),
    observation("TYPEERROR 7 en C:\\tmp\\run7.js", "npm test -- c"),
  ));
  assert.equal(result.stop, true);
  assert.equal(result.attempts.length, 3);
  assert.match(result.signature, /typeerror/);
  assert.doesNotMatch(result.signature, /42|91|run7|tmp/);
});

test("un éxito en medio reinicia la racha de fallos", () => {
  const result = attemptWall(artifact(
    observation("Error 3", "primer intento"),
    { outcome: "success", text: "resolví el paso" },
    observation("Error 4", "segundo intento"),
    observation("Error 5", "tercer intento"),
  ));
  assert.equal(result.stop, false);
});

test("firmas distintas no activan el muro aunque sumen tres fallos", () => {
  const result = attemptWall(artifact(
    observation("TypeError alpha", "intenté A"),
    observation("RangeError beta", "intenté B"),
    observation("SyntaxError gamma", "intenté C"),
  ));
  assert.equal(result.stop, false);
});

test("el muro ordena observaciones de todas las tareas por tiempo", () => {
  const task = (observations) => ({ observations });
  const reordered = attemptWall({ tasks: [
    task([observation("E", "éxito", "success")]),
    task([observation("E", "f1", "failure",), observation("E", "f3"), observation("E", "f4")]),
  ].map((item, index) => ({ ...item, observations: item.observations.map((entry, i) => ({ ...entry, at: index === 0 ? 2 : [1, 3, 4][i] })) })) });
  assert.equal(reordered.stop, false);
  const finalStreak = attemptWall({ tasks: [
    task([1, 2, 3].map((at) => ({ ...observation("E", `f${at}`), at }))),
    task([{ ...observation("E", "éxito", "success"), at: 0 }]),
  ] });
  assert.equal(finalStreak.stop, true);
});

test("el muro conserva códigos significativos y normaliza rutas", () => {
  const wall = (signature) => attemptWall(artifact(...signature.map((value) => observation(value, "fallo"))));
  assert.notEqual(wall(["HTTP 401", "HTTP 403", "HTTP 500"]).stop, true);
  assert.equal(wall(["HTTP 401", "HTTP 403", "HTTP 500"]).attempts.length, 0);
  assert.equal(wall([
    "ENOENT C:\\temp\\run one\\a.js",
    "ENOENT C:\\temp\\run two\\a.js",
    "ENOENT C:\\temp\\run three\\a.js",
  ]).stop, true);
  assert.equal(wall(["ENOENT", "ENOENT", "EACCES"]).stop, false);
});

test("tiempos no comprobables entre tareas no permiten afirmar consecutividad", () => {
  for (const at of [undefined, "not-a-date", 7]) {
    const stamp = at === undefined ? {} : { at };
    const failures = { observations: [1, 2, 3].map(() => ({ signature: "E", ...stamp })) };
    const success = { observations: [{ outcome: "success", ...stamp }] };
    for (const tasks of [[failures, success], [success, failures]]) {
      const result = attemptWall({ tasks });
      assert.equal(result.stop, false, `at=${String(at)} tasks=${tasks === undefined}`);
      assert.match(result.reason, /order|time|verifiable/i);
    }
  }
});

test("normaliza códigos de estado, errores ORA y rutas sin tragarse texto", () => {
  const wall = (signature) => attemptWall(artifact(...signature.map((value) => observation(value, "fallo"))));
  for (const codes of [["HTTP/1.1 401", "HTTP/1.1 403", "HTTP/1.1 500"], ["ORA-00001", "ORA-00002", "ORA-00003"]]) {
    assert.equal(wall(codes).stop, false);
    assert.equal(wall(codes).attempts.length, 0);
  }
  assert.equal(wall([
    "ENOENT C:\\tmp\\dir while opening config",
    "ENOENT C:\\tmp\\dir while deleting cache",
    "ENOENT C:\\tmp\\dir while executing tool",
  ]).stop, false);
  assert.equal(wall([
    "ENOENT C:\\tmp\\pkg.v1\\one\\a.js",
    "ENOENT C:\\tmp\\pkg.v1\\two\\a.js",
    "ENOENT C:\\tmp\\pkg.v1\\three\\a.js",
  ]).stop, true);
  assert.equal(wall(['TypeError reading "a/b"', 'TypeError reading "c/d"', 'TypeError reading "e/f"']).stop, false);
});

test("el muro ignora firmas no textuales y limita la normalización lineal", () => {
  for (const signature of [{}, { toString: null }, 17, ["Error"]]) {
    assert.doesNotThrow(() => attemptWall(artifact(
      observation(signature, "a"), observation(signature, "b"), observation(signature, "c"),
    )));
  }
  const started = performance.now();
  attemptWall(artifact(
    observation("E".repeat(100_000), "a"),
    observation("E".repeat(100_000), "b"),
    observation("E".repeat(100_000), "c"),
  ));
  assert.ok(performance.now() - started < 500);
});

test("el método documenta detenerse, registrar intentos y buscar en fuentes aplicables", () => {
  const method = readFileSync(resolve(import.meta.dirname, "../skills/vespi/method.md"), "utf8");
  assert.match(method, /Stop and search after repeated failures/);
  assert.match(method, /document.*attempt.*before.*search/is);
  assert.match(method, /official documentation.*repositories.*available skills/is);
  assert.match(method, /conflicts with the Lore or the agreement.*arbitration/is);
  assert.match(method, /Search with the host's tools/i);
  assert.match(method, /CLI never searches/i);
  assert.match(method, /blocked.*condition for resuming.*receipt/is);
});
