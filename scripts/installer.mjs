import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, relative } from "node:path";

const loreEntry = {
  name: "lore",
  // Codex resolves local marketplace sources from the user's home directory,
  // not from the directory that contains marketplace.json.
  source: { source: "local", path: "./.agents/plugins/plugins/lore" },
  policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  category: "Productivity",
};

export function claudeCommands() {
  return [
    ["claude", "plugin", "marketplace", "add", "andresanemic/lore-plugin"],
    ["claude", "plugin", "install", "lore@lore-plugin"],
  ];
}

export function claudePluginInstallPath({ home }) {
  if (!home) throw new TypeError("home is required");
  const manifestPath = join(home, ".claude", "plugins", "installed_plugins.json");
  if (!existsSync(manifestPath)) throw new Error(`Claude plugin install manifest is missing: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entries = manifest.plugins?.["lore@lore-plugin"];
  if (!Array.isArray(entries) || entries.length !== 1 || typeof entries[0]?.installPath !== "string") {
    throw new Error(`Expected exactly one installed Lore Plugin entry in ${manifestPath}`);
  }
  if (!isAbsolute(entries[0].installPath)) throw new Error("Claude Lore Plugin installPath must be absolute");
  return entries[0].installPath;
}

function treeDigest(root) {
  if (!existsSync(root)) return null;
  const hash = createHash("sha256");
  // Una copia puede ser un archivo suelto —el núcleo que carga el host no es un árbol— y
  // esa comprobación es la que C1 exige sobre lo que cada host ejecuta. Un archivo se
  // nombra por su base para que su digest no pueda coincidir con el de la carpeta que lo contiene.
  if (lstatSync(root).isFile()) {
    hash.update(basename(root));
    hash.update("\0");
    hash.update(readFileSync(root));
    hash.update("\n");
    return hash.digest("hex");
  }
  const files = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
  for (const file of files) {
    hash.update(relative(root, file).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\n");
  }
  return hash.digest("hex");
}

export function sameTree(source, destination) {
  const sourceDigest = treeDigest(source);
  return sourceDigest !== null && sourceDigest === treeDigest(destination);
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

  // `scripts/` viaja porque el kit lo invoca por nombre: la apertura de sesion corre
  // `lore-plugin mycelium bodies` y el Anuncio reclama su franja con `mycelium announce`.
  // Sin el, Codex recibe la prosa que manda correr un comando que ese host no tiene.
  for (const name of ["skills", ".codex-plugin", "assets", "hooks", "scripts"]) {
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

  const verified = ["skills", ".codex-plugin", "assets", "hooks", "scripts"]
    .filter((name) => existsSync(join(packageRoot, name)))
    .every((name) => sameTree(join(packageRoot, name), join(pluginRoot, name)));
  return { pluginRoot, marketplacePath, verified };
}

// Lo que OpenCode v1.18.33 carga de verdad: `ConfigPlugin.load` barre
// `{plugin,plugins}/*.{ts,js}` en el directorio de configuración, sin recursión. Eso obliga a
// dos cosas que el código de arriba no dice solo: el adaptador tiene que ser `.js` —`.mjs`
// queda fuera del patrón— y el núcleo que comparte con los otros dos hosts se instala como
// `.mjs` para que el runtime no lo tome por un segundo plugin. Un solo archivo es plugin.
//
// `lore-turno.mjs` entra porque el adaptador lo importa para el registro por turno: sin él en
// la lista, el plugin instalado revienta al importar y TODO el guard de OpenCode deja de
// funcionar. Lo que se importa tiene que estar en la lista; es la misma ley de la que trata
// el test del plugin de una sola función.
const OPENCODE_PLUGIN = [
  "opencode-plugin.js",
  "lore-guard.mjs",
  "lore-state.mjs",
  "lore-turno.mjs",
];
const OPENCODE_TUI_PLUGIN = "opencode-statusline.tui.tsx";
const OPENCODE_TUI_ENTRY = `./plugins/${OPENCODE_TUI_PLUGIN}`;

export function installOpenCode({ home, packageRoot }) {
  const configRoot = join(home, ".config", "opencode");
  const sourceRoot = join(packageRoot, "skills");
  const skillsRoot = join(configRoot, "skills");
  const pluginRoot = join(configRoot, "plugin");
  const tuiRoot = join(configRoot, "plugins");
  const tuiConfigPath = join(configRoot, "tui.json");
  const tuiSource = join(packageRoot, "hooks", "opencode-statusline.tui.tsx");
  const tuiDestination = join(tuiRoot, OPENCODE_TUI_PLUGIN);

  // Validate the TUI side before changing skills or server plugins. The CLI cannot
  // safely merge JSONC in this version, so do not create a partial installation.
  if (existsSync(join(configRoot, "tui.jsonc"))) {
    throw new Error("OpenCode tui.jsonc exists; refusing to edit a second TUI configuration");
  }
  const tuiConfig = existsSync(tuiConfigPath)
    ? JSON.parse(readFileSync(tuiConfigPath, "utf8"))
    : {};
  if (!tuiConfig || typeof tuiConfig !== "object" || Array.isArray(tuiConfig)) {
    throw new Error("OpenCode tui.json must contain an object");
  }
  if (tuiConfig.plugin !== undefined && !Array.isArray(tuiConfig.plugin)) {
    throw new Error("OpenCode tui.json plugin must be an array");
  }
  tuiConfig.plugin ??= [];
  if (!tuiConfig.plugin.includes(OPENCODE_TUI_ENTRY)) tuiConfig.plugin.push(OPENCODE_TUI_ENTRY);
  if (!existsSync(tuiSource)) throw new Error(`Missing OpenCode TUI plugin: ${tuiSource}`);
  if (existsSync(tuiDestination) && lstatSync(tuiDestination).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link TUI plugin: ${tuiDestination}`);
  }
  if (existsSync(tuiDestination) && !sameTree(tuiSource, tuiDestination)) {
    throw new Error(`Refusing to replace a different TUI plugin at ${tuiDestination}`);
  }

  mkdirSync(skillsRoot, { recursive: true });
  for (const entry of readdirSync(sourceRoot, { withFileTypes: true }).filter((item) => item.isDirectory())) {
    const source = join(sourceRoot, entry.name);
    const destination = join(skillsRoot, entry.name);
    if (existsSync(destination)) {
      if (lstatSync(destination).isSymbolicLink()) {
        throw new Error(`Refusing to replace symbolic-link skill directory: ${destination}`);
      }
      rmSync(destination, { recursive: true });
    }
    cpSync(source, destination, { recursive: true, force: true });
  }
  const skillsVerificadas = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .every((entry) => sameTree(join(sourceRoot, entry.name), join(skillsRoot, entry.name)));

  if (existsSync(pluginRoot) && lstatSync(pluginRoot).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link plugin directory: ${pluginRoot}`);
  }
  mkdirSync(pluginRoot, { recursive: true });
  for (const nombre of OPENCODE_PLUGIN) {
    const source = join(packageRoot, "hooks", nombre);
    const destination = join(pluginRoot, nombre);
    if (!existsSync(source)) continue;
    if (existsSync(destination)) {
      if (lstatSync(destination).isSymbolicLink()) {
        throw new Error(`Refusing to replace symbolic-link plugin component: ${destination}`);
      }
      rmSync(destination, { recursive: true });
    }
    cpSync(source, destination, { force: true });
  }

  const pluginVerificado = OPENCODE_PLUGIN
    .map((nombre) => join(packageRoot, "hooks", nombre))
    .filter((origen) => existsSync(origen))
    .every((origen) => sameTree(origen, join(pluginRoot, basename(origen))));

  // OpenCode 1.18.33 loads TUI plugins from `tui.json`, separately from server plugins.
  // Preserve user entries and fail closed on JSONC or malformed settings.
  mkdirSync(tuiRoot, { recursive: true });
  cpSync(tuiSource, tuiDestination, { force: true });
  writeFileSync(tuiConfigPath, JSON.stringify(tuiConfig, null, 2) + "\n");
  const tuiVerificado = sameTree(tuiSource, tuiDestination) &&
    JSON.parse(readFileSync(tuiConfigPath, "utf8")).plugin.includes(OPENCODE_TUI_ENTRY);

  // Los plugins locales se autodescubren: instalar no es editar `opencode.jsonc`. Se copia
  // encima de lo que hubiera y no se toca ningún otro archivo del directorio, porque ahí
  // viven los plugins de otra persona.
  return { skillsRoot, pluginRoot, tuiRoot, tuiConfigPath, verified: skillsVerificadas && pluginVerificado && tuiVerificado };
}
