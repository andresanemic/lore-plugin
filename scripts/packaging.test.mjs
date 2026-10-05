import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { codexComponents, installCodex } from "./installer.mjs";

// RC6: el paquete publicado omitía NOTICE, commands/nivel.md y
// scripts/install-claude-statusline.mjs (npm pack --dry-run --json con
// npm_config_cache temporal). Este test corre ese mismo empaquetado y exige
// las tres piezas en el tarball, no solo en `files`.
const EXPECTED = [
  "NOTICE",
  "commands/nivel.md",
  "scripts/install-claude-statusline.mjs",
  "scripts/hygiene.mjs",
  "scripts/opencode-permissions.mjs",
];

function packedPaths(root) {
  const cache = mkdtempSync(join(tmpdir(), "lore-npm-cache-"));
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  try {
    const out = execFileSync(npm, ["pack", "--dry-run", "--json"], {
      cwd: root,
      encoding: "utf8",
      shell: true,
      env: { ...process.env, npm_config_cache: cache },
    });
    const [summary] = JSON.parse(out);
    return (summary.files ?? []).map((entry) => entry.path.replaceAll("\\", "/"));
  } finally {
    rmSync(cache, { recursive: true, force: true });
  }
}

test("el tarball npm incluye NOTICE, commands/nivel.md, hygiene, OpenCode permissions e install-claude-statusline.mjs", () => {
  const root = join(import.meta.dirname, "..");
  const paths = packedPaths(root);
  assert.ok(paths.length > 0, "npm pack --dry-run no listó archivos");
  for (const expected of EXPECTED) {
    assert.ok(paths.includes(expected), `el paquete omite ${expected}`);
  }
});

// H14: `install codex` copiaba por lista de exclusion, asi que todo lo que no estuviera
// en los trece nombres viajaba. La lista de inclusion se lee de `files` del manifiesto.
function codexPackage(manifest) {
  const root = mkdtempSync(join(tmpdir(), "lore-codex-files-"));
  const write = (rel, bytes = "x\n") => {
    const target = join(root, ...rel.split("/"));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  };
  write("package.json", `${JSON.stringify(manifest, null, 2)}\n`);
  write("README.md", "readme\n");
  write("LICENSE", "licencia\n");
  write("NOTICE", "notice\n");
  write("hooks/hooks.json", "{}\n");
  write("skills/use-lore/SKILL.md", "---\nname: use-lore\n---\n");
  write("commands/nivel.md", "nivel\n");
  write("commands/oculto.md", "no publicado\n");
  write("scripts/lore-plugin.mjs", "export const cli = true;\n");
  write("scripts/lore-cli.mjs", "export const local = true;\n");
  write("scripts/secreto.test.mjs", "no publicado\n");
  write("internal/notas.md", "no publicado\n");
  write("docs/REFERENCE_en.md", "referencia\n");
  for (const piece of ["scripts/hygiene.mjs", "scripts/installer.mjs", "hooks/lore-guard.mjs", "hooks/lore-state.mjs", "hooks/lore-turno.mjs", "skills/use-lore/scripts/acuerdo.mjs", "skills/vespi/core/operation-state.mjs"]) write(piece, "export const piece = true;\n");
  write("_ref-superreview-rc8.md", "notas internas de la maquina\n");
  return root;
}

test("install codex instala por lista de inclusion: solo lo que el manifiesto publica", () => {
  const packageRoot = codexPackage({
    name: "@andresanemic/lore-plugin",
    version: "2.0.0",
    files: ["hooks/", "skills/", "commands/nivel.md", "scripts/lore-plugin.mjs", "scripts/lore-cli.mjs", "docs/", "README.md", "LICENSE", "NOTICE"],
  });
  const home = mkdtempSync(join(tmpdir(), "lore-home-h14-"));
  try {
    const result = installCodex({ home, packageRoot });
    assert.equal(result.verified, true);
    const pluginRoot = join(home, ".agents", "plugins", "plugins", "lore");
    assert.equal(existsSync(join(pluginRoot, "hooks", "hooks.json")), true, "lo publicado viaja");
    assert.equal(existsSync(join(pluginRoot, "skills", "use-lore", "SKILL.md")), true);
    assert.equal(existsSync(join(pluginRoot, "scripts", "lore-plugin.mjs")), true);
    assert.equal(existsSync(join(pluginRoot, "scripts", "lore-cli.mjs")), true);
    assert.equal(existsSync(join(pluginRoot, "commands", "nivel.md")), true);
    for (const ausente of ["internal", "_ref-superreview-rc8.md", "bench", "node_modules", "CLAUDE.md"]) {
      assert.equal(existsSync(join(pluginRoot, ausente)), false, `${ausente} no se instala`);
    }
    assert.equal(existsSync(join(pluginRoot, "scripts", "secreto.test.mjs")), false, "un archivo suelto no arrastra el arbol");
    assert.equal(existsSync(join(pluginRoot, "commands", "oculto.md")), false, "una pieza suelta no arrastra el arbol");
    const publicados = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")).files;
    const declarados = publicados.map((entry) => entry.replace(/^\.\//, "").replace(/\/+$/, "").split("/")[0]);
    for (const name of codexComponents(packageRoot)) {
      assert.ok(declarados.includes(name) || name === "package.json", `${name} se instala y el manifiesto no lo publica`);
    }
  } finally { rmSync(packageRoot, { recursive: true, force: true }); rmSync(home, { recursive: true, force: true }); }
});

test("un manifiesto sin `files` no abre la puerta a copiar el arbol entero", () => {
  const packageRoot = codexPackage({ name: "@andresanemic/lore-plugin", version: "2.0.0" });
  const home = mkdtempSync(join(tmpdir(), "lore-home-h14b-"));
  try {
    const result = installCodex({ home, packageRoot });
    assert.equal(result.verified, true);
    const pluginRoot = join(home, ".agents", "plugins", "plugins", "lore");
    for (const ausente of ["internal", "_ref-superreview-rc8.md"]) {
      assert.equal(existsSync(join(pluginRoot, ausente)), false, `${ausente} no se instala sin lista de publicacion`);
    }
    assert.equal(existsSync(join(pluginRoot, "hooks", "hooks.json")), true, "las piezas del kit siguen viajando");
    for (const name of codexComponents(packageRoot)) {
      assert.ok(!["internal", "bench", "node_modules", "data", "specs"].includes(name), `${name} no viaja`);
    }
  } finally { rmSync(packageRoot, { recursive: true, force: true }); rmSync(home, { recursive: true, force: true }); }
});

test("codexComponents del kit real no declara ninguna pieza fuera de `files`", () => {
  const root = join(import.meta.dirname, "..");
  const files = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).files;
  const publicados = new Set(files.map((entry) => entry.replace(/^\.\//, "").replace(/\/+$/, "").split("/")[0]));
  const declarados = new Set(codexComponents(root));
  // `package.json` viaja siempre: identifica lo instalado, y npm lo publica por debajo de `files`.
  for (const name of declarados) assert.ok(publicados.has(name) || name === "package.json", `${name} se instala y el manifiesto no lo publica`);
  assert.ok(declarados.has("skills") && declarados.has("hooks"), "las piezas que el kit necesita si estan");
});

// H16: el árbol versionado traía rutas absolutas de la máquina del mantenedor, y dos de ellas
// se distribuyen en el tarball. `bench/` y el kernel vendorizado quedan fuera de este encargo:
// el primero por decisión del dueño (H17), el segundo porque `SOURCE.md` fija sus bytes y lo
// arregla el kernel de origen con una re-pincada.
test("H16: ningún archivo publicado contiene rutas absolutas de una máquina", () => {
  const root = join(import.meta.dirname, "..");
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  // La raiz del area y el nombre del usuario del mantenedor. Un `C:/Users/<otro>` en una
  // prueba es un ejemplo adversario, no una ruta de esta maquina.
  const prohibidos = [/[A-Za-z]:[\\/]Claude\b/, /[A-Za-z]:[\\/]Users[\\/]andre\b/i];
  const publicados = [];
  const visita = (rel) => {
    if (rel.replaceAll("\\", "/").startsWith("skills/vespi/core/kernel/")) return;
    const full = join(root, rel);
    const st = statSync(full);
    if (st.isDirectory()) {
      for (const name of readdirSync(full, { withFileTypes: true })) visita(join(rel, name.name));
      return;
    }
    publicados.push(rel);
  };
  for (const entry of manifest.files) visita(entry.replaceAll("\\", "/").replace(/\/+$/, ""));
  for (const sub of readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && ["scripts", "skills", "hooks"].includes(e.name))
    .map((e) => e.name)) visita(sub);

  const infractores = [];
  for (const rel of publicados) {
    const texto = readFileSync(join(root, rel), "utf8");
    for (const patron of prohibidos) if (patron.test(texto)) infractores.push(`${rel} (${patron})`);
  }
  assert.deepEqual(infractores, [], `rutas absolutas de una máquina en archivos publicados: ${infractores.join("; ")}`);
});

