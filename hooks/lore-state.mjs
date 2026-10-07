// Estado del Lore de un árbol, por contenido — Lore Plugin.
//
// El único piso común que tienen los dos hosts y todos los usuarios es el sistema
// de archivos. No `git` (no es requisito del kit, y hay árboles de Lore sin él),
// no el transcript (invisible a las escrituras por script), no lo que el agente
// diga haber corrido (una frase no es un hecho).
//
// Se usa desde la guardia de Codex y desde los subcomandos locales de `lore-plugin mycelium`.

import { createHash, randomUUID } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";

// Un archivo de Lore: un `.md` dentro de un `lore/`, o uno de los nombres
// distintivos de criterio en cualquier nivel. FASES/PHASES es estado y nunca entra.
const LORE_DIR = /(^|[/\\])lore[/\\][^/\\]+\.md$/i;
const LORE_FILE = /(^|[/\\])(principios|principles|identidad|identity|enrutamiento|routing)\.md$/i;
const PHASE_FILE = /(^|[/\\])(FASES|PHASES)\.md$/i;

// Directorios universales de dependencias y artefactos, más las dos formas en que
// un árbol contiene Lore que no es suyo: **fixtures** (dato de prueba) y **backups**
// (una copia de otro árbol). El principio detrás de las dos es el mismo — *una copia
// de un Lore no es el Lore del árbol que la contiene* — y la frontera es honesta: el
// recorrido no puede distinguir una copia cualquiera de un original, así que se apoya
// en convenciones de nombre. Un árbol que guarde copias con otro nombre las verá
// contadas, y su digest se moverá cuando esas copias se regeneren.
//
// No se listan nombres de carpeta propios de ningún ecosistema: generalizar desde un
// solo caso es cómo una forma se lleva puesto lo que era propio de ese caso.
const SKIP = new Set([
  "node_modules", ".git", ".venv", "venv", "dist", "build", "coverage",
  ".next", "__pycache__",
  "fixtures", "__fixtures__", "test-fixtures",
  "_backup", "backup", "backups", ".backup",
]);

const MAX_DEPTH = 6;
const MAX_BYTES = 2_000_000;

export const RECEIPT = ".lore-mycelium";

// El receipt distingue entre escaneo estructural (bodies/federated) y escaneo completo
// (cada pista con su paso). El cierre de MYCELIUM no se da por hecho tras correr solo
// los escaneos estructurales: el receipt registra qué tipo de escaneo se hizo.
export const SWEEP_TYPES = ["structural", "full"];
export const SWEEP_TYPE_DEFAULT = "structural";

export function loreFiles(root, { maxDepth = MAX_DEPTH } = {}) {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (!SKIP.has(e.name)) walk(full, depth + 1);
      } else if (e.isFile() && !PHASE_FILE.test(full)
        && (LORE_DIR.test(full) || LORE_FILE.test(full))) {
        found.push(full);
      }
    }
  };
  walk(root, 0);
  return found.sort();
}

function normalizedBody(file) {
  return readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function loreBodies(files) {
  const bodies = new Map();
  for (const file of files) {
    try {
      if (statSync(file).size <= MAX_BYTES) bodies.set(file, normalizedBody(file));
    } catch {}
  }
  return bodies;
}

function digestBodies(root, files, bodies) {
  const h = createHash("sha256");
  for (const file of files) {
    const body = bodies.get(file);
    if (body === undefined) continue;
    h.update(relative(root, file).split(sep).join("/"));
    h.update("\0");
    h.update(createHash("sha256").update(body).digest("hex"));
    h.update("\n");
  }
  return h.digest("hex");
}

// Digest por CONTENIDO, no por mtime: tocar un archivo sin cambiarlo no cuenta,
// y el mismo árbol da el mismo digest en otra máquina.
export function digest(root) {
  const files = loreFiles(root);
  return digestBodies(root, files, loreBodies(files));
}

const CONTRACTS = ["CLAUDE.md", "AGENTS.md"];
const BLOCK = /<!--\s*lore:always-on\s*-->([\s\S]*?)<!--\s*\/lore:always-on\s*-->/;

function alwaysOnFiles(root) {
  const contract = CONTRACTS.find((name) => existsSync(join(root, name)));
  if (!contract) return [];

  let scope;
  try {
    scope = BLOCK.exec(readFileSync(join(root, contract), "utf8"))?.[1];
  } catch {
    return [];
  }
  if (!scope) return [];

  const found = new Set();
  for (const match of scope.matchAll(/`([^`]+)`/g)) {
    const pointer = match[1].trim();
    const segments = pointer.split(/[/\\]+/);
    if (isAbsolute(pointer)
      || !pointer.toLowerCase().endsWith(".md")
      || !segments.some((part) => /^(lore|canon)$/i.test(part))
      || /^(FASES|PHASES)\.md$/i.test(basename(pointer))) continue;

    const file = resolve(root, pointer);
    try {
      if (statSync(file).isFile()) found.add(file);
    } catch {}
  }
  return [...found];
}

export function snapshot(root) {
  const files = loreFiles(root);
  const bodies = loreBodies(files);
  return {
    digest: digestBodies(root, files, bodies),
    fileCount: files.length,
    alwaysOnBytes: alwaysOnFiles(root).reduce((sum, file) =>
      sum + Buffer.byteLength(bodies.get(file) ?? normalizedBody(file)), 0),
  };
}

export function readReceipt(root) {
  try {
    const raw = readFileSync(join(root, RECEIPT), "utf8").trim();
    if (/^[0-9a-f]{64}$/.test(raw)) {
      return { version: 1, digest: raw, alwaysOnBytes: null };
    }
    const receipt = JSON.parse(raw);
    if (receipt?.version !== 2
      || !/^[0-9a-f]{64}$/.test(receipt.digest)
      || !Number.isInteger(receipt.alwaysOnBytes)
      || receipt.alwaysOnBytes < 0) return null;

    const state = {
      version: 2,
      digest: receipt.digest,
      alwaysOnBytes: receipt.alwaysOnBytes,
      sweepType: SWEEP_TYPES.includes(receipt.sweepType) ? receipt.sweepType : SWEEP_TYPE_DEFAULT,
    };
    // El pool solo aparece si está: un recibo sin Anuncio y uno con el pool en
    // cero no son el mismo hecho, y la clave ausente es la que dice «nunca hubo».
    const announce = readAnnounce(receipt.announce);
    if (announce) state.announce = announce;
    return state;
  } catch {
    return null;
  }
}

export function writeReceipt(root, state = snapshot(root)) {
  if (!state
    || !/^[0-9a-f]{64}$/.test(state.digest)
    || !Number.isInteger(state.alwaysOnBytes)
    || state.alwaysOnBytes < 0) {
    throw new TypeError("Invalid Lore snapshot");
  }

  const sweepType = SWEEP_TYPES.includes(state.sweepType) ? state.sweepType : SWEEP_TYPE_DEFAULT;

  const receipt = {
    version: 2,
    digest: state.digest,
    alwaysOnBytes: state.alwaysOnBytes,
    sweepType,
  };
  // El pool del Anuncio sobrevive al barrido. Sin esto se borraría en cada
  // recibo, que es lo mismo que no llevar estado: el pool nunca se agotaría.
  const carried = state.announce ?? readReceipt(root)?.announce;
  if (carried) receipt.announce = carried;
  const target = join(root, RECEIPT);
  const temporary = join(root, `${RECEIPT}.${randomUUID()}.tmp`);
  try {
    writeFileSync(temporary, `${JSON.stringify(receipt)}\n`, { flag: "wx" });
    renameSync(temporary, target);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
  return receipt;
}

// --- pool del «Anuncio de proceso» (2.4.8) ----------------------------------
//
// El Anuncio es prosa que el agente emite, y el kit no lo escribe ni lo dispara:
// lo único que aporta acá es la ECUALIZACIÓN, para que la orientación no se
// vuelva ceremonia. Estado: un entero y un timestamp, dentro del recibo que ya
// existe. Ningún artefacto nuevo, y `mycelium bodies` sigue siendo de solo lectura.
//
// Tres límites, declarados en vez de insinuados — que es la propiedad de 2.4.8:
//
//   1. El pool se agota **por árbol**, no por sesión. «Nunca dos por sesión» no
//      es mecánico acá: el CLI no tiene `sessionId` —solo lo tiene el hook de
//      `SessionStart`— así que esa mitad vive como instrucción escrita en
//      `use-lore` y nada la verifica.
//   2. Sin recibo v2 no hay reclamo. Escribir uno desde este camino metería en el
//      árbol un digest que ningún barrido aceptó: exactamente la evidencia falsa
//      que esta versión vino a sacar. Un árbol sin barrido registrado no ecualiza.
//   3. El timestamp se guarda y no se lee. Es dato para juzgar su uso —¿tres
//      anuncios en un día o en un mes?—, no una ventana que caduque sola.

export const ANNOUNCE_POOL = 3;

function readAnnounce(value) {
  return Number.isInteger(value?.used) && value.used >= 0
    && Number.isInteger(value?.last) && value.last >= 0
    ? { used: value.used, last: value.last }
    : null;
}

export function claimAnnounce(root, { pool = ANNOUNCE_POOL, now = Date.now() } = {}) {
  const receipt = readReceipt(root);
  if (!receipt) return { granted: false, reason: "no-receipt", used: null, pool };

  const used = receipt.announce?.used ?? 0;
  if (used >= pool) return { granted: false, reason: "exhausted", used, pool };

  writeReceipt(root, { ...receipt, announce: { used: used + 1, last: now } });
  return { granted: true, reason: "claimed", used: used + 1, pool };
}

// --- base de sesión: el guard no evalúa hasta que el Lore cambia EN la sesión -
//
// El recibo `.lore-mycelium` dice qué estado de Lore quedó aceptado la última vez.
// Compararlo contra el árbol en el arranque hace que una sesión recién abierta
// intervenga por deuda que no es de ella: nadie revisa si algo está roto en el
// primer segundo, se empieza a trabajar. La base de sesión corrige eso —
// `SessionStart` la fija en silencio, y el guard solo evalúa cuando el digest
// actual se aparta de ella, es decir cuando ESTA sesión tocó el Lore.
//
// Vive en el tmp del sistema, no en el árbol: es efímera por sesión y no debe
// ensuciar el repo ni viajar en `git add`. Falla abierta en todo — si el tmp no
// está disponible, el guard trata la sesión como sin base y arma en el próximo
// cambio, nunca en el arranque.

export const SESSION_DIR = join(tmpdir(), "lore-plugin-sessions");

// La memoria de sesión vive en el tmp del sistema, y `mkdirSync(..., { mode })` solo(mode) en el
// momento de crear: un directorio plantado antes conservaba su modo, y uno que fuera un enlace
// se seguía como si fuera el del kit. Aquí se comprueba el directorio cada vez que se va a
// escribir: si es un enlace no se sigue, y si el modo abre el grupo o el resto se corrige.
// Devuelve el directorio, o `null` cuando no se puede usar (el callers ya falla abierto).
function sesionPrivada() {
  try {
    mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
  } catch {
    return null;
  }
  try {
    const st = lstatSync(SESSION_DIR);
    if (st.isSymbolicLink()) return null;
    if ((st.mode & 0o077) !== 0) chmodSync(SESSION_DIR, 0o700);
    return SESSION_DIR;
  } catch {
    return null;
  }
}

function sessionBaselinePath(sessionId, root) {
  const key = createHash("sha256")
    .update(`${sessionId ?? "no-session"}\0${resolve(root)}`)
    .digest("hex");
  return join(SESSION_DIR, `${key}.json`);
}

// La base guarda la firma completa del Lore al abrir la sesión —digest de
// contenido y `alwaysOnBytes`—, porque el guard evalúa las dos cosas: un cambio
// de contenido y una expansión material del bloque siempre-activo. Una expansión
// se hace editando el contrato (`CLAUDE.md`), que no es archivo de Lore y no
// mueve el digest; sin `alwaysOnBytes` en la base, esa expansión quedaría muda.

export function readSessionBaseline(sessionId, root) {
  try {
    const raw = readFileSync(sessionBaselinePath(sessionId, root), "utf8");
    const parsed = JSON.parse(raw);
    return /^[0-9a-f]{64}$/.test(parsed?.digest)
      && Number.isInteger(parsed?.alwaysOnBytes) && parsed.alwaysOnBytes >= 0
      ? { digest: parsed.digest, alwaysOnBytes: parsed.alwaysOnBytes }
      : null;
  } catch {
    return null;
  }
}

export function writeSessionBaseline(sessionId, root, state) {
  if (!state
    || !/^[0-9a-f]{64}$/.test(state.digest)
    || !Number.isInteger(state.alwaysOnBytes)
    || state.alwaysOnBytes < 0) return;
  try {
    if (!sesionPrivada()) return;
    const target = sessionBaselinePath(sessionId, root);
    const temporary = `${target}.${randomUUID()}.tmp`;
    writeFileSync(temporary,
      `${JSON.stringify({ digest: state.digest, alwaysOnBytes: state.alwaysOnBytes })}\n`,
      { mode: 0o600, flag: "wx" });
    renameSync(temporary, target);
  } catch {
    /* tmp no disponible: el guard arma en el próximo cambio, no en el arranque */
  }
}

// Raíz donde abrió la sesión, indexada solo por session_id: la jurisdicción se ancla
// ahí y no en el cwd, que en Claude Code sigue al `cd` del shell (NC-A-1, 2026-09-20).
function sessionRootPath(sessionId) {
  const key = createHash("sha256").update(`root\0${sessionId ?? "no-session"}`).digest("hex");
  return join(SESSION_DIR, `${key}.root.json`);
}

export function writeSessionRoot(sessionId, root) {
  if (!sessionId || !root) return;
  try {
    if (!sesionPrivada()) return;
    const target = sessionRootPath(sessionId);
    const temporary = `${target}.${randomUUID()}.tmp`;
    writeFileSync(temporary, `${JSON.stringify({ root: resolve(root) })}\n`, { mode: 0o600, flag: "wx" });
    renameSync(temporary, target);
  } catch {
    /* tmp no disponible: la jurisdicción cae al cwd */
  }
}

export function readSessionRoot(sessionId) {
  if (!sessionId) return null;
  try {
    const parsed = JSON.parse(readFileSync(sessionRootPath(sessionId), "utf8"));
    return typeof parsed?.root === "string" && parsed.root ? parsed.root : null;
  } catch {
    return null;
  }
}

// --- el conteo de turnos de esta sesión (R28) ---------------------------------
//
// El recordatorio por turno dice en qué turno va la sesión, y para que ese número
// signifique algo tiene que contar de verdad: si se calculara a mano, dos sesiones
// abiertas a la vez dirían las dos "turno 1" y el número mentiría.
//
// Vive en el mismo tmp que la base de sesión, por session_id y raiz, y es lo unico
// que se escribe ahi sin venir a revisar el Lore. Un archivo roto o ausente vale
// turno 1: el recordatorio tiene que llegar igual, y un contador que se traba
// convertiria una marca util en un turno que no avanza.

function sessionTurnPath(sessionId, root) {
  const key = createHash("sha256")
    .update(`turno\0${sessionId ?? "no-session"}\0${resolve(root)}`)
    .digest("hex");
  return join(SESSION_DIR, `${key}.turno.json`);
}

export function nextTurn(sessionId, root) {
  const target = sessionTurnPath(sessionId, root);
  let n = 0;
  try {
    const parsed = JSON.parse(readFileSync(target, "utf8"));
    if (Number.isInteger(parsed?.n) && parsed.n >= 0) n = parsed.n;
  } catch {
    /* sin archivo o ilegible: la sesion arranca en su primer turno */
  }
  const siguiente = n + 1;
  try {
    if (sesionPrivada()) {
      const temporal = `${target}.${randomUUID()}.tmp`;
      writeFileSync(temporal, `${JSON.stringify({ n: siguiente })}\n`, { mode: 0o600, flag: "wx" });
      renameSync(temporal, target);
    }
  } catch {
    /* tmp no disponible: el numero no avanza, y el recordatorio sigue llegando */
  }
  return siguiente;
}

// --- la marca de compactación (2.4.9) ------------------------------------------
//
// El 2026-10-04 el coordinador de una sesión se autocompactó y hubo que reconstruir el contexto
// leyendo archivos. El contrato del bot ya ordenaba cargar el triplete al ABRIR; nada le
// recordaba hacerlo DESPUÉS de compactar.
//
// La marca es el recordatorio más barato que existe y el único que no puede volverse texto para el
// modelo: un archivo en el tmp de la sesión. El `PreCompact` la escribe (cero bytes de salida), y
// el `SessionStart` de compactación la consume y avisa a la PERSONA. Nada de esto entra al
// contexto del modelo, que es la restricción medida del kit: un `additionalContext` se lo toma
// como instrucción de la persona y lo narra.
//
// El triplete es el trio que el kit ya nombraba: el contrato que eligió el host, el cuerpo que
// enruta el Lore de este árbol, y el estado. Se registra lo que EXISTE, no lo que debería: una
// lista de tres rutas donde una no está es una afirmación falsa sobre el árbol, y la marca se
// lee para volver a cargar, no para presumir de estructura.

export const COMPACT_MARK = "compactacion";

// Las tres ranuras del triplete, en ese orden, con las variantes que el propio kit ya nombra:
// `AGENTS.md` donde el host eligió ese contrato, `lore/enrutamiento.md` en un bot y `canon/`
// donde el canon vive aparte del `lore/`. Cada ranura aporta como mucho una ruta.
export const TRIPLETE = [
  ["CLAUDE.md", "AGENTS.md"],
  ["lore/index.md", "lore/enrutamiento.md", "canon/index.md", "canon/enrutamiento.md"],
  ["FASES.md", "PHASES.md"],
];

export function tripleteOf(root) {
  const encontrado = [];
  for (const ranuras of TRIPLETE) {
    const existe = ranuras.find((nombre) => {
      try {
        return statSync(join(root, nombre)).isFile();
      } catch {
        return false;
      }
    });
    if (existe) encontrado.push(existe);
  }
  return encontrado;
}

// Un `session_id` es un UUID en Claude Code y en Codex. Se sanea igual: un identificador hostil
// no puede convertir el nombre del archivo en una ruta que salga del directorio de sesión. Sin
// identificador no hay sesión a la que volver, y por lo tanto no hay marca: `String(null)` es
// `"null"`, que escribiría una marca de una sesión que nunca existió.
function safeSessionName(sessionId) {
  if (typeof sessionId !== "string") return null;
  const limpio = sessionId.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  if (limpio === "" || limpio === "." || limpio === ".." || limpio.startsWith("..")) return null;
  return limpio;
}

function compactMarkPath(sessionId) {
  const nombre = safeSessionName(sessionId);
  return nombre === null ? null : join(SESSION_DIR, `${COMPACT_MARK}-${nombre}.json`);
}

export function readCompactMark(sessionId) {
  const target = compactMarkPath(sessionId);
  if (!target) return null;
  try {
    const marca = JSON.parse(readFileSync(target, "utf8"));
    if (marca?.version !== 1 || typeof marca.at !== "string"
      || typeof marca.cwd !== "string" || typeof marca.raiz !== "string"
      || !Array.isArray(marca.triplete)) return null;
    return marca;
  } catch {
    return null;
  }
}

/** Escribe la marca y devuelve su contenido, o `null` si no se pudo. Nunca lanza.
 *  Falla abierto en toda línea: un `PreCompact` que no puede marcar deja pasar la compactación,
 *  que es lo único razonable — el aviso es una ayuda, no una condición. */
export function writeCompactMark(sessionId, { cwd, raiz, trigger, now = Date.now(), triple = null } = {}) {
  const target = compactMarkPath(sessionId);
  if (!target || typeof raiz !== "string" || !raiz) return null;
  const marca = {
    version: 1,
    session: safeSessionName(sessionId),
    at: new Date(now).toISOString(),
    cwd: typeof cwd === "string" && cwd ? cwd : raiz,
    raiz,
    trigger: typeof trigger === "string" && trigger ? trigger : null,
    triplete: Array.isArray(triple) ? triple : tripleteOf(raiz),
  };
  try {
    if (!sesionPrivada()) return;
    const temporal = `${target}.${randomUUID()}.tmp`;
    writeFileSync(temporal, `${JSON.stringify(marca)}\n`, { mode: 0o600, flag: "wx" });
    renameSync(temporal, target);
  } catch {
    /* tmp no disponible o la marca no se puede escribir: la compactación no se bloquea */
    return null;
  }
  return marca;
}

/** Consume la marca. Devolver el contenido ANTES de borrarla es lo que permite al `SessionStart`
 *  decir algo sin volver a leer el disco, y `null` cuando no había nada que decir. */
export function takeCompactMark(sessionId) {
  const marca = readCompactMark(sessionId);
  if (!marca) return null;
  const target = compactMarkPath(sessionId);
  try {
    unlinkSync(target);
  } catch {
    /* el aviso ya salió: una marca que no se borra solo se repite, y el aviso es idempotente */
  }
  return marca;
}

// ¿la firma de Lore de esta sesión se apartó de la base?
export function loreDeparted(baseline, state) {
  return baseline.digest !== state.digest
    || baseline.alwaysOnBytes !== state.alwaysOnBytes;
}

// --- ¿el cuerpo de criterio de este árbol se carga? --------------------------
//
// MYCELIUM pregunta, por cada Pista, qué paso obliga a correrla. Nunca preguntaba si
// el CUERPO que la contiene se carga. Un `lore/` sin loader no es una Pista huérfana:
// es un archivo que el barrido abre para leer sus Pistas sin notar que la sesión real
// nunca lo abre — y así quedan inertes nueve módulos de una vez, sin que ninguna Pista
// aparezca desconectada.
//
// La cadena tiene dos eslabones y se preguntan los dos, porque romper cualquiera deja
// el mismo resultado:
//
//   contrato → índice → módulo temático
//
// Y el universo del primer eslabón son **solo las piezas núcleo** (identidad,
// principios, índice). Un módulo temático que no está en el bloque siempre-activo no
// es un defecto: por diseño se abre por tarea desde el índice. Pedir que estén todos
// convertiría este chequeo en ruido sobre cualquier árbol sano — y un chequeo que
// molesta se apaga, y uno apagado no protege nada.
//
// Devuelve DATOS, nunca un veredicto. Un cuerpo no nombrado admite dos reparaciones
// opuestas —conectarlo, o declararlo explícitamente fuera del universo— y cuál
// corresponde no lo sabe un recorrido de archivos.

const CORE = [
  ["identidad.md", "identity.md"],
  ["principios.md", "principles.md"],
  ["index.md"],
];

function loreDirFiles(root) {
  try {
    return readdirSync(join(root, "lore"), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

export function unnamedBodies(root) {
  const contract = CONTRACTS.find((name) => existsSync(join(root, name))) ?? null;
  const own = loreDirFiles(root);
  const empty = { contract, hasBlock: false, unnamed: [], unindexed: [] };
  if (!contract || own.length === 0) return empty;

  let text = "";
  try {
    text = readFileSync(join(root, contract), "utf8");
  } catch {
    return empty;
  }

  const match = BLOCK.exec(text);
  const hasBlock = Boolean(match);
  // El bloque siempre-activo es lo que se carga siempre. Sin bloque, la pregunta cae
  // sobre el contrato entero: más generoso, y esa es la dirección correcta del error —
  // este chequeo prefiere callar antes que gritar.
  const scope = hasBlock ? match[1] : text;

  // Eslabón 1 — las piezas núcleo que el árbol tiene y el contrato no nombra.
  const unnamed = CORE.filter((names) => {
    const present = names.find((n) => own.includes(n));
    return present && !names.some((n) => scope.includes(n));
  }).map((names) => `lore/${names.find((n) => own.includes(n))}`);

  // Eslabón 2 — módulos temáticos que el índice del árbol no nombra. Solo se pregunta
  // si el índice existe y está cargado: si el contrato no lo nombra, el eslabón que
  // falta es el primero y este sería ruido encima.
  const indexNamed = own.includes("index.md") && scope.includes("index.md");
  let unindexed = [];
  if (indexNamed) {
    let idx = "";
    try {
      idx = readFileSync(join(root, "lore", "index.md"), "utf8");
    } catch {
      idx = "";
    }
    const core = new Set(CORE.flat());
    unindexed = own
      .filter((n) => n !== "index.md" && !core.has(n) && !idx.includes(n))
      .map((n) => `lore/${n}`);
  }

  return { contract, hasBlock, unnamed, unindexed };
}
