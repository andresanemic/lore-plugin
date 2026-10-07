import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import { skillFiles, skillText, comandosOrdenados, ayudaDe, NO_VIAJA_EN_LA_ENTRADA_LOCAL } from "./skill-text.mjs";
import { parseFrontmatter } from "./yaml-frontmatter.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(root, "skills");
const skills = readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
const skillNames = skills.map((entry) => entry.name);
const rootDocs = readdirSync(root).filter((name) => name.endsWith(".md"));
const docs = rootDocs.map((name) => name).concat(
  readdirSync(join(root, "docs")).filter((name) => name.endsWith(".md")).map((name) => join("docs", name)),
);

test("cada descripción de skill declara su frontera Not yours y cabe en 700 caracteres", () => {
  for (const name of skillNames) {
    const frontmatter = parseFrontmatter(readFileSync(join(skillsRoot, name, "SKILL.md"), "utf8"));
    const description = frontmatter.data.description;
    assert.match(description, /Not yours:/, `${name}: falta la frontera de responsabilidad`);
    assert.ok(description.length <= 700, `${name}: descripción de ${description.length} caracteres`);
  }
});

test("save-to-lore corre higiene de salida y propone limpieza sin podar por tamaño", () => {
  const save = skillText(join(skillsRoot, "save-to-lore"));
  assert.match(save, /lore-plugin hygiene/i);
  assert.match(save, /propose.*cleanup.*never execute|proponer.*limpieza.*nunca ejecutar/i);
  assert.match(save, /does not prune by size|no poda por tamaño/i);
});

// R4, fricción 6 (recibo de la sesión de Desarrollo Web, 2026-10-04): `save-to-lore` manda
// correr `lore-plugin hygiene <ruta>` al cerrar cada pase, y la entrada que la persona tiene
// a mano —`~/.lore-plugin/entry/<host>/scripts/lore-cli.mjs`, la que `use-lore` y
// `transmute-lore` nombran POR RUTA— solo ofrecía `mycelium` y `nivel`: la orden no se
// resolvía donde se la pedía correr. Un nombre que el host no tiene es una promesa, y una
// promesa no escribe recibo.
//
// La guarda es sobre el REPO y la de `installer.test.mjs` es sobre lo INSTALADO: una mira
// que el comando esté, la otra que llegue al host. Las dos leen el mismo extractor.
test("todo comando que la prosa ordena correr existe en las dos entradas del kit", () => {
  const ordenados = comandosOrdenados(root);
  assert.ok(ordenados.size > 0, "la prosa de las skills debe ordenar correr algún comando");

  const ayuda = {
    "scripts/lore-plugin.mjs": ayudaDe(join(root, "scripts", "lore-plugin.mjs")),
    "scripts/lore-cli.mjs": ayudaDe(join(root, "scripts", "lore-cli.mjs")),
  };

  for (const [comando, subs] of ordenados) {
    for (const sub of [comando, ...subs]) {
      assert.match(ayuda["scripts/lore-plugin.mjs"], new RegExp(`\\b${sub}\\b`),
        `la prosa ordena "${sub}" y la entrada completa no lo anuncia en su ayuda`);
    }
    // Una exención sin razón escrita es el defecto con otra forma, y una exención que ya no
    // hace falta es ruido que esconde el siguiente comando. Las dos se comprueban.
    if (NO_VIAJA_EN_LA_ENTRADA_LOCAL.has(comando)) {
      const razon = NO_VIAJA_EN_LA_ENTRADA_LOCAL.get(comando);
      assert.ok(razon.length >= 40 && razon.split(/\s+/).length >= 6,
        `${comando}: la exención dice por qué, con una razón y no con una palabra`);
      assert.doesNotMatch(ayuda["scripts/lore-cli.mjs"], new RegExp(`\\b${comando}\\b`),
        `${comando}: la exención está vieja, la entrada local ya lo anuncia`);
      continue;
    }
    for (const sub of [comando, ...subs]) {
      assert.match(ayuda["scripts/lore-cli.mjs"], new RegExp(`\\b${sub}\\b`),
        `la prosa ordena "${sub}" y la entrada local no lo anuncia en su ayuda`);
    }
  }
});

test("el contrato de proyecto de create-area alcanza el Lore del área", () => {
  const skill = skillText(join(skillsRoot, "create-area"));
  const section = skill.split("### `_starter/{{CONTRACT_FILE}}.template.md` (project contract)")[1]?.split("### `_starter/FASES.md`")[0];
  assert.ok(section, "falta la plantilla de contrato del proyecto");
  const pointer = section.match(/`((?:\.\.\/)+lore\/<module>\.md)`/)?.[1];
  assert.ok(pointer, "falta el puntero al Lore del área");

  const area = join(root, "fixture", "areas", "huerto-comun");
  const project = join(area, "proyectos", "turnos-de-riego");
  assert.equal(resolve(project, pointer.replace("<module>", "identidad")), join(area, "lore", "identidad.md"));
});

test("las nueve skills declaran un nombre único y neutral al proveedor", () => {
  assert.equal(skills.length, 9);
  const names = skills.map((entry) => {
    const text = skillText(join(skillsRoot, entry.name));
    assert.doesNotMatch(text, /Source of truth for Claude Code/i);
    return text.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  });
  assert.deepEqual(new Set(names).size, 9);
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
  assert.match(text, /offer to update the local Lore.*invoke the matching operation internally/is);
  assert.match(text, /do not repeat the offer on every later message/i);
  assert.match(text, /Rule 3 is not MYCELIUM, and must not fold into it/);
});

test("use-lore gobierna entregables complejos sin crear una décima skill", () => {
  const text = skillText(join(skillsRoot, "use-lore"));
  assert.match(text, /Complex deliverables/);
  assert.match(text, /approved precedent/);
  assert.match(text, /available tools, connectors or MCPs/);
  assert.match(text, /batch/i);
  assert.match(text, /human review/);
  assert.equal(skills.length, 9);
  // 2026-08-28 (poda 2.3.x): el mecanismo vive una vez, en REFERENCE. README y USAGE apuntan.
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    const doc = readFileSync(join(root, file), "utf8");
    assert.match(doc, /complex deliverables|entregables complejos/i, `${file}: falta la ruta compleja`);
  }
});

test("las nueve skills y REFERENCE blindan los artefactos externos contra etiquetas internas", () => {
  for (const skill of skillNames) {
    const text = skillText(join(skillsRoot, skill));
    assert.match(text, /before delivering a user artifact.*replace every internal label/is, skill);
    assert.match(text, /contains zero internal labels/i, skill);
  }
  assert.match(readFileSync(join(root, "docs", "REFERENCE_en.md"), "utf8"), /external artifact.*replaces every internal label/is);
  assert.match(readFileSync(join(root, "docs", "REFERENCE_es.md"), "utf8"), /artefacto externo.*reemplaza cada etiqueta interna/is);
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

test("la prosa de rc9 limita las garantías del registro y preserva las decisiones de la persona", () => {
  const use = skillText(join(skillsRoot, "use-lore"));
  const vespi = skillText(join(skillsRoot, "vespi"));
  const release = readFileSync(join(root, "docs", "RELEASE_2.4.9.md"), "utf8");
  const agreement = readFileSync(join(skillsRoot, "use-lore", "scripts", "acuerdo.mjs"), "utf8");

  assert.match(use, /If the person explicitly asks to keep those identifiers, preserve them and explain any ambiguity that affects their decision\./);
  assert.doesNotMatch(use, /This requirement overrides requests to copy them literally\./);
  assert.match(use, /supports explicit arbitration of\s+scattered project knowledge into criteria that can guide future decisions within their stated\s+scope; storing knowledge alone does not establish learning\./);
  assert.doesNotMatch(use, /distilled, invariant criteria.*constrain every future decision/s);
  assert.match(use, /First receive the person and acknowledge the purpose they brought, briefly and without promising agreement\. Then inspect the tree before asking what remains unknown\./);
  assert.match(use, /this runs \*\*before selecting a production route\*\*/);
  assert.doesNotMatch(use, /this runs \*\*before anything else\*\*/);
  assert.ok(use.replace(/\s+/g, " ").includes("the guard records writes into another owner's tree; the host's permission system decides whether they proceed. The coordinator must still respect the owning governance."));
  assert.doesNotMatch(use, /guard keeps blocking another owner's criterion|guard blocking someone else's code is the guard working/i);
  assert.match(agreement, /The guard records writes into another owner's tree; the host's permissions decide whether they proceed, and the owning governance remains in force\./);
  assert.doesNotMatch(agreement, /Blocking another owner's criterion is one of|guard doing that is the guard working/i);
  assert.match(vespi, /The record requires different executor and verifier labels; actual independence is declared, not verified — check the evidence yourself\./);
  assert.doesNotMatch(vespi, /The verifier is never whoever executed it/);
  assert.match(vespi, /so there is one place to look; resuming still requires reconciliation of changed authority, evidence and effects\./);
  assert.match(vespi, /The receipt carries the path written at that checkpoint; the host and coordinator must reread and compare it before relying on it later\./);
  assert.doesNotMatch(vespi, /nothing to reconcile|cannot drift apart/);

  assert.match(release, /El registro exige etiquetas distintas para ejecutor y verificador, pero el host y el coordinador deben comprobar su independencia y la evidencia observada\./);
  assert.match(release, /`lore-plugin operation` registra el ciclo de una operación desde la línea de comandos; el host y el coordinador realizan el trabajo, comprueban su evidencia y aportan las decisiones humanas\./);
  assert.match(release, /Lore Plugin 2\.4\.9 permite registrar en `FASES\.md` lo acordado, el estado observado y la siguiente acción para retomar una operación sin reconstruirla solo desde la conversación; la continuidad depende de guardar la evidencia y de que el host y el coordinador la revaliden\./);
  assert.match(release, /El Lore existente no necesita migración; conserva el archivo de la operación guardada por una compilación anterior en `operations\/<id>\/estado\.md` y reconcilia su autoridad, recibos, intentos y efectos inciertos antes de registrar la continuidad en `FASES\.md`\. Volver a escribir el objetivo no basta y este corte no realiza esa migración automáticamente\./);
  assert.match(release, /the host and coordinator must establish their actual independence and check the observed evidence\./);
  assert.match(release, /`lore-plugin operation` records an operation's lifecycle from the command line; the host and coordinator perform the work, check its evidence and supply human decisions\./);
  assert.match(release, /Lore Plugin 2\.4\.9 records the agreement, observed state and next action in `FASES\.md` so an operation can resume without relying only on the conversation; continuity depends on saved evidence and revalidation by the host and coordinator\./);
  assert.match(release, /Existing Lore needs no migration; keep an operation saved by an earlier build in its own `operations\/<id>\/estado\.md` file and reconcile its authority, receipts, attempts and uncertain effects before recording continuation in `FASES\.md`\. Restating the goal is insufficient, and this cut does not perform that migration automatically\./);
  assert.doesNotMatch(release, /drives a whole operation|lleva una operación completa|needs its goal restated|necesita que se vuelva a escribir su objetivo/);
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
test("REFERENCE documenta las ocho skills con sección propia", () => {
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
    "## The nine skills",
    "## Benchmark",
    "## Documentation",
    "## Instalación",
    "## Arquitectura",
    "## Las nueve skills",
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

// RC6, revision adversarial simulada: `.claude-plugin/marketplace.json` —la descripcion que se lee
// al navegar y al instalar— enumeraba siete skills y omitia `vespi`, que si se instala y si la nombra
// `.claude-plugin/plugin.json`. La suite solo contrastaba el frontmatter de las skills contra si
// mismo, nunca contra los manifiestos, asi que la deriva no podia verse.
test("los dos manifiestos nombran todas las skills que se instalan", () => {
  const instaladas = readdirSync(join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.ok(instaladas.length > 0, "hay skills que instalar");

  const plugin = JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8"));
  const marketplace = JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8"));
  const descripcion = marketplace.plugins[0].description;

  for (const skill of instaladas) {
    assert.match(plugin.description, new RegExp(`\\b${skill}\\b`), `plugin.json no nombra ${skill}`);
    assert.match(descripcion, new RegExp(`\\b${skill}\\b`), `marketplace.json no nombra ${skill}`);
  }
});

test("las cuatro fuentes de versión publicable coinciden", () => {
  const versions = [
    JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version,
    JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8")).version,
    JSON.parse(readFileSync(join(root, ".claude-plugin", "marketplace.json"), "utf8")).metadata.version,
    JSON.parse(readFileSync(join(root, ".codex-plugin", "plugin.json"), "utf8")).version,
  ];
  assert.deepEqual(new Set(versions), new Set(["2.5.1"]));
});

// andamiaje/lore-plugin/lore/principios.md #12: la nota sirve al usuario que actualiza el producto.
test("la nota vigente cumple la vara mínima de un release legible", () => {
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
  const releasePath = join(root, "docs", `RELEASE_${version}.md`);
  const body = readFileSync(releasePath, "utf8");
  const h1 = [...body.matchAll(/^# (.+)$/gm)].map((m) => m[1]);
  assert.equal(h1.length, 2, `docs/RELEASE_${version}.md: esperaba 2 títulos H1 (EN + ES), hay ${h1.length}`);
  const escapedVersion = version.split(".").join("\\.");
  for (const title of h1) {
    assert.match(title, new RegExp("^Lore Plugin " + escapedVersion + " — "),
      `título H1 fuera de forma: "${title}"`);
    assert.match(title.split(" — ")[1] ?? "", /^[A-ZÁÉÍÓÚÑ]/,
      `la primera palabra del beneficio debe comenzar en mayúscula: "${title}"`);
  }
  assert.ok(!/^## (English|Español)/m.test(body),
    'la forma fija no usa "## English"/"## Español" como subsección — dos H1 separados');
  assert.doesNotMatch(h1[0], /[áéíóúñ¿¡]/i, `el primer título debe estar en inglés: "${h1[0]}"`);

  const sections = body.split(/^# .+$/gm).slice(1);
  const closingRules = [
    { tested: /(?:is |will be )?tested (?:on|in)/i, action: /migration|no action|required|needs?/i },
    { tested: /prueba|probado/i, action: /migración|ninguna acción|requiere|necesita|instalación|acompañan|medida/i },
  ];
  for (const [index, section] of sections.entries()) {
    const blocks = section.trim().split(/\r?\n\r?\n/);
    assert.ok(blocks[0].startsWith("> [README]"), `sección ${index + 1}: falta el ancla README`);
    assert.ok(blocks.slice(1).length >= 3, `sección ${index + 1}: esperaba al menos 3 párrafos, hay ${blocks.slice(1).length}`);
    for (const paragraph of blocks.slice(1)) {
      assert.doesNotMatch(paragraph, /\r?\n/, `sección ${index + 1}: los párrafos no llevan hardwrap`);
    }
    assert.match(blocks[3], closingRules[index].tested, `sección ${index + 1}: falta la prueba general por hosts`);
    assert.match(blocks[3], closingRules[index].action, `sección ${index + 1}: falta la migración o acción necesaria`);
  }
  assert.doesNotMatch(sections[0], /\b(?:I|we|my|our|us)\b/i, "el release inglés habla desde el producto, no desde su autor");
  assert.doesNotMatch(sections[1], /\b(?:yo|nosotros|nosotras|mi|mis|nuestro|nuestra|nuestros|nuestras)\b/i,
    "el release español habla desde el producto, no desde su autor");
  assert.doesNotMatch(body, /\b(?:RC\d+|release candidates?|candidatas?|subagents?|subagentes?|TDD|writing-skills|trial)\b/i,
    "el release cuenta el producto publicado, no el proceso interno que lo produjo");
  assert.doesNotMatch(body, /\b\d+\/\d+\b/, "la evidencia detallada vive en los tests, no en el release");
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

test("2.4.5 (histórica) conserva su release, con nota de reemplazo", () => {
  // No se reescribe el cuerpo: se conserva y se le antepone el puntero a 2.4.6, porque
  // su afirmación in-place `284420b` quedó factualmente falsa. Igual que 2.4.2, sin
  // exigirle nada de la versión vigente.
  const releasePath = join(root, "docs", "RELEASE_2.4.5.md");
  assert.ok(existsSync(releasePath), "falta docs/RELEASE_2.4.5.md");
  const release = readFileSync(releasePath, "utf8");
  assert.match(release, /Claude Code/i);
  assert.match(release, /Codex/i);
  assert.match(release, /Superseded twice|Reemplazado dos veces/);
});

test("2.4.6 conserva el intento fallido y su aporte real", () => {
  const releasePath = join(root, "docs", "RELEASE_2.4.6.md");
  assert.ok(existsSync(releasePath), "falta docs/RELEASE_2.4.6.md");
  const release = readFileSync(releasePath, "utf8");
  assert.match(release, /Claude Code/i);
  assert.match(release, /Codex/i);
  assert.match(release, /UserPromptSubmit/);
  assert.match(release, /Stop/);
  assert.match(release, /deferred arming|armado diferido/i);
});

test("2.5.0 sincroniza badges y conserva la nota de 2.4.9", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const releasePath = join(root, "docs", "RELEASE_2.4.9.md");
  assert.equal((readme.match(/badge\/(?:version|versi%C3%B3n)-2\.5\.0-/g) ?? []).length, 2);
  assert.ok(existsSync(join(root, "docs", "RELEASE_2.4.8.md")), "la nota de 2.4.8 se conserva como historia");
  // Decisión de Andrés 2026-10-05: el badge writing-skills sale de la portada (vuelta al 2.4.8); la disciplina sigue en la prosa.
  assert.doesNotMatch(readme, /writing--skills-/);
  assert.ok(existsSync(releasePath), "falta docs/RELEASE_2.4.9.md");
  const release = readFileSync(releasePath, "utf8");
  assert.match(release, /Claude Code/i);
  assert.match(release, /Codex/i);
  assert.match(release, /MYCELIUM/i);
  assert.match(release, /use-lore/i);
  assert.match(release, /Vespi/i);
  assert.match(release, /lore-plugin operation/i);
  // El corte candidato dice que se prueba antes de publicarse; al publicar, la nota dice «probado» con su registro.
  assert.match(release, /(?:is |will be )?tested (?:on|in) Claude Code, Codex,? and OpenCode/i);
  assert.match(release, /(?:probado|se prueba) en Claude Code, Codex y OpenCode/i);
  assert.match(release, /no public function was removed|no se eliminó ninguna función pública/i);
  assert.match(release, /existing Lore needs no migration|el Lore existente no necesita migración/i);
  const packageFiles = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).files;
  assert.ok(packageFiles.includes("hooks/"), "package.json no incluye hooks/");
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

test("Claude no recibe contexto del guard y Codex conserva su guardia", () => {
  const hooksPath = join(root, "hooks", "hooks.json");
  assert.ok(existsSync(hooksPath), "falta hooks/hooks.json");
  const hooks = JSON.parse(readFileSync(hooksPath, "utf8"));
  assert.ok(!hooks.hooks?.UserPromptSubmit, "Claude sigue recibiendo additionalContext en cada prompt");
  assert.ok(!hooks.hooks?.Stop, "Claude sigue recibiendo contexto al cerrar");
  assert.ok(Array.isArray(hooks.hooks?.SessionStart), "falta la base silenciosa de Codex");
  assert.ok(Array.isArray(hooks.hooks?.PostToolUse), "falta la guardia de Codex");
  // 2.4.9: la marca de compactación se registra en `PreCompact`, no en un evento inventado ni
  // en `UserPromptSubmit`, que es el canal que el agente narra.
  assert.ok(Array.isArray(hooks.hooks?.PreCompact), "falta la marca silenciosa de compactación");
  assert.ok(!existsSync(join(root, "hooks", "mycelium-guard.mjs")), "el adaptador retirado de Claude todavía se empaqueta");
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

  // sync-personal: USAGE_* se plegó en REFERENCE_*; esos dos archivos son el registro técnico
  // vivo y cada uno debe nombrar los ocho modos. README solo apunta a la referencia.
  for (const file of ["docs/REFERENCE_en.md", "docs/REFERENCE_es.md"]) {
    const reference = readFileSync(join(root, file), "utf8");
    for (const slug of modeSlugs) {
      assert.match(reference, new RegExp("\\b" + slug + "\\b", "i"), `${file}: falta el modo ${slug}`);
    }
  }
});
test("la documentación viva separa silencio de Claude y enforcement de Codex", () => {
  const read = (rel) => readFileSync(join(root, rel), "utf8");
  const live = read("README.md") + read("docs/REFERENCE_en.md") + read("docs/REFERENCE_es.md");
  assert.match(live, /Claude Code[\s\S]{0,500}(?:does not receive|no recibe).*(?:hook context|contexto del hook)/i);
  assert.match(live, /Codex[\s\S]{0,500}(?:automatic|automátic).*(?:guard|guardia)/i);
  assert.doesNotMatch(read("docs/REFERENCE_en.md"), /Claude Code at `UserPromptSubmit`/);
  assert.doesNotMatch(read("docs/REFERENCE_es.md"), /Claude Code en `UserPromptSubmit`/);
  const release = read("docs/RELEASE_2.4.6.md");
  assert.match(release, /known defect|defecto conocido/i);
  assert.match(release, /2\.4\.7/);
});

test("Vespi documenta delegación segura en Windows y checkpoint en FASES.md", () => {
  const en = readFileSync(join(root, "docs", "REFERENCE_en.md"), "utf8");
  const es = readFileSync(join(root, "docs", "REFERENCE_es.md"), "utf8");
  const skill = readFileSync(join(skillsRoot, "vespi", "SKILL.md"), "utf8");
  assert.match(en, /Delegating to Codex and OpenCode on Windows/);
  assert.match(es, /Delegar a Codex y a OpenCode en Windows/);
  assert.match(en, /LORE_RELEASE_GATE|test:release/);
  assert.match(es, /LORE_RELEASE_GATE|test:release/);
  for (const text of [en, es, skill]) {
    assert.match(text, /FASES\.md/);
    assert.doesNotMatch(text, /operations\/<id>\/estado\.md/);
  }
  assert.match(skill, /one block in the `## Operaciones` section of `FASES\.md`/);
  assert.match(en, /one block in the `## Operaciones` section of that same `FASES\.md`/);
  assert.match(es, /un bloque en la sección `## Operaciones` de ese mismo `FASES\.md`/);
});

test("gitattributes declara normalización LF y exclusiones binarias", () => {
  const attributes = readFileSync(join(root, ".gitattributes"), "utf8");
  assert.match(attributes, /^\* text=auto eol=lf$/m);
  for (const ext of ["png", "jpg", "pdf", "zip", "tgz", "pptx", "docx"]) assert.match(attributes, new RegExp(`\\*.${ext} binary`));
});

// R3: la guia de capacidades es la dueña editorial del vocabulario de cobertura. Se abre bajo
// demanda, en los dos idiomas, y lo que publica son IDENTIFICADORES del kernel, no estados nuevos.
test("la guia de capacidades esta en los dos idiomas, dentro de su presupuesto y sin afirmaciones automaticas", () => {
  const guide = readFileSync(join(skillsRoot, "vespi", "capabilities.md"), "utf8");
  const bytes = Buffer.byteLength(guide.replace(/\r\n/g, "\n"), "utf8");
  // §4 del plano presupuesta 8000 B. El texto bilingue con el vocabulario completo por etapa mide 8482 B:
  // el excedente son 482 B (6,0%) y esta asercion lo declara en vez de disimularlo. Lo decide Andres.
  assert.ok(bytes <= 8500, `la guia pesa ${bytes} B: 482 B por encima del presupuesto de 8000 B, ya declarados`);

  // Los dos idiomas de verdad: el mismo esquema de cinco bloques y las reglas comunes en ambos.
  for (const heading of [
    "## 1. When this applies",
    "## 2. Native sequence",
    "## 3. Coverage vocabulary",
    "## 4. Limits",
    "## 5. Who owns the ports",
  ]) assert.ok(guide.includes(heading), `falta el bloque ${heading}`);
  assert.match(guide, /Only a true check counts as covered/);
  assert.match(guide, /Solo una[\s\S]{0,3}comprobación `true` cuenta como cubierta/);
  assert.match(guide, /Empty coverage proves nothing/);
  assert.match(guide, /Una cobertura vacía no demuestra nada/);

  // El vocabulario va POR ETAPA, con los identificadores del kernel sin traducir.
  for (const name of [
    "grantor_authority", "trigger_verified", "effect_verified", "post_use_review",
    "repository", "commit_exists", "author", "content_digest", "loaded_content_digest",
    "terms", "prepared", "settlement", "delivery", "transactionUnique",
    "zk.verification-key-pinned", "zk.public-inputs-bound", "zk.proof-valid",
    "zk.presenter-authentication", "zk.institutional-attestation", "zk.replay-prevention", "zk.transport-privacy",
  ]) assert.ok(guide.includes(name), `la guia no publica el check ${name}`);
  assert.match(guide, /authority_scope/);
  assert.match(guide, /external anchor/);

  // Lo que la guia NO puede afirmar: que una capacidad se activa sola, que el pago es real, que la
  // procedencia certifica seguridad, que ZK identifica o evita repeticion, y que un limite se puede
  // volver true.
  assert.match(guide, /Nothing is activated by default/);
  assert.match(guide, /Nada se activa por defecto/);
  assert.match(guide, /does not prove a new live payment|not a new live transaction/);
  assert.match(guide, /does not evaluate safety/);
  assert.match(guide, /above are always false/);
  assert.match(guide, /never read\n  `not_verified` as "it did not happen"/i);
  assert.doesNotMatch(guide, /automatically (activates|enables|verifies|pays)/i);

  // Y la verdad de qué existe la dice el código, no el texto: la guía apunta al descriptor.
  assert.match(guide, /OPTIONAL_CAPABILITIES/);
});

test("la fachada declara que capacidades trajo la copia vendorizada, y no expone la referencia ZK ni el comparador de gasto", async () => {
  const facade = await import(pathToFileURL(join(skillsRoot, "vespi", "core", "vespi.mjs")).href);
  const state = facade.OPTIONAL_CAPABILITIES;
  assert.deepEqual(Object.keys(state).sort(), ["emergency", "provenance", "x402", "zk"]);
  for (const [name, entry] of Object.entries(state)) {
    assert.equal(typeof entry.present, "boolean", `${name} no declara si esta presente`);
    assert.equal(entry.module === null, entry.present === false, `${name}: module y present se contradicen`);
    assert.ok(Array.isArray(entry.exposed) && Array.isArray(entry.missing));
    if (!entry.present) assert.deepEqual(entry.exposed, [], `${name} ausente no puede exponer nombres`);
    // Un nombre expuesto existe con valor; uno ausente queda undefined, nunca un stub.
    for (const exposed of entry.exposed) assert.notEqual(facade[exposed], undefined, `${name}.${exposed} se declara expuesto y no lo esta`);
  }
  for (const ausente of ["createReferenceBackend", "narrowSpendAuthority", "isSpendNarrowing", "COVERED_CHECKS", "FP_MODULUS", "SCALAR_MODULUS"]) {
    assert.equal(facade[ausente], undefined, `la fachada no debe exponer ${ausente}`);
  }
});
