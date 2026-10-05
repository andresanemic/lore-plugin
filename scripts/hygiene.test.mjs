import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { scanHygiene } from "./hygiene.mjs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "lore-hygiene-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, path, text = "x\n") {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

function classes(result) {
  return result.findings.map((finding) => finding.class);
}

test("el layout de bot exige routing como archivo y canon como directorio real", (t) => {
  const root = fixture(t);
  mkdirSync(join(root, "lore", "routing.md"), { recursive: true });
  write(root, "canon/identity.md");
  assert.ok(classes(scanHygiene(root)).includes("two-seats"), "un directorio routing.md no exime");

  const fileCanon = fixture(t);
  write(fileCanon, "lore/routing.md");
  write(fileCanon, "canon", "esto es un archivo\n");
  assert.doesNotThrow(() => scanHygiene(fileCanon));
  assert.ok(classes(scanHygiene(fileCanon)).includes("two-seats"));
});

test("el layout de bot no inspecciona canon junction y lo declara no seguido", (t) => {
  const root = fixture(t);
  const external = fixture(t);
  write(root, "lore/routing.md");
  write(external, "identity.md");
  try {
    symlinkSync(external, join(root, "canon"), "junction");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) return t.skip(`el sistema no permite crear junction: ${error.code}`);
    throw error;
  }
  let inspected = false;
  const result = scanHygiene(root, { fs: {
    existsSync, lstatSync,
    readFileSync,
    readdirSync: (path, options) => {
      if (path === join(root, "canon") || path === external) inspected = true;
      return readdirSync(path, options);
    },
  } });
  assert.ok(classes(result).includes("two-seats"));
  assert.equal(inspected, false);
  assert.ok(result.notCovered.some((item) => item.path === "canon" && item.why === "enlace no seguido"));
});

test("hygiene no consulta contenido de lore cuando lore es junction", (t) => {
  const root = fixture(t);
  const external = fixture(t);
  mkdirSync(join(root, "proyectos"));
  write(external, "identity.md");
  try {
    symlinkSync(external, join(root, "lore"), "junction");
  } catch (error) {
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) return t.skip(`el sistema no permite crear junction: ${error.code}`);
    throw error;
  }
  let inspected = false;
  const result = scanHygiene(root, { fs: {
    existsSync: (path) => {
      if (path.startsWith(join(root, "lore"))) inspected = true;
      return existsSync(path);
    },
    lstatSync,
    readFileSync: (path, ...args) => {
      if (path.startsWith(external)) inspected = true;
      return readFileSync(path, ...args);
    },
    readdirSync: (path, options) => {
      if (path === external || path.startsWith(external + "\\")) inspected = true;
      return readdirSync(path, options);
    },
  } });
  assert.equal(inspected, false);
  assert.ok(result.notCovered.some((item) => item.path === "lore" && item.why === "enlace no seguido"));
});

test("hygiene sin hallazgos declara cobertura y límites", (t) => {
  const root = fixture(t);
  const result = scanHygiene(root);
  assert.deepEqual(result.findings, []);
  assert.ok(result.coverage.length > 0);
  assert.ok(result.notCovered.length > 0);
});

test("hygiene detecta directorios temporales sin seguir node_modules ni .git", (t) => {
  const root = fixture(t);
  mkdirSync(join(root, "proyecto", ".tmp-campana"), { recursive: true });
  mkdirSync(join(root, "node_modules", ".tmp-dependencia"), { recursive: true });
  mkdirSync(join(root, ".git", ".tmp-interno"), { recursive: true });
  assert.deepEqual(classes(scanHygiene(root)), ["tmp-dir"]);
});

test("hygiene señala residuos de campaña extra en la raíz de un área", (t) => {
  const root = fixture(t);
  write(root, "huerto/lore/identidad.md");
  mkdirSync(join(root, "huerto/proyectos"), { recursive: true });
  write(root, "huerto/INFORME-campana.md");
  assert.ok(classes(scanHygiene(root)).includes("area-root-extra"));
});

test("hygiene señala dos asientos sin declaración de dueño", (t) => {
  const root = fixture(t);
  mkdirSync(join(root, "arbol/canon"), { recursive: true });
  mkdirSync(join(root, "arbol/lore"), { recursive: true });
  write(root, "arbol/CLAUDE.md", "Reglas locales.\n");
  assert.ok(classes(scanHygiene(root)).includes("two-seats"));
  writeFileSync(join(root, "arbol/CLAUDE.md"), "dueño: canon\n");
  assert.ok(!classes(scanHygiene(root)).includes("two-seats"));
});

test("hygiene detecta Markdown suelto en carpetas de cristalización, pista y lesson", (t) => {
  const root = fixture(t);
  write(root, "area/lore/identidad.md");
  mkdirSync(join(root, "area/proyectos"), { recursive: true });
  for (const folder of ["cristalizacion-vieja", "pista-azul", "lesson-4"]) write(root, `area/${folder}/nota.md`);
  assert.ok(classes(scanHygiene(root)).includes("loose-crystallization"));
});

test("two-seats exime layout de bot por enrutamiento, identidad y canon con Markdown", (t) => {
  const spanish = fixture(t);
  write(spanish, "bot/lore/enrutamiento.md");
  write(spanish, "bot/lore/identidad.md");
  write(spanish, "bot/canon/mapa.md");
  assert.ok(!classes(scanHygiene(spanish)).includes("two-seats"), "nombres en español");

  const english = fixture(t);
  write(english, "bot/lore/routing.md");
  write(english, "bot/lore/identity.md");
  write(english, "bot/canon/mapa.md");
  assert.ok(!classes(scanHygiene(english)).includes("two-seats"), "nombres en inglés");

  const thin = fixture(t);
  write(thin, "bot/lore/enrutamiento.md");
  write(thin, "bot/lore/index.md");
  write(thin, "bot/canon/identidad-y-frontera.md");
  assert.ok(!classes(scanHygiene(thin)).includes("two-seats"), "bot delgado: la identidad vive en canon");

  const noRouting = fixture(t);
  write(noRouting, "bot/canon/notas.md");
  write(noRouting, "bot/lore/index.md");
  write(noRouting, "bot/lore/identidad.md");
  assert.ok(classes(scanHygiene(noRouting)).includes("two-seats"), "falta enrutamiento");

  const emptyCanon = fixture(t);
  mkdirSync(join(emptyCanon, "bot/canon"), { recursive: true });
  write(emptyCanon, "bot/lore/enrutamiento.md");
  write(emptyCanon, "bot/lore/identidad.md");
  assert.ok(classes(scanHygiene(emptyCanon)).includes("two-seats"), "canon vacío");

  write(noRouting, "bot/CLAUDE.md", "dueño: lore\n");
  assert.ok(!classes(scanHygiene(noRouting)).includes("two-seats"), "dueño declarado");
});

test("two-seats sigue detectando canon/lore sin par y acepta dueño declarado", (t) => {
  const root = fixture(t);
  write(root, "bot/canon/notas.md");
  write(root, "bot/lore/index.md");
  assert.ok(classes(scanHygiene(root)).includes("two-seats"));
  write(root, "bot/CLAUDE.md", "dueño: lore\n");
  assert.ok(!classes(scanHygiene(root)).includes("two-seats"));
});
test("hygiene detecta respaldos RC superados", (t) => {
  const root = fixture(t);
  write(root, "subarbol/_rc-backup-2025/old.md");
  assert.ok(classes(scanHygiene(root)).includes("backup-superado"));
});

test("two-seats acepta declaraciones afirmativas en ambos contratos y rechaza negaciones", (t) => {
  const root = fixture(t);
  mkdirSync(join(root, "arbol/canon"), { recursive: true });
  mkdirSync(join(root, "arbol/lore"), { recursive: true });
  write(root, "arbol/AGENTS.md", "- OWNER: LORE\n");
  assert.ok(!classes(scanHygiene(root)).includes("two-seats"));
  write(root, "arbol/AGENTS.md", "reglas\n");
  write(root, "arbol/CLAUDE.md", "Dueño: canon\n");
  assert.ok(!classes(scanHygiene(root)).includes("two-seats"));
  writeFileSync(join(root, "arbol/CLAUDE.md"), "No hay owner declarado para canon.\n");
  assert.ok(classes(scanHygiene(root)).includes("two-seats"));
  writeFileSync(join(root, "arbol/CLAUDE.md"), "sin declaracion\n");
  assert.ok(classes(scanHygiene(root)).includes("two-seats"));
});

test("hygiene reconoce areas localizadas al ingles", (t) => {
  const root = fixture(t);
  write(root, "area/lore/identity.md");
  mkdirSync(join(root, "area/projects"), { recursive: true });
  write(root, "area/campaign-report.md");
  mkdirSync(join(root, "area/crystallization-old"), { recursive: true });
  write(root, "area/crystallization-old/note.md");
  assert.deepEqual(classes(scanHygiene(root)), ["area-root-extra", "loose-crystallization"]);
  rmSync(join(root, "area/campaign-report.md"));
  rmSync(join(root, "area/crystallization-old"), { recursive: true, force: true });
  write(root, "area/CLAUDE.md");
  write(root, "area/FASES.md");
  write(root, "area/lore/principles.md");
  write(root, "area/lore/index.md");
  write(root, "area/lore/golden-paths.md");
  assert.ok(!classes(scanHygiene(root)).includes("area-root-extra"));
});

test("hygiene declara enlaces omitidos y distingue cobertura completa", (t) => {
  const root = fixture(t);
  const target = join(root, "destino");
  mkdirSync(join(target, ".tmp-x"), { recursive: true });
  try {
    symlinkSync(target, join(root, "junction"), "junction");
    symlinkSync(root, join(target, "ciclo"), "junction");
    const result = scanHygiene(root);
    assert.ok(result.notCovered.some((item) => item.path?.includes("junction") && item.why === "enlace no seguido"));
    assert.ok(result.notCovered.some((item) => item.path?.includes("ciclo") && item.why === "enlace no seguido"));
    const readable = execFileSync(process.execPath, [join(repoRoot, "scripts", "lore-plugin.mjs"), "hygiene", root], { encoding: "utf8" });
    assert.match(readable, /cubiertas con omisiones/);
    assert.doesNotMatch(readable, /hallazgos; cubiertas:/);
  } catch (error) {
    if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) return t.skip(`el sistema no permite crear junction: ${error.code}`);
    throw error;
  }

  const plain = fixture(t);
  const readable = execFileSync(process.execPath, [join(repoRoot, "scripts", "lore-plugin.mjs"), "hygiene", plain], { encoding: "utf8" });
  assert.match(readable, /cubiertas:/);
  assert.doesNotMatch(readable, /cubiertas con omisiones/);
});

test("hygiene detecta hooks sin prueba nombrada en bench", (t) => {
  const root = fixture(t);
  write(root, "hooks/hooks.json", JSON.stringify({ hooks: { "after-save": [{ hooks: [{ command: "node hooks/after-save.mjs" }] }] } }));
  write(root, "bench/unrelated.test.mjs", "assert.ok(true);\n");
  assert.ok(classes(scanHygiene(root)).includes("hook-sin-recepcion"));
  write(root, "bench/after-save.test.mjs", "// after-save.mjs\n");
  assert.ok(!classes(scanHygiene(root)).includes("hook-sin-recepcion"));
});

test("un hook solo cuenta con una prueba que nombra su comando", (t) => {
  const root = fixture(t);
  write(root, "hooks/hooks.json", JSON.stringify({ hooks: { Stop: [{ hooks: [
    { command: "node hooks/first.mjs" }, { command: "node hooks/second.mjs" },
  ] }] } }));
  write(root, "bench/first.test.mjs", "// Stop and first.mjs\n");
  const result = scanHygiene(root);
  assert.equal(result.findings.filter((finding) => finding.class === "hook-sin-recepcion").length, 1);
  assert.match(result.findings.find((finding) => finding.class === "hook-sin-recepcion").why, /second/);
});

test("el detector de hooks no informa hooks reales de la raiz", () => {
  const result = scanHygiene(repoRoot);
  assert.deepEqual(result.findings.filter((finding) => finding.class === "hook-sin-recepcion"), []);
});

test("sin carpeta bench/ los hooks quedan no cubiertos, no como hallazgos", (t) => {
  const root = fixture(t);
  write(root, "hooks/hooks.json", JSON.stringify({ hooks: { Stop: [{ hooks: [{ command: "node x.mjs" }] }] } }));
  const result = scanHygiene(root);
  assert.ok(!result.findings.some((item) => item.class === "hook-sin-recepcion"), "sin bench/ no hay con qué comparar");
  assert.ok(!result.coverage.includes("hook-sin-recepcion"));
  const gap = result.notCovered.find((item) => item.class === "hook-sin-recepcion");
  assert.ok(gap && gap.why.includes("bench/"), "la razón nombra bench/");
});

test("hygiene declara hook-sin-recepcion no cubierta si hooks.json no se puede leer", (t) => {
  const root = fixture(t);
  write(root, "hooks/hooks.json", "no es json\n");
  const result = scanHygiene(root);
  assert.ok(result.notCovered.some((item) => item.class === "hook-sin-recepcion"));
});

test("hooks.json con cualquier forma no reconocida declara la clase como no cubierta", (t) => {
  const root = fixture(t);
  const invalid = [
    ["ilegible", "no es json"],
    ["raíz arreglo", "[]"],
    ["raíz null", "null"],
    ["falta hooks", "{}"],
    ["hooks arreglo", '{"hooks":[]}'],
    ["grupo no arreglo", '{"hooks":{"Stop":{}}}'],
    ["comando no cadena", '{"hooks":{"Stop":[{"hooks":[{"command":42}]}]}}'],
  ];
  const cli = join(repoRoot, "scripts", "lore-plugin.mjs");
  for (const [label, source] of invalid) {
    write(root, "hooks/hooks.json", source);
    const result = scanHygiene(root);
    assert.ok(!result.coverage.includes("hook-sin-recepcion"), label);
    const omission = result.notCovered.find((item) => item.class === "hook-sin-recepcion");
    assert.ok(omission, label);
    assert.match(omission.why, /hooks\.json|hooks|command|JSON/i, label);
    const readable = execFileSync(process.execPath, [cli, "hygiene", root], { encoding: "utf8" });
    assert.doesNotMatch(readable, /no cubiertas: ninguna|cobertura completa/i, label);
    assert.match(readable, /hook-sin-recepcion/, label);
  }
  write(root, "hooks/hooks.json", '{"hooks":{"Stop":[{"hooks":[{"command":"node hooks/stop.mjs"}]}]}}');
  write(root, "bench/stop.test.mjs", "// stop.mjs\n");
  const valid = scanHygiene(root);
  assert.ok(valid.coverage.includes("hook-sin-recepcion"));
  assert.ok(!valid.notCovered.some((item) => item.class === "hook-sin-recepcion"));
});

test("el recorrido incluye ignorados por gitignore y no cambia listado ni contenido", (t) => {
  const root = fixture(t);
  write(root, ".gitignore", "oculto/\n");
  write(root, "oculto/_rc-backup-1/dato.txt", "conservar\n");
  write(root, "visible/a.txt", "igual\n");
  const snapshot = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory()
      ? [[path, "dir"], ...snapshot(path)]
      : [[path, "file", readFileSync(path, "utf8")]];
  }).sort((a, b) => a[0].localeCompare(b[0]));
  const before = snapshot(root);
  const result = scanHygiene(root);
  const after = snapshot(root);
  assert.deepEqual(after, before);
  assert.ok(result.findings.some((finding) => finding.class === "backup-superado"));
});

test("lore-plugin hygiene ofrece JSON y un informe legible", (t) => {
  const root = fixture(t);
  const cli = join(repoRoot, "scripts", "lore-plugin.mjs");
  const json = execFileSync(process.execPath, [cli, "hygiene", root, "--json"], { encoding: "utf8" });
  assert.equal(JSON.parse(json).findings.length, 0);
  const readable = execFileSync(process.execPath, [cli, "hygiene", root], { encoding: "utf8" });
  assert.match(readable, /0 hallazgos; cubiertas:/);
  assert.match(readable, /no cubiertas:/);
});
