#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bodyAfterHeader, declaredBranch, declaredCommit, kernelDirOf, kernelModules } from "./kernel-inventory.mjs";

export const EXPECTED_VERSION = "2.4.9";
export const EXPECTED_KERNEL_VERSION = "0.1.4";
export const RETIRED_SKILLS = ["obsidian-lore"];

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// La lista de módulos no se escribe: es la del directorio vendorizado que este kit trae. Cuando el
// kernel gana un módulo, el vendorizado lo trae y el verificador lo comprueba, sin que nadie edite
// una lista en dos archivos distintos y se olvide de la otra.
export const KERNEL_FILES = kernelModules(kernelDirOf(scriptRoot));

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function skillNames(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
}

export function hashTree(root) {
  if (!existsSync(root)) return { digest: null, files: {} };
  const files = {};
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files[path.slice(root.length + 1).replaceAll("\\", "/")] = sha256(readFileSync(path));
    }
  }
  walk(root);
  const hash = createHash("sha256");
  for (const path of Object.keys(files).sort()) {
    hash.update(path);
    hash.update("\0");
    hash.update(readFileSync(join(root, ...path.split("/"))));
    hash.update("\n");
  }
  return { digest: hash.digest("hex"), files };
}

function installedHosts(home) {
  const installedManifest = join(home, ".claude", "plugins", "installed_plugins.json");
  let claudeRoot = null;
  if (existsSync(installedManifest)) {
    const entries = json(installedManifest).plugins?.["lore@lore-plugin"];
    if (Array.isArray(entries) && entries.length === 1 && typeof entries[0]?.installPath === "string") {
      claudeRoot = entries[0].installPath;
    }
  }
  return [
    { name: "OpenCode", packageRoot: null, versionReceiptPath: join(home, ".config", "opencode", "lore-plugin.json"), skillsRoot: join(home, ".config", "opencode", "skills"), kernelRoot: join(home, ".config", "opencode", "skills", "vespi", "core", "kernel"), retiredRoots: [join(home, ".config", "opencode", "skills")], sharedSkills: true },
    { name: "Codex", packageRoot: join(home, ".agents", "plugins", "plugins", "lore"), skillsRoot: join(home, ".agents", "plugins", "plugins", "lore", "skills"), kernelRoot: join(home, ".agents", "plugins", "plugins", "lore", "skills", "vespi", "core", "kernel"), retiredRoots: [join(home, ".agents", "plugins", "plugins", "lore", "skills"), join(home, ".agents", "skills")] },
    { name: "Claude Code", packageRoot: claudeRoot, skillsRoot: claudeRoot ? join(claudeRoot, "skills") : null, kernelRoot: claudeRoot ? join(claudeRoot, "skills", "vespi", "core", "kernel") : null, retiredRoots: [claudeRoot ? join(claudeRoot, "skills") : null, join(home, ".claude", "skills")].filter(Boolean) },
  ];
}

function packageVersion(host) {
  if (host.versionReceiptPath && existsSync(host.versionReceiptPath)) return json(host.versionReceiptPath).version ?? "desconocida";
  if (host.packageRoot && existsSync(join(host.packageRoot, "package.json"))) return json(join(host.packageRoot, "package.json")).version ?? "desconocida";
  if (host.name === "OpenCode" && host.skillsRoot && existsSync(host.skillsRoot)) return "sin recibo de versión";
  return "no instalada";
}

function installedKernelVersion(host) {
  if (host.versionReceiptPath && existsSync(host.versionReceiptPath)) return json(host.versionReceiptPath).kernelVersion ?? "desconocida";
  const sourcePath = host.kernelRoot && join(host.kernelRoot, "SOURCE.md");
  if (!sourcePath || !existsSync(sourcePath)) return "no instalada";
  return readFileSync(sourcePath, "utf8").match(/Vespi kernel \*\*(\d+\.\d+\.\d+)/)?.[1] ?? "desconocida";
}

function sourceBodies(canonicalRoot, gitShow, kernelFiles, kernelDir) {
  const provenance = readFileSync(join(kernelDir, "SOURCE.md"), "utf8");
  const branch = declaredBranch(provenance);
  const commit = declaredCommit(provenance);
  if (!branch || !commit) throw new Error("SOURCE.md must declare a kernel branch and 40-character commit");
  const head = gitShow(canonicalRoot, ["rev-parse", branch]).trim();
  const results = {};
  for (const file of kernelFiles) {
    const canonical = gitShow(canonicalRoot, ["show", `${commit}:src/${file}`]);
    results[file] = { hash: sha256(canonical) };
  }
  return { head, branch, commit, results };
}

export function verifyHosts({ home = homedir(), kitRoot = scriptRoot, canonicalKernelRoot = "C:/Claude/founder/proyectos/vespi/kernel", kernelHead = null, host: hostName = null, gitShow = (cwd, args) => execFileSync("git", ["-C", cwd, ...args], { encoding: args[0] === "show" ? "buffer" : "utf8" }) } = {}) {
  const expectedSkills = skillNames(join(kitRoot, "skills"));
  const expectedSkillsSha256 = selectedSkillsDigest(join(kitRoot, "skills"), expectedSkills);
  const kernelFiles = kernelModules(kernelDirOf(kitRoot));
  const expectedKernel = hashTree(kernelDirOf(kitRoot));
  const source = sourceBodies(canonicalKernelRoot, gitShow, kernelFiles, kernelDirOf(kitRoot));
  const availableHosts = installedHosts(resolve(home));
  if (hostName && !availableHosts.some((host) => host.name === hostName)) {
    throw new Error(`Unknown host: ${hostName}; expected ${availableHosts.map((host) => host.name).join(", ")}`);
  }
  const hosts = availableHosts.filter((host) => !hostName || host.name === hostName).map((host) => {
    const version = host.packageRoot || host.name === "OpenCode" ? packageVersion(host) : "no instalada";
    const kernelVersion = installedKernelVersion(host);
    const kernel = host.kernelRoot ? hashTree(host.kernelRoot) : { digest: null, files: {} };
    const presentSkills = host.skillsRoot ? skillNames(host.skillsRoot) : [];
    const relevantPresent = host.sharedSkills
      ? expectedSkills.filter((name) => presentSkills.includes(name))
      : presentSkills;
    const installedSkillsSha256 = host.skillsRoot ? selectedSkillsDigest(host.skillsRoot, expectedSkills) : null;
    const matchesSkills = installedSkillsSha256 !== null && installedSkillsSha256 === expectedSkillsSha256;
    const missingSkills = expectedSkills.filter((name) => !presentSkills.includes(name));
    const retiredPresent = RETIRED_SKILLS.filter((name) => (host.retiredRoots ?? [host.skillsRoot]).some((root) => root && existsSync(join(root, name))));
    const unexpectedSkills = host.sharedSkills ? [] : presentSkills.filter((name) => !expectedSkills.includes(name));
    const matchesRepo = kernel.digest !== null && kernel.digest === expectedKernel.digest;
    const sourceMatches = Object.fromEntries(kernelFiles.map((file) => {
      const installed = host.kernelRoot && existsSync(join(host.kernelRoot, file))
        ? readFileSync(join(host.kernelRoot, file))
        : Buffer.alloc(0);
      return [file, !!host.kernelRoot && sha256(bodyAfterHeader(installed)) === source.results[file].hash];
    }));
    return { ...host, version, kernelVersion, kernel, matchesRepo, installedSkillsSha256, matchesSkills, presentSkills: relevantPresent, missingSkills, retiredPresent, unexpectedSkills, sourceMatches };
  });

  const firstKernel = hosts[0].kernel;
  const hostsAgree = hostName ? hosts[0].kernel.digest !== null : firstKernel.digest !== null && hosts.every((host) => host.kernel.digest === firstKernel.digest);
  const sourcePinned = kernelHead === null ? null : source.head === kernelHead;
  const ok = (sourcePinned !== false) && hosts.every((host) => host.version === EXPECTED_VERSION
    && host.kernelVersion === EXPECTED_KERNEL_VERSION && host.matchesRepo && host.matchesSkills && host.missingSkills.length === 0 && host.retiredPresent.length === 0
    && Object.values(host.sourceMatches).every(Boolean)) && hostsAgree;
  return { ok, kitVersion: json(join(kitRoot, "package.json")).version, expectedSkills, expectedSkillsSha256, expectedKernel, kernelFiles, canonicalHead: source.head, kernelBranch: source.branch, kernelBranchHead: kernelHead, kernelSourceCommit: source.commit, sourcePinned, hostsAgree, hosts };
}

function selectedSkillsDigest(root, names) {
  if (!root) return null;
  const hash = createHash("sha256");
  for (const name of names) {
    const tree = hashTree(join(root, name));
    hash.update(name);
    hash.update("\0");
    for (const [path, digest] of Object.entries(tree.files).sort(([a], [b]) => a.localeCompare(b))) {
      hash.update(path);
      hash.update("\0");
      hash.update(readFileSync(join(root, name, ...path.split("/"))));
      hash.update("\n");
    }
  }
  return hash.digest("hex");
}

export function fingerprintHost(home, name, kitRoot = scriptRoot) {
  const host = installedHosts(resolve(home)).find((item) => item.name === name);
  if (!host) throw new Error(`Unknown host: ${name}`);
  const expectedSkills = skillNames(join(kitRoot, "skills"));
  const skillTreeSha256 = selectedSkillsDigest(host.skillsRoot, expectedSkills);
  const kernel = host.kernelRoot ? hashTree(host.kernelRoot) : { digest: null };
  const useLorePath = host.skillsRoot && join(host.skillsRoot, "use-lore", "SKILL.md");
  let bodyHash = null;
  if (useLorePath && existsSync(useLorePath)) {
    const text = readFileSync(useLorePath, "utf8");
    const frontMatter = text.match(/^---\r?\n[\s\S]*?^---\r?\n/m);
    bodyHash = sha256(Buffer.from(frontMatter ? text.slice(frontMatter[0].length) : text, "utf8"));
  }
  return {
    schema: 1,
    host: name,
    skillsTreeSha256: skillTreeSha256,
    vendoredKernelTreeSha256: kernel.digest,
    useLoreBodySha256: bodyHash,
  };
}

export function saveFingerprint(path, fingerprint) {
  writeFileSync(resolve(path), JSON.stringify(fingerprint, null, 2) + "\n", "utf8");
  return resolve(path);
}

export function compareFingerprint(path, fingerprint) {
  const previous = json(resolve(path));
  return { matches: JSON.stringify(previous) === JSON.stringify(fingerprint), previous };
}

export function formatReport(report) {
  const lines = [`Host verification. Kit ${report.kitVersion}; ${report.kernelBranch} head ${report.canonicalHead}; source snapshot ${report.kernelSourceCommit}.`, report.kernelBranchHead ? `Kernel source head matches --kernel-head: ${report.sourcePinned ? "sí" : "NO"}.` : "Kernel source head: comparación omitida (usa --kernel-head para exigirla)."];
  for (const host of report.hosts) {
    lines.push(`\n${host.name}: versión ${host.version}; kernel ${host.kernelVersion}; SHA-256 de árbol ${host.kernel.digest ?? "ausente"}; coincide con kit ${host.matchesRepo ? "sí" : "NO"}.`);
    for (const [file, hash] of Object.entries(host.kernel.files)) lines.push(`  ${file}: ${hash}`);
    lines.push(`  skills presentes/esperadas: ${host.presentSkills.join(", ") || "ninguna"} / ${report.expectedSkills.join(", ")}`);
    lines.push(`  SHA-256 del árbol de skills esperado: ${report.expectedSkillsSha256}; coincide con kit: ${host.matchesSkills ? "sí" : "NO"}`);
    lines.push(`  skills faltantes: ${host.missingSkills.join(", ") || "ninguna"}; retiradas: ${host.retiredPresent.join(", ") || "ninguna"}${host.unexpectedSkills.length ? `; ajenas en raíz administrada: ${host.unexpectedSkills.join(", ")}` : ""}`);
    lines.push(`  módulos con cuerpo idéntico al kernel: ${Object.entries(host.sourceMatches).filter(([, ok]) => ok).map(([file]) => file).join(", ") || "ninguno"}`);
    lines.push(`  módulos distintos o no leídos: ${Object.entries(host.sourceMatches).filter(([, ok]) => !ok).map(([file]) => file).join(", ") || "ninguno"}`);
  }
  lines.push(`\n${report.hosts.length === 1 ? "La copia vendorizada de este host coincide con el kit" : "Las tres copias vendorizadas coinciden entre sí"}: ${report.hostsAgree ? "sí" : "NO"}. Resultado: ${report.ok ? "APROBADO" : "RECHAZADO"}.`);
  return lines.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node scripts/rc8-verificar-hosts.mjs [--home <ruta>] [--kernel-source <raíz>] [--kernel-head <sha>] [--host <OpenCode|Codex|Claude Code>] [--fingerprint-host <OpenCode|Codex|Claude Code>] [--fingerprint-out <archivo>|--fingerprint-compare <archivo>]");
    process.exit(0);
  }
  let home = homedir();
  let canonicalKernelRoot = "C:/Claude/founder/proyectos/vespi/kernel";
  let kernelHead = null;
  let fingerprintHostName = null;
  let fingerprintOut = null;
  let fingerprintCompare = null;
  let host = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--home" && args[i + 1]) home = args[++i];
    else if (args[i] === "--kernel-source" && args[i + 1]) canonicalKernelRoot = args[++i];
    else if (args[i] === "--kernel-head" && args[i + 1]) kernelHead = args[++i];
    else if (args[i] === "--fingerprint-host" && args[i + 1]) fingerprintHostName = args[++i];
    else if (args[i] === "--fingerprint-out" && args[i + 1]) fingerprintOut = args[++i];
    else if (args[i] === "--fingerprint-compare" && args[i + 1]) fingerprintCompare = args[++i];
    else if (args[i] === "--host" && args[i + 1]) host = args[++i];
    else { console.error(`Argumento no reconocido: ${args[i]}`); process.exit(2); }
  }
  try {
    if (fingerprintOut || fingerprintCompare) {
      if (!fingerprintHostName) throw new Error("--fingerprint-out y --fingerprint-compare requieren --fingerprint-host");
      const current = fingerprintHost(home, fingerprintHostName);
      if (fingerprintOut) console.log(`Fingerprint saved: ${saveFingerprint(fingerprintOut, current)}`);
      if (fingerprintCompare) {
        const comparison = compareFingerprint(fingerprintCompare, current);
        console.log(`Fingerprint ${fingerprintHostName}: ${comparison.matches ? "COINCIDE" : "DIFIERE"}`);
        if (!comparison.matches) console.log(`Anterior: ${JSON.stringify(comparison.previous)}\nActual:   ${JSON.stringify(current)}`);
        process.exit(comparison.matches ? 0 : 1);
      }
      process.exit(0);
    }
    const report = verifyHosts({ home, canonicalKernelRoot, kernelHead, host });
    console.log(formatReport(report));
    process.exit(report.ok ? 0 : 1);
  } catch (error) {
    console.error(`Verificación incompleta: ${error.message}`);
    process.exit(1);
  }
}
