// L1 de 2.5.3 - obligacion omitida. Un encargo pide un artefacto y ademas una propuesta de captura del
// aprendizaje; el coordinador entrega el artefacto, verificado y en verde, y omite la propuesta. Contra el
// encargo original eso no es conforme. Caso generico del kit: no codifica ningun ID local.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { executeNodeVerification } from "../skills/vespi/core/verification-execution.mjs";
import { reviewTask, verifyTask, integrateTask, closeOperation, declareObligations, fulfillObligation } from "../skills/vespi/core/coordinator.mjs";
import { createArtifact } from "../skills/vespi/core/operation-state.mjs";

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

test("a technically green delivery that omits a declared obligation is not conforming", (t) => {
  let artifact = operacionIntegrada(t);
  artifact = fulfillObligation(artifact, "artefacto", { evidence: { task: "t1" } });
  assert.throws(() => closeOperation(artifact, cierre), /obligation.*captura|captura.*unmet|unmet.*captura/i);
});

test("once every obligation has its evidence, the operation closes and says so", (t) => {
  let artifact = operacionIntegrada(t);
  artifact = fulfillObligation(artifact, "artefacto", { evidence: { task: "t1" } });
  // Antes de H2 este positivo aceptaba una nota libre; ahora la propuesta mostrada es un artefacto con huella.
  const dir = mkdtempSync(join(tmpdir(), "obligations-positive-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const propuesta = join(dir, "propuesta.md");
  writeFileSync(propuesta, "propuesta mostrada a la persona con destino, redaccion y evidencia");
  artifact = fulfillObligation(artifact, "captura", { evidence: { artifact: { path: propuesta, sha256: sha("propuesta mostrada a la persona con destino, redaccion y evidencia") } }, root: dir });
  const cerrada = closeOperation(artifact, { ...cierre, root: dir });
  assert.equal(cerrada.state, "closed");
  assert.deepEqual(cerrada.obligations.map((o) => o.fulfilled !== null), [true, true]);
});

test("dropping an obligation after it was declared does not change the mandate", (t) => {
  let artifact = operacionIntegrada(t);
  artifact = fulfillObligation(artifact, "artefacto", { evidence: { task: "t1" } });
  const resumida = { ...artifact, obligations: artifact.obligations.filter((o) => o.id !== "captura") };
  assert.throws(() => closeOperation(resumida, cierre), /obligations changed/i);
});

test("an obligation is fulfilled only with evidence, and only once declared", (t) => {
  const artifact = operacionIntegrada(t);
  assert.throws(() => fulfillObligation(artifact, "captura", {}), /evidence/i);
  assert.throws(() => fulfillObligation(artifact, "otra", { evidence: { note: "x" } }), /unknown obligation/i);
  assert.throws(() => declareObligations(artifact, OBLIGACIONES), /already declared/i);
});

test("an operation that declared no obligations keeps closing as before", (t) => {
  const artifact = operacionIntegrada(t, { obligations: null });
  assert.equal(closeOperation(artifact, cierre).state, "closed");
});

// H2 (revision de Codex, 2026-10-20): un objeto cualquiera no cumple una obligacion. La evidencia es de una
// clase que el cierre puede contrastar —tarea integrada, artefacto con huella— o una atestacion humana con
// sus palabras, que el cierre declara como tal.
test("H2: negative or unbacked evidence does not fulfill an obligation", (t) => {
  const artifact = fulfillObligation(operacionIntegrada(t), "artefacto", { evidence: { task: "t1" } });
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { offered: false } }), /evidence/i);
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { note: "ya la ofreci" } }), /evidence/i);
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { task: "t9" } }), /task/i);
  assert.throws(() => fulfillObligation(artifact, "captura", { evidence: { attestation: { by: "", words: "" } } }), /attestation/i);
});

test("H2: an artifact obligation is checked against its bytes at closure", (t) => {
  let artifact = fulfillObligation(operacionIntegrada(t), "artefacto", { evidence: { task: "t1" } });
  const dir = mkdtempSync(join(tmpdir(), "obligations-artifact-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const propuesta = join(dir, "propuesta-captura.md");
  writeFileSync(propuesta, "Propuesta de captura: destino, redaccion, evidencia, confianza y limite.");
  artifact = fulfillObligation(artifact, "captura", { evidence: { artifact: { path: propuesta, sha256: sha("Propuesta de captura: destino, redaccion, evidencia, confianza y limite.") } }, root: dir });
  writeFileSync(propuesta, "otra cosa");
  assert.throws(() => closeOperation(artifact, { ...cierre, root: dir }), /captura.*(artifact|bytes|sha)/i);
});

test("H2: a human attestation closes but the closure declares it as an attestation", (t) => {
  let artifact = fulfillObligation(operacionIntegrada(t), "artefacto", { evidence: { task: "t1" } });
  artifact = fulfillObligation(artifact, "captura", { evidence: { attestation: { by: "Andres", words: "si, guarda C1 con esa conexion" } } });
  const cerrada = closeOperation(artifact, cierre);
  assert.equal(cerrada.state, "closed");
  assert.ok(JSON.stringify(cerrada).includes("obligation:captura:attested"), "el cierre dice que esa obligacion es una atestacion, no una verificacion");
});

test("B-3: la evidencia de una obligacion cumple la misma contencion al root que una entrega", (t) => {
  const base = mkdtempSync(join(tmpdir(), "obligations-root-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const root = join(base, "proyecto"), fuera = join(base, "otro-arbol");
  mkdirSync(root); mkdirSync(fuera);
  const dentro = join(root, "propuesta.md"), ajena = join(fuera, "ajena.md");
  writeFileSync(dentro, "propuesta del proyecto");
  writeFileSync(ajena, "contenido de otro proyecto");
  const base0 = fulfillObligation(operacionIntegrada(t), "artefacto", { evidence: { task: "t1" } });
  // Fuera del root: se rechaza al registrar, con un error que nombra el root.
  assert.throws(
    () => fulfillObligation(base0, "captura", { root, evidence: { artifact: { path: ajena, sha256: sha("contenido de otro proyecto") } } }),
    /outside the operation root/i,
  );
  // Dentro del root: se acepta, y el cierre la lee con el mismo root.
  const cumplida = fulfillObligation(base0, "captura", { root, evidence: { artifact: { path: dentro, sha256: sha("propuesta del proyecto") } } });
  assert.equal(closeOperation(cumplida, { ...cierre, root }).state, "closed");
  // Evidencia fuera del root ya registrada (estado escrito a mano o con otro root): el cierre la rechaza.
  const colada = fulfillObligation(base0, "captura", { root: fuera, evidence: { artifact: { path: ajena, sha256: sha("contenido de otro proyecto") } } });
  assert.throws(() => closeOperation(colada, { ...cierre, root }), /outside the operation root/i);
});

test("B-3: la evidencia de artefacto exige root al registrarla y al cerrar", (t) => {
  const root = mkdtempSync(join(tmpdir(), "obligations-sinroot-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dentro = join(root, "propuesta.md");
  writeFileSync(dentro, "propuesta del proyecto");
  const evidence = { artifact: { path: dentro, sha256: sha("propuesta del proyecto") } };
  const base0 = fulfillObligation(operacionIntegrada(t), "artefacto", { evidence: { task: "t1" } });
  assert.throws(() => fulfillObligation(base0, "captura", { evidence }), /needs the operation root/i);
  const registrada = fulfillObligation(base0, "captura", { evidence, root });
  assert.throws(() => closeOperation(registrada, cierre), /needs the operation root/i);
  assert.equal(closeOperation(registrada, { ...cierre, root }).state, "closed");
});
