import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = (name) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");

// Ponytail: one minimal check that fails if routing regresses — no fixtures.
// Enrutar y enchufar son dos operaciones. El gate del kit cubre la primera; esta cubre la segunda.
// Forma estructural, no prosa: writing-skills manda automatizar lo que un regex verifica.

const SKILLS = ["use-lore", "brainstorming-lore", "create-area", "create-project",
                "create-bot", "save-to-lore", "transmute-lore", "obsidian-lore"];

export function orphanSections(read = skill) {
  const orphans = [];
  for (const name of SKILLS) {
    const txt = read(name);
    for (const m of txt.matchAll(/^#{2,3} +(.+)$/gm)) {
      const title = m[1];
      if (/^Phase/i.test(title)) continue;              // un paso no se llama a si mismo
      if (!/check|mode|scan|gate/i.test(title)) continue;
      const key = (title.match(/[A-Z]{4,}/) || [])[0];
      if (!key) continue;
      if (!new RegExp(key, "i").test(txt.slice(0, m.index))) orphans.push(`${name}: ## ${title.trim()}`);
    }
  }
  return orphans;
}



test("LEAVE vive en transmute-lore, no en save-to-lore (H14 for skills)", () => {
  assert.match(skill("transmute-lore"), /## LEAVE mode/);
  assert.match(skill("transmute-lore"), /<!-- lore:always-on -->/);
  assert.match(skill("transmute-lore"), /H13.*unmeasurable/);
  assert.doesNotMatch(skill("save-to-lore"), /## LEAVE mode/);
  assert.doesNotMatch(skill("save-to-lore"), /## Exit — leaving/);
});

test("use-lore enruta LEAVE a transmute-lore (gate antes de escribir)", () => {
  const use = skill("use-lore");
  assert.match(use, /transmute-lore.*\(\*\*LEAVE\*\*\)/);
  assert.match(use, /Gate before adding a mode/);
  assert.match(use, /brainstorming-lore.*before choosing a skill/);
  const save = skill("save-to-lore");
  assert.match(save, /Routing gate — before you write/);
  assert.match(save, /transmute-lore.*LEAVE.*not CAPTURE\/GRAFT/);
});

test("LEAVE deja criterio vivo y reversible (A+B) sin fantasma", () => {
  const t = skill("transmute-lore");
  assert.match(t, /Verify `lore\/` exists/);
  assert.match(t, /Remove the `<!-- lore:always-on -->` block/);
  assert.match(t, /Convert `FASES\.md` to the host/);
  assert.match(t, /enrutamiento\.md/);
  assert.match(t, /plain `enrutamiento\.md`/);
  assert.match(t, /project must remain buildable without the kit/);
  assert.match(t, /Why here and not in `save-to-lore`/);
});

// Auditoría 2.3.0 con Opus high (2026-08-22): tres defectos verificados sobre el borrador
// escrito con opencode+muse-spark. Cada test falla contra dc83986 y pasa con la corrección.

test("LEAVE escribe la marca `leave:` — sin ella UPGRADE no puede volver y H13 sigue sin instrumento", () => {
  const t = skill("transmute-lore");
  const leave = t.slice(t.indexOf("## LEAVE mode"), t.indexOf("## CRYSTALLIZE mode"));
  assert.match(leave, /`leave:`/);
});

test("MICELIO está enchufado en una fase de PRUNE, no solo escrito al lado (H14 sobre sí mismo)", () => {
  const t = skill("transmute-lore");
  const prune = t.slice(t.indexOf("## PRUNE mode"), t.indexOf("## MICELIO mode"));
  assert.match(prune, /MICELIO/);
});

test("el gate de enrutamiento no se dispara con el `index.md` que todo CAPTURE toca", () => {
  assert.match(skill("save-to-lore"), /index\.md[^\n]*does not count|no cuenta|not the second artifact/);
});

test("ningún frontmatter supera los 1024 caracteres de la especificación", () => {
  for (const name of ["use-lore", "brainstorming-lore", "create-area", "create-project",
                      "create-bot", "save-to-lore", "transmute-lore", "obsidian-lore"]) {
    const fm = skill(name).split("---")[1];
    assert.ok(fm.length <= 1024, `${name}: frontmatter de ${fm.length} caracteres`);
  }
});

test("el predicado del gate no cuenta artefactos en NINGUNA skill — index.md lo rompía en las dos", () => {
  for (const name of ["save-to-lore", "use-lore"]) {
    assert.doesNotMatch(skill(name), /touches ≥2 artifacts/,
      `${name}: el umbral por conteo se dispara con el módulo + index.md que todo CAPTURE escribe`);
  }
});

// Enrutar y enchufar son dos operaciones. El gate del kit cubre la primera; esta cubre la segunda.
// Forma estructural, no prosa: writing-skills manda automatizar lo que un regex verifica.

test("una capacidad nueva declara el paso que la corre — ninguna seccion queda huerfana", () => {
  assert.deepEqual(orphanSections(), [], "capacidad que ningun paso anterior nombra");
});

// MICELIO — el barrido de enchufe deja de ser apéndice de PRUNE y gana sus dos disparadores.
// RED medido en community-manager el 2026-08-22: 4 Pistas sin micorriza, las 4 de menos de 48h.
// El defecto no decae con el tiempo: nace con la Pista, así que un barrido de viernes llega tarde.

test("MICELIO es un modo de transmute-lore, no un apéndice", () => {
  assert.match(skill("transmute-lore"), /## MICELIO mode/,
    "el barrido no tiene sección de modo propia");
});

test("MICELIO se enruta desde use-lore — una capacidad sin fila no la invoca nadie", () => {
  assert.match(skill("use-lore"), /MICELIO/,
    "use-lore no nombra MICELIO: el modo existe y ningún camino llega");
});

test("MICELIO tiene sus dos disparadores declarados: post-instalación y pre-tarea", () => {
  const txt = skill("use-lore");
  assert.match(txt, /install/i, "falta el disparador post-instalación");
  assert.match(txt, /before a complex|antes de una tarea/i, "falta el disparador pre-tarea");
});

// 2026-08-22, bot-cm: Andres pide brainstormear el lote de publicaciones de la semana y ejecutar
// SIN writing-plans, todo inline. brainstorming-lore ya gano esa pelea (derrota #5 de la fuente),
// pero su gate exige que el artefacto sea del sistema Lore — y un lote de posts no lo es. El caso
// caia en superpowers:brainstorming, que termina en "Do NOT invoke any other skill. writing-plans
// is the next step". La derrota #5 evitada adentro del kit y vuelta a comer por el flanco.

test("brainstorming-lore cubre el entregable GOBERNADO por Lore, no solo el artefacto Lore", () => {
  const t = skill("brainstorming-lore");
  assert.match(t, /governed by|gobernado por|governs how this deliverable/i,
    "el gate solo admite artefactos del sistema Lore: un entregable que se arbitra contra Lore enrutado no tiene ruta");
  assert.match(t, /writing-plans/,
    "no dice por que importa: el caso excluido cae en una skill que obliga writing-plans");
});

test("el segundo caso viene con predicado observable, no con una excepcion blanda", () => {
  const t = skill("brainstorming-lore");
  const i = t.search(/## Trigger boundary/);
  const sec = t.slice(i, i + 4000);
  assert.match(sec, /routed `?lore\/`?|lore\/ enrutado|routed Lore that governs/i,
    "sin predicado observable la ampliacion se vuelve activacion universal — la derrota #1 de la fuente");
  assert.match(sec, /does not enter|no entra|stays out/i,
    "falta el lado negativo: un predicado que nunca excluye no es un predicado");
});

// 2026-08-22, community-manager: el ritual del viernes corrio MICELIO como paso 0 y despues
// PRUNE + GRAFT. GRAFT escribe Pistas nuevas, y una Pista nueva NACE aislada — es el hallazgo del
// propio modo: el aislamiento se produce al ritmo que se escribe criterio, no se acumula con la
// edad. Un barrido solo de entrada no puede ver nada de lo que la propia operacion acaba de crear.

test("MICELIO declara su pasada de salida: una operacion que escribe Lore vuelve a barrer", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /on the way out|de salida|exit pass/i,
    "MICELIO solo se dispara al entrar: lo que PRUNE y GRAFT acaban de escribir no lo barre nadie");
  assert.match(mic, /a new clue is born|nace aislada|born .*Aislada/i,
    "no dice por que hace falta la segunda pasada: una Pista nueva nace sin junta");
});

test("PRUNE y GRAFT declaran que su salida vuelve a MICELIO", () => {
  const t = skill("transmute-lore");
  const prune = t.slice(t.indexOf("## PRUNE mode"), t.indexOf("## MICELIO mode"));
  assert.match(prune, /MICELIO/,
    "PRUNE no devuelve a MICELIO: puede haberse llevado el paso que corria una Pista viva");
  assert.match(skill("save-to-lore"), /MICELIO/,
    "save-to-lore no nombra MICELIO: GRAFT escribe criterio nuevo y nada verifica que enganche");
});

// Hallazgo de la primera corrida de MICELIO sobre el propio kit (2026-08-22):
// 5 de 8 modos tenían gate nombrado en use-lore y 3 se enrutaban solo por descripción.
// Media junta: el destino existe y el término está ausente ahí — el caso `Missing` del propio modo.

test("los ocho modos tienen junta nombrada en use-lore, no solo descripción", () => {
  const t = skill("use-lore");
  const sin = ["ADD","CLEAN","TRANSLATE","UPGRADE","PRUNE","MICELIO","LEAVE","CRYSTALLIZE"]
    .filter(m => !t.includes(`**${m}**`));
  assert.deepEqual(sin, [], "modo sin gate nombrado en la tabla de enrutamiento");
});

// 2026-08-22, en la primera corrida del propio modo: MICELIO reporto hallazgos sobre el kit
// y la sesion siguio al sync sin escribirlos. Enchufar la EJECUCION de un chequeo no enchufa
// su RESULTADO — son dos juntas, y la guardia de a1eb550 solo cubre la primera.

test("MICELIO detiene lo que viene despues — un hallazgo sin escribir bloquea la operacion", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /block|detiene|bloquea/i,
    "MICELIO termina en 'propone' y nada consume su salida");
});

// El vocabulario del modo es criterio: `Orphan` es vertical (falta alguien arriba) y el defecto
// es lateral (no hay junta con nadie al lado). Los cuatro casos hablan micelio o el registro
// se pelea consigo mismo.

test("los cuatro casos de MICELIO estan en registro micelio, sin restos de ORPHAN", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  for (const caso of ["Micorrizada", "Aislada", "Media junta", "Junta seca"])
    assert.ok(mic.includes(caso), `falta el caso ${caso}`);
  // El termino retirado sobrevive en UN solo lugar legitimo: la nota que lo retira.
  const usos = (mic.match(/Orphan/g) || []).length;
  assert.ok(usos <= 1, `Orphan usado ${usos} veces; solo la nota que lo retira puede nombrarlo`);
  assert.ok(!mic.includes("| **Orphan"), "Orphan sigue siendo nombre de caso en la tabla");
});

// 2026-08-22: se edito lore-plugin desde una sesion abierta en otra area. El always-on solo
// dispara para el arbol de la sesion, asi que plugins/lore/ nunca entro al contexto y su ley
// de versionado se violo sin aviso. MICELIO acotaba su universo al Lore escaneado; la junta
// que faltaba era entre el arbol que se toca y el area que lo gobierna.

test("MICELIO resuelve el area dueña de cada arbol que se toca, no solo el de la sesion", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /owning area|area dueña|área dueña/i,
    "MICELIO no obliga a resolver el area dueña del arbol editado");
});

// canon/frontera.md de bot-lus-lore: una hipotesis de LUS no se vuelve ley de una skill sin
// arbitraje, umbral y prueba. H14 sigue abierta en n=1 y con explicacion rival (Crowding).
// Distinguirlas cambia el remedio: si es Crowding se poda, si es H14 podar destruye la junta.

test("MICELIO declara que su premisa es hipotesis abierta con explicacion rival", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /Crowding/, "no nombra la explicacion rival de H14");
  assert.match(mic, /n=1|open hypothesis|hipotesis abierta/i, "presenta H14 como hecho asentado");
});

test("los dos skills declaran MICELIO en sus invariantes (registro del principio 15)", () => {
  for (const n of ["transmute-lore", "use-lore"]) {
    const t = skill(n);
    const inv = t.slice(t.lastIndexOf("## Invariants"));
    assert.match(inv, /MICELIO/, `${n}: MICELIO no entro al registro de invariantes`);
  }
});

// 2026-08-22, community-manager: la regla de como se publica una cifra de fuente externa se
// escribio en chatterpay/docs/. MICELIO la reporto Aislada solo porque el autor sabia que la
// habia escrito una hora antes — el modo toma su universo del lore/, asi que criterio que
// aterrizo en una carpeta de fuente no entra a la barrida y no puede ni siquiera clasificarse.
// Segundo caso el mismo dia: las capturas que alimentaban un doc citado vivian fuera del repo.

test("MICELIO barre criterio que aterrizo fuera de lore/, no solo lo que ya esta adentro", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /docs\/|carpeta de fuente|source folder/i,
    "MICELIO toma su universo del lore/: el criterio escrito en docs/ o notas/ es invisible por construccion");
});

test("MICELIO tiene un quinto caso para el criterio que nunca entro al sustrato", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /Fuera del sustrato/,
    "sin quinto caso, criterio fuera de lore/ se reporta como Aislada y su reparo es distinto: son dos movimientos, no uno");
  assert.ok(mic.includes("| **Fuera del sustrato**"),
    "el quinto caso no esta en la tabla de casos");
});

// 2026-08-22, segunda corrida del mismo dia: el staging del area vive en docs/ A PROPOSITO, con su
// gate escrito y el paso que lo ejerce nombrado. Todo lo que el quinto caso diagnostica es falso
// sobre el, y aun asi no dispara: el paso vive en una spec que el arbol desde el que se opera no
// carga. No es Media junta — ahi el termino falta en el destino; aca esta, y el destino no es el
// artefacto en vigor. Los dos reparos apuntan al reves.

test("MICELIO distingue la junta que apunta a un artefacto que la sesion no carga", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.ok(mic.includes("| **Junta a otro árbol**"),
    "el sexto caso no esta en la tabla de casos");
  assert.match(mic, /artifact the running tree does not load|artifact actually in force|artifact that is actually running/i,
    "sin el sexto caso, una junta correcta que apunta a otro arbol se clasifica Media junta y se repara escribiendo el termino donde ya estaba");
});

// 2026-08-22, Andres: "los modos de micelio no me gustan... no le puedes ir exigiendo al usuario
// que ejecute terminos tan complejos". El defecto es real y verificable: seis casos en espanol
// dentro de skills escritas en ingles. Pero enunciar simple y renombrar los casos son dos
// operaciones distintas, y solo la primera hace falta: Junta seca y Media junta se reparan al
// reves, y un nombre que las fusione devuelve el error. Clave estable adentro, frase llana afuera.

test("MICELIO tiene capa llana con clave neutra al idioma, sin perder los seis casos", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  for (const clave of ["`connected`", "`alone`", "`missed`", "`no-exchange`",
                       "`outside`", "`other-tree`"])
    assert.ok(mic.includes(clave), `falta la clave neutra ${clave}`);
  // La capa es superficie, no reemplazo: los seis casos siguen existiendo con su nombre.
  for (const caso of ["Micorrizada", "Aislada", "Media junta", "Junta seca",
                      "Fuera del sustrato", "Junta a otro árbol"])
    assert.ok(mic.includes(caso), `la capa llana se comio el caso ${caso}`);
  assert.match(mic, /never require somebody to type|never teach the vocabulary/i,
    "sin esto la capa llana es decorativa: el usuario sigue teniendo que aprender el vocabulario para preguntar");
  assert.match(mic, /governs how findings are \*\*said\*\*, not how they are classified/i,
    "falta la frontera: una capa que fusione missed con no-exchange rompe el modo en vez de simplificarlo");
});

// El disparador 3 pasa a ser automatico, y para en una condicion estrecha a proposito. MICELIO
// prueba UNA cosa: que una regla PUEDE disparar. "Auditor interno del kit" le pide certificar que
// el criterio es correcto, que es justo lo que el modo se niega a decir. Ademas H14 esta en n=1
// con Crowding como rival declarada. Y su ecualizacion es una regla, no una intencion:
// nunca re-reporta lo declinado, porque un chequeo que es ruido se saltea.

test("el disparo automatico de MICELIO exige las dos mitades y no repite lo declinado", () => {
  const t = skill("transmute-lore");
  const mic = t.slice(t.indexOf("## MICELIO mode"), t.indexOf("## LEAVE mode"));
  assert.match(mic, /wrote criteria and touched routing/i,
    "sin las dos mitades el disparo salta con un typo o con una linea de FASES, y se vuelve tedioso");
  assert.match(mic, /\*\*Both halves are required\.\*\*/,
    "una sola mitad convierte la condicion en 'cada vez que se toca un archivo'");
  assert.match(mic, /never re-reports what the person already declined/i,
    "sin esta regla el modo es ruido, y un chequeo que es ruido no se corre");
  assert.match(mic, /instead of becoming .the kit's internal auditor./i,
    "falta la derrota escrita: ensanchar el nombre sin ensanchar el mecanismo es el defecto que retiro el nombre vertical");
});

// 2026-08-22, Andres: use-lore y brainstorming-lore deben sugerir un tutorial. El riesgo es que
// "mapa conceptual / texto corto / test" sea exactamente el menu que el umbral 0 rechaza. Se
// resuelve como el registro: se infiere UNA forma y se corrige en una linea.

test("el tutorial se infiere y se ofrece; no es un menu ni reemplaza al primer artefacto", () => {
  const u = skill("use-lore");
  const gate = u.slice(u.indexOf("## 0. Very first use"), u.indexOf("## The standard:"));
  assert.match(gate, /one shape, never a\nmenu|one shape, never a menu/i,
    "sin esto el tutorial se vuelve la lista de opciones que este mismo umbral rechaza");
  assert.match(gate, /Never expand it into a list of options/i,
    "falta el anti-patron explicito: el menu vuelve con cara amable");
  assert.match(gate, /never replaces the artifact/i,
    "un tutorial entregado en lugar del primer artefacto es el kit explicandose a alguien que se queda sin nada");
  // brainstorming-lore lo propone, pero no duplica la regla de inferencia: un solo dueno.
  const b = skill("brainstorming-lore");
  assert.match(b, /Orientation for somebody new to the kit/i,
    "brainstorming-lore corre el primer uso y no sabe que puede ofrecerlo");
  assert.match(b, /carries the inference rule and the\nexact wording; do not duplicate it here|do not duplicate it here/i,
    "sin esto la regla vive en dos archivos y gana la que este mas cerca del indice");
});
