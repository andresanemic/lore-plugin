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
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import test from "node:test";
import { classifyWrite, jurisdictionBlock, structuredWritePaths, unknownWrites } from "../hooks/lore-guard.mjs";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const projects = resolve(homedir(), ".claude", "projects");

// El nombre que Claude Code da al proyecto de una ruta: ~/.claude/projects/<slug>/. La regla
// es «todo lo que no sea letra ni dígito ASCII pasa a `-`, sin colapsar». NO es una regla de
// este kit — es una observación del host, y por eso su prueba no la pide la guardia sino el
// mundo: estos dos casos se leyeron de proyectos reales que Claude había creado en esta
// máquina. Corroborada contra 42 raíces reales, cero discrepancias, con `:`, `\`, `-` y `ñ`
// entre los caracteres ejercitados.
function slugDe(ruta) {
  return resolve(ruta).replace(/[^A-Za-z0-9]/g, "-");
}

test("la regla del nombre de proyecto de Claude Code, contra dos proyectos reales", () => {
  assert.equal(slugDe("C:\\Claude\\plugins\\proyectos\\lore-plugin"),
    "C--Claude-plugins-proyectos-lore-plugin");
  // El segundo lleva una `ñ`, que Claude convierte en `-` como cualquier otro carácter no
  // alfanumérico: `diseño` -> `dise-o`. No es una excepción al reemplazo, es el reemplazo.
  assert.equal(slugDe("C:\\Claude\\bots\\proyectos\\bot-diseño-grafico"),
    "C--Claude-bots-proyectos-bot-dise-o-grafico");
});

const arbol = (prefijo) => mkdtempSync(join(tmpdir(), prefijo));
const poner = (raiz, rel, cuerpo = "x\n") => {
  const f = join(raiz, rel);
  mkdirSync(resolve(f, ".."), { recursive: true });
  writeFileSync(f, cuerpo);
  return f;
};

// --- NC-B-2.5: la memoria se concede por IDENTIDAD, no por FORMA ------------------------
//
// El arreglo de NC-B-2 (2026-09-26) miraba la FORMA de la ruta: «dentro de ~/.claude/projects
// y con `memory` en el segundo nivel» es memoria propia. Eso concede autoridad a una cadena,
// y una cadena no es un dueño: la memoria de CUALQUIER proyecto quedaba como propia, y el
// nombre del proyecto no se miraba. Tres casos viajan en el mismo predicado y hay que
// separarlos:
//
//   1. la memoria del proyecto donde abrió ESTA sesión  -> propia, y es la razón de existir
//   2. la memoria de un árbol que el enrutamiento declara -> propia, porque el enrutamiento
//      lo declaró y esa declaración concede jurisdicción sobre el árbol entero
//   3. la memoria de otro proyecto                      -> no es propia; y como R16 solo
//      bloquea lo ajeno y un directorio de memoria no es un árbol gobernado por Lore,
//      tampoco se bloquea: pasa con aviso y queda anotado
//
// Lo que decide el caso 1 y el 2 es una COMPARACIÓN contra el nombre de proyecto derivado de
// una raíz que ya era propia. La autoridad viene de la raíz de sesión, no de la forma de la
// ruta: por eso una ruta con la forma exacta y el proyecto equivocado ya no pasa, y por eso
// ninguna variante de esa ruta lo hace pasar.

test("NC-B-2.1: la memoria del proyecto de ESTA sesión es propia, y no solo el primer nivel", () => {
  const proyecto = slugDe(root);
  assert.equal(classifyWrite(root, join(projects, proyecto, "memory")), "own");
  assert.equal(classifyWrite(root, join(projects, proyecto, "memory", "nota-2026-09-28.md")), "own");
  // Y no por accidente: `memory2` cuelga de la MISMA raíz propia pero no es la memoria.
  // Con la forma esto necesitaba una excepción (`[1] === "memory"`); con la contención no
  // hace falta ninguna, y una regla menos es una forma menos por la que conferir autoridad.
  assert.notEqual(classifyWrite(root, join(projects, proyecto, "memory2")), "own");
});

test("NC-B-2.2: la memoria de otro proyecto NO es propia — y tampoco queda bloqueada", () => {
  const ajena = join(projects, "C--Claude-bots-proyectos-bot-lus-lore", "memory", "nota.md");
  assert.notEqual(classifyWrite(root, ajena), "own",
    "otra sesión, otro dueño: la forma de la ruta no concede jurisdicción");
  // R16 bloquea lo ajeno, y una memoria de sesión no es un árbol gobernado por Lore: no hay
  // `lore/` ni contrato de ningún dueño arriba. Entonces no es `foreign` sino `unknown`, y lo
  // desconocido PASA con aviso y constancia (y andamiaje #21 exige que la RED enumere los
  // caminos propios del bot que la porta —este es uno, y sigue abierto).
  assert.equal(jurisdictionBlock(root, "Write", { file_path: ajena }), null,
    "no convertir el agujero en un bloqueo: eso sería recrear NC-B-2 con otro nombre");
  assert.deepEqual(unknownWrites(root, "Write", { file_path: ajena }), [ajena],
    "y no pasa en silencio: se avisa y se anota");
});

test("NC-B-2.3: la memoria de un árbol enrutado no recibe escritura propia", () => {
  const colmena = arbol("ncb2-enrutado-");
  try {
    const bot = join(colmena, "bot");
    poner(bot, "lore/principios.md");
    poner(bot, "lore/enrutamiento.md", "| Área | Cuándo | Dónde |\n|---|---|---|\n| X | siempre | `area-x` |\n");
    const hermano = join(colmena, "area-x");
    poner(hermano, "lore/principios.md");

    // Enrutar permite leer el criterio, pero no escribir la memoria de otro dueño.
    assert.equal(classifyWrite(bot, join(projects, slugDe(hermano), "memory", "nota.md")), "unknown",
      "la memoria ajena no adquiere jurisdicción por figurar en la tabla");
    // Y la memoria de un árbol que el enrutamiento NO declara sigue sin ser propia: la
    // declaración es lo que concede, no el hecho de estar en la misma carpeta.
    const noDeclarado = join(colmena, "area-y");
    poner(noDeclarado, "lore/principios.md");
    assert.notEqual(classifyWrite(bot, join(projects, slugDe(noDeclarado), "memory", "nota.md")), "own");
  } finally {
    rmSync(colmena, { recursive: true, force: true });
  }
});

test("NC-B-2.4: el separador alterno no cambia la respuesta; las mayúsculas tampoco la conceden", () => {
  const propia = join(projects, slugDe(root), "memory", "nota.md");
  // Separador: la misma ruta escrita con `/` es la misma ruta, y sigue siendo propia.
  assert.equal(classifyWrite(root, propia.split(sep).join("/")), "own");
  assert.equal(classifyWrite(root, propia.split(sep).join("\\")), "own");

  // Mayúsculas: una variante de MAYÚSCULAS del nombre de un proyecto ajeno no se vuelve
  // propia. En este host el sistema de archivos no distingue mayúsculas, así que la variante
  // apunta al mismo directorio que la ruta que acabamos de rechazar: si el permiso mirara la
  // forma, esto pasaría. Límite declarado: en un sistema de archivos que SÍ distinguiera
  // mayúsculas, esta variante sería un directorio distinto — la comparación de nombres de
  // proyecto es exacta a propósito, así que seguiría sin concederse.
  const ajena = join(projects, "C--Claude-bots-proyectos-bot-lus-lore", "memory", "nota.md");
  for (const variante of [ajena.toUpperCase(), ajena.replace("bot-lus-lore", "BOT-LUS-LORE")]) {
    assert.notEqual(classifyWrite(root, variante), "own",
      `las mayúsculas no son autoridad: ${variante}`);
  }
  // Y un proyecto que se parece al nuestro sin serlo —mismo prefijo, un carácter de menos—
  // tampoco. La forma de una ruta no es autoridad ni cuando se parece a la autoridad.
  const casi = slugDe(root).slice(0, -1);
  assert.notEqual(classifyWrite(root, join(projects, casi, "memory", "nota.md")), "own");
});

// --- el arreglo no puede recrear lo que vino a corregir ---------------------------------

test("NC-B-2.5: el scratchpad de la sesión y su estado siguen siendo propios", () => {
  // La corrección de NC-B-2.5 añade raíces propias; si alguna vez las ganara algo, la
  // regresión de NC-B-2 volvería por la puerta de al lado y nadie lo vería hasta que un
  // bot no pudiera trabajar. Se fija acá el otro camino propio que la guardia ya dejaba
  // pasar, que es el que el andamiaje #21 exige enumerar antes de instalar una guardia.
  const scratch = join(tmpdir(), "claude", "sesion-de-prueba", "scratchpad", "borrador.md");
  assert.equal(classifyWrite(root, scratch), "own");
  assert.equal(jurisdictionBlock(root, "Write", { file_path: scratch }), null);
  assert.deepEqual(unknownWrites(root, "Write", { file_path: scratch }), [],
    "y no se avisa de los archivos del propio kit: un kit que avisa de lo suyo enseña a ignorar el aviso");
  const estado = join(tmpdir(), "lore-plugin-sessions", "algo.json");
  assert.equal(classifyWrite(root, estado), "own");
});

// --- la junction: la identidad no cambia, el destino sí (S5, puerta de Andrés) ----------

test("S5: una junction dentro de la raíz propia no evade el control", () => {
  // `classifyWrite` compara rutas LÉXICAS y nunca resuelve enlaces: una junction colocada
  // dentro de la raíz propia que apunte a un árbol ajeno se clasifica `own` y la escritura
  // aterriza en el árbol de otro dueño. Reproducido aquí con un árbol real y una junction
  // real; el arreglo (`realpath` en vez de `resolve`) ESTRECHA lo que hoy pasa, y eso
  // cambia qué se bloquea: es jurisdicción, y la decide Andrés. Hasta entonces esto falla
  // a propósito y no cuenta ni como verde ni como fallo (andamiaje #21).
  const base = mkdtempSync(join(tmpdir(), "s5-junction-"));
  const propio = join(base, "mi-proyecto");
  const ajeno = join(base, "otro-proyecto");
  try {
    poner(propio, "lore/principios.md");
    poner(ajeno, "lore/principios.md");
    const enlace = join(propio, "atajo");
    execFileSync("cmd", ["/c", "mklink", "/J", enlace, ajeno], { stdio: "pipe" });
    assert.ok(existsSync(enlace), "la junction se crea en este host sin privilegios");
    assert.equal(classifyWrite(propio, join(ajeno, "lore", "principios.md")), "foreign",
      "control: el árbol ajeno se clasifica ajeno");
    assert.equal(classifyWrite(propio, join(enlace, "lore", "principios.md")), "foreign",
      "y por la misma escritura alcanzada a través del enlace, también");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("NC-B-2.6: un árbol ajeno con su lore se sigue bloqueando", () => {
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

test("NC-B-2.7: lo desconocido pasa, y queda nombrado para que alguien lo mire", () => {
  const suelta = join(tmpdir(), `suelta-${process.pid}.md`);
  const avisos = unknownWrites(root, "Write", { file_path: suelta });
  assert.ok(avisos.includes(resolve(suelta)), "lo desconocido se avisa, no se bloquea en silencio");
  assert.equal(jurisdictionBlock(root, "Write", { file_path: suelta }), null);
});

// --- S3 y S4: la jurisdicción se concede desde archivos que el sujeto puede escribir -------
//
// Reproducido contra árboles reales, sin tocar el código. Las dos son la misma familia y las
// dos cambian QUÉ se bloquea, así que ninguna se corrige sin arbitraje: son la puerta G1 del
// informe de seguridad simulada. Lo que este archivo hace es dejarlas escritas y fallando,
// para que la suite no las pueda dar por resueltas por silencio.

test("S3: editar el enrutamiento no convierte un árbol ajeno en propio", () => {
  // La tabla de `lore/enrutamiento.md` concede jurisdicción, y ese archivo vive DENTRO de la
  // raíz propia: la sesión que la guardia controla es también la que puede editarla. Hoy,
  // con eso, `DENY` pasa a `ALLOWED` sobre el mismo árbol. Se reproduce en tres pasos sobre
  // el mismo banco, con la misma escritura.
  const colmena = arbol("s3-enrutamiento-");
  try {
    const bot = join(colmena, "bot");
    poner(bot, "lore/principios.md");
    const tabla = poner(bot, "lore/enrutamiento.md", "| Área | Cuándo | Dónde |\n|---|---|---|\n");
    const ajeno = join(colmena, "otro");
    poner(ajeno, "lore/principios.md");
    const criterioAjeno = join(ajeno, "lore", "principios.md");

    assert.equal(classifyWrite(bot, criterioAjeno), "foreign", "paso 1: el árbol ajeno no se abre");

    writeFileSync(tabla, "| Área | Cuándo | Dónde |\n|---|---|---|\n| O | siempre | `otro` |\n");
    assert.equal(classifyWrite(bot, criterioAjeno), "foreign",
      "paso 3: la MISMA escritura sigue bloqueada después de que la sesión se declarara el árbol");
  } finally {
    rmSync(colmena, { recursive: true, force: true });
  }
});

test("S4: el área no concede jurisdicción a los proyectos hermanos", () => {
  // `areaRoot` devuelve el ÁREA, no su `lore/`. Una sesión abierta en `<área>/proyectos/mío/`
  // escribe entonces el criterio de `<área>/proyectos/otro/` y se clasifica `own`. El
  // comentario del código justifica el `<área>/lore/` —escribir criterio confirmado y
  // genérico del área es CAPTURE con promoción—; lo que excede es alcanzar a cada proyecto
  // hermano, que tiene criterio propio. Alcance mínimo respaldado por la fuente: el área
  // concede `<área>/lore/`, y cada proyecto conserva el suyo.
  const area = arbol("s4-area-");
  try {
    const mio = join(area, "proyectos", "mio");
    poner(mio, "lore/principios.md");
    poner(area, "lore/principios.md");
    const hermano = join(area, "proyectos", "otro");
    poner(hermano, "lore/principios.md");

    assert.equal(classifyWrite(mio, join(area, "lore", "nuevo.md")), "own",
      "lo que el comentario sí justifica: el lore/ del área es propio");
    assert.equal(classifyWrite(mio, join(hermano, "lore", "principios.md")), "foreign",
      "pero el criterio de un proyecto hermano no lo es, aunque el área sea la misma");
  } finally {
    rmSync(area, { recursive: true, force: true });
  }
});

// RC6, revision adversarial simulada: `tool_input: null` tumbaba la guardia.
// `hooks/codex-guard.mjs` llama `jurisdictionBlock(root, tool, data.tool_input)` sin validar, y el
// valor por defecto `input = {}` de `structuredWritePaths` solo cubre `undefined`, no `null`: un
// payload malformado lanzaba TypeError FUERA del try/catch que el archivo declara ("Fails open on
// any error"), con exit 1 y traza en el transcript del host. Un crash no es fail-open ni
// fail-closed, es la guardia sin evaluar.
test("SEC-1: un payload de herramienta malformado degrada en silencio, y no tumba la guardia", () => {
  for (const malformado of [null, [1, 2], 42, "texto", true]) {
    assert.deepEqual(structuredWritePaths("Write", malformado), [],
      `sin rutas que evaluar para ${JSON.stringify(malformado) ?? "null"}`);
    assert.equal(jurisdictionBlock(root, "Write", malformado), null,
      "un payload ilegible no bloquea: el contrato declarado es fallar abierto");
  }
  // Y no se rompió el camino ordinario: con la ruta presente, la guardia sigue decidiendo.
  const ajeno = join(mkdtempSync(join(tmpdir(), "lore-guard-sec1-")), "area-ajena", "lore", "principios.md");
  mkdirSync(resolve(ajeno, ".."), { recursive: true });
  assert.ok(jurisdictionBlock(root, "Write", { file_path: ajeno }), "el ajeno sigue bloqueado");
});
