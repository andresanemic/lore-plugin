import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { MOTOR, parseFrontmatter } from "../scripts/yaml-frontmatter.mjs";

// S3v2 — quién aparece y cuándo: el reparto de las frases cotidianas (R2, R23; absorbe R6).
// Segunda vuelta. La primera (S3, en `git stash list`) falló una revisión independiente con cuatro
// defectos, y los cuatro son requisitos duros acá, no sugerencias: el frontmatter que dejó roto
// (6), la huella que comparaba una lista vacía contra otra lista vacía (7), las cifras de bytes sin
// remedir (8) y la suite sin correr de verdad (9). Cada uno tiene su prueba, nombrada con el
// número del requisito.
//
// QUÉ ES Y QUÉ NO ES ESTE ARCHIVO. El mecanismo real de disparo es el campo `description` del
// frontmatter: el host lo lee para decidir si carga la skill, y el cuerpo no se lee nunca antes de
// esa decisión. Por eso la mitad de estas pruebas leen el `description` real y afirman sobre él.
//
// Y no es un banco de modelo. Nada acá llama a un modelo: la parte del host (qué `description`
// reclama qué frase) es texto, y la parte de la decisión se simula de forma explícita y auditable,
// con la simulación leída del archivo en disco y no reimplementada en la prueba. Medir la decisión
// de un modelo de verdad es otra cosa, y ya tiene dueño: `bench/vespi-disparo/` (V1a, con V1b
// encima). Lo que este archivo mide es si el texto que el agente lee basta para decidir bien, y si
// cargarlo cambia la decisión sobre el MISMO trabajo.
//
// LA CONVENCIÓN QUE ESTE ARCHIVO SOSTIENE, y por eso el corte del disparador es mecánico: cada
// `description` tiene dos partes, el disparador y el traspaso, y el traspaso arranca con la marca
// literal `Not yours:`. Lo que va antes es lo que la skill reclama; lo que va después es a quién
// le toca la frase que no es suya, y nunca reclama. Sin esa marca las dos mitades se mezclan y una
// skill que entrega la frase ajena termina reclamándola también — que es el defecto que R23 quiere
// cazar. La marca se prueba: si una de las tres deja de escribirla, esto falla.
//
// Las palabras de cada familia salen del acuerdo, no de las `description`. Los ejemplos del acuerdo
// son n=1 de quien lo escribió: lo que se prueba acá es el mecanismo del reparto, y la forma de
// hablar de otra gente la mide `vespi-disparo`.
//
// La comparación que imita está en `lore-plugin` `4f2bc65` (2.4.8-rc.4): mismo trabajo, agente
// fresco, con y sin la skill. Se conserva el orden —rojo, mínimo, verde—; no se reproduce ese
// commit, que medía el disparo de un hook y no el de un `description`.

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODULO = () => import(pathToFileURL(join(raiz, "skills", "use-lore", "scripts", "acuerdo.mjs")).href);

const LAS_TRES = ["use-lore", "brainstorming-lore", "vespi"];
const MARCA = "Not yours:";

const sin = (s) => String(s).replace(/\r\n/g, "\n").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const aplanar = (s) => sin(s).replace(/\s+/g, " ");

// El `description`, leído por un parser de YAML de verdad (requisito 6). Nada de regex que extraiga
// texto: un `description` con dos puntos internos sin comillas rompe el parseo del host, y una
// regex no se entera y devuelve el texto igual de lindo.
const skill = (nombre) => parseFrontmatter(readFileSync(join(raiz, "skills", nombre, "SKILL.md"), "utf8"));
const descripcion = (nombre) => skill(nombre).data.description;
const cuerpo = (nombre) => skill(nombre).cuerpo;

// El disparador: el `description` hasta la marca de traspaso.
function disparadorDe(nombre) {
  const d = aplanar(descripcion(nombre));
  const corte = d.indexOf(sin(MARCA));
  return corte === -1 ? d : d.slice(0, corte);
}
const traspasoDe = (nombre) => {
  const d = aplanar(descripcion(nombre));
  const corte = d.indexOf(sin(MARCA));
  return corte === -1 ? "" : d.slice(corte);
};

// Las tres familias del acuerdo, línea 19 de `specs/012-rc4/acuerdo.md`.
// «todavía no hay forma de trabajo», «la forma existe y está en riesgo», y la frase de la forma
// general angostada por el diseño.
const FAMILIAS = {
  "sin-forma": ["no se como", "no se por donde", "no hay forma de trabajo", "todavia no hay forma", "ayudame a empezar"],
  diseno: ["diseno", "disenar", "ayudame a pensar", "help me think", "piensa el", "antes de construir", "como deberia ser"],
  "en-riesgo": [
    "me esta complicando",
    "se esta complicando",
    "se esta perdiendo",
    "lo que decidimos",
    "perdiamos",
    "sigamos manana",
    "esta en riesgo",
  ],
};

function reclama(nombre, familia) {
  const d = disparadorDe(nombre);
  return FAMILIAS[familia].some((t) => d.includes(sin(t)));
}

// Una familia y su angosta. «Todavía no hay forma de trabajo» es el caso general; «hay que pensar
// el diseño» es el mismo caso angostado, y el acuerdo dice que ese le toca a `brainstorming-lore`.
// La angosta le gana a la ancha por construcción: la dueña de la ancha es la que NO reclama la
// angosta. Si las dos reclamaran la ancha, «no sé cómo» dispararía las dos a la vez.
const ANGOSTA = { "sin-forma": "diseno", diseno: null, "en-riesgo": null };

const duennoDe = (familia, de = LAS_TRES) => {
  const reclamantes = de.filter((n) => reclama(n, familia));
  const angosta = ANGOSTA[familia];
  return angosta ? reclamantes.filter((n) => !reclama(n, angosta)) : reclamantes;
};

// El reparto acordado, escrito una vez para que las pruebas no lo repitan de tres maneras.
// La tercera familia ya no se reparte por description. El reparto arbitrado el 2026-10-02 dice que las frases humanas las
// responde el coordinador y que la tabla de tres frases vive UNA vez, en el cuerpo de use-lore; vespi es el protocolo que el
// coordinador invoca en rol y su description lo dice. El host no ofrece vespi ante «esto me está complicando», a proposito.
const REPARTO = { "sin-forma": "use-lore", diseno: "brainstorming-lore", "en-riesgo": "use-lore" };
const POR_TABLA = new Set(["en-riesgo"]);
const FRASES_DE_RIESGO = ["esto me está complicando", "se está perdiendo lo que decidimos", "sigamos mañana"];
const ENCARGADA_DE_LA_TABLA = "use-lore";

function familiaDe(frase) {
  const t = sin(frase);
  for (const familia of ["en-riesgo", "diseno", "sin-forma"]) {
    if (FAMILIAS[familia].some((x) => t.includes(sin(x)))) return familia;
  }
  return null;
}

// El enrutador del host, simulado. Lee el catálogo de `description` disponibles —el mismo catálogo
// en los dos brazos de la huella: el host los tiene siempre, y quitarlos no es "el agente sin la
// skill", es una máquina sin skills— y decide con ellos, sin saber nada del kit.
function ofreceElHost(frase, de = LAS_TRES) {
  const familia = familiaDe(frase);
  if (familia === null) return { ofrece: null, familia: null };
  // Por la tabla: el host no ofrece ninguna description, el coordinador ya en rol lee la tabla de la encargada.
  if (POR_TABLA.has(familia)) return { ofrece: ENCARGADA_DE_LA_TABLA, familia };
  const duenas = duennoDe(familia, de);
  return { ofrece: duenas.length === 1 ? duenas[0] : null, familia };
}

// El agente simulado. No es un modelo: es la decisión que la ley cargada prescribe. Cada paso se
// toma porque una frase está ESCRITA en el cuerpo de la skill cargada, y el cuerpo se lee del disco
// en cada llamada — si esa frase se borra del archivo, el paso desaparece y la huella se rompe. Esa
// es la atadura entre esta prueba y el texto: no reimplementa la ley, la lee.
function agente({ raiz: arbol, frase, pieza, cargadas, cuerpos = null, M }) {
  const cuerpoDe = (n) => (cuerpos && n in cuerpos ? cuerpos[n] : cuerpo(n));
  const decision = { skill: null, preguntas: [], silencio: false, por: null, familia: null };
  const { ofrece, familia } = ofreceElHost(frase);
  decision.familia = familia;
  if (ofrece === null) {
    decision.por = "sin-coincidencia";
    decision.preguntas = ["¿qué es esto que querés que haga?"];
    return decision;
  }
  if (!cargadas.includes(ofrece)) {
    // Sin la skill cargada el agente tiene el disparador y nada más: no tiene con qué saber que
    // hay un acuerdo vigente, ni que la frase de otro estado no es suya. Y así contesta.
    decision.por = "sin-skill";
    decision.preguntas = ["¿qué forma de trabajo usamos para esto?"];
    return decision;
  }
  decision.skill = ofrece;
  decision.por = POR_TABLA.has(familia) ? "tabla" : "frase";
  // El chequeo silencioso del acuerdo vive escrito en el cuerpo de la skill que responde. Es lo
  // primero que esa skill hace, y por eso decide antes que la frase. Sin la ley escrita la skill
  // cargada no tiene con qué saber que hay un acuerdo vigente: contesta lo mismo que sin skill.
  if (!/silent check|chequeo silencioso/i.test(cuerpoDe(ofrece))) {
    decision.por = "sin-ley";
    decision.preguntas = ["¿qué forma de trabajo usamos para esto?"];
    return decision;
  }
    const chequeo = M.cubrir(M.leer(arbol), pieza);
    if (chequeo.cubierto) {
      return { ...decision, skill: null, preguntas: [], silencio: true, por: "acuerdo" };
    }
    decision.preguntas = [`¿metemos «${pieza}» al acuerdo o lo dejamos fuera?`];
  // La pieza no cubierta de una frase de riesgo la toma el coordinador, que invoca el protocolo de vespi.
  if (POR_TABLA.has(familia)) decision.skill = "vespi";
  return decision;
}

// --- el árbol de trabajo, real -------------------------------------------------

const HOY = "2026-09-28";
const PIEZA_CUBIERTA = "formulario-de-contacto";
const PIEZA_NUEVA = "reenvio-de-correo";

// Un árbol de verdad, con su acuerdo aprobado por las tres puertas, su `FASES.md`, su contrato y
// su `lore/`. Los datos del experimento salen de acá, no de una lista escrita en la prueba: una
// huella medida contra una lista vacía no mide nada, y una contra una lista inventada mide el
// invento.
function arbolReal() {
  const root = mkdtempSync(join(tmpdir(), "reparto-frases-"));
  mkdirSync(join(root, "lore"), { recursive: true });
  writeFileSync(join(root, "FASES.md"), [
    `# FASES`,
    ``,
    `fase: la ferretería — formulario y correos`,
    `en curso: ${PIEZA_CUBIERTA}`,
    `pendiente: ${PIEZA_NUEVA}`,
    ``,
  ].join("\n"));
  writeFileSync(join(root, "CLAUDE.md"), [
    `# ferreteria`,
    ``,
    `<!-- lore:always-on -->`,
    `## El criterio de este proyecto`,
    ``,
    `- \`lore/\` — mapa, identidad y principios`,
    `- \`FASES.md\` — el estado. **Avanza; el criterio persiste.**`,
    `<!-- /lore:always-on -->`,
    ``,
  ].join("\n"));
  writeFileSync(join(root, "lore", "identidad.md"), "# ferreteria\n\nUn local que vende herramientas.\n");
  writeFileSync(
    join(root, "lore", "principios.md"),
    "# Principios\n\nContext → causa raíz → pista: el formulario se manda sin adjuntar el presupuesto.\n",
  );
  writeFileSync(join(root, "lore", "index.md"), "- `principios.md` — envío del formulario\n");
  return root;
}

async function arbolConAcuerdo() {
  const M = await MODULO();
  const root = arbolReal();
  const acuerdo = M.elegir({
    porque: "Quiero que el formulario de la ferretería salga sin que tenga que vigilarlo.",
    trabajo: "el formulario de contacto y los correos que salen con el",
    intensidad: "cercana",
    ritmo: "normal",
    cubre: [PIEZA_CUBIERTA],
    limites: [{ familia: "gpt-5", nivel: "medio", nunca: false }],
  });
  const r = M.registrar(acuerdo, {
    raiz: root,
    aprobado: true,
    recapitulacion: "Vas a hacer el formulario de contacto. Te hablo cercana y a ritmo normal.",
    ahora: HOY,
  });
  assert.equal(r.escrito, true, `el acuerdo no se escribio: ${r.falta}`);
  assert.equal(M.hayAcuerdo(root), true, "el arbol quedo sin acuerdo vigente, y el experimento no mide nada");
  return { root, M };
}

const fases = (root) => readFileSync(join(root, "FASES.md"), "utf8");
// La pieza sale del estado del árbol, no de la prueba: es el trabajo que el árbol dice que está en
// curso. Si algún día `FASES.md` deja de nombrarla, la huella tiene que dejar de claimar que es
// el mismo trabajo.
const enCurso = (root) => fases(root).match(/^en curso: (.+)$/m)?.[1] ?? null;
const pendiente = (root) => fases(root).match(/^pendiente: (.+)$/m)?.[1] ?? null;

// ===============================================================================
// 1. EL ROJO DE HOY: cada frase cotidiana llega a la skill que le toca.
//    Se prueba contra `reparte()`, la ley ejecutable del kit: no una copia de ella en la prueba.
// ===============================================================================

test("1a: «quiero hacer esto y no sé cómo» le toca a use-lore, y el árbol tiene trabajo real", async () => {
  const M = await MODULO();
  assert.equal(M.reparte({ frase: "quiero hacer esto y no sé cómo" }).skill, "use-lore");
  assert.equal(M.reparte({ frase: "todavía no hay forma de trabajo" }).skill, "use-lore");
  // Y no es una lista vacia: el reparto se proba sobre un arbol con acuerdo, lore y estado.
  const { root } = await arbolConAcuerdo();
  try {
    assert.ok(existsSync(join(root, "acuerdo.md")));
    assert.equal(enCurso(root), PIEZA_CUBIERTA);
    assert.equal(readFileSync(join(root, "acuerdo.md"), "utf8").length > 200, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("1b: la misma frase angostada por el diseño le toca a brainstorming-lore", async () => {
  const M = await MODULO();
  const r = M.reparte({ frase: "quiero hacer esto y no sé cómo, todavía no hay forma de trabajo, hay que pensar el diseño del bot" });
  assert.equal(
    r.skill,
    "brainstorming-lore",
    "el acuerdo dice que la misma frase angostada por el diseño va a brainstorming-lore, y no a use-lore",
  );
});

test("1c: las tres frases de riesgo le tocan a vespi, y ninguna es «no sé cómo»", async () => {
  const M = await MODULO();
  for (const frase of [
    "esto me está complicando",
    "se está perdiendo lo que decidimos",
    "sigamos mañana",
  ]) {
    assert.equal(M.reparte({ frase }).skill, "vespi", `«${frase}» no llegó a vespi`);
  }
  for (const frase of ["quiero hacer esto y no sé cómo", "todavía no hay forma de trabajo"]) {
    assert.notEqual(M.reparte({ frase }).skill, "vespi", `«${frase}» no era de vespi`);
  }
});

test("RC6: coordinar una operación existente entre proyectos activa Vespi; lo simple no", async () => {
  const M = await MODULO();
  const positivos = [
    "barre las notas de varios proyectos, arbitra lo pendiente y deja el jardín conectado para seguir mañana",
    "coordina lo que ya estamos haciendo entre varios proyectos y revisa qué falta antes de seguir",
  ];
  for (const frase of positivos) {
    assert.equal(M.reparte({ frase }).skill, "vespi", `«${frase}» no activó Vespi`);
  }
  for (const frase of [
    "escribe una noticia con el workflow de BlockVoz que ya funciona",
    "ayúdame a empezar un proyecto nuevo; todavía no hay forma de trabajo",
  ]) {
    assert.notEqual(M.reparte({ frase }).skill, "vespi", `«${frase}» activó Vespi sin necesidad`);
  }
  const disparador = disparadorDe("vespi");
  assert.match(disparador, /coordina|varios proyectos|notas de varios proyectos/i);
});

test("1d: cada description reclama su familia, que es lo único que el host lee antes de decidir", () => {
  for (const [familia, duena] of Object.entries(REPARTO)) {
    if (POR_TABLA.has(familia)) {
      // Ninguna description la reclama (vespi dice que no se invoca por frases) y la tabla vive en el cuerpo de la encargada.
      for (const nombre of LAS_TRES) {
        assert.equal(reclama(nombre, familia), false, `la description de ${nombre} reclama «${familia}», que se responde por la tabla de ${duena}`);
      }
      const tabla = aplanar(cuerpo(duena));
      for (const frase of FRASES_DE_RIESGO) {
        assert.ok(tabla.includes(sin(frase)), `la tabla canónica de ${duena} no trae la frase «${frase}»`);
      }
      assert.match(tabla, /coordinator/, `la tabla de ${duena} no dice que esas frases las responde el coordinador`);
      assert.match(tabla, /invokes the \`?vespi\`? operation|invokes the vespi operation/, `la tabla de ${duena} no dice que el coordinador invoca vespi`);
      continue;
    }
    assert.ok(
      reclama(duena, familia),
      `el description de ${duena} no nombra la familia «${familia}», así que el host nunca lo ofrece para ella`,
    );
  }
});

test("1e: cada familia tiene una sola dueña, y la angosta le gana a la ancha", () => {
  for (const [familia, duena] of Object.entries(REPARTO)) {
    if (POR_TABLA.has(familia)) {
      // Una sola dueña en el cuerpo: la tabla no se copia en las otras dos skills.
      const conLaTabla = LAS_TRES.filter((n) => FRASES_DE_RIESGO.every((fr) => aplanar(cuerpo(n)).includes(sin(fr))));
      assert.deepEqual(conLaTabla, [duena], `«${familia}»: las frases viven en ${conLaTabla.join(", ") || "ninguna skill"} y deben vivir solo en ${duena}`);
      continue;
    }
    const duenas = duennoDe(familia);
    assert.equal(
      duenas.length,
      1,
      `«${familia}» tiene ${duenas.length} dueñas (${duenas.join(", ") || "ninguna"}); el reparto exige una`,
    );
    assert.equal(duenas[0], duena, `«${familia}» la dueña ${duenas[0]} y le toca a ${duena}`);
  }
});

// ===============================================================================
// 2. LAS TRES DESCRIPTIONS DICEN CUÁNDO SE USAN, NO QUÉ HACEN (requisito 2).
// ===============================================================================

test("2a: cada description arranca como disparador y no resume el procedimiento", () => {
  for (const nombre of LAS_TRES) {
    const d = aplanar(descripcion(nombre));
    // vespi es un protocolo que el coordinador invoca en rol: su description arranca diciendo cuándo se invoca, no por una frase.
    const patron = nombre === "vespi" ? /^invoke to run a bounded operation\b/ : /^use (?:only )?when\b/;
    assert.match(d, patron, `${nombre}: la description no arranca como disparador`);
    // El techo de la especificacion de skills: `name` + `description` no pasan de 1024 caracteres.
    // El `description` es lo que entra en el prompt de cada sesion, y ahi cada caracter se paga.
    assert.ok(
      descripcion(nombre).length <= 700,
      `${nombre}: description de ${descripcion(nombre).length} caracteres; el techo del banco es 700`,
    );
    const total = Object.values(skill(nombre).data).join("").length;
    assert.ok(total <= 1024, `${nombre}: frontmatter de ${total} caracteres, sobre el techo de 1024`);
    // Lo que la description no debe hacer es describir el metodo: si lo hace, el agente sigue la
    // description y no lee el cuerpo (writing-skills, SDO). Ningun nombre de modo entra aca.
    for (const interno of ["mycelium", "move 1", "move 2", "move 3", "umbral", "paso 1", "the threshold"]) {
      assert.ok(
        !d.includes(sin(interno)),
        `${nombre}: la description nombra «${interno}», que es procedimiento y no disparador`,
      );
    }
  }
});

test("2b: cada description entrega la frase ajena y nombra a quién le toca", () => {
  const traspasos = {
    "use-lore": ["brainstorming-lore", "vespi"],
    "brainstorming-lore": ["use-lore", "vespi"],
    vespi: ["use-lore", "brainstorming-lore"],
  };
  for (const [nombre, hermanas] of Object.entries(traspasos)) {
    const traspaso = traspasoDe(nombre);
    assert.ok(traspaso.length > 0, `${nombre}: la description no escribe la marca «${MARCA}» del traspaso`);
    for (const hermana of hermanas) {
      assert.ok(
        traspaso.includes(sin(hermana)),
        `${nombre}: su traspaso no dice que la frase va a ${hermana}; sin eso el agente se queda con la suya`,
      );
    }
  }
});

test("2c: el traspaso va después del disparador, y lo que va antes no reclama la frase ajena", () => {
  for (const nombre of LAS_TRES) {
    const d = aplanar(descripcion(nombre));
    const corte = d.indexOf(sin(MARCA));
    assert.ok(corte > 40, `${nombre}: la marca «${MARCA}» esta antes de que la description diga nada propio`);
    const disparador = d.slice(0, corte);
    for (const familia of Object.keys(FAMILIAS)) {
      if (REPARTO[familia] === nombre) continue; // la suya sí la reclama: eso lo prueba 1d, no esto
      if (familia === "sin-forma" && nombre === "brainstorming-lore") continue; // su caso es este
      const tokens = FAMILIAS[familia].filter((t) => disparador.includes(sin(t)));
      assert.deepEqual(
        tokens,
        [],
        `${nombre}: su disparador nombra «${tokens.join(", ")}» de «${familia}», que no es suya`,
      );
    }
  }
});

// ===============================================================================
// 3. EL SILENCIO: dentro del acuerdo las tres callan, y cada una calla en la frase de otra.
// ===============================================================================

test("3a: con acuerdo vigente que cubre la pieza, las tres callan — aunque la frase sea de riesgo", async () => {
  const { root, M } = await arbolConAcuerdo();
  try {
    const pieza = enCurso(root);
    assert.equal(M.cubrir(M.leer(root), pieza).cubierto, true, "el fixture no cubre la pieza en curso");
    for (const frase of [
      "esto me está complicando",
      "se está perdiendo lo que decidimos",
      "sigamos mañana",
      "quiero hacer esto y no sé cómo",
    ]) {
      const cuerpoDeUse = cuerpo("use-lore");
      assert.match(cuerpoDeUse, /silent check|chequeo silencioso/i, "use-lore no escribe el chequeo silencioso");
      const d = agente({ raiz: root, frase, pieza, cargadas: LAS_TRES, M });
      assert.equal(d.silencio, true, `«${frase}»: con la pieza cubierta nadie habla, y habló ${d.skill}`);
      assert.deepEqual(d.preguntas, [], `«${frase}»: el silencio no pregunta nada`);
      assert.equal(d.skill, null, `«${frase}»: el silencio no invoca ninguna skill`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("3b: la misma frase de riesgo, con una pieza que el acuerdo no cubre, sí habla — y habla una", async () => {
  const { root, M } = await arbolConAcuerdo();
  try {
    const pieza = pendiente(root);
    assert.equal(M.cubrir(M.leer(root), pieza).cubierto, false, "el fixture no tiene una pieza sin cubrir");
    const d = agente({ raiz: root, frase: "esto me está complicando", pieza, cargadas: LAS_TRES, M });
    assert.equal(d.skill, "vespi");
    assert.equal(d.silencio, false);
    assert.ok(d.preguntas.length === 1, `la pieza nueva se pregunta una vez, y se pregunto ${d.preguntas.length} veces`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("3c: control negativo — una frase que no es de ninguna familia no despierta a ninguna skill", async () => {
  const { root, M } = await arbolConAcuerdo();
  try {
    for (const frase of [
      "cámbiame el título del README",
      "¿me pasás el archivo de ayer?",
      "corré los tests y decime si pasan",
      "agregá el precio del tornillo al catálogo",
    ]) {
      const d = agente({ raiz: root, frase, pieza: enCurso(root), cargadas: LAS_TRES, M });
      assert.equal(d.skill, null, `«${frase}» no es de ninguna familia y disparó ${d.skill}`);
      assert.equal(d.silencio, false);
      assert.equal(familiaDe(frase), null, `«${frase}» se está clasificando en una familia`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("3d: cada skill calla en la frase de otra, y su cuerpo dice a quién le toca", () => {
  // R23. Dos mitades: la description no reclama la familia ajena, y el cuerpo nombra a la dueña.
  // Sin la segunda, la skill no puede saber a quién pasarle la frase: el silencio sin destino es
  // la persona quedarse sin respuesta.
  const duenaDe = (familia) => REPARTO[familia];
  for (const nombre of LAS_TRES) {
    const ajena = (f) => REPARTO[f] !== nombre;
    for (const familia of Object.keys(FAMILIAS).filter(ajena)) {
      if (familia === "sin-forma" && nombre === "brainstorming-lore") continue; // la angosta es suya
      assert.equal(
        reclama(nombre, familia),
        false,
        `${nombre} reclama «${familia}», que es de ${duenaDe(familia)}: no puede callar en la frase de otra`,
      );
    }
    for (const familia of Object.keys(FAMILIAS)) {
      if (REPARTO[familia] === nombre) continue;
      // La dueña de una familia por tabla es la encargada de la tabla: las otras dos la nombran y apuntan a ella.
      assert.ok(
        cuerpo(nombre).includes(REPARTO[familia]),
        `${nombre} no nombra a ${REPARTO[familia]} en su cuerpo, así que no puede saber que esa frase no es suya`,
      );
    }
  }
});

// ===============================================================================
// 4. LAS CINCO CONDICIONES DE R2, SIEMPOR, DEBAJO DE LAS FRASES (requisito 5).
// ===============================================================================

// La lista vive una vez, en la skill que la ofrece; las otras dos la nombran y la aplican. Copiarla
// tres veces sería la saturación en suma que PRUNE existence; lo que tiene que estar en las tres es
// la ley —que corren bajo toda frase y también cuando no llega ninguna— no la enumeración.
const LAS_CINCO = ["no hay acuerdo para", "ya no cubre", "dejó de servir", "falla una condición", "fricción que se repite"];

test("4a: las cinco condiciones están escritas, completas, en la skill que las ofrece", () => {
  const use = aplanar(cuerpo("use-lore"));
  for (const condicion of LAS_CINCO) {
    assert.ok(use.includes(sin(condicion)), `use-lore no escribe la condición de R2 «${condicion}»`);
  }
  // Las cinco viven una vez, en use-lore. vespi las aplica y lo dice; brainstorming-lore no las repite: apunta a la tabla donde
  // están (puntero a use-lore), y por eso su cuerpo tiene que nombrar a quien las tiene.
  for (const nombre of ["use-lore", "vespi"]) {
    assert.ok(
      aplanar(cuerpo(nombre)).includes("r2"),
      `${nombre}: no nombra R2, así que no sabe que tiene una prueba interna debajo de las frases`,
    );
  }
  assert.ok(aplanar(cuerpo("brainstorming-lore")).includes("use-lore"), "brainstorming-lore no apunta a use-lore, donde viven las cinco condiciones y la tabla");
});

test("4b: las cinco corren bajo toda frase y cuando no llega ninguna — sin excepción", () => {
  // Requisito 5. El intento anterior las restringió a «lo que `vespi` revisa antes de disparar
  // cuando no llegó una frase», y esa restricción no está en ningún lado del acuerdo: la línea 19
  // dice que quedan como prueba interna DEBAJO DE LAS FRASES, sin exceptuar el caso con frase. La
  // única excepción que sí está escrita es la del acuerdo vigente, y esa es de otra cosa.
  for (const nombre of LAS_TRES) {
    const c = aplanar(cuerpo(nombre));
    assert.doesNotMatch(
      c,
      /before it fires on anything that did not arrive with a phrase|no llego una frase|anything that did not arrive with a phrase/,
      `${nombre}: volvio la excepción que restringe R2 al caso sin frase`,
    );
    // La ley de «con o sin frase» la escribe una vez la encargada de la tabla; vespi dice que corren bajo toda invocación.
    if (nombre === "brainstorming-lore") continue;
    assert.match(
      c,
      /under every phrase|under every invocation|whether or not a phrase arrived|bajo toda frase|con o sin frase/,
      `${nombre}: no dice que las cinco corren con y sin frase`,
    );
  }
});

// ===============================================================================
// 5. LA HUELLA DE R22: el MISMO trabajo, con la skill cargada y sin ella (requisitos 4 y 7).
//    Las dos armas usan el mismo árbol, la misma frase, la misma pieza y el mismo catálogo de
//    `description`. Lo único que cambia es qué cuerpos están cargados. Nunca hay una lista vacía
//    contra otra lista vacía: el control del final comprueba que la diferencia la causa el texto.
// ===============================================================================

test("5: el mismo trabajo decide distinto con la skill cargada que sin ella", async () => {
  const { root, M } = await arbolConAcuerdo();
  try {
    const CATALOGO = LAS_TRES; // el host los tiene en los dos brazos; sin ellos no hay skill que cargar

    // Escenario 1 — la pieza que el acuerdo ya cubre. La persona no tiene nada que decidir acá.
    const cubierta = enCurso(root);
    const frase = "esto me está complicando";
    const conSkill = agente({ raiz: root, frase, pieza: cubierta, cargadas: CATALOGO, M });
    const sinSkill = agente({ raiz: root, frase, pieza: cubierta, cargadas: [], M });

    assert.equal(conSkill.silencio, true, "con la skill, la pieza cubierta se resuelve sin preguntar");
    assert.deepEqual(conSkill.preguntas, []);
    assert.equal(sinSkill.silencio, false, "sin la skill, el agente pregunta lo que el acuerdo ya respondió");
    assert.ok(
      sinSkill.preguntas.length > 0,
      "el brazo sin skill tiene que producir una decisión observable: una lista vacía contra otra no prueba nada",
    );
    assert.notDeepEqual(conSkill.preguntas, sinSkill.preguntas, "no hay huella: las dos armas preguntan lo mismo");

    // Escenario 2 — la pieza que el acuerdo NO cubre. Acá las dos tienen algo que hacer, y la
    // diferencia es a quién le toca: la ruta de la skill contra la pregunta de nuevo a la persona.
    const nueva = pendiente(root);
    const frase2 = "quiero hacer esto y no sé cómo, todavía no hay forma de trabajo";
    const conSkill2 = agente({ raiz: root, frase: frase2, pieza: nueva, cargadas: CATALOGO, M });
    const sinSkill2 = agente({ raiz: root, frase: frase2, pieza: nueva, cargadas: [], M });

    assert.equal(conSkill2.skill, "use-lore", "con la skill, «no sé cómo» va a la que ofrece el acuerdo");
    assert.equal(sinSkill2.skill, null, "sin la skill no hay ruta: el kit no oye la frase");
    assert.notEqual(conSkill2.preguntas[0], sinSkill2.preguntas[0], "no hay huella en la pieza nueva");

    // Ninguno de los dos brazos está vacío: los dos scenes tienen trabajo, frase y acuerdo.
    for (const d of [conSkill, sinSkill, conSkill2, sinSkill2]) {
      assert.notEqual(d, null);
      assert.equal(typeof d.por, "string");
    }
    assert.ok(conSkill2.preguntas.length > 0 && sinSkill2.preguntas.length > 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("5b: la huella la causa el texto, no el muestreo — sin la ley cargada el brazo cambia", async () => {
  // El control que faltaba. Si la diferencia entre las dos armas viviera en la plumbing de la
  // prueba, este test pasaría con cualquier texto. Se borra la frase del cuerpo —en memoria, sin
  // tocar el archivo— y el brazo «con skill» tiene que volver a ContestAR lo mismo que el brazo
  // sin skill. Si no, la huella es del arnés y no de la skill.
  const { root, M } = await arbolConAcuerdo();
  try {
    const pieza = enCurso(root);
    const frase = "esto me está complicando";
    // La ley que callla la frase de riesgo con acuerdo vigente vive en la tabla de use-lore: ese es el cuerpo que se borra.
    const sinLey = cuerpo("use-lore").replace(/silent check/gi, "the check that is not written");
    assert.ok(
      sinLey !== cuerpo("use-lore"),
      "el control no se puede correr: el cuerpo de use-lore ya no dice «silent check» y el texto real hay que revisarlo",
    );
    const conLey = agente({ raiz: root, frase, pieza, cargadas: LAS_TRES, M });
    const borrada = agente({
      raiz: root,
      frase,
      pieza,
      cargadas: LAS_TRES,
      cuerpos: { "use-lore": sinLey }, M,
    });
    const sinSkill = agente({ raiz: root, frase, pieza, cargadas: [], M });

    assert.equal(conLey.silencio, true, "con la ley escrita, la pieza cubierta se resuelve en silencio");
    assert.equal(borrada.silencio, false, "con la ley borrada, el agente pregunta: la huella venia del texto");
    assert.deepEqual(borrada.preguntas, sinSkill.preguntas, "sin la ley cargada el agente es el mismo que sin skill");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("5c: la ley que produce la huella está escrita en el archivo, no inventada por la prueba", () => {
  for (const nombre of ["use-lore", "vespi"]) {
    assert.match(
      aplanar(cuerpo(nombre)),
      /silent check|chequeo silencioso/i,
      `${nombre}: el brazo con skill lee esta frase del archivo; si no está, la huella se rompe y el test lo tiene que decir`,
    );
  }
});

// ===============================================================================
// 6. EL FRONTMATTER DE LAS TRES, CON UN PARSER DE VERDAD (requisito 6).
// ===============================================================================

test("6a: el frontmatter de las tres skills tocadas es YAML válido y trae name y description", () => {
  console.log(`      [S3v2] frontmatter del reparto validado con el motor: ${MOTOR}`);
  for (const nombre of LAS_TRES) {
    const { data } = skill(nombre);
    assert.equal(typeof data, "object");
    assert.equal(data.name, nombre, `${nombre}: el name del frontmatter no coincide con la carpeta`);
    assert.equal(typeof data.description, "string", `${nombre}: la description no es un escalar`);
    assert.ok(data.description.length > 60, `${nombre}: la description llegó vacía o cortada`);
  }
});

test("6b: lo que el enrutador lee es el valor parseado, no el texto que una regex sacaría", () => {
  // Si el banco volviera a extraer el `description` con una expresion regular, la prueba seguiría
  // verde con un frontmatter roto. Con un parser, el escalar plegado llega plegado y el plano llega
  // plano; esta assertion falla si alguien reintroduce la regex.
  const d = descripcion("brainstorming-lore");
  assert.ok(!d.includes("\n"), "la description plegada llegó con saltos de linea: no se parseo, se extrajo");
  assert.ok(!d.trimStart().startsWith(">-"), "la description sigue siendo el indicador del bloque, no su valor");
  const cruda = readFileSync(join(raiz, "skills", "brainstorming-lore", "SKILL.md"), "utf8");
  assert.notEqual(d, cruda, "el description es el archivo entero: no se parseo el frontmatter");
});

test("6c: el description de vespi sobrevive al round-trip, con la forma que S3 rompió", () => {
  // S3 dejó en `skills/vespi/SKILL.md` un escalar sin comillas con dos puntos dentro —«...say the
  // same: a compaction...», «under strain: hold the current route»—. El host lee YAML: eso no es un
  // escalar y la skill desaparece del discovery sin que nada falle en el repositorio. La
  // autoprueba del parser, con esa forma exacta como caso, vive en
  // `scripts/yaml-frontmatter.test.mjs`; acá se comprueba que el archivo vivo sigue siendo
  // parseable y que su description no se truncó.
  const { data } = skill("vespi");
  assert.match(data.description, /^invoke to run a bounded operation/i, "la description de vespi no arranca como disparador");
  // La forma que S3 rompió es un escalar PLANO con «: » dentro. Un escalar de bloque (>-, >, |) o entre comillas es YAML válido
  // con dos puntos; el parser de arriba ya lo parseó, así que lo que se comprueba es que, si los tiene, no sea un escalar plano.
  const crudo = readFileSync(join(raiz, "skills", "vespi", "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  const lineaDescription = crudo.split("\n").find((l) => l.startsWith("description:")) ?? "";
  const valor = lineaDescription.slice("description:".length).trim();
  const esBloqueOComillas = /^(?:[>|][+-]?|["'])/.test(valor);
  if (/:\s/.test(data.description.split(" Not yours:")[0])) {
    assert.ok(esBloqueOComillas, "la parte de disparador de vespi tiene dos puntos y la description es un escalar plano: es la forma que S3 rompió");
  }
  // vespi ya no se dispara por frases humanas: lo que no se puede perder al parsear es el traspaso a la tabla canónica de use-lore.
  assert.ok(data.description.includes("canonical table"), "el puntero a la tabla canónica se perdió al parsear");
  assert.ok(!data.description.includes("sigamos mañana"), "vespi volvió a reclamar una frase humana");
});
