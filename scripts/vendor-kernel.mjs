#!/usr/bin/env node
// Vendorizar el kernel de Vespi es una operación, no una edición.
//
// Hasta R2 el proceso era manual: copiar los bytes de `git show <commit>:src/<archivo>`, pegarle un
// encabezado de tres líneas, calcular SHA-256 y bytes a mano, editar SOURCE.md y acordarse de dos
// listas escritas en otros archivos. Cada paso era una ocasión para que el kit declarara una copia
// que no era la que traía, y ninguna de las cinco verificaba el conjunto: cada una miraba su parte.
//
// Aquí las cinco cosas salen de una sola lectura del ref: los archivos, los encabezados, la tabla de
// SOURCE.md, y por tanto el inventario que usan la prueba de procedencia y el verificador de hosts.
// `--check` hace la misma lectura y no escribe nada, así que la comprobación no puede ser la que
// arregla lo que dice comprobar.
//
// Ni red ni dependencias: solo Git.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_SOURCE_DIR,
  PROVENANCE_TEST,
  VENDORED_PACKAGE_JSON,
  declaredBranch,
  declaredPublished,
  bodyAfterHeader,
  headerLinesOf,
  kernelDirOf,
  kernelModules,
  readVendoredPackageJson,
} from "./kernel-inventory.mjs";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const USAGE = [
  "Usage: node scripts/vendor-kernel.mjs --source <raíz-del-kernel> --ref <commit-o-rama>",
  "         [--modules a.js,b.js] [--branch <rama>] [--published <YYYY-MM-DD>] [--kit <raíz-del-kit>] [--check]",
  "",
  "  --source     repositorio del kernel, el que tiene src/ y package.json",
  "  --ref        commit o rama desde la que se leen los bytes; sin esto se lee HEAD del repo de trabajo",
  "  --modules    módulos a vendorizar; por defecto, todos los src/*.js del ref",
  "  --branch     rama que se declara en el encabezado y en SOURCE.md; si falta, se lee del SOURCE.md existente",
  "  --published  fecha de publicación que declara SOURCE.md; si falta, se lee del SOURCE.md existente",
  "  --kit        raíz del kit a escribir; por defecto, la que contiene este script",
  "  --check      no escribe nada; sale distinto de cero si lo vendorizado difiere de lo que se produciría",
].join("\n");

const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.js$/;

class VendorError extends Error {}

export function parseArguments(argv) {
  const options = { check: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--check") { options.check = true; continue; }
    const value = argv[i + 1];
    if (value === undefined) throw new VendorError(`Falta el valor de ${arg}.\n\n${USAGE}`);
    if (arg === "--source") options.source = value;
    else if (arg === "--ref") options.ref = value;
    else if (arg === "--kit") options.kitRoot = value;
    else if (arg === "--branch") options.branch = value;
    else if (arg === "--published") options.published = value;
    else if (arg === "--modules") options.modules = value.split(",").map((name) => name.trim()).filter(Boolean);
    else throw new VendorError(`Opción no reconocida: ${arg}\n\n${USAGE}`);
    i += 1;
  }
  if (!options.help) {
    if (!options.source) throw new VendorError(`Falta --source, el repositorio del kernel.\n\n${USAGE}`);
    if (!options.ref) throw new VendorError(`Falta --ref, el commit desde el que se leen los bytes.\n\n${USAGE}`);
  }
  return options;
}

// --- Git --------------------------------------------------------------------------------------
// Se leen los bytes del objeto, no del directorio de trabajo: el checkout puede estar adelantado,
// atrasado o sucio, y el corte es el commit. `safe.directory` se acota a la raíz declarada para que
// un repo con dueño raro falle con un mensaje que lo diga, en vez de con «dubious ownership».

function gitReader(source) {
  const root = resolve(source);
  return function git(args, { buffer = false } = {}) {
    const exactRoot = root.replaceAll("\\", "/");
    try {
      return execFileSync("git", ["-c", `safe.directory=${exactRoot}`, ...args], { cwd: root, encoding: buffer ? "buffer" : "utf8" });
    } catch (error) {
      const detail = String(error.stderr ?? error.message);
      if (/dubious ownership/i.test(detail)) {
        throw new VendorError(`Git no pudo verificar el repositorio del kernel en ${exactRoot} porque la propiedad no es de confianza; la comprobación se limita a ese directorio exacto.`, { cause: error });
      }
      const reason = /does not exist|unknown revision|bad revision|not a valid object name/i.test(detail) ? "no existe en ese repositorio" : detail.trim().split("\n")[0];
      throw new VendorError(`git ${args[0]} falló en ${root}: ${reason}`, { cause: error });
    }
  };
}

function resolveCommit(git, ref, source) {
  try {
    return git(["rev-parse", "--verify", `${ref}^{commit}`]).trim();
  } catch (error) {
    throw new VendorError(`El ref ${ref} no se resuelve a ningún commit en ${source}: ${String(error.stderr ?? error.message).trim().split("\n")[0]}`, { cause: error });
  }
}

const listSourceModules = (git, commit) => git(["ls-tree", "--name-only", `${commit}:src`]).split("\n").map((line) => line.trim()).filter((name) => name.endsWith(".js")).sort();

const readSourceModule = (git, commit, name) => git(["show", `${commit}:src/${name}`], { buffer: true });

function readKernelVersion(git, commit) {
  let manifest;
  try {
    manifest = JSON.parse(git(["show", `${commit}:package.json`]));
  } catch (error) {
    throw new VendorError(`No se pudo leer package.json en ${commit.slice(0, 7)}: ${error.message}`, { cause: error });
  }
  const version = manifest?.version;
  if (typeof version !== "string" || !version) {
    throw new VendorError(`El kernel en ${commit.slice(0, 7)} no declara version en package.json; no se puede afirmar qué versión se vendoriza.`);
  }
  return version;
}

function readKitVersion(kitRoot) {
  const path = join(kitRoot, "package.json");
  if (!existsSync(path)) throw new VendorError(`El kit en ${kitRoot} no tiene package.json; SOURCE.md declara la versión del kit y no se puede inventar.`);
  const version = JSON.parse(readFileSync(path, "utf8")).version;
  if (typeof version !== "string" || !version) throw new VendorError(`El package.json del kit no declara version.`);
  return version;
}

// Lo que hay declarado hoy en SOURCE.md, que es la fuente de la rama y de la fecha cuando el
// llamador no las pasa. Es una lectura de lo escrito, no una suposición.
function declared(kernelDir) {
  const path = join(kernelDir, "SOURCE.md");
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

// --- Lo que se escribe --------------------------------------------------------------------------

export function provenanceHeader({ name, kernelVersion, branch, short }) {
  return [
    `// Vendored copy — canonical source is ${CANONICAL_SOURCE_DIR}${name}`,
    `// (kernel ${kernelVersion}, ${branch} branch, commit ${short}). Edit the canonical source, then re-copy here;`,
    "// this file is not the source of truth.",
    "",
  ].join("\n");
}

export function renderSourceDocument({ kernelVersion, kitVersion, published, branch, commit, rows }) {
  const table = [...rows].sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => `| \`${row.name}\` | \`${row.digest}\` | ${row.bytes} |`).join("\n");
  return [
    "# Vespi kernel copy provenance",
    "",
    `Fixed copy of the Vespi kernel **${kernelVersion}** in Lore Plugin ${kitVersion}, published on ${published}. Canonical source: \`${CANONICAL_SOURCE_DIR}\`, branch \`${branch}\`, commit \`${commit}\`.`,
    "",
    `Each module carries a three-line provenance header followed by the exact committed source bytes. The table below does not verify itself: \`${PROVENANCE_TEST}\` compares the body with \`git show ${commit}:src/<file>\`.`,
    "",
    "| Module | SHA-256 of source bytes | Bytes |",
    "|---|---|---|",
    table,
    "",
  ].join("\n");
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

// --- La operación --------------------------------------------------------------------------------

export function vendorKernel({
  source,
  ref = "HEAD",
  modules,
  kitRoot = scriptRoot,
  check = false,
  branch,
  published,
} = {}) {
  const git = gitReader(source);
  const kernelDir = kernelDirOf(kitRoot);
  const commit = resolveCommit(git, ref, source);
  const short = commit.slice(0, 7);
  const kernelVersion = readKernelVersion(git, commit);
  const kitVersion = readKitVersion(kitRoot);
  const today = declared(kernelDir);
  // La rama que se declara sale de lo que el llamador pasó, o de lo que SOURCE.md ya afirma. Si no
  // hay ninguna de las dos y el ref es un commit, no hay de dónde sacarla: un commit no dice en qué
  // rama estaba, y escribir una rama inventada sería una afirmación falsa en la cabecera de cada
  // módulo. Si el ref es un nombre de rama, ese nombre es la respuesta.
  const refIsCommit = /^[0-9a-f]{7,40}$/.test(String(ref));
  const declaredBranchName = branch ?? declaredBranch(today) ?? (refIsCommit ? null : String(ref));
  const declaredPublication = published ?? declaredPublished(today);
  if (!declaredBranchName) throw new VendorError(`No se puede determinar la rama que declara el encabezado: pásala con --branch, o deja un SOURCE.md que la declare. El ref ${short} es un commit, y un commit no dice en qué rama estaba.`);
  if (!declaredPublication) throw new VendorError(`No se puede determinar la fecha que declara SOURCE.md: pásala con --published o deja un SOURCE.md que la declare.`);

  const available = listSourceModules(git, commit);
  const selected = modules ? [...new Set(modules)].sort() : available;
  for (const name of selected) {
    if (!NAME.test(name)) throw new VendorError(`El módulo pedido no es un nombre de archivo del kernel: ${name}`);
    if (!available.includes(name)) {
      throw new VendorError(`El módulo ${name} no existe en ${short}:src/ (hay ${available.length ? available.join(", ") : "nada"}). Un módulo pedido que no está en el ref es un error, no un archivo vacío.`);
    }
  }

  const rows = [];
  const files = [];
  for (const name of selected) {
    const body = readSourceModule(git, commit, name);
    rows.push({ name, digest: sha256(body), bytes: body.length });
    files.push({
      name,
      relative: join("core", "kernel", name),
      body,
      bytes: Buffer.concat([Buffer.from(provenanceHeader({ name, kernelVersion, branch: declaredBranchName, short }), "utf8"), body]),
    });
  }

  // El package.json del directorio vendorizado es del kit, no del kernel. Solo se conserva si ya
  // existe, y solo si es el que el kit instala: cambiarlo en silencio cambiaría el modo en que Node
  // carga estos archivos.
  const vendoredPackage = readVendoredPackageJson(kernelDir);
  if (vendoredPackage !== null && vendoredPackage !== VENDORED_PACKAGE_JSON) {
    throw new VendorError(`El package.json de ${kernelDir} no es el que el kit instala (${VENDORED_PACKAGE_JSON}); se rehace a mano o se deja como está.`);
  }

  files.push({
    name: "SOURCE.md",
    relative: join("core", "kernel", "SOURCE.md"),
    bytes: Buffer.from(renderSourceDocument({
      kernelVersion, kitVersion, published: declaredPublication, branch: declaredBranchName, commit, rows,
    }), "utf8"),
  });

  // Un módulo vendorizado que este ref no pide es un huérfano: si se vendorizara igual, desaparecería
  // de la tabla de SOURCE.md y de las dos listas derivadas sin que nadie lo decidiera. Por eso no se
  // escribe nunca en esa situación, y `--check` la cuenta como diferencia en vez de ocultarla.
  const orphans = kernelModules(kernelDir).filter((name) => !selected.includes(name));

  const differences = [];
  for (const file of files) {
    const path = join(kernelDir, file.name);
    if (!existsSync(path)) {
      differences.push({ path: file.relative, reason: "no está vendorizado" });
    } else if (readFileSync(path).equals(file.bytes)) {
      continue;
    } else if (file.body && bodyAfterHeader(readFileSync(path)).equals(file.body)) {
      // El caso que el encargo del día de la integración tiene que poder leer de un vistazo: el
      // código es el mismo y lo único que cambia es el commit del que se dice que viene.
      const declared = headerLinesOf(readFileSync(path))[1]?.match(/commit ([0-9a-f]{7,40})\b/)?.[1] ?? "sin commit";
      differences.push({ path: file.relative, reason: `los cuerpos coinciden; el encabezado declara ${declared} y el ref es ${short}` });
    } else {
      differences.push({ path: file.relative, reason: "los bytes son distintos" });
    }
  }
  for (const name of orphans) {
    differences.push({ path: join("core", "kernel", name), reason: "está vendorizado y este ref no lo trae" });
  }
  if (!check && orphans.length) {
    throw new VendorError(`El directorio vendorizado tiene módulos que este ref no pide: ${orphans.join(", ")}. Vendorizar ahora los borraría de SOURCE.md sin avisar; pídelos con --modules o bórralos a mano.`);
  }

  const written = [];
  if (!check) {
    mkdirSync(kernelDir, { recursive: true });
    for (const file of files) {
      const path = join(kernelDir, file.name);
      if (existsSync(path) && readFileSync(path).equals(file.bytes)) continue;
      writeFileSync(path, file.bytes);
      written.push(file.relative);
    }
    if (vendoredPackage !== null && !existsSync(join(kernelDir, "package.json"))) {
      writeFileSync(join(kernelDir, "package.json"), VENDORED_PACKAGE_JSON);
      written.push(join("core", "kernel", "package.json"));
    }
  }

  return {
    // Las diferencias son las de ANTES de esta corrida. Escribir las arregla todas, así que una
    // vendorización que terminó no deja nada atrás; `--check` no arregla nada y por eso decide.
    ok: check ? differences.length === 0 : true,
    check,
    kitRoot,
    kernelDir,
    source,
    ref,
    commit,
    short,
    kernelVersion,
    kitVersion,
    branch: declaredBranchName,
    published: declaredPublication,
    selected,
    rows,
    orphans,
    differences,
    written,
  };
}

export function formatReport(report) {
  const lines = [
    `${report.check ? "Comprobación" : "Vendorización"} del kernel de Vespi ${report.kernelVersion} en ${report.short} (${report.commit}), rama ${report.branch}, publicado ${report.published}.`,
    `Módulos: ${report.selected.join(", ") || "ninguno"}.`,
  ];
  for (const difference of report.differences) lines.push(`  ${difference.path}: ${difference.reason}`);
  for (const path of report.written) lines.push(`  escrito ${path}`);
  lines.push(report.ok ? "Resultado: lo vendorizado coincide con lo que se produciría." : `Resultado: difiere en ${report.differences.length} archivo(s).`);
  return lines.join("\n");
}

export function main(argv = process.argv.slice(2), { stdout = (line) => console.log(line), stderr = (line) => console.error(line) } = {}) {
  let options;
  try {
    options = parseArguments(argv);
  } catch (error) {
    stderr(error.message);
    return 2;
  }
  if (options.help) {
    stdout(USAGE);
    return 0;
  }
  try {
    const report = vendorKernel(options);
    stdout(formatReport(report));
    return report.ok ? 0 : 1;
  } catch (error) {
    stderr(`vendor-kernel: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}