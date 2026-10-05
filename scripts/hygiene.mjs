import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const DEFAULT_FS = { existsSync, lstatSync, readFileSync, readdirSync };
const EXTRA_CAMPAIGN = /(?:campaign|campana|informe|report|plan|brief|lanzamiento|launch|retro|retrospectiva)/i;
const STANDARD_AREA_FILES = new Set([
  "claude.md", "agents.md", "fases.md", "phases.md", "identity.md", "identidad.md",
  "principles.md", "principios.md", "index.md", "golden-paths.md",
]);
const ALLOWED_AREA_DIRS = new Set(["lore", "proyectos", "projects", "docs", "specs", "notas", "notes"]);

function normalPath(path) {
  return path.replaceAll("\\", "/") || ".";
}

export function scanHygiene(root, { fs = DEFAULT_FS } = {}) {
  const absoluteRoot = resolve(root);
  const findings = [];
  const notCovered = [];
  const entriesAt = (path) => fs.readdirSync(path, { withFileTypes: true });
  const realDirectory = (path) => {
    try { const stat = fs.lstatSync(path); return stat.isDirectory() && !stat.isSymbolicLink(); }
    catch { return false; }
  };
  const regularFile = (path) => {
    try { const stat = fs.lstatSync(path); return stat.isFile() && !stat.isSymbolicLink(); }
    catch { return false; }
  };
  const add = (findingClass, path, why) => findings.push({ class: findingClass, path: normalPath(relative(absoluteRoot, path)), why });

  function walk(path) {
    const entries = entriesAt(path).filter((entry) => ![".git", "node_modules"].includes(entry.name)).sort((a, b) => a.name.localeCompare(b.name));
    const names = new Set(entries.map((entry) => entry.name));
    if (names.has("canon") && names.has("lore")) {
      const lorePath = join(path, "lore");
      const canonPath = join(path, "canon");
      const standardBotLayout = realDirectory(lorePath)
        && ["enrutamiento.md", "routing.md"].some((name) => regularFile(join(lorePath, name)))
        && realDirectory(canonPath)
        && fs.readdirSync(canonPath, { withFileTypes: true }).some((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"));
      const declarations = ["CLAUDE.md", "AGENTS.md"]
        .filter((name) => fs.existsSync(join(path, name)))
        .flatMap((name) => fs.readFileSync(join(path, name), "utf8").split(/\r?\n/));
      if (!standardBotLayout && !declarations.some((line) => /^\s*(?:[-*+]\s*)?(?:dueño|owner)\s*:\s*(?:canon|lore)\s*$/i.test(line))) {
        add("two-seats", path, "coexisten canon/ y lore/ sin declaración afirmativa de dueño en CLAUDE.md o AGENTS.md; se exime el layout estándar de bot con lore/enrutamiento.md o lore/routing.md (la tabla de routing que define a un bot) y al menos un Markdown en canon/");
      }
    }

    const loreDirectory = join(path, "lore");
    const isArea = (names.has("proyectos") || names.has("projects"))
      && realDirectory(loreDirectory)
      && ["identidad.md", "identity.md"].some((name) => regularFile(join(loreDirectory, name)));
    if (isArea) {
      for (const entry of entries) {
        const lower = entry.name.toLowerCase();
        if (entry.isFile() && !entry.name.startsWith(".") && !STANDARD_AREA_FILES.has(lower) && EXTRA_CAMPAIGN.test(entry.name)) {
          add("area-root-extra", join(path, entry.name), "archivo con nombre de residuo de campaña en la raíz del área");
        }
        if (entry.isDirectory() && !entry.name.startsWith(".") && !ALLOWED_AREA_DIRS.has(lower) && EXTRA_CAMPAIGN.test(entry.name)) {
          add("area-root-extra", join(path, entry.name), "carpeta con nombre de residuo de campaña en la raíz del área");
        }
        if (entry.isDirectory() && /^(?:cristalizacion|crystallization|pista-|clue-|lesson)/i.test(entry.name)) {
          for (const child of entriesAt(join(path, entry.name))) {
            if (child.isFile() && child.name.toLowerCase().endsWith(".md")) {
              add("loose-crystallization", join(path, entry.name, child.name), "Markdown suelto dentro de una carpeta de cristalización, pista o lesson del área");
            }
          }
        }
      }
    }

    for (const entry of entries) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".tmp-")) add("tmp-dir", child, "directorio temporal .tmp-* pendiente de revisar");
        if (entry.name.startsWith("_rc-backup-")) add("backup-superado", child, "respaldo RC conservado para revisión");
        walk(child);
      } else if (entry.isSymbolicLink()) {
        notCovered.push({ class: "enlace-no-seguido", path: normalPath(relative(absoluteRoot, child)), why: "enlace no seguido" });
      } else if (entry.isFile() && entry.name.startsWith("_rc-backup-")) {
        add("backup-superado", child, "archivo de respaldo RC conservado para revisión");
      }
    }
  }

  walk(absoluteRoot);
  const coverage = ["tmp-dir", "area-root-extra", "two-seats", "loose-crystallization", "backup-superado"];
  const hookFile = join(absoluteRoot, "hooks", "hooks.json");
  if (!fs.existsSync(hookFile)) {
    notCovered.push({ class: "hook-sin-recepcion", why: "la raíz no contiene hooks/hooks.json" });
  } else {
    let hookData;
    let hookReadFailure = null;
    try {
      hookData = JSON.parse(fs.readFileSync(hookFile, "utf8"));
    } catch (error) {
      hookReadFailure = `hooks/hooks.json no se pudo leer como JSON (${error?.message ?? "error de lectura"})`;
    }
    let invalidHookStructure = null;
    if (!hookData || typeof hookData !== "object" || Array.isArray(hookData)
      || !hookData.hooks || typeof hookData.hooks !== "object" || Array.isArray(hookData.hooks)) {
      invalidHookStructure = "hooks.json con estructura no reconocida: se esperaba un objeto con hooks como objeto";
    } else {
      for (const [event, groups] of Object.entries(hookData.hooks)) {
        if (!Array.isArray(groups)) {
          invalidHookStructure = `hooks.json con estructura no reconocida: hooks.${event} debe ser un arreglo`;
          break;
        }
        for (const [index, group] of groups.entries()) {
          if (!group || typeof group !== "object" || Array.isArray(group) || !Array.isArray(group.hooks)) {
            invalidHookStructure = `hooks.json con estructura no reconocida: hooks.${event}[${index}].hooks debe ser un arreglo`;
            break;
          }
          for (const [hookIndex, hook] of group.hooks.entries()) {
            if (!hook || typeof hook !== "object" || Array.isArray(hook) || typeof hook.command !== "string") {
              invalidHookStructure = `hooks.json con estructura no reconocida: hooks.${event}[${index}].hooks[${hookIndex}].command debe ser cadena`;
              break;
            }
          }
          if (invalidHookStructure) break;
        }
        if (invalidHookStructure) break;
      }
    }
    if (hookReadFailure || invalidHookStructure) {
      notCovered.push({ class: "hook-sin-recepcion", why: hookReadFailure ?? invalidHookStructure });
    } else if (!fs.existsSync(join(absoluteRoot, "bench"))) {
      notCovered.push({ class: "hook-sin-recepcion", why: "la raíz tiene hooks pero no una carpeta bench/ con la que comparar sus pruebas" });
    } else {
      coverage.push("hook-sin-recepcion");
      const bench = join(absoluteRoot, "bench");
      const testFiles = readdirTree(fs, bench).filter((file) => /\.(?:test|spec)\.[cm]?js$/i.test(file)).map((file) => fs.readFileSync(file, "utf8"));
      for (const [event, groups] of Object.entries(hookData.hooks)) {
        for (const group of groups) {
          for (const hook of group.hooks) {
            const command = hook.command;
            const scripts = [...command.matchAll(/[\w.-]+\.(?:mjs|cjs|js)/gi)];
            const script = basename(scripts.at(-1)?.[0] ?? "");
            const identifier = `${event} ${script}`.trim();
            if (script && !testFiles.some((text) => text.includes(script))) {
              add("hook-sin-recepcion", hookFile, `hook ${identifier} sin prueba en bench/ que nombre ${script}`);
            }
          }
        }
      }
    }
  }
  return { root: absoluteRoot, findings, coverage, notCovered };
}

function readdirTree(fs, root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...readdirTree(fs, path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

// La REDACCIÓN vive acá y no en cada entrada. Hay dos: la de la vía npm/marketplace
// (`lore-plugin.mjs`) y la local que instala cada host (`lore-cli.mjs`). Dos entradas que
// imprimen el mismo escaneo con dos redacciones son dos verdades sobre el mismo hecho, y la
// segunda se queda vieja sin que nada lo diga — que es como un escaneo de higiene termina
// mintiendo sobre lo que cubre. Una lista de líneas, y las dos la recorren igual.
export function salidaHygiene(result, { json = false } = {}) {
  if (json) return [JSON.stringify(result, null, 2)];
  const omittedLinks = result.notCovered.some((item) => item.why === "enlace no seguido");
  return [
    `${result.findings.length} hallazgos; cubiertas${omittedLinks ? " con omisiones" : ""}: ${result.coverage.join(", ")}; no cubiertas: ${result.notCovered.map((item) => `${item.class}${item.path ? ` ${item.path}` : ""} (${item.why})`).join("; ") || "ninguna"}.`,
    ...result.findings.map((finding) => `  ${finding.class}: ${finding.path} - ${finding.why}`),
    "La higiene detecta y propone; no modifica archivos.",
  ];
}
