// L1 de 2.5.3 - obligacion omitida. Un encargo pide un artefacto y ademas una propuesta de captura del
// aprendizaje; el coordinador entrega el artefacto, verificado y en verde, y omite la propuesta. Contra el
// encargo original eso no es conforme. Caso generico del kit: no codifica ningun ID local.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { executeNodeVerification } from "../skills/vespi/core/verification-execution.mjs";
import { reviewTask, verifyTask, integrateTask, closeOperation, declareObligations, fulfillObligation } from "../skills/vespi/core/coordinator.mjs";
import { createArtifact, saveOperationState, loadOperationState } from "../skills/vespi/core/operation-state.mjs";

const sha = (content) => createHash("sha256").update(content).digest("hex");
const OBLIGACIONES = [
  { id: "artefacto", description: "el texto pedido, verificado" },
  { id: "captura", description: "una propuesta de captura del aprendizaje, ofrecida a la persona" },
];

function operacionIntegrada(t, { obligations = OBLIGACIONES } = {}) {
  const root = mkdtempSync(join(tmpdir(), "obligations-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, "result.txt"), source = join(root, "source.txt"), runner = join(root, "proof.test.mjs");
  const text = "Lore Plugin porta criterio. Vespi coordina operaciones. Find Your Way.";
  writeFileSync(path, text);
  writeFileSync(source, "Debe explicar Lore Plugin, Vespi y Find Your Way.");
  const code = `import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const packet=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('three commissioned literal requirements',()=>{assert.ok(packet.sources.some(s=>s.ref==='source.txt'));for(const required of ['Lore Plugin','Vespi','Find Your Way'])assert.ok(packet.artifact.content.includes(required),required);});`;
  writeFileSync(runner, code);
  // La tarea declara la obligacion para la que se planifico (R2 de la revision de L1).
  const task = { id: "t1", state: "received", role: "worker", question: "Explain three named concepts", obligation: "artefacto",
    done_criterion: "Name Lore Plugin, Vespi and Find Your Way", proof: "Execute the literal coverage check", sources: ["source.txt"],
    executor: { by: "writer" }, received: { root, path, sha256: sha(text) },
    proof_runner: { adapter: "node-test", path: runner, sha256: sha(code), required_tests: ["three commissioned literal requirements"] } };
  let artifact = { ...createArtifact({ goal: "Explain three named concepts and offer to save the lesson", owner: "fixture-owner", authority: { spend: [], local: true }, scope: "Local fixture", expected_effect: { kind: "none" }, done: task.done_criterion, roles: ["worker", "advisor", "verifier"], verifier: "reader" }), id: "op-obligations", state: "received", tasks: [task] };
  if (obligations) artifact = declareObligations(artifact, obligations);
  artifact = reviewTask(artifact, "t1", { reviewer: "advisor", verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: { available: true, tool: "decide", observedBy: "fixture-coordinator" } });
  artifact = verifyTask(artifact, "t1", { verifier: "reader", observed: true, evidence: executeNodeVerification(artifact, "t1", { root }) });
  return integrateTask(artifact, "t1", { destination: path });
}

const cierre = { verification: { verified: true, observed: true, by: "reader" } };

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const cliPath = fileURLToPath(new URL("../scripts/lore-plugin.mjs", import.meta.url));

test("A: fulfilled task obligations survive two durable reopenings", async (t) => {
  const original = operacionIntegrada(t, { obligations: [OBLIGACIONES[0]] });
  const closed = closeOperation(fulfillObligation(original, "artefacto", { evidence: { task: "t1" }, at: "2026-10-20T00:00:00Z" }), cierre);
  assert.equal(closed.verification.verified, true);
  assert.equal(closed.verification.completion, "complete");
  const root = closed.tasks[0].received.root;
  const declaration = closed.checkpoints.find(cp => cp.note?.startsWith("obligaciones declaradas sha256:"));
  let reopened = closed;
  for (let i = 0; i < 2; i++) {
    await saveOperationState(root, reopened);
    reopened = await loadOperationState(root, closed.id);
    assert.deepEqual(reopened.obligations, closed.obligations);
    assert.equal(reopened.obligations_sha256, closed.obligations_sha256);
    assert.deepEqual(reopened.obligations_declaration, declaration);
    assert.equal(reopened.task_reviews.find(task => task.task_id === "t1").obligation, "artefacto");
    assert.deepEqual(reopened.verification, closed.verification);
  }
});

test("A: legacy closures without obligations still reopen twice", async (t) => {
  let artifact = closeOperation(operacionIntegrada(t, { obligations: null }), cierre);
  const root = artifact.tasks[0].received.root;
  for (let i = 0; i < 2; i++) {
    await saveOperationState(root, artifact);
    artifact = await loadOperationState(root, artifact.id);
    assert.equal(artifact.state, "closed");
    assert.equal(artifact.verification.verified, true);
    assert.equal(Object.hasOwn(artifact, "obligations"), false);
  }
});

for (const state of ["closed", "cancelled"]) {
  test(`B: API rejects declaring obligations on ${state}`, () => {
    const artifact = { ...createArtifact({ goal: "fixture", owner: "tester" }), state };
    const before = structuredClone(artifact);
    assert.throws(() => declareObligations(artifact, OBLIGACIONES), /terminal/i);
    assert.deepEqual(artifact, before);
  });

  test(`B: API rejects replacing task evidence on ${state}`, (t) => {
    const original = operacionIntegrada(t, { obligations: [OBLIGACIONES[0]] });
    const artifact = { ...closeOperation(fulfillObligation(original, "artefacto", { evidence: { task: "t1" } }), cierre), state };
    const before = structuredClone(artifact);
    assert.throws(() => fulfillObligation(artifact, "artefacto", { evidence: { attestation: { by: "tester", words: "yes" } } }), /terminal/i);
    assert.deepEqual(artifact, before);
  });

  for (const command of ["obligations", "fulfill"]) {
    test(`B: CLI ${command} refuses ${state} without writing FASES`, async (t) => {
      const original = operacionIntegrada(t, { obligations: command === "fulfill" ? [OBLIGACIONES[0]] : null });
      const fulfilled = command === "fulfill" ? fulfillObligation(original, "artefacto", { evidence: { task: "t1" } }) : original;
      const artifact = { ...closeOperation(fulfilled, cierre), state };
      const root = original.tasks[0].received.root;
      await saveOperationState(root, artifact);
      const before = readFileSync(join(root, "FASES.md"));
      const result = spawnSync(process.execPath, [cliPath, "operation", command, "--root", root, "--id", artifact.id, "--json", JSON.stringify(command === "obligations" ? { obligations: OBLIGACIONES } : { id: "artefacto", evidence: { attestation: { by: "tester", words: "yes" } } })], { encoding: "utf8" });
      assert.equal(result.status, 1, `${result.stdout} ${result.stderr}`);
      assert.match(result.stderr, /terminal/i);
      assert.deepEqual(readFileSync(join(root, "FASES.md")), before);
    });
  }
}