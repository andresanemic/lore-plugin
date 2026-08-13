import assert from "node:assert/strict";
import test from "node:test";

import { resolveSuite } from "./suite.mjs";

test("usa el benchmark principal cuando no se elige una suite", () => {
  const config = resolveSuite("C:\\repo\\bench", null);
  assert.equal(config.root, "C:\\repo\\bench");
});

test("aísla tareas, fixtures y resultados de una suite nombrada", () => {
  const config = resolveSuite("C:\\repo\\bench", "writing");
  assert.equal(config.root, "C:\\repo\\bench\\writing");
});

test("rechaza nombres de suite que puedan escapar de bench", () => {
  assert.throws(() => resolveSuite("C:\\repo\\bench", "../fuera"), /Suite inválida/);
});
