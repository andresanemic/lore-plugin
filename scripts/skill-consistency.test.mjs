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

test("las ocho skills declaran un nombre único y neutral al proveedor", () => {
  assert.equal(skills.length, 8);
  const names = skills.map((entry) => {
    const text = skillText(join(skillsRoot, entry.name));
    assert.doesNotMatch(text, /Source of truth for Claude Code/i);
    return text.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  });
  assert.deepEqual(new Set(names).size, 8);
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
  assert.equal(skills.length, 8);
  for (const file of ["README.md", "docs/USAGE_en.md", "docs/USAGE_es.md", "docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
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
  assert.match(docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n"), /eighteen case studies/i);
  assert.match(docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n"), /dieciocho casos de estudio/i);
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

  for (const file of ["README.md", "docs/USAGE_en.md", "docs/USAGE_es.md", "docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    assert.match(readFileSync(join(root, file), "utf8"), /fertile|fértil/i, `${file}: falta la frontera del Entre fértil`);
  }
});

test("las guías bilingües documentan las ocho skills con una sección propia", () => {
  for (const file of ["docs/USAGE_en.md", "docs/USAGE_es.md", "docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    const text = readFileSync(join(root, file), "utf8");
    for (const name of skillNames) {
      assert.match(text, new RegExp("^### \\d+\\.\\d+ `" + name + "`", "m"), `${file}: falta ${name}`);
    }
  }
});

test("la documentación no conserva afirmaciones ya refutadas", () => {
  const text = docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
  assert.doesNotMatch(text, /\bseven (?:documented )?case studies|all seven|\bsiete casos de estudio|las siete evidencias/i);
  assert.doesNotMatch(text, /twelve case studies|doce casos de estudio|eleven of the twelve|once de los doce/i);
  assert.doesNotMatch(text, /seventeen case studies|diecisiete casos de estudio|sixteen of the seventeen|dieciséis de los diecisiete/i);
  assert.match(text, /eighteen case studies/);
  assert.match(text, /dieciocho casos de estudio/);
  assert.doesNotMatch(text, /three optional extras|tres extras opcionales|a bot with none of the three|un bot sin ninguno de los tres/i);
  assert.doesNotMatch(text, /Five optional extras|Cinco extras opcionales|A bot with none of the five|Un bot sin ninguno de los cinco/i);
  assert.doesNotMatch(text, /turn loose notes into criteria|convertir notas sueltas en criterio/i);
});

test("el README funciona como portada y no duplica las guías", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const words = readme.trim().split(/\s+/).length;
  assert.ok(words >= 10850, `README podado en exceso: ${words} palabras`);
  // 2.3.0: 11200 quedo fijado exactamente en el tamano de entonces, sin holgura para un modo nuevo.
  // Se sube a 11250 despues de pagar 39 palabras de duplicacion real (las dos frases que repetian
  // las filas de la tabla que tenian encima). La guardia cuida que el README no se vuelva el manual;
  // una octava fila en una tabla que ya existe no es eso.
  // 2026-08-22: se sube a 11360 por la PUERTA DE ENTRADA, en los dos idiomas. La linea anterior
  // decia «abre una sesion y escribe use-lore; el kit te guia hacia la skill que necesitas», que es
  // la forma de menu que use-lore §0 rechaza explicitamente: el kit brainstormea para construir todo
  // lo que hace, y su propia puerta no puede ser una lista. Ahora dice que no hace falta saber
  // ningun comando y que se escriba «quiero comenzar a usar Lore Plugin, ayudame». No es manual: es
  // lo primero que lee quien acaba de instalar, y es portada por definicion.
  // 2026-08-22, con permiso explicito de Andres: sube a 13400 por la GENEALOGIA. La caja
  // comprimida se leia como un bloque unico y perdia lo que tenia antes de plegarse -autor, obra,
  // ano y aporte, en lista-. Ahora la fundacional vuelve a ser visible con ese detalle, y la caja
  // guarda la extendida mas los dos autores arbitrados en 2026 (Camus entra como criterio, Heidegger
  // NO, con su obstaculo escrito). Entra ademas la genealogia afectiva, comprimida y marcada como
  // registro y no regla. Es portada: de donde viene el criterio y de donde viene la forma.
  assert.ok(words <= 13400, `README demasiado largo: ${words} palabras`);
  for (const required of [
    "## Installation",
    "## Architecture",
    "## The eight skills",
    "## Benchmark",
    "## Documentation",
    "## Instalación",
    "## Arquitectura",
    "## Las ocho skills",
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
  for (const file of ["docs/USAGE_en.md", "docs/USAGE_es.md", "docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    assert.match(readFileSync(join(root, file), "utf8"), /quantitative target|objetivo cuantitativo/i, file);
  }
});

test("los docs vivos y las skills no nombran research-lus ni Lore in the Shell", () => {
  const live = [
    "README.md",
    "docs/USAGE_en.md",
    "docs/USAGE_es.md",
    "docs/REFERENCE_en.md",
    "docs/REFERENCE_es.md",
    "docs/MIGRATION_en.md",
    "docs/MIGRATION_es.md",
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
  assert.deepEqual(new Set(versions), new Set(["2.3.1"]));
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
    "docs/USAGE_en.md",
    "docs/USAGE_es.md",
    "docs/REFERENCE_en.md",
    "docs/REFERENCE_es.md",
    "docs/MIGRATION_en.md",
    "docs/MIGRATION_es.md",
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
  assert.equal((text.match(/gpt-5\.6-sol/g) ?? []).length >= 2, true);
  assert.match(text, /medium reasoning effort/);
  assert.match(text, /esfuerzo de razonamiento medio/);
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
  const files = ["README.md", "docs/USAGE_en.md", "docs/USAGE_es.md", "docs/REFERENCE_en.md", "docs/REFERENCE_es.md"];
  for (const file of files) {
    const text = readFileSync(join(root, file), "utf8");
    assert.match(text, /ADD/);
    assert.match(text, /CRYSTALLIZE/);
    assert.match(text, /memory card/i);
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
// La tabla de las ocho skills ya no enlaza a ningun lado (su destino vivia dentro de un <details>
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
