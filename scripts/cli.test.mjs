import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repo, "scripts", "lore-plugin.mjs");

function makeBot() {
  const root = mkdtempSync(join(tmpdir(), "lore-cli-"));
  const bot = join(root, "bots", "proyectos", "bot-x");
  mkdirSync(join(bot, "lore"), { recursive: true });
  mkdirSync(join(bot, "scripts"), { recursive: true });
  writeFileSync(join(bot, "CLAUDE.md"), "# X\n", "utf8");
  writeFileSync(join(bot, "FASES.md"), "# F\n", "utf8");
  writeFileSync(join(bot, "lore", "identidad.md"), "# I\n", "utf8");
  writeFileSync(
    join(bot, "scripts", "ecosistema.json"),
    `${JSON.stringify({ raiz: root.replace(/\\/g, "/"), copia: false, fuentes: [] }, null, 2)}\n`,
    "utf8",
  );
  return { root, bot };
}

function run(args, cwd) {
  try {
    const out = execFileSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout ?? "") + String(e.stderr ?? "") };
  }
}

test("CLI crystallize pack delega al script del skill", () => {
  const { root, bot } = makeBot();
  const snap = join(root, "snap.md");
  const r = run(["crystallize", "pack", "--bot", bot, "--out", snap], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /"verb": "pack"/);
});

test("CLI crystallize verify delega y reporta", () => {
  const { root, bot } = makeBot();
  const snap = join(root, "snap.md");
  run(["crystallize", "pack", "--bot", bot, "--out", snap], repo);
  const r = run(["crystallize", "verify", "--from", snap, "--bot", bot], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /"verb": "verify"/);
});

test("CLI mycelium bodies en árbol sin contrato no falla", () => {
  const root = mkdtempSync(join(tmpdir(), "lore-cli-empty-"));
  const r = run(["mycelium", "bodies", "--tree", root], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /nothing to compare/i);
});
