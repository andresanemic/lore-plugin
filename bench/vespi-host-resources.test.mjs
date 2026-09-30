import test from "node:test";
import assert from "node:assert/strict";
import { measureHost } from "../skills/vespi/core/host-resources.mjs";

test("RC6 recursos: solo expone hora, memoria y concurrencia, con cobertura", () => {
  const result = measureHost({ now: () => new Date("2026-09-29T20:00:00.000Z"), free: () => 8, total: () => 16, parallel: () => 4 });
  assert.deepEqual(result, { measured: true, at: "2026-09-29T20:00:00.000Z", freeBytes: 8, totalBytes: 16, parallelism: 4 });
});

test("RC6 recursos: un sondeo fallido declara no medido y no inventa capacidad", () => {
  const result = measureHost({ now: () => new Date("2026-09-29T20:00:00.000Z"), free: () => { throw Error("no access"); }, total: () => 16, parallel: () => 4 });
  assert.equal(result.measured, false);
  assert.equal(result.freeBytes, null);
  assert.equal(result.parallelism, null);
});
