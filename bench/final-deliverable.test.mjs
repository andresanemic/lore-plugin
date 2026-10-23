// L2 de 2.5.3 — salidas finales declaradas. Un encargo compuesto pide una síntesis final además de
// las piezas; sin declarar cuáles son sus finales, el cierre certifica cualquier archivo escrito por
// terminal. Estas pruebas usan fixtures SINTÉTICOS (bench/fixtures/final-deliverable/) y el doble de
// prueba de `decision.md` §1.3: no lanzan el binario real de Codex. Los recibos aprobados que el
// cierre necesita se fabrican con la clave del host, que es exactamente el límite que declara L2-13.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createHmac } from "node:crypto";
import { spawnSync } from "node:child_process";
import * as coordinator from "../skills/vespi/core/coordinator.mjs";
import { assertExecuted, executeNodeVerification, executeVerification } from "../skills/vespi/core/verification-execution.mjs";
import { createArtifact, loadOperationState, saveOperationState } from "../skills/vespi/core/operation-state.mjs";

// HOME temporal ANTES de cualquier uso de la clave: L2-13 lee la clave y fabrica un recibo, y el
// resto de las pruebas no debe tocar la clave real de quien corre el banco.
const HOME = mkdtempSync(join(tmpdir(), "l2-home-"));
process.env.USERPROFILE = HOME;
process.env.HOME = HOME;
process.on("exit", () => { try { rmSync(HOME, { recursive: true, force: true }); } catch { /* temp */ } });

const CLI = fileURLToPath(new URL("../scripts/operation-cli.mjs", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures/final-deliverable/", import.meta.url));
const sha = (content) => createHash("sha256").update(content).digest("hex");

const FUENTE = "Fuente sintética única: tres notas, una síntesis. No menciona ningún proyecto real.\n";
const SINTESIS = "Síntesis sintética: cubre las tres notas y se apoya en la fuente única.\n";
const FINALES = [{
  id: "f1",
  path: "final/sintesis.md",
  criterion: "La síntesis cubre las tres notas y no afirma nada que la fuente no diga",
  sources: ["fuentes/nota-fuente.md"],
}];
const ADVISOR = { available: true, tool: "decide", observedBy: "fixture-coordinator" };
const CIERRE = { verification: { verified: true, observed: true, by: "reader" } };
// La misma huella que calcula el kit, para fabricar manifiestos retocados en las pruebas.
const digestFinales = (artifact, outputs) => createHash("sha256").update(JSON.stringify({
  outputs: outputs.map(({ id, path, criterion, sources }) => ({ id, path, criterion, sources: [...(sources ?? [])] })),
  working_goal: artifact?.working_goal ?? null,
  intent: artifact?.intent ?? null,
  obligations: (artifact?.obligations ?? []).map(({ id, description }) => ({ id, description })),
})).digest("hex");

function raiz(t, nombre) {
  const root = mkdtempSync(join(tmpdir(), `l2-${nombre}-`));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function escribir(root, rel, texto) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, texto);
  return path;
}

// Un runner de longitud y hash: certifica que hay bytes y que la fuente se leyó, nada más. Es el
// chequeo mecánico que NC-02 usaba para dar por bueno un final.
function proofRunner(root, nombre) {
  const code = [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { readFileSync } from 'node:fs';",
    "const packet = JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE, 'utf8'));",
    "test('longitud y hash', () => {",
    "  assert.ok(packet.artifact.content.length > 0);",
    "  assert.ok(packet.sources.length > 0);",
    "});",
    "",
  ].join("\n");
  const path = escribir(root, nombre, code);
  return { adapter: "node-test", path, sha256: sha(code), required_tests: ["longitud y hash"] };
}

function tarea(root, { id, rel, texto, final = null, criterion = null, obligation = null }) {
  const path = escribir(root, rel, texto);
  return {
    id,
    role: "worker",
    state: "received",
    question: `Redactar ${rel}`,
    executor: { by: `writer-${id}` },
    output: { path: rel },
    done_criterion: criterion ?? `Explicar ${rel}`,
    proof: "Ejecutar la comprobación comisionada",
    sources: ["fuentes/nota-fuente.md"],
    ...(obligation ? { obligation } : {}),
    ...(final ? { final_output: final } : {}),
    received: { root: realpathSync(root), path, sha256: sha(texto), bytes: Buffer.byteLength(texto), at: new Date().toISOString() },
    proof_runner: proofRunner(root, `proof-${id}.test.mjs`),
  };
}

function base() {
  return {
    ...createArtifact({
      goal: "Sintetizar tres notas y entregar una síntesis final",
      owner: "fixture-owner",
      authority: { spend: [], local: true },
      scope: "Fixture sintético de L2",
      expected_effect: { kind: "none" },
      done: "Entregar la síntesis final",
      roles: ["worker", "advisor", "verifier"],
      verifier: "reader",
    }),
    id: "op-l2",
    state: "received",
  };
}

// Un recibo aprobado con adapter codex sin lanzar el binario: se cambia el adaptador de un recibo
// sellado y se vuelve a firmar con la clave del host. Cualquiera con ese usuario puede hacerlo; es
// el límite que L2-13 y L2-17 declaran, no una ruta del kit.
function reciboCodex(evidencia) {
  const { signature: _firma, ...base } = evidencia.execution_receipt;
  const recibo = { ...base, execution: { ...base.execution, adapter: "codex", thread: "hilo-fabricado" } };
  const clave = readFileSync(join(HOME, ".lore-plugin", "verification", "execution.key"));
  return { ...evidencia, execution_receipt: { ...recibo, signature: createHmac("sha256", clave).update(JSON.stringify(recibo)).digest("hex") } };
}

function integrarConNode(artifact, id, root) {
  const revisada = coordinator.reviewTask(artifact, id, {
    reviewer: `advisor-${id}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const verificada = coordinator.verifyTask(revisada, id, {
    verifier: `reader-${id}`, observed: true, evidence: executeNodeVerification(revisada, id, { root }),
  });
  return coordinator.integrateTask(verificada, id, { destination: verificada.tasks.find((task) => task.id === id).output.path });
}

async function integrarFinalCodex(artifact, id, root) {
  const revisada = coordinator.reviewTask(artifact, id, {
    reviewer: `advisor-${id}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const doble = await executeVerification(revisada, id, {
    root, nativeRunner: () => ({ passed: true, observation: "doble sintético: aprobado", notCovered: [] }),
  });
  const verificada = coordinator.verifyTask(revisada, id, { verifier: `reader-${id}`, observed: true, evidence: reciboCodex(doble) });
  return coordinator.integrateTask(verificada, id, { destination: verificada.tasks.find((task) => task.id === id).output.path });
}

async function operacionSintetica(t, {
  nombre = "l2", parciales = 2, finales = FINALES, tareaFinal = true, integrarFinal = true, obligations = null,
} = {}) {
  const root = raiz(t, nombre);
  escribir(root, "fuentes/nota-fuente.md", FUENTE);
  let artifact = base();
  if (obligations) artifact = coordinator.declareObligations(artifact, obligations);
  const tasks = [];
  for (let index = 1; index <= parciales; index += 1) {
    tasks.push(tarea(root, { id: `t${index}`, rel: `parcial/nota-${index}.md`, texto: `nota ${index} sintética sobre la fuente\n` }));
  }
  let finalId = null;
  if (finales) {
    finalId = `t${parciales + 1}`;
    if (tareaFinal) tasks.push(tarea(root, { id: finalId, rel: finales[0].path, texto: SINTESIS, final: finales[0].id, criterion: finales[0].criterion, obligation: obligations?.[0]?.id }));
    artifact = coordinator.declareFinalOutputs({ ...artifact, tasks }, finales);
  } else artifact = { ...artifact, tasks };
  for (let index = 1; index <= parciales; index += 1) artifact = integrarConNode(artifact, `t${index}`, root);
  if (finales && tareaFinal && integrarFinal) artifact = await integrarFinalCodex(artifact, finalId, root);
  return { artifact, root, finalId, tasks };
}

function preparada() {
  return {
    ...createArtifact({
      goal: "Sintetizar tres notas y entregar una síntesis final", owner: "fixture-owner",
      authority: { spend: [], local: true }, scope: "Fixture sintético de L2",
      expected_effect: { kind: "none" }, done: "Entregar la síntesis final",
      roles: ["worker", "advisor", "verifier"], verifier: "reader",
    }),
    id: "op-l2-plan", state: "prepared",
  };
}

function spec(extra = {}) {
  return {
    role: "worker",
    question: "Redactar la síntesis final",
    scope: FINALES[0].path,
    done_criterion: FINALES[0].criterion,
    proof: "Ejecutar la comprobación comisionada",
    output: { path: FINALES[0].path },
    sources: [...FINALES[0].sources],
    timeoutMs: 60_000,
    nextCheckAt: "2026-10-21T18:00:00.000Z",
    ...extra,
  };
}

// L2-01
test("L2-01: un final escrito fuera de toda tarea no certifica el cierre", async (t) => {
  const { artifact, root } = await operacionSintetica(t, { nombre: "01", parciales: 3, tareaFinal: false });
  escribir(root, "final/sintesis.md", "Pokémon GO\n");
  assert.equal(artifact.tasks.length, 3, "tres parciales planificadas y ninguna tarea para el final");
  assert.throws(() => coordinator.closeOperation(artifact, CIERRE), /final output f1/);
  assert.notEqual(artifact.state, "closed");
});

// L2-02
test("L2-02: una tarea de composición no se certifica con un runner de longitud y hash", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "02", parciales: 1, integrarFinal: false });
  await assert.rejects(
    () => executeVerification(artifact, finalId, { root }),
    /final output requires semantic verification/,
  );
});

// L2-03
test("L2-03: un recibo de una tarea parcial no sirve para el final", async (t) => {
  const root = raiz(t, "03");
  escribir(root, "fuentes/nota-fuente.md", FUENTE);
  const parcial = tarea(root, { id: "t1", rel: FINALES[0].path, texto: SINTESIS, criterion: FINALES[0].criterion });
  let artifact = { ...base(), tasks: [parcial] };
  artifact = coordinator.reviewTask(artifact, "t1", {
    reviewer: "advisor-t1", verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const evidencia = executeNodeVerification(artifact, "t1", { root });
  // La operación declara su final sobre esa misma entrega y esa misma tarea: solo cambia el vínculo.
  artifact = coordinator.declareFinalOutputs({ ...artifact, tasks: [{ ...artifact.tasks[0], final_output: "f1" }] }, FINALES);
  assert.throws(() => assertExecuted(artifact, artifact.tasks[0], evidencia), /binding/);
});

// L2-04
test("L2-04: un doble de prueba aprobado no certifica un final", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "04", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(artifact, finalId, {
    reviewer: `advisor-${finalId}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const evidencia = await executeVerification(revisada, finalId, {
    root, nativeRunner: () => ({ passed: true, observation: "doble sintético: aprobado", notCovered: [] }),
  });
  assert.equal(evidencia.execution_receipt.execution.adapter, "test-double");
  assert.throws(() => assertExecuted(revisada, revisada.tasks.at(-1), evidencia), /test-double/);
});

// L2-05
test("L2-05: un doble que rechaza deja la tarea revisada y ningún node-test lo sustituye", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "05", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(artifact, finalId, {
    reviewer: `advisor-${finalId}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const evidencia = await executeVerification(revisada, finalId, {
    root, nativeRunner: () => ({ passed: false, observation: "doble sintético: rechazo", notCovered: ["rechazo sintético"] }),
  });
  const tareaFinal = revisada.tasks.at(-1);
  assert.equal(evidencia.execution_receipt.execution.adapter, "test-double");
  const execution = assertExecuted(revisada, tareaFinal, evidencia, { requirePass: false });
  assert.equal(execution.passed, false);
  // La tarea queda revisada con su propio recibo de rechazo.
  const registrada = {
    ...revisada,
    tasks: revisada.tasks.map((task) => (task.id === finalId
      ? { ...task, state: "reviewed", verification: { by: "reader", observed: true, executed: true, passed: false, evidence: evidencia, execution, independence: "labels_only", at: new Date().toISOString() } }
      : task)),
  };
  assert.equal(registrada.tasks.at(-1).state, "reviewed");
  assert.equal(registrada.tasks.at(-1).verification.passed, false);
  // Un node-test posterior no sustituye ese rechazo: el final pide verificación semántica.
  await assert.rejects(() => executeVerification(registrada, finalId, { root }), /final output requires semantic verification/);
});

// L2-06
test("L2-06: una salida declarada y no integrada impide el cierre y se nombra", async (t) => {
  const root = raiz(t, "06");
  escribir(root, "fuentes/nota-fuente.md", FUENTE);
  const finales = [...FINALES, { id: "f2", path: "final/anexo.md", criterion: "El anexo cita la fuente única", sources: ["fuentes/nota-fuente.md"] }];
  let artifact = {
    ...base(),
    tasks: [
      tarea(root, { id: "t1", rel: "parcial/nota-1.md", texto: "nota 1 sintética\n" }),
      tarea(root, { id: "t2", rel: finales[0].path, texto: SINTESIS, final: "f1", criterion: finales[0].criterion }),
      tarea(root, { id: "t3", rel: finales[1].path, texto: "anexo sintético\n", final: "f2", criterion: finales[1].criterion }),
    ],
  };
  artifact = coordinator.declareFinalOutputs(artifact, finales);
  artifact = integrarConNode(artifact, "t1", root);
  artifact = await integrarFinalCodex(artifact, "t2", root);
  assert.equal(artifact.tasks.find((task) => task.id === "t3").state, "received");
  assert.throws(() => coordinator.closeOperation(artifact, CIERRE), /f2/);
});

// L2-07
test("L2-07: el manifiesto de finales no se puede recortar, borrar ni redeclarar", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "07", parciales: 1, integrarFinal: false });
  const recortado = { ...artifact, final_outputs: [] };
  assert.throws(() => coordinator.closeOperation(recortado, CIERRE), /final outputs changed|final outputs were declared/i);
  const borrado = { ...artifact };
  delete borrado.final_outputs;
  delete borrado.final_outputs_sha256;
  assert.throws(() => coordinator.closeOperation(borrado, CIERRE), /final outputs were declared/i);
  assert.throws(() => coordinator.declareFinalOutputs(artifact, FINALES), /already declared/i);
});

// L2-08
test("L2-08: un final no declarado no se planifica y la declaración es única", async (t) => {
  const artifact = preparada();
  assert.throws(() => coordinator.planTask(artifact, spec({ final_output: "f3" })), /final output f3 was not declared/);
  const declarada = coordinator.declareFinalOutputs(artifact, FINALES);
  assert.throws(() => coordinator.declareFinalOutputs(declarada, FINALES), /already declared/i);
  const { task } = coordinator.planTask(declarada, spec({ final_output: "f1" }));
  assert.equal(task.final_output, "f1");
});

// L2-09
test("L2-09: planificar el final con un criterio más débil o sin sus fuentes se rechaza", async (t) => {
  const declarada = coordinator.declareFinalOutputs(preparada(), FINALES);
  assert.throws(() => coordinator.planTask(declarada, spec({ final_output: "f1", done_criterion: "existe un texto" })), /criterion/);
  assert.throws(() => coordinator.planTask(declarada, spec({ final_output: "f1", sources: [] })), /sources/);
  assert.throws(() => coordinator.planTask(declarada, spec({ final_output: "f1", output: { path: "final/otro.md" } })), /final\/sintesis\.md/);
});

// L2-10
test("L2-10: reescribir el objetivo sin actualizar huella ni nota invalida el cierre", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "10", parciales: 3 });
  const otro = { ...artifact, working_goal: "Entregar una guía de Pokémon GO" };
  assert.throws(() => coordinator.closeOperation(otro, CIERRE), /final outputs changed/);
});

// L2-11
test("L2-11: sobrescribir el final por terminal se detecta al cerrar; no se previene", async (t) => {
  const { artifact, root } = await operacionSintetica(t, { nombre: "11", parciales: 1 });
  const destino = join(root, FINALES[0].path);
  const cerrada = coordinator.closeOperation(artifact, CIERRE);
  assert.deepEqual(cerrada.verification.closure.boundary.prevents, []);
  assert.ok(cerrada.verification.closure.boundary.detects.includes("destination-bytes-at-closure"));
  const antes = readFileSync(destino, "utf8");
  writeFileSync(destino, "Pokémon GO\n");
  const despues = readFileSync(destino, "utf8");
  assert.notEqual(antes, despues, "el archivo sí cambió: el kit detecta, no previene");
  assert.throws(() => coordinator.closeOperation(artifact, CIERRE), /final output f1/);
});

// L2-12
test("L2-12: la CLI ignora el recibo que aporta quien llama en una tarea final", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "12", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(artifact, finalId, {
    reviewer: `advisor-${finalId}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  await saveOperationState(root, revisada);
  const antes = readFileSync(join(root, "FASES.md"));
  const ajeno = { execution_receipt: { execution: { completed: true, passed: true } }, checks: [] };
  const resultado = spawnSync(process.execPath, [CLI, "verify", "--root", root, "--id", revisada.id, "--task", finalId,
    "--json", JSON.stringify({ verifier: "reader-ajeno", evidence: ajeno })], { encoding: "utf8" });
  assert.equal(resultado.status, 1, `${resultado.stdout} ${resultado.stderr}`);
  assert.match(resultado.stderr, /final output requires semantic verification/);
  assert.deepEqual(readFileSync(join(root, "FASES.md")), antes, "el intento no escribió nada");
});

// L2-13
test("L2-13: con la clave del host se fabrica un recibo codex aprobado y el cierre queda parcial", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "13", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(artifact, finalId, {
    reviewer: `advisor-${finalId}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const doble = await executeVerification(revisada, finalId, {
    root, nativeRunner: () => ({ passed: true, observation: "doble sintético: aprobado", notCovered: [] }),
  });
  const fabricado = reciboCodex(doble);
  const verificada = coordinator.verifyTask(revisada, finalId, { verifier: "reader", observed: true, evidence: fabricado });
  assert.equal(verificada.tasks.at(-1).state, "verified", "el kit lo acepta: el mismo usuario leyó la clave");
  const integrada = coordinator.integrateTask(verificada, finalId, { destination: FINALES[0].path });
  const cerrada = coordinator.closeOperation(integrada, CIERRE);
  assert.equal(cerrada.state, "closed");
  assert.equal(cerrada.verification.completion, "partial");
  assert.ok(cerrada.verification.notCovered.includes("final-output:f1:verifier-not-independent"));
  assert.equal(cerrada.verification.closure.boundary.independence, "deteccion-sin-independencia");
});

// L2-14
test("L2-14: el recibo de cierre separa pruebas, fuentes, conformidad y atestaciones", async (t) => {
  const obligations = [
    { id: "artefacto", description: "la síntesis final, verificada" },
    { id: "captura", description: "una propuesta de captura ofrecida a la persona" },
  ];
  const { artifact, finalId } = await operacionSintetica(t, { nombre: "14a", parciales: 2, obligations });
  const cumplida = coordinator.fulfillObligation(artifact, "artefacto", { evidence: { task: finalId } });
  const conPalabras = coordinator.fulfillObligation(cumplida, "captura", {
    evidence: { attestation: { by: "Andrés", words: "sí, guarda la captura de esta síntesis sintética" } },
  });
  const cerrada = coordinator.closeOperation(conPalabras, CIERRE);
  const { closure } = cerrada.verification;
  for (const seccion of ["proofs", "sources", "commission_conformity", "human_approval"]) {
    assert.ok(Array.isArray(closure[seccion]), `el cierre trae ${seccion}`);
  }
  assert.deepEqual(closure.human_approval, [{ obligation: "captura", by: "Andrés", words: "sí, guarda la captura de esta síntesis sintética" }]);
  const sinAtestacion = JSON.stringify({ proofs: closure.proofs, sources: closure.sources, commission_conformity: closure.commission_conformity });
  assert.doesNotMatch(sinAtestacion, /guarda la captura/, "la atestación aparece solo en su sección");
  assert.equal(closure.commission_conformity.length, 1);
  assert.equal(closure.commission_conformity[0].adapter, "codex");

  // Los chequeos mecánicos pueden estar verdes y la conformidad rechazada: completion no es complete.
  const { artifact: pendiente, root, finalId: finalPendiente } = await operacionSintetica(t, { nombre: "14b", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(pendiente, finalPendiente, {
    reviewer: `advisor-${finalPendiente}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const doble = await executeVerification(revisada, finalPendiente, {
    root, nativeRunner: () => ({ passed: true, observation: "doble sintético: aprobado", notCovered: [] }),
  });
  assert.throws(() => coordinator.verifyTask(revisada, finalPendiente, { verifier: "reader", observed: true, evidence: doble }), /test-double/);
  assert.throws(() => coordinator.closeOperation(revisada, CIERRE));
  assert.equal(revisada.verification, null, "ningún cierre quedó en complete");

  // Un juez que rechaza, con tests mecánicos verdes, tampoco produce cierre: la tarea queda revisada
  // con su recibo de rechazo y closeOperation no puede certificarla como final.
  const { artifact: juzgada, root: rootJuez, finalId: finalJuez } = await operacionSintetica(t, { nombre: "14c", parciales: 1, integrarFinal: false });
  const revisadaJuez = coordinator.reviewTask(juzgada, finalJuez, {
    reviewer: `advisor-${finalJuez}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const rechazoDelJuez = await executeVerification(revisadaJuez, finalJuez, {
    root: rootJuez, nativeRunner: () => ({ passed: false, observation: "doble sintético: rechazo del juez", notCovered: [] }),
  });
  const executionDelJuez = assertExecuted(revisadaJuez, revisadaJuez.tasks.at(-1), reciboCodex(rechazoDelJuez), { requirePass: false });
  assert.equal(executionDelJuez.passed, false, "el juez rechazó la conformidad");
  assert.throws(() => coordinator.verifyTask(revisadaJuez, finalJuez, { verifier: "reader", observed: true, evidence: reciboCodex(rechazoDelJuez) }));
  assert.throws(() => coordinator.closeOperation(revisadaJuez, CIERRE));
  assert.equal(revisadaJuez.verification, null);
});

// L2-15
test("L2-15: el paquete del juez lleva el encargo y las fuentes, y no la respuesta esperada", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "15", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(artifact, finalId, {
    reviewer: `advisor-${finalId}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  let visto = null;
  await executeVerification(revisada, finalId, {
    root, nativeRunner: (paquete) => {
      visto = paquete;
      return { passed: false, observation: "doble sintético: rechazo", notCovered: ["rechazo sintético"] };
    },
  });
  assert.ok(visto, "el doble recibió el paquete que se habría enviado al juez");
  assert.ok(visto.commission, "el paquete trae la comisión");
  assert.equal(visto.commission.goal, revisada.working_goal);
  assert.equal(visto.commission.output_criterion, FINALES[0].criterion);
  assert.ok(Array.isArray(visto.commission.obligations));
  assert.ok(visto.sources.some((source) => source.ref === "fuentes/nota-fuente.md"));
  const marcador = readFileSync(join(FIXTURES, "expected", "judge-answer.txt"), "utf8").trim();
  assert.ok(marcador.length > 0);
  assert.ok(!JSON.stringify(visto).includes(marcador), "la respuesta esperada queda fuera de la raíz del juez");
  // La respuesta esperada no vive dentro de la raíz, y ninguna fuente transportada la contiene.
  assert.ok(!existsSync(join(root, "expected", "judge-answer.txt")), "la respuesta esperada no está en la raíz del juez");
  assert.equal(visto.artifact.content, SINTESIS);
  assert.equal(visto.sources.find((source) => source.ref === "fuentes/nota-fuente.md")?.content, FUENTE);
  assert.ok(!visto.sources.some((source) => source.content.includes(marcador)), "ninguna fuente lleva la respuesta");
});

// L2-16
test("L2-16: sin finales declarados, una tarea cierra como antes y dos o más cierran parciales", async (t) => {
  const una = await operacionSintetica(t, { nombre: "16a", finales: null, parciales: 1 });
  const cerrada = coordinator.closeOperation(una.artifact, CIERRE);
  assert.equal(cerrada.state, "closed");
  assert.equal(cerrada.verification.completion, "complete");
  const dos = await operacionSintetica(t, { nombre: "16b", finales: null, parciales: 2 });
  const parcial = coordinator.closeOperation(dos.artifact, CIERRE);
  assert.equal(parcial.state, "closed");
  assert.equal(parcial.verification.completion, "partial");
  assert.ok(parcial.verification.notCovered.includes("final-outputs:undeclared"));
});

// L2-17
test("L2-17: escribir la clave o la respuesta del juez se acepta; el kit solo lo detecta", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "17", parciales: 1 });
  const dir = join(HOME, ".lore-plugin", "verification");
  const clavePath = join(dir, "execution.key");
  const original = readFileSync(clavePath);
  assert.equal(original.length, 32);
  try {
    writeFileSync(clavePath, Buffer.alloc(32, 7));
    writeFileSync(join(dir, "respuesta-ajena.response.json"), JSON.stringify({ passed: true }));
    assert.equal(readFileSync(clavePath).length, 32, "la escritura no se bloqueó: misma cuenta del sistema operativo");
    assert.throws(() => coordinator.closeOperation(artifact, CIERRE), /signature/, "cambiar la clave invalida el recibo: detección");
  } finally {
    writeFileSync(clavePath, original);
  }
  const cerrada = coordinator.closeOperation(artifact, CIERRE);
  assert.deepEqual(cerrada.verification.closure.boundary.prevents, []);
  assert.equal(cerrada.verification.closure.boundary.independence, "deteccion-sin-independencia");
});

// ---------------- Ronda 2: hallazgos del revisor ----------------

// L2-18 (R1)
test("L2-18: un recibo sellado sin final_output (base rc9) sigue verificando una tarea no final", async (t) => {
  const root = raiz(t, "18");
  escribir(root, "fuentes/nota-fuente.md", FUENTE);
  let artifact = { ...base(), tasks: [tarea(root, { id: "t1", rel: "parcial/nota-1.md", texto: "nota 1 sintética\n" })] };
  artifact = coordinator.reviewTask(artifact, "t1", {
    reviewer: "advisor-t1", verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const evidencia = executeNodeVerification(artifact, "t1", { root });
  assert.ok(!("final_output" in evidencia.execution_receipt.binding), "el binding de una tarea no final no declara final_output");
  // Un recibo sellado por la base rc9: su binding no trae la clave, y así debe seguir verificando.
  const { signature: _firma, ...recibo } = evidencia.execution_receipt;
  const legado = { ...recibo, binding: { ...recibo.binding } };
  delete legado.binding.final_output;
  const clave = readFileSync(join(HOME, ".lore-plugin", "verification", "execution.key"));
  const resellado = {
    ...evidencia,
    execution_receipt: { ...legado, signature: createHmac("sha256", clave).update(JSON.stringify(legado)).digest("hex") },
  };
  assert.doesNotThrow(() => assertExecuted(artifact, artifact.tasks[0], resellado));
});

// L2-19 (R2)
test("L2-19: un manifiesto vacío fabricado no cierra complete en una operación de varias tareas", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "19", finales: null, parciales: 2 });
  const truco = { ...artifact, final_outputs: [], final_outputs_sha256: digestFinales(artifact, []) };
  const cerrada = coordinator.closeOperation(truco, CIERRE);
  assert.equal(cerrada.verification.completion, "partial");
  assert.ok(cerrada.verification.notCovered.includes("final-outputs:undeclared"));
});

// L2-20 (R3, R4, R12)
test("L2-20: la documentación y el recibo declaran los límites del manifiesto, la carrera y node-test", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "20", parciales: 1 });
  const boundary = coordinator.closeOperation(artifact, CIERRE).verification.closure.boundary;
  assert.ok(boundary.detects.some((name) => name.includes("manifest") && /note|fingerprint/.test(name)),
    `detects debe nombrar el límite: ${boundary.detects.join(", ")}`);
  const docs = readFileSync(new URL("../docs/VERIFICATION-EXECUTION.md", import.meta.url), "utf8");
  assert.doesNotMatch(docs, /rewriting the goal after declaring invalidates closure/i);
  assert.match(docs, /same OS user can rewrite the manifest, its fingerprint and the trail note/i);
  assert.match(docs, /concurrent/i);
  assert.match(docs, /combined node/i);
});

// L2-21 (R5)
test("L2-21: commission_conformity.verdict es el veredicto del juez, no el del Advisor", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "21", parciales: 1 });
  const cerrada = coordinator.closeOperation(artifact, CIERRE);
  const conformidad = cerrada.verification.closure.commission_conformity[0];
  assert.notEqual(conformidad.verdict, artifact.tasks.at(-1).review.verdict);
  assert.equal(conformidad.verdict, "passed");
});

// L2-22 (R6)
test("L2-22: una salida admite exactamente una tarea viva", () => {
  const declarada = coordinator.declareFinalOutputs(preparada(), FINALES);
  const { artifact } = coordinator.planTask(declarada, spec({ final_output: "f1" }));
  assert.throws(() => coordinator.planTask(artifact, spec({ final_output: "f1" })), /f1/);
});

// L2-23 (R7)
test("L2-23: el registro cerrado conserva final_outputs y su huella", async (t) => {
  const { artifact, root } = await operacionSintetica(t, { nombre: "23", parciales: 1 });
  const cerrada = coordinator.closeOperation(artifact, CIERRE);
  await saveOperationState(root, cerrada);
  const guardada = await loadOperationState(root, cerrada.id);
  assert.deepEqual(guardada.final_outputs, artifact.final_outputs);
  assert.equal(guardada.final_outputs_sha256, artifact.final_outputs_sha256);
});

// L2-24 (R8)
test("L2-24: obligaciones declaradas después de los finales no bloquean el cierre", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "24", parciales: 1 });
  const conObligaciones = coordinator.declareObligations(artifact, [{ id: "o1", description: "algo" }]);
  const cumplida = coordinator.fulfillObligation(conObligaciones, "o1", { evidence: { attestation: { by: "A", words: "sí" } } });
  assert.doesNotThrow(() => coordinator.closeOperation(cumplida, CIERRE));
});

// L2-25 (R9)
test("L2-25: close no copia independence ni closure aportados por quien llama", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "25", parciales: 1 });
  const cerrada = coordinator.closeOperation(artifact, { verification: { ...CIERRE.verification, independence: "separate-authority", closure: { falso: true } } });
  assert.ok(!JSON.stringify(cerrada.verification).includes("separate-authority"));
  assert.notDeepEqual(cerrada.verification.closure, { falso: true });
  assert.equal(cerrada.verification.closure.boundary.independence, "deteccion-sin-independencia");
});

// L2-26 (R10)
test("L2-26: declarar rechaza rutas relativas a unidad, alias del mismo archivo y sources como texto", () => {
  assert.throws(() => coordinator.declareFinalOutputs(preparada(), [{ ...FINALES[0], sources: "fuentes/nota-fuente.md" }]), /sources must be a list of references/);
  if (process.platform === "win32") {
    for (const path of ["C:fuera.md", "D:fuera.md"]) {
      assert.throws(() => coordinator.declareFinalOutputs(preparada(), [{ ...FINALES[0], path }]), /inside the operation root/, `aceptó ${path}`);
    }
    assert.throws(() => coordinator.declareFinalOutputs(preparada(), [FINALES[0], { ...FINALES[0], id: "f2", path: "./FINAL/Sintesis.md" }]), /duplicate|same/i);
  }
});

// L2-27 (M4)
test("L2-27: cambiar la huella sin actualizar la nota del rastro se detecta", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "27", parciales: 1 });
  const conOtroObjetivo = { ...artifact, working_goal: "Otro objetivo sintético" };
  const retocado = { ...conOtroObjetivo, final_outputs_sha256: digestFinales(conOtroObjetivo, conOtroObjetivo.final_outputs) };
  assert.throws(() => coordinator.closeOperation(retocado, CIERRE), /changed after/);
});

// L2-28 (M8)
test("L2-28: integrar el final en otra ruta con los mismos bytes no cierra", async (t) => {
  const { artifact, root, finalId } = await operacionSintetica(t, { nombre: "28", parciales: 1, integrarFinal: false });
  const revisada = coordinator.reviewTask(artifact, finalId, {
    reviewer: `advisor-${finalId}`, verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const doble = await executeVerification(revisada, finalId, {
    root, nativeRunner: () => ({ passed: true, observation: "doble sintético: aprobado", notCovered: [] }),
  });
  const verificada = coordinator.verifyTask(revisada, finalId, { verifier: "reader", observed: true, evidence: reciboCodex(doble) });
  escribir(root, "otra/copia.md", SINTESIS);
  const integrada = coordinator.integrateTask(verificada, finalId, { destination: "otra/copia.md" });
  assert.throws(() => coordinator.closeOperation(integrada, CIERRE), /declared path/);
});

// L2-29 (M9)
test("L2-29: las rutas absolutas se rechazan al declarar", () => {
  for (const path of ["C:\\abs.md", "\\\\srv\\share\\x.md", "/abs.md"]) {
    assert.throws(() => coordinator.declareFinalOutputs(preparada(), [{ ...FINALES[0], path }]), /inside the operation root/, `aceptó ${path}`);
  }
});

// L2-30 (M14)
test("L2-30: cambiar intent después de declarar invalida el cierre", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "30", parciales: 1 });
  assert.throws(() => coordinator.closeOperation({ ...artifact, intent: "otro intent sintético" }, CIERRE), /changed after/);
});

// L2-31 (M16)
test("L2-31: la costura nativeRunner no existe para tareas no finales", async (t) => {
  const root = raiz(t, "31");
  escribir(root, "fuentes/nota-fuente.md", FUENTE);
  let artifact = { ...base(), tasks: [tarea(root, { id: "t1", rel: "parcial/nota-1.md", texto: "nota 1 sintética\n" })] };
  artifact = coordinator.reviewTask(artifact, "t1", {
    reviewer: "advisor-t1", verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  await assert.rejects(
    () => executeVerification(artifact, "t1", { root, nativeRunner: () => ({ passed: true, observation: "x", notCovered: [] }) }),
    /only for a declared final output/,
  );
});

// L2-32 (M18)
test("L2-32: los ids de salida duplicados se rechazan", () => {
  assert.throws(() => coordinator.declareFinalOutputs(preparada(), [FINALES[0], { ...FINALES[0], path: "final/anexo.md" }]), /duplicate/);
});

// L2-33 (M20)
test("L2-33: declarar una lista vacía de finales se rechaza", () => {
  assert.throws(() => coordinator.declareFinalOutputs(preparada(), []), /at least one output/);
});

// L2-34 (M2b)
test("L2-34: un recibo codex de la misma tarea sellado antes de declararla final no certifica el final", async (t) => {
  const root = raiz(t, "34");
  escribir(root, "fuentes/nota-fuente.md", FUENTE);
  const parcial = tarea(root, { id: "t1", rel: FINALES[0].path, texto: SINTESIS, criterion: FINALES[0].criterion });
  let artifact = { ...base(), tasks: [parcial] };
  artifact = coordinator.reviewTask(artifact, "t1", {
    reviewer: "advisor-t1", verdict: "accepted", checked: ["scope", "sources", "risks"], advisorRoute: ADVISOR,
  });
  const codex = reciboCodex(executeNodeVerification(artifact, "t1", { root }));
  artifact = coordinator.declareFinalOutputs({ ...artifact, tasks: [{ ...artifact.tasks[0], final_output: "f1" }] }, FINALES);
  assert.throws(() => assertExecuted(artifact, artifact.tasks[0], codex), /binding/);
});

// L2-35 (R13)
test("L2-35: declarar obligaciones no legitima un objetivo alterado tras integrar el final", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "35", parciales: 1 });
  const alterado = { ...artifact, working_goal: "Otro encargo sin autorización" };
  assert.throws(() => coordinator.declareObligations(alterado, [{ id: "o1", description: "Nueva obligación" }]), /final outputs changed after they were declared/);
});

// L2-36 (M16)
test("L2-36: la huella final conserva descripciones de obligaciones aunque se reselle su lista", async (t) => {
  const { artifact } = await operacionSintetica(t, { nombre: "36", parciales: 1 });
  let conObligacion = coordinator.declareObligations(artifact, [{ id: "o1", description: "La obligación inicial" }]);
  conObligacion = coordinator.fulfillObligation(conObligacion, "o1", {
    evidence: { attestation: { by: "fixture", words: "sí" } },
  });
  const obligations = conObligacion.obligations.map((item) => ({ ...item, description: "Una obligación diferente" }));
  const hash = sha(JSON.stringify(obligations.map(({ id, description }) => ({ id, description }))));
  const altered = {
    ...conObligacion,
    obligations,
    obligations_sha256: hash,
    checkpoints: conObligacion.checkpoints.map((checkpoint) => checkpoint.note.startsWith("obligaciones declaradas sha256:")
      ? { ...checkpoint, note: `obligaciones declaradas sha256:${hash}` }
      : checkpoint),
  };
  assert.throws(() => coordinator.closeOperation(altered, CIERRE), /final outputs changed/);
});
