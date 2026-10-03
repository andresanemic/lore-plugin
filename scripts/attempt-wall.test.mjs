import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { attemptWall } from "../skills/vespi/core/operation-state.mjs";

const observation = (signature, text, outcome = "failure") => ({ signature, text, outcome });
const artifact = (...observations) => ({ tasks: [{ observations }] });

test("dos fallos iguales no activan el muro", () => {
  const result = attemptWall(artifact(observation("TypeError 42", "intenté ejecutar una"), observation("TypeError 91", "intenté ejecutar dos")));
  assert.equal(result.stop, false);
});

test("tres fallos iguales normalizados y seguidos activan el muro", () => {
  const result = attemptWall(artifact(
    observation("TypeError 42 en C:\\tmp\\run42.js", "npm test -- a"),
    observation("typeerror 91 en C:\\tmp\\run91.js", "npm test -- b"),
    observation("TYPEERROR 7 en C:\\tmp\\run7.js", "npm test -- c"),
  ));
  assert.equal(result.stop, true);
  assert.equal(result.attempts.length, 3);
  assert.match(result.signature, /typeerror/);
  assert.doesNotMatch(result.signature, /42|91|run7|tmp/);
});

test("un éxito en medio reinicia la racha de fallos", () => {
  const result = attemptWall(artifact(
    observation("Error 3", "primer intento"),
    { outcome: "success", text: "resolví el paso" },
    observation("Error 4", "segundo intento"),
    observation("Error 5", "tercer intento"),
  ));
  assert.equal(result.stop, false);
});

test("firmas distintas no activan el muro aunque sumen tres fallos", () => {
  const result = attemptWall(artifact(
    observation("TypeError alpha", "intenté A"),
    observation("RangeError beta", "intenté B"),
    observation("SyntaxError gamma", "intenté C"),
  ));
  assert.equal(result.stop, false);
});

test("el muro ordena observaciones de todas las tareas por tiempo", () => {
  const task = (observations) => ({ observations });
  const reordered = attemptWall({ tasks: [
    task([observation("E", "éxito", "success")]),
    task([observation("E", "f1", "failure",), observation("E", "f3"), observation("E", "f4")]),
  ].map((item, index) => ({ ...item, observations: item.observations.map((entry, i) => ({ ...entry, at: index === 0 ? 2 : [1, 3, 4][i] })) })) });
  assert.equal(reordered.stop, false);
  const finalStreak = attemptWall({ tasks: [
    task([1, 2, 3].map((at) => ({ ...observation("E", `f${at}`), at }))),
    task([{ ...observation("E", "éxito", "success"), at: 0 }]),
  ] });
  assert.equal(finalStreak.stop, true);
});

test("el muro conserva códigos significativos y normaliza rutas", () => {
  const wall = (signature) => attemptWall(artifact(...signature.map((value) => observation(value, "fallo"))));
  assert.notEqual(wall(["HTTP 401", "HTTP 403", "HTTP 500"]).stop, true);
  assert.equal(wall(["HTTP 401", "HTTP 403", "HTTP 500"]).attempts.length, 0);
  assert.equal(wall([
    "ENOENT C:\\temp\\run one\\a.js",
    "ENOENT C:\\temp\\run two\\a.js",
    "ENOENT C:\\temp\\run three\\a.js",
  ]).stop, true);
  assert.equal(wall(["ENOENT", "ENOENT", "EACCES"]).stop, false);
});

test("tiempos no comprobables entre tareas no permiten afirmar consecutividad", () => {
  for (const at of [undefined, "not-a-date", 7]) {
    const stamp = at === undefined ? {} : { at };
    const failures = { observations: [1, 2, 3].map(() => ({ signature: "E", ...stamp })) };
    const success = { observations: [{ outcome: "success", ...stamp }] };
    for (const tasks of [[failures, success], [success, failures]]) {
      const result = attemptWall({ tasks });
      assert.equal(result.stop, false, `at=${String(at)} tasks=${tasks === undefined}`);
      assert.match(result.reason, /order|time|verifiable/i);
    }
  }
});

test("normaliza códigos de estado, errores ORA y rutas sin tragarse texto", () => {
  const wall = (signature) => attemptWall(artifact(...signature.map((value) => observation(value, "fallo"))));
  for (const codes of [["HTTP/1.1 401", "HTTP/1.1 403", "HTTP/1.1 500"], ["ORA-00001", "ORA-00002", "ORA-00003"]]) {
    assert.equal(wall(codes).stop, false);
    assert.equal(wall(codes).attempts.length, 0);
  }
  assert.equal(wall([
    "ENOENT C:\\tmp\\dir while opening config",
    "ENOENT C:\\tmp\\dir while deleting cache",
    "ENOENT C:\\tmp\\dir while executing tool",
  ]).stop, false);
  assert.equal(wall([
    "ENOENT C:\\tmp\\pkg.v1\\one\\a.js",
    "ENOENT C:\\tmp\\pkg.v1\\two\\a.js",
    "ENOENT C:\\tmp\\pkg.v1\\three\\a.js",
  ]).stop, true);
  assert.equal(wall(['TypeError reading "a/b"', 'TypeError reading "c/d"', 'TypeError reading "e/f"']).stop, false);
});

test("el muro ignora firmas no textuales y limita la normalización lineal", () => {
  for (const signature of [{}, { toString: null }, 17, ["Error"]]) {
    assert.doesNotThrow(() => attemptWall(artifact(
      observation(signature, "a"), observation(signature, "b"), observation(signature, "c"),
    )));
  }
  const started = performance.now();
  attemptWall(artifact(
    observation("E".repeat(100_000), "a"),
    observation("E".repeat(100_000), "b"),
    observation("E".repeat(100_000), "c"),
  ));
  assert.ok(performance.now() - started < 500);
});

test("el método documenta detenerse, registrar intentos y buscar en fuentes aplicables", () => {
  const method = readFileSync(resolve(import.meta.dirname, "../skills/vespi/method.md"), "utf8");
  assert.match(method, /Stop and search after repeated failures/);
  assert.match(method, /document.*attempt.*before.*search/is);
  assert.match(method, /official documentation.*repositories.*available skills/is);
  assert.match(method, /conflicts with the Lore or the agreement.*arbitration/is);
  assert.match(method, /Search with the host's tools/i);
  assert.match(method, /CLI never searches/i);
  assert.match(method, /blocked.*condition for resuming.*receipt/is);
});
