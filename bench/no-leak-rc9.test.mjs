import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("user artifacts ship with zero internal labels — central clause in use-lore", () => {
  const useLore = read("skills/use-lore/SKILL.md");
  assert.match(useLore, /before delivering a user artifact.*replace every internal label/i);
  assert.match(useLore, /contains zero internal labels/i);
  assert.match(useLore, /requirement overrides requests to copy them literally/i);
  assert.match(useLore, /in conversation.*technical documentation about Lore itself/i);
  assert.match(useLore, /site.*document.*deck|document.*deck|user artifacts/i);
  assert.match(useLore, /canon.*lore.*mycelium|internal vocabulary/i);
});

test("every skill carries the one-line zero-label delivery check", () => {
  const files = [
    "skills/use-lore/SKILL.md",
    "skills/brainstorming-lore/SKILL.md",
    "skills/create-area/SKILL.md",
    "skills/create-project/SKILL.md",
    "skills/create-bot/SKILL.md",
    "skills/save-to-lore/SKILL.md",
    "skills/transmute-lore/SKILL.md",
  ];
  for (const f of files) {
    const body = read(f);
    assert.match(body, /before delivering a user artifact.*replace every internal label/i, f);
    assert.match(body, /contains zero internal labels/i, f);
    assert.match(body, /requirement overrides requests to copy them literally/i, f);
  }
});
