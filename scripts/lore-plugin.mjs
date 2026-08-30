#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { claudeCommands, installCodex } from "./installer.mjs";
import { loreFiles, writeReceipt, RECEIPT } from "../hooks/lore-state.mjs";

const args = process.argv.slice(2);
const command = args[0];
const targetIndex = args.indexOf("--target");
const target = targetIndex === -1 ? null : args[targetIndex + 1];
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

if (command === "crystallize") {
  const script = resolve(packageRoot, "skills/transmute-lore/scripts/crystallize.mjs");
  const result = spawnSync(process.execPath, [script, ...args.slice(1)], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

// Registra que el barrido MYCELIUM corrió sobre este árbol. Es lo que cierra el
// bracket de salida: un hecho derivado del contenido del Lore, no una frase.
if (command === "mycelium") {
  if (args[1] !== "receipt") {
    console.log("Usage: lore-plugin mycelium receipt [--tree <dir>]");
    process.exit(2);
  }
  const treeIndex = args.indexOf("--tree");
  const tree = treeIndex === -1 ? process.cwd() : resolve(args[treeIndex + 1]);
  const files = loreFiles(tree);
  if (files.length === 0) {
    console.log(`No Lore files found under ${tree} - nothing to record.`);
    process.exit(1);
  }
  const value = writeReceipt(tree);
  console.log(`MYCELIUM sweep recorded for ${files.length} Lore file(s) in ${tree}`);
  console.log(`${RECEIPT}: ${value.slice(0, 12)}...`);
  process.exit(0);
}

if (command !== "install" || !["codex", "claude", "all"].includes(target)) {
  console.log("Usage: lore-plugin install --target codex|claude|all");
  console.log("       lore-plugin crystallize pack --bot <dir> --out <file.md>");
  console.log("       lore-plugin crystallize extract --from <file.md> --out <dir>");
  console.log("       lore-plugin mycelium receipt [--tree <dir>]");
  process.exit(command ? 2 : 0);
}

if (target === "codex" || target === "all") {
  const result = installCodex({ home: homedir(), packageRoot });
  console.log(`Codex plugin prepared at ${result.pluginRoot}`);
  console.log("Run: codex plugin add lore@personal");
}

if (target === "claude" || target === "all") {
  for (const [bin, ...binArgs] of claudeCommands()) {
    const result = spawnSync(bin, binArgs, { stdio: "inherit", shell: process.platform === "win32" });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
