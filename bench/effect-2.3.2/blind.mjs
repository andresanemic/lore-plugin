#!/usr/bin/env node

import { createHash, randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
};

export function renderPacket(label, task, text) {
  const rubric = task.criteria.map((criterion) => `- ${criterion.id}: ${criterion.description}`).join("\n");
  return `# Anonymous run ${label}\n\nTask: ${task.id}\n\n## Frozen rubric\n\n${rubric}\n\n## Output\n\n${text.trim()}\n`;
}

export function prepareBlind({ tasks, rawRoot, outputRoot, expectedCount = tasks.length * 4, randomized = shuffle }) {
  const keyPath = join(outputRoot, "key.json");
  if (existsSync(keyPath)) throw new Error("Blind key already exists; refusing to reshuffle.");
  const files = readdirSync(rawRoot).filter((name) => name.endsWith(".json")).sort();
  if (files.length !== expectedCount) throw new Error(`Expected ${expectedCount} runs, found ${files.length}.`);
  const records = files.map((file) => ({ file, ...JSON.parse(readFileSync(join(rawRoot, file), "utf8")) }));
  if (records.some((record) => record.error || record.verdict !== "pending")) throw new Error("Every primary run must be valid and pending.");

  const packets = join(outputRoot, "packets");
  mkdirSync(packets, { recursive: true });
  const key = randomized(records).map((record, index) => {
    const label = `R${String(index + 1).padStart(2, "0")}`;
    const task = tasks.find(({ id }) => id === record.task);
    if (!task) throw new Error(`Unknown task: ${record.task}`);
    const packet = renderPacket(label, task, record.text);
    writeFileSync(join(packets, `${label}.md`), packet);
    return {
      label,
      file: record.file,
      task: record.task,
      arm: record.arm,
      trial: record.trial,
      packet_sha256: createHash("sha256").update(packet).digest("hex"),
    };
  });
  writeFileSync(keyPath, `${JSON.stringify(key, null, 2)}\n`);
  writeFileSync(join(outputRoot, "manifest.json"), `${JSON.stringify(key.map(({ label, task, packet_sha256 }) => ({ label, task, packet_sha256 })), null, 2)}\n`);
  return key.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tasks = JSON.parse(readFileSync(join(HERE, "tasks.json"), "utf8")).tasks;
  const repair = process.argv.includes("--repair");
  const outputRoot = join(HERE, "results", repair ? "repair-blind" : "blind");
  const rawRoot = join(HERE, "results", "codex", ...(repair ? ["repair", "raw"] : ["raw"]));
  const expectedCount = repair
    ? readdirSync(join(HERE, "results", "codex", "raw")).filter((file) => file.endsWith(".json") && JSON.parse(readFileSync(join(HERE, "results", "codex", "raw", file), "utf8")).verdict === "fail").length
    : tasks.length * 4;
  const count = prepareBlind({ tasks, rawRoot, outputRoot, expectedCount });
  console.log(`Prepared ${count} anonymous packets. Do not open results/blind/key.json before judgments are frozen.`);
}
