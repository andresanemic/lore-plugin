import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(HERE, "tasks.json"), "utf8"));

test("freezes four paired tasks with eight criteria each", () => {
  assert.deepEqual(data.tasks.map(({ id }) => id), [
    "web-landing",
    "news-draft",
    "community-b2b",
    "founder-crm",
  ]);
  for (const task of data.tasks) {
    assert.equal(task.criteria.length, 8, task.id);
    assert.ok(Number.isInteger(task.max_words) && task.max_words > 0, task.id);
  }
  assert.equal(new Set(data.tasks.map(({ fixture }) => fixture)).size, 4);
});

test("keeps facts shared and criterion arm-specific", () => {
  for (const task of data.tasks) {
    const root = join(HERE, "fixtures", task.fixture);
    assert.ok(existsSync(join(root, "dossier.md")), `${task.id}: dossier`);
    assert.ok(existsSync(join(root, "cold", "CLAUDE.md")), `${task.id}: cold contract`);
    assert.ok(existsSync(join(root, "lore", "CLAUDE.md")), `${task.id}: lore contract`);
    assert.equal(existsSync(join(root, "cold", "lore")), false, `${task.id}: cold lore`);
    assert.ok(existsSync(join(root, "lore", "lore", "index.md")), `${task.id}: routed lore`);
  }
});

test("freezes the primary sample and model settings", () => {
  assert.deepEqual(data.execution, {
    model: "gpt-5.6-terra",
    reasoning_effort: "medium",
    trials: 2,
    waves: 2,
    plugin_version: "2.3.2",
  });
});

test("does not leak local paths or real project names into public fixtures", () => {
  const forbidden = /C:\\Claude|Permanent Artist|BlockVoz|ChatterPay|HealthProof|Nodo Zero/i;
  for (const task of data.tasks) {
    const root = join(HERE, "fixtures", task.fixture);
    for (const relative of ["dossier.md", "cold/CLAUDE.md", "lore/CLAUDE.md", "lore/lore/index.md"]) {
      const text = readFileSync(join(root, ...relative.split("/")), "utf8");
      assert.doesNotMatch(text, forbidden, `${task.id}: ${relative}`);
    }
  }
});
