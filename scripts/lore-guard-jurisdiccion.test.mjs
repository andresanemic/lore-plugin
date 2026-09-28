// NC-B-2: regresión permanente. La memoria de la sesión de Claude Code es jurisdicción propia.
//
// El arreglo existe en el código desde RC4 (`sessionMemory` en `hooks/lore-guard.mjs`, que
// clasifica `~/.claude/projects/<proyecto>/memory/` como `own`), y hasta esta prueba nada lo
// sostenía: un arreglo sin regresión se deshace en el próximo refactor sin que nadie lo note.
// Ocurrió tres veces en uso real, y la última vez el día que se decidió que esto se corrigiera
// para siempre y no volviera en ninguna 2.4.9 posterior:
//
//   1. 2026-09-21 — la guardia bloqueó la memoria de la sesión de un proyecto.
//   2. 2026-09-25 — la landing fallida de Vespi; el bloqueo cayó sobre `.../memory/` (NC-B-2).
//   3. 2026-09-26 — de nuevo, al cerrar la sesión que abrió RC4.
//
// Y no es solo "que pase": el andamiaje (#21) declara a medias una guardia que solo se probó
// contra el ajeno. Así que aquí se fijan las tres clases de R16 a la vez —propio, ajeno y
// desconocido— y laAjena se prueba con un árbol de verdad, con su `lore/`, para que la prueba
// no dependa de la máquina donde corre.

import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import test from "node:test";
import { classifyWrite, jurisdictionBlock, unknownWrites } from "../hooks/lore-guard.mjs";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

test("NC-B-2.1: la memoria de la sesión es propia, y no solo el primer nivel", () => {
  const base = resolve(homedir(), ".claude", "projects");
  const proyecto = "C-Claude-bots-proyectos-bot-lus-lore";
  assert.equal(classifyWrite(root, join(base, proyecto, "memory")), "own");
  assert.equal(classifyWrite(root, join(base, proyecto, "memory", "nota-2026-09-28.md")), "own");
  // Y no por accidente: `memory` cuenta como tal solo en ese segundo nivel. Un archivo suelto
  // al lado de la memoria no es la memoria, y una carpeta llamada así en otro árbol tampoco.
  assert.notEqual(classifyWrite(root, join(base, proyecto, "memory2")), "own");
});

test("NC-B-2.2: la memoria de otro proyecto también cuenta como propia — y eso es un agujero", () => {
  const base = resolve(homedir(), ".claude", "projects");
  // El arreglo de NC-B-2 mira la FORMA de la ruta (dentro de ~/.claude/projects y con `memory`
  // en el segundo nivel) y no el proyecto al que pertenece. Con eso, la memoria de la sesión
  // de otro proyecto queda clasificada como propia. Puede ser lo correcto si ese proyecto es
  // un árbol hermano gobernado por Lore; no lo es si es de otro dueño.
  // No se corrige acá: tocar la guardia es puerta de Andrés, y la forma angosta —que el
  // proyecto de la ruta sea propio, o uno de los árboles que el enrutamiento declara— cambia
  // qué se bloquea. Queda escrito abajo como `todo`, y hasta que se resuelva, la guardia se
  // declara a medias y no se instala (andamiaje #21).
  assert.equal(classifyWrite(root, join(base, "otro-proyecto", "memory", "nota.md")), "own");
  assert.equal(classifyWrite(root, join(base, "area-ajena-lejana", "memory", "nota.md")), "own");
});

test.todo("NC-B-2.5: la memoria es propia solo si su proyecto es propio o un árbol hermano", () => {
  const base = resolve(homedir(), ".claude", "projects");
  const tuyo = "C-Claude-bots-proyectos-bot-lus-lore";
  assert.equal(classifyWrite(root, join(base, tuyo, "memory", "nota.md")), "own", "esto ya pasa");
  assert.notEqual(classifyWrite(root, join(base, "area-ajena-lejana", "memory", "nota.md")), "own", "esto no");
});

test("NC-B-2.3: un árbol ajeno con su lore se sigue bloqueando", () => {
  const fixture = mkdtempSync(join(tmpdir(), "lore-guard-ncb2-"));
  try {
    const ajeno = join(fixture, "area-ajena", "lore");
    mkdirSync(ajeno, { recursive: true });
    const destino = join(fixture, "area-ajena", "lore", "principios.md");
    assert.equal(classifyWrite(root, destino), "foreign", "el árbol de otro dueño no se abre");
    const bloqueo = jurisdictionBlock(root, "Write", { file_path: destino });
    assert.ok(bloqueo, "y el bloqueo nombra la razón");
    assert.match(bloqueo, /jurisdicci/);
    assert.equal(jurisdictionBlock(root, "Write", { file_path: join(root, "README.md") }), null);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("NC-B-2.4: lo desconocido pasa, y queda nombrado para que alguien lo mire", () => {
  const suelta = join(tmpdir(), `suelta-${process.pid}.md`);
  const avisos = unknownWrites(root, "Write", { file_path: suelta });
  assert.ok(avisos.includes(resolve(suelta)), "lo desconocido se avisa, no se bloquea en silencio");
  assert.equal(jurisdictionBlock(root, "Write", { file_path: suelta }), null);
});
