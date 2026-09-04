import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { installCodex, claudeCommands } from "./installer.mjs";

const makePackage = () => {
  const root = mkdtempSync(join(tmpdir(), "lore-package-"));
  mkdirSync(join(root, ".codex-plugin"), { recursive: true });
  mkdirSync(join(root, "skills", "use-lore"), { recursive: true });
  mkdirSync(join(root, "hooks"), { recursive: true });
  writeFileSync(join(root, ".codex-plugin", "plugin.json"), '{"name":"lore","version":"2.0.0"}');
  writeFileSync(join(root, "skills", "use-lore", "SKILL.md"), "---\nname: use-lore\n---\n");
  writeFileSync(join(root, "hooks", "hooks.json"), '{"hooks":{}}');
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(join(root, "scripts", "lore-plugin.mjs"), "// cli\n");
  return root;
};

test("Codex instala el plugin y crea un marketplace personal válido", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-home-"));
  installCodex({ home, packageRoot: makePackage() });

  const pluginRoot = join(home, ".agents", "plugins", "plugins", "lore");
  assert.equal(existsSync(join(pluginRoot, ".codex-plugin", "plugin.json")), true);
  assert.equal(existsSync(join(pluginRoot, "skills", "use-lore", "SKILL.md")), true);
  assert.equal(existsSync(join(pluginRoot, "hooks", "hooks.json")), true);
  // El kit manda correr `lore-plugin mycelium bodies` en cada apertura de sesión y
  // `mycelium announce` para el Anuncio. Sin `scripts/`, Codex recibía la instrucción
  // y no el comando — detectado el 2026-09-03 instalando el RC de 2.4.8 en los tres hosts.
  assert.equal(existsSync(join(pluginRoot, "scripts", "lore-plugin.mjs")), true);

  const market = JSON.parse(readFileSync(join(home, ".agents", "plugins", "marketplace.json"), "utf8"));
  assert.equal(market.name, "personal");
  assert.deepEqual(market.plugins[0], {
    name: "lore",
    source: { source: "local", path: "./.agents/plugins/plugins/lore" },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: "Productivity",
  });
});

test("Codex preserva otros plugins y reemplaza solo la entrada lore", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-home-"));
  const marketDir = join(home, ".agents", "plugins");
  mkdirSync(marketDir, { recursive: true });
  writeFileSync(join(marketDir, "marketplace.json"), JSON.stringify({
    name: "personal",
    interface: { displayName: "Mi marketplace" },
    plugins: [
      { name: "otro", source: { source: "local", path: "./plugins/otro" }, policy: { installation: "AVAILABLE", authentication: "ON_USE" }, category: "Other" },
      { name: "lore", source: { source: "local", path: "./plugins/lore-viejo" }, policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" }, category: "Other" },
    ],
  }));

  installCodex({ home, packageRoot: makePackage() });
  const market = JSON.parse(readFileSync(join(marketDir, "marketplace.json"), "utf8"));
  assert.equal(market.interface.displayName, "Mi marketplace");
  assert.deepEqual(market.plugins.map((entry) => entry.name), ["otro", "lore"]);
  assert.equal(market.plugins[1].source.path, "./.agents/plugins/plugins/lore");
  assert.equal(
    existsSync(join(home, market.plugins[1].source.path)),
    true,
    "la ruta que Codex resuelve desde home debe existir",
  );
});

test("Codex retira archivos obsoletos de una versión anterior de Lore", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-home-"));
  const pluginRoot = join(home, ".agents", "plugins", "plugins", "lore");
  mkdirSync(join(pluginRoot, "skills", "using-lore"), { recursive: true });
  mkdirSync(join(pluginRoot, "hooks"), { recursive: true });
  writeFileSync(join(pluginRoot, "skills", "using-lore", "SKILL.md"), "obsoleto\n");
  writeFileSync(join(pluginRoot, "hooks", "obsolete.mjs"), "obsoleto\n");

  installCodex({ home, packageRoot: makePackage() });

  assert.equal(existsSync(join(pluginRoot, "skills", "using-lore")), false);
  assert.equal(existsSync(join(pluginRoot, "skills", "use-lore", "SKILL.md")), true);
  assert.equal(existsSync(join(pluginRoot, "hooks", "obsolete.mjs")), false);
  assert.equal(existsSync(join(pluginRoot, "hooks", "hooks.json")), true);
});

// La prosa instalada es la misma en todos los hosts; la capacidad instalada no.
// Esta prueba corre contra el paquete REAL, no contra un fixture: un fixture repetiría
// el defecto que la produjo — certificar el mecanismo bajo las condiciones que su autor
// imaginó. Detectado el 2026-09-03 instalando el RC de 2.4.8: `use-lore` mandaba correr
// `lore-plugin mycelium bodies` desde 2.4.7 publicada y Codex nunca recibió `scripts/`.
function invocacionesDelCLI(root) {
  const tokens = new Set();
  const skills = join(root, "skills");
  for (const entry of readdirSync(skills, { recursive: true })) {
    const name = String(entry);
    if (!name.endsWith(".md")) continue;
    const prosa = readFileSync(join(skills, name), "utf8");
    for (const [, comando, sub] of prosa.matchAll(/lore-plugin\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/g)) {
      tokens.add(comando);
      if (sub) tokens.add(sub);
    }
  }
  return [...tokens];
}

test("Codex recibe todo comando que la prosa de una skill ordena correr", () => {
  const root = join(import.meta.dirname, "..");
  const invocados = invocacionesDelCLI(root);
  assert.ok(invocados.length > 0, "la prosa de las skills debe invocar el CLI del kit");

  const home = mkdtempSync(join(tmpdir(), "lore-home-"));
  installCodex({ home, packageRoot: root });

  const cliPath = join(home, ".agents", "plugins", "plugins", "lore", "scripts", "lore-plugin.mjs");
  assert.equal(existsSync(cliPath), true, "la prosa invoca `lore-plugin` y Codex no recibió el CLI");

  const cli = readFileSync(cliPath, "utf8");
  for (const token of invocados) {
    assert.ok(cli.includes(token), `la prosa ordena "${token}" y el CLI instalado no lo implementa`);
  }
});

test("Claude usa comandos explícitos y no una copia silenciosa", () => {
  assert.deepEqual(claudeCommands(), [
    ["claude", "plugin", "marketplace", "add", "andresanemic/lore-plugin"],
    ["claude", "plugin", "install", "lore@lore-plugin"],
  ]);
});
