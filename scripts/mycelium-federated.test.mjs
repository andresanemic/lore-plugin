// mycelium federated — el detector del triplete dentro del kit (2.4.8).
// H14: mycelium bodies recorre contract → index → module dentro de un árbol
// y no ve nunca un puntero a un árbol hermano. Este subcomando pregunta lo
// que bodies no puede: ¿el always-on del bot declara contrato + tabla + estado?
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "scripts", "lore-plugin.mjs");
const roots = [];

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "federated-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    writeFileSync(join(dir, rel), body);
  }
  return dir;
}

function run(dir) {
  try {
    const out = execFileSync("node", [cli, "mycelium", "federated", "--tree", dir], { encoding: "utf8" });
    return { status: 0, out };
  } catch (e) {
    return { status: e.status, out: (e.stdout || "") + (e.stderr || "") };
  }
}

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});

test("bot federado con regla del triplete sale 0", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `canon/`\n- `lore/enrutamiento.md`\n- `FASES.md`\n- el triplete de cada árbol hermano entra siempre que la tarea los enrute; son hermanos, no ancestros, el host no lo inyecta.\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
  });
  const r = run(dir);
  assert.equal(r.status, 0);
  assert.match(r.out, /declares the triplete rule/);
});

test("bot federado sin la regla sale distinto de 0 y la nombra", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `canon/`\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
  });
  const r = run(dir);
  assert.notEqual(r.status, 0);
  assert.match(r.out, /does not declare the triplete rule/);
});

test("árbol que no es bot federado no tiene nada que chequear y sale 0", () => {
  const dir = tree({ "lore/principios.md": "# Principios\n" });
  const r = run(dir);
  assert.equal(r.status, 0);
  assert.match(r.out, /nothing to check/);
});

test("bot empaquetado con regla y sin canon sale 0", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/enrutamiento.md`\n- `FASES.md`\n- árboles hermanos: el triplete entra siempre que la tarea los enrute, no son ancestros, el host no los inyecta.\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
  });
  const r = run(dir);
  assert.equal(r.status, 0);
});
