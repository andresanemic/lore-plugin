#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { claudeCommands, claudePluginInstallPath, installClaude, installCodex, installOpenCode } from "./installer.mjs";
import { installClaudeStatuslineFromInstalledCopy, uninstallClaudeStatusline } from "./install-claude-statusline.mjs";
import { evaluateState, formatIntervention } from "../hooks/lore-guard.mjs";
import { claimAnnounce, unnamedBodies, readReceipt, snapshot, writeReceipt, RECEIPT } from "../hooks/lore-state.mjs";
import { DEFECTO_NIVEL, NIVELES, estado, estadoDir, marca } from "../hooks/lore-turno.mjs";
import { scanHygiene } from "./hygiene.mjs";

const args = process.argv.slice(2);
const command = args[0];
const targetIndex = args.indexOf("--target");
const target = targetIndex === -1 ? null : args[targetIndex + 1];
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

if (command === "statusline" && ["install", "uninstall"].includes(args[1])) {
  const home = homedir();
  const installedPackageRoot = claudePluginInstallPath({ home });
  const result = args[1] === "install"
    ? installClaudeStatuslineFromInstalledCopy({ home, installedPackageRoot })
    : uninstallClaudeStatusline({ home, packageRoot: installedPackageRoot });
  console.log(`Claude Code statusline ${args[1]} complete: ${result.settingsPath}.`);
  process.exit(0);
}

if (command === "crystallize") {
  const script = resolve(packageRoot, "skills/transmute-lore/scripts/crystallize.mjs");
  const result = spawnSync(process.execPath, [script, ...args.slice(1)], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

if (command === "hygiene") {
  const targetPath = args.slice(1).find((arg) => arg !== "--json") ?? process.cwd();
  const result = scanHygiene(resolve(targetPath));
  if (args.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const omittedLinks = result.notCovered.some((item) => item.why === "enlace no seguido");
    console.log(`${result.findings.length} hallazgos; cubiertas${omittedLinks ? " con omisiones" : ""}: ${result.coverage.join(", ")}; no cubiertas: ${result.notCovered.map((item) => `${item.class}${item.path ? ` ${item.path}` : ""} (${item.why})`).join("; ") || "ninguna"}.`);
    for (const finding of result.findings) console.log(`  ${finding.class}: ${finding.path} - ${finding.why}`);
    console.log("La higiene detecta y propone; no modifica archivos.");
  }
  process.exit(0);
}

// La CLI de la operación: una línea JSON por comando y nada simulado. Se carga
// por demanda para que el kernel de vespi solo se cargue cuando se lo pide.
if (command === "operation") {
  const { runOperationCli } = await import("./operation-cli.mjs");
  process.exit(await runOperationCli(args.slice(1), { stdout: process.stdout, stderr: process.stderr }));
}

// Registra que el barrido MYCELIUM corrió sobre este árbol. Es lo que cierra el
// bracket de salida: un hecho derivado del contenido del Lore, no una frase.
if (command === "mycelium") {
  if (!["receipt", "bodies", "announce", "federated"].includes(args[1])) {
    console.log("Usage: lore-plugin mycelium receipt   [--tree <dir>]");
    console.log("       lore-plugin mycelium bodies    [--tree <dir>]");
    console.log("       lore-plugin mycelium announce  [--tree <dir>]");
    console.log("       lore-plugin mycelium federated [--tree <dir>]");
    process.exit(2);
  }
  const treeIndex = args.indexOf("--tree");
  const tree = treeIndex === -1 ? process.cwd() : resolve(args[treeIndex + 1]);

  // ¿El cuerpo de criterio de este árbol se carga? Reporta datos, no veredicto: un
  // cuerpo no nombrado se repara conectándolo O declarándolo fuera del universo, y
  // cuál corresponde no lo sabe un recorrido de archivos.
  if (args[1] === "bodies") {
    const r = unnamedBodies(tree);
    if (!r.contract) {
      console.log(`No CLAUDE.md or AGENTS.md at ${tree} - nothing to compare the bodies against.`);
      process.exit(0);
    }
    const total = r.unnamed.length + r.unindexed.length;
    if (total === 0) {
      console.log(`${r.contract}: every core piece is named${r.hasBlock ? " in the always-on block" : ""}, and the index reaches every module.`);
    } else {
      for (const f of r.unnamed) console.log(`  not named by ${r.contract}: ${f}`);
      for (const f of r.unindexed) console.log(`  not named by lore/index.md: ${f}`);
      console.log("");
      console.log("Two repairs are possible and they are opposite: name it so it loads, or");
      console.log("declare it out of the universe in writing, with its reason. Decide each one.");
    }
    // Cobertura declarada: la frase de arriba es verdadera y mas estrecha de lo que
    // se lee. Dice que clase de objeto quedo fuera del universo, y ningun veredicto
    // sobre el: no afirma que falte una frontera, ni que este mal, ni que haya deuda.
    console.log("");
    console.log("Coverage: this walked contract -> index -> module and nothing else. It did not");
    console.log("ask what step runs any clue, and validity boundaries were never in its universe.");
    console.log("");
    console.log("This scan does not close the sweep: closing needs the full MYCELIUM pass (every clue gets a step, a junction written or declined with its reason) and then `mycelium receipt`.");
    process.exit(0);
  }
  // Chequeo federado: el always-on de un bot que federa árboles hermanos lleva la
  // regla del triplete (misma que verifica bots/scripts/verificar-triplete.mjs: la
  // palabra más la marca de hermano/no-inyecta). Reporta datos, no veredicto: en
  // rojo dice que la regla falta y sugiere transmute-lore UPGRADE. No exige cuerpos
  // literales —un bot empaquetado legítimo no tiene canon/—.
  if (args[1] === "federated") {
    const contract = ["CLAUDE.md", "AGENTS.md"].map((n) => join(tree, n)).find((p) => existsSync(p)) || null;
    if (!contract) {
      console.log(`No CLAUDE.md or AGENTS.md at ${tree} - nothing to check the federated load against.`);
      process.exit(0);
    }
    if (!existsSync(join(tree, "lore", "enrutamiento.md"))) {
      console.log(`No lore/enrutamiento.md at ${tree} - not a federated bot, nothing to check.`);
      process.exit(0);
    }
    const text = readFileSync(contract, "utf8");
    const block = (text.match(/<!-- lore:always-on -->([\s\S]*?)<!-- \/lore:always-on -->/) || [])[1] || "";
    const hasRule = /triplete/i.test(block)
      && /(hermano|no ancestro|no los inyecta|no lo inyecta)/i.test(block);
    if (hasRule) {
      console.log(`${contract}: federated load declares the triplete rule.`);
      console.log("This scan does not close the sweep: it checked one rule, not what step runs each clue. Closing needs the full MYCELIUM pass and then `mycelium receipt`.");
      process.exit(0);
    }
    console.log("  the always-on block does not declare the triplete rule for sibling trees");
    console.log("");
    console.log("Declare the rule or run transmute-lore UPGRADE.");
    console.log("This scan does not close the sweep: it checked one rule, not what step runs each clue. Closing needs the full MYCELIUM pass and then `mycelium receipt`.");
    process.exit(1);
  }
  // Ecualización del Anuncio: reclama una de las tres franjas del árbol. No emite
  // el anuncio —eso es prosa del agente— ni decide su contenido; solo dice si queda
  // presupuesto. Declara su propia cobertura por la misma razón que `bodies`.
  if (args[1] === "announce") {
    const claim = claimAnnounce(tree);
    if (claim.granted) {
      console.log(`Announce ${claim.used}/${claim.pool} claimed for ${tree}.`);
      console.log("This meters per tree. One per session is written in use-lore and nothing here checks it.");
      process.exit(0);
    }
    console.log(claim.reason === "exhausted"
      ? `Announce pool spent for ${tree} (${claim.used}/${claim.pool}). No budget left.`
      : `No ${RECEIPT} at ${tree} - no recorded sweep to meter an announce against.`);
    process.exit(1);
  }

  const current = snapshot(tree);
  if (current.fileCount === 0) {
    console.log(`No Lore files found under ${tree} - nothing to record.`);
    process.exit(1);
  }
  const guard = evaluateState(current, readReceipt(tree));
  if (guard.requiresApproval && args.indexOf("--accept-always-on") === -1) {
    console.log(formatIntervention({ ...guard, pendingLore: false }));
    process.exit(2);
  }
  const value = writeReceipt(tree, current);
  console.log(`MYCELIUM state recorded for ${current.fileCount} Lore file(s) in ${tree}`);
  console.log("This records the state of the tree; it does not certify that the sweep ran (every clue getting a step, a junction written or declined with its reason).");
  console.log(`${RECEIPT}: ${value.digest.slice(0, 12)}...`);
  process.exit(0);
}

// La perilla del recordatorio por turno (R28, R46). Vive fuera del arbol a proposito:
// el nivel es de la persona, no del proyecto, y tiene que regir igual en un area, en
// un bot y en un arbol sin Lore. Un arbol sin acuerdo tambien tiene nivel: el
// recordatorio existe para sostenerse en el tiempo, y la ausencia de acuerdo es
// precisamente el estado en el que mas hace falta.
//
// Sin argumento, esto LEE. Con argumento, escribe y lo dice en una linea. Un nivel que
// no existe sale como error y no como default: la eleccion equivocada se ve, porque
// el defecto se aplica solo cuando nadie eligio nada.
if (command === "nivel") {
  const pedido = args[1];
  if (pedido === undefined || pedido === true) {
    const ahora = estado(estadoDir());
    console.log(`nivel: ${ahora.nivel} (${NIVELES.join(" | ")}; por defecto ${DEFECTO_NIVEL})`);
    process.exit(0);
  }
  const escrito = estado(estadoDir(), pedido);
  console.log(`nivel: ${escrito.nivel} — escrito en ${escrito.ruta}`);
  console.log(`marca en la linea de estado: ${marca(escrito.nivel) || "(ninguna: apagado)"}`);
  process.exit(0);
}

if (command !== "install" || !["codex", "claude", "opencode", "all"].includes(target)) {
  console.log("Usage: lore-plugin install --target codex|claude|opencode|all");
  console.log("       lore-plugin statusline install|uninstall");
  console.log("       lore-plugin nivel [off|lite|full]");
  console.log("       lore-plugin crystallize pack --bot <dir> --out <file.md>");
  console.log("       lore-plugin crystallize extract --from <file.md> --out <dir>");
  console.log("       lore-plugin hygiene [ruta] [--json]");
  console.log("       lore-plugin mycelium receipt [--tree <dir>]");
  console.log("       lore-plugin mycelium bodies|announce|federated [--tree <dir>]");
  process.exit(command ? 2 : 0);
}

if (target === "codex" || target === "all") {
  const result = installCodex({ home: homedir(), packageRoot });
  if (!result.verified) throw new Error("Codex installation digest differs from source");
  console.log(`Codex plugin prepared at ${result.pluginRoot}`);
  console.log("Run: codex plugin add lore@personal");
}

if (target === "opencode" || target === "all") {
  const result = installOpenCode({ home: homedir(), packageRoot });
  if (!result.verified) throw new Error("OpenCode installation digest differs from source");
  console.log(`OpenCode skills installed and verified at ${result.skillsRoot}`);
  console.log(`OpenCode plugin (hook) installed and verified at ${result.pluginRoot}`);
  console.log(`OpenCode TUI mark installed and verified at ${result.tuiRoot}`);
  console.log(`OpenCode TUI config updated at ${result.tuiConfigPath}; restart OpenCode to see [Lore Plugin].`);
}

if (target === "claude" || target === "all") {
  for (const [bin, ...binArgs] of claudeCommands()) {
    const result = spawnSync(bin, binArgs, { stdio: "inherit", shell: process.platform === "win32" });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
  const home = homedir();
  const local = installClaude({ home, packageRoot });
  if (!local.cli.verified) throw new Error("Claude local entry digest differs from source");
  console.log(`Claude local Lore CLI installed and verified at ${local.cli.cliRoot}.`);
  const installedPackageRoot = claudePluginInstallPath({ home });
  const statusline = installClaudeStatuslineFromInstalledCopy({ home, installedPackageRoot });
  console.log(`Claude Code statusline mark connected at ${statusline.settingsPath}.`);
}
