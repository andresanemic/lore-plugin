// Continuidad ante la compactación (2.4.9-rc9) — el kit sabe que se compactó y vuelve a cargar.
//
// El hecho que lo motiva: el coordinador de la sesión del 2026-10-04 se autocompactó y hubo que
// reconstruir el contexto leyendo archivos. El contrato del bot ya ordenaba cargar el triplete al
// abrir; nada le recordaba hacerlo DESPUÉS de compactar.
//
// Tres restricciones medidas mandan sobre el diseño, y cada una tiene su adversario aquí:
//
//   1. Un `additionalContext` que llega al modelo se lo toma como instrucción de la persona y lo
//      narra (medido en Claude Code 2.1.284, comentado en `hooks/codex-guard.mjs` sobre
//      `UserPromptSubmit`). Por eso NADA de esto escribe en el contexto del modelo: el
//      `pre_compact` sale con cero bytes y el aviso posterior va por `systemMessage`, que la
//      documentación del host define como «warning message shown to the user» y que además
//      descarta en `PreCompact` y `PostCompact`.
//   2. Claude Code re-dispara `SessionStart` al compactar, con el `cwd` ya derivado. El código ya
//      cuida no re-anclar la jurisdicción ahí (`una compactación con el cwd derivado no re-ancla la
//      jurisdicción`), y la marca usa la MISMA raíz que esa prueba, no el `cwd`.
//   3. El peso se mide en bytes de contexto cargado: el encabezado de la skill (lo siempre cargado)
//      no puede moverse, y el cuerpo tiene un techo. La prueba de abajo lo lee del ref base.
//
// Lo que NO se afirma aquí: que el host dispare el evento. Eso no lo verifica una prueba de
// repositorio, y queda dicho en el informe y en `docs/REFERENCE_*`.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { SESSION_DIR } from "../hooks/lore-state.mjs";

// Lo que esta carga agrega al núcleo se resuelve en cada prueba, no en un import de arriba:
// un rojo que muere al cargar el archivo no dice QUÉ falta, y un rojo que no dice qué falta
// no es la evidencia de la que después se afirma «antes no estaba».
const NUEVO = async () => await import("../hooks/lore-state.mjs");

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(repo, "hooks", "codex-guard.mjs");
const roots = [];
const marcas = [];

function tree(files = { "lore/principios.md": "# Principios\n" }) {
  const dir = mkdtempSync(join(tmpdir(), "lore-continuidad-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) write(dir, rel, body);
  return dir;
}

function write(dir, rel, body) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
}

function hookEvent(cwd, event, payload = {}) {
  const input = {
    cwd,
    hook_event_name: event === "session_start" ? "SessionStart" : event === "pre_compact" ? "PreCompact" : "PostToolUse",
    session_id: `cont-${process.pid}-${Math.random().toString(36).slice(2)}`,
    transcript_path: join(cwd, "transcript.jsonl"),
    model: "probe-model",
    permission_mode: "never",
    ...payload,
  };
  return execFileSync("node", [hook, event], { input: JSON.stringify(input), encoding: "utf8" });
}

function marcaDe(sessionId, compactMark = "compactacion") {
  return join(SESSION_DIR, `${compactMark}-${sessionId}.json`);
}

function limpiarMarca(sessionId) {
  const ruta = marcaDe(sessionId);
  marcas.push(ruta);
  rmSync(ruta, { recursive: true, force: true });
}

// La marca que escribe `pre_compact`, leída del disco: la prueba mira el archivo, no al código.
function leerMarca(sessionId) {
  const ruta = marcaDe(sessionId);
  marcas.push(ruta);
  return existsSync(ruta) ? JSON.parse(readFileSync(ruta, "utf8")) : null;
}

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
  for (const ruta of marcas) rmSync(ruta, { recursive: true, force: true });
});

// --- A. La prosa que manda en los tres hosts -----------------------------------

test("use-lore trata una compactación como una apertura de sesión, no como una regla nueva", () => {
  // El bloque es una cita con `> ` y un ancho de línea que no es el del código: la prosa se lee
  // sin esos prefijos y con los saltos de línea unidos a un espacio, o cada aserción mide el
  // ajuste de línea en vez de la regla.
  const useLore = readFileSync(join(repo, "skills", "use-lore", "SKILL.md"), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/^> ?/gm, "")
    .replace(/\s+/g, " ");

  // La regla vive DENTRO del bloque que ya trata de apertura de sesión, no en un sección nueva.
  assert.match(useLore, /governs session openings too[\s\S]{0,900}A compaction is an opening too/);
  assert.match(useLore, /compacts or resumes, re-read this tree's contract/);
  assert.match(useLore, /contract, its Lore and its `FASES\.md` before continuing, and say that you did\./);
  assert.match(useLore, /Near the context limit, or when the person says you are about to compact/);
  assert.match(useLore, /leave one line per decision in `FASES\.md` or in the operation's own state first\./);
  assert.match(useLore, /In a host with no compaction event, only this rule stands\./);

  // Y la prohibición que la motivó: la regla NO es un canal de hook.
  assert.doesNotMatch(
    useLore,
    /compaction[\s\S]{0,300}additionalContext/,
    "la regla de compactación no puede nombrar un canal que entrega texto al modelo",
  );
});

test("el encabezado de use-lore — lo que se carga siempre — no se mueve", (t) => {
  const base = "release/2.4.9-rc9-prep";
  let ref;
  try {
    ref = execFileSync("git", ["-c", "safe.directory=*", "show", `${base}:skills/use-lore/SKILL.md`], {
      cwd: repo, encoding: "utf8",
    }).replace(/\r\n/g, "\n");
  } catch {
    return t.skip(`el ref ${base} no está disponible; el techo de peso no se puede comprobar`);
  }
  const ahora = readFileSync(join(repo, "skills", "use-lore", "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const fm = (texto) => /^---\n[\s\S]*?\n---\n/.exec(texto)?.[0] ?? "";

  // Ley #24: lo siempre cargado no cambia. Un byte de frontmatter es un byte por host, por turno.
  assert.equal(Buffer.byteLength(fm(ahora), "utf8"), Buffer.byteLength(fm(ref), "utf8"),
    "el frontmatter de use-lore cambió: es lo que se carga en cada sesión de los tres hosts");
  assert.equal(fm(ahora), fm(ref), "el texto del frontmatter de use-lore cambió");

  // Techo decision de Andrés (2026-10-04): 450 B netos en el cuerpo, o lo que se podó.
  const delta = Buffer.byteLength(ahora, "utf8") - Buffer.byteLength(ref, "utf8");
  assert.ok(delta <= 450, `el cuerpo de use-lore creció ${delta} B y el techo son 450 B`);
});

// --- B. La marca silenciosa antes de compactar (Claude Code) -------------------

test("pre_compact deja la marca con la hora, el cwd, la raíz y el triplete, y no dice nada", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n<!-- /lore:always-on -->\n",
    "lore/index.md": "# Índice\n",
    "FASES.md": "# Estado\n",
  });
  const sessionId = `pre-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);

  assert.equal(hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" }), "",
    "PreCompact no puede llevar texto: el host descarta su systemMessage y stdout plano entra al contexto");
  const marca = leerMarca(sessionId);
  assert.ok(marca, "la marca no se escribió");
  assert.equal(marca.session, sessionId);
  assert.equal(marca.trigger, "auto");
  assert.equal(marca.cwd, dir);
  assert.equal(marca.raiz, dir);
  assert.deepEqual(marca.triplete, ["CLAUDE.md", "lore/index.md", "FASES.md"]);
  assert.match(marca.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "la hora va en ISO, no en un formato libre");
});

test("pre_compact no toca el árbol de la persona", () => {
  const dir = tree({ "CLAUDE.md": "# Contrato\n", "FASES.md": "# Estado\n" });
  const sessionId = `limpio-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);

  const antes = readdirSync(dir).sort().join("|");
  hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "manual" });
  assert.equal(readdirSync(dir).sort().join("|"), antes, "la marca vive en el tmp, no en el árbol del usuario");
});

test("el triplete registra lo que existe y solo lo que existe", async () => {
  const { tripleteOf } = await NUEVO();
  assert.deepEqual(tripleteOf(tree({
    "CLAUDE.md": "# c\n", "lore/index.md": "# i\n", "FASES.md": "# f\n",
  })), ["CLAUDE.md", "lore/index.md", "FASES.md"]);

  // Un bot: enrutamiento en vez de índice, y `canon/` donde el kit lo pone.
  assert.deepEqual(tripleteOf(tree({
    "AGENTS.md": "# c\n", "canon/enrutamiento.md": "# e\n", "PHASES.md": "# p\n",
  })), ["AGENTS.md", "canon/enrutamiento.md", "PHASES.md"]);

  // Un proyecto con criterio y sin estado: dos de tres, y la marca lo dice así.
  assert.deepEqual(tripleteOf(tree({
    "CLAUDE.md": "# c\n", "lore/index.md": "# i\n",
  })), ["CLAUDE.md", "lore/index.md"]);

  // Sin contrato no se inventa: la lista vacía es la respuesta honesta.
  assert.deepEqual(tripleteOf(tree({ "lore/principios.md": "# p\n" })), []);
  // Un FASES de otro árbol no cuenta: la búsqueda no sube.
  assert.deepEqual(tripleteOf(tree({ "CLAUDE.md": "# c\n", "FASES.md": "# f\n", "sub/FASES.md": "# f\n" })),
    ["CLAUDE.md", "FASES.md"]);
});

test("la marca usa la raíz de jurisdicción, no el cwd que derivó", () => {
  const hive = mkdtempSync(join(tmpdir(), "lore-hive-"));
  roots.push(hive);
  const own = join(hive, "bots", "bot-probe");
  const drifted = join(hive, "plugins", "kit", "skills", "una-skill");
  for (const d of [own, drifted]) mkdirSync(d, { recursive: true });
  write(own, "CLAUDE.md", "# Propio\n");
  write(own, "FASES.md", "# Estado\n");
  write(drifted, "lore/principios.md", "# Ajeno\n");
  const sessionId = `juris-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);

  hookEvent(own, "session_start", { session_id: sessionId, source: "startup" });
  hookEvent(drifted, "pre_compact", { session_id: sessionId, trigger: "auto" });
  const marca = leerMarca(sessionId);
  assert.equal(marca.raiz, own, "la jurisdicción sigue en la raíz donde abrió la sesión");
  assert.equal(marca.cwd, drifted, "el cwd queda registrado como lo que fue, no como la raíz");
  assert.deepEqual(marca.triplete, ["CLAUDE.md", "FASES.md"]);
});

test("un session_id con traversal no escribe fuera del tmp de sesión", () => {
  const dir = tree({ "CLAUDE.md": "# c\n" });
  const sessionId = "../../pwned";
  const fuera = join(SESSION_DIR, "..", "..", "pwned");
  rmSync(fuera, { recursive: true, force: true });

  hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" });
  assert.equal(existsSync(fuera), false, "un session_id hostil no escapa del directorio de sesión");
});

test("pre_compact sin session_id no escribe nada y no dice nada", async () => {
  const { readCompactMark } = await NUEVO();
  const dir = tree({ "CLAUDE.md": "# c\n" });
  assert.equal(hookEvent(dir, "pre_compact", { session_id: undefined, trigger: "auto" }), "");
  assert.equal(readCompactMark(null), null);
});

test("pre_compact falla abierto cuando la marca no se puede escribir", () => {
  const dir = tree({ "CLAUDE.md": "# c\n", "FASES.md": "# f\n" });
  const sessionId = `ro-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);

  // Un directorio donde debería ir el archivo: la escritura falla en cualquier plataforma.
  mkdirSync(marcaDe(sessionId), { recursive: true });
  assert.equal(hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" }), "");
  assert.throws(() => readFileSync(marcaDe(sessionId), "utf8"), "el camino sigue ocupado por el directorio");

  // Y la sesión sigue viva: un PreCompact que no pudo marcar no rompe la apertura siguiente.
  hookEvent(dir, "session_start", { session_id: sessionId, source: "compact" });
  rmSync(marcaDe(sessionId), { recursive: true, force: true });
});

test("pre_compact falla abierto con el tmp de sesión de solo lectura", async (t) => {
  const { readCompactMark } = await NUEVO();
  if (process.platform === "win32") return t.skip("en Windows el permiso de solo lectura no se modela con chmod");
  const dir = tree({ "CLAUDE.md": "# c\n" });
  const sessionId = `ro2-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);
  mkdirSync(SESSION_DIR, { recursive: true });
  chmodSync(SESSION_DIR, 0o500);
  try {
    assert.equal(hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" }), "",
      "un tmp que no acepta escrituras deja pasar la compactación, no la rompe");
    assert.equal(readCompactMark(sessionId), null);
  } finally {
    chmodSync(SESSION_DIR, 0o700);
  }
});

// --- C. Después de compactar: un aviso a la persona, nada al modelo ------------

test("SessionStart de compactación avisa a la persona, borra la marca y no toca el contexto", () => {
  const dir = tree({ "CLAUDE.md": "# c\n", "lore/index.md": "# i\n", "FASES.md": "# f\n" });
  const sessionId = `post-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);

  hookEvent(dir, "session_start", { session_id: sessionId, source: "startup" });
  hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" });
  assert.ok(leerMarca(sessionId), "precondición: la marca está");

  const salida = hookEvent(dir, "session_start", { session_id: sessionId, source: "compact" });
  const parsed = JSON.parse(salida);
  assert.equal(parsed.hookSpecificOutput, undefined,
    "el aviso no puede viajar por additionalContext: el modelo lo narraría como instrucción tuya");
  assert.match(parsed.systemMessage, /compact/i);
  assert.match(parsed.systemMessage, /triplete|FASES/i);
  assert.equal(leerMarca(sessionId), null, "la marca se consume: no se vuelve a avisar de la misma compactación");
});

test("una apertura normal no dice nada y no gasta la marca", () => {
  const dir = tree({ "CLAUDE.md": "# c\n", "FASES.md": "# f\n" });
  const sessionId = `start-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);
  hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "manual" });

  assert.equal(hookEvent(dir, "session_start", { session_id: sessionId, source: "startup" }), "",
    "una sesión nueva es silenciosa: el aviso es de compactación, no de arranque");
  assert.ok(leerMarca(sessionId), "la marca de otra sesión no se barre en un arranque normal");
});

test("una compactación sin marca previa es silenciosa", () => {
  const dir = tree({ "CLAUDE.md": "# c\n", "FASES.md": "# f\n" });
  assert.equal(hookEvent(dir, "session_start", { source: "compact" }), "",
    "Codex no registra PreCompact: sin marca no hay nada que decir, y el aviso no se inventa");
});

test("sin triplete en la raíz el aviso no sale: el hook callado cuando no hay nada que avisar", () => {
  const dir = tree({ "lore/principios.md": "# p\n" });
  const sessionId = `vacio-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);
  hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" });

  assert.equal(hookEvent(dir, "session_start", { session_id: sessionId, source: "compact" }), "",
    "un árbol sin contrato, sin índice y sin FASES no tiene triplete que recargar");
});

test("una compactación produce un solo objeto JSON, aunque el árbol también pida la línea federada", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/enrutamiento.md`\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
    "FASES.md": "# f\n",
  });
  const sessionId = `ambos-${process.pid}-${Math.random().toString(36).slice(2)}`;
  limpiarMarca(sessionId);
  hookEvent(dir, "session_start", { session_id: sessionId, source: "startup" });
  hookEvent(dir, "pre_compact", { session_id: sessionId, trigger: "auto" });

  const salida = hookEvent(dir, "session_start", { session_id: sessionId, source: "compact" });
  assert.equal(salida.trim().split("\n").length, 1,
    "stdout con dos líneas, una JSON con campo y otra texto plano, es un fallo de parseo del host");
  assert.doesNotThrow(() => JSON.parse(salida));
  // La línea federada no se pierde: sigue saliendo en toda apertura que no sea una compactación.
  assert.match(hookEvent(dir, "session_start", { session_id: `${sessionId}-b`, source: "startup" }), /mycelium federated/);
});

// --- D. Lo que el kit registra en hooks.json ----------------------------------

test("hooks.json registra PreCompact para las dos causas de compactación", () => {
  const hooks = JSON.parse(readFileSync(join(repo, "hooks", "hooks.json"), "utf8"));
  const grupos = hooks.hooks?.PreCompact;
  assert.ok(Array.isArray(grupos), "no hay registro de PreCompact: el evento nunca llega al manejador");
  const comandos = grupos.flatMap((g) => g.hooks ?? []).map((h) => h.command).join("\n");
  assert.match(comandos, /codex-guard\.mjs"?\s+pre_compact/, "el manejador no es el de la marca");
  for (const grupo of grupos) {
    assert.match(grupo.matcher ?? "", /manual/, "sin `manual` no se marca un /compact de la persona");
    assert.match(grupo.matcher ?? "", /auto/, "sin `auto` no se marca una compactación automática, que es el caso que motivó esto");
  }
});