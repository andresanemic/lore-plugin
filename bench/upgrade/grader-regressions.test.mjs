import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tasks = JSON.parse(readFileSync(new URL("./tasks.json", import.meta.url), "utf8")).tasks;
const community = tasks.find((task) => task.id === "upgrade-community-manager");

function hit(pattern, text) {
  const prefix = pattern.match(/^\(\?([im]+)\)/);
  const flags = new Set(["m", ...(prefix?.[1] ?? "")]);
  const source = prefix ? pattern.slice(prefix[0].length) : pattern;
  return new RegExp(source, [...flags].join("")).test(text);
}

test("detecta duplicación aunque identidad y principios se expliquen en párrafos separados", () => {
  const pattern = community.compliance[6];
  const transcript = `La voz cercana aparece en identidad.

Además, se retiraría de aquí porque duplica un principio.`;
  assert.equal(hit(pattern, transcript), true);
});

test("detecta que el agente pide al usuario proporcionar el límite", () => {
  const pattern = community.compliance[8];
  const transcript = `Missing: límite de validez.

Debes proporcionar el límite real; no se inventará uno plausible.`;
  assert.equal(hit(pattern, transcript), true);
});

test("detecta cinco opciones como Earned aunque la etiqueta preceda al contenido", () => {
  const pattern = community.compliance[7];
  const transcript = `### U3 — principios.md — Earned

Se conserva literalmente: conservamos siempre cinco opciones.`;
  assert.equal(hit(pattern, transcript), true);
});
