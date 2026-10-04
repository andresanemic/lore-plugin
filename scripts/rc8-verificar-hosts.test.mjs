import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { EXPECTED_VERSION, KERNEL_BRANCH_HEAD, KERNEL_FILES, formatReport, hashTree, verifyHosts } from "./rc8-verificar-hosts.mjs";

const temporary = [];
const retired = "obsidian-lore";
const skills = ["brainstorming-lore", "create-area", "create-bot", "create-project", "save-to-lore", "transmute-lore", "use-lore", "vespi"];

function put(path, content) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, content);
}

function fixture() {
  const home = mkdtempSync(join(tmpdir(), "lore-rc8-verify-"));
  temporary.push(home);
  const kitRoot = join(home, "kit");
  put(join(kitRoot, "package.json"), JSON.stringify({ version: EXPECTED_VERSION }));
  const canonical = {};
  for (const skill of skills) {
    put(join(kitRoot, "skills", skill, "SKILL.md"), `---\nname: ${skill}\n---\n`);
  }
  put(join(kitRoot, "skills", "vespi", "core", "kernel", "SOURCE.md"), "Fixed copy of the Vespi kernel **0.1.4** inside Lore Plugin **2.4.9**.\n");
  put(join(kitRoot, "skills", "vespi", "core", "kernel", "package.json"), '{"type":"commonjs"}\n');
  for (const file of KERNEL_FILES) {
    canonical[file] = Buffer.from(`canonical ${file}\n`);
    put(join(kitRoot, "skills", "vespi", "core", "kernel", file), `// provenance one\n// provenance two\n// provenance three\n${canonical[file]}`);
  }
  const codex = join(home, ".agents", "plugins", "plugins", "lore");
  const claude = join(home, ".claude", "plugins", "cache", "lore", "2.4.9");
  for (const root of [codex, claude]) {
    for (const skill of skills) put(join(root, "skills", skill, "SKILL.md"), readFileSync(join(kitRoot, "skills", skill, "SKILL.md")));
    for (const file of [...KERNEL_FILES, "SOURCE.md", "package.json"]) {
      put(join(root, "skills", "vespi", "core", "kernel", file), readFileSync(join(kitRoot, "skills", "vespi", "core", "kernel", file)));
    }
    put(join(root, "package.json"), JSON.stringify({ version: EXPECTED_VERSION }));
  }
  put(join(home, ".claude", "plugins", "installed_plugins.json"), JSON.stringify({ plugins: { "lore@lore-plugin": [{ installPath: claude }] } }));
  const opencodeSkills = join(home, ".config", "opencode", "skills");
  put(join(home, ".config", "opencode", "lore-plugin.json"), JSON.stringify({ name: "@andresanemic/lore-plugin", version: EXPECTED_VERSION, kernelVersion: "0.1.4" }));
  for (const skill of skills) put(join(opencodeSkills, skill, "SKILL.md"), readFileSync(join(kitRoot, "skills", skill, "SKILL.md")));
  for (const file of [...KERNEL_FILES, "SOURCE.md", "package.json"]) {
    put(join(opencodeSkills, "vespi", "core", "kernel", file), readFileSync(join(kitRoot, "skills", "vespi", "core", "kernel", file)));
  }
  const gitShow = (_root, args) => {
    if (args[0] === "rev-parse") return KERNEL_BRANCH_HEAD;
    const file = args[1].split(":src/")[1];
    return canonical[file];
  };
  return { home, kitRoot, gitShow, codex, claude, opencodeSkills };
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

test("verifica en modo solo lectura versión, kernel igual en los tres hosts y skills esperadas", () => {
  const f = fixture();
  const before = [hashTree(f.home).digest, hashTree(f.kitRoot).digest];
  const report = verifyHosts({ home: f.home, kitRoot: f.kitRoot, canonicalKernelRoot: "fake-kernel", gitShow: f.gitShow });
  assert.equal(report.ok, true, formatReport(report));
  assert.equal(report.hostsAgree, true);
  assert.deepEqual(report.hosts.map((host) => host.version), [EXPECTED_VERSION, EXPECTED_VERSION, EXPECTED_VERSION]);
  assert.deepEqual(report.hosts.map((host) => host.missingSkills), [[], [], []]);
  assert.ok(report.hosts.every((host) => Object.values(host.sourceMatches).every(Boolean)));
  assert.deepEqual([hashTree(f.home).digest, hashTree(f.kitRoot).digest], before, "verificar no debe escribir en hosts ni repositorio");
});

test("reporta kernel alterado, skill faltante y skill retirada presente", () => {
  const f = fixture();
  put(join(f.opencodeSkills, "vespi", "core", "kernel", "operation.js"), "alterado\n");
  rmSync(join(f.opencodeSkills, "save-to-lore"), { recursive: true, force: true });
  put(join(f.opencodeSkills, retired, "SKILL.md"), "retirada\n");
  const report = verifyHosts({ home: f.home, kitRoot: f.kitRoot, canonicalKernelRoot: "fake-kernel", gitShow: f.gitShow });
  const opencode = report.hosts[0];
  assert.equal(report.ok, false);
  assert.equal(opencode.matchesRepo, false);
  assert.deepEqual(opencode.missingSkills, ["save-to-lore"]);
  assert.deepEqual(opencode.retiredPresent, [retired]);
  assert.match(formatReport(report), /RECHAZADO/);
});

test("rechaza versión incorrecta y rama kernel que se movió", () => {
  const f = fixture();
  put(join(f.claude, "package.json"), JSON.stringify({ version: "2.4.9-rc.7" }));
  const report = verifyHosts({
    home: f.home,
    kitRoot: f.kitRoot,
    canonicalKernelRoot: "fake-kernel",
    gitShow: (_root, args) => args[0] === "rev-parse" ? "otro-commit" : f.gitShow(_root, args),
  });
  assert.equal(report.ok, false);
  assert.equal(report.sourcePinned, false);
  assert.equal(report.hosts.find((host) => host.name === "Claude Code").version, "2.4.9-rc.7");
});
