import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { EXPECTED_VERSION, KERNEL_FILES, formatReport, hashTree, fingerprintHost, saveFingerprint, compareFingerprint, verifyHosts } from "./rc8-verificar-hosts.mjs";

const temporary = [];
const retired = "obsidian-lore";
const skills = ["brainstorming-lore", "create-area", "create-bot", "create-project", "save-to-lore", "transmute-lore", "use-lore", "vespi"];
const sourceCommit = "a".repeat(40);
const branchHead = "b".repeat(40);

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
  put(join(kitRoot, "skills", "vespi", "core", "kernel", "SOURCE.md"), "Fixed copy of the Vespi kernel **0.1.4** inside Lore Plugin **2.4.9**. Canonical source: `src/`, branch `release/0.1.4-prep`, commit `" + sourceCommit + "`.\n");
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
    if (args[0] === "rev-parse") return branchHead;
    assert.equal(args[1].split(":")[0], sourceCommit);
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
  assert.equal(report.kernelSourceCommit, sourceCommit);
  assert.equal(report.kernelBranch, "release/0.1.4-prep");
  assert.equal(report.sourcePinned, null, "sin --kernel-head no se impone un SHA de rama");
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

test("rechaza skills instaladas cuyo árbol difiere del kit aunque estén todas presentes", () => {
  const f = fixture();
  put(join(f.codex, "skills", "use-lore", "SKILL.md"), "---\nname: use-lore\n---\nRC8 content\n");
  const report = verifyHosts({ home: f.home, kitRoot: f.kitRoot, canonicalKernelRoot: "fake-kernel", gitShow: f.gitShow });
  const codex = report.hosts.find((host) => host.name === "Codex");
  assert.equal(codex.missingSkills.length, 0);
  assert.equal(codex.matchesSkills, false);
  assert.equal(report.ok, false);
});

test("contrasta opcionalmente la rama kernel con --kernel-head", () => {
  const f = fixture();
  const ok = verifyHosts({ home: f.home, kitRoot: f.kitRoot, canonicalKernelRoot: "fake-kernel", gitShow: f.gitShow, kernelHead: branchHead });
  assert.equal(ok.sourcePinned, true);
  const moved = verifyHosts({ home: f.home, kitRoot: f.kitRoot, canonicalKernelRoot: "fake-kernel", gitShow: f.gitShow, kernelHead: "c".repeat(40) });
  assert.equal(moved.ok, false);
  assert.equal(moved.sourcePinned, false);
});

test("permite aprobar un host individual durante la instalación escalonada", () => {
  const f = fixture();
  const report = verifyHosts({ home: f.home, kitRoot: f.kitRoot, canonicalKernelRoot: "fake-kernel", gitShow: f.gitShow, host: "Codex" });
  assert.equal(report.hosts.length, 1);
  assert.equal(report.hosts[0].name, "Codex");
  assert.equal(report.ok, true, formatReport(report));
});

test("lee el commit fijado desde SOURCE.md para cotejar los cuerpos del kernel", () => {
  const f = fixture();
  put(join(f.claude, "package.json"), JSON.stringify({ version: "2.4.9-rc.7" }));
  const report = verifyHosts({
    home: f.home,
    kitRoot: f.kitRoot,
    canonicalKernelRoot: "fake-kernel",
    gitShow: (_root, args) => args[0] === "rev-parse" ? "otro-commit" : f.gitShow(_root, args),
  });
  assert.equal(report.ok, false);
  assert.equal(report.kernelSourceCommit, sourceCommit);
  assert.equal(report.hosts.find((host) => host.name === "Claude Code").version, "2.4.9-rc.7");
});

test("la huella contiene el árbol de skills, kernel vendorizado y cuerpo de use-lore", () => {
  const f = fixture();
  const useLore = "---\nname: use-lore\n---\n  body exacto\n";
  put(join(f.kitRoot, "skills", "use-lore", "SKILL.md"), useLore);
  for (const root of [f.codex, f.claude]) put(join(root, "skills", "use-lore", "SKILL.md"), readFileSync(join(f.kitRoot, "skills", "use-lore", "SKILL.md")));
  put(join(f.opencodeSkills, "use-lore", "SKILL.md"), readFileSync(join(f.kitRoot, "skills", "use-lore", "SKILL.md")));
  const fingerprint = fingerprintHost(f.home, "Codex", f.kitRoot);
  assert.match(fingerprint.skillsTreeSha256, /^[a-f0-9]{64}$/);
  assert.match(fingerprint.vendoredKernelTreeSha256, /^[a-f0-9]{64}$/);
  assert.equal(fingerprint.useLoreBodySha256, fingerprintHost(f.home, "Claude Code", f.kitRoot).useLoreBodySha256);
  assert.match(fingerprint.useLoreBodySha256, /^[a-f0-9]{64}$/);
  assert.equal(fingerprint.useLoreBodySha256, createHash("sha256").update("  body exacto\n").digest("hex"));
});

test("la huella guardada se puede comparar y detecta cambios por host", () => {
  const f = fixture();
  const before = fingerprintHost(f.home, "Codex", f.kitRoot);
  const file = join(f.home, "codex-fingerprint.json");
  saveFingerprint(file, before);
  assert.equal(compareFingerprint(file, before).matches, true);
  const after = { ...before, useLoreBodySha256: "0".repeat(64) };
  assert.equal(compareFingerprint(file, after).matches, false);
});

test("la CLI guarda y compara huellas sin exigir que los otros hosts estén instalados", () => {
  const home = mkdtempSync(join(tmpdir(), "lore-fingerprint-home-"));
  temporary.push(home);
  const file = join(home, "opencode-before.json");
  const args = ["scripts/rc8-verificar-hosts.mjs", "--home", home, "--fingerprint-host", "OpenCode"];
  const saved = spawnSync(process.execPath, [...args, "--fingerprint-out", file], { encoding: "utf8" });
  assert.equal(saved.status, 0, saved.stderr);
  assert.match(saved.stdout, /Fingerprint saved:/);
  const compared = spawnSync(process.execPath, [...args, "--fingerprint-compare", file], { encoding: "utf8" });
  assert.equal(compared.status, 0, compared.stderr);
  assert.match(compared.stdout, /Fingerprint OpenCode: COINCIDE/);
});
