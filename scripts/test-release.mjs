import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const groups = ["bench", "bench/upgrade", "bench/effect-2.3.2", "scripts", "skills/transmute-lore/scripts"];
const files = groups.flatMap((group) => readdirSync(group).filter((name) => name.endsWith(".test.mjs")).map((name) => join(group, name)));
const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  env: { ...process.env, LORE_RELEASE_GATE: "1" },
});
process.exit(result.status ?? 1);
