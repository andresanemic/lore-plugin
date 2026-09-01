import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { RECEIPT, readReceipt, snapshot, writeReceipt, writeSessionBaseline } from "../hooks/lore-state.mjs";

const OPEN = "<!-- lore:always-on -->";
const CLOSE = "<!-- /lore:always-on -->";
const roots = [];

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "lore-state-"));
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

test("snapshot sums pointed criterion bodies once and excludes phase state", () => {
  const dir = tree({
    "CLAUDE.md": `${OPEN}\n- \`lore/identidad.md\`\n- \`lore/identidad.md\`\n- \`lore/principios.md\`\n- \`FASES.md\`\n${CLOSE}\n`,
    "lore/identidad.md": "# Id\r\n",
    "lore/principios.md": "# Principios\n",
    "FASES.md": "# Estado muy largo\n",
  });

  const state = snapshot(dir);
  assert.equal(state.alwaysOnBytes,
    Buffer.byteLength("# Id\n") + Buffer.byteLength("# Principios\n"));
  assert.equal(state.fileCount, 2);
  assert.match(state.digest, /^[0-9a-f]{64}$/);
});

test("snapshot prefers CLAUDE.md and ignores unresolved and non-criterion pointers", () => {
  const dir = tree({
    "CLAUDE.md": `${OPEN}\n- \`lore/uno.md\`\n- \`docs/otro.md\`\n- \`lore/falta.md\`\n${CLOSE}\n`,
    "AGENTS.md": `${OPEN}\n- \`lore/dos.md\`\n${CLOSE}\n`,
    "lore/uno.md": "uno\n",
    "lore/dos.md": "dos\n",
    "docs/otro.md": "otro\n",
  });

  assert.equal(snapshot(dir).alwaysOnBytes, Buffer.byteLength("uno\n"));
});

test("readReceipt preserves v1 without inventing a size", () => {
  const dir = tree({});
  writeFileSync(join(dir, RECEIPT), `${"a".repeat(64)}\n`);
  assert.deepEqual(readReceipt(dir), {
    version: 1,
    digest: "a".repeat(64),
    alwaysOnBytes: null,
  });
});

test("readReceipt accepts valid v2", () => {
  const dir = tree({});
  writeFileSync(join(dir, RECEIPT), JSON.stringify({
    version: 2,
    digest: "b".repeat(64),
    alwaysOnBytes: 28418,
  }));
  assert.deepEqual(readReceipt(dir), {
    version: 2,
    digest: "b".repeat(64),
    alwaysOnBytes: 28418,
  });
});

test("readReceipt rejects partial or invalid v2 JSON", () => {
  const dir = tree({});
  for (const value of [
    "{\"version\":2",
    JSON.stringify({ version: 2, digest: "x".repeat(64), alwaysOnBytes: 1 }),
    JSON.stringify({ version: 2, digest: "c".repeat(64), alwaysOnBytes: -1 }),
    JSON.stringify({ version: 3, digest: "c".repeat(64), alwaysOnBytes: 1 }),
  ]) {
    writeFileSync(join(dir, RECEIPT), value);
    assert.equal(readReceipt(dir), null);
  }
});

test("writeReceipt writes v2 atomically and returns the accepted state", () => {
  const dir = tree({
    "CLAUDE.md": `${OPEN}\n- \`lore/identidad.md\`\n${CLOSE}\n`,
    "lore/identidad.md": "# Id\n",
  });

  const receipt = writeReceipt(dir);
  assert.deepEqual(readReceipt(dir), receipt);
  assert.equal(receipt.version, 2);
  assert.equal(receipt.alwaysOnBytes, Buffer.byteLength("# Id\n"));
  assert.deepEqual(readdirSync(dir).filter((name) => name.includes(".tmp")), []);
  assert.equal(readFileSync(join(dir, RECEIPT), "utf8"), `${JSON.stringify(receipt)}\n`);
});

test("session baseline filenames use a SHA-2 digest for the session identifier", (t) => {
  const dir = tree({});
  const sessionDir = join(tmpdir(), "lore-plugin-sessions");
  const before = new Set(existsSync(sessionDir) ? readdirSync(sessionDir) : []);
  t.after(() => {
    if (!existsSync(sessionDir)) return;
    for (const file of readdirSync(sessionDir)) {
      if (!before.has(file)) rmSync(join(sessionDir, file), { force: true });
    }
  });

  writeSessionBaseline(`codeql-${process.pid}-${Date.now()}`, dir, {
    digest: "d".repeat(64),
    alwaysOnBytes: 0,
  });

  const created = readdirSync(sessionDir).filter((file) => !before.has(file));
  assert.equal(created.length, 1);
  assert.match(created[0], /^[0-9a-f]{64}\.json$/);
});
