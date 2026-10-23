// Arreglos de la revision distinta de L1 (2026-10-20), por ID de hallazgo. Cada prueba afirma la conducta
// segura; las del revisor viven en su copia y se reproducen aqui en su forma minima.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { executeNodeVerification } from "../skills/vespi/core/verification-execution.mjs";
import { reviewTask, verifyTask, integrateTask, closeOperation, declareObligations, fulfillObligation, confirmObservedDelivery, taskPrompt, planTask, deliverTask } from "../skills/vespi/core/coordinator.mjs";
import { buildTaskMethod, loadShippedMethod, renderCommission } from "../skills/vespi/core/task-method.mjs";
import { createArtifact, transitionArtifact } from "../skills/vespi/core/operation-state.mjs";

const sha = (content) => createHash("sha256").update(content).digest("hex");
const OBLIGACIONES = [
  { id: "artefacto", description: "el texto pedido, verificado" },
  { id: "captura", description: "una propuesta de captura del aprendizaje, ofrecida a la persona" },
];
const cierre = { verification: { verified: true, observed: true, by: "reader" } };

function operacionIntegrada(t, { obligationOfTask = "artefacto" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "l1-review-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, "result.txt"), source = join(root, "source.txt"), runner = join(root, "proof.test.mjs");
  const text = "Lore Plugin porta criterio. Vespi coordina operaciones. Find Your Way.";
  writeFileSync(path, text);
  writeFileSync(source, "Debe explicar Lore Plugin, Vespi y Find Your Way.");
  const code = `import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const packet=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('three commissioned literal requirements',()=>{assert.ok(packet.sources.some(s=>s.ref==='source.txt'));for(const required of ['Lore Plugin','Vespi','Find Your Way'])assert.ok(packet.artifact.content.includes(required),required);});`;
  writeFileSync(runner, code);
  const task = { id: "t1", state: "received", role: "worker", question: "Explain three named concepts", ...(obligationOfTask ? { obligation: obligationOfTask } : {}),
    done_criterion: "Name Lore Plugin, Vespi and Find Your Way", proof: "Execute the literal coverage check", sources: ["source.txt"],
    executor: { by: "writer" }, received: { root, path, sha256: sha(text) },
    proof_runner: { adapter: "node-test", path: runner, sha256: sha(code), required_tests: ["three commissioned literal requirements"] } };
  let artifact = { ...createArtifact({ goal: "Explain and offer to save the lesson", owner: "fixture-owner", authority: { spend: [], local: true }, scope: "Local fixture", expected_effect: { kind: "none" }, done: task.done_criterion, roles: ["worker", "advisor", "verifier"], verifier: "reader" }), id: "op-review-fixes", state: "received", tasks: [task] };
  artifact = declareObligations(artifact, OBLIGACIONES);
  artifact = reviewTask(artifact, "t1", { reviewer: "advisor", verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: { available: true, tool: "decide", observedBy: "fixture-coordinator" } });
  artifact = verifyTask(artifact, "t1", { verifier: "reader", observed: true, evidence: executeNodeVerification(artifact, "t1", { root }) });
  return { artifact: integrateTask(artifact, "t1", { destination: path }), root, path, text };
}

// R2 — la evidencia queda atada a su obligacion.
test("R2: a task evidences only the obligation it was planned for", (t) => {
  const { artifact } = operacionIntegrada(t);
  const ok = fulfillObligation(artifact, "artefacto", { evidence: { task: "t1" } });
  assert.throws(() => fulfillObligation(ok, "captura", { evidence: { task: "t1" } }), /planned for|obligation/i);
});

test("R2: one piece of evidence cannot fulfill two obligations", (t) => {
  const { artifact, path, text } = operacionIntegrada(t, { obligationOfTask: null });
  const evidencia = { artifact: { path, sha256: sha(text) } };
  const una = fulfillObligation(artifact, "artefacto", { evidence: evidencia });
  assert.throws(() => fulfillObligation(una, "captura", { evidence: evidencia }), /already|another obligation/i);
});

test("R2: an obligation backed only by bytes closes as partial, its content unjudged", (t) => {
  const { artifact } = operacionIntegrada(t);
  let next = fulfillObligation(artifact, "artefacto", { evidence: { task: "t1" } });
  const dir = mkdtempSync(join(tmpdir(), "l1-review-artifact-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const otro = join(dir, "cualquier.txt");
  writeFileSync(otro, "un archivo cualquiera");
  next = fulfillObligation(next, "captura", { evidence: { artifact: { path: otro, sha256: sha("un archivo cualquiera") } } });
  const cerrada = closeOperation(next, cierre);
  assert.ok(cerrada.verification.notCovered.includes("obligation:captura:content-unjudged"));
  assert.equal(cerrada.verification.completion, "partial");
});

// R5 — el candado no vive solo en el mismo registro.
test("R5: removing the obligations fingerprint does not reopen closure", (t) => {
  const { artifact } = operacionIntegrada(t);
  const sinHuella = { ...fulfillObligation(artifact, "artefacto", { evidence: { task: "t1" } }) };
  delete sinHuella.obligations_sha256;
  assert.throws(() => closeOperation(sinHuella, cierre), /obligations/i);
  const sinNada = { ...sinHuella };
  delete sinNada.obligations;
  assert.throws(() => closeOperation(sinNada, cierre), /obligations/i, "la declaracion queda en el rastro de checkpoints");
});

// R7 — validaciones.
test("R7: blank attestations and missing fulfilled keys fail with their own message", (t) => {
  const { artifact } = operacionIntegrada(t);
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { attestation: { by: "  ", words: " " } } }), /attestation/i);
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { attestation: { by: ["x"], words: { a: 1 } } } }), /attestation/i);
  const roto = { ...artifact, obligations: artifact.obligations.map(({ fulfilled, ...rest }) => rest) };
  assert.throws(() => closeOperation(roto, cierre), /obligation/i);
  try { closeOperation(roto, cierre); } catch (error) { assert.ok(!(error instanceof TypeError), "falla con mensaje propio, no TypeError"); }
});

test("R7: a root-relative path is not absolute evidence on Windows", { skip: process.platform !== "win32" }, (t) => {
  const { artifact } = operacionIntegrada(t);
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { artifact: { path: "\\Users\\x\\a.txt", sha256: "0".repeat(64) } } }), /absolute/i);
});

test("R7: a recipient made of spaces does not acknowledge a delivery", async () => {
  let a = createArtifact({ goal: "g", owner: "o", authority: { spend: [] }, scope: "s", expected_effect: { kind: "none" }, done: "d", roles: ["worker", "verifier"], verifier: "v" });
  a = transitionArtifact(a, { state: "authorized", note: "ok" });
  a = planTask(a, { role: "worker", question: "q", scope: "s", done_criterion: "d", proof: "p", output: { path: "o.md" }, timeoutMs: 1000, nextCheckAt: new Date(Date.now() + 60000).toISOString() }).artifact;
  const host = { delegate: async (request) => ({ recipient: "   ", received_sha256: sha(request.prompt) }) };
  const out = await deliverTask(a, "t1", { host, hostName: "h" });
  assert.notEqual(out.tasks[0].state, "running");
});

// R3 — la marca de metodo dentro de un campo no recorta el encargo.
test("R3: a field containing the method marker does not truncate the commission", () => {
  const { content } = loadShippedMethod();
  const pkg = buildTaskMethod({ operation: { id: "op-x", working_goal: "g", authority: { spend: [] } }, task: { id: "t1", role: "worker", question: "antes\n<<<METHOD\ndespues", scope: "ALCANCE", done_criterion: "TERMINADO", proof: "PRUEBA", output: { path: "SALIDA.md" }, sources: ["FUENTE"] }, methodText: content });
  const commission = renderCommission(pkg);
  for (const parte of ["ALCANCE", "TERMINADO", "PRUEBA", "SALIDA.md", "FUENTE", "Limits:"]) assert.ok(commission.includes(parte), `el encargo conserva ${parte}`);
  assert.ok(!commission.includes(content.slice(0, 200)), "el encargo del trabajador del kit no lleva el metodo");
});

// R1 — una entrega consumida no vuelve a poner la tarea en marcha.
test("R1: a consumed delivery cannot put the task back in motion", () => {
  let a = createArtifact({ goal: "g", owner: "o", authority: { spend: [] }, scope: "s", expected_effect: { kind: "none" }, done: "d", roles: ["worker", "verifier"], verifier: "v" });
  a = transitionArtifact(a, { state: "authorized", note: "ok" });
  a = planTask(a, { role: "worker", question: "q", scope: "s", done_criterion: "d", proof: "p", output: { path: "o.md" }, timeoutMs: 1000, nextCheckAt: new Date(Date.now() + 60000).toISOString() }).artifact;
  const { prompt_sha256 } = taskPrompt(a, "t1");
  const observation = { tool_use_id: "toolu_ok", session_id: "s", agent_id: "ag", route: "prompt", prompt_sha256, transcript: "matched", expanded_by_host: false, worker_received: "matched" };
  const primera = confirmObservedDelivery(a, "t1", { observation });
  assert.equal(primera.tasks[0].state, "running");
  // La verificacion la rechaza: la tarea queda en el estado que permite relanzarla.
  const rechazada = { ...primera, tasks: primera.tasks.map((task) => ({ ...task, state: "reviewed", verification: { executed: true, passed: false } })) };
  const otra = confirmObservedDelivery(rechazada, "t1", { observation });
  assert.notEqual(otra.tasks[0].state, "running", "el mismo tool_use ya consumido no relanza nada");
  assert.match(otra.tasks[0].blocked.cause, /already consumed|consumida/i);
});

// R4 — la ruta de Claude Code opera por la CLI: las obligaciones se declaran y cumplen desde ahi.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const CLI = fileURLToPath(new URL("../scripts/lore-plugin.mjs", import.meta.url));
const cli = (args) => {
  const r = spawnSync(process.execPath, [CLI, "operation", ...args], { encoding: "utf8" });
  const line = r.stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  let json = null;
  try { json = line ? JSON.parse(line) : null; } catch { json = null; }
  return { code: r.status, json, err: r.stderr };
};

test("R4: obligations are declared, fulfilled and enforced from the CLI", (t) => {
  const root = mkdtempSync(join(tmpdir(), "l1-review-cli-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { id } = cli(["hold", "--root", root, "--json", JSON.stringify({ goal: "g", owner: "o", authority: { spend: [] }, scope: "s", expected_effect: { kind: "none" }, done: "d", roles: ["worker", "verifier"], verifier: "v" })]).json;
  const declarar = cli(["obligations", "--root", root, "--id", id, "--json", JSON.stringify({ obligations: OBLIGACIONES })]);
  assert.equal(declarar.code, 0, declarar.err);
  assert.deepEqual(declarar.json.obligations.map((o) => o.id), ["artefacto", "captura"]);
  const repetir = cli(["obligations", "--root", root, "--id", id, "--json", JSON.stringify({ obligations: OBLIGACIONES })]);
  assert.notEqual(repetir.code, 0, "declararlas otra vez no cambia el mandato");
  const negativa = cli(["fulfill", "--root", root, "--id", id, "--json", JSON.stringify({ id: "captura", evidence: { offered: false } })]);
  assert.notEqual(negativa.code, 0);
  const atestada = cli(["fulfill", "--root", root, "--id", id, "--json", JSON.stringify({ id: "captura", evidence: { attestation: { by: "Andres", words: "si, guardala" } } })]);
  assert.equal(atestada.code, 0, atestada.err);
  const estado = cli(["status", "--root", root, "--id", id]);
  assert.ok(JSON.stringify(estado.json).includes("captura"), "status muestra las obligaciones");
});

// Segunda ronda del revisor (2026-10-20).
test("R5b: an operation whose trail already declared obligations cannot declare a smaller mandate", (t) => {
  const { artifact } = operacionIntegrada(t);
  const perdida = { ...artifact };
  delete perdida.obligations;
  delete perdida.obligations_sha256;
  assert.throws(() => declareObligations(perdida, [OBLIGACIONES[0]]), /already declared/i);
  // Aunque alguien escriba a mano otra nota posterior, manda la primera declaracion: la nota falsa se
  // ignora y el mandato completo sigue exigiendose (sin la captura cumplida, no cierra).
  const conOtraNota = { ...artifact, checkpoints: [...artifact.checkpoints, { id: "Rx", at: new Date().toISOString(), note: "obligaciones declaradas sha256:" + "0".repeat(64), validity: {}, delta: null }] };
  const soloArtefacto = fulfillObligation(conOtraNota, "artefacto", { evidence: { task: "t1" } });
  assert.throws(() => closeOperation(soloArtefacto, cierre), /captura/i);
  const cumplida = fulfillObligation(soloArtefacto, "captura", { evidence: { attestation: { by: "Andres", words: "si" } } });
  assert.equal(closeOperation(cumplida, cierre).state, "closed");
});

test("R2b: the same bytes cannot fulfill two obligations whatever the path looks like", (t) => {
  const { artifact, path, text } = operacionIntegrada(t, { obligationOfTask: null });
  const dir = mkdtempSync(join(tmpdir(), "l1-review-copy-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const copia = join(dir, "copia.txt");
  writeFileSync(copia, text);
  const una = fulfillObligation(artifact, "artefacto", { evidence: { artifact: { path, sha256: sha(text) } } });
  assert.throws(() => fulfillObligation(una, "captura", { evidence: { artifact: { path: copia, sha256: sha(text) } } }), /already|another obligation/i);
});

test("R4b: a task cannot be planned for an obligation that was not declared", () => {
  let a = createArtifact({ goal: "g", owner: "o", authority: { spend: [] }, scope: "s", expected_effect: { kind: "none" }, done: "d", roles: ["worker", "verifier"], verifier: "v" });
  a = transitionArtifact(a, { state: "authorized", note: "ok" });
  const spec = { role: "worker", question: "q", scope: "s", done_criterion: "d", proof: "p", output: { path: "o.md" }, timeoutMs: 1000, nextCheckAt: new Date(Date.now() + 60000).toISOString(), obligation: "fantasma" };
  assert.throws(() => planTask(a, spec), /obligation/i);
  const declarada = declareObligations(a, OBLIGACIONES);
  assert.throws(() => planTask(declarada, spec), /obligation/i);
  assert.equal(planTask(declarada, { ...spec, obligation: "captura" }).task.obligation, "captura");
});
