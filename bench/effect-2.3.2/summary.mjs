#!/usr/bin/env node

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARMS = ["cold", "lore"];
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export function summarize({ primary, repairs }) {
  const first_pass = {};
  const attempts_to_goal = {};
  const time_to_goal = {};
  const diagnostics = {};

  for (const arm of ARMS) {
    const first = primary.filter((run) => run.arm === arm);
    const repair = repairs.filter((run) => run.arm === arm);
    const total = first.reduce((sum, run) => sum + (run.criterion_results?.length ?? run.compliance.length + run.violation.length), 0);
    const passed = first.reduce((sum, run) => sum + run.compliance.length, 0);
    const by_task = Object.fromEntries([...new Set(first.map(({ task }) => task))].map((task) => {
      const rows = first.filter((run) => run.task === task);
      const taskPassed = rows.reduce((sum, run) => sum + run.compliance.length, 0);
      const taskTotal = rows.reduce((sum, run) => sum + (run.criterion_results?.length ?? run.compliance.length + run.violation.length), 0);
      return [task, { passed: taskPassed, total: taskTotal, rate: taskPassed / taskTotal }];
    }));
    first_pass[arm] = { passed, total, rate: passed / total, complete_runs: first.filter(({ verdict }) => verdict === "pass").length, runs: first.length, by_task };

    const outcomes = first.map((run) => {
      const second = repair.find((candidate) => candidate.task === run.task && candidate.trial === run.trial);
      const attempt = run.verdict === "pass" ? 1 : second?.verdict === "pass" ? 2 : ">2";
      return { attempt, reached: attempt !== ">2", time_ms: run.duration_ms + (second?.duration_ms ?? 0) };
    });
    attempts_to_goal[arm] = { attempt_1: outcomes.filter(({ attempt }) => attempt === 1).length, attempt_2: outcomes.filter(({ attempt }) => attempt === 2).length, over_2: outcomes.filter(({ attempt }) => attempt === ">2").length, reached: outcomes.filter(({ reached }) => reached).length, total: outcomes.length };
    const successfulTimes = outcomes.filter(({ reached }) => reached).map(({ time_ms }) => time_ms);
    time_to_goal[arm] = { mean_ms: mean(successfulTimes), median_ms: median(successfulTimes), successful: successfulTimes.length, censored: outcomes.length - successfulTimes.length };

    const measured = [...first, ...repair];
    diagnostics[arm] = {
      runs: measured.length,
      input_tokens: measured.reduce((sum, run) => sum + run.input_tokens, 0),
      output_tokens: measured.reduce((sum, run) => sum + run.output_tokens, 0),
      cached_input_tokens: measured.reduce((sum, run) => sum + run.cache_read, 0),
      tool_calls: measured.reduce((sum, run) => sum + run.tool_calls, 0),
      duration_ms: measured.reduce((sum, run) => sum + run.duration_ms, 0),
      lore_read_runs: measured.filter(({ read_lore }) => read_lore).length,
    };
  }

  first_pass.delta_pp = (first_pass.lore.rate - first_pass.cold.rate) * 100;
  time_to_goal.delta_percent_successful_only = (time_to_goal.lore.mean_ms / time_to_goal.cold.mean_ms - 1) * 100;
  return { first_pass, attempts_to_goal, time_to_goal, diagnostics };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const load = (root) => readdirSync(root).filter((file) => file.endsWith(".json")).map((file) => JSON.parse(readFileSync(join(root, file), "utf8")));
  const resultRoot = join(HERE, "results", "codex");
  const summary = {
    protocol: { designed_with: "gpt-5.6-sol/medium", executed_with: "gpt-5.6-terra/medium", lore_plugin: "2.3.2", primary_runs: 16, repair_runs: 10, criteria_per_run: 8 },
    ...summarize({ primary: load(join(resultRoot, "raw")), repairs: load(join(resultRoot, "repair", "raw")) }),
  };
  writeFileSync(join(HERE, "results", "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary, null, 2));
}
