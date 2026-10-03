import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

// RC6: el paquete publicado omitía NOTICE, commands/nivel.md y
// scripts/install-claude-statusline.mjs (npm pack --dry-run --json con
// npm_config_cache temporal). Este test corre ese mismo empaquetado y exige
// las tres piezas en el tarball, no solo en `files`.
const EXPECTED = [
  "NOTICE",
  "commands/nivel.md",
  "scripts/install-claude-statusline.mjs",
  "scripts/hygiene.mjs",
  "scripts/opencode-permissions.mjs",
];

function packedPaths(root) {
  const cache = mkdtempSync(join(tmpdir(), "lore-npm-cache-"));
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  try {
    const out = execFileSync(npm, ["pack", "--dry-run", "--json"], {
      cwd: root,
      encoding: "utf8",
      shell: true,
      env: { ...process.env, npm_config_cache: cache },
    });
    const [summary] = JSON.parse(out);
    return (summary.files ?? []).map((entry) => entry.path.replaceAll("\\", "/"));
  } finally {
    rmSync(cache, { recursive: true, force: true });
  }
}

test("el tarball npm incluye NOTICE, commands/nivel.md, hygiene, OpenCode permissions e install-claude-statusline.mjs", () => {
  const root = join(import.meta.dirname, "..");
  const paths = packedPaths(root);
  assert.ok(paths.length > 0, "npm pack --dry-run no listó archivos");
  for (const expected of EXPECTED) {
    assert.ok(paths.includes(expected), `el paquete omite ${expected}`);
  }
});
