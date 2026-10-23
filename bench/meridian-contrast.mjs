#!/usr/bin/env node
import { createHash, randomInt } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const nonempty = value => typeof value === "string" && value.trim().length > 0;
const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const blindShuffle = items => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function runContrast({ fixture, candidates, execution, shuffle = blindShuffle }) {
  if (!nonempty(fixture?.id) || !nonempty(fixture?.task) || !Array.isArray(fixture.sources) || fixture.sources.some(source => !nonempty(source?.id) || !nonempty(source?.text))) throw new Error("contrast fixture needs id, task and identified sources");
  if (!Array.isArray(candidates) || candidates.length !== 2) throw new Error("contrast needs exactly two candidates");
  if (!["host", "model", "effort"].every(key => nonempty(execution?.[key]))) throw new Error("contrast execution must fix host, model and effort");
  const ids = candidates.map(({ version }) => version?.id);
  if (ids.some(id => !nonempty(id)) || new Set(ids).size !== ids.length) throw new Error("duplicate version id or missing version id");
  if (candidates.some(({ version }) => !nonempty(version.ref) && !nonempty(version.diff))) throw new Error("each version needs a ref or diff");
  if (nonempty(fixture.expected) && fixture.task.includes(fixture.expected)) throw new Error("fixture task exposes evaluator answer");
  for (const candidate of candidates) {
    const cost = candidate.cost;
    if (typeof candidate.artifact !== "string" || !Array.isArray(candidate.trace) || !cost
      || !Number.isFinite(cost.input_tokens) || cost.input_tokens < 0
      || !Number.isFinite(cost.output_tokens) || cost.output_tokens < 0
      || !Number.isFinite(cost.usd) || cost.usd < 0) throw new Error("contrast candidate needs artifact, trace and observed cost");
  }
  if (!Array.isArray(fixture.evaluator?.mustContain) || !Array.isArray(fixture.evaluator?.mustNotContain)) throw new Error("fixture evaluator must keep explicit expected checks");

  const randomized = shuffle(candidates);
  if (!Array.isArray(randomized) || randomized.length !== 2 || new Set(randomized.map(row => row.version.id)).size !== 2) throw new Error("blind ordering must preserve both unique candidates");
  const key = randomized.map((candidate, index) => ({ id: `C${String(index + 1).padStart(2, "0")}`, version: candidate.version.id }));
  const workerPackets = key.map(({ id }) => ({ id, packet: { fixture: fixture.id, task: fixture.task, sources: fixture.sources.map(({ id: sourceId, text }) => ({ id: sourceId, text })) } }));
  const byVersion = new Map(randomized.map(candidate => [key.find(row => row.version === candidate.version.id).id, candidate]));
  const check = (candidate, pattern, positive) => positive ? candidate.artifact.toLowerCase().includes(pattern.toLowerCase()) : !candidate.artifact.toLowerCase().includes(pattern.toLowerCase());
  const artifacts = key.map(({ id }) => ({ id, text: byVersion.get(id).artifact, sha256: digest(byVersion.get(id).artifact) }));
  const traces = key.map(({ id }) => ({ id, events: structuredClone(byVersion.get(id).trace) }));
  const costs = key.map(({ id }) => ({ ...byVersion.get(id).cost, id }));
  const verdicts = key.map(({ id }) => {
    const artifact = byVersion.get(id);
    const checks = [
      ...fixture.evaluator.mustContain.map(text => ({ check: `contains:${text}`, pass: check(artifact, text, true) })),
      ...fixture.evaluator.mustNotContain.map(text => ({ check: `excludes:${text}`, pass: check(artifact, text, false) })),
    ];
    return { id, verdict: checks.every(row => row.pass) ? "pass" : "fail", checks };
  });
  const syntheticCost = costs.some(row => row.synthetic === true);
  return { fixture: fixture.id, execution: { ...execution }, workerPackets, artifacts, traces, costs,
    cost_basis: syntheticCost ? "synthetic-fixture" : "unverified-fixture-input",
    ...(syntheticCost ? {} : { declared_cost_total_usd: costs.reduce((sum, row) => sum + row.usd, 0) }), verdicts, key };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , fixturePath, outputPath] = process.argv;
  if (!fixturePath || !outputPath) throw new Error("usage: node bench/meridian-contrast.mjs <fixture-and-runs.json> <output.json>");
  const input = JSON.parse(readFileSync(fixturePath, "utf8"));
  const output = runContrast(input);
  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Contrast ${output.fixture}: ${output.verdicts.map(row => `${row.id}=${row.verdict}`).join(", ")}; cost basis ${output.cost_basis}. The candidate key is retained for the evaluator, outside worker packets.`);
}
