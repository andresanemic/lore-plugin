#!/usr/bin/env node
// Genera agents/lore-worker.md desde skills/vespi/method.md. El trabajador del kit lleva el metodo en su
// definicion para que el prompt de cada tarea lleve solo el encargo; la definicion no se escribe a mano,
// y `--check` falla si el archivo distribuido ya no coincide con lo que este generador produce.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const METHOD = resolve(ROOT, "skills/vespi/method.md");
const AGENT = resolve(ROOT, "agents/lore-worker.md");

export function renderWorkerAgent(method) {
  return [
    "---",
    "name: lore-worker",
    "description: Worker for one bounded task of an operation coordinated with Lore Plugin. Its prompt is the commission; its method ships with the kit.",
    "---",
    "",
    "You are a worker in an operation coordinated with Lore Plugin. Your prompt is one bounded commission: goal, question, scope, done criterion, proof, output and limits. Work only inside it. The method between the markers below is part of the kit and is how you do the work; it is not an external skill and needs nothing installed. Report the outcome first, with what you verified and what you could not.",
    "",
    "<<<METHOD",
    method,
    "METHOD>>>",
    "",
  ].join("\n");
}

const expected = renderWorkerAgent(readFileSync(METHOD, "utf8"));
if (process.argv.includes("--check")) {
  let actual = null;
  try { actual = readFileSync(AGENT, "utf8"); } catch { actual = null; }
  if (actual !== expected) {
    process.stderr.write("agents/lore-worker.md does not match skills/vespi/method.md: run node scripts/build-worker-agent.mjs\n");
    process.exit(1);
  }
} else {
  writeFileSync(AGENT, expected);
}
