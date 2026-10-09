import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirs = ["hooks", "scripts", "skills"];
const sourceExtensions = new Set([".js", ".mjs", ".cjs"]);
const files = [];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.isFile() && sourceExtensions.has(path.slice(path.lastIndexOf(".")).toLowerCase())) files.push(path);
  }
}

for (const directory of sourceDirs) collect(join(root, directory));
files.sort();
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`Syntax error: ${file}\n${result.stderr || result.error?.message || `exit ${result.status}`}\n`);
  }
}
if (failed) process.exitCode = 1;
else console.log(`JavaScript syntax OK: ${files.length} files checked.`);