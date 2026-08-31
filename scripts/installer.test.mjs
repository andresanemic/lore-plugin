import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
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
  return root;
};

test("Codex instala el plugin y crea un marketplace personal válido", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-home-"));
  installCodex({ home, packageRoot: makePackage() });

  const pluginRoot = join(home, ".agents", "plugins", "plugins", "lore");
  assert.equal(existsSync(join(pluginRoot, ".codex-plugin", "plugin.json")), true);
  assert.equal(existsSync(join(pluginRoot, "skills", "use-lore", "SKILL.md")), true);
  assert.equal(existsSync(join(pluginRoot, "hooks", "hooks.json")), true);

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

test("Claude usa comandos explícitos y no una copia silenciosa", () => {
  assert.deepEqual(claudeCommands(), [
    ["claude", "plugin", "marketplace", "add", "andresanemic/lore-plugin"],
    ["claude", "plugin", "install", "lore@lore-plugin"],
  ]);
});
