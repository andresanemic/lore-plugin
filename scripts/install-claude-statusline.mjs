// Instalación EXPLÍCITA RC6 de la marca `[Lore Plugin]` en la línea de estado de
// Claude Code (R46). No se instala sola: un hook no escribe la configuración de la
// persona; esta función la corre quien instala, con `{ home, packageRoot }`
// explícitos para que las pruebas usen un HOME temporal y nunca lo real.
//
// Usa `hooks/statusline.mjs` ya existente: no duplica la marca, solo apunta
// `statusLine` a ese script. Reversible: `uninstallClaudeStatusline` quita solo lo
// nuestro. Lo nuestro se reconoce por identidad exacta contra
// `statuslineCommandFor({ packageRoot })`: un `statusLine` ajeno —aunque contenga
// el texto `statusline.mjs`— se preserva, e instalar o desinstalar encima suyo
// lanza sin modificar el archivo.
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function statuslineCommandFor({ packageRoot }) {
  if (!packageRoot) throw new TypeError("packageRoot es obligatorio");
  if (typeof packageRoot !== "string") throw new TypeError("packageRoot debe ser texto");
  if (/["'\n\r\0\x00-\x1F\x7F]/.test(packageRoot)) {
    throw new Error(`packageRoot con comillas o caracteres de control rechazado: ${JSON.stringify(packageRoot)}`);
  }
  const hook = join(packageRoot, "hooks", "statusline.mjs").replaceAll("\\", "/");
  return `node "${hook}"`;
}

export function settingsPathFor({ home }) {
  if (!home) throw new TypeError("home es obligatorio");
  return join(home, ".claude", "settings.json");
}

function esNuestra(entry, expectedCommand) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    entry.type === "command" &&
    typeof entry.command === "string" &&
    typeof expectedCommand === "string" &&
    entry.command === expectedCommand
  );
}

function leerSettings(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function escribirSettings(path, objeto) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(objeto, null, 2) + "\n");
}

function rechazarEnlace(path, que) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link ${que}: ${path}`);
  }
}

export function installClaudeStatusline({ home, packageRoot }) {
  if (!home) throw new TypeError("home es obligatorio");
  if (!packageRoot) throw new TypeError("packageRoot es obligatorio");
  const hook = join(packageRoot, "hooks", "statusline.mjs");
  if (!existsSync(hook)) throw new Error(`statusline hook ausente: ${hook}`);
  const settingsPath = settingsPathFor({ home });
  rechazarEnlace(settingsPath, "settings");
  const command = statuslineCommandFor({ packageRoot });

  if (!existsSync(settingsPath)) {
    escribirSettings(settingsPath, { statusLine: { type: "command", command } });
    return { settingsPath, command, created: true, reused: false };
  }
  const settings = leerSettings(settingsPath);
  const actual = settings.statusLine;
  if (actual === undefined || actual === null) {
    escribirSettings(settingsPath, { ...settings, statusLine: { type: "command", command } });
    return { settingsPath, command, created: false, reused: false };
  }
  if (esNuestra(actual, command)) {
    return { settingsPath, command, created: false, reused: true };
  }
  throw new Error(
    `Refusing to overwrite foreign statusLine at ${settingsPath}: instalación explícita requerida (--force no implementado)`,
  );
}

// API explícita para el instalador RC6: `installedPackageRoot` es la raíz de la
// COPIA instalada (destino de la copia, no el source del repo). El comando
// `statusLine` apunta a `hooks/statusline.mjs` dentro de esa copia, de modo que
// la marca sigue funcionando si el source se mueve o se borra.
export function installClaudeStatuslineFromInstalledCopy({ home, installedPackageRoot }) {
  if (!installedPackageRoot) throw new TypeError("installedPackageRoot es obligatorio");
  return installClaudeStatusline({ home, packageRoot: installedPackageRoot });
}

export function uninstallClaudeStatusline({ home, packageRoot }) {
  if (!home) throw new TypeError("home es obligatorio");
  if (!packageRoot) throw new TypeError("packageRoot es obligatorio");
  const settingsPath = settingsPathFor({ home });
  rechazarEnlace(settingsPath, "settings");
  if (!existsSync(settingsPath)) return { settingsPath, removed: false };
  const expectedCommand = statuslineCommandFor({ packageRoot });
  const settings = leerSettings(settingsPath);
  const actual = settings.statusLine;
  if (actual === undefined || actual === null) return { settingsPath, removed: false };
  if (!esNuestra(actual, expectedCommand)) {
    throw new Error(`Refusing to remove foreign statusLine at ${settingsPath}`);
  }
  const { statusLine: _fuera, ...resto } = settings;
  if (Object.keys(resto).length === 0) {
    rmSync(settingsPath);
    return { settingsPath, removed: true, cleaned: true };
  }
  escribirSettings(settingsPath, resto);
  return { settingsPath, removed: true, cleaned: false };
}
