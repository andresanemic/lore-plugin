import assert from "node:assert/strict";
import { join } from "node:path";
import test from "node:test";

import { countPostConvergenceSparks, inventoryWrites } from "./spec-a-verifier.mjs";

const root = join(import.meta.dirname, "..");

test("cada primitiva de escritura distribuida tiene destino clasificado", () => {
  const inventory = inventoryWrites(root);
  assert.ok(inventory.length > 0);
  assert.deepEqual(inventory.filter((entry) => entry.destination === null), []);
});

test("el verificador falla a la tercera chispa posterior a convergencia", () => {
  assert.equal(countPostConvergenceSparks([
    { type: "convergence" },
    { type: "spark" },
    { type: "spark" },
  ]), 2);
  assert.throws(() => countPostConvergenceSparks([
    { type: "convergence" },
    { type: "spark" },
    { type: "spark" },
    { type: "spark" },
  ]), /techo de 2/);
});
