import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { installCodex, installOpenCode, claudeCommands, claudePluginInstallPath, sameTree, replaceLocalEntry, recoverLocalEntry, replaceManagedPath } from "./installer.mjs";

const makePackage = () => {
  const root = mkdtempSync(join(tmpdir(), "lore-package-"));
  mkdirSync(join(root, ".codex-plugin"), { recursive: true });
  mkdirSync(join(root, "skills", "use-lore"), { recursive: true });
  mkdirSync(join(root, "hooks"), { recursive: true });
  writeFileSync(join(root, ".codex-plugin", "plugin.json"), '{"name":"lore","version":"2.0.0"}');
  writeFileSync(join(root, "skills", "use-lore", "SKILL.md"), "---\nname: use-lore\n---\n");
  writeFileSync(join(root, "hooks", "hooks.json"), '{"hooks":{}}');
  // OpenCode carga `{plugin,plugins}/*.{ts,js}`: el adaptador y el núcleo que comparte
  // viajan en el paquete, y un fixture que los omitiera certificaría un instalador que
  // nunca instaló el hook — el defecto que este archivo ya persiguió una vez.
  writeFileSync(join(root, "hooks", "opencode-plugin.js"), "export const LorePlugin = async () => ({})\n");
  writeFileSync(join(root, "hooks", "opencode-input.mjs"), "export const input = true;\n");
  writeFileSync(join(root, "hooks", "lore-guard.mjs"), "export const classifyWrite = () => \"own\";\n");
  writeFileSync(join(root, "hooks", "lore-state.mjs"), "export const snapshot = () => ({ fileCount: 0 });\n");
  writeFileSync(join(root, "hooks", "lore-turno.mjs"), "export const marca = () => '[Lore Plugin]'; export const nivel = () => 'full';\n");
  writeFileSync(join(root, "hooks", "opencode-statusline.tui.tsx"), "export default { id: 'lore-plugin.statusline', tui(api) { api.slots.register({ slots: { app_bottom: () => <text>[Lore Plugin]</text> } }); } };\n");
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(join(root, "scripts", "lore-plugin.mjs"), "// cli\n");
  // La entrada local y su cadena son obligatorias desde RC7: sin ellas la instalación no
  // procede, y un fixture que las omitiera certificaría un instalador que deja a la prosa
  // mandando correr un comando que el host no tiene — el defecto que esta prueba persiguió.
  writeFileSync(join(root, "scripts", "lore-cli.mjs"), "// local entry\n");
  writeFileSync(join(root, "scripts", "installer.mjs"), "// installer\n");
  mkdirSync(join(root, "skills", "use-lore", "scripts"), { recursive: true });
  writeFileSync(join(root, "skills", "use-lore", "scripts", "acuerdo.mjs"), "export const acuerdo = {};\n");
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
    // `lore-plugin` es la entrada de la vía npm/marketplace; `lore-cli` es la entrada local que
    // instala cada host. La prosa puede ordenar cualquiera de las dos, y lo que esta prueba
    // afirma es que el comando ordenado exista en lo instalado, no cuál de los dos nombres usa.
    for (const [, comando, sub] of prosa.matchAll(/(?:lore-plugin|lore-cli)\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/g)) {
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

  // Y la entrada local, que es la que la prosa de MYCELIUM nombra por ruta.
  const localPath = join(home, ".lore-plugin", "entry", "codex", "scripts", "lore-cli.mjs");
  assert.equal(existsSync(localPath), true, "Codex no recibió la entrada local que la prosa nombra por ruta");

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

test("Claude resuelve la única copia instalada para conectar su statusline", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-claude-installed-"));
  const installPath = join(home, ".claude", "plugins", "cache", "lore", "2.4.9-rc.6");
  mkdirSync(installPath, { recursive: true });
  writeFileSync(join(home, ".claude", "plugins", "installed_plugins.json"), JSON.stringify({
    plugins: { "lore@lore-plugin": [{ installPath, version: "2.4.9-rc.6" }] },
  }));
  assert.equal(claudePluginInstallPath({ home }), installPath);
  writeFileSync(join(home, ".claude", "plugins", "installed_plugins.json"), JSON.stringify({ plugins: {} }));
  assert.throws(() => claudePluginInstallPath({ home }), /Expected exactly one/);
});

test("CLI statusline install/uninstall changes only the isolated Claude settings", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-claude-statusline-cli-"));
  const installPath = join(home, ".claude", "plugins", "cache", "lore", "2.4.9-rc.6");
  mkdirSync(join(installPath, "hooks"), { recursive: true });
  writeFileSync(join(installPath, "hooks", "statusline.mjs"), "console.log('[Lore Plugin]')\n");
  writeFileSync(join(home, ".claude", "plugins", "installed_plugins.json"), JSON.stringify({
    plugins: { "lore@lore-plugin": [{ installPath, version: "2.4.9-rc.6" }] },
  }));
  const settingsPath = join(home, ".claude", "settings.json");
  writeFileSync(settingsPath, JSON.stringify({ theme: "dark" }));
  const cli = join(import.meta.dirname, "lore-plugin.mjs");
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  const installed = spawnSync(process.execPath, [cli, "statusline", "install"], { env, encoding: "utf8" });
  assert.equal(installed.status, 0, installed.stderr);
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  assert.equal(settings.theme, "dark");
  assert.equal(settings.statusLine.command, `node "${join(installPath, "hooks", "statusline.mjs").replaceAll("\\", "/")}"`);
  const removed = spawnSync(process.execPath, [cli, "statusline", "uninstall"], { env, encoding: "utf8" });
  assert.equal(removed.status, 0, removed.stderr);
  assert.deepEqual(JSON.parse(readFileSync(settingsPath, "utf8")), { theme: "dark" });
});

test("OpenCode reinstala las skills locales y verifica su digest", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-opencode-"));
  const packageRoot = makePackage();
  const result = installOpenCode({ home, packageRoot });
  assert.equal(result.verified, true);
  assert.equal(sameTree(join(packageRoot, "skills"), result.skillsRoot), true);

  writeFileSync(join(result.skillsRoot, "use-lore", "SKILL.md"), "alterado\n");
  assert.equal(sameTree(join(packageRoot, "skills"), result.skillsRoot), false);
});

test("OpenCode instala la marca TUI en app_bottom y conserva su configuración y plugins", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-opencode-tui-"));
  const configRoot = join(home, ".config", "opencode");
  mkdirSync(configRoot, { recursive: true });
  writeFileSync(join(configRoot, "tui.json"), JSON.stringify({ theme: "oscuro", plugin: ["./plugins/otro.tsx"] }));
  const packageRoot = makePackage();
  const result = installOpenCode({ home, packageRoot });
  const config = JSON.parse(readFileSync(result.tuiConfigPath, "utf8"));
  assert.deepEqual(config.plugin, ["./plugins/otro.tsx", "./plugins/opencode-statusline.tui.tsx"]);
  assert.equal(config.theme, "oscuro");
  assert.equal(
    readFileSync(join(result.tuiRoot, "opencode-statusline.tui.tsx"), "utf8"),
    readFileSync(join(packageRoot, "hooks", "opencode-statusline.tui.tsx"), "utf8"),
  );
  assert.equal(result.verified, true);
});

test("OpenCode TUI install is idempotent and refuses JSONC instead of shadowing it", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-opencode-tui-idempotent-"));
  const packageRoot = makePackage();
  installOpenCode({ home, packageRoot });
  installOpenCode({ home, packageRoot });
  const configPath = join(home, ".config", "opencode", "tui.json");
  assert.deepEqual(JSON.parse(readFileSync(configPath, "utf8")).plugin, ["./plugins/opencode-statusline.tui.tsx"]);
  writeFileSync(join(home, ".config", "opencode", "tui.jsonc"), '{ "plugin": ["./plugins/foreign.tsx"] }\n');
  assert.throws(() => installOpenCode({ home, packageRoot }), /tui\.jsonc exists/);
  assert.deepEqual(JSON.parse(readFileSync(configPath, "utf8")).plugin, ["./plugins/opencode-statusline.tui.tsx"]);
});

test("OpenCode rejects unsupported TUI config before changing host files", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-opencode-jsonc-"));
  const configRoot = join(home, ".config", "opencode");
  mkdirSync(join(configRoot, "plugin"), { recursive: true });
  writeFileSync(join(configRoot, "plugin", "foreign.mjs"), "foreign plugin\n");
  writeFileSync(join(configRoot, "tui.jsonc"), '{ "plugin": ["./plugins/foreign.tsx"] }\n');
  const packageRoot = makePackage();
  assert.throws(() => installOpenCode({ home, packageRoot }), /tui\.jsonc exists/);
  assert.equal(existsSync(join(configRoot, "skills")), false);
  assert.equal(existsSync(join(configRoot, "plugins")), false);
  assert.equal(readFileSync(join(configRoot, "plugin", "foreign.mjs"), "utf8"), "foreign plugin\n");
});

test("OpenCode refuses to overwrite a different plugin at Lore's TUI path", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-opencode-tui-collision-"));
  const configRoot = join(home, ".config", "opencode");
  const tuiPath = join(configRoot, "plugins", "opencode-statusline.tui.tsx");
  mkdirSync(join(configRoot, "plugins"), { recursive: true });
  writeFileSync(tuiPath, "foreign owner\n");
  const packageRoot = makePackage();
  assert.throws(() => installOpenCode({ home, packageRoot }), /Refusing to replace a different TUI plugin/);
  assert.equal(readFileSync(tuiPath, "utf8"), "foreign owner\n");
  assert.equal(existsSync(join(configRoot, "skills")), false);
  assert.equal(existsSync(join(configRoot, "plugin")), false);
});

test("OpenCode TUI adapter uses the persistent app_bottom slot and existing Lore level", () => {
  const source = readFileSync(join(import.meta.dirname, "..", "hooks", "opencode-statusline.tui.tsx"), "utf8");
  assert.match(source, /app_bottom/);
  assert.match(source, /marca\(nivel\(\)\)/);
  assert.doesNotMatch(source, /home_footer|session_prompt_right/);
});

test("Codex devuelve digest verificado contra el árbol fuente", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-digest-"));
  const packageRoot = makePackage();
  const result = installCodex({ home, packageRoot });
  assert.equal(result.verified, true);
});

test("un fallo al publicar el recibo restaura la entrada y el recibo anteriores", () => {
  const root = mkdtempSync(join(tmpdir(), "lore-entry-rollback-"));
  const entryRoot = join(root, "entry", "codex");
  const receiptPath = join(root, "entry", "codex.receipt.json");
  const stagedEntry = join(root, "staging", "entry");
  const stagedReceipt = join(root, "staging", "receipt.json");
  const transactionRoot = join(root, "staging", "codex-entry-transaction");
  mkdirSync(entryRoot, { recursive: true });
  mkdirSync(stagedEntry, { recursive: true });
  mkdirSync(join(root, "staging"), { recursive: true });
  writeFileSync(join(entryRoot, "old.mjs"), "old entry\n");
  writeFileSync(receiptPath, "old receipt\n");
  writeFileSync(join(stagedEntry, "new.mjs"), "new entry\n");
  writeFileSync(stagedReceipt, "new receipt\n");

  let renames = 0;
  assert.throws(() => replaceLocalEntry({
    transactionRoot, stagedEntry, entryRoot, stagedReceipt, receiptPath, digest: "new-digest",
    rename(from, to) {
      renames += 1;
      if (renames === 4) throw new Error("injected receipt publish failure");
      renameSync(from, to);
    },
  }), /previous entry and receipt were restored/);

  assert.equal(readFileSync(join(entryRoot, "old.mjs"), "utf8"), "old entry\n");
  assert.equal(readFileSync(receiptPath, "utf8"), "old receipt\n");
  assert.equal(existsSync(join(entryRoot, "new.mjs")), false);
});

test("la siguiente ejecución recupera una transacción interrumpida", () => {
  const root = mkdtempSync(join(tmpdir(), "lore-entry-resume-"));
  const transactionRoot = join(root, "staging", "codex-entry-transaction");
  const entryRoot = join(root, "entry", "codex");
  const receiptPath = join(root, "entry", "codex.receipt.json");
  const backupEntry = join(transactionRoot, "previous-entry");
  const backupReceipt = join(transactionRoot, "previous-receipt.json");
  mkdirSync(backupEntry, { recursive: true });
  mkdirSync(entryRoot, { recursive: true });
  writeFileSync(join(backupEntry, "old.mjs"), "old entry\n");
  writeFileSync(backupReceipt, "old receipt\n");
  writeFileSync(join(entryRoot, "new.mjs"), "partially published entry\n");
  writeFileSync(join(transactionRoot, "transaction.json"), JSON.stringify({
    digest: "new-digest", hadEntry: true, hadReceipt: true,
  }));

  assert.equal(recoverLocalEntry({ transactionRoot, entryRoot, receiptPath }), "restored-previous-entry");
  assert.equal(readFileSync(join(entryRoot, "old.mjs"), "utf8"), "old entry\n");
  assert.equal(readFileSync(receiptPath, "utf8"), "old receipt\n");
  assert.equal(existsSync(transactionRoot), false);
});

test("el reemplazo staged de un componente de host restaura lo anterior ante fallo de rename", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-managed-rollback-home-"));
  const root = mkdtempSync(join(tmpdir(), "lore-managed-rollback-"));
  const source = join(root, "skills", "use-lore");
  const destination = join(home, ".config", "opencode", "skills", "use-lore");
  mkdirSync(source, { recursive: true });
  mkdirSync(destination, { recursive: true });
  writeFileSync(join(source, "SKILL.md"), "new skill\n");
  writeFileSync(join(destination, "SKILL.md"), "old skill\n");
  let renames = 0;

  assert.throws(() => replaceManagedPath({
    home, host: "opencode", source, destination, label: "OpenCode skill",
    rename(from, to) {
      renames += 1;
      if (renames === 2) throw new Error("injected publish failure");
      renameSync(from, to);
    },
  }), /previous path was restored/);

  assert.equal(readFileSync(join(destination, "SKILL.md"), "utf8"), "old skill\n");
});

test("preflight de la entrada local falla antes de mutar Codex u OpenCode", () => {
  for (const [host, install, changedPath] of [
    ["codex", installCodex, ".agents"],
    ["opencode", installOpenCode, ".config"],
  ]) {
    const home = mkdtempSync(join(tmpdir(), `lore-local-preflight-${host}-`));
    writeFileSync(join(home, ".lore-plugin"), "blocking file\n");
    assert.throws(() => install({ home, packageRoot: makePackage() }), /non-directory|not a directory/);
    assert.equal(existsSync(join(home, changedPath)), false, `${host} changed before local-entry preflight`);
  }
});
