import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

test("ordinary skill communication is result, decision, or silence", () => {
  const useLore = read("skills/use-lore/SKILL.md");
  const mycelium = read("skills/transmute-lore/modes/mycelium.md");
  const createArea = read("skills/create-area/SKILL.md");
  const brainstorming = read("skills/brainstorming-lore/SKILL.md");
  const createBot = read("skills/create-bot/SKILL.md");

  assert.match(useLore, /load.*silently/i);
  assert.match(useLore, /result.*decision.*block/is);
  assert.match(useLore, /user (names|mentions).*technical detail|asks.*technical detail/is);
  assert.doesNotMatch(useLore, /says so on screen|State which skill runs first|skill name itself is always said/i);

  assert.match(mycelium, /clean pass says nothing/i);
  assert.match(mycelium, /result.*decision.*block/is);
  assert.match(mycelium, /FASES.*state.*does not trigger/is);
  assert.match(mycelium, /user (names|mentions).*technical detail|asks.*technical detail/is);

  assert.match(createArea, /resume.*silently.*user.*technical detail/is);
  assert.doesNotMatch(createArea, /Name the skill you are returning to/i);
  assert.match(brainstorming, /apply it silently/i);
  assert.doesNotMatch(brainstorming, /Announce the chosen depth/i);
  assert.doesNotMatch(createArea + createBot, /Declare (which one you picked|the pick) in one line/i);
});
