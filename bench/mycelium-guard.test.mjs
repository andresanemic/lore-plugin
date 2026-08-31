import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(root, "hooks", "mycelium-guard.mjs");
const RECEIPT = ".lore-mycelium";

// Un árbol de trabajo con Lore adentro. Sin git a propósito: `git` no es requisito
// del kit y existen árboles de Lore sin él, así que la detección no puede depender
// de un repositorio.
function tree(files = { "lore/principios.md": "# Principios\n" }) {
  const dir = mkdtempSync(join(tmpdir(), "lore-tree-"));
  for (const [rel, body] of Object.entries(files)) write(dir, rel, body);
  return dir;
}

function write(dir, rel, body) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
  return full;
}

// Corre el hook como `UserPromptSubmit`. `session_id` es fijo por corrida; la base
// de sesión se indexa por `session_id` + ruta absoluta del árbol, y cada test usa
// un `mkdtemp` propio, así que las bases no colisionan entre tests.
function run(cwd, { sessionId = "probe-session", events = null } = {}) {
  const payload = { cwd, session_id: sessionId, hook_event_name: "UserPromptSubmit" };
  if (events) {
    const t = join(cwd, "transcript.jsonl");
    writeFileSync(t, events.map((e) => JSON.stringify(e)).join("\n"));
    payload.transcript_path = t;
  }
  try {
    const stdout = execFileSync("node", [hook], { input: JSON.stringify(payload), encoding: "utf8" });
    return { stdout, status: 0 };
  } catch (err) {
    return { stdout: err.stdout ?? "", status: err.status ?? 1 };
  }
}

const injected = (r) => {
  assert.equal(r.status, 0, "el hook nunca sale con error");
  assert.notEqual(r.stdout.trim(), "", "esperaba inyección y hubo silencio");
  const out = JSON.parse(r.stdout);
  assert.ok(out.hookSpecificOutput, "esperaba hookSpecificOutput");
  assert.equal(out.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.ok(typeof out.hookSpecificOutput.additionalContext === "string" && out.hookSpecificOutput.additionalContext.length > 0);
  return out;
};
const context = (r) => injected(r).hookSpecificOutput.additionalContext;
const silent = (r) => {
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), "", "esperaba silencio e inyectó");
};

// `armar` deja la sesión con base fijada y recibo al día, como haría el primer
// `UserPromptSubmit` (o el `SessionStart` de codex-guard) antes de cualquier edición.
function armar(dir, opts) {
  silent(run(dir, opts));
}

// --- arranque y armado diferido ---------------------------------------------

test("primera vez: fija la base de sesión en silencio y deja el recibo escrito", () => {
  const dir = tree();
  silent(run(dir));
  assert.ok(existsSync(join(dir, RECEIPT)), "adoptar el kit debe dejar el árbol al día");
  const receipt = JSON.parse(readFileSync(join(dir, RECEIPT), "utf8"));
  assert.equal(receipt.version, 2);
  assert.match(receipt.digest, /^[0-9a-f]{64}$/);
  assert.equal(receipt.alwaysOnBytes, 0);
  rmSync(dir, { recursive: true, force: true });
});

test("sin cambio en la sesión, guarda silencio", () => {
  const dir = tree();
  armar(dir);
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("un recibo desfasado de ANTES de la sesión no dispara hasta el primer cambio in-session", () => {
  const dir = tree();
  // Recibo que quedó de una sesión anterior contra un digest distinto.
  writeFileSync(join(dir, RECEIPT), `${JSON.stringify({ version: 2, digest: "0".repeat(64), alwaysOnBytes: 0 })}\n`);
  armar(dir); // primera vista de esta sesión: base = estado actual, silencio pese al recibo viejo
  silent(run(dir));
  // Recién al tocar el Lore EN la sesión, el recibo pasa a importar.
  write(dir, "lore/principios.md", "# Principios\n\n## Pista nueva\n");
  assert.match(context(run(dir)), /cambios de criterio.*trabajo que deben guiar/i);
  rmSync(dir, { recursive: true, force: true });
});

// --- R1 · la escritura por script deja de ser invisible ---------------------
//
// Antes el guard solo veía Edit/Write/MultiEdit/NotebookEdit, así que `sed`, un
// heredoc o un script pasaban sin verse — y ese es el modo por defecto del host.
// La pregunta es por el contenido del árbol, así que CÓMO se escribió el archivo
// deja de ser una variable.

test("R1 · inyecta cuando el Lore cambió en la sesión, sin importar con qué herramienta", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Pista nueva\n");
  const c = context(run(dir));
  assert.match(c, /cambios de criterio.*trabajo que deben guiar/i);
  assert.doesNotMatch(c, /MYCELIUM/i);
  rmSync(dir, { recursive: true, force: true });
});

test("R1b · un módulo nuevo dentro de lore/ también cuenta", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/enrutamiento.md", "# Enrutamiento\n");
  assert.ok(context(run(dir)).length > 0);
  rmSync(dir, { recursive: true, force: true });
});

test("R1c · FASES.md es estado: cambiarlo no reabre la revisión de Lore", () => {
  const dir = tree({
    "lore/principios.md": "# Principios\n",
    "FASES.md": "# Estado de este proyecto. NO es Lore.\n",
  });
  armar(dir);
  write(dir, "FASES.md", "# Estado de este proyecto. NO es Lore.\n\n- avance\n");
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

// --- R2 · decir la palabra deja de ser evidencia ---------------------------

test("R2 · una prosa llena de «MYCELIUM» no cierra el bracket", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  const events = [
    { type: "assistant", message: { role: "assistant", content: [
      { type: "text", text: "Corro MYCELIUM de salida sobre lo que se escribió: 0 hallazgos." },
    ] } },
  ];
  assert.ok(context(run(dir, { events })).length > 0);
  rmSync(dir, { recursive: true, force: true });
});

test("R2b · tampoco lo cierra decir explícitamente que no se corrió", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  const events = [
    { type: "assistant", message: { role: "assistant", content: [
      { type: "text", text: "Todavía no corrí MYCELIUM: queda para una pasada futura de transmute-lore." },
    ] } },
  ];
  assert.ok(context(run(dir, { events })).length > 0);
  rmSync(dir, { recursive: true, force: true });
});

test("R2c · lo que sí lo cierra es el recibo — el hecho, no la frase", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  injected(run(dir));
  execFileSync("node", [join(root, "scripts", "lore-plugin.mjs"), "mycelium", "receipt", "--tree", dir], { encoding: "utf8" });
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("el transcript no participa: inyecta igual sin transcript_path", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  assert.ok(context(run(dir)).length > 0);
  rmSync(dir, { recursive: true, force: true });
});

// --- el texto de la intervención ------------------------------------------

test("el mensaje se declara del hook y prohíbe reportarle al usuario", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  const c = context(run(dir));
  assert.match(c, /Mensaje del hook, no del usuario/);
  assert.match(c, /no le informes al usuario que revisaste/i);
  assert.match(c, /cambios de criterio.*trabajo que deben guiar/i);
  assert.doesNotMatch(c, /MYCELIUM|save-to-lore|transmute-lore|receipt/i);
  rmSync(dir, { recursive: true, force: true });
});

test("una expansión sola pide autoridad sin inventar una revisión pendiente", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(9_000),
  });
  armar(dir);
  write(dir, "CLAUDE.md",
    "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n");
  const c = context(run(dir));
  assert.doesNotMatch(c, /trabajo que deben guiar/i);
  assert.match(c, /aprobación/i);
  assert.match(c, /9,0 KB/);
  rmSync(dir, { recursive: true, force: true });
});

test("Lore cambiado y expansión material producen una sola intervención agregada", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(29_855),
  });
  armar(dir);
  write(dir, "lore/criterio.md", "x".repeat(68_608));
  const result = run(dir);
  const c = context(result);
  assert.equal(result.stdout.trim().split("\n").length, 1);
  assert.match(c, /cambios de criterio.*trabajo que deben guiar/i);
  assert.match(c, /29,9 KB.*68,6 KB.*130%/s);
  assert.match(c, /aprobación/i);
  assert.doesNotMatch(c, /MYCELIUM|save-to-lore|transmute-lore|receipt/i);
  rmSync(dir, { recursive: true, force: true });
});

// --- fronteras -----------------------------------------------------------

test("es contenido y no mtime: reescribir lo mismo no dispara", () => {
  const dir = tree();
  armar(dir);
  write(dir, "lore/principios.md", "# Principios\n");
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("un árbol sin Lore no es asunto de este hook", () => {
  const dir = tree({ "src/index.js": "export default 1;\n", "README.md": "# hola\n" });
  silent(run(dir));
  assert.ok(!existsSync(join(dir, RECEIPT)), "no se escribe recibo donde no hay Lore");
  rmSync(dir, { recursive: true, force: true });
});

test("falla abierto ante un cwd que no existe", () => {
  const r = run(join(tmpdir(), "no-existe-lore-tree-xyz"));
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});

test("falla abierto ante stdin vacío", () => {
  const dir = tree({ "src/index.js": "export default 1;\n" });
  try {
    const stdout = execFileSync("node", [hook], { input: "", encoding: "utf8", cwd: dir });
    assert.equal(stdout.trim(), "");
  } catch (err) {
    assert.fail(`el hook debe fallar abierto: ${err.message}`);
  }
  rmSync(dir, { recursive: true, force: true });
});

test("un backup del Lore de otro árbol no es el criterio de este", () => {
  const dir = tree({
    "lore/principios.md": "# Principios\n",
    "informes/barrido/_backup/otro-proyecto/lore/principios.md": "# Lore ajeno respaldado\n",
  });
  armar(dir);
  write(dir, "informes/barrido/_backup/otro-proyecto/lore/principios.md", "# Lore ajeno, editado\n");
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("un fixture de prueba no es el criterio del árbol que lo contiene", () => {
  const dir = tree({
    "lore/principios.md": "# Principios\n",
    "bench/fixtures/lore/principios.md": "# Lore de prueba de otro proyecto\n",
  });
  armar(dir);
  write(dir, "bench/fixtures/lore/principios.md", "# Lore de prueba, editado\n");
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("un recibo v1 vigente migra a v2 sin disparar, tras un cambio in-session inofensivo", () => {
  const dir = tree();
  armar(dir);
  const receipt = JSON.parse(readFileSync(join(dir, RECEIPT), "utf8"));
  writeFileSync(join(dir, RECEIPT), `${receipt.digest}\n`); // v1
  // Cambio real en la sesión, pero el digest vuelve a coincidir con el v1 → sin pendiente.
  write(dir, "lore/principios.md", "# Principios\n\n## x\n");
  injected(run(dir)); // dispara: hay cambio y el recibo v1 no lo cubre
  execFileSync("node", [join(root, "scripts", "lore-plugin.mjs"), "mycelium", "receipt", "--tree", dir], { encoding: "utf8" });
  silent(run(dir));
  assert.equal(JSON.parse(readFileSync(join(dir, RECEIPT), "utf8")).version, 2);
  rmSync(dir, { recursive: true, force: true });
});
