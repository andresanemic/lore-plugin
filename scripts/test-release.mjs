import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Grupos fijos del kit.
const gruposFijos = ["bench", "bench/upgrade", "bench/effect-2.3.2", "scripts"];

// Las skills se DESCUBREN, no se listan: un test nuevo que nadie agrega a mano
// no corre nunca (el 2026-10-07 se encontro que `skills/stale-lore/scripts` quedo
// fuera porque la lista era manual). Todo `skills/<x>/scripts/*.test.mjs` entra solo.
const gruposDeSkills = existsSync("skills")
  ? readdirSync("skills", { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => join("skills", e.name, "scripts"))
      .filter((dir) => existsSync(dir))
  : [];

const groups = [...gruposFijos, ...gruposDeSkills];
const files = groups.flatMap((group) => readdirSync(group).filter((name) => name.endsWith(".test.mjs")).map((name) => join(group, name)));
const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  env: { ...process.env, LORE_RELEASE_GATE: "1" },
});
process.exit(result.status ?? 1);
