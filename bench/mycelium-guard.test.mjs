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

// Corre el hook. `events` es opcional y existe solo para probar que el transcript
// YA NO PARTICIPA en la decisión.
function run(cwd, { stopHookActive = false, events = null } = {}) {
  const payload = { cwd, stop_hook_active: stopHookActive };
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

const blocked = (r) => {
  assert.equal(r.status, 0, "el hook nunca sale con error");
  assert.notEqual(r.stdout.trim(), "", "esperaba bloqueo y hubo silencio");
  return JSON.parse(r.stdout);
};
const silent = (r) => assert.equal(r.stdout.trim(), "", "esperaba silencio y bloqueó");

// --- arranque y estado limpio -------------------------------------------------

test("arranque: sin recibo previo no bloquea, y deja el recibo escrito", () => {
  const dir = tree();
  silent(run(dir));
  assert.ok(existsSync(join(dir, RECEIPT)), "adoptar el kit debe dejar el árbol al día");
  assert.match(readFileSync(join(dir, RECEIPT), "utf8").trim(), /^[0-9a-f]{64}$/);
  rmSync(dir, { recursive: true, force: true });
});

test("con el recibo al día, guarda silencio", () => {
  const dir = tree();
  run(dir);
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

// --- R1 · la escritura por script deja de ser invisible -----------------------
//
// Antes el guard solo veía Edit/Write/MultiEdit/NotebookEdit, así que `sed`, un
// heredoc o un script de python pasaban sin verse — y ese es el modo de trabajo por
// defecto del host. Ahora la pregunta es por el contenido del árbol, así que CÓMO se
// escribió el archivo deja de ser una variable.

test("R1 · bloquea cuando el Lore cambió, sin importar con qué herramienta", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Pista nueva\n");
  const out = blocked(run(dir));
  assert.equal(out.decision, "block");
  assert.match(out.reason, /MYCELIUM/);
  rmSync(dir, { recursive: true, force: true });
});

test("R1b · un módulo nuevo dentro de lore/ también cuenta", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/enrutamiento.md", "# Enrutamiento\n");
  assert.equal(blocked(run(dir)).decision, "block");
  rmSync(dir, { recursive: true, force: true });
});

test("R1c · FASES.md y CLAUDE-adyacentes en la raíz cuentan como Lore", () => {
  const dir = tree({ "FASES.md": "# FASES\n" });
  run(dir);
  write(dir, "FASES.md", "# FASES\n\n- avance\n");
  assert.equal(blocked(run(dir)).decision, "block");
  rmSync(dir, { recursive: true, force: true });
});

// --- R2 · decir la palabra deja de ser evidencia ------------------------------
//
// El defecto no era que la regex fuera laxa: era que se le preguntaba al agente. El
// mecanismo nuevo no le pregunta, así que la pregunta desaparece con el defecto.

test("R2 · una prosa llena de «MYCELIUM» no cierra el bracket", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  const events = [
    { type: "assistant", message: { role: "assistant", content: [
      { type: "text", text: "Corro MYCELIUM de salida sobre lo que se escribió: 0 hallazgos." },
    ] } },
  ];
  assert.equal(blocked(run(dir, { events })).decision, "block");
  rmSync(dir, { recursive: true, force: true });
});

test("R2b · tampoco lo cierra decir explícitamente que no se corrió", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  const events = [
    { type: "assistant", message: { role: "assistant", content: [
      { type: "text", text: "Todavía no corrí MYCELIUM: queda para una pasada futura de transmute-lore." },
    ] } },
  ];
  assert.equal(blocked(run(dir, { events })).decision, "block");
  rmSync(dir, { recursive: true, force: true });
});

test("R2c · lo que sí lo cierra es el recibo — el hecho, no la frase", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  blocked(run(dir));
  execFileSync("node", [join(root, "scripts", "lore-plugin.mjs"), "mycelium", "receipt", "--tree", dir], { encoding: "utf8" });
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("el transcript ya no participa: bloquea igual sin transcript_path", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  assert.equal(blocked(run(dir)).decision, "block");
  rmSync(dir, { recursive: true, force: true });
});

// --- fronteras ----------------------------------------------------------------

test("es contenido y no mtime: reescribir lo mismo no bloquea", () => {
  const dir = tree();
  run(dir);
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

test("guarda anti-bucle: stop_hook_active corta en seco", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  silent(run(dir, { stopHookActive: true }));
  rmSync(dir, { recursive: true, force: true });
});

test("falla abierto ante un cwd que no existe", () => {
  const r = run(join(tmpdir(), "no-existe-lore-tree-xyz"));
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), "");
});

test("falla abierto ante stdin vacío", () => {
  // `cwd` explícito a propósito: sin él el hook cae en process.cwd() y un test no
  // debe escribir un recibo en el árbol del repositorio que lo corre.
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
  run(dir);
  write(dir, "informes/barrido/_backup/otro-proyecto/lore/principios.md", "# Lore ajeno, editado\n");
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("un fixture de prueba no es el criterio del árbol que lo contiene", () => {
  const dir = tree({
    "lore/principios.md": "# Principios\n",
    "bench/fixtures/lore/principios.md": "# Lore de prueba de otro proyecto\n",
  });
  run(dir);
  write(dir, "bench/fixtures/lore/principios.md", "# Lore de prueba, editado\n");
  silent(run(dir));
  rmSync(dir, { recursive: true, force: true });
});

test("el mensaje enruta, no solo detecta", () => {
  const dir = tree();
  run(dir);
  write(dir, "lore/principios.md", "# Principios\n\n## Otra\n");
  const { reason } = blocked(run(dir));
  assert.match(reason, /save-to-lore/, "debe nombrar la skill que reemplaza escribir a mano");
  assert.match(reason, /transmute-lore/);
  assert.match(reason, /mycelium receipt/, "debe decir cómo se cierra el bracket");
  rmSync(dir, { recursive: true, force: true });
});
