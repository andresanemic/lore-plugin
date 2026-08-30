import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { skillFiles, skillText } from "./skill-text.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(root, "skills");
const skills = readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const skillNames = skills.map((entry) => entry.name);
const rootDocs = readdirSync(root).filter((name) => name.endsWith(".md"));
const docs = rootDocs.map((name) => name).concat(
  readdirSync(join(root, "docs")).filter((name) => name.endsWith(".md")).map((name) => join("docs", name)),
);

test("las siete skills declaran un nombre único y neutral al proveedor", () => {
  assert.equal(skills.length, 7);
  const names = skills.map((entry) => {
    const text = skillText(join(skillsRoot, entry.name));
    assert.doesNotMatch(text, /Source of truth for Claude Code/i);
    return text.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  });
  assert.deepEqual(new Set(names).size, 7);
  assert.deepEqual(names.sort(), skills.map((entry) => entry.name).sort());
});

test("use-lore enruta explícitamente UPGRADE y CRYSTALLIZE", () => {
  const text = skillText(join(skillsRoot, "use-lore"));
  assert.match(text, /transmute-lore` \(\*\*UPGRADE\*\*\)/);
  assert.match(text, /transmute-lore` \(\*\*CRYSTALLIZE\*\*\)/);
});

test("use-lore compara la version del proyecto contra el kit, y lo distingue de MYCELIUM", () => {
  const text = skillText(join(skillsRoot, "use-lore"));
  assert.match(text, /Three rules/);
  assert.match(text, /## UPGRADE a X\.Y\.Z/);
  assert.match(text, /offer .*transmute-lore.* in \*\*UPGRADE\*\* mode/is);
  assert.match(text, /do not repeat the offer on every later message/i);
  assert.match(text, /Rule 3 is not MYCELIUM, and must not fold into it/);
});

test("use-lore gobierna entregables complejos sin crear una novena skill", () => {
  const text = skillText(join(skillsRoot, "use-lore"));
  assert.match(text, /Complex deliverables/);
  assert.match(text, /approved precedent/);
  assert.match(text, /available tools, connectors or MCPs/);
  assert.match(text, /batch/i);
  assert.match(text, /human review/);
  assert.equal(skills.length, 7);
  // 2026-08-28 (poda 2.3.x): el mecanismo vive una vez, en REFERENCE. README y USAGE apuntan.
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    const doc = readFileSync(join(root, file), "utf8");
    assert.match(doc, /complex deliverables|entregables complejos/i, `${file}: falta la ruta compleja`);
  }
});

test("save-to-lore pregunta por fuente autoritativa antes de destilar un hecho", () => {
  const save = skillText(join(skillsRoot, "save-to-lore"));
  assert.match(save, /authoritative source/i);
  assert.match(save, /provenance/i);
});

test("use-lore gobierna la apertura de sesión y la reanudación por continuidad", () => {
  const use = skillText(join(skillsRoot, "use-lore"));
  assert.match(use, /resumed from a continuity summary/i);
  assert.match(use, /continuing is deciding/i);
});

test("use-lore sugiere /model para el tramo mecanico de un lote, nunca un subagente", () => {
  const text = skillText(join(skillsRoot, "use-lore"));
  assert.match(text, /suggest `\/model`/);
  assert.match(text, /mechanical bulk and arbitration/);
  assert.match(text, /Never spend a subagent on it/);
  assert.match(text, /re-reads the project's whole Lore/);
});

test("el lote Jazmín deja obligaciones reutilizables y el caso 17", () => {
  const bot = skillText(join(skillsRoot, "create-bot"));
  const brainstorm = skillText(join(skillsRoot, "brainstorming-lore"));
  const save = skillText(join(skillsRoot, "save-to-lore"));

  for (const pattern of [
    /provisional canon/i,
    /operational cycle/i,
    /first victory/i,
    /individual configuration/i,
    /honest prototype/i,
    /local prototype is a laboratory/i,
    /the AI lives in the object it transforms/i,
    /decisions before prompts/i,
    /journey belongs to the purpose/i,
  ]) assert.match(bot, pattern);

  assert.match(brainstorm, /first victory/i);
  assert.match(brainstorm, /uncertainty and correction/i);
  assert.match(save, /contextual milestone/i);
  assert.match(save, /related clues accumulate/i);
  assert.match(save, /destination, wording, and why.*now/is);
  assert.match(save, /save them together/i);

  const casesEn = readFileSync(join(root, "docs", "CASES_en.md"), "utf8");
  const casesEs = readFileSync(join(root, "docs", "CASES_es.md"), "utf8");
assert.match(casesEn, /Case 17.*Jasmine/is);
  assert.match(casesEs, /Caso 17.*Jazmín/is);
  assert.match(casesEn, /Case 18.*threshold/is);
  assert.match(casesEs, /Caso 18.*umbral/is);
  assert.match(casesEn, /Case 19.*complete system/is);
  assert.match(casesEs, /Caso 19.*sistema completo/is);
  assert.match(casesEn, /LUS.*Case 18/is);
  assert.match(casesEs, /LUS.*Caso 18/is);
  assert.match(docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n"), /nineteen case studies/i);
  assert.match(docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n"), /diecinueve casos de estudio/i);
});

test("el perfil profesional es opcional, progresivo y viaja como puntero", () => {
  const brainstorm = skillText(join(skillsRoot, "brainstorming-lore"));
  const save = skillText(join(skillsRoot, "save-to-lore"));
  const transmute = skillText(join(skillsRoot, "transmute-lore"));

  assert.match(brainstorm, /professional profile.*emerges progressively/is);
  assert.match(brainstorm, /never.*(?:CV|résumé).*first use/is);
  assert.match(save, /perfil-profesional\.md/);
  assert.match(save, /small.*approved clues/is);
  assert.match(save, /sensitive attributes/i);
  assert.match(brainstorm, /without recommending\s+either option/i);
  assert.match(transmute, /ADD.*perfil-profesional\.md/is);
  assert.match(transmute, /existing projects.*reviewed.*clues/is);
  assert.match(transmute, /without\s+recommending either option/i);

  for (const name of ["create-area", "create-project", "create-bot"]) {
    const skill = skillText(join(skillsRoot, name));
    assert.match(skill, /perfil-profesional\.md/, `${name}: falta el perfil portable`);
    assert.match(skill, /pointer/i, `${name}: el perfil debe viajar como puntero`);
    assert.match(skill, /if .*enabled|if it exists/is, `${name}: falta la frontera opcional`);
  }

  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(readme, /professional criterion.*refines.*real work/is);
  assert.match(readme, /criterio profesional.*afina.*uso real/is);
  assert.doesNotMatch(readme, /upload your (?:CV|résumé)|sube tu (?:CV|currículum)/i);
  assert.doesNotMatch(readme, /\.perfil-profesional\.md/);
});

test("las operaciones estructurales construyen el Entre por decisiones acumulativas", () => {
  const brainstorm = skillText(join(skillsRoot, "brainstorming-lore"));
  assert.match(brainstorm, /recognizable continuity/i);
  assert.match(brainstorm, /accumulated artifact/i);
  assert.match(brainstorm, /one decision at a time/i);

  for (const name of ["create-area", "create-project", "create-bot", "transmute-lore"]) {
    const skill = skillText(join(skillsRoot, name));
    assert.match(skill, /recognizable continuity/i, `${name}: falta la vara transversal del Entre`);
  }

  const casesEn = readFileSync(join(root, "docs", "CASES_en.md"), "utf8");
  const casesEs = readFileSync(join(root, "docs", "CASES_es.md"), "utf8");
  assert.match(casesEn, /healthy, fast and simple way of working/i);
  assert.match(casesEs, /forma sana, rápida y simple de trabajar/i);
  assert.match(readFileSync(join(root, "README.md"), "utf8"), /continuidad reconocible/i);
});

test("la destilación devuelve trabajo autónomo al artefacto compartido", () => {
  const brainstorm = skillText(join(skillsRoot, "brainstorming-lore"));
  const use = skillText(join(skillsRoot, "use-lore"));
  assert.match(brainstorm, /shared return point/i);
  assert.match(brainstorm, /does not.{0,8}require\s+constant contact/i);
  assert.match(use, /autonomy with return/i);
  assert.match(use, /distillation resynchronizes/i);

  const casesEn = readFileSync(join(root, "docs", "CASES_en.md"), "utf8");
  const casesEs = readFileSync(join(root, "docs", "CASES_es.md"), "utf8");
  assert.match(casesEn, /drift.*return.*distillation.*resynchronization/is);
  assert.match(casesEs, /deriva.*retorno.*destilación.*resincronización/is);
});

test("el Entre fértil no se confunde con complacencia", () => {
  const brainstorm = skillText(join(skillsRoot, "brainstorming-lore"));
  const use = skillText(join(skillsRoot, "use-lore"));
  assert.match(brainstorm, /fertile effort/i);
  assert.match(brainstorm, /do not equate.*(?:agreement|pleasing|compliance)/is);
  assert.match(use, /enjoyable Entre/i);
  assert.match(use, /fertile/i);

  // 2026-08-28 (poda 2.3.x): la frontera del Entre fértil vive en las skills y en REFERENCE.
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    assert.match(readFileSync(join(root, file), "utf8"), /fertile|fértil/i, `${file}: falta la frontera del Entre fértil`);
  }
});

// 2026-08-28 (poda 2.3.x): USAGE_* y MIGRATION_* se plegaron dentro de REFERENCE_*, que es
// ahora el único documento técnico (empezar + uso + spec + migración). El guard que vale
// —ninguna skill desaparece en silencio de la spec, principios.md #15— se mantiene sobre él.
test("REFERENCE documenta las siete skills con sección propia", () => {
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    const text = readFileSync(join(root, file), "utf8");
    for (const name of skillNames) {
      assert.match(text, new RegExp("^### \\d+\\.\\d+ `" + name + "`", "m"), `${file}: falta ${name}`);
    }
  }
});

test("la documentación no conserva afirmaciones ya refutadas", () => {
  const text = docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
  assert.doesNotMatch(text, /\bseven (?:documented )?case studies|all seven case studies|\bsiete casos de estudio|las siete evidencias/i);
  assert.doesNotMatch(text, /twelve case studies|doce casos de estudio|eleven of the twelve|once de los doce/i);
  assert.doesNotMatch(text, /seventeen case studies|diecisiete casos de estudio|sixteen of the seventeen|dieciséis de los diecisiete/i);
  assert.doesNotMatch(text, /eighteen case studies|dieciocho casos de estudio/i);
  assert.match(text, /nineteen case studies/);
  assert.match(text, /diecinueve casos de estudio/);
  assert.doesNotMatch(text, /three optional extras|tres extras opcionales|a bot with none of the three|un bot sin ninguno de los tres/i);
  assert.doesNotMatch(text, /Five optional extras|Cinco extras opcionales|A bot with none of the five|Un bot sin ninguno de los cinco/i);
  assert.doesNotMatch(text, /turn loose notes into criteria|convertir notas sueltas en criterio/i);
});

test("el README funciona como portada y no duplica las guías", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const words = readme.trim().split(/\s+/).length;
  // 2026-08-26: LUS, bibliografia y genealogia tienen casa propia en docs/. El piso anterior
  // codificaba su duplicacion dentro del README; queda solo un techo para que la portada no vuelva
  // a absorber esos documentos.
  assert.ok(words <= 10850, `README demasiado largo: ${words} palabras`);
  for (const document of [
    "LUS_en.md", "LUS_es.md",
    "BIBLIOGRAPHY_en.md", "BIBLIOGRAPHY_es.md",
    "GENEALOGY_en.md", "GENEALOGY_es.md",
  ]) assert.match(readme, new RegExp(document.replace(".", "\\.")));
  for (const required of [
    "## Installation",
    "## Architecture",
    "## The seven skills",
    "## Benchmark",
    "## Documentation",
    "## Instalación",
    "## Arquitectura",
    "## Las siete skills",
    "## El benchmark",
    "## Documentación",
  ]) assert.match(readme, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal((readme.match(/^### OpenCode$/gm) ?? []).length, 2);
  assert.equal((readme.match(/\.opencode\/skills\//g) ?? []).length >= 2, true);
});

test("PRUNE trata una magnitud pedida como restricción de aceptación", () => {
  const transmute = skillText(join(skillsRoot, "transmute-lore"));
  assert.match(transmute, /quantitative target.*acceptance constraint/is);
  assert.match(transmute, /baseline.*expected remainder.*measure again/is);
  assert.match(transmute, /must not exceed.*requested cut/is);
  // 2026-08-28 (poda 2.3.x): la restricción de aceptación de PRUNE se especifica en REFERENCE.
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    assert.match(readFileSync(join(root, file), "utf8"), /quantitative target|objetivo cuantitativo/i, file);
  }
});

test("los docs vivos y las skills no nombran research-lus ni Lore in the Shell", () => {
  const live = [
    "README.md",
    "docs/REFERENCE_en.md",
    "docs/REFERENCE_es.md",
    ...skillNames.flatMap((name) => skillFiles(root, name)),
  ];
  for (const file of live) {
    const text = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(text, /research-lus/, file);
    assert.doesNotMatch(text, /lore-in-the-shell|Lore in the Shell/i, file);
  }
});

test("el estándar se nombra como seis piezas, no seis archivos literales", () => {
  const text = ["README.md", ...docs, ...skillNames.flatMap((name) => skillFiles(root, name))]
    .map((file) => readFileSync(join(root, file), "utf8"))
    .join("\n");
  assert.doesNotMatch(text, /six[- ]artifact|six (?:mandatory )?artifacts|seis artefactos/i);
  assert.match(text, /six-piece standard/);
  assert.match(text, /estándar de seis piezas/);
});

test("los creadores generan un solo contrato según el host principal", () => {
  for (const name of ["create-area", "create-project", "create-bot"]) {
    const text = skillText(join(skillsRoot, name));
    assert.match(text, /AGENTS\.md/);
    assert.match(text, /CLAUDE\.md/);
    assert.match(text, /one (?:host-selected |instruction )?contract|exactly one/i);
    assert.doesNotMatch(text, /plus a minimal `AGENTS\.md` adapter|minimal Codex adapter used at the area root/i);
  }
  const area = skillText(join(skillsRoot, "create-area"));
  const project = skillText(join(skillsRoot, "create-project"));
  const bot = skillText(join(skillsRoot, "create-bot"));
  assert.doesNotMatch(area, /- No Playwright/);
  assert.match(project, /never invent a web-only rule/);
  assert.match(bot, /\.codex-plugin\//);
  assert.match(bot, /--add-dir/);
  const sync = readFileSync(join(skillsRoot, "create-bot", "plantillas", "sync.js"), "utf8");
  assert.match(sync, /CLAUDE\.md/);
  assert.match(sync, /AGENTS\.md/);
});

test("las cuatro fuentes de versión publicable coinciden", () => {
  const versions = [
    JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version,
    JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8")).version,
    JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8")).metadata.version,
    JSON.parse(readFileSync(join(root, ".codex-plugin", "plugin.json"), "utf8")).version,
  ];
  assert.deepEqual(new Set(versions), new Set(["2.4.4"]));
});

test("la nota de release vigente respeta la forma fija — cuarta violación 2026-08-30, ahora con guardia", () => {
  // andamiaje/lore-plugin/lore/principios.md #6-ampliado: dos veces por versión (2.2.2, 2.3.3)
  // un `docs/RELEASE_X.md` se envolvió a ~90 columnas antes de publicarse, y GitHub no colapsa
  // un salto de línea suelto dentro de una página de Release —a diferencia de un .md navegado
  // en el repo—, así que un párrafo envuelto se ve cortado en líneas cortas en la página
  // pública aunque el markdown crudo "se vea bien" en el editor. Un tercer caso (2.4.2, el
  // mismo release que este test corrige) fue detectado por Andrés mirando la página real,
  // otra vez. La Pista pedía guardia estructural a la cuarta — esta lo es.
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  const releasePath = join(root, "docs", `RELEASE_${version}.md`);
  const body = readFileSync(releasePath, "utf8");

  // Señal de envoltorio: un archivo cortado a columna fija tiene su línea más larga muy por
  // debajo de lo que mide un párrafo real de prosa técnica. Los cinco releases previos sin
  // envolver (2.3.3, 2.4.0, 2.4.1…) superan los 400 caracteres en su línea más larga.
  const lines = body.split(/\r?\n/);
  const maxLine = Math.max(...lines.map((l) => l.length));
  assert.ok(maxLine > 400,
    `docs/RELEASE_${version}.md: línea más larga = ${maxLine} — huele a envoltorio a columna fija ` +
    `(gh release no colapsa un salto de línea suelto; ver principios.md #6-ampliado)`);

  // Forma fija: dos títulos H1 "Lore Plugin X — …", nunca "## English"/"## Español" como
  // subsección de un único H1 — esa fue la segunda parte del mismo defecto en 2.4.2.
  const h1 = [...body.matchAll(/^# (.+)$/gm)].map((m) => m[1]);
  assert.equal(h1.length, 2, `docs/RELEASE_${version}.md: esperaba 2 títulos H1 (EN + ES), hay ${h1.length}`);
  const escapedVersion = version.split(".").join("\\.");
  for (const title of h1) {
    assert.match(title, new RegExp("^Lore Plugin " + escapedVersion + " — "),
      `título H1 fuera de forma: "${title}"`);
  }
  assert.ok(!/^## (English|Español)/m.test(body),
    'la forma fija no usa "## English"/"## Español" como subsección — dos H1 separados');

  // El primer H1 es el título en inglés (gh release --title debe copiarlo tal cual).
  assert.doesNotMatch(h1[0], /[áéíóúñ¿¡]/i, `el primer título debe estar en inglés: "${h1[0]}"`);
});

test("2.4.2 (histórica) conserva su release y su evidencia de banco", () => {
  // No se reescribe: se conserva y se verifica que siga existiendo, sin exigirle nada
  // de la versión vigente — eso lo cubre el test de forma fija y el de badges de abajo.
  const releasePath = join(root, "docs", "RELEASE_2.4.2.md");
  assert.ok(existsSync(releasePath), "falta docs/RELEASE_2.4.2.md");
  const release = readFileSync(releasePath, "utf8");
  assert.match(release, /bench\/mycelium-2\.4\.2\/README\.md/);
  assert.ok(existsSync(join(root, "bench", "mycelium-2.4.2", "README.md")), "falta la evidencia del banco");
  assert.match(release, /content hash|hash de contenido/i);
});

test("2.4.4 sincroniza badges y release", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const releasePath = join(root, "docs", "RELEASE_2.4.4.md");
  assert.equal((readme.match(/badge\/(?:version|versi%C3%B3n)-2\.4\.4-/g) ?? []).length, 2);
  assert.equal((readme.match(/writing--skills-(?:validated|validado)/gi) ?? []).length, 2);
  assert.ok(existsSync(releasePath), "falta docs/RELEASE_2.4.4.md");
  const release = readFileSync(releasePath, "utf8");
  assert.match(release, /idempotent|idempotente/i);
  assert.match(release, /No corpus change|Sin cambio de corpus/i);
  // La nota de la versión anterior NO se reescribe: el registro histórico se conserva
  // y la corrección viaja como versión nueva.
  for (const prev of ["RELEASE_2.4.3.md", "RELEASE_2.4.2.md", "RELEASE_2.4.1.md"]) {
    assert.ok(existsSync(join(root, "docs", prev)), `falta docs/${prev}`);
  }
});

test("el artefacto del recibo está declarado en los registros del kit, no solo en la skill", () => {
  // principios.md #15: un mecanismo nuevo se instala en los registros, no solo en el
  // texto que lo introduce. REFERENCE declara la especificación exacta de cada artefacto.
  for (const lang of ["es", "en"]) {
    const ref = readFileSync(join(root, "docs", `REFERENCE_${lang}.md`), "utf8");
    assert.match(ref, /\.lore-mycelium/, `REFERENCE_${lang}: falta el artefacto del recibo`);
    assert.match(ref, /mycelium receipt/, `REFERENCE_${lang}: falta el comando que lo escribe`);
  }
  const mode = readFileSync(join(skillsRoot, "transmute-lore", "modes", "mycelium.md"), "utf8");
  assert.match(mode, /mycelium receipt/, "el modo debe decir cómo se registra el barrido");
  assert.match(mode, /mycelium bodies/, "el modo debe nombrar la pregunta de nivel de cuerpo");
});

test("el bracket MYCELIUM de entrada y salida está escrito en las skills que escriben Lore", () => {
  const save = skillText(join(skillsRoot, "save-to-lore"));
  assert.match(save, /bracketed by MYCELIUM/i);
  assert.match(save, /Done means the exit scan ran/i);
  assert.match(save, /not a completion state|not done/i);

  const transmute = readFileSync(join(skillsRoot, "transmute-lore", "SKILL.md"), "utf8");
  assert.match(transmute, /Every writing mode is bracketed by MYCELIUM/i);

  for (const slug of ["add", "clean", "translate", "upgrade"]) {
    const mode = readFileSync(join(skillsRoot, "transmute-lore", "modes", `${slug}.md`), "utf8");
    assert.match(mode, /MYCELIUM (?:exit|entry) scan/i, `modes/${slug}.md: falta el ancla MYCELIUM`);
  }
  const leave = readFileSync(join(skillsRoot, "transmute-lore", "modes", "leave.md"), "utf8");
  assert.match(leave, /this is LEAVE's exit scan/i);

  // use-lore es la skill de entrada: su tono de MYCELIUM debe nombrar el gate de cierre.
  const use = skillText(join(skillsRoot, "use-lore"));
  assert.match(use, /exit scan is (?:a |their )?\*\*closing gate\*\*|closing gate — the pass is not done/i);
});

test("el hook Stop de MYCELIUM está declarado y falla abierto", () => {
  const hooksPath = join(root, "hooks", "hooks.json");
  assert.ok(existsSync(hooksPath), "falta hooks/hooks.json");
  const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));
  assert.ok(Array.isArray(hooks.hooks?.Stop), "hooks.json no declara un hook Stop");
  assert.match(JSON.stringify(hooks), /mycelium-guard\.mjs/);
  assert.ok(existsSync(join(root, "hooks", "mycelium-guard.mjs")), "falta hooks/mycelium-guard.mjs");
});

test("ninguna skill manda HARD: ni usa cristalizar como destilar", () => {
  for (const name of skillNames) {
    const text = skillText(join(skillsRoot, name));
    assert.doesNotMatch(text, /\*\*HARD:/, `${name}: etiqueta HARD: en presente`);
    assert.doesNotMatch(text, /crystallize as an invariant clue/i, `${name}: cristalizar ≠ destilar`);
  }
});

test("el piso de _starter/ vive en las skills que lo escriben", () => {
  const area = skillText(join(skillsRoot, "create-area"));
  const project = skillText(join(skillsRoot, "create-project"));
  const bot = skillText(join(skillsRoot, "create-bot"));

  assert.match(area, /Floor, not clone/);
  assert.match(area, /structural floor/);
  assert.match(area, /when this area is `bots` \(bot variant\)/);
  assert.match(area, /`canon\/` \+ `lore\/enrutamiento\.md`/);
  assert.match(area, /never `HARD-GATE`/);
  assert.match(area, /Packaging is crystallization/);
  assert.match(area, /A `bots` starter points at `canon\/`/);

  assert.match(project, /starter \*\*floor\*\*/);
  assert.match(project, /hand back to `create-bot`/);

  assert.match(bot, /rewrite the starter to the bot variant/);
  assert.match(bot, /Floor on the contract just written/);
  assert.match(bot, /Putting `lore\/identidad\.md` in the block/);
  assert.match(bot, /No `HARD-GATE` in\s+present tense/);
});

test("el cierre de create-bot no exige Lore previo", () => {
  const live = [
    "README.md",
    "docs/REFERENCE_en.md",
    "docs/REFERENCE_es.md",
    join("skills", "use-lore", "SKILL.md"),
  ];
  for (const file of live) {
    const text = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(text, /once there is Lore worth gathering/, file);
    assert.doesNotMatch(text, /cuando ya hay Lore que reunir/, file);
    assert.doesNotMatch(text, /A \*\*bot\*\* comes later, once several projects have Lore worth carrying/, file);
    assert.doesNotMatch(text, /Usa `create-bot` cuando ya tengas varios proyectos con Lore/, file);
    assert.doesNotMatch(text, /Use `create-bot` once you have several projects with Lore worth carrying/, file);
  }
});

test("el README identifica el modelo del benchmark en ambos idiomas", () => {
  const text = readFileSync(join(root, "README.md"), "utf8");
  assert.equal((text.match(/GPT-5\.6 Sol medium/g) ?? []).length >= 2, true);
  assert.equal((text.match(/GPT-5\.6 Terra medium/g) ?? []).length >= 2, true);
  // 2026-08-24: la seccion ## Benchmark tenia su propia tabla con las mismas cuatro cifras que
  // ya estan en la tabla hero de arriba -- duplicacion real, no dos hechos distintos. Se corto
  // esa segunda tabla (poda de README, permiso de Andres); ya no hay invariante que la exija.
  assert.equal((text.match(/NotebookLM/g) ?? []).length >= 2, true);
  // La frase se movio a la seccion "Who is this for?" con otra redaccion, mismo contenido.
  assert.match(text, /what changes when a person and an AI accumulate criteria together/i);
  assert.match(text, /qué cambia cuando una persona y una IA acumulan criterio juntas/i);
});

test("las superficies públicas de 2.2.0 conservan una definición precisa", () => {
  const release = readFileSync(join(root, "docs", "RELEASE_2.2.0.md"), "utf8");
  assert.ok(release.trim().split(/\s+/).length <= 450, "release 2.2.0 demasiado largo");
  const surfaces = ["package.json", join(".claude-plugin", "plugin.json"), join(".claude-plugin", "marketplace.json"), join(".codex-plugin", "plugin.json")]
    .map((file) => readFileSync(join(root, file), "utf8")).join("\n");
  assert.match(surfaces, /provider-neutral project criterion/i);
  assert.match(surfaces, /persists across (?:AI )?agents/i);
});

test("la documentación presenta ADD como entrada y CRYSTALLIZE como memory card portable", () => {
  // 2026-08-28 (poda 2.3.x): README lo introduce como portada; REFERENCE lo especifica. USAGE apunta.
  // 2026-08-28 (2.4.0): la portada explica «aprender de lo que ya tienes» en palabras llanas y nombra
  // `transmute-lore`; el token de modo ADD baja al registro que lo especifica —REFERENCE—, por
  // `plugins/lore/principios.md` #26 (una obra/jargon que hay que explicar antes de ilustrar no va al cuerpo).
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    const text = readFileSync(join(root, file), "utf8");
    assert.match(text, /ADD/);
    assert.match(text, /CRYSTALLIZE/);
    assert.match(text, /memory card/i);
  }
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.match(readme, /transmute-lore/);
  assert.match(readme, /CRYSTALLIZE/);
  assert.match(readme, /memory card/i);
});

test("la documentación viva conserva la frontera de secretos de CRYSTALLIZE", () => {
  // 2026-08-28 (poda 2.3.x): la frontera de secretos se especifica en REFERENCE y en la skill.
  const files = ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"];
  for (const file of files) {
    const text = readFileSync(join(root, file), "utf8");
    assert.match(text, /(?:sensitive\s+filenames?|nombres?\s+de\s+archivo\s+sensibles?)/i, `${file}: falta exclusión por nombre sensible`);
    assert.match(text, /(?:secret\s+markers?|marcadores?\s+de\s+secreto)/i, `${file}: falta rechazo por marcador de secreto`);
  }
});

test("los enlaces Markdown locales de la documentación resuelven", () => {
  for (const file of docs) {
    const text = readFileSync(join(root, file), "utf8");
    for (const match of text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const href = match[1];
      if (/^(?:https?:|mailto:|#)/.test(href)) continue;
      const path = decodeURI(href.split("#", 1)[0]);
      assert.ok(existsSync(resolve(dirname(join(root, file)), path)), `${file}: enlace local inexistente ${href}`);
    }
  }
});

// Verificar que el ancla EXISTE no basta, y este es el caso que lo probo: `#use-lore` existe
// —es el encabezado ingles— asi que la tabla espanola apuntaba a el y saltaba al otro idioma.
// Un ancla duplicada entre los dos bloques solo se distingue por el lado del que cae.
// La tabla de las siete skills ya no enlaza a ningun lado (su destino vivia dentro de un <details>
// cerrado, que el navegador no despliega); esto cuida los indices de navegacion, que si enlazan.
test("el README bilingüe no enlaza de un idioma al ancla del otro", () => {
  const text = readFileSync(join(root, "README.md"), "utf8");
  const lines = text.split(/\r?\n/);
  const spanishStart = lines.findIndex((line) => /<a id="español">/.test(line));
  assert.ok(spanishStart > 0, "no se encontró el marcador que abre el bloque español");

  const anchorLine = new Map();
  const seen = new Map();
  lines.forEach((line, index) => {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (!heading) return;
    const base = heading[2]
      .replace(/[<>]/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[`*_~]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s/g, "-");
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    anchorLine.set(n === 0 ? base : `${base}-${n}`, index);
  });

  const side = (index) => (index < spanishStart ? "inglés" : "español");
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\]\((#[^)\s]+)\)/g)) {
      const anchor = decodeURIComponent(match[1].slice(1)).toLowerCase();
      const target = anchorLine.get(anchor);
      if (target === undefined) return; // ausencia: la cubre el test de anclas internas
      assert.equal(
        side(target),
        side(index),
        `README.md:${index + 1}: enlace ${match[1]} salta al bloque ${side(target)} desde el ${side(index)}`,
      );
    }
  });
});

test("transmute-lore es un dispatcher liviano — los 8 modos viven en modes/, no en SKILL.md", () => {
  const raw = readFileSync(join(skillsRoot, "transmute-lore", "SKILL.md"), "utf8");
  const words = raw.trim().split(/\s+/).length;
  assert.ok(words <= 3000, `SKILL.md volvio a cargar procedimiento completo: ${words} palabras`);
  const modeSlugs = ["add", "clean", "translate", "upgrade", "prune", "mycelium", "leave", "crystallize"];
  for (const slug of modeSlugs) {
    assert.match(raw, new RegExp("modes/" + slug + "\\.md"), `SKILL.md no referencia modes/${slug}.md`);
    const modeFile = readFileSync(join(skillsRoot, "transmute-lore", "modes", `${slug}.md`), "utf8");
    assert.match(modeFile, /^## [A-Z]+ mode/, `modes/${slug}.md no arranca con su encabezado de modo`);
  }
  // El helper de test debe ver el cuerpo completo aunque el procedimiento viva afuera de SKILL.md.
  const full = skillText(join(skillsRoot, "transmute-lore"));
  assert.match(full, /## MYCELIUM mode/);
  assert.match(full, /## PRUNE mode/);
});
