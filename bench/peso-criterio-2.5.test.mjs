// El peso del criterio que un agente carga al abrir sesión (corte 2.5) — y el «ni demasiado fuerte».
//
// EL HECHO QUE LO MOTIVA, textual:
//
//   «Un Lore demasiado fuerte produce la gente muere agarrada a las herramientas que definen su
//   competencia. La armadura del autocontrol debe ser ni demasiado fuerte, ni demasiado débil.»
//
// LA LEY QUE SE MIDE, y no otra:
//
//   «2.5 no puede agregar nada que no quite lo mismo.»  (ley del corte)
//
// La aritmética de esa frase es una resta: lo que entra menos lo que sale, y el resultado no puede
// ser positivo. El instrumento es esa resta, aplicada a la superficie que de verdad carga.
//
// LO QUE HOY NO EXISTE, y por eso este archivo nace rojo:
//
// El techo de peso ya tiene una prueba —`bench/continuidad-2.4.9.test.mjs`,commit `cc7229d`— y da
// delta 0 B. Pero **mide dos archivos**: los encabezados de `use-lore` y `vespi`. La superficie que
// carga criterio tiene ocho `SKILL.md`, dieciséis cifras y ninguna está declarada. Peor: el número que
// el kit sí ejecuta, `alwaysOnBytes` (`hooks/lore-state.mjs:150`), mide el bloque siempre-activo del
// árbol de la persona, no el criterio del kit — que es la causa raíz que `andamiaje/…/principios.md`
// #30 ya escribió: *«un techo sin unidad declarada se cumple según la unidad que elija cada uno; la del
// paquete no exige abrir el kit»*.
//
// En este repositorio, las cifras 4536 y 260969 no aparecen en ningún archivo. La medición no existe.
//
// LA DOS CIFRAS, y de dónde sale la exigencia de que sean dos:
//
//   `andamiaje/lore-plugin/lore/principios.md` #30, textual:
//   *«El techo se expresa en los bytes cargados en el contexto, siempre y bajo demanda, con la cifra
//   «antes» en la condición, su fecha y su archivo; toda reducción se prueba por identidad del
//   artefacto.»*
//
// De ahí salen tres exigencias que esta prueba hace cumplir y que antes no cumplía nadie:
//   1. DOS cifras, no una: la de carga siempre y la de carga bajo demanda.
//   2. La unidad es el BYTE CARGADO EN EL CONTEXTO. El tamaño del paquete no es la unidad.
//   3. La cifra «antes» va EN LA CONDICIÓN, con su fecha y su archivo. Una condición sin la cifra no
//      dice qué techo se está cumpliendo.
//
// LA SUPERFICIE, y lo que queda fuera de ella (`Pista #14` de LUS, ley de este programa):
//
//   DENTRO — medido, en bytes, con la misma cuenta para el ancla y para hoy:
//     · carga siempre     = el frontmatter de cada `skills/*/SKILL.md` (nombre + descripción).
//     · carga bajo demanda = el cuerpo de esos mismos ocho `SKILL.md`.
//
//   FUERA — declarado aquí y no medido, con el motivo y la cifra de cada exclusión. Las tres sumas
//   son de HOY, medidas sobre el mismo árbol que las dos cifras de dentro, para que la comparación
//   sea de frente:
//     · `skills/vespi/core/` — el kernel vendorizado: 447 634 B en 21 archivos (.js, .mjs, .json). Se
//       EJECUTAN; no entran al contexto del modelo.
//     · El resto de los `.mjs`/`.json` de `skills/` (`use-lore/scripts/`,
//       `transmute-lore/scripts/`, `save-to-lore/scripts/`, `create-bot/`): 110 721 B. También se
//       ejecutan, también fuera del contexto.
//     · Los `.md` que no son `SKILL.md` dentro de `skills/` (`save-to-lore/notas.md`,
//       `transmute-lore/*.md`, `vespi/*.md`): 103 690 B. Los lee un procedimiento cuando su propia
//       skill los nombra por ruta; no cargan al abrir la sesión.
//     · El árbol de la persona: `CLAUDE.md`, `lore/`, `FASES.md`. Eso sí carga al abrir, pero es
//       criterio suyo y no del kit, y lo mide `alwaysOnBytes` en otra superficie.
//
//   LA RIVAL QUE EXPLICARÍA LO MISMO, y por qué no es esta:
//
//     RIVAL 1 — «el kit pesó más». Los 558 355 B de código del kit y los 103 690 B de criterio que no
//     es `SKILL.md` se leen como que la superficie cresció, sin que cresciera una sola palabra de lo que
//     el agente carga. Queda fuera por la ley de la unidad (#30): lo que se mide son los bytes
//     CARGADOS EN EL CONTEXTO, y un archivo que se ejecuta no entra al contexto. Este es el rival
//     más probable, porque es el que hace que «la cifra subió» y «el agente carga más» parezcan lo
//     mismo — y son cosas distintas.
//
//   RIVAL 2 — «el árbol de la persona engordó». `alwaysOnBytes` (`hooks/lore-state.mjs:150`) es un
//     número ejecutable que el kit produce, y mira el bloque siempre-activo del `CLAUDE.md` de la
//     persona, no el criterio del kit. Confundir las dos superficies da un número que se mueve con una
//     escritura de otra persona y se lee como una regresión del kit. Es la confusión que la causa raíz
//     de #30 ya nombró — *«la del paquete no exige abrir el kit»*—, y por eso aquí las dos superficies
//     se miden y se declaran por separado.
//
// LO QUE NO SE AFIRMA AQUÍ:
//
// Que el host cargue los ocho frontmatter en cada turno. Eso es una propiedad del host, no del
// repositorio, y una prueba de repositorio no la puede ver. Lo que sí es del repositorio es la
// afirmación del propio kit, textual, en `bench/continuidad-2.4.9.test.mjs:199`:
// *«Ley #24: lo siempre cargado no cambia. Un byte de frontmatter es un byte por host, por turno.»*
// La cifra que sale de aquí es la del texto del kit, y esa es su frontera de validez.
//
// LA VARA, y de dónde sale cada número:
//
//   · La UNIDAD (byte) sale de `andamiaje` #30. No es elección de este archivo.
//   · La NORMA (`delta ≤ 0` por cifra) es la ley del corte, textual: «no puede agregar nada que no
//     quite lo mismo». No es un techo nuevo.
//   · El ANCLA sale de `docs/RC2-la-unidad-con-reloj.md:100`, textual: *«el tag `v2.4.9` ya es una
//     coordenada que no se mueve: esto es RC2 sobre `release/2.5-prep`»*.
//
//   LO QUE NO SE INVENTA, y se dice en voz alta porque la ley lo exige:
//
//   No hay ningún techo ABSOLUTO para ninguna de las dos cifras. `andamiaje` #30 fija la unidad y las
//   dos cifras, pero no da un número; y los dos números absolutos que el kit tiene —450 B y 400 B— son
//   decisiones de Andrés del 2026-10-04 sobre DOS archivos concretos, no sobre la superficie entera.
//   Estirarlos a los ocho sería inventar la vara. Lo que se propone, y no se aplica, es un techo
//   absoluto sobre `carga siempre` medido contra el número que la persona acepte; queda pendiente de
//   Andrés, y hasta que exista la ley aplicable es la resta la que gobierna, no un techo inventado.
//
// EL ANCLA DEL «ANTES», y por qué no puede ser una rama:
//
// Un tag lo bajan todos los clones, no se mueve, y tiene fecha y archivo — que es lo que #30 exige de
// la cifra «antes». Una rama local no viaja a ningún clon y convierte la medición en una observación de
// esta máquina. El mismo razonamiento que ya está escrito en
// `bench/continuidad-2.4.9.test.mjs:87-93`.
//
// LA DECLARACIÓN QUE ESTA PRUEBA EXIGE:
//
// El «antes» no puede vivir solo dentro de una prueba: la condición del techo tiene que llevar la
// cifra, su fecha y su archivo. Por eso el techo se declara en `bench/techo-de-peso.json`, que hoy NO
// EXISTE, y que esta prueba no puede fabricar por sí sola: si lo calculara al vuelo, no declararía nada
// y el «antes» viajaría con el código en vez de quedar congelado en un artefacto.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");

// La condición del techo: el artefacto que lleva la cifra «antes», su fecha y su archivo.
// Que no exista es exactamente el defecto que este instrumento viene a tapar.
const DECLARACION = join(repo, "bench", "techo-de-peso.json");

// El ancla: la coordenada congelada del «antes». Sale de `docs/RC2-la-unidad-con-reloj.md:100`.
// Un tag, no una rama — ver el bloque de comentarios arriba.
const ANCLA = "v2.4.9";

// La superficie: los `SKILL.md` que el kit instala. Se descubre, no se escribe a mano, para que una
// novena skill no pueda entrar al techo sin que la superficie la nombre.
function superficie() {
  return readdirSync(join(repo, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => `skills/${e.name}/SKILL.md`)
    .filter((rel) => existsSync(join(repo, rel)))
    .sort();
}

// La cuenta. Una sola función para el ancla y para hoy: si las dos cifras salieran de cuentas
// distintas, la resta no compararía nada.
const frontmatter = (texto) => /^---\n[\s\S]*?\n---\n/.exec(texto)?.[0] ?? "";

function cifrasDe(texto) {
  const limpio = texto.replace(/\r\n/g, "\n");
  const fm = frontmatter(limpio);
  const siempre = Buffer.byteLength(fm, "utf8");
  return { siempre, bajoDemanda: Buffer.byteLength(limpio, "utf8") - siempre };
}

// ¿El ancla se puede resolver en este clon? Distinguir esto de «el ancla existe pero no tiene este
// archivo» es lo que separa un clon mal clonado de una pieza que entró en la superficie. Confundir
// los dos hace que agregar una skill se reporte como «el clon está roto», que es un diagnóstico
// falso: la medición que dice una cosa que no pasó es el mismo defecto que este instrumento tapa.
function anclaSeLee() {
  try {
    execFileSync("git", ["-c", "safe.directory=*", "rev-parse", "--verify", "--quiet", `${ANCLA}^{commit}`], {
      cwd: repo, stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

// El texto de un `SKILL.md` en el ancla. Si el ancla no se puede leer, ESTO FALLA en vez de
// saltarse: un `skip` no rompe la corrida, y una ley que se salta no está probada.
function leerEnElAncla(ruta) {
  try {
    return execFileSync("git", ["-c", "safe.directory=*", "show", `${ANCLA}:${ruta}`], {
      cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).replace(/\r\n/g, "\n");
  } catch {
    // El ancla se lee pero no tiene esta pieza: la superficie creció con algo que no tiene «antes».
    if (anclaSeLee()) {
      assert.fail(
        `«${ruta}» está en la superficie de HOY y no existe en el ancla ${ANCLA}.\n` +
        `Eso no es un clon roto: es una pieza nueva, y la ley del corte es textual — «2.5 no puede\n` +
        `agregar nada que no quite lo mismo». Para que la pieza entre bajo el techo hay que decidirlo\n` +
        `por escrito: mover el ancla a un tag que ya la contenga, y entonces las dos cifras «antes» se\n` +
        `vuelven a leer de ese artefacto. Si la entrada no debería contar, no es una skill del kit y no\n` +
        `va en skills/ con un SKILL.md.`,
      );
    }
    assert.fail(
      `el peso del criterio no se pudo medir: el ancla ${ANCLA} no se lee en este clon.\n` +
      `No se saltea a propósito. Para medirlo a mano:\n` +
      `  git -c safe.directory=* fetch --tags\n` +
      `  git -c safe.directory=* show ${ANCLA}:skills/use-lore/SKILL.md | Measure-Object -Character\n` +
      `  (y lo mismo para los ocho: el total del frontmatter es la carga siempre, el del cuerpo es la bajo demanda)`,
    );
  }
}

// Las cifras de la superficie, en el ancla y ahora. Un solo recorrido para las dos: si el «antes» se
// midiera con una cuenta y el «ahora» con otra, el delta sería ruido.
function medir(rutaDeArchivo) {
  const leer = rutaDeArchivo === "ancla" ? leerEnElAncla : (rel) => readFileSync(join(repo, rel), "utf8");
  const totales = superficie().reduce(
    (acc, rel) => {
      const c = cifrasDe(leer(rel));
      acc.siempre += c.siempre;
      acc.bajoDemanda += c.bajoDemanda;
      return acc;
    },
    { siempre: 0, bajoDemanda: 0 },
  );
  return totales;
}

// La declaración, o `null`. Devolver `null` y no lanzar deja que cada prueba diga qué falta, en vez
// de que la primera que corre se coma el diagnóstico de todas las demás.
function declaracion() {
  if (!existsSync(DECLARACION)) return null;
  try {
    return JSON.parse(readFileSync(DECLARACION, "utf8"));
  } catch {
    return null;
  }
}

// El mensaje de la ausencia. Dice qué falta y cómo producir la cifra a mano: una medición que no
// corrió tiene que dejar el número afuera, no una ausencia.
const SIN_DECLARACION =
  `el techo de peso del criterio no está declarado: ${DECLARACION} no existe o no es JSON legible.\n` +
  `Eso es el defecto, no un detalle: la ley exige «la cifra «antes» en la condición, su fecha y su\n` +
  `archivo» (andamiaje/lore-plugin/lore/principios.md #30), y sin declaración no hay cifra «antes»\n` +
  `que comparar. Para producirla a mano:\n` +
  `  git -c safe.directory=* show ${ANCLA}:skills/use-lore/SKILL.md | Measure-Object -Character\n` +
  `  (ocho archivos: la suma de los frontmatter es la carga siempre, la de los cuerpos la bajo demanda)`;

// --- 1. La medición está declarada, completa, y esta prueba no se puede anular a sí misma -------

test("el techo del peso del criterio está declarado y esta medición no se puede anular a sí misma", () => {
  const fuente = readFileSync(fileURLToPath(import.meta.url), "utf8");
  const fallas = [];

  // 1a. Ninguna prueba de este archivo puede convertirse en un resultado que no rompa la corrida.
  if (/\bt\.(skip|todo)\s*\(/.test(fuente)) {
    fallas.push("este archivo usa t.skip/todo: un skip no rompe la corrida, y el techo volvería a quedar sin prueba");
  }

  // 1b. La declaración existe y trae las dos cifras con su fecha y su archivo.
  const d = declaracion();
  if (!d) {
    fallas.push(SIN_DECLARACION);
  } else {
    for (const campo of ["unidad", "ancla", "ancla_tipo", "ancla_fecha",
      "carga_siempre_antes", "carga_bajo_demanda_antes"]) {
      if (d[campo] === undefined || d[campo] === null || d[campo] === "") {
        fallas.push(`la declaración no trae «${campo}»: una condición sin ese campo no declara el techo que dice declarar`);
      }
    }
    // Y las tres listas. Vacías o solo con cadenas en blanco: es la forma que toma una declaración
    // que nadie escribió, y por eso se miran con `trim`.
    for (const campo of ["superficie", "fuera_de_superficie", "rival"]) {
      const valor = d[campo];
      if (!Array.isArray(valor)) {
        fallas.push(`«${campo}» no es una lista: la superficie, lo que queda fuera y la rival se declaran pieza por pieza, no como una frase`);
      } else if (valor.length === 0) {
        fallas.push(`«${campo}» está vacía: la superficie, lo que queda fuera y la rival se declaran, y una lista vacía es no declararlas`);
      } else if (valor.some((p) => typeof p !== "string" || p.trim() === "")) {
        fallas.push(`«${campo}» tiene una pieza vacía: una declaración a medio escribir pesa como una declaración entera`);
      }
    }
  }

  assert.equal(fallas.length, 0,
    fallas.length === 0
      ? "el techo del peso del criterio no tiene prueba"
      : `el techo del peso del criterio no tiene prueba:\n  - ${fallas.join("\n  - ")}`);
});

// --- 2. La superficie declarada es la superficie que el kit carga --------------------------

test("la superficie declarada es la superficie que el kit carga, pieza por pieza", () => {
  const d = declaracion();
  assert.ok(d, SIN_DECLARACION);

  assert.deepEqual(d.superficie, superficie(),
    "la superficie del techo no es la superficie del kit: una skill que entra sin declararse no está\n" +
    "bajo el techo, y una que sale sin quitarse sigue pesando en el número");

  // Y toda pieza declarada existe de verdad: una ruta que ya no existe es una condición que ya no
  // dice lo que dice.
  for (const rel of d.superficie) {
    assert.ok(existsSync(join(repo, rel)), `la superficie declara «${rel}» y ese archivo no existe`);
  }
});

// --- 3. El ancla es un artefacto publicado, con fecha y con archivo --------------------------

test("la cifra «antes» se apoya en un artefacto publicado que viaja a cualquier clon", () => {
  const d = declaracion();
  assert.ok(d, SIN_DECLARACION);

  assert.equal(d.ancla, ANCLA,
    `el ancla del techo es ${d.ancla} y la ley escrita exige el ancla que fija este corte\n` +
    `(docs/RC2-la-unidad-con-reloj.md:100). Cambiarla mueve la línea de base sin que nadie lo decida.`);

  // Un tag, no una rama: una rama no baja a ningún clon y la medición se vuelve local.
  let tipo = null;
  try {
    tipo = execFileSync("git", ["-c", "safe.directory=*", "cat-file", "-t", `refs/tags/${d.ancla}`], {
      cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch { tipo = null; }
  assert.equal(tipo, "tag",
    `el ancla «${d.ancla}» no es un tag publicado (${tipo ?? "no existe como tag"}): en otro clon la\n` +
    "cifra «antes» no se lee, y un techo cuyo «antes» solo existe en esta máquina no es un techo");

  // Y la fecha: #30 exige «su fecha y su archivo». Sin fecha, el «antes» no es un punto en el tiempo.
  let fecha = null;
  try {
    fecha = execFileSync("git", ["-c", "safe.directory=*", "log", "-1", "--format=%cI", d.ancla], {
      cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch { fecha = null; }
  assert.ok(fecha, "el ancla no declara su fecha: la cifra «antes» necesita saber de cuándo es");
  assert.equal(d.ancla_fecha, fecha,
    `la fecha declarada (${d.ancla_fecha}) no es la fecha del ancla (${fecha}): una fecha que no se\n` +
    "contrasta con el artefacto es una fecha escrita a mano");
});

// --- 4. La cifra «antes» declarada es la que el ancla realmente tiene -------------------------

test("la cifra «antes» que declara la condición es la que el ancla tiene, y no la que alguien escribió", () => {
  const d = declaracion();
  assert.ok(d, SIN_DECLARACION);
  const antes = medir("ancla");

  assert.equal(d.unidad, "bytes",
    `la unidad declarada es «${d.unidad}» y la ley la fija en bytes: un techo sin unidad declarada se\n` +
    "cumple según la unidad que elija cada uno (andamiaje/lore-plugin/lore/principios.md #30)");
  assert.equal(d.carga_siempre_antes, antes.siempre,
    `la carga siempre declarada es ${d.carga_siempre_antes} B y el ancla tiene ${antes.siempre} B: una\n` +
    "cifra «antes» que no coincide con su artefacto no es un «antes», es un número escrito");
  assert.equal(d.carga_bajo_demanda_antes, antes.bajoDemanda,
    `la carga bajo demanda declarada es ${d.carga_bajo_demanda_antes} B y el ancla tiene ${antes.bajoDemanda} B`);
});

// --- 5. La ley: lo que entra, lo sale. Y el número sale en cada corrida. ----------------------

test("el criterio que carga al abrir sesión no crece sin que otra pieza lo quite", (t) => {
  const antes = medir("ancla");
  const ahora = medir("arbol");

  const deltas = [
    { nombre: "carga siempre", antes: antes.siempre, ahora: ahora.siempre },
    { nombre: "carga bajo demanda", antes: antes.bajoDemanda, ahora: ahora.bajoDemanda },
  ];

  for (const { nombre, antes: a, ahora: b } of deltas) {
    const delta = b - a;
    t.diagnostic(`${nombre}: ${a} B (${ANCLA}) -> ${b} B ahora | delta ${delta >= 0 ? "+" : ""}${delta} B | ley: delta <= 0`);
    assert.ok(delta <= 0,
      `${nombre} creció ${delta} B contra ${ANCLA} y ninguna pieza lo quitó.\n` +
      `La ley del corte es textual: «2.5 no puede agregar nada que no quite lo mismo».\n` +
      `Para cumplirla: quita los mismos bytes en la MISMA cifra, o quita en la otra y mueve el ancla\n` +
      `por decisión escrita. Estirar el ancla para que el número pase es mover la línea de base.`);
  }

  const totalAntes = antes.siempre + antes.bajoDemanda;
  const totalAhora = ahora.siempre + ahora.bajoDemanda;
  t.diagnostic(`peso total del criterio del kit: ${totalAntes} B (${ANCLA}) -> ${totalAhora} B ahora | delta ${totalAhora - totalAntes >= 0 ? "+" : ""}${totalAhora - totalAntes} B`);
});