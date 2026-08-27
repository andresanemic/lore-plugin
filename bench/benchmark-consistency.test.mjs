import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the public README matches the audited 2.3.2 effect summary", () => {
  const summary = JSON.parse(readFileSync(new URL("./effect-2.3.2/results/summary.json", import.meta.url), "utf8"));

  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const method = readFileSync(new URL("./effect-2.3.2/README.md", import.meta.url), "utf8");

  for (const document of [readme, method]) {
    assert.match(document, /53\/64 \(82[,.]8%\)/);
    assert.match(document, /59\/64[^\r\n]*\(92[,.]2%\)/);
    assert.match(document, /6\/8/);
    assert.match(document, /8\/8/);
  }

  assert.equal(summary.first_pass.delta_pp, 9.375);
  assert.equal(summary.attempts_to_goal.cold.reached, 6);
  assert.equal(summary.attempts_to_goal.lore.reached, 8);
  assert.doesNotMatch(readme, /37%|65%|118 s|85 s|4[,.]116|3[,.]119/);
});

test("the public benchmark stays closed on the audited Codex baseline", () => {
  const method = readFileSync(new URL("./README.md", import.meta.url), "utf8");

  assert.match(method, /25\/36.*33\/36/s);
  assert.doesNotMatch(method, /réplica con Claude|replication with Claude/i);
});
