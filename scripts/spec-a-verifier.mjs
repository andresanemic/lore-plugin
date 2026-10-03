import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const DESTINATIONS = new Map([
  ["hooks/codex-guard.mjs", "session-temp-log"],
  ["hooks/lore-guard.mjs", "session-temp-log"],
  ["hooks/opencode-plugin.js", "session-temp-log"],
  ["hooks/lore-state.mjs", "tree-or-session-temp"],
  ["hooks/lore-turno.mjs", "person-level-choice"],
  ["scripts/installer.mjs", "explicit-host-install"],
  ["scripts/install-claude-statusline.mjs", "explicit-host-install"],
  ["scripts/opencode-permissions.mjs", "explicit-project-config"],
  ["skills/create-bot/plantillas/sync.js", "created-bot-tree"],
  ["skills/transmute-lore/scripts/crystallize.mjs", "explicit-user-output"],
  ["skills/use-lore/scripts/acuerdo.mjs", "approved-agreement-at-tree-root"],
]);
const WRITE = /\b(?:writeFileSync|appendFileSync|renameSync|copyFileSync|cpSync|mkdirSync|rmSync|unlinkSync)\s*\(/;

function sourceFiles(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!["bench", "node_modules", ".git"].includes(entry.name)) walk(full);
      } else if (/\.(?:mjs|js)$/.test(entry.name) && !/\.test\.(?:mjs|js)$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  for (const dir of ["hooks", "scripts", "skills"]) walk(join(root, dir));
  return files;
}

export function inventoryWrites(root) {
  return sourceFiles(root)
    .filter((file) => WRITE.test(readFileSync(file, "utf8")))
    .map((file) => {
      const path = relative(root, file).replaceAll("\\", "/");
      return { path, destination: DESTINATIONS.get(path) ?? null };
    });
}

export function countPostConvergenceSparks(events) {
  const start = events.findIndex((event) => event?.type === "convergence");
  if (start === -1) return 0;
  const count = events.slice(start + 1).filter((event) => event?.type === "spark").length;
  if (count > 2) throw new Error(`Chispas posteriores a convergencia: ${count}; techo de 2`);
  return count;
}
