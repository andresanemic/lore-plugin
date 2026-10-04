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

function runScript(script, args, cwd) {
  try {
    const out = execFileSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout ?? "") + String(e.stderr ?? "") };
  }
}

function run(args, cwd) {
  return runScript(cli, args, cwd);
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

// --- la guía y la ayuda (fricción 2 del RC9) ---------------------------------------------
//
// Pedir la ayuda es una pregunta, no un error: imprimirla y salir con 2 obligaba a leer el
// numero antes que el texto. Un comando desconocido sigue siendo un error y sigue saliendo
// distinto de cero: por eso estas pruebas van juntas y no en dos archivos.

test("CLI --help imprime la guía y sale con 0", () => {
  const r = run(["--help"], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /Usage: lore-plugin install --target/);
  assert.match(r.out, /lore-plugin nivel/);
});

test("CLI -h imprime la guía y sale con 0", () => {
  const r = run(["-h"], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /Usage: lore-plugin install --target/);
});

test("CLI help después de install también sale con 0", () => {
  // La ayuda no depende de lo que venga detrás: se pide y se entrega.
  const r = run(["install", "--help"], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /Usage: lore-plugin/);
});

test("CLI sin argumentos imprime la guía y sale con 0", () => {
  const r = run([], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /Usage: lore-plugin install --target/);
});

test("CLI un comando desconocido sale distinto de cero", () => {
  const r = run(["no-existe"], repo);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /Usage: lore-plugin install --target/);
});

test("CLI un install con target desconocido sale distinto de cero", () => {
  const r = run(["install", "--target", "emacs"], repo);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /Usage: lore-plugin install --target/);
});

test("la entrada local lore-cli también responde su guía con 0", () => {
  // La entrada que instala el kit es la misma CLI reducida: si una enseña la ayuda con 2, la
  // persona que la invoca por la prosa lee un error donde solo preguntaba.
  const entry = join(repo, "scripts", "lore-cli.mjs");
  const r = runScript(entry, ["--help"], repo);
  assert.equal(r.code, 0);
  assert.match(r.out, /Usage: lore-cli mycelium receipt/);
});

test("la entrada local lore-cli con comando desconocido sale distinto de cero", () => {
  const entry = join(repo, "scripts", "lore-cli.mjs");
  const r = runScript(entry, ["no-existe"], repo);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /Usage: lore-cli/);
});
