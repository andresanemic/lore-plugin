import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  MATERIAL_GROWTH_BYTES,
  evaluateState,
  formatIntervention,
} from "../hooks/lore-guard.mjs";
import { RECEIPT, readReceipt, snapshot, writeReceipt } from "../hooks/lore-state.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repo, "scripts", "lore-plugin.mjs");
const digestA = "a".repeat(64);
const digestB = "b".repeat(64);
const state = (alwaysOnBytes, digest = digestB) => ({ digest, fileCount: 1, alwaysOnBytes });
const receipt = (alwaysOnBytes, digest = digestA) => ({ version: 2, digest, alwaysOnBytes });
const roots = [];

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "lore-guard-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  }
  return dir;
}

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});

test("clean state has no pending work", () => {
  assert.deepEqual(evaluateState(state(20_000, digestA), receipt(20_000)), {
    pendingLore: false,
    expansion: { before: 20_000, after: 20_000, delta: 0, percent: 0, material: false },
    requiresApproval: false,
  });
});

test("a digest change leaves Lore review pending", () => {
  const result = evaluateState(state(20_000), receipt(20_000));
  assert.equal(result.pendingLore, true);
  assert.equal(result.requiresApproval, false);
});

test("observed legitimate growth stays below the authority boundary", () => {
  for (const delta of [5_438, MATERIAL_GROWTH_BYTES - 1]) {
    assert.equal(evaluateState(state(20_000), receipt(20_000 - delta)).requiresApproval, false);
  }
});

test("8 KiB opens authority and 8 KiB less one does not", () => {
  assert.equal(MATERIAL_GROWTH_BYTES, 8_192);
  assert.equal(evaluateState(state(20_000), receipt(11_808)).requiresApproval, true);
  assert.equal(evaluateState(state(20_000), receipt(11_809)).requiresApproval, false);
});

test("the observed 29,855 to 68,608 expansion is material", () => {
  const result = evaluateState(state(68_608), receipt(29_855));
  assert.deepEqual(result.expansion, {
    before: 29_855,
    after: 68_608,
    delta: 38_753,
    percent: 38_753 / 29_855 * 100,
    material: true,
  });
  assert.equal(result.requiresApproval, true);
});

test("reductions never require authority", () => {
  const result = evaluateState(state(10_000), receipt(20_000));
  assert.equal(result.expansion.delta, -10_000);
  assert.equal(result.expansion.material, false);
  assert.equal(result.requiresApproval, false);
});

test("v1 current and stale receipts never invent expansion", () => {
  const v1 = { version: 1, digest: digestA, alwaysOnBytes: null };
  assert.deepEqual(evaluateState(state(68_608, digestA), v1), {
    pendingLore: false, expansion: null, requiresApproval: false,
  });
  const stale = evaluateState(state(68_608), v1);
  assert.equal(stale.pendingLore, true);
  assert.equal(stale.expansion, null);
  assert.equal(stale.requiresApproval, false);
});

test("both pending conditions produce one plain intervention", () => {
  const message = formatIntervention(evaluateState(state(68_608), receipt(29_855)));
  assert.match(message, /Lore cambió/);
  assert.match(message, /29,9 KB.*68,6 KB.*38,8 KB.*130%/s);
  assert.match(message, /aprobación/);
  assert.doesNotMatch(message, /MYCELIUM|save-to-lore|transmute-lore|receipt/i);
  assert.equal(message.split("Lore cambió").length - 1, 1);
});

test("growth from zero reports absolute bytes without a fabricated percent", () => {
  const message = formatIntervention(evaluateState(state(9_000), receipt(0, digestB)));
  assert.match(message, /0 bytes/);
  assert.doesNotMatch(message, /%/);
});

test("CLI refuses material growth without authority and preserves the old receipt", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(29_855),
  });
  writeReceipt(dir, snapshot(dir));
  const oldReceipt = readReceipt(dir);
  writeFileSync(join(dir, "lore", "criterio.md"), "x".repeat(68_608));

  const denied = spawnSync("node", [cli, "mycelium", "receipt", "--tree", dir], { encoding: "utf8" });
  assert.equal(denied.status, 2);
  assert.match(denied.stdout, /approval|aprobación/i);
  assert.deepEqual(readReceipt(dir), oldReceipt);

  const accepted = spawnSync("node", [
    cli, "mycelium", "receipt", "--tree", dir, "--accept-always-on",
  ], { encoding: "utf8" });
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(readReceipt(dir).alwaysOnBytes, 68_608);
});

test("CLI migrates a current v1 receipt without expansion authority", () => {
  const dir = tree({ "lore/criterio.md": "criterio\n" });
  const current = snapshot(dir);
  writeFileSync(join(dir, RECEIPT), `${current.digest}\n`);

  const result = spawnSync("node", [cli, "mycelium", "receipt", "--tree", dir], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readReceipt(dir), {
    version: 2, digest: current.digest, alwaysOnBytes: 0,
  });
});
