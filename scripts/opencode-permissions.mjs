import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

function normalizedRulePath(path, project) {
  const value = String(path).trim().replace(/^['"`]|['"`]$/g, "");
  if (!value) return null;
  const native = value.replace(/[\\/]+/g, sep);
  const full = isAbsolute(native) ? resolve(native) : resolve(project, native);
  return `${full.replace(/[\\/]+$/g, "")}/**`;
}

export function buildPermissions({ siblings = [], existing = {} } = {}) {
  const base = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
  const oldPermissions = base.permission && typeof base.permission === "object" && !Array.isArray(base.permission)
    ? base.permission : {};
  const oldExternal = oldPermissions.external_directory && typeof oldPermissions.external_directory === "object"
    ? oldPermissions.external_directory : {};
  const external = { ...oldExternal };
  for (const sibling of siblings) {
    if (!sibling) continue;
    const key = String(sibling).endsWith("/**") ? String(sibling) : `${String(sibling).replace(/[\\/]+$/g, "")}/**`;
    if (external[key] !== "deny") external[key] = "allow";
  }
  if (!Object.hasOwn(external, "*")) external["*"] = "deny";
  return { ...base, permission: { ...oldPermissions, external_directory: external } };
}

function pathsFromRouting(text) {
  const paths = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((s) => s.trim().replace(/^`|`$/g, ""));
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    for (const cell of cells) {
      if (/^(?:[A-Za-z]:[\\/]|\\\\|\.{1,2}[\\/]|\/)/.test(cell)) paths.push(cell);
      else if (/[\\/]/.test(cell) && !/^(?:https?:|mailto:)/i.test(cell) && !/[.!?]\s/.test(cell)) paths.push(cell);
    }
  }
  return [...new Set(paths)];
}

function parseAllowArgs(values, project) {
  return values.map((value) => normalizedRulePath(value, project)).filter(Boolean);
}

export function opencodePermissions({ project = process.cwd(), fromRouting = false, allow = [], existing } = {}) {
  const root = resolve(project);
  let siblings = parseAllowArgs(allow, root);
  if (fromRouting) {
    const routingPath = join(root, "lore", "enrutamiento.md");
    if (!existsSync(routingPath)) throw new Error(`Routing file not found: ${routingPath}`);
    const routedTrees = pathsFromRouting(readFileSync(routingPath, "utf8")).map((path) => path.replace(/[\\/]lore[\\/]*$/i, ""));
    siblings = [...new Set([...siblings, ...parseAllowArgs(routedTrees, root)])];
  }
  const configPath = join(root, "opencode.json");
  let current = existing;
  if (current === undefined && existsSync(configPath)) {
    const raw = readFileSync(configPath, "utf8");
    try { current = JSON.parse(raw); }
    catch (error) { throw new Error(`Cannot merge ${configPath}: it is invalid JSON or JSONC (comments are unsupported). Proposed JSON follows:\n${JSON.stringify(buildPermissions({ siblings }), null, 2)}`, { cause: error }); }
  }
  return { root, configPath, siblings, proposed: buildPermissions({ siblings, existing: current }) };
}

export function writePermissions(options = {}) {
  const result = opencodePermissions(options);
  const serialized = `${JSON.stringify(result.proposed, null, 2)}\n`;
  if (existsSync(result.configPath) && readFileSync(result.configPath, "utf8") === serialized) return { ...result, written: false };
  mkdirSync(result.root, { recursive: true });
  const temporary = join(dirname(result.configPath), `.opencode-${randomUUID()}.tmp`);
  try {
    writeFileSync(temporary, serialized, { flag: "wx" });
    renameSync(temporary, result.configPath);
  } finally {
    if (existsSync(temporary)) {
      try { (awaitImportRemoveSync)(temporary); } catch {}
    }
  }
  return { ...result, written: true };
}

// Assigned through a tiny indirection so this module keeps filesystem operations explicit.
import { unlinkSync as awaitImportRemoveSync } from "node:fs";

const BASH_DENY = ["rm *", "del *", "rmdir *", "rd *", "mv *", "move *", "git push*", "git commit*", "git reset*", "git checkout*", "git clean*", "curl *", "wget *", "powershell*", "pwsh*", "cmd*", "npm publish*", "npm install*", "npx *", "sudo *"];

export function sandboxConfig() {
  const bash = { "*": "allow" };
  for (const pattern of BASH_DENY) bash[pattern] = "deny";
  return { permission: { external_directory: "deny", edit: "allow", webfetch: "allow", bash } };
}

export function sandboxEnv(dir) {
  const temp = join(resolve(dir), "tmp");
  return { TEMP: temp, TMP: temp, TMPDIR: temp };
}

export function writeSandbox(dir) {
  const root = resolve(dir);
  mkdirSync(join(root, "tmp"), { recursive: true });
  const path = join(root, "opencode.json");
  const serialized = `${JSON.stringify(sandboxConfig(), null, 2)}\n`;
  if (!existsSync(path) || readFileSync(path, "utf8") !== serialized) {
    const temporary = join(root, `.opencode-${randomUUID()}.tmp`);
    try { writeFileSync(temporary, serialized, { flag: "wx" }); renameSync(temporary, path); }
    finally { if (existsSync(temporary)) awaitImportRemoveSync(temporary); }
  }
  return { root, path, env: sandboxEnv(root), command: 'opencode run "MESSAGE" -f "FILE" < /dev/null (PowerShell: < NUL)' };
}
