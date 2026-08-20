import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

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
    const text = readFileSync(join(skillsRoot, entry.name, "SKILL.md"), "utf8");
    assert.doesNotMatch(text, /Source of truth for Claude Code/i);
    return text.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  });
  assert.deepEqual(new Set(names).size, 8);
  assert.deepEqual(names.sort(), skills.map((entry) => entry.name).sort());
});

test("use-lore enruta explícitamente UPGRADE y CRYSTALLIZE", () => {
  const text = readFileSync(join(skillsRoot, "use-lore", "SKILL.md"), "utf8");
  assert.match(text, /transmute-lore` \(\*\*UPGRADE\*\*\)/);
  assert.match(text, /transmute-lore` \(\*\*CRYSTALLIZE\*\*\)/);
});

test("use-lore gobierna entregables complejos sin crear una novena skill", () => {
  const text = readFileSync(join(skillsRoot, "use-lore", "SKILL.md"), "utf8");
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

test("el lote Permanent Artist deja obligaciones reutilizables y el caso 17", () => {
  const bot = readFileSync(join(skillsRoot, "create-bot", "SKILL.md"), "utf8");
  const brainstorm = readFileSync(join(skillsRoot, "brainstorming-lore", "SKILL.md"), "utf8");
  const save = readFileSync(join(skillsRoot, "save-to-lore", "SKILL.md"), "utf8");

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
  assert.match(casesEn, /Case 17.*Permanent Artist/is);
  assert.match(casesEs, /Caso 17.*Permanent Artist/is);
  assert.match(docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n"), /seventeen case studies/i);
  assert.match(docs.map((file) => readFileSync(join(root, file), "utf8")).join("\n"), /diecisiete casos de estudio/i);
});

test("el perfil profesional es opcional, progresivo y viaja como puntero", () => {
  const brainstorm = readFileSync(join(skillsRoot, "brainstorming-lore", "SKILL.md"), "utf8");
  const save = readFileSync(join(skillsRoot, "save-to-lore", "SKILL.md"), "utf8");
  const transmute = readFileSync(join(skillsRoot, "transmute-lore", "SKILL.md"), "utf8");

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
    const skill = readFileSync(join(skillsRoot, name, "SKILL.md"), "utf8");
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
  const brainstorm = readFileSync(join(skillsRoot, "brainstorming-lore", "SKILL.md"), "utf8");
  assert.match(brainstorm, /recognizable continuity/i);
  assert.match(brainstorm, /accumulated artifact/i);
  assert.match(brainstorm, /one decision at a time/i);

  for (const name of ["create-area", "create-project", "create-bot", "transmute-lore"]) {
    const skill = readFileSync(join(skillsRoot, name, "SKILL.md"), "utf8");
    assert.match(skill, /recognizable continuity/i, `${name}: falta la vara transversal del Entre`);
  }

  const casesEn = readFileSync(join(root, "docs", "CASES_en.md"), "utf8");
  const casesEs = readFileSync(join(root, "docs", "CASES_es.md"), "utf8");
  assert.match(casesEn, /healthy, fast and simple way of working/i);
  assert.match(casesEs, /forma sana, rápida y simple de trabajar/i);
  assert.match(readFileSync(join(root, "README.md"), "utf8"), /continuidad reconocible/i);
});

test("la destilación devuelve trabajo autónomo al artefacto compartido", () => {
  const brainstorm = readFileSync(join(skillsRoot, "brainstorming-lore", "SKILL.md"), "utf8");
  const use = readFileSync(join(skillsRoot, "use-lore", "SKILL.md"), "utf8");
  assert.match(brainstorm, /shared return point/i);
  assert.match(brainstorm, /does not.{0,8}require\s+constant contact/i);
  assert.match(use, /autonomy with return/i);
  assert.match(use, /distillation resynchronizes/i);

  const casesEn = readFileSync(join(root, "docs", "CASES_en.md"), "utf8");
  const casesEs = readFileSync(join(root, "docs", "CASES_es.md"), "utf8");
  assert.match(casesEn, /drift.*return.*distillation.*resynchronization/is);
  assert.match(casesEs, /deriva.*retorno.*destilación.*resincronización/is);
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
  assert.match(text, /seventeen case studies/);
  assert.match(text, /diecisiete casos de estudio/);
  assert.doesNotMatch(text, /three optional extras|tres extras opcionales|a bot with none of the three|un bot sin ninguno de los tres/i);
  assert.doesNotMatch(text, /Five optional extras|Cinco extras opcionales|A bot with none of the five|Un bot sin ninguno de los cinco/i);
  assert.doesNotMatch(text, /turn loose notes into criteria|convertir notas sueltas en criterio/i);
});

test("el README funciona como portada y no duplica las guías", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const words = readme.trim().split(/\s+/).length;
  assert.ok(words >= 10850, `README podado en exceso: ${words} palabras`);
  assert.ok(words <= 10993, `README demasiado largo: ${words} palabras`);
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
  const transmute = readFileSync(join(skillsRoot, "transmute-lore", "SKILL.md"), "utf8");
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
    ...skillNames.map((name) => join("skills", name, "SKILL.md")),
  ];
  for (const file of live) {
    const text = readFileSync(join(root, file), "utf8");
    assert.doesNotMatch(text, /research-lus/, file);
    assert.doesNotMatch(text, /lore-in-the-shell|Lore in the Shell/i, file);
  }
});

test("el estándar se nombra como seis piezas, no seis archivos literales", () => {
  const text = ["README.md", ...docs, ...skillNames.map((name) => join("skills", name, "SKILL.md"))]
    .map((file) => readFileSync(join(root, file), "utf8"))
    .join("\n");
  assert.doesNotMatch(text, /six[- ]artifact|six (?:mandatory )?artifacts|seis artefactos/i);
  assert.match(text, /six-piece standard/);
  assert.match(text, /estándar de seis piezas/);
});

test("los creadores generan un solo contrato según el host principal", () => {
  for (const name of ["create-area", "create-project", "create-bot"]) {
    const text = readFileSync(join(skillsRoot, name, "SKILL.md"), "utf8");
    assert.match(text, /AGENTS\.md/);
    assert.match(text, /CLAUDE\.md/);
    assert.match(text, /one (?:host-selected |instruction )?contract|exactly one/i);
    assert.doesNotMatch(text, /plus a minimal `AGENTS\.md` adapter|minimal Codex adapter used at the area root/i);
  }
  const area = readFileSync(join(skillsRoot, "create-area", "SKILL.md"), "utf8");
  const project = readFileSync(join(skillsRoot, "create-project", "SKILL.md"), "utf8");
  const bot = readFileSync(join(skillsRoot, "create-bot", "SKILL.md"), "utf8");
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
  assert.deepEqual(new Set(versions), new Set(["2.1.7"]));
});

test("ninguna skill manda HARD: ni usa cristalizar como destilar", () => {
  for (const name of skillNames) {
    const text = readFileSync(join(skillsRoot, name, "SKILL.md"), "utf8");
    assert.doesNotMatch(text, /\*\*HARD:/, `${name}: etiqueta HARD: en presente`);
    assert.doesNotMatch(text, /crystallize as an invariant clue/i, `${name}: cristalizar ≠ destilar`);
  }
});

test("el piso de _starter/ vive en las skills que lo escriben", () => {
  const area = readFileSync(join(skillsRoot, "create-area", "SKILL.md"), "utf8");
  const project = readFileSync(join(skillsRoot, "create-project", "SKILL.md"), "utf8");
  const bot = readFileSync(join(skillsRoot, "create-bot", "SKILL.md"), "utf8");

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
  assert.equal((text.match(/<table width="100%">/g) ?? []).length, 2);
  assert.equal((text.match(/<th width="50%">(?:Multidomain result|Resultado multidominio)/g) ?? []).length, 2);
  assert.equal((text.match(/NotebookLM/g) ?? []).length >= 2, true);
  assert.match(text, /what happens when a person and an AI work together/i);
  assert.match(text, /qué ocurre cuando una persona y una IA trabajan juntas/i);
});

test("las superficies públicas de 2.1.7 conservan una definición precisa", () => {
  const release = readFileSync(join(root, "docs", "RELEASE_2.1.7.md"), "utf8");
  assert.ok(release.trim().split(/\s+/).length <= 450, "release 2.1.7 demasiado largo");
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
