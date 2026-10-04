#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const EXPECTED_VERSION = "2.4.9";
export const EXPECTED_KERNEL_VERSION = "0.1.4";
export const KERNEL_BRANCH_HEAD = "f5e3c25f43ff2553615434ad8655a608abeb479c";
export const KERNEL_SOURCE_COMMIT = "fde2ee08789e3d30517148e224310faace7e488c";
export const KERNEL_FILES = ["authority.js", "continuity.js", "delegation.js", "operation.js", "receipt.js", "time.js"];
export const RETIRED_SKILLS = ["obsidian-lore"];

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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

function sourceBodies(canonicalRoot, gitShow) {
  const head = gitShow(canonicalRoot, ["rev-parse", "release/0.1.4-prep"]).trim();
  const results = {};
  for (const file of KERNEL_FILES) {
    const canonical = gitShow(canonicalRoot, ["show", `${KERNEL_SOURCE_COMMIT}:src/${file}`]);
    results[file] = { hash: sha256(canonical) };
  }
  return { head, results };
}

export function verifyHosts({ home = homedir(), kitRoot = scriptRoot, canonicalKernelRoot = "C:/Claude/founder/proyectos/vespi/kernel", gitShow = (cwd, args) => execFileSync("git", ["-C", cwd, ...args], { encoding: args[0] === "show" ? "buffer" : "utf8" }) } = {}) {
  const expectedSkills = skillNames(join(kitRoot, "skills"));
  const expectedKernel = hashTree(join(kitRoot, "skills", "vespi", "core", "kernel"));
  const source = sourceBodies(canonicalKernelRoot, gitShow);
  const hosts = installedHosts(resolve(home)).map((host) => {
    const version = host.packageRoot || host.name === "OpenCode" ? packageVersion(host) : "no instalada";
    const kernelVersion = installedKernelVersion(host);
    const kernel = host.kernelRoot ? hashTree(host.kernelRoot) : { digest: null, files: {} };
    const presentSkills = host.skillsRoot ? skillNames(host.skillsRoot) : [];
    const relevantPresent = host.sharedSkills
      ? expectedSkills.filter((name) => presentSkills.includes(name))
      : presentSkills;
    const missingSkills = expectedSkills.filter((name) => !presentSkills.includes(name));
    const retiredPresent = RETIRED_SKILLS.filter((name) => (host.retiredRoots ?? [host.skillsRoot]).some((root) => root && existsSync(join(root, name))));
    const unexpectedSkills = host.sharedSkills ? [] : presentSkills.filter((name) => !expectedSkills.includes(name));
    const matchesRepo = kernel.digest !== null && kernel.digest === expectedKernel.digest;
    const sourceMatches = Object.fromEntries(KERNEL_FILES.map((file) => {
      const installed = host.kernelRoot && existsSync(join(host.kernelRoot, file))
        ? readFileSync(join(host.kernelRoot, file))
        : Buffer.alloc(0);
      const marker = Buffer.from("\n", "utf8");
      let offset = 0;
      for (let line = 0; line < 3; line++) {
        const next = installed.indexOf(marker, offset);
        if (next < 0) { offset = installed.length; break; }
        offset = next + marker.length;
      }
      return [file, !!host.kernelRoot && sha256(installed.subarray(offset)) === source.results[file].hash];
    }));
    return { ...host, version, kernelVersion, kernel, matchesRepo, presentSkills: relevantPresent, missingSkills, retiredPresent, unexpectedSkills, sourceMatches };
  });

  const firstKernel = hosts[0].kernel;
  const hostsAgree = firstKernel.digest !== null && hosts.every((host) => host.kernel.digest === firstKernel.digest);
  const sourcePinned = source.head === KERNEL_BRANCH_HEAD;
  const ok = sourcePinned && hosts.every((host) => host.version === EXPECTED_VERSION
    && host.kernelVersion === EXPECTED_KERNEL_VERSION && host.matchesRepo && host.missingSkills.length === 0 && host.retiredPresent.length === 0
    && Object.values(host.sourceMatches).every(Boolean)) && hostsAgree;
  return { ok, kitVersion: json(join(kitRoot, "package.json")).version, expectedSkills, expectedKernel, canonicalHead: source.head, kernelBranchHead: KERNEL_BRANCH_HEAD, kernelSourceCommit: KERNEL_SOURCE_COMMIT, sourcePinned, hostsAgree, hosts };
}

export function formatReport(report) {
  const lines = [`RC8 host verification. Kit ${report.kitVersion}; release/0.1.4-prep ${report.kernelBranchHead}; source snapshot ${report.kernelSourceCommit}.`, `Kernel release/0.1.4-prep apunta al commit fijado: ${report.sourcePinned ? "sí" : "NO"}.`];
  for (const host of report.hosts) {
    lines.push(`\n${host.name}: versión ${host.version}; kernel ${host.kernelVersion}; SHA-256 de árbol ${host.kernel.digest ?? "ausente"}; coincide con kit ${host.matchesRepo ? "sí" : "NO"}.`);
    for (const [file, hash] of Object.entries(host.kernel.files)) lines.push(`  ${file}: ${hash}`);
    lines.push(`  skills presentes/esperadas: ${host.presentSkills.join(", ") || "ninguna"} / ${report.expectedSkills.join(", ")}`);
    lines.push(`  skills faltantes: ${host.missingSkills.join(", ") || "ninguna"}; retiradas: ${host.retiredPresent.join(", ") || "ninguna"}${host.unexpectedSkills.length ? `; ajenas en raíz administrada: ${host.unexpectedSkills.join(", ")}` : ""}`);
    lines.push(`  módulos con cuerpo idéntico al kernel: ${Object.entries(host.sourceMatches).filter(([, ok]) => ok).map(([file]) => file).join(", ") || "ninguno"}`);
    lines.push(`  módulos distintos o no leídos: ${Object.entries(host.sourceMatches).filter(([, ok]) => !ok).map(([file]) => file).join(", ") || "ninguno"}`);
  }
  lines.push(`\nLas tres copias vendorizadas coinciden entre sí: ${report.hostsAgree ? "sí" : "NO"}. Resultado: ${report.ok ? "APROBADO" : "RECHAZADO"}.`);
  return lines.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node scripts/rc8-verificar-hosts.mjs [--home <ruta>] [--kernel-source <raíz-del-repositorio-kernel>]");
    process.exit(0);
  }
  let home = homedir();
  let canonicalKernelRoot = "C:/Claude/founder/proyectos/vespi/kernel";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--home" && args[i + 1]) home = args[++i];
    else if (args[i] === "--kernel-source" && args[i + 1]) canonicalKernelRoot = args[++i];
    else { console.error(`Argumento no reconocido: ${args[i]}`); process.exit(2); }
  }
  try {
    const report = verifyHosts({ home, canonicalKernelRoot });
    console.log(formatReport(report));
    process.exit(report.ok ? 0 : 1);
  } catch (error) {
    console.error(`Verificación incompleta: ${error.message}`);
    process.exit(1);
  }
}
