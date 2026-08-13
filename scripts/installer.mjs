import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const loreEntry = {
  name: "lore",
  source: { source: "local", path: "./plugins/lore" },
  policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  category: "Productivity",
};

export function claudeCommands() {
  return [
    ["claude", "plugin", "marketplace", "add", "andresanemic/lore-plugin"],
    ["claude", "plugin", "install", "lore@lore-plugin"],
  ];
}

export function installCodex({ home, packageRoot }) {
  const marketplaceRoot = join(home, ".agents", "plugins");
  const pluginRoot = join(marketplaceRoot, "plugins", "lore");
  const marketplacePath = join(marketplaceRoot, "marketplace.json");

  const market = existsSync(marketplacePath)
    ? JSON.parse(readFileSync(marketplacePath, "utf8"))
    : { name: "personal", interface: { displayName: "Personal" }, plugins: [] };

  if (existsSync(pluginRoot) && lstatSync(pluginRoot).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link plugin directory: ${pluginRoot}`);
  }
  mkdirSync(pluginRoot, { recursive: true });

  for (const name of ["skills", ".codex-plugin", "assets"]) {
    const source = join(packageRoot, name);
    const destination = join(pluginRoot, name);
    if (existsSync(destination)) {
      if (lstatSync(destination).isSymbolicLink()) {
        throw new Error(`Refusing to replace symbolic-link plugin component: ${destination}`);
      }
      rmSync(destination, { recursive: true });
    }
    if (existsSync(source)) cpSync(source, destination, { recursive: true, force: true });
  }

  market.plugins ??= [];
  const previous = market.plugins.findIndex((entry) => entry.name === "lore");
  if (previous === -1) market.plugins.push(loreEntry);
  else market.plugins[previous] = loreEntry;
  mkdirSync(marketplaceRoot, { recursive: true });
  writeFileSync(marketplacePath, JSON.stringify(market, null, 2) + "\n");

  return { pluginRoot, marketplacePath };
}
