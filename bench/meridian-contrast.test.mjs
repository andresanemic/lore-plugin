import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runContrast } from "./meridian-contrast.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "final-deliverable");
const fixture = {
  id: "l2-pokemon-go",
  task: readFileSync(join(ROOT, "encargo.md"), "utf8"),
  sources: [{ id: "nota-fuente", text: readFileSync(join(ROOT, "fuentes", "nota-fuente.md"), "utf8") }],
  expected: readFileSync(join(ROOT, "expected", "judge-answer.txt"), "utf8"),
  evaluator: { mustContain: ["síntesis"], mustNotContain: ["Pokémon GO"] },
};
const execution = { host: "fixture-host", model: "fixture-model", effort: "medium" };
const candidates = [
  { version: { id: "base", ref: "eb73934" }, artifact: "La síntesis cubre las tres notas y se apoya en la fuente única.", trace: ["read source", "reviewed final"], cost: { input_tokens: 10, output_tokens: 4, usd: 0.02 } },
  { version: { id: "candidate", diff: "sha256:fixed" }, artifact: "El artículo Pokémon GO cambia el hallazgo.", trace: ["wrote final by terminal"], cost: { input_tokens: 11, output_tokens: 5, usd: 0.03 } },
];

test("contrasta candidatos ciegos con idéntico encargo y fuentes; no filtra la clave al trabajador", () => {
  const markedFixture = { ...fixture, sources: [{ ...fixture.sources[0], expected: "SECRETO-EVALUADOR" }] };
  const withIds = candidates.map(row => ({ ...row, cost: { ...row.cost, id: "attacker-id" } }));
  const out = runContrast({ fixture: markedFixture, candidates: withIds, execution, shuffle: (items) => [...items].reverse() });
  assert.deepEqual(out.workerPackets.map(({ packet }) => packet.task), [fixture.task, fixture.task]);
  assert.deepEqual(out.workerPackets[0].packet.sources, out.workerPackets[1].packet.sources);
  assert.equal(JSON.stringify(out.workerPackets).includes("Pokémon GO"), false);
  assert.equal(JSON.stringify(out.workerPackets).includes("mustNotContain"), false);
  assert.equal(JSON.stringify(out.workerPackets).includes(fixture.expected.trim()), false);
  assert.equal(JSON.stringify(out.workerPackets).includes("SECRETO-EVALUADOR"), false);
  assert.deepEqual(out.costs.map(({ id }) => id), ["C01", "C02"]);
  assert.equal(out.cost_basis, "unverified-fixture-input");
  assert.equal(Object.hasOwn(out, "observed_cost"), false);
  assert.deepEqual(out.verdicts.map(({ verdict }) => verdict), ["fail", "pass"]);
  assert.equal(new Set(out.verdicts.map(({ id }) => id)).size, 2);
  assert.equal(out.costs.reduce((sum, row) => sum + row.usd, 0), 0.05);
  assert.equal(out.execution.host, execution.host);
});

test("el orden ciego predeterminado conserva ambos IDs y sus veredictos", () => {
  const out = runContrast({ fixture, candidates, execution });
  assert.deepEqual(new Set(out.key.map(({ version }) => version)), new Set(["base", "candidate"]));
  assert.equal(out.artifacts.length, 2);
  assert.equal(out.verdicts.length, 2);
  assert.equal(out.declared_cost_total_usd, 0.05);
  assert.equal(Object.hasOwn(out, "observed_cost"), false);
});

test("costos sintéticos quedan marcados y no afirman costo ni ahorro observado", () => {
  const out = runContrast({ fixture, candidates: candidates.map(row => ({ ...row, cost: { ...row.cost, synthetic: true } })), execution, shuffle: rows => rows });
  assert.equal(out.cost_basis, "synthetic-fixture");
  assert.equal(Object.hasOwn(out, "declared_cost_total_usd"), false);
  assert.equal(Object.hasOwn(out, "observed_cost"), false);
});

test("rechaza ids repetidos y costos no observados", () => {
  assert.throws(() => runContrast({ fixture, candidates: [candidates[0], candidates[0]], execution }), /duplicate version id/);
  assert.throws(() => runContrast({ fixture, candidates: candidates.map((row) => ({ ...row, cost: {} })), execution }), /observed cost/);
});
