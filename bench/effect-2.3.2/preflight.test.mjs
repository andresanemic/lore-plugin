import assert from "node:assert/strict";
import test from "node:test";

import { classifyProbe } from "./preflight.mjs";

test("classifies cold only from the exact unavailable response", () => {
  assert.deepEqual(classifyProbe("cold", { text: "LORE_UNAVAILABLE", tools: [], error: false }), {
    lore_plugin: false,
    text: "LORE_UNAVAILABLE",
  });
});

test("requires installed 2.3.2 skill evidence for lore", () => {
  const result = classifyProbe("lore", {
    text: "LORE_AVAILABLE 2.3.2",
    tools: ["Get-Content C:\\bench\\.runtime-123\\lore\\.agents\\skills\\use-lore\\SKILL.md"],
    error: false,
  });
  assert.equal(result.lore_plugin, true);
  assert.equal(result.version, "2.3.2");
  assert.equal(result.read_lore, true);
});

test("normalizes escaped Windows separators in audited commands", () => {
  const result = classifyProbe("lore", {
    text: "LORE_AVAILABLE",
    tools: [String.raw`Get-Content C:\\bench\\.runtime-123\\lore\\.agents\\skills\\use-lore\\SKILL.md`],
    error: false,
  });
  assert.equal(result.read_lore, true);
});

test("does not accept a claimed version without read evidence", () => {
  const result = classifyProbe("lore", {
    text: "LORE_AVAILABLE 2.3.2",
    tools: [],
    error: false,
  });
  assert.equal(result.read_lore, false);
});
