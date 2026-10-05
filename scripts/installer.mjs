import { createHash, randomBytes } from "node:crypto";
import { copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";

const loreEntry = {
  name: "lore",
  // Codex resolves local marketplace sources from the user's home directory,
  // not from the directory that contains marketplace.json.
  source: { source: "local", path: "./.agents/plugins/plugins/lore" },
  policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
  category: "Productivity",
};

export function claudeCommands() {
  return [
    ["claude", "plugin", "marketplace", "add", "andresanemic/lore-plugin"],
    ["claude", "plugin", "install", "lore@lore-plugin"],
  ];
}

export function claudePluginInstallPath({ home }) {
  if (!home) throw new TypeError("home is required");
  const manifestPath = join(home, ".claude", "plugins", "installed_plugins.json");
  if (!existsSync(manifestPath)) throw new Error(`Claude plugin install manifest is missing: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entries = manifest.plugins?.["lore@lore-plugin"];
  if (!Array.isArray(entries) || entries.length !== 1 || typeof entries[0]?.installPath !== "string") {
    throw new Error(`Expected exactly one installed Lore Plugin entry in ${manifestPath}`);
  }
  if (!isAbsolute(entries[0].installPath)) throw new Error("Claude Lore Plugin installPath must be absolute");
  return entries[0].installPath;
}

// --- qué es un archivo de texto y qué es un final de línea ------------------------------
//
// El 2026-10-04, instalando de verdad en Windows, `sameTree` se negó a actualizar la marca TUI de
// OpenCode: el árbol de trabajo estaba en CRLF y la copia instalada en LF. La comparación era de
// bytes, así que un checkout de Windows era indistinguible de un archivo ajeno. `.gitattributes`
// con `eol=lf` no arregla eso: no reescribe lo que ya está en disco.
//
// La comparación se relaja solo en un punto, y el punto es uno: CR seguido de LF contra LF. Un CR
// que no va delante de un LF es un byte, no un final de línea, y ahí no se toca nada.
//
// Qué es texto, con las dos señales y en este orden:
//
// 1. La extensión. Un formato binario conocido es binario aunque su contenido no tenga un solo
//    NUL: un `.png` sin NUL sigue siendo un `.png`, y normalizar sus bytes hide una diferencia.
// 2. El contenido. Un byte nulo no es de texto. Se mira el archivo entero, no una cabecera.
//
// Lo que no es binario por las dos señales es texto, incluidos los archivos sin extensión
// (`LICENSE`, `Dockerfile`) y los de extensión que nadie registra. Un `.mjs` lleno de NUL cae por
// la segunda señal y se compara byte a byte.
//
// El límite que esto deja, dicho aquí y no escondido: un archivo sin NUL y de extensión
// desconocida que solo difiera en CR+LF contra LF se cuenta como el mismo. Ninguna heurística de
// texto puede cerrar ese caso sin un `.gitattributes` que lo decida por archivo, y el kit no tiene
// uno que lo decida por archivo.
//
// Esto solo cambia un veredicto de igualdad. Los bytes que se escriben en el host siguen siendo los
// del origen, tal cual los copia `cpSync`: el núcleo de Vespi, que `.gitattributes` marca `-text`,
// nunca se convierte por pasar por aquí.
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".tif", ".tiff",
  ".pdf", ".zip", ".gz", ".tgz", ".bz2", ".xz", ".7z", ".rar", ".tar",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".mp3", ".mp4", ".mov", ".webm", ".ogg", ".wav", ".flac",
  ".wasm", ".pyc", ".so", ".dylib", ".dll", ".exe", ".class", ".jar",
  ".pptx", ".docx", ".xlsx", ".sqlite", ".db", ".bin", ".dat", ".dmg", ".iso",
]);

function esTexto(relativePath, bytes) {
  if (BINARY_EXTENSIONS.has(extname(relativePath).toLowerCase())) return false;
  return !bytes.includes(0);
}

/** El archivo sin el CR que precede a un LF. Los demas bytes no se mueven. */
function sinCrDelanteDeLf(bytes) {
  // `latin1` ida y vuelta es identidad byte a byte en 0..255: esto no puede alterar un byte que
  // no sea el CR de un CRLF, y no decodifica el archivo como texto.
  return Buffer.from(bytes.toString("latin1").replace(/\r\n/g, "\n"), "latin1");
}

// El recorrido del árbol. `readdirSync(root, {recursive: true})` sigue las junctions de Windows:
// el contenido que vive detrás de un enlace entraba en la comparación como si fuera del árbol. Aquí
// cada entrada se mira con `lstat`, que no sigue nada, y un enlace o una junction se anotan por su
// ruta y se dejan sin leer. No seguirlos es también lo que hace el digest immune a un enlace.
function describirArbol(root) {
  if (!existsSync(root)) return null;
  const rootStat = lstatSync(root);
  if (rootStat.isSymbolicLink()) return { tipo: "enlace", nombre: basename(root) };
  if (rootStat.isFile()) return { tipo: "archivo", nombre: basename(root), bytes: readFileSync(root) };

  const archivos = [];
  const enlaces = [];
  const otros = [];
  const visitar = (directorio, prefix) => {
    for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
      const ruta = join(directorio, entrada.name);
      const relativa = prefix ? `${prefix}/${entrada.name}` : entrada.name;
      const stat = lstatSync(ruta);
      if (stat.isSymbolicLink()) enlaces.push(relativa);
      else if (stat.isDirectory()) visitar(ruta, relativa);
      else if (stat.isFile()) archivos.push({ relativo: relativa, bytes: readFileSync(ruta) });
      else otros.push(relativa);
    }
  };
  visitar(root, "");
  const porRuta = (a, b) => a.localeCompare(b);
  archivos.sort((a, b) => porRuta(a.relativo, b.relativo));
  enlaces.sort(porRuta);
  otros.sort(porRuta);
  return { tipo: "arbol", archivos, enlaces, otros };
}

function treeDigest(root) {
  // El formato del hash es el de RC8 y no cambia: una ruta, un NUL y los bytes del archivo. Para
  // un árbol sin enlaces —todos los del kit— el digest de antes y el de ahora son el mismo número.
  const descripcion = describirArbol(root);
  if (descripcion === null) return null;
  const hash = createHash("sha256");
  if (descripcion.tipo === "enlace") return hash.digest("hex");
  if (descripcion.tipo === "archivo") {
    hash.update(descripcion.nombre);
    hash.update("\0");
    hash.update(descripcion.bytes);
    hash.update("\n");
    return hash.digest("hex");
  }
  for (const archivo of descripcion.archivos) {
    hash.update(archivo.relativo);
    hash.update("\0");
    hash.update(archivo.bytes);
    hash.update("\n");
  }
  return hash.digest("hex");
}

function mismoArchivo(rutaA, bytesA, rutaB, bytesB) {
  if (bytesA.equals(bytesB)) return true;
  if (!esTexto(rutaA, bytesA) || !esTexto(rutaB, bytesB)) return false;
  return sinCrDelanteDeLf(bytesA).equals(sinCrDelanteDeLf(bytesB));
}

function mismaForma(a, b) {
  if (a.length !== b.length) return false;
  return a.every((valor, i) => valor === b[i]);
}

/** La identidad la da el contenido de cada archivo en su posicion, no su nombre: dos archivos con
 *  los mismos bytes en rutas distintas son dos archivos distintos, porque lo que se instala es la
 *  estructura. Lo que se relaja es el CR de un CRLF, y solo en archivos de texto. */
function mismoArbol(a, b) {
  if (!a || !b || a.tipo !== b.tipo) return false;
  if (a.tipo === "archivo") {
    // Un archivo suelto conserva la regla del RC8: tambien hay que llamarse igual. El nombre dice
    // que clase de objeto se esta mirando; el contenido dice si es el mismo.
    return a.nombre === b.nombre && mismoArchivo(a.nombre, a.bytes, b.nombre, b.bytes);
  }
  if (a.tipo === "enlace" || b.tipo === "enlace") return a.tipo === b.tipo && a.nombre === b.nombre;
  if (a.archivos.length !== b.archivos.length) return false;
  if (!mismaForma(a.enlaces, b.enlaces) || !mismaForma(a.otros, b.otros)) return false;
  const enB = new Map(b.archivos.map((archivo) => [archivo.relativo, archivo.bytes]));
  for (const archivo of a.archivos) {
    const bytesB = enB.get(archivo.relativo);
    if (!bytesB || !mismoArchivo(archivo.relativo, archivo.bytes, archivo.relativo, bytesB)) return false;
  }
  return true;
}

export function sameTree(source, destination) {
  return mismoArbol(describirArbol(source), describirArbol(destination));
}

// --- la entrada local: el ejecutable que la prosa de MYCELIUM nombra ---------
//
// Lo que se Corrige aquí son cuatro cosas que la revisión encontró en el candidato anterior:
//
// 1. El conjunto era un filtro, no una condición. `CLI_CHAIN` recorría las ausencias con
//    `continue` y después verificaba precisamente esas ausencias: un `packageRoot` vacío
//    pasaba por verdad vacía y devolvía `verified: true`. Ahora cada miembro es obligatorio y
//    la comprobación ocurre antes de la primera escritura.
//
// 2. El perímetro se comprobaba en la raíz y en el archivo, no en los directorios intermedios.
//    Una junction en `.lore-plugin/hooks` sacaba la escritura del destino declarado y la
//    verificación la daba por buena. Ahora se inspecciona cada componente existente, desde la
//    raíz física de HOME hasta el destino, y un enlace o una salida del perímetro se rechaza
//    antes de crear, borrar o copiar nada.
//
// 3. La raíz del runtime era una sola y mutable. Instalar un corte para un host reescribía los
//    bytes que otro host estaba ejecutando. Ahora el paquete va direccionado por contenido bajo
//    `p/<digest>/` y es inmutable, y cada host tiene su propia entrada que apunta a un corte.
//
// 4. La entrada anunciaba más de lo que distribute. Se instala una entrada dedicada que expone
//    exactamente el subconjunto que la prosa invoca, y su cadena cubre lo que esa entrada
//    importa de verdad.

export const LOCAL_HOME_DIR = ".lore-plugin";

// Todos los miembros son obligatorios. No hay `continue`, no hay filtrado de ausencias: la
// entrada y su cadena tienen que existir en el paquete o la instalación no procede.
//
// La lista es el cierre transitivo de los imports de `scripts/lore-cli.mjs`, comprobado por
// `prueba/rc7-recibo.test.mjs`. `hooks/lore-turno.mjs` importa
// `skills/use-lore/scripts/acuerdo.mjs`: sin ese sexto archivo el ejecutable no arranca, y un
// ejecutable que no arranca es el mismo fallo que prometer la ruta y no cumplirla.
export const LOCAL_CHAIN = [
  "scripts/lore-cli.mjs",
  // La higiene de salida, que `save-to-lore` ordena al cerrar cada pase. La prosa la nombra
  // `lore-plugin hygiene`, que es la entrada de la vía npm; la entrada local es la que cada
  // host instala y la que `use-lore` nombra POR RUTA, así que sin este archivo la orden no
  // se resuelve donde se la pide correr (fricción 6, 2026-10-04). `hygiene.mjs` no importa
  // nada del kit —solo `node:fs` y `node:path`—, que es justo por lo que puede viajar.
  "scripts/hygiene.mjs",
  "scripts/installer.mjs",
  "hooks/lore-guard.mjs",
  "hooks/lore-state.mjs",
  "hooks/lore-turno.mjs",
  "skills/use-lore/scripts/acuerdo.mjs",
];

export const LOCAL_HOSTS = ["claude", "codex", "opencode"];

function chainPath(root, relativePath) {
  return join(root, ...relativePath.split("/"));
}

/** La ruta que la prosa nombra, por host. El texto de la prosa declara esta tabla y declara
 *  también qué pasa donde la entrada no existe. */
export function localEntryPaths({ home }) {
  const base = join(home, LOCAL_HOME_DIR, "entry");
  return Object.fromEntries(LOCAL_HOSTS.map((h) => [h, join(base, h, "scripts", "lore-cli.mjs")]));
}

// La raíz física es la que manda: un HOME que es una junction es legítimo, pero lo que se
// escriba "bajo HOME" tiene que quedarse dentro de la carpeta real a la que HOME apunta.
function physicalHome(home) {
  if (!home) throw new TypeError("home is required");
  const abs = resolve(home);
  try {
    return realpathSync.native(abs);
  } catch {
    return abs;
  }
}

/**
 * Rechaza un destino que se sale del perímetro físico de HOME, componente por componente.
 *
 * Una comparación léxica de prefijo no alcanza: `~/.lore-plugin/hooks` sigue empezando por
 * `~/.lore-plugin` siendo una junction a `C:\otra-carpeta`. Por eso se recorre cada
 * componente existente con `lstat`, y se resuelve cada uno con `realpath`.
 *
 * Frontera declarada: esto reduce el defecto estático y NO es protección completa frente a un
 * actor concurrente que cambie un enlace entre la comprobación y la escritura. Cerrar esa
 * ventana exigiría identificadores de archivo con `O_NOFOLLOW` por operación, que Node no
 * expone de forma portátil; se declara en vez de fingirse.
 */
function assertInsidePerimeter({ home, target, label }) {
  const base = physicalHome(home);
  const destino = resolve(target);
  const rel = relative(base, destino);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`${label}: ${destino} is outside the HOME perimeter ${base}`);
  }

  const partes = rel.split(sep).filter(Boolean);
  let cursor = base;
  for (const parte of partes) {
    cursor = join(cursor, parte);
    let st;
    try {
      // lstat also sees dangling symbolic links; existsSync follows links and returns false
      // for a dangling target, which would otherwise skip the perimeter check.
      st = lstatSync(cursor);
    } catch (error) {
      if (error?.code === "ENOENT") break; // lo que no existe todavía lo crea el propio mkdir
      throw error;
    }
    if (st.isSymbolicLink()) {
      throw new Error(`${label}: refusing a symbolic-link component at ${cursor} (the write would land outside the declared destination)`);
    }
    if (cursor !== destino && !st.isDirectory()) {
      throw new Error(`${label}: refusing non-directory path component at ${cursor}`);
    }
  }

  // Y la comprobación física de verdad: resolver el destino y ver dónde cae.
  const existente = cursor;
  if (existsSync(existente)) {
    const real = realpathSync.native(existente);
    const relReal = relative(base, real);
    if (relReal.startsWith("..") || isAbsolute(relReal)) {
      throw new Error(`${label}: ${real} resolves outside the HOME perimeter ${base}`);
    }
  }
}

function preflightLocalEntry({ home, host }) {
  if (!LOCAL_HOSTS.includes(host)) {
    throw new Error(`Unknown host "${host}"; the local entry is installed for ${LOCAL_HOSTS.join(", ")}`);
  }
  const base = join(physicalHome(home), LOCAL_HOME_DIR);
  const paths = {
    stagingRoot: join(base, "staging"),
    transactionRoot: join(base, "staging", `${host}-entry-transaction`),
    entryRoot: join(base, "entry", host),
    receiptPath: join(base, "entry", `${host}.receipt.json`),
    packageRoot: join(base, "p"),
  };
  for (const [label, target] of Object.entries(paths)) {
    assertInsidePerimeter({ home, target, label: `local ${label}` });
  }
  if (existsSync(paths.entryRoot) && !lstatSync(paths.entryRoot).isDirectory()) {
    throw new Error(`Local entry destination is not a directory: ${paths.entryRoot}`);
  }
  if (existsSync(paths.receiptPath) && !lstatSync(paths.receiptPath).isFile()) {
    throw new Error(`Local entry receipt destination is not a regular file: ${paths.receiptPath}`);
  }
  if (existsSync(paths.stagingRoot) && !lstatSync(paths.stagingRoot).isDirectory()) {
    throw new Error(`Local entry staging destination is not a directory: ${paths.stagingRoot}`);
  }
  if (existsSync(paths.transactionRoot) && !lstatSync(paths.transactionRoot).isDirectory()) {
    throw new Error(`Local entry transaction destination is not a directory: ${paths.transactionRoot}`);
  }
  if (existsSync(paths.packageRoot) && !lstatSync(paths.packageRoot).isDirectory()) {
    throw new Error(`Local package destination is not a directory: ${paths.packageRoot}`);
  }
  return paths;
}

/** Recover an interrupted local-entry transaction on the next invocation. */
export function recoverLocalEntry({ transactionRoot, entryRoot, receiptPath, rename = renameSync, remove = rmSync, exists = existsSync }) {
  if (!exists(transactionRoot)) return "none";
  const manifestPath = join(transactionRoot, "transaction.json");
  if (!exists(manifestPath)) {
    remove(transactionRoot, { recursive: true, force: true });
    return "discarded-uncommitted-staging";
  }
  // Un manifiesto truncado o ilegible no puede decidir qué restaurar. Antes este `JSON.parse`
  // lanzaba fuera de todo `try`, dejaba el staging en su sitio y, como el nombre es fijo, el
  // bloqueo se repetía en cada intento. Se descarta el staging y se dice cuál fue el motivo.
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    remove(transactionRoot, { recursive: true, force: true });
    return "discarded-corrupt-manifest";
  }
  const backupEntry = join(transactionRoot, "previous-entry");
  const backupReceipt = join(transactionRoot, "previous-receipt.json");
  let published = false;
  try {
    published = treeDigest(entryRoot) === manifest.digest &&
      JSON.parse(readFileSync(receiptPath, "utf8")).digest === manifest.digest;
  } catch { /* an incomplete publication is restored below */ }
  if (published) {
    remove(transactionRoot, { recursive: true, force: true });
    return "committed";
  }

  const recoveryErrors = [];
  try {
    if (manifest.hadEntry && exists(backupEntry)) {
      if (exists(entryRoot)) remove(entryRoot, { recursive: true, force: true });
      rename(backupEntry, entryRoot);
    } else if (!manifest.hadEntry && exists(entryRoot)) {
      remove(entryRoot, { recursive: true, force: true });
    }
  } catch (error) { recoveryErrors.push(error); }
  try {
    if (manifest.hadReceipt && exists(backupReceipt)) {
      if (exists(receiptPath)) remove(receiptPath, { force: true });
      rename(backupReceipt, receiptPath);
    } else if (!manifest.hadReceipt && exists(receiptPath)) {
      remove(receiptPath, { force: true });
    }
  } catch (error) { recoveryErrors.push(error); }
  if (recoveryErrors.length) {
    throw new AggregateError(recoveryErrors, `Local entry recovery is incomplete; inspect ${transactionRoot}`);
  }
  remove(transactionRoot, { recursive: true, force: true });
  return "restored-previous-entry";
}

/** Public for deterministic failure-path tests; callers should use installLocalEntry. */
export function replaceLocalEntry({ transactionRoot, stagedEntry, entryRoot, stagedReceipt, receiptPath, digest, verify = () => true, rename = renameSync, remove = rmSync, exists = existsSync }) {
  mkdirSync(transactionRoot, { recursive: true });
  const backupEntry = join(transactionRoot, "previous-entry");
  const backupReceipt = join(transactionRoot, "previous-receipt.json");
  writeFileSync(join(transactionRoot, "transaction.json"), JSON.stringify({
    digest,
    hadEntry: exists(entryRoot),
    hadReceipt: exists(receiptPath),
  }, null, 2) + "\n", "utf8");
  try {
    if (exists(entryRoot)) rename(entryRoot, backupEntry);
    if (exists(receiptPath)) rename(receiptPath, backupReceipt);
    rename(stagedEntry, entryRoot);
    rename(stagedReceipt, receiptPath);
    if (!verify()) throw new Error("published entry or receipt did not verify");
    remove(transactionRoot, { recursive: true, force: true });
    return true;
  } catch (cause) {
    try { recoverLocalEntry({ transactionRoot, entryRoot, receiptPath, rename, remove, exists }); }
    catch (recoveryError) { throw new AggregateError([cause, recoveryError], `Local entry replacement failed and rollback needs recovery; inspect ${transactionRoot}`); }
    throw new Error(`Local entry replacement failed; previous entry and receipt were restored: ${cause.message}`, { cause });
  }
}

function recoverManagedPath({ transactionRoot, destination }) {
  if (!existsSync(transactionRoot)) return;
  const manifestPath = join(transactionRoot, "transaction.json");
  if (!existsSync(manifestPath)) {
    rmSync(transactionRoot, { recursive: true, force: true });
    return;
  }
  // Misma regla que en la entrada local: un manifiesto ilegible no puede decidir qué dejar
  // atrás, así que el staging se descarta en vez de bloquear la instalación con una excepción.
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    rmSync(transactionRoot, { recursive: true, force: true });
    return;
  }
  const backup = join(transactionRoot, "previous");
  if (treeDigest(destination) === manifest.digest) {
    rmSync(transactionRoot, { recursive: true, force: true });
    return;
  }
  if (manifest.hadDestination && existsSync(backup)) {
    if (existsSync(destination)) rmSync(destination, { recursive: true, force: true });
    renameSync(backup, destination);
  } else if (!manifest.hadDestination && existsSync(destination)) {
    rmSync(destination, { recursive: true, force: true });
  }
  rmSync(transactionRoot, { recursive: true, force: true });
}

/** Replace one host-managed path only after its staged copy has the source digest. */
export function replaceManagedPath({ home, host, source, destination, label, rename = renameSync, remove = rmSync, copy = cpSync, exists = existsSync }) {
  const digest = treeDigest(source);
  if (!digest) throw new Error(`${label}: source is missing: ${source}`);
  const id = createHash("sha256").update(resolve(destination)).digest("hex").slice(0, 12);
  const transactionRoot = join(physicalHome(home), LOCAL_HOME_DIR, "staging", `${host}-managed-${id}`);
  const staged = join(transactionRoot, basename(source));
  const backup = join(transactionRoot, "previous");
  assertInsidePerimeter({ home, target: transactionRoot, label: `${label} transaction` });
  assertInsidePerimeter({ home, target: destination, label: `${label} destination` });
  recoverManagedPath({ transactionRoot, destination });
  mkdirSync(transactionRoot, { recursive: true });
  try {
    copy(source, staged, { recursive: true, force: true });
    if (treeDigest(staged) !== digest) throw new Error(`${label}: staged bytes do not match the source`);
    writeFileSync(join(transactionRoot, "transaction.json"), JSON.stringify({
      digest,
      hadDestination: exists(destination),
    }, null, 2) + "\n", "utf8");
    if (exists(destination)) rename(destination, backup);
    rename(staged, destination);
    if (treeDigest(destination) !== digest) throw new Error(`${label}: published bytes do not match the source`);
    remove(transactionRoot, { recursive: true, force: true });
    return true;
  } catch (cause) {
    const recoveryErrors = [];
    const hadManifest = exists(join(transactionRoot, "transaction.json"));
    try {
      if (hadManifest) recoverManagedPath({ transactionRoot, destination });
      else remove(transactionRoot, { recursive: true, force: true });
    } catch (error) { recoveryErrors.push(error); }
    if (recoveryErrors.length) {
      throw new AggregateError([cause, ...recoveryErrors], `${label}: replacement failed; inspect transaction ${transactionRoot}`);
    }
    throw new Error(`${label}: staged replacement failed; previous path was restored when present: ${cause.message}`, { cause });
  }
}

/** Valida el bundle completo antes de cualquier escritura. Nombra lo que falta. */
export function validateLocalBundle(packageRoot) {
  const root = resolve(packageRoot);
  const base = existsSync(root) ? realpathSync.native(root) : root;
  const faltan = [];

  for (const rel of LOCAL_CHAIN) {
    const p = chainPath(root, rel);
    if (!existsSync(p)) { faltan.push(`${rel} (missing)`); continue; }
    const st = lstatSync(p);
    if (st.isSymbolicLink()) { faltan.push(`${rel} (symbolic link)`); continue; }
    if (!st.isFile()) { faltan.push(`${rel} (not a regular file)`); continue; }
    const real = realpathSync.native(p);
    const relReal = relative(base, real);
    if (relReal.startsWith("..") || isAbsolute(relReal)) {
      faltan.push(`${rel} (resolves outside the package)`);
    }
  }

  if (faltan.length) {
    throw new Error(
      `Incomplete Lore Plugin bundle at ${root}: ${faltan.join(", ")}. ` +
      "The local entry and everything it imports are required; install refuses before changing anything.",
    );
  }
  return true;
}

/**
 * Instala la entrada local de un host.
 *
 * Preflight completo antes de la primera mutación; staging separado; publicación por
 * `rename`, que es atómico dentro del mismo volumen; y verificación por digest después.
 */
export function installLocalEntry({ home, packageRoot, host = "claude" }) {
  if (!LOCAL_HOSTS.includes(host)) {
    throw new Error(`Unknown host "${host}"; the local entry is installed for ${LOCAL_HOSTS.join(", ")}`);
  }
  validateLocalBundle(packageRoot);

  const kitRoot = resolve(packageRoot);
  const localPaths = preflightLocalEntry({ home, host });
  recoverLocalEntry({ transactionRoot: localPaths.transactionRoot, entryRoot: localPaths.entryRoot, receiptPath: localPaths.receiptPath });
  const base = join(physicalHome(home), LOCAL_HOME_DIR);
  const staging = join(base, "staging", `${host}-${randomBytes(6).toString("hex")}`);
  const entryRoot = localPaths.entryRoot;
  const receiptPath = localPaths.receiptPath;

  // Todo destino que se vaya a tocar o crear, comprobado antes de tocar ninguno.
  for (const [label, target] of [
    ["local entry staging", staging],
    ["local entry", entryRoot],
    ["local entry receipt", receiptPath],
  ]) {
    assertInsidePerimeter({ home, target, label });
  }

  // El conjunto que se distribuye, y su digest: la procedencia que se certifica es la del
  // contenido instalado, no la de un número de versión que nadie cotejó.
  const stagingDir = join(staging, "set");
  mkdirSync(stagingDir, { recursive: true });
  for (const rel of LOCAL_CHAIN) {
    const dest = chainPath(stagingDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(chainPath(kitRoot, rel), dest, { force: true });
  }
  const digest = treeDigest(stagingDir);

  // Paquete inmutable, direccionado por contenido.
  const packageDir = join(base, "p", digest.slice(0, 12));
  assertInsidePerimeter({ home, target: packageDir, label: "local package" });

  if (!existsSync(packageDir)) {
    mkdirSync(dirname(packageDir), { recursive: true });
    renameSync(stagingDir, packageDir);
  } else {
    // Ya existe: se comprueba y no se reescribe. Un paquete publicado es inmutable.
    const existing = treeDigest(packageDir);
    if (existing !== digest) {
      rmSync(stagingDir, { recursive: true, force: true });
      throw new Error(`Local package ${packageDir} exists with different bytes (${existing} != ${digest}); refusing to overwrite a published cut`);
    }
    rmSync(stagingDir, { recursive: true, force: true });
  }

  // Preparar y verificar el reemplazo entero antes de mover la entrada activa.
  const stagedEntry = join(staging, "entry");
  cpSync(packageDir, stagedEntry, { recursive: true, force: true });
  if (treeDigest(stagedEntry) !== digest) {
    rmSync(staging, { recursive: true, force: true });
    throw new Error(`Staged local entry for ${host} does not match its package digest`);
  }
  const receipt = {
    host,
    digest,
    packageDir,
    entryRoot,
    chain: [...LOCAL_CHAIN],
    installedAt: new Date().toISOString(),
  };
  const stagedReceipt = join(staging, "receipt.json");
  writeFileSync(stagedReceipt, JSON.stringify(receipt, null, 2) + "\n", "utf8");
  mkdirSync(dirname(entryRoot), { recursive: true });
  const verified = replaceLocalEntry({
    transactionRoot: localPaths.transactionRoot, stagedEntry, entryRoot, stagedReceipt, receiptPath, digest,
    verify: () => treeDigest(entryRoot) === digest && JSON.parse(readFileSync(receiptPath, "utf8")).digest === digest,
  });
  rmSync(staging, { recursive: true, force: true });

  return {
    verified,
    cliRoot: base,
    entryRoot,
    packageRoot: packageDir,
    digest,
    receipt,
    receiptPath,
  };
}

/** Alias compatible con el nombre que usaba el candidato anterior. */
export function installCli(args) {
  return installLocalEntry(args);
}

/**
 * Claude. Antes no tenía rama propia: `install claude` caía en el uso y el host recibía la
 * instrucción de la prosa sin la capacidad que la prosa invoca.
 */
export function installClaude({ home, packageRoot }) {
  const cli = installLocalEntry({ home, packageRoot, host: "claude" });
  return {
    host: "claude",
    entryRoot: cli.entryRoot,
    packageRoot: cli.packageRoot,
    digest: cli.digest,
    cli,
    // La carga de la skill la resuelve el marketplace de Claude; la capacidad que este
    // instalador redistribute es la local, y se declara por separado para no prometer más.
    marketplace: { commands: claudeCommands(), installedCopy: claudePluginInstallPath },
  };
}

// Lo que un árbol fuente trae y no es parte de lo que se instala lo decide la lista de
// publicación del manifiesto, no una lista de pièces escrita aparte: `files` es lo que el
// paquete entrega, y una lista de exclusión hacía que cualquier archivo nuevo del árbol
// viajara a la carpeta de Codex sin que nadie lo nombrara. Cuando el manifiesto no declara
// `files` se usa la lista de piezas del kit, que es la misma en forma, nunca «todo lo demás».
const CODEX_DEFAULT_SHIPPED = [
  ".claude-plugin/", ".codex-plugin/", "assets/", "commands/", "docs/", "hooks/", "skills/",
  "scripts/install-claude-statusline.mjs", "scripts/installer.mjs", "scripts/hygiene.mjs",
  "scripts/lore-cli.mjs", "scripts/lore-plugin.mjs", "scripts/opencode-permissions.mjs",
  "scripts/operation-cli.mjs", "README.md", "LICENSE", "NOTICE",
];

// El manifiesto viaja siempre: es lo que identifica lo instalado.
const CODEX_ALWAYS_SHIPPED = ["package.json"];

function codexPlan(packageRoot) {
  const manifestPath = join(packageRoot, "package.json");
  // Un manifiesto ilegible es un manifiesto que no declara qué publica: se aplica la lista de
  // piezas del kit, que es acotada. Nunca se cae en «todo lo que hay en el primer nivel».
  let manifest = {};
  try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { manifest = {}; }
  if (!manifest || typeof manifest !== "object") manifest = {};
  const declared = Array.isArray(manifest.files) && manifest.files.length ? manifest.files : CODEX_DEFAULT_SHIPPED;
  const entries = [...declared.map(String), ...CODEX_ALWAYS_SHIPPED];
  const plan = new Map();
  for (const entry of entries) {
    const rel = entry.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+|\/+$/g, "");
    if (!rel || rel.startsWith("..")) continue;
    const [top, ...rest] = rel.split("/");
    if (rest.length === 0) { plan.set(top, null); continue; }
    const files = plan.get(top);
    if (files === null) continue;
    plan.set(top, [...(files ?? []), rest.join("/")]);
  }
  return plan;
}

export function codexComponents(packageRoot) {
  return [...codexPlan(packageRoot).keys()].sort();
}

function stageCodexComponent(plan, packageRoot, name, stageRoot) {
  const files = plan.get(name);
  const source = join(packageRoot, name);
  if (files === null || !existsSync(source)) return source;
  const staged = join(stageRoot, name);
  for (const rel of files) {
    const from = join(source, ...rel.split("/"));
    if (!existsSync(from)) continue;
    const to = join(staged, ...rel.split("/"));
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
  }
  return staged;
}

export function installCodex({ home, packageRoot }) {
  // Preflight antes de mutar: el bundle primero. Antes se modificaban componentes y
  // marketplace y solo después se descubría que el conjunto no estaba.
  validateLocalBundle(packageRoot);
  preflightLocalEntry({ home, host: "codex" });

  const marketplaceRoot = join(home, ".agents", "plugins");
  const pluginRoot = join(marketplaceRoot, "plugins", "lore");
  const marketplacePath = join(marketplaceRoot, "marketplace.json");

  // Validate before reading too: a pre-existing symlink must not redirect either the
  // marketplace read or the later write outside the declared HOME perimeter.
  assertInsidePerimeter({ home, target: marketplacePath, label: "Codex marketplace file" });

  const market = existsSync(marketplacePath)
    ? JSON.parse(readFileSync(marketplacePath, "utf8"))
    : { name: "personal", interface: { displayName: "Personal" }, plugins: [] };

  // Todos los destinos, comprobados antes de crear o borrar ninguno. El origen no va por
  // aquí: el repositorio vive fuera de HOME por definición, y `validateLocalBundle` ya
  // comprobó que cada miembro existe, es un archivo regular y resuelve dentro del paquete.
  const plan = codexPlan(packageRoot);
  const components = [...plan.keys()].sort();
  for (const name of components) {
    assertInsidePerimeter({ home, target: join(pluginRoot, name), label: `Codex destination ${name}` });
  }
  assertInsidePerimeter({ home, target: pluginRoot, label: "Codex plugin root" });
  assertInsidePerimeter({ home, target: marketplaceRoot, label: "Codex marketplace root" });
  // Repeat immediately before mutation to catch a path changed after the pre-read check.
  assertInsidePerimeter({ home, target: marketplacePath, label: "Codex marketplace file" });

  if (existsSync(pluginRoot) && lstatSync(pluginRoot).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link plugin directory: ${pluginRoot}`);
  }
  mkdirSync(pluginRoot, { recursive: true });

  // `scripts/` viaja porque el kit lo invoca por nombre: la apertura de sesion corre
  // `lore-plugin mycelium bodies` y el Anuncio reclama su franja con `mycelium announce`.
  // Sin el, Codex recibe la prosa que manda correr un comando que ese host no tiene. De `scripts/`
  // viaja solo lo que el manifiesto publica, que es la cadena de importacion del CLI.
  const stageRoot = join(physicalHome(home), LOCAL_HOME_DIR, "staging", `codex-pick-${randomBytes(6).toString("hex")}`);
  let verified = false;
  try {
    for (const name of components) {
      const source = stageCodexComponent(plan, packageRoot, name, stageRoot);
      const destination = join(pluginRoot, name);
      if (existsSync(source)) replaceManagedPath({ home, host: "codex", source, destination, label: `Codex component ${name}` });
    }
    verified = components
      .filter((name) => existsSync(stageCodexComponent(plan, packageRoot, name, stageRoot)))
      .every((name) => sameTree(stageCodexComponent(plan, packageRoot, name, stageRoot), join(pluginRoot, name)));
  } finally {
    rmSync(stageRoot, { recursive: true, force: true });
  }

  market.plugins ??= [];
  const previous = market.plugins.findIndex((entry) => entry.name === "lore");
  if (previous === -1) market.plugins.push(loreEntry);
  else market.plugins[previous] = loreEntry;
  mkdirSync(marketplaceRoot, { recursive: true });
  writeFileSync(marketplacePath, JSON.stringify(market, null, 2) + "\n");


  const cli = installLocalEntry({ home, packageRoot, host: "codex" });
  return {
    pluginRoot,
    marketplacePath,
    cliRoot: cli.cliRoot,
    entryRoot: cli.entryRoot,
    digest: cli.digest,
    cli,
    verified: verified && cli.verified,
  };
}

// Lo que OpenCode v1.18.33 carga de verdad: `ConfigPlugin.load` barre
// `{plugin,plugins}/*.{ts,js}` en el directorio de configuración, sin recursión. Eso obliga a
// dos cosas que el código de arriba no dice solo: el adaptador tiene que ser `.js` —`.mjs`
// queda fuera del patrón— y el núcleo que comparte con los otros dos hosts se instala como
// `.mjs` para que el runtime no lo tome por un segundo plugin. Un solo archivo es plugin.
//
// `lore-turno.mjs` entra porque el adaptador lo importa para el registro por turno: sin él en
// la lista, el plugin instalado revienta al importar y TODO el guard de OpenCode deja de
// funcionar. Lo que se importa tiene que estar en la lista; es la misma ley de la que trata
// el test del plugin de una sola función.
const OPENCODE_PLUGIN = [
  "opencode-plugin.js",
  "opencode-input.mjs",
  "lore-guard.mjs",
  "lore-state.mjs",
  "lore-turno.mjs",
];
const OPENCODE_TUI_PLUGIN = "opencode-statusline.tui.tsx";
const OPENCODE_TUI_ENTRY = `./plugins/${OPENCODE_TUI_PLUGIN}`;

export function installOpenCode({ home, packageRoot }) {
  // Preflight: el bundle y TODOS los destinos, antes de la primera escritura. Antes se
  // copiaban skills y plugins y solo al final se descubría un problema.
  validateLocalBundle(packageRoot);
  preflightLocalEntry({ home, host: "opencode" });

  const configRoot = join(home, ".config", "opencode");
  const sourceRoot = join(packageRoot, "skills");
  const skillsRoot = join(configRoot, "skills");
  const pluginRoot = join(configRoot, "plugin");
  const tuiRoot = join(configRoot, "plugins");
  const tuiConfigPath = join(configRoot, "tui.json");
  const versionReceiptPath = join(configRoot, "lore-plugin.json");
  const packageManifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const kernelProvenance = readFileSync(join(packageRoot, "skills", "vespi", "core", "kernel", "SOURCE.md"), "utf8");
  const kernelVersion = kernelProvenance.match(/Vespi kernel \*\*(\d+\.\d+\.\d+)\*\*/)?.[1] ?? null;
  if (typeof packageManifest.version !== "string" || !kernelVersion) {
    throw new Error("OpenCode install requires package.json version and Vespi kernel version provenance");
  }
  const tuiSource = join(packageRoot, "hooks", "opencode-statusline.tui.tsx");
  const tuiDestination = join(tuiRoot, OPENCODE_TUI_PLUGIN);

  // Validate the TUI side before changing skills or server plugins. The CLI cannot
  // safely merge JSONC in this version, so do not create a partial installation.
  if (existsSync(join(configRoot, "tui.jsonc"))) {
    throw new Error("OpenCode tui.jsonc exists; refusing to edit a second TUI configuration");
  }
  const tuiConfig = existsSync(tuiConfigPath)
    ? JSON.parse(readFileSync(tuiConfigPath, "utf8"))
    : {};
  if (!tuiConfig || typeof tuiConfig !== "object" || Array.isArray(tuiConfig)) {
    throw new Error("OpenCode tui.json must contain an object");
  }
  if (tuiConfig.plugin !== undefined && !Array.isArray(tuiConfig.plugin)) {
    throw new Error("OpenCode tui.json plugin must be an array");
  }
  tuiConfig.plugin ??= [];
  if (!tuiConfig.plugin.includes(OPENCODE_TUI_ENTRY)) tuiConfig.plugin.push(OPENCODE_TUI_ENTRY);
  if (!existsSync(tuiSource)) throw new Error(`Missing OpenCode TUI plugin: ${tuiSource}`);

  // Perímetro de todo lo que se va a tocar, comprobado antes de tocarlo.
  for (const [label, target] of [
    ["OpenCode skills root", skillsRoot],
    ["OpenCode plugin root", pluginRoot],
    ["OpenCode TUI root", tuiRoot],
    ["OpenCode TUI config", tuiConfigPath],
    ["OpenCode TUI plugin", tuiDestination],
    ["OpenCode Lore version receipt", versionReceiptPath],
  ]) {
    assertInsidePerimeter({ home, target, label });
  }

  if (existsSync(versionReceiptPath)) {
    if (lstatSync(versionReceiptPath).isSymbolicLink() || !lstatSync(versionReceiptPath).isFile()) {
      throw new Error(`Refusing to replace a non-regular OpenCode Lore version receipt: ${versionReceiptPath}`);
    }
    const oldReceipt = JSON.parse(readFileSync(versionReceiptPath, "utf8"));
    if (oldReceipt.name !== "@andresanemic/lore-plugin") {
      throw new Error(`Refusing to replace a different file at ${versionReceiptPath}`);
    }
  }

  if (existsSync(tuiDestination) && lstatSync(tuiDestination).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link TUI plugin: ${tuiDestination}`);
  }
  if (existsSync(tuiDestination) && !sameTree(tuiSource, tuiDestination)) {
    throw new Error(`Refusing to replace a different TUI plugin at ${tuiDestination}`);
  }

  mkdirSync(skillsRoot, { recursive: true });
  for (const entry of readdirSync(sourceRoot, { withFileTypes: true }).filter((item) => item.isDirectory())) {
    const source = join(sourceRoot, entry.name);
    const destination = join(skillsRoot, entry.name);
    replaceManagedPath({ home, host: "opencode", source, destination, label: `OpenCode skill ${entry.name}` });
  }
  const skillsVerificadas = readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .every((entry) => sameTree(join(sourceRoot, entry.name), join(skillsRoot, entry.name)));

  if (existsSync(pluginRoot) && lstatSync(pluginRoot).isSymbolicLink()) {
    throw new Error(`Refusing to replace symbolic-link plugin directory: ${pluginRoot}`);
  }
  mkdirSync(pluginRoot, { recursive: true });
  for (const nombre of OPENCODE_PLUGIN) {
    const source = join(packageRoot, "hooks", nombre);
    const destination = join(pluginRoot, nombre);
    if (!existsSync(source)) throw new Error(`Missing OpenCode plugin file: ${source}`);
    replaceManagedPath({ home, host: "opencode", source, destination, label: `OpenCode plugin ${nombre}` });
  }

  const pluginVerificado = OPENCODE_PLUGIN
    .every((nombre) => sameTree(join(packageRoot, "hooks", nombre), join(pluginRoot, nombre)));

  // OpenCode 1.18.33 loads TUI plugins from `tui.json`, separately from server plugins.
  // Preserve user entries and fail closed on JSONC or malformed settings.
  mkdirSync(tuiRoot, { recursive: true });
  replaceManagedPath({ home, host: "opencode", source: tuiSource, destination: tuiDestination, label: "OpenCode TUI plugin" });
  writeFileSync(tuiConfigPath, JSON.stringify(tuiConfig, null, 2) + "\n");
  const tuiVerificado = sameTree(tuiSource, tuiDestination) &&
    JSON.parse(readFileSync(tuiConfigPath, "utf8")).plugin.includes(OPENCODE_TUI_ENTRY);

  const cli = installLocalEntry({ home, packageRoot, host: "opencode" });

  // OpenCode stores individual skills and hooks, not the package manifest. Keep a small
  // Lore-owned version receipt beside them so a read-only host audit can report exactly
  // which package version the copied skills came from.
  const versionReceipt = { name: "@andresanemic/lore-plugin", version: packageManifest.version, kernelVersion };
  writeFileSync(versionReceiptPath, JSON.stringify(versionReceipt, null, 2) + "\n", "utf8");
  const versionVerified = JSON.parse(readFileSync(versionReceiptPath, "utf8")).version === packageManifest.version;

  // Los plugins locales se autodescubren: instalar no es editar `opencode.jsonc`. Se copia
  // encima de lo que hubiera y no se toca ningún otro archivo del directorio, porque ahí
  // viven los plugins de otra persona.
  return {
    skillsRoot,
    pluginRoot,
    tuiRoot,
    tuiConfigPath,
    versionReceiptPath,
    cliRoot: cli.cliRoot,
    entryRoot: cli.entryRoot,
    digest: cli.digest,
    cli,
    verified: skillsVerificadas && pluginVerificado && tuiVerificado && cli.verified && versionVerified,
  };
}
