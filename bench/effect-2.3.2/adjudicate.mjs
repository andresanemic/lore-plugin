#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeJsonAtomic } from "./protocol.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export function resolveAdjudicationPaths(root, repair) {
  return {
    blindRoot: join(root, "results", repair ? "repair-blind" : "blind"),
    rawRoot: join(root, "results", "codex", ...(repair ? ["repair", "raw"] : ["raw"])),
    reviewPath: join(root, "results", repair ? "repair-blind-review.csv" : "blind-review.csv"),
    resultsPath: join(root, "results", "codex", ...(repair ? ["repair", "results.csv"] : ["results.csv"])),
  };
}

export function adjudicate({ tasks, key, manifest, judgments, records }) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const manifestByLabel = new Map(manifest.map((row) => [row.label, row]));
  const judgmentByLabel = new Map(judgments.runs.map((run) => [run.label, run]));
  if (key.length !== records.length || key.length !== manifest.length || key.length !== judgments.runs.length) throw new Error("Blind artifacts have different run counts.");
  if ([manifestByLabel, judgmentByLabel].some((map) => map.size !== key.length)) throw new Error("Blind labels are missing or duplicated.");

  return key.map((entry) => {
    const publicEntry = manifestByLabel.get(entry.label);
    const judgment = judgmentByLabel.get(entry.label);
    const task = taskById.get(entry.task);
    const record = records.find(({ file }) => file === entry.file);
    if (!publicEntry || publicEntry.task !== entry.task || publicEntry.packet_sha256 !== entry.packet_sha256) throw new Error(`Manifest mismatch: ${entry.label}`);
    if (!task || !record || record.task !== entry.task || record.arm !== entry.arm || record.trial !== entry.trial) throw new Error(`Raw mapping mismatch: ${entry.label}`);
    if (JSON.stringify(judgment.criteria.map(({ id }) => id)) !== JSON.stringify(task.criteria.map(({ id }) => id))) throw new Error(`Rubric mismatch: ${entry.label}`);
    if (judgment.criteria.some(({ verdict, evidence }) => !["pass", "fail"].includes(verdict) || !evidence?.trim())) throw new Error(`Invalid judgment: ${entry.label}`);
    const failed = judgment.criteria.filter(({ verdict }) => verdict === "fail").map(({ id }) => id);
    const passed = judgment.criteria.filter(({ verdict }) => verdict === "pass").map(({ id }) => id);
    return {
      ...entry,
      criteria: judgment.criteria,
      record: { ...record, verdict: failed.length ? "fail" : "pass", compliance: passed, violation: failed, failed_criteria: failed, criterion_results: judgment.criteria },
    };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tasks = JSON.parse(readFileSync(join(HERE, "tasks.json"), "utf8")).tasks;
  const { blindRoot, rawRoot, reviewPath, resultsPath } = resolveAdjudicationPaths(HERE, process.argv.includes("--repair"));
  const records = readdirSync(rawRoot).filter((file) => file.endsWith(".json")).map((file) => ({ file, ...JSON.parse(readFileSync(join(rawRoot, file), "utf8")) }));
  const rows = adjudicate({
    tasks,
    records,
    key: JSON.parse(readFileSync(join(blindRoot, "key.json"), "utf8")),
    manifest: JSON.parse(readFileSync(join(blindRoot, "manifest.json"), "utf8")),
    judgments: JSON.parse(readFileSync(join(blindRoot, "judgments.json"), "utf8")),
  });
  for (const row of rows) writeJsonAtomic(join(rawRoot, row.file), row.record);
  const review = ["label,task,arm,trial,criterion,verdict,evidence", ...rows.flatMap((row) => row.criteria.map((criterion) => [row.label, row.task, row.arm, row.trial, criterion.id, criterion.verdict, criterion.evidence].map(csv).join(",")))];
  writeFileSync(reviewPath, `${review.join("\n")}\n`);
  const resultHead = "task,arm,trial,verdict,read_lore,compliance_hits,violation_hits,cost_usd,input_tokens,output_tokens,cache_read,tool_calls,duration_ms,num_turns";
  const resultRows = rows.map(({ record }) => record).sort((a, b) => a.task.localeCompare(b.task) || a.arm.localeCompare(b.arm) || a.trial - b.trial).map((record) => [record.task, record.arm, record.trial, record.verdict, record.read_lore, record.compliance.length, record.violation.length, record.cost_usd == null ? "" : Number(record.cost_usd).toFixed(6), record.input_tokens, record.output_tokens, record.cache_read, record.tool_calls, record.duration_ms, record.num_turns].join(","));
  writeFileSync(resultsPath, `${[resultHead, ...resultRows].join("\n")}\n`);
  console.log(`Revealed ${rows.length} runs and ${rows.flatMap(({ criteria }) => criteria).length} criterion judgments.`);
}
