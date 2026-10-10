// RC5: la copia del kernel incluye delegation.js (K7) y la fachada lo expone sin abrir una vía
// nueva. Lo que se prueba aquí no es el kernel — eso lo prueba su propia suite en la fuente — sino
// la costura: que el kit puede llevar una delegación a un recibo sellado, y que las tres promesas
// que el corte RC5 trae (la revisión previa, la violación permanente, la carta silenciosa) siguen
// en pie después de pasar por la fachada.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { test } from "node:test";

const V = "../skills/vespi/core/vespi.mjs";
const K = "../skills/vespi/core/kernel";

async function kit() {
  const facade = await import(V);
  const { verifyReceipt } = await import(`${K}/receipt.js`).then((m) => m.default ?? m);
  return { facade, verifyReceipt };
}

function delegation(facade, over = {}) {
  return facade.createDelegation({
    task: "add the four missing tests to operation-state.test.mjs",
    medium: { cwd: "C:/repo", material: ["skills/"], forbidden: [".env"] },
    delegate: "cheap-model",
    orchestrator: "orchestrator",
    ...over,
  });
}

test("la fachada expone la superficie de delegación del kernel", async () => {
  const { facade } = await kit();
  for (const name of ["createDelegation", "recordStart", "recordResult", "reviewDelegation", "integrateDelegation", "delegationReceipt", "recordCard", "personView"]) {
    assert.equal(typeof facade[name], "function", `la fachada no expone ${name}`);
  }
});

test("una delegación que nadie revisó no se integra", async () => {
  const { facade } = await kit();
  const d = delegation(facade);
  facade.recordStart(d, { readTask: true });
  facade.recordResult(d, { output: "listo", touched: ["skills/vespi/core/x.test.mjs"] });
  assert.equal(d.state, "returned");
  assert.throws(() => facade.integrateDelegation(d), /not accepted/);
});

test("el recibo que entrega la fachada lo verifica el mismo kernel", async () => {
  const { facade, verifyReceipt } = await kit();
  const d = delegation(facade);
  facade.recordStart(d, { readTask: true });
  facade.recordResult(d, { output: "listo", touched: ["skills/vespi/core/x.test.mjs"] });
  facade.reviewDelegation(d, { reviewer: "orchestrator", accept: true });
  const receipt = facade.integrateDelegation(d);
  assert.equal(verifyReceipt(receipt).ok, true, "el recibo de la delegación no lo verifica receipt.js del kit");
});

test("el recibo sale sellado: la fachada no le estampa nada encima", async () => {
  const { facade, verifyReceipt } = await kit();
  const d = delegation(facade);
  facade.recordStart(d, { readTask: true });
  facade.recordResult(d, { output: "listo", touched: ["skills/vespi/core/x.test.mjs"] });
  facade.reviewDelegation(d, { reviewer: "orchestrator", accept: true });
  const receipt = facade.integrateDelegation(d);
  assert.equal(typeof receipt.digest, "string");
  assert.equal(verifyReceipt(receipt).ok, true, "la fachada tocó un recibo ya sellado");
});

test("una violación ya registrada no la borra una entrega limpia", async () => {
  const { facade } = await kit();
  const d = delegation(facade);
  facade.recordStart(d, { readTask: true });
  const outside = resolve(tmpdir(), "private-key-fixture");
  facade.recordResult(d, { output: "primero", touched: [outside] });
  assert.deepEqual(d.violations, [outside]);
  assert.equal(d.state, "out_of_bounds");
  facade.recordResult(d, { output: "segundo", touched: ["skills/vespi/core/x.test.mjs"] });
  assert.deepEqual(d.violations, [outside], "una segunda entrega limpia borró la violación");
  assert.equal(d.state, "out_of_bounds");
});

test("una carta marcada como silenciosa no viaja en el recibo", async () => {
  const { facade } = await kit();
  const d = delegation(facade);
  facade.recordCard(d, { deck: "entre", card: "quizá el criterio era otro" });
  assert.equal(d.cards.length, 1);
  assert.equal(d.cards[0].silent, true);
  assert.deepEqual(facade.personView(d).cards, undefined, "la vista de la persona dejó ver cartas");
  facade.recordStart(d, { readTask: true });
  facade.recordResult(d, { output: "listo", touched: ["skills/vespi/core/x.test.mjs"] });
  facade.reviewDelegation(d, { reviewer: "orchestrator", accept: true });
  assert.deepEqual(facade.integrateDelegation(d).cards, [], "una carta silenciosa viaja en el recibo");
});

test("una chispa del delegado es una chispa, y un informe no cabe en una", async () => {
  const { facade } = await kit();
  const d = delegation(facade);
  facade.recordStart(d, { readTask: true });
  facade.recordResult(d, { output: "listo", touched: ["skills/vespi/core/x.test.mjs"], spark: "faltaba el caso sin token" });
  assert.deepEqual(d.sparks, ["faltaba el caso sin token"]);
  assert.throws(() => facade.recordResult(d, { output: "x", touched: [], spark: "palabra ".repeat(21) }), /at most 20 words/);
});

test("una delegación que no pudo arrancar no se reanuda: se relanza", async () => {
  const { facade } = await kit();
  const d = delegation(facade);
  const out = facade.recordStart(d, { readTask: false, rejected: "the host refused the assignment" });
  assert.equal(out.relaunch, true);
  assert.equal(d.state, "failed_to_start");
  assert.throws(() => facade.recordResult(d, { output: "listo", touched: [] }), /relaunch/);
});
