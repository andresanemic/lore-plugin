#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { claudeCommands, installCodex } from "./installer.mjs";

const args = process.argv.slice(2);
const command = args[0];
const targetIndex = args.indexOf("--target");
const target = targetIndex === -1 ? null : args[targetIndex + 1];
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

if (command !== "install" || !["codex", "claude", "all"].includes(target)) {
  console.log("Usage: lore-plugin install --target codex|claude|all");
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
