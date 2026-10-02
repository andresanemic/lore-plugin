// RC7 - corte 1: la superficie durable de una operacion, conectada a la fachada.
//
// Que falta resolver aqui, dicho sin adornos: `operation-state.mjs` sabia escribir y recuperar un
// artefacto, y `vespi.mjs` -la fachada, el unico modulo que la skill le dice importar a un
// llamador- sabia correr una operacion acotada, y las dos mitades no se tocaban. Un llamador
// podia declarar `persistence: { owner: "operations/x/estado.md" }` en un recibo y no escribir un
// byte: un dueno que el kit nunca cumplia, durable y falso, justo lo que la propia regla de la
// skill prohibe ("honestamente efimero le gana a falsamente durable"). Y no habia una pregunta
// por la capacidad actual del host, de modo que una ruta declarada sin herramienta no tenia forma
// veraz de existir: quedaba la tentacion de inventar un proveedor, un modelo de decision o una
// aprobacion.
//
// Cada prueba corre contra la fachada y kernel reales, y un directorio temporal que se borra al
// terminar. Las pruebas de ruta delegation ejercitan solo el contrato interno del adaptador; no
// abren una sesion de host ni simulan permiso nativo. Donde falta herramienta, afirman el bloqueo.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const V = "../skills/vespi/core/vespi.mjs";
const S = "../skills/vespi/core/operation-state.mjs";

const OBJETIVO = "Mapear el criterio disperso de portal-clientes antes de mover nada";
const MANDATO = { spend: [{ asset: "lectura", maxAmount: "1", to: "portal-clientes" }] };
const VERIFICA = { verify: async () => ({ verified: true, checks: { leido: true }, reason: "tres fuentes leidas" }) };

async function proyecto(t) {
  const root = await mkdtemp(join(tmpdir(), "vespi-durable-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

// La capacidad de siempre, con las llamadas contadas: una ruta sin host no puede pasar por aqui.
function espia(extra = {}) {
  const calls = { required: 0, perform: 0 };
  const capability = {
    id: "mapear-criterio-disperso",
    required: () => {
      calls.required += 1;
      return { spend: [{ asset: "lectura", amount: "1", to: "portal-clientes" }] };
    },
    perform: async () => {
      calls.perform += 1;
      return { ok: true, evidence: { status: "ok", filas: 3 } };
    },
    ...extra,
  };
  return { capability, calls };
}

function archivo(root, id) {
  return join(root, "FASES.md");
}

// A - la fachada es la puerta, y por ella se entra a todo esto.

test("la fachada expone el estado durable y la corrida que lo usa", async () => {
  const facade = await import(V);
  for (const name of [
    "holdOperation",
    "resumeOperation",
    "runDurableOperation",
    "routeOperation",
    "createArtifact",
    "appendCheckpoint",
    "transitionArtifact",
    "resumeArtifact",
    "saveOperationState",
    "loadOperationState",
    "operationStatePath",
    "statePath",
  ]) {
    assert.equal(typeof facade[name], "function", `la fachada no expone ${name}`);
  }
});

// B - un dueno declarado se vuelve un archivo, o none.

test("un dueno de persistencia declarado se vuelve un archivo real", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability, calls } = espia();

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    io: VERIFICA,
  });

  assert.equal(calls.perform, 1);
  assert.equal(out.receipt.status, "verified");
  assert.equal(out.receipt.persistence.owner, `FASES.md#${out.artifact.id}`);
  assert.equal(out.artifact.state, "verified");
  assert.equal(out.artifact.next_legitimate_action, "certify");
  assert.equal(existsSync(out.file), true, "el recibo declara un dueno y el archivo no existe");

  const escrito = await readFile(out.file, "utf8");
  assert.ok(escrito.includes(out.receipt.digest), "el estado durable no nombra el recibo que lo produjo");
  assert.deepEqual(
    await facade.loadOperationState(facade.operationStatePath(root, out.artifact.id).directory, out.artifact.id),
    out.artifact,
  );
});

test("sin raiz no hay dueno: el recibo declara none y no se escribe nada", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability } = espia();

  const out = await facade.runDurableOperation({
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    io: VERIFICA,
  });

  assert.equal(out.receipt.status, "verified");
  assert.deepEqual(out.receipt.persistence, { owner: "none" });
  assert.equal(out.artifact, null);
  assert.equal(out.file, null);
  assert.deepEqual(await readdir(root), [], "una operacion efimera no deja directorio");
});

// C - rutas por capacidad observada, y bloqueos veraces.

test("una ruta declarada sin herramienta en el host vuelve bloqueada, no simulada", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability, calls } = espia();

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    intent: "delegation",
    host: {},
  });

  assert.equal(calls.required, 0, "una ruta sin host llega a pedir la capacidad del llamador");
  assert.equal(calls.perform, 0, "una ruta sin host ejecuta algo");
  assert.equal(out.receipt.status, "blocked");
  assert.match(out.receipt.detail, /delegate/, "el bloqueo no nombra la herramienta que falta");
  assert.equal(out.receipt.authority.approval, undefined, "se fabrico una aprobacion");
  assert.equal(out.artifact.state, "blocked");
  assert.equal(out.artifact.next_legitimate_action, "decide");
  assert.equal(out.artifact.provenance.route, "delegation");
  assert.match(out.artifact.provenance.route_blocked_by, /delegate/);
});

test("una herramienta del host no es un aprobador: sin ask no hay aprobacion", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability, calls } = espia();
  let delegada = 0;

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: { spend: [] },
    capability,
    intent: "delegation",
    host: {
      delegate: async () => {
        delegada += 1;
        return { ok: true, evidence: { status: "ok" } };
      },
    },
  });

  assert.equal(delegada, 0, "la fachada llamo a un proveedor que el llamador no pidio");
  assert.equal(calls.perform, 0);
  assert.equal(out.receipt.status, "needs_human_decision");
  assert.equal(out.receipt.authority.approval, "human_gate_no_decision");
  assert.equal(out.artifact.state, "requires_decision");
});

test("la ruta delegada llama al contrato del adaptador y el kernel revisa la evidencia recibida", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability, calls } = espia();
  const eventos = [];
  let entregaVerificada = null;
  const assignment = {
    task: "Lee el módulo indicado y devuelve hallazgos con rutas y límites",
    medium: { cwd: "/repo/modulo", material: ["src/"], forbidden: ["secrets/"] },
  };
  const delegate = async (request) => {
    eventos.push("delegate");
    assert.equal(request.operation.goal, OBJETIVO);
    assert.deepEqual(request.assignment, assignment);
    assert.deepEqual(request.authority, MANDATO);
    return { ok: true, output: "Hallazgo con referencia a src/index.mjs", evidence: { artifact: "src/index.mjs", reviewed: false } };
  };
  delegate.effectiveTerms = async ({ assignment: scopedAssignment }) => {
    assert.deepEqual(scopedAssignment, assignment);
    return { asset: "lectura", amount: "1", to: "portal-clientes" };
  };

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    intent: "delegation",
    assignment,
    declaredEffect: { asset: "lectura", amount: "1", to: "portal-clientes" },
    host: { delegate },
    io: {
      verify: async (evidence) => {
        eventos.push("verify");
        entregaVerificada = evidence;
        return { verified: true, checks: { payloadReviewed: true }, reason: "el adaptador devolvió evidencia; el verificador del test la aceptó" };
      },
    },
  });

  assert.deepEqual(eventos, ["delegate", "verify"], "la llamada del host va antes de verificar su entrega");
  assert.equal(calls.perform, 0, "una ruta delegada no sustituye al worker con ejecución local");
  assert.deepEqual(entregaVerificada, { artifact: "src/index.mjs", reviewed: false });
  assert.equal(out.receipt.status, "verified");
  assert.equal(out.artifact.provenance.route, "delegation");
  assert.equal(out.receipt.verification.reason, "el adaptador devolvió evidencia; el verificador del test la aceptó");
});

test("la ruta delegada bloquea el efecto declarado si el adaptador reporta términos divergentes", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability, calls } = espia();
  let delegada = 0;
  const delegate = async () => {
    delegada += 1;
    return { ok: true, evidence: { artifact: "src/index.mjs" } };
  };
  delegate.effectiveTerms = async () => ({ asset: "escritura", amount: "1", to: "portal-clientes" });

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    intent: "delegation",
    declaredEffect: { asset: "lectura", amount: "1", to: "portal-clientes" },
    host: { delegate },
  });

  assert.equal(out.receipt.status, "failed");
  assert.match(out.receipt.detail, /effective terms diverge/);
  assert.equal(delegada, 0, "un efecto divergente se detiene antes de llamar al adaptador");
  assert.equal(calls.perform, 0, "tampoco cae a la capacidad local");
});

test("con la herramienta presente, la ruta entra por ella y la persona decide", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability } = espia();
  let consejo = null;
  let consultada = 0;

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: { spend: [] },
    capability,
    intent: "advisor",
    host: {
      decide: async () => {
        consultada += 1;
        return { choice: true, probability: 0.99 };
      },
    },
    io: {
      ask: async (payload) => {
        consejo = payload.suggestion ?? null;
        return { approved: true, by: "noren" };
      },
    },
  });

  assert.equal(facade.routeOperation({ intent: "advisor", host: { decide: async () => {} } }).available, true);
  assert.equal(consultada, 1, "el modelo de decision del host no llego al kernel");
  assert.deepEqual(consejo, { choice: true, probability: 0.99, by: "decision-model" });
  // Nobody verified anything in this run, and the receipt says so instead of going green.
  assert.equal(out.receipt.status, "not_verified");
  assert.equal(out.receipt.verification.reason, "no verifier");
  assert.equal(out.artifact.state, "unknown", "sin verificar es UNKNOWN, no un exito");
  assert.equal(out.artifact.next_legitimate_action, "reconcile");
  assert.equal(out.receipt.decidedBy, "noren", "quien aprueba es la persona, no el modelo");
});

test("una ruta que no existe es un bloqueo con nombre, no un direct silencioso", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { capability, calls } = espia();

  const route = facade.routeOperation({ intent: "proveedor-propio" });
  assert.equal(route.available, false);
  assert.match(route.reason, /unknown execution route/);

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    intent: "proveedor-propio",
  });

  assert.equal(calls.perform, 0);
  assert.equal(out.receipt.status, "blocked");
  assert.match(out.receipt.detail, /unknown execution route/);
});

test("una corrida sin capacidad es un error de quien llama, y no escribe nada", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);

  await assert.rejects(
    () => facade.runDurableOperation({ root, goal: OBJETIVO, owner: "noren", authority: MANDATO }),
    /capability/,
  );
  assert.deepEqual(await readdir(root), [], "una llamada invalida dejo una operacion a medias");
});

// D - otra sesion, sin traspaso.

test("una segunda sesion retoma desde el archivo y sigue la misma operacion", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);

  const primera = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability: espia().capability,
    intent: "delegation",
    host: {},
  });
  assert.equal(primera.receipt.status, "blocked");

  const vista = await facade.resumeOperation({ root, id: primera.artifact.id });
  assert.equal(vista.allowed, true);
  assert.equal(vista.artifact.working_goal, OBJETIVO);
  assert.equal(vista.persistence.owner, `FASES.md#${primera.artifact.id}`);

  const segunda = await facade.runDurableOperation({
    root,
    id: primera.artifact.id,
    authority: MANDATO,
    capability: espia().capability,
    intent: "delegation",
    assignment: { task: "Retoma la lectura del modulo", medium: { cwd: "/repo/modulo", material: ["src/"], forbidden: ["secrets/"] } },
    host: {
      delegate: async () => ({
        ok: true,
        output: "Entrega retomada",
        evidence: { artifact: "src/index.mjs", reviewed: false },
      }),
    },
    io: VERIFICA,
  });

  assert.equal(segunda.receipt.status, "verified");
  assert.equal(segunda.artifact.id, primera.artifact.id, "retomar no mina una identidad nueva");
  assert.equal(segunda.artifact.checkpoints[0].note, "R1-genesis");
  assert.ok(segunda.artifact.checkpoints.length > primera.artifact.checkpoints.length);
  assert.equal(
    (await facade.loadOperationState(facade.operationStatePath(root, primera.artifact.id).directory, primera.artifact.id)).state,
    "verified",
  );
});

test("una premisa caida detiene la reanudacion silenciosa y no escribe", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);

  const primera = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability: espia().capability,
    intent: "delegation",
    host: {},
  });
  const antes = await readFile(archivo(root, primera.artifact.id), "utf8");

  const vista = await facade.resumeOperation({
    root,
    id: primera.artifact.id,
    freshness: [{ subject: "mandato", result: "stale", evidence: "la persona lo cambio" }],
  });

  assert.equal(vista.allowed, false);
  assert.equal(vista.reason, "stale_premise");
  assert.equal(await readFile(archivo(root, primera.artifact.id), "utf8"), antes, "un rechazo escribio igual");
});

test("una corrida sobre una operacion que no se puede reanudar no ejecuta nada", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);

  const primera = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability: espia().capability,
    intent: "delegation",
    host: {},
  });
  const caida = [{ subject: "mandato", result: "stale" }];
  const { capability, calls } = espia();

  const reintento = await facade.runDurableOperation({
    root,
    id: primera.artifact.id,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability,
    freshness: caida,
    io: VERIFICA,
  });

  assert.equal(reintento.status, "not_resumed");
  assert.equal(reintento.receipt, null, "un rechazo fabrica un recibo");
  assert.equal(calls.perform, 0);
  assert.equal(
    (await facade.loadOperationState(facade.operationStatePath(root, primera.artifact.id).directory, primera.artifact.id)).state,
    "blocked",
  );
});

test("una operacion que no existe en disco falla de frente, no arranca otra", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);

  await assert.rejects(() => facade.resumeOperation({ root, id: "op-nunca-existio" }), /not found in FASES.md/i);
  assert.deepEqual(await readdir(root), [], "un fallo creo una operacion nueva");
});

// E - lo que un recibo verificado todavia no cierra.

test("un recibo verificado no cierra la operacion: cerrar es de quien certifica", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { certify } = await import(S);

  const out = await facade.runDurableOperation({
    root,
    goal: OBJETIVO,
    owner: "noren",
    authority: MANDATO,
    capability: espia().capability,
    io: VERIFICA,
  });

  assert.equal(out.artifact.state, "verified");
  assert.equal(out.artifact.next_legitimate_action, "certify");
  assert.equal(certify({ finished: true, verified: true, authority: {} }), "finished_verified_uncertified");
});

// F - las primitivas que sostienen todo lo de arriba.

test("el estado vive en FASES.md bajo el id de la operacion y el id no se sale de ahi", async () => {
  const { operationStatePath } = await import(S);
  const ok = operationStatePath("/proyecto", "op-migracion-mapa");
  assert.equal(ok.relative, "FASES.md#op-migracion-mapa");
  assert.equal(ok.file, join(ok.directory, "FASES.md"));
  assert.equal(ok.directory, resolve("/proyecto"));
  assert.throws(() => operationStatePath("/proyecto", "../fuera"), /invalid operation id/);
  assert.throws(() => operationStatePath("/proyecto", "op-1/../../fuera"), /invalid operation id/);
});

test("el recorrido entre estados es el legal, o no existe", async () => {
  const { statePath } = await import(S);
  assert.deepEqual(statePath("prepared", "prepared"), []);
  assert.deepEqual(statePath("prepared", "blocked"), ["blocked"]);
  assert.deepEqual(statePath("blocked", "verified"), ["verified"]);
  assert.deepEqual(statePath("prepared", "verified"), ["blocked", "verified"]);
  assert.equal(statePath("closed", "verified"), null, "un estado terminal no tiene salida");
  assert.throws(() => statePath("prepared", "inventado"), /invalid operation state/);
});

// G - el checkpoint unico vive en FASES.md (Spec 014): un bloque por operacion, en su lugar, sin copia en operations/.

const MARCA = (id) => `<!-- vespi:operacion ${id} -->`;

test("el estado de una operacion es un bloque de FASES.md y nunca crea operations/", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { artifact, persistence } = await facade.holdOperation({ root, goal: OBJETIVO, owner: "noren", authority: MANDATO });
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  assert.ok(fases.includes(MARCA(artifact.id)), "FASES.md no trae el bloque de la operacion");
  assert.ok(fases.includes(`<!-- /vespi:operacion ${artifact.id} -->`));
  assert.equal(persistence.owner, `FASES.md#${artifact.id}`);
  assert.equal(existsSync(join(root, "operations")), false, "se creo operations/: es la copia que el checkpoint unico evita");
});

test("el bloque se actualiza en su lugar y el resto de FASES.md no cambia; dos operaciones conviven", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const antes = "# FASES - proyecto\n\n## Activo\n\nLo que ya habia, que no se toca.\n\n## Cierre\n\nOtra seccion.\n";
  await writeFile(join(root, "FASES.md"), antes);
  const a = await facade.holdOperation({ root, goal: "primera", owner: "noren", authority: MANDATO });
  const b = await facade.holdOperation({ root, goal: "segunda", owner: "noren", authority: MANDATO });
  const { capability } = espia();
  await facade.runDurableOperation({ root, id: a.artifact.id, goal: "primera", owner: "noren", authority: MANDATO, capability, io: VERIFICA });
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  for (const trozo of ["# FASES - proyecto", "Lo que ya habia, que no se toca.", "## Cierre\n\nOtra seccion."]) {
    assert.ok(fases.includes(trozo), `se perdio contenido ajeno: ${trozo}`);
  }
  assert.equal(fases.split(MARCA(a.artifact.id)).length, 2, "la operacion A quedo duplicada");
  assert.equal(fases.split(MARCA(b.artifact.id)).length, 2);
  assert.equal(fases.split("## Operaciones").length, 2, "el encabezado de operaciones quedo repetido");
  assert.equal((await facade.readOperation({ root, id: a.artifact.id })).state, "verified");
  assert.equal((await facade.readOperation({ root, id: b.artifact.id })).state, "prepared");
});

test("un FASES.md con finales de linea CRLF los conserva", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  await writeFile(join(root, "FASES.md"), "# FASES\r\n\r\nUna linea.\r\n");
  await facade.holdOperation({ root, goal: OBJETIVO, owner: "noren", authority: MANDATO });
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  assert.ok(!/(^|[^\r])\n/.test(fases), "aparecio un salto de linea LF en un archivo CRLF");
});

test("al cerrar, el bloque se vuelve un cierre breve sin la copia del progreso, y ya no se reanuda", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  const { artifact } = await facade.holdOperation({ root, goal: OBJETIVO, owner: "noren", authority: MANDATO });
  let a = artifact;
  for (const state of ["authorized", "running", "received", "reviewed"]) a = facade.transitionArtifact(a, { state, note: state });
  a = { ...a, verification: { verified: true } };
  a = facade.transitionArtifact(a, { state: "verified", note: "verificada" });
  a = facade.transitionArtifact(a, { state: "closed", note: "cerrada" });
  await facade.saveOperationState(root, a);
  const fases = await readFile(join(root, "FASES.md"), "utf8");
  assert.match(fases, /cerrada/i);
  assert.ok(!fases.includes("checkpoints"), "el cierre sigue llevando la copia del progreso");
  assert.ok(!fases.includes("R1-genesis"));
  const leida = await facade.readOperation({ root, id: a.id });
  assert.equal(leida.state, "closed");
  assert.equal(facade.resumeArtifact(leida).allowed, false);
});

test("un bloque con apertura y sin cierre se rechaza en vez de adivinarse", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  await writeFile(join(root, "FASES.md"), `# FASES\n\n${MARCA("op-roto")}\n### a medias\n`);
  await assert.rejects(() => facade.readOperation({ root, id: "op-roto" }), /damaged|corrupt/i);
});

test("leer una operacion que no esta en FASES.md es un error claro", async (t) => {
  const root = await proyecto(t);
  const facade = await import(V);
  await assert.rejects(() => facade.readOperation({ root, id: "op-no-existe" }), /not found|no encontrada/i);
});
