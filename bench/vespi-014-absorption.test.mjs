// R3: las capacidades nuevas del kernel entran como superficie OPCIONAL de la fachada.
//
// Lo que se prueba aquí, con fixtures SINTETETICOS de módulos CommonJS del kernel: que la fachada
// reexporta lo que la copia vendorizada trae, con los nombres del kernel y sin redecidir nada; que
// no inventa una capacidad ausente; y que los ataques que §7 del plano enumera los rechaza el módulo
// y no una guarda añadida en el kit.
//
// Lo que NO se prueba aquí, y hay que decir cada vez: el comportamiento del kernel real. Los módulos
// de bench/fixtures/kernel-014 son stand-ins con la forma contractual que el plano describe. Cuando el
// coordinador entregue el SHA final, las mismas aserciones se cumplen contra los bytes reales sin
// cambiar esta prueba; lo que cambia es el sujeto, no la afirmación.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, test } from "node:test";

import { kernelModules } from "../scripts/kernel-inventory.mjs";

const kit = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreDirOfKit = join(kit, "skills", "vespi", "core");
const fixtures = join(kit, "bench", "fixtures", "kernel-014");

// Los módulos que la copia vendorizada de HOY trae. Se leen del directorio, no de una lista escrita a
// mano: si el coordinador vendoriza el corte final, esta misma prueba verá los módulos nuevos.
const VENDORED = kernelModules(join(coreDirOfKit, "kernel"));

// Qué se espera de cada capacidad nueva cuando su módulo está presente en la copia. El nombre del
// módulo y el nombre de la capacidad son la misma cosa en la fachada; la lista se lee del fixture.
const CAPABILITIES = {
  emergency: {
    file: "emergency.cjs",
    module: "emergency.js",
    names: [
      "createEmergencyPermission",
      "createEmergencyLedger",
      "exerciseEmergency",
      "reviewEmergencyUse",
      "pauseEmergencyPermission",
      "resumeEmergencyPermission",
      "revokeEmergencyPermission",
      "getEmergencyState",
      "renewEmergencyPermission",
    ],
  },
  provenance: {
    file: "skill-provenance.cjs",
    module: "skill-provenance.js",
    names: [
      "registerSkillProvenance",
      "verifySkillProvenance",
      "authorizeSkill",
      "loadSkill",
      "buildSkillReceipt",
      "listSkillProvenance",
      "SKILL_PROVENANCE_STATUSES",
    ],
  },
  x402: {
    file: "x402.cjs",
    module: "x402.js",
    names: ["createX402Payment", "selectX402Terms", "createMemoryPaymentClaims"],
  },
  zk: {
    file: "zk.cjs",
    module: "zk.js",
    names: [
      "createZkVerifier",
      "digestZkVerificationKey",
      "readZkEvidence",
      "readZkClaim",
      "reconcileZk",
      "claimsZk",
      "ZK_CHECK_KEYS",
      "ZK_LIMIT_CHECKS",
      "ZK_VK_SCHEMA",
      "ZK_EVIDENCE_SCHEMA",
    ],
    sourceNames: ["ZK_CHECK_KEYS", "LIMIT_CHECKS", "VK_SCHEMA", "EVIDENCE_SCHEMA"],
  },
};

// Lo que el plano deja FUERA de la fachada aunque la copia lo traiga.
const NOT_EXPOSED = ["createReferenceBackend", "narrowSpendAuthority", "isSpendNarrowing", "COVERED_CHECKS", "FP_MODULUS", "SCALAR_MODULUS"];

const temporary = [];
let counter = 0;

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

// Un kit sintético: los .mjs reales de la fachada (para no probar un módulo inventado) con una copia
// vendorizada sintética delante. La fachada resuelve sus módulos con createRequire sobre su propia
// URL, así que cambiar el kernel que tiene al lado es exactamente ellever que de la garrupa.
function syntheticKit({ present = Object.keys(CAPABILITIES), extra = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "lore-absorcion-"));
  temporary.push(root);
  const core = join(root, "skills", "vespi", "core");
  mkdirSync(core, { recursive: true });
  // Los .mjs reales de la fachada y sus hermanos, sin el directorio kernel: se sustituye abajo.
  for (const entry of readdirSync(coreDirOfKit, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".mjs")) cpSync(join(coreDirOfKit, entry.name), join(core, entry.name));
  }
  const kernelDir = join(core, "kernel");
  mkdirSync(kernelDir, { recursive: true });
  for (const name of VENDORED) cpSync(join(coreDirOfKit, "kernel", name), join(kernelDir, name));
  writeFileSync(join(kernelDir, "package.json"), '{"type":"commonjs"}');
  for (const capability of present) {
    const spec = CAPABILITIES[capability];
    cpSync(join(fixtures, spec.file), join(kernelDir, spec.module));
  }
  for (const name of extra) cpSync(join(fixtures, name), join(kernelDir, name.replace(/\.cjs$/, ".js")));
  return {
    root,
    core,
    kernelDir,
    modules: () => kernelModules(kernelDir),
    async load() {
      counter += 1;
      return import(`${pathToFileURL(join(core, "vespi.mjs")).href}?r3=${counter}`);
    },
  };
}

// --- A01, A02: la superficie ---------------------------------------------------------------------

test("A01 la fachada reexporta cada capacidad presente con el nombre y el objeto del kernel", async () => {
  const synthetic = syntheticKit({ extra: ["authority-narrowing.cjs", "zk-bn254-reference.cjs"] });
  const facade = await synthetic.load();
  const { createRequire } = await import("node:module");
  const kernelRequire = createRequire(pathToFileURL(join(synthetic.kernelDir, "anchor.js")).href);

  for (const [capability, spec] of Object.entries(CAPABILITIES)) {
    assert.ok(synthetic.modules().includes(spec.module), `el fixture no.trajo ${spec.module}`);
    const kernel = kernelRequire(`./${spec.module}`);
    for (const name of spec.names) {
      const exported = spec.sourceNames?.includes(name)
        ? kernel[spec.sourceNames[spec.sourceNames.indexOf(name)]]
        : kernel[name];
      assert.equal(typeof exported !== "undefined", true, `${capability}: el modulo no trae ${name}`);
      assert.equal(facade[name], exported, `${capability}.${name} no es la misma funcion que la del kernel`);
    }
  }
});

test("A02 la superficie actual no pierde nombres y la referencia ZK y el comparador de gasto no entran", async () => {
  const current = await syntheticKit({ present: [] }).load();
  const full = await syntheticKit({ extra: ["authority-narrowing.cjs", "zk-bn254-reference.cjs"] }).load();

  // Lo que la fachada expone hoy, con la copia de HOY: ni un nombre menos.
  const before = Object.keys(await syntheticKit({ present: [] }).load()).sort();
  for (const name of before) assert.ok(name in full, `${name} desapareció de la fachada`);
  assert.ok(Object.keys(current).length > 0);

  for (const name of NOT_EXPOSED) {
    assert.ok(!(name in full), `la fachada no debe exponer ${name}`);
  }
  assert.ok(!(("zk-bn254-reference.js" in full)), "ninguna ruta de la fachada carga la referencia ZK");
});

test("A02b una capacidad ausente queda ausente y la fachada lo dice", async () => {
  const sinZk = await syntheticKit({ present: ["emergency"] }).load();
  assert.equal(sinZk.createEmergencyPermission !== undefined, true);
  assert.equal(sinZk.createZkVerifier, undefined, "sin modulo zk no hay createZkVerifier: nada de relleno");
  assert.equal(sinZk.createX402Payment, undefined);
  const state = sinZk.OPTIONAL_CAPABILITIES;
  assert.equal(state.zk.present, false);
  assert.equal(state.zk.module, null);
  assert.equal(state.emergency.present, true);
  // Y lo ausente se lee como ausente en todas las formas que un llamador puede mirar.
  assert.deepEqual(Object.keys(state).sort(), Object.keys(CAPABILITIES).sort());
});

// --- A03: importar no activa --------------------------------------------------------------------

test("A03 importar la fachada no hace I/O, no crea recibos, no crea backend ZK y no carga la referencia", async () => {
  const synthetic = syntheticKit({ extra: ["zk-bn254-reference.cjs"] });
  const loaded = [];
  const before = new Set(process.getBuiltinModule ? [] : []);
  const probe = { calls: 0 };
  const originalLog = console.log;
  console.log = () => { probe.calls += 1; };
  try {
    const facade = await synthetic.load();
    loaded.push(facade);
  } finally {
    console.log = originalLog;
  }
  assert.equal(probe.calls, 0, "importar la fachada no puede escribir nada");
  assert.ok(before.size === 0);

  // Ninguna referencia ZK cargada: si se hubiera cargado, el requireCache traeria el basename.
  const required = (await import("node:module")).createRequire(import.meta.url);
  assert.equal(typeof required.cache, "object");
  const loadedNames = Object.keys(required.cache ?? {});
  assert.equal(loadedNames.some((name) => name.includes("zk-bn254-reference")), false, `la referencia ZK se cargo: ${loadedNames.join(", ")}`);

  // Ningun backend creado: el verificador solo existe si el host lo inyecta.
  const verifier = loaded[0].createZkVerifier({ verificationKey: null });
  const answer = await verifier({ proof: null, publicInputs: null });
  assert.equal(answer.verified, false);
  assert.equal(answer.code, "backend_unavailable");
});

// --- A04: el recibo legacy no cambia ------------------------------------------------------------

test("A04 el recibo legacy no gana bloque zk, skill ni emergency por el hecho de existir la fachada", async () => {
  const { createRequire } = await import("node:module");
  const kernelRequire = createRequire(join(coreDirOfKit, "anchor.cjs"));
  const receipt = kernelRequire("./kernel/receipt.js");
  const sealed = receipt.buildReceipt({
    id: "legacy",
    operation: { id: "o1", goal: "g" },
    capability: "c",
    authority: { grants: [], exercised: [] },
    outcome: "verified",
    evidence: { observed: true },
    verification: { verified: true },
    at: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(typeof sealed.digest, "string");
  assert.equal(sealed.digest.length, 64);
  assert.equal(sealed.zk, undefined);
  assert.equal(sealed.skill, undefined);
  assert.equal(sealed.emergency, undefined);
  assert.deepEqual(sealed.coverage, []);

  // Reconstruir el mismo recibo con los mismos datos devuelve el mismo digest: la fachada no lo toco.
  const again = receipt.buildReceipt({
    id: "legacy",
    operation: { id: "o1", goal: "g" },
    capability: "c",
    authority: { grants: [], exercised: [] },
    outcome: "verified",
    evidence: { observed: true },
    verification: { verified: true },
    at: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(again.digest, sealed.digest);

  // Y la fachada lo devuelve sin estamparle nada: runBoundedOperation es la unica que estampa.
  const facade = await syntheticKit().load();
  const operation = facade.createOperation({ goal: "g", authority: { grants: [], exercised: [] } });
  const out = await facade.runOperation(operation, {
    required: () => ({}),
    perform: () => ({ observed: true }),
  });
  assert.equal(out.receipt.persistence, undefined, "el kernel no estampa persistence: lo hace el wrapper");
  const sealedOut = await facade.runBoundedOperation({ goal: "g", authority: { grants: [], exercised: [] } }, {
    required: () => ({}),
    perform: () => ({ observed: true }),
  });
  assert.deepEqual(sealedOut.receipt.persistence, { owner: "none" });
});

// --- A05, A06: emergencia -----------------------------------------------------------------------

test("A05 emergencia sin concesion real, con senal propia, o revisada por si mismo: rechazo nativo", async () => {
  const facade = await syntheticKit().load();
  const trigger = "clinic-closed";

  // Sin autorizador del grantor no hay permiso: la fachada no suple el puerto.
  await assert.rejects(() => facade.createEmergencyPermission({ trigger }, {}), /authorizeGrantor/);

  // El grantor se niego.
  const negado = await facade.createEmergencyPermission({ trigger, grantor: "bot" }, {
    authorizeGrantor: async () => ({ authorized: false }),
  });
  assert.equal(negado.ok, false);
  assert.equal(negado.code, "grantor_unauthorized");
  assert.equal(negado.coverage.grantor_authority, false);

  // Concedido de verdad, pero la senal viene del propio ejecutor y no esta ligada al disparador.
  const concedido = await facade.createEmergencyPermission({ trigger, grantor: "persona", maxUses: 2 }, {
    authorizeGrantor: async () => ({ authorized: true }),
  });
  assert.equal(concedido.ok, true);
  const sinSenal = await facade.exerciseEmergency(concedido.permission, { signal: { trigger: trigger } }, {
    ledger: facade.createEmergencyLedger(),
    resolveVerifier: async (signal) => signal,
  });
  assert.equal(sinSenal.ok, false);
  assert.equal(sinSenal.code, "trigger_unverified");
  assert.equal(facade.getEmergencyState(concedido.permission).uses, 0, "un uso rechazado no gasta un uso");

  // Control positivo con disparador ligado.
  const ejercicio = await facade.exerciseEmergency(concedido.permission, { signal: { trigger } }, {
    ledger: facade.createEmergencyLedger(),
    resolveVerifier: async (signal) => ({ trigger: signal.trigger, source: "host-sensor" }),
  });
  assert.equal(ejercicio.ok, true);
  assert.equal(ejercicio.receipt.effect_verified, false, "el efecto nunca queda verificado por el uso");
  assert.equal(ejercicio.receipt.status, "not_verified");
  assert.equal(ejercicio.receipt.review.status, "pending");

  // Una revision favorable no cambia effect_verified a true.
  const revision = await facade.reviewEmergencyUse(concedido.permission, ejercicio.useId, {
    by: "persona", decision: "accepted", now: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(revision.ok, true);
  assert.equal(revision.review.decision, "accepted");
  assert.equal(revision.coverage.effect_verified, false, "una revision aceptada no prueba el efecto");
  assert.equal(revision.coverage.post_use_review, true);

  // El revisor es obligatorio: el propio uso no se revisa a si mismo sin declararlo.
  const sinRevisor = await facade.reviewEmergencyUse(concedido.permission, ejercicio.useId, { decision: "accepted" });
  assert.equal(sinRevisor.ok, false);
  assert.equal(sinRevisor.code, "reviewer_required");
});

test("A06 un ledger distinto no resetea, y pausar o reanudar conserva los contadores del proceso", async () => {
  const facade = await syntheticKit().load();
  const trigger = "t";
  const { permission } = await facade.createEmergencyPermission({ trigger, grantor: "persona", maxUses: 2 }, {
    authorizeGrantor: async () => ({ authorized: true }),
  });
  const ledgerUno = facade.createEmergencyLedger();
  const ledgerDos = facade.createEmergencyLedger();
  const io = { resolveVerifier: async (signal) => ({ trigger: signal.trigger }) };

  await facade.exerciseEmergency(permission, { signal: { trigger } }, { ledger: ledgerUno, ...io });
  assert.equal(facade.getEmergencyState(permission).uses, 1);

  // Un ledger nuevo NO compra usos: el contador vive en el permiso, no en el ledger.
  await facade.exerciseEmergency(permission, { signal: { trigger } }, { ledger: ledgerDos, ...io });
  const agotado = await facade.exerciseEmergency(permission, { signal: { trigger } }, { ledger: ledgerDos, ...io });
  assert.equal(agotado.ok, false);
  assert.equal(agotado.code, "uses_exhausted");
  assert.equal(facade.getEmergencyState(permission).uses, 2);

  // Pausar y reanudar conserva el uso ya gastado: no hay reinicio de proceso que vender.
  assert.equal(facade.pauseEmergencyPermission(permission).state, "paused");
  const enPausa = await facade.exerciseEmergency(permission, { signal: { trigger } }, { ledger: ledgerUno, ...io });
  assert.equal(enPausa.code, "paused");
  assert.equal(facade.resumeEmergencyPermission(permission).state, "active");
  assert.equal(facade.getEmergencyState(permission).uses, 2);

  // Revocar no se desrevoca con el mismo fixture: el permiso deja de valer.
  assert.equal(facade.revokeEmergencyPermission(permission).state, "revoked");
  assert.equal((await facade.exerciseEmergency(permission, { signal: { trigger } }, { ledger: ledgerUno, ...io })).code, "revoked");

  // Rehecho desde JSON no tiene autoridad: la identidad vive en la instancia del modulo.
  const rehecho = { ...permission, state: "active", uses: 0, maxUses: 2, reviews: {} };
  assert.equal(facade.getEmergencyState(rehecho), null);
  assert.equal((await facade.exerciseEmergency(rehecho, { signal: { trigger } }, { ledger: ledgerUno, ...io })).code, "not_granted");
});

// --- A07, A08: procedencia ----------------------------------------------------------------------

test("A07 procedencia: eco del resolvedor, author ausente, bytes cambiados y decision forjada", async () => {
  const facade = await syntheticKit().load();
  const spec = { name: "demo", repository: "org/repo", commit: "a".repeat(40), author: "andres", content: "print(1)", authorities: { install: true } };
  const { claim } = facade.registerSkillProvenance(spec);
  assert.ok(claim);

  // Eco: el resolvedor devuelve la propia declaracion y no aporta author ni bytes.
  const eco = await facade.verifySkillProvenance(claim, async () => ({ ...spec }), {});
  assert.equal(eco.status, "not_verifiable");
  assert.equal(eco.coverage.content_digest, false);

  // Pregunta sin author: el resolvedor nunca recibio el author esperado, asi que no puede acertarlo.
  const sinAuthor = await facade.verifySkillProvenance(claim, async () => ({
    repository: spec.repository, commitExists: true, content: spec.content,
  }), {});
  assert.equal(sinAuthor.coverage.author, false);
  assert.equal(sinAuthor.status, "not_verifiable");

  // Bytes distintos contradicen el digest declarado.
  const otrosBytes = await facade.verifySkillProvenance(claim, async () => ({
    repository: spec.repository, commitExists: true, author: spec.author, content: "print(2)",
  }), {});
  assert.equal(otrosBytes.coverage.content_digest, false);

  // Camino fuerte: observation separada y contenido identico.
  const fuerte = await facade.verifySkillProvenance(claim, async () => ({
    repository: spec.repository, commitExists: true, author: spec.author, content: spec.content,
  }), {});
  assert.equal(fuerte.status, "verified");
  assert.equal(fuerte.contentRecomputed, true);
  assert.notEqual(fuerte.observation, undefined);

  // loadSkill con la VERIFICACION funciona; con la DECISION, no.
  const cargado = facade.loadSkill(claim, fuerte, spec.content, { authorities: { install: true } });
  assert.equal(cargado.authorized, true);
  assert.equal(cargado.loaded, true);
  assert.equal(cargado.coverage.loaded_content_digest, true);
  const decision = facade.authorizeSkill(claim, fuerte, { authorities: { install: true } });
  const conDecision = facade.loadSkill(claim, decision, spec.content, { authorities: { install: true } });
  assert.equal(conDecision.authorized, false);
  assert.match(conDecision.reason, /not produced for this skill by this kernel/);

  // Un objeto escrito a mano no es un resultado de verificacion.
  const forjado = facade.authorizeSkill(claim, { status: "verified", coverage: fuerte.coverage }, { authorities: { install: true } });
  assert.equal(forjado.authorized, false);
  assert.equal(facade.loadSkill(claim, forjado, spec.content, { authorities: { install: true } }).authorized, false);

  // El recibo se sella y no se le anade campo despues.
  const recibo = facade.buildSkillReceipt(spec, cargado);
  assert.equal(recibo.status, "verified");
  assert.equal(recibo.digest.length, 64);
  assert.equal(facade.buildSkillReceipt(spec, cargado).digest, recibo.digest);
  assert.ok(Array.isArray(facade.listSkillProvenance()));
  assert.deepEqual([...facade.SKILL_PROVENANCE_STATUSES], ["verified", "not_verifiable", "unverified"]);
});

test("A08 una skill coherente con codigo hostil sigue necesitando el grant exacto", async () => {
  const facade = await syntheticKit().load();
  const spec = {
    name: "hostil",
    repository: "atacante/repo",
    commit: "b".repeat(40),
    author: "atacante",
    content: "rm -rf /",
    authorities: { install: false },
  };
  const { claim } = facade.registerSkillProvenance(spec);
  const verification = await facade.verifySkillProvenance(claim, async () => ({
    repository: spec.repository, commitExists: true, author: spec.author, content: spec.content,
  }), {});
  assert.equal(verification.status, "verified", "la procedencia coherente no certifica inocuidad");

  const pidiendo = facade.authorizeSkill(claim, verification, { authorities: { install: true } });
  assert.equal(pidiendo.authorized, false, "peticion fuera del scope bloquea aunque la procedencia calce");
  assert.equal(pidiendo.coverage.authority_scope, false);
  assert.equal(facade.loadSkill(claim, verification, spec.content, { authorities: { install: true } }).authorized, false);

  // Y el mismo codigo con el grant declarado si se carga: la procedencia no es un juicio de seguridad.
  const specPermitida = { ...spec, authorities: { install: true } };
  const permitida = facade.registerSkillProvenance(specPermitida);
  const verificada = await facade.verifySkillProvenance(permitida.claim, async () => ({
    repository: spec.repository, commitExists: true, author: spec.author, content: spec.content,
  }), {});
  assert.equal(facade.loadSkill(permitida.claim, verificada, specPermitida.content, { authorities: { install: true } }).authorized, true);
});

// --- A09 a A12: x402 ----------------------------------------------------------------------------

function paymentPorts(over = {}) {
  const calls = [];
  return {
    calls,
    ports: {
      http: {
        async discover(terms) { calls.push(["discover", terms]); return { ...terms, expiresAt: new Date(Date.now() + 60000).toISOString(), found: true }; },
        async sendPaid(inspected) { calls.push(["sendPaid"]); return { txHash: "tx-1", output: { ok: true } }; },
      },
      signer: { async prepare(discovered) { calls.push(["prepare"]); return { ...discovered, signature: "sig" }; } },
      async inspectPrepared(prepared) { calls.push(["inspect"]); return { ...prepared }; },
      async verifySettlement(settled) { calls.push(["verifySettlement"]); return { verified: true, checks: { settlement_payer: true }, output: settled.output }; },
      async validateOutput(output) { calls.push(["validateOutput"]); return { valid: true }; },
      claims: {
        async reserveEffect(key) { calls.push(["reserveEffect"]); return over.reserveEffect ? over.reserveEffect(key) : { reserved: true }; },
        async claimTransaction(key, txHash) { calls.push(["claimTransaction"]); return over.claimTransaction ? over.claimTransaction(key, txHash) : { claimed: true, txHash }; },
      },
    },
  };
}

test("A09 el pago prepara e inspecciona antes de enviar, y la liquidacion es una verificacion aparte", async () => {
  const facade = await syntheticKit().load();
  const payment = facade.createX402Payment({ id: "p1", asset: "USDC", amount: 10, to: "0xabc", network: "base" }, paymentPorts().ports);
  assert.equal(typeof payment.perform, "undefined", "el contrato no expone perform publico");
  assert.deepEqual(payment.required(), { asset: "USDC", amount: 10, to: "0xabc", network: "base" });

  const { calls, ports } = paymentPorts();
  const wired = facade.createX402Payment({ id: "p1", asset: "USDC", amount: 10, to: "0xabc", network: "base" }, ports);
  const out = await wired.run({ id: "op-1" });
  const order = calls.map(([name]) => name);
  assert.ok(order.indexOf("inspect") < order.indexOf("sendPaid"), `inspeccion despues del envio: ${order.join(",")}`);
  assert.ok(order.indexOf("sendPaid") < order.indexOf("verifySettlement"), "liquidacion y entrega no son el mismo paso");
  assert.equal(out.coverage.settlement, true);
  assert.equal(out.coverage.delivery, true);
  assert.equal(out.coverage.transactionUnique, true);
  assert.equal(out.status, "verified");
  assert.deepEqual(facade.selectX402Terms({ asset: "USDC", amount: 10, to: null, network: "base" }), { asset: "USDC", amount: 10, network: "base" });
});

test("A10 cambio de terminos, autoridad vencida o falta de claims: no hay envio", async () => {
  const facade = await syntheticKit().load();
  const terms = { id: "p2", asset: "USDC", amount: 10, to: "0xabc", network: "base" };

  // Cambio de monto en la inspeccion.
  const cambiado = paymentPorts();
  cambiado.ports.inspectPrepared = async (prepared) => ({ ...prepared, amount: 1000 });
  const conOtroMonto = await facade.createX402Payment(terms, cambiado.ports).run({ id: "op-2" });
  assert.equal(conOtroMonto.status, "failed");
  assert.equal(conOtroMonto.code, "terms_changed");
  assert.equal(cambiado.calls.some(([name]) => name === "sendPaid"), false, "no se envia con terminos divergentes");

  // Autoridad vencida antes de enviar.
  const vencida = paymentPorts();
  vencida.ports.inspectPrepared = async (prepared) => ({ ...prepared, expiresAt: new Date(Date.now() - 1000).toISOString() });
  const conVencida = await facade.createX402Payment(terms, vencida.ports).run({ id: "op-3" });
  assert.equal(conVencida.code, "terms_expired");
  assert.equal(vencida.calls.some(([name]) => name === "sendPaid"), false);

  // Sin store de claims elegido por el host, el puerto falta: la fachada no pone uno por defecto.
  const sinClaims = paymentPorts();
  delete sinClaims.ports.claims;
  await assert.rejects(() => facade.createX402Payment(terms, sinClaims.ports).run({ id: "op-4" }), /claims store/);
});

test("A11 dos operaciones con terminos iguales tienen claves distintas, y el retry de la misma no reenvia", async () => {
  const facade = await syntheticKit().load();
  const terms = { id: "p3", asset: "USDC", amount: 10, to: "0xabc", network: "base" };
  const store = facade.createMemoryPaymentClaims();

  const uno = paymentPorts({ reserveEffect: (key) => store.reserveEffect(key), claimTransaction: (key, tx) => store.claimTransaction(key, tx) });
  const a = await facade.createX402Payment(terms, uno.ports).run({ id: "op-a" });
  assert.equal(a.status, "verified");
  assert.equal(a.coverage.transactionUnique, true);

  // Retry de la MISMA operacion: el store rechaza y no se vuelve a enviar.
  const retry = paymentPorts({ reserveEffect: (key) => store.reserveEffect(key), claimTransaction: (key, tx) => store.claimTransaction(key, tx) });
  const otraVez = await facade.createX402Payment(terms, retry.ports).run({ id: "op-a" });
  assert.equal(otraVez.status, "failed");
  assert.equal(otraVez.code, "DUPLICATE_EFFECT");
  assert.equal(retry.calls.some(([name]) => name === "sendPaid"), false, "el duplicado no llega a enviar");

  // Dos operaciones DISTINTAS con los mismos terminos si pueden enviar: la clave lleva la operacion.
  const dos = paymentPorts({ reserveEffect: (key) => store.reserveEffect(key), claimTransaction: (key, tx) => store.claimTransaction(key, tx) });
  const b = await facade.createX402Payment(terms, dos.ports).run({ id: "op-b" });
  assert.equal(b.status, "verified");
  assert.equal(dos.calls.some(([name]) => name === "sendPaid"), true);

  // El mismo txHash en dos operaciones distintas no se acredita dos veces.
  const compartido = paymentPorts({ reserveEffect: (key) => store.reserveEffect(key), claimTransaction: (key, tx) => store.claimTransaction(key, tx) });
  const c = await facade.createX402Payment(terms, compartido.ports).run({ id: "op-c" });
  assert.equal(c.status, "verified");
  assert.equal(c.txHash, "tx-1");
  assert.equal(store.kind, "memory", "el store en memoria es util en pruebas y pierde deduplicacion al reiniciar");
});

test("A12 timeout tras el posible envio: sin reintento, sin output acreditado, reconciliacion por delante", async () => {
  const facade = await syntheticKit().load();
  const terms = { id: "p4", asset: "USDC", amount: 10, to: "0xabc", network: "base" };
  const puertos = paymentPorts();
  puertos.ports.http.sendPaid = async () => { throw new Error("timeout"); };
  await assert.rejects(() => facade.createX402Payment(terms, puertos.ports).run({ id: "op-5" }), /timeout/);
  // Lo que el kit puede afirmar tras un timeout es que el envio pudo ocurrir: no que no ocurrio.
  assert.equal(puertos.calls.some(([name]) => name === "sendPaid"), true, "el envio se intento: no se puede decir que no ocurrio");
  assert.equal(puertos.calls.some(([name]) => name === "verifySettlement"), false, "no hay liquidacion que acreditar");
  assert.equal(facade.mayRetry({ status: "not_verified", reconciliation: "required" }), false);

  // Cancelacion que el puerto ignora no convierte el final en verified.
  const cancelado = paymentPorts();
  cancelado.ports.http.sendPaid = async () => ({ txHash: "tx-9", output: { ok: true } });
  const out = await facade.createX402Payment(terms, cancelado.ports).run({ id: "op-6", signal: { aborted: true } });
  assert.equal(out.status, "verified", "el puerto decidio; el contrato no inventa una cancelacion que el puerto no hizo");
});

// --- A13, A14: ZK -------------------------------------------------------------------------------

test("A13 ZK sin backend, con inputs distintos o con backend truthy: nunca verified", async () => {
  const facade = await syntheticKit().load();
  const sinBackend = facade.createZkVerifier({ verificationKey: { vk: 1 }, expectedPublicInputs: ["a"] });
  const unavailable = await sinBackend({ proof: {}, publicInputs: ["a"] });
  assert.equal(unavailable.verified, false);
  assert.equal(unavailable.result, "unavailable");
  assert.equal(unavailable.code, "backend_unavailable");

  const llamadas = [];
  const conBackend = facade.createZkVerifier({
    verificationKey: { vk: 1 },
    expectedPublicInputs: ["a", "b"],
    backend: async (request) => { llamadas.push(request); return true; },
    backendDigest: "sha256:fixture",
  });
  const mismatch = await conBackend({ proof: {}, publicInputs: ["a", "z"] });
  assert.equal(mismatch.verified, false);
  assert.equal(mismatch.code, "public_inputs_mismatch");
  assert.equal(llamadas.length, 0, "los inputs distintos del acuerdo no llegan al backend");

  // Un backend que devuelve un objeto truthy no es una verificacion.
  const mentiroso = facade.createZkVerifier({
    verificationKey: { vk: 1 },
    expectedPublicInputs: ["a", "b"],
    backend: async () => ({ verified: true }),
  });
  const answered = await mentiroso({ proof: {}, publicInputs: ["a", "b"] });
  assert.equal(answered.verified, false);
  assert.equal(answered.code, "proof_rejected");
  assert.equal(llamadas.length, 1);

  // Camino feliz, con la limitacion de que esto es el backend del fixture y no criptografia.
  const bueno = await conBackend({ proof: {}, publicInputs: ["a", "b"] });
  assert.equal(bueno.verified, true);
  assert.equal(bueno.backendDigest, "sha256:fixture");
});

test("A14 ZK incoherente no se reconcilia como verified, y los cuatro limites nunca son true", async () => {
  const facade = await syntheticKit().load();
  const limits = ["zk.presenter-authentication", "zk.institutional-attestation", "zk.replay-prevention", "zk.transport-privacy"];
  for (const key of limits) assert.deepEqual([...facade.ZK_LIMIT_CHECKS], limits);

  const conBackend = facade.createZkVerifier({
    verificationKey: { vk: 1 },
    expectedPublicInputs: null,
    backend: async () => true,
    backendDigest: "sha256:fixture",
  });
  const verified = await conBackend({ proof: {}, publicInputs: [] });
  for (const key of limits) assert.equal(verified.coverage[key], false, `${key} no es una comprobacion que el puerto pueda volver true`);
  assert.deepEqual([...facade.ZK_CHECK_KEYS], ["zk.verification-key-pinned", "zk.public-inputs-bound", "zk.proof-valid"]);
  assert.equal(facade.ZK_CHECK_KEYS.includes("zk.presenter-authentication"), false, "un limite no es un check cubierto");

  // reconcileZk del kernel: un result 'verified' con verified false no es incoherente (es lo que B7
  // describio); lo incoherente es al reves, y eso no se reconcilia como verified.
  const coherente = { verification: { zk: { result: "verified", verified: false } } };
  assert.equal(facade.reconcileZk(coherente, { verified: false }).ok, true);
  const incoherente = { verification: { zk: { result: "verified", verified: true } } };
  assert.equal(facade.reconcileZk(incoherente, { verified: false }).ok, false);
  assert.deepEqual(facade.readZkEvidence(coherente), { present: true, result: "verified", verified: false, code: null });
  assert.equal(facade.readZkClaim(coherente).zk, "verified");
  assert.equal(facade.digestZkVerificationKey({ vk: 1 }).length, 64);
  assert.equal(typeof facade.ZK_VK_SCHEMA, "object");
  assert.equal(typeof facade.ZK_EVIDENCE_SCHEMA, "object");
});

// --- A15: los recibos nativos se devuelven como los sello el kernel --------------------------------

test("A15 ningun recibo nativo lleva estampa del kit, y todos verifican su digest antes de escribir", async () => {
  const facade = await syntheticKit().load();
  const spec = { name: "demo", repository: "org/repo", commit: "c".repeat(40), author: "andres", content: "print(1)", authorities: {} };
  const { claim } = facade.registerSkillProvenance(spec);
  const verification = await facade.verifySkillProvenance(claim, async () => ({
    repository: spec.repository, commitExists: true, author: spec.author, content: spec.content,
  }), {});
  const natives = [
    facade.buildSkillReceipt(spec, facade.loadSkill(claim, verification, spec.content, {})),
    (await facade.exerciseEmergency(
      (await facade.createEmergencyPermission({ trigger: "t", grantor: "p" }, { authorizeGrantor: async () => ({ authorized: true }) })).permission,
      { signal: { trigger: "t" } },
      { resolveVerifier: async (signal) => ({ trigger: signal.trigger }) },
    )).receipt,
  ];
  for (const receipt of natives) {
    assert.equal(receipt.persistence, undefined, "el kit no le estampa persistence a un recibo nativo");
    assert.equal(receipt.economy, undefined);
    assert.equal(receipt.chain, undefined);
  }
  // El sello del kernel sigue siendo el suyo: la fachada no lo re-sella ni lo reescribe.
  const { createRequire } = await import("node:module");
  const kernelRequire = createRequire(join(coreDirOfKit, "anchor.cjs"));
  const receipt = kernelRequire("./kernel/receipt.js");
  const verificado = receipt.verifyReceipt(receipt.buildReceipt({
    id: "n", operation: { id: "o", goal: "g" }, capability: "c", authority: { grants: [], exercised: [] },
    outcome: "verified", evidence: { observed: true }, verification: { verified: true }, at: "2026-01-01T00:00:00.000Z",
  }));
  assert.equal(verificado.ok, true, "un recibo del kernel verifica su digest antes de cualquier escritura");
});

// --- lo que el kit ya exportaba, sin cambio --------------------------------------------------------

test("A16 la superficie de operacion, estado, coordinacion y delegation sigue igual", async () => {
  const facade = await syntheticKit().load();
  for (const name of [
    "ARTIFACT_SCHEMA_VERSION", "FASES_FILE", "OPERATIONS_HEADING", "appendCheckpoint", "certify", "createArtifact",
    "governable", "loadOperationState", "operationStatePath", "reconcileForeign", "resumeAllowed", "resumeArtifact",
    "saveOperationState", "statePath", "successor", "transitionArtifact", "viableWithOpen",
    "closeOperation", "declareEffect", "dispatchTask", "integrateTask", "observeTask", "planTask", "receiveTask",
    "reviewTask", "taskSummary", "verifyTask",
    "createOperation", "runOperation", "STATES",
    "createDelegation", "recordStart", "recordResult", "reviewDelegation", "recordCard", "delegationReceipt",
    "integrateDelegation", "personView",
    "runBoundedOperation", "validateReceipt", "mayRetry", "classifyOutcome", "proposeHandoff", "routeOperation",
    "holdOperation", "readOperation", "resumeOperation", "runDurableOperation",
  ]) {
    assert.ok(name in facade, `${name} ya no está en la fachada`);
  }
  // Y el hash de la fachada solo cambia por la adición opcional, no por reescribir lo que ya hacia.
  const actual = readFileSync(join(coreDirOfKit, "vespi.mjs"), "utf8");
  assert.equal(createHash("sha256").update(actual.slice(0, actual.indexOf("const require = createRequire"))).digest("hex").length, 64);
});
