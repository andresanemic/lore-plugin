// Cierre de MYCELIUM: ni un escaneo estructural ni el recibo pueden leerse como «el barrido pasó».
// Enmienda (d) del acuerdo 019 (opción A de notas/2026-10-02_mycelium-cierre/propuesta.md). Incidente: tras correr
// solo `mycelium bodies` y `mycelium federated` se reportó «el escaneo de MYCELIUM pasó» y el barrido completo
// (cada Pista con su paso) no se había corrido. Cada salida dice ahora lo que no cierra.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entradas = ["lore-plugin.mjs", "lore-cli.mjs"].map((n) => join(root, "scripts", n));
const dirs = [];

function arbol(files) {
  const dir = mkdtempSync(join(tmpdir(), "mycelium-cierre-"));
  dirs.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    writeFileSync(join(dir, rel), body);
  }
  return dir;
}
const correr = (cli, sub, dir) => {
  const r = spawnSync("node", [cli, "mycelium", sub, "--tree", dir], { encoding: "utf8" });
  return { status: r.status, out: (r.stdout || "") + (r.stderr || "") };
};

test.after(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

const NO_CIERRA = /does not close the sweep/i;
const LIMITE_RECIBO = /does not certify that the sweep ran/i;

const contrato = (extra = "") => `# CLAUDE.md\n\n<!-- lore:always-on -->\n- \`lore/identidad.md\`\n- \`lore/principios.md\`\n- \`lore/index.md\`\n${extra}<!-- /lore:always-on -->\n`;
const base = (extra = {}) => ({
  "CLAUDE.md": contrato(),
  "lore/identidad.md": "# Identidad\n",
  "lore/principios.md": "# Principios\n",
  "lore/index.md": "| tema | cuando | archivo |\n|---|---|---|\n| x | siempre | `identidad.md` |\n",
  ...extra,
});

for (const cli of entradas) {
  const nombre = cli.split(/[\\/]/).pop();

  test(`${nombre}: bodies con un modulo sin conectar dice que no cierra el barrido`, () => {
    const dir = arbol(base({ "lore/suelto.md": "# Un modulo que nadie nombra\n" }));
    const r = correr(cli, "bodies", dir);
    assert.match(r.out, /not named by lore\/index\.md: .*suelto\.md/);
    assert.match(r.out, NO_CIERRA);
  });

  test(`${nombre}: bodies con todo conectado tampoco se lee como cierre`, () => {
    const dir = arbol(base());
    const r = correr(cli, "bodies", dir);
    assert.match(r.out, /index reaches every module/);
    assert.match(r.out, NO_CIERRA);
  });

  test(`${nombre}: federated con la regla del triplete dice que no cierra el barrido`, () => {
    const dir = arbol(base({
      "CLAUDE.md": contrato("- Arboles hermanos: abrir su triplete; el host no los inyecta (no ancestro).\n"),
      "lore/enrutamiento.md": "# Enrutamiento\n",
    }));
    const r = correr(cli, "federated", dir);
    assert.equal(r.status, 0);
    assert.match(r.out, /declares the triplete rule/);
    assert.match(r.out, NO_CIERRA);
  });

  test(`${nombre}: federated sin la regla sigue saliendo 1 y tambien dice que no cierra`, () => {
    const dir = arbol(base({ "lore/enrutamiento.md": "# Enrutamiento\n" }));
    const r = correr(cli, "federated", dir);
    assert.equal(r.status, 1);
    assert.match(r.out, /does not declare the triplete rule/);
    assert.match(r.out, NO_CIERRA);
  });

  test(`${nombre}: receipt dice que registra el estado del arbol y que no certifica el barrido`, () => {
    const dir = arbol(base());
    const r = correr(cli, "receipt", dir);
    assert.equal(r.status, 0);
    assert.match(r.out, /MYCELIUM state recorded for \d+ Lore file/);
    assert.match(r.out, LIMITE_RECIBO);
    assert.doesNotMatch(r.out, /sweep recorded/i);
  });
}
