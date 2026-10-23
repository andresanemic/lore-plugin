import assert from "node:assert/strict";
import { test } from "node:test";
import * as vespi from "../skills/vespi/core/vespi.mjs";
import { reviewSparks } from "../skills/vespi/ofrece-formas-trabajo.mjs";

const sparks = ["faltaba el caso vacío", "el límite cambia el resultado", "la fuente no coincide", "persistir conserva el estado", "revisar después de integrar"];

test("el recibo R45 declara persistencia, sella cinco chispas y oculta la carta a la vista humana", () => {
  const delegation = vespi.createDelegation({
    task: "corregir y revisar el artefacto",
    medium: { cwd: "C:/repo", material: ["src/"], forbidden: [] },
    delegate: "worker",
    orchestrator: "coordinator",
  });
  vespi.recordCard(delegation, { deck: "entre", card: "¿Miraste tu entrega completa?", perturbation: "task-start" });
  vespi.recordStart(delegation, { readTask: true });
  vespi.recordResult(delegation, { output: "listo", touched: ["src/a.mjs"], sparks });
  vespi.reviewDelegation(delegation, { reviewer: "coordinator", accept: true });
  const receipt = vespi.integrateDelegation(delegation, { persistence: { owner: "none" } });
  assert.equal(receipt.sparks.length, 5);
  assert.equal(receipt.cards[0].silent, true);
  assert.equal(receipt.usage_estimate.spark_tokens_estimated > 0, true);
  assert.equal(receipt.usage_estimate.card_tokens_estimated > 0, true);
  assert.equal(Object.hasOwn(receipt, "transcript"), false);
  assert.equal(vespi.verifyDelegationReceipt(receipt), true);
  assert.equal(vespi.verifyDelegationReceipt({ ...receipt, persistence: { owner: "other" } }), false);
  assert.equal(Object.hasOwn(vespi.personView(delegation), "cards"), false);
});

test("una delegación no puede cerrar si falta persistencia declarada", () => {
  const delegation = vespi.createDelegation({ task: "t", medium: { cwd: "C:/repo" }, delegate: "worker", orchestrator: "coordinator" });
  vespi.recordStart(delegation, { readTask: true });
  vespi.recordResult(delegation, { output: "ok", touched: [], sparks });
  vespi.reviewDelegation(delegation, { reviewer: "coordinator", accept: true });
  assert.throws(() => vespi.integrateDelegation(delegation), /persistence declaration/);
});

test("la revisión de chispas exige recibo genuino integrado y aceptación previa", () => {
  const reviews = sparks.map(text => ({ text, disposition: "promoted" }));
  const d = vespi.createDelegation({ task: "t", medium: { cwd: "C:/repo" }, delegate: "worker", orchestrator: "coordinator" });
  vespi.recordStart(d, { readTask: true });
  vespi.recordResult(d, { output: "ok", touched: [], sparks });
  const returned = vespi.delegationReceipt(d, { persistence: { owner: "none" } });
  assert.throws(() => reviewSparks(returned, reviews), /authentic accepted integration receipt/);
  vespi.reviewDelegation(d, { reviewer: "coordinator", accept: true });
  const receipt = vespi.integrateDelegation(d, { persistence: { owner: "none" } });
  assert.equal(Object.keys(reviewSparks(receipt, reviews)).length, 3);
  assert.throws(() => reviewSparks({ ...receipt }, reviews), /authentic accepted integration receipt/);
});

test("la vía singular heredada valida cada chispa y el sello vuelve a comprobarlas", () => {
  const d = vespi.createDelegation({ task: "t", medium: { cwd: "C:/repo" }, delegate: "worker", orchestrator: "coordinator" });
  vespi.recordStart(d, { readTask: true });
  assert.throws(() => vespi.recordResult(d, { output: "bad", touched: [], spark: "🌷 no" }), /valid spark/);
  for (const spark of sparks) vespi.recordResult(d, { output: "ok", touched: [], spark });
  vespi.reviewDelegation(d, { reviewer: "coordinator", accept: true });
  d.sparks[0] = "🌷 invalid mutation";
  assert.throws(() => vespi.integrateDelegation(d, { persistence: { owner: "none" } }), /valid sparks/);
});
