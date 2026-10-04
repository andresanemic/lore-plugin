import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  installClaudeStatusline,
  installClaudeStatuslineFromInstalledCopy,
  uninstallClaudeStatusline,
  settingsPathFor,
  statuslineCommandFor,
} from "./install-claude-statusline.mjs";

const packageRoot = join(import.meta.dirname, "..");
const homeTmp = () => mkdtempSync(join(tmpdir(), "lore-claude-home-"));

test("instalación explícita configura [Lore Plugin] vía hooks/statusline.mjs sin tocar lo real", () => {
  const home = homeTmp();
  assert.equal(existsSync(join(packageRoot, "hooks", "statusline.mjs")), true);
  const result = installClaudeStatusline({ home, packageRoot });
  const settingsPath = settingsPathFor({ home });
  assert.equal(result.settingsPath, settingsPath);
  assert.equal(existsSync(settingsPath), true);
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  assert.equal(settings.statusLine?.type, "command");
  assert.equal(settings.statusLine.command, statuslineCommandFor({ packageRoot }));
  assert.ok(settings.statusLine.command.includes("hooks/statusline.mjs"));
});

test("preserva claves ajenas y rehúsa sobrescribir un statusLine ajeno", () => {
  const home = homeTmp();
  const settingsPath = settingsPathFor({ home });
  mkdirSync(join(home, ".claude"), { recursive: true });
  const ajeno = {
    model: "sonnet",
    statusLine: { type: "command", command: "mi-marca-propia --flag" },
  };
  writeFileSync(settingsPath, JSON.stringify(ajeno, null, 2) + "\n");
  const antes = readFileSync(settingsPath, "utf8");
  assert.throws(() => installClaudeStatusline({ home, packageRoot }), /foreign|ajeno|Refusing/i);
  assert.equal(readFileSync(settingsPath, "utf8"), antes);
});

test("reúsa la marca cuando ya es la nuestra (idempotente)", () => {
  const home = homeTmp();
  const primero = installClaudeStatusline({ home, packageRoot });
  assert.equal(primero.reused, false);
  const segundo = installClaudeStatusline({ home, packageRoot });
  assert.equal(segundo.reused, true);
  const settings = JSON.parse(readFileSync(settingsPathFor({ home }), "utf8"));
  assert.equal(settings.statusLine.command, statuslineCommandFor({ packageRoot }));
});

test("reversible: desinstala solo lo nuestro y preserva el resto", () => {
  const home = homeTmp();
  const settingsPath = settingsPathFor({ home });
  mkdirSync(join(home, ".claude"), { recursive: true });
  writeFileSync(settingsPath, JSON.stringify({ model: "sonnet" }, null, 2) + "\n");
  installClaudeStatusline({ home, packageRoot });
  const quitado = uninstallClaudeStatusline({ home, packageRoot });
  assert.equal(quitado.removed, true);
  const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  assert.equal(settings.statusLine, undefined);
  assert.equal(settings.model, "sonnet");
});

test("no confunde un comando ajeno que contiene statusline.mjs con el nuestro (install)", () => {
  const home = homeTmp();
  const settingsPath = settingsPathFor({ home });
  mkdirSync(join(home, ".claude"), { recursive: true });
  const ajeno = {
    statusLine: { type: "command", command: 'node "/otra/herramienta/statusline.mjs --evil"' },
  };
  writeFileSync(settingsPath, JSON.stringify(ajeno, null, 2) + "\n");
  const antes = readFileSync(settingsPath, "utf8");
  assert.throws(() => installClaudeStatusline({ home, packageRoot }), /foreign|ajeno|Refusing/i);
  assert.equal(readFileSync(settingsPath, "utf8"), antes);
});

test("no borra un comando ajeno que contiene statusline.mjs al desinstalar", () => {
  const home = homeTmp();
  const settingsPath = settingsPathFor({ home });
  mkdirSync(join(home, ".claude"), { recursive: true });
  writeFileSync(
    settingsPath,
    JSON.stringify(
      { statusLine: { type: "command", command: 'node "/otra/herramienta/statusline.mjs --evil"' } },
      null,
      2,
    ) + "\n",
  );
  const antes = readFileSync(settingsPath, "utf8");
  assert.throws(() => uninstallClaudeStatusline({ home, packageRoot }), /foreign|ajeno|Refusing/i);
  assert.equal(readFileSync(settingsPath, "utf8"), antes);
});

test("statuslineCommandFor rechaza rutas con comillas o caracteres de control", () => {
  assert.throws(() => statuslineCommandFor({ packageRoot: '/tmp/con"comilla' }), /packageRoot|comilla|quote|control|caracter/i);
  assert.throws(() => statuslineCommandFor({ packageRoot: "/tmp/con\nsalto" }), /packageRoot|control|caracter/i);
  assert.throws(() => statuslineCommandFor({ packageRoot: "/tmp/con\rcarro" }), /packageRoot|control|caracter/i);
  assert.throws(() => statuslineCommandFor({ packageRoot: "/tmp/con'apostrofe" }), /packageRoot|comilla|quote|control|caracter/i);
});

test("API para copia instalada apunta a la copia, no al source", () => {
  const home = homeTmp();
  const copiaInstalada = mkdtempSync(join(tmpdir(), "lore-installed-copy-"));
  mkdirSync(join(copiaInstalada, "hooks"), { recursive: true });
  writeFileSync(join(copiaInstalada, "hooks", "statusline.mjs"), "// copia instalada\n");
  const result = installClaudeStatuslineFromInstalledCopy({ home, installedPackageRoot: copiaInstalada });
  const settings = JSON.parse(readFileSync(settingsPathFor({ home }), "utf8"));
  assert.equal(settings.statusLine.command, statuslineCommandFor({ packageRoot: copiaInstalada }));
  assert.equal(result.command, statuslineCommandFor({ packageRoot: copiaInstalada }));
  assert.ok(!settings.statusLine.command.includes(packageRoot.replaceAll("\\", "/")));
});

test("reversible: no toca un statusLine ajeno al desinstalar", () => {
  const home = homeTmp();
  const settingsPath = settingsPathFor({ home });
  mkdirSync(join(home, ".claude"), { recursive: true });
  writeFileSync(
    settingsPath,
    JSON.stringify({ statusLine: { type: "command", command: "otro" } }, null, 2) + "\n",
  );
  const antes = readFileSync(settingsPath, "utf8");
  assert.throws(() => uninstallClaudeStatusline({ home, packageRoot }), /foreign|ajeno|Refusing/i);
  assert.equal(readFileSync(settingsPath, "utf8"), antes);
});

test("actualiza la marca nuestra de una versión anterior de la caché (RC previa) a la nueva", () => {
  const home = homeTmp();
  const claudeDir = join(home, ".claude");
  mkdirSync(claudeDir, { recursive: true });
  const previo = `node "${home.replaceAll("\\", "/")}/.claude/plugins/cache/lore-plugin/lore/2.4.9-rc.6/hooks/statusline.mjs"`;
  writeFileSync(join(claudeDir, "settings.json"), JSON.stringify({ model: "x", statusLine: { type: "command", command: previo } }));
  const nueva = join(home, ".claude", "plugins", "cache", "lore-plugin", "lore", "2.4.9");
  mkdirSync(join(nueva, "hooks"), { recursive: true });
  writeFileSync(join(nueva, "hooks", "statusline.mjs"), "// hook de prueba");
  const result = installClaudeStatusline({ home, packageRoot: nueva });
  const settings = JSON.parse(readFileSync(join(claudeDir, "settings.json"), "utf8"));
  assert.equal(settings.model, "x");
  assert.equal(settings.statusLine.command, statuslineCommandFor({ packageRoot: nueva }));
  assert.equal(result.upgraded, true);
});

test("sigue rehusando un statusline.mjs de otra ubicación aunque tenga el mismo nombre de archivo", () => {
  const home = homeTmp();
  const claudeDir = join(home, ".claude");
  mkdirSync(claudeDir, { recursive: true });
  const ajeno = 'node "C:/otro/lore/9.9.9/hooks/statusline.mjs"';
  writeFileSync(join(claudeDir, "settings.json"), JSON.stringify({ statusLine: { type: "command", command: ajeno } }));
  const nueva = join(home, ".claude", "plugins", "cache", "lore-plugin", "lore", "2.4.9");
  mkdirSync(join(nueva, "hooks"), { recursive: true });
  writeFileSync(join(nueva, "hooks", "statusline.mjs"), "// hook de prueba");
  assert.throws(() => installClaudeStatusline({ home, packageRoot: nueva }), /foreign|ajeno|Refusing/i);
});
