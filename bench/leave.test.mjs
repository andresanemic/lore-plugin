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
