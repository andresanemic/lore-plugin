import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildPermissions, sandboxConfig, sandboxEnv, opencodePermissions } from "./opencode-permissions.mjs";

const root = resolve(import.meta.dirname, "..");
const cli = join(root, "scripts", "lore-plugin.mjs");
const temp = () => mkdtempSync(join(tmpdir(), "lore-opencode-test-"));

test("from-routing permits two routed siblings including spaces and Windows separators", () => {
  const project = temp();
  try {
    const one = join(project, "..", "Area One");
    const two = join(project, "..", "Project Two");
    mkdirSync(join(project, "lore"), { recursive: true });
    writeFileSync(join(project, "lore", "enrutamiento.md"), `| Fuente | Ruta |\n|---|---|\n| area | ../Area One/lore |\n| proyecto | ..\\Project Two\\lore |\n`);
    const result = opencodePermissions({ project, fromRouting: true });
    assert.deepEqual(result.proposed.permission.external_directory, {
      [resolve(one) + "/**"]: "allow",
      [resolve(two) + "/**"]: "allow",
      "*": "deny",
    });
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("from-routing never turns project prose into permissions outside the project", () => {
  const project = temp();
  try {
    const escapes = [
      "C:/Users/andre/.ssh",
      "c:\\Users\\andre\\.ssh",
      "\\\\servidor\\recurso",
      "~/.ssh",
      "~\\.ssh",
      "/etc",
      "/Users/andre/.ssh",
      "../../../../Windows",
      "area/../../../../etc",
      "$HOME/.ssh",
      "%USERPROFILE%/.ssh",
    ];
    const cells = escapes.map((value) => `| \`${value}\` |`).join("\n");
    mkdirSync(join(project, "lore"), { recursive: true });
    writeFileSync(join(project, "lore", "enrutamiento.md"), `| Fuente | Ruta |\n|---|---|\n${cells}\n| area | ../Vecina/lore |\n`);
    const result = opencodePermissions({ project, fromRouting: true });
    const external = result.proposed.permission.external_directory;
    const hive = resolve(project, "..");
    const allowed = Object.entries(external).filter(([key, value]) => value === "allow").map(([key]) => key);
    assert.equal(external["*"], "deny", "the wildcard stays denied");
    assert.ok(allowed.length <= 1, `only the sibling may be allowed, got ${JSON.stringify(allowed)}`);
    for (const key of allowed) {
      const target = resolve(key.replace(/[\\/]\*\*$/, ""));
      const insideHive = target === hive || target.startsWith(`${hive}${sep}`);
      assert.ok(insideHive, `${key} resolves outside the hive ${hive}`);
    }
    const serialized = JSON.stringify(result.proposed);
    for (const value of escapes) assert.ok(!serialized.includes(value.replace(/\\/g, "\\\\")), `leaked ${value}`);
    assert.doesNotMatch(serialized, /\.ssh/);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("from-routing keeps prose that names a file, not a path, out of the permissions", () => {
  const project = temp();
  try {
    mkdirSync(join(project, "lore"), { recursive: true });
    writeFileSync(join(project, "lore", "enrutamiento.md"), "| Fuente | Ruta |\n|---|---|\n| nota | un archivo con guion - no es una ruta |\n| web | https://example.com/x |\n| vecina | ../Vecina/lore |\n");
    const result = opencodePermissions({ project, fromRouting: true });
    assert.deepEqual(result.proposed.permission.external_directory, {
      [resolve(project, "..", "Vecina") + "/**"]: "allow",
      "*": "deny",
    });
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("permission fusion preserves other keys and never widens existing deny", () => {
  const existing = { model: "x", permission: { edit: "allow", external_directory: { "C:/private/**": "deny", "*": "deny" } } };
  const got = buildPermissions({ siblings: ["C:/private", "C:/routed"], existing });
  assert.equal(got.model, "x");
  assert.equal(got.permission.edit, "allow");
  assert.equal(got.permission.external_directory["C:/private/**"], "deny");
  assert.equal(got.permission.external_directory["C:/routed/**"], "allow");
  assert.equal(got.permission.external_directory["*"], "deny");
});

test("--write is atomic and idempotent byte for byte", () => {
  const project = temp();
  try {
    mkdirSync(join(project, "lore"));
    writeFileSync(join(project, "lore", "enrutamiento.md"), "| ruta |\n|---|\n| ../Neighbor/lore |\n");
    const fakeHome = join(project, "fake-home");
    const globalConfig = join(fakeHome, ".config", "opencode", "opencode.json");
    mkdirSync(join(fakeHome, ".config", "opencode"), { recursive: true });
    const globalBytes = '{"globalMarker":"must stay untouched"}\n';
    writeFileSync(globalConfig, globalBytes);
    const run = () => spawnSync(process.execPath, [cli, "opencode-permissions", "--project", project, "--from-routing", "--write"], { encoding: "utf8", env: { ...process.env, HOME: fakeHome, USERPROFILE: fakeHome, XDG_CONFIG_HOME: join(fakeHome, ".config"), APPDATA: join(fakeHome, "AppData", "Roaming") } });
    const a = run(); assert.equal(a.status, 0, a.stderr);
    const path = join(project, "opencode.json"); const bytes1 = readFileSync(path);
    const b = run(); assert.equal(b.status, 0, b.stderr);
    assert.deepEqual(readFileSync(path), bytes1);
    assert.deepEqual(readdirSync(project).filter((n) => n.includes("tmp") || n.endsWith(".tmp")), []);
    assert.equal(readFileSync(globalConfig, "utf8"), globalBytes);
    assert.doesNotMatch(readFileSync(path, "utf8"), /globalMarker/);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("invalid JSON and JSONC are not written and report a proposed JSON", () => {
  for (const source of ["not json", "{ // comment\n \"model\": \"x\" }"]) {
    const project = temp();
    try {
      writeFileSync(join(project, "opencode.json"), source);
      const result = spawnSync(process.execPath, [cli, "opencode-permissions", "--project", project, "--write"], { encoding: "utf8" });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr + result.stdout, /JSON|comentarios|comments/i);
      assert.equal(readFileSync(join(project, "opencode.json"), "utf8"), source);
      assert.match(result.stdout, /"external_directory"/);
    } finally { rmSync(project, { recursive: true, force: true }); }
  }
});

test("default proposes deny-all, --allow adds paths, and sandbox writes safe profile", async () => {
  const project = temp(); const box = join(project, "delegate");
  try {
    const result = spawnSync(process.execPath, [cli, "opencode-permissions", "--project", project], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout.slice(0, result.stdout.indexOf("\nWould write"))).permission.external_directory, { "*": "deny" });
    const allowed = spawnSync(process.execPath, [cli, "opencode-permissions", "--project", project, "--allow", "../Neighbor Tree"], { encoding: "utf8" });
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.match(allowed.stdout, /Neighbor Tree/);
    const config = sandboxConfig();
    const patterns = ["rm *", "del *", "rmdir *", "rd *", "mv *", "move *", "git push*", "git commit*", "git reset*", "git checkout*", "git clean*", "curl *", "wget *", "powershell*", "pwsh*", "cmd*", "npm publish*", "npm install*", "npx *", "sudo *"];
    assert.equal(config.permission.external_directory, "deny");
    assert.equal(config.permission.edit, "allow");
    assert.equal(config.permission.webfetch, "allow");
    assert.equal(config.permission.bash["*"], "allow");
    for (const pattern of patterns) assert.equal(config.permission.bash[pattern], "deny", pattern);
    assert.deepEqual(sandboxEnv(box), { TEMP: join(box, "tmp"), TMP: join(box, "tmp"), TMPDIR: join(box, "tmp") });
    const run = spawnSync(process.execPath, [cli, "opencode-sandbox", box, "--json"], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(await readFile(join(box, "opencode.json"), "utf8")), config);
    assert.ok(existsSync(join(box, "tmp")));
    assert.deepEqual(JSON.parse(run.stdout).env, sandboxEnv(box));
    assert.match(run.stdout, /opencode run [^\n]+ -f /);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("permission helpers are pure and the module does not import child_process", async () => {
  const source = await readFile(new URL("./opencode-permissions.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /from\s+["']node:child_process|import\s*\(\s*["']node:child_process/);
  const project = temp();
  try { buildPermissions({ siblings: [], existing: {} }); sandboxConfig(); sandboxEnv(project); }
  finally { rmSync(project, { recursive: true, force: true }); }
});
