import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { skillText } from "./skill-text.mjs";
import {
  autorizaBorrado,
  estaArbitrada,
  extraeEvidencia,
  preguntaNivel,
  resuelveNivel,
  verificaEvidencia,
} from "../skills/save-to-lore/scripts/save-to-lore.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(root, "skills");

// Base temporal real por test: portable a cualquier maquina, se cierra con rmSync.
function baseTemporal(t) {
  const dir = mkdtempSync(join(tmpdir(), "s5-evidencia-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

// S5.1 — "nota primero, fuera de lore/": ya lo hace notas.md; este test lo fija, no lo duplica.
test("S5.1 la captura de notas vive fuera de lore/ y antes de save-to-lore", () => {
  const notas = readFileSync(join(skillsRoot, "save-to-lore", "notas.md"), "utf8");
  assert.match(notas, /Never capture inside `lore\/`/);
  const save = skillText(join(skillsRoot, "save-to-lore"));
  assert.match(save, /read\s+.*notas\.md.*before touching the files/is);
});

// S5.2 — "arbitrada" es exactamente lo que notas.md §5 escribe: `destilado:`
// no vacio (incluido `nada`, arbitraje como ruido). notas.md no produce ningun
// campo `bucket`, asi que la categoria que el guard pedia era inalcanzable.
test("S5.2 arbitrada es destilado no vacio, sin campo bucket", () => {
  assert.equal(estaArbitrada(null), false);
  assert.equal(estaArbitrada({}), false);
  assert.equal(estaArbitrada({ destilado: "" }), false);
  assert.equal(estaArbitrada({ destilado: "   " }), false);
  assert.equal(estaArbitrada({ destilado: "2026-08-10 → desarrollo-web/lore/scroll.md" }), true);
  assert.equal(estaArbitrada({ destilado: "2026-08-10 → nada (ruido — cambio cosmético)" }), true);
  // `bucket` es ficcion: ningun valor suyo cambia el veredicto.
  assert.equal(estaArbitrada({ destilado: "2026-08-10 → nada", bucket: "invento" }), true);
  assert.equal(estaArbitrada({ destilado: "", bucket: "experiencia" }), false);
});

test("S5.2 save-to-lore nunca autoriza borrar; el motivo distingue sin-arbitrar de archivada", () => {
  const sinArbitrar = autorizaBorrado({ destilado: "" });
  assert.equal(sinArbitrar.ok, false);
  assert.match(sinArbitrar.motivo, /sin-arbitrar/);
  const arbitrada = autorizaBorrado({ destilado: "2026-08-10 → nada (ruido)" });
  assert.equal(arbitrada.ok, false);
  assert.match(arbitrada.motivo, /archiv/);
  // Un stub de constante fija ({ ok: false } con un solo motivo) no pasa este test.
  assert.notEqual(sinArbitrar.motivo, arbitrada.motivo);
});

// S5.3 — cada Pista nueva trae puntero relativo a su evidencia, y resuelve.
test("S5.3 una Pista sin puntero de evidencia no verifica", (t) => {
  const pista = "# Pista\n\n> Sin evidencia citada.\n";
  assert.deepEqual(extraeEvidencia(pista), []);
  const r = verificaEvidencia(pista, baseTemporal(t));
  assert.equal(r.ok, false);
  assert.match(r.motivos.join(" "), /sin-evidencia/);
});

test("S5.3 el puntero relativo a un archivo que existe verifica; al que falta, no", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "2026-09-20_caso.md"), "# caso\n", "utf8");
  const buena = "> Pista.\n\nevidencia: notas/2026-09-20_caso.md\n";
  const ok = verificaEvidencia(buena, dir);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.faltantes, []);
  const mala = "> Pista.\n\nevidencia: notas/no-existe.md\n";
  const no = verificaEvidencia(mala, dir);
  assert.equal(no.ok, false);
  assert.deepEqual(no.faltantes, ["notas/no-existe.md"]);
});

test("S5.3 una carpeta como evidencia no verifica: debe ser un archivo real", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "notas", "2026-09-20_caso.md"), { recursive: true });
  const r = verificaEvidencia("evidencia: notas/2026-09-20_caso.md\n", dir);
  assert.equal(r.ok, false);
  assert.deepEqual(r.faltantes, ["notas/2026-09-20_caso.md"]);
});

test("S5.3 el puntero absoluto o URL no vale como evidencia alcanzable", (t) => {
  const dir = baseTemporal(t);
  for (const ptr of ["C:/Claude/notas/x.md", "/tmp/x.md", "https://example.com/x.md"]) {
    const r = verificaEvidencia(`evidencia: ${ptr}\n`, dir);
    assert.equal(r.ok, false, ptr);
    assert.match(r.motivos.join(" "), /relativa/);
  }
});

test("S5.3 un puntero con .. que no resuelve no verifica", (t) => {
  const dir = baseTemporal(t);
  writeFileSync(join(dir, "fuera.md"), "# fuera\n", "utf8");
  mkdirSync(join(dir, "notas"), { recursive: true });
  const r = verificaEvidencia("evidencia: notas/../../fuera.md\n", dir);
  assert.equal(r.ok, false);
  assert.match(r.motivos.join(" "), /no-resuelve/);
});

// S5.4 — la pregunta de nivel: kit (cualquiera) vs raiz del jardin (esta persona).
test("S5.4 la pregunta distingue kit de jardin y prohibe auto-commit al kit", () => {
  const q = preguntaNivel();
  assert.match(q, /cualquier persona/);
  assert.match(q, /esta persona/);
  assert.match(q, /nunca.*auto-commit|auto-commit.*nunca/is);
  const kit = resuelveNivel("kit");
  assert.equal(kit.destino, "kit");
  assert.match(kit.via, /PR o propuesta/);
  assert.match(kit.prohibido, /auto-commit/);
  const jardin = resuelveNivel("jardín");
  assert.equal(jardin.destino, "raiz-del-jardin");
  assert.match(jardin.via, /fuera del kit/);
  assert.throws(() => resuelveNivel("donde sea"), /kit|jard[ií]n/);
});

test("S5.4 resuelveNivel exige token explicito: la coincidencia parcial no enruta", () => {
  for (const r of ["toolkit", "kitsune", "jardineria", "persona"]) {
    assert.throws(() => resuelveNivel(r), /kit|jard[ií]n/, r);
  }
});

test("S5.4 una respuesta ambigua o negada pregunta de nuevo en vez de asumir destino", () => {
  for (const r of ["no se si kit o jardin", "no lo mandes al kit, es de esta persona", "no es kit", "kit y jardin"]) {
    assert.throws(() => resuelveNivel(r), /kit|jard[ií]n/, r);
  }
});

// S5-fix2.1 — una Pista en lore/ cita una nota hermana ../notas/caso.md.
// Reproducción de la revisión Codex: verificaEvidencia() rechazaba todo `..`,
// así que la ruta normal lore/principios.md → ../notas/caso.md daba ok:false
// con fuera-de-base aunque el archivo existe.
test("S5-fix2.1 una Pista en lore/ cita ../notas/caso.md hermana y verifica", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "caso.md"), "# caso\n", "utf8");
  const pista = "> Pista.\n\nevidencia: ../notas/caso.md\n";
  const r = verificaEvidencia(pista, join(dir, "lore"));
  assert.equal(r.ok, true);
  assert.deepEqual(r.faltantes, []);
});

// S5-fix2.2 — nota primero también en CAPTURE ordinario (acuerdo RC4 §Lo aprendido:
// «Lo que pasó se anota primero como nota fuera de `lore/`; lo que ya pesa se
// ofrece a `save-to-lore`»). El paso mínimo vive en el flujo ordinario (Step 1),
// tras la aprobación humana y antes de escribir en lore/, sin segundo umbral.
// No puede pasar solo por encontrar la palabra notas.md: exige las frases del
// paso nuevo (brief source note, no second approval) en orden dentro del Step 1.
test("S5-fix2.2 CAPTURE ordinario: nota breve tras la aprobación y antes de lore/", () => {
  const skill = readFileSync(join(skillsRoot, "save-to-lore", "SKILL.md"), "utf8");
  const iStep1 = skill.indexOf("### Step 1");
  const iStep2 = skill.indexOf("### Step 2");
  assert.notEqual(iStep1, -1);
  assert.ok(iStep2 > iStep1);
  const paso1 = skill.slice(iStep1, iStep2);
  const iAprueba = paso1.search(/approv/i);
  const iNota = paso1.search(/brief source note/i);
  const iAntes = paso1.search(/before writing/i);
  const iEvidencia = paso1.indexOf("evidencia:");
  const iUmbral = paso1.search(/no second approval/i);
  assert.ok(iAprueba !== -1, "el paso nombra la aprobación humana");
  assert.ok(iNota !== -1, "el paso exige la nota breve de fuente");
  assert.ok(iAntes !== -1, "el paso dice antes de escribir");
  assert.ok(iEvidencia !== -1, "el paso pide evidencia: verificable");
  assert.ok(iUmbral !== -1, "el paso dice que no añade un segundo umbral");
  assert.ok(iAprueba < iNota, "la nota va después de la aprobación");
  assert.ok(iNota < iAntes, "la nota va antes de la escritura en lore/");
  assert.ok(iNota < iEvidencia, "la evidencia apunta a esa nota");
  assert.match(paso1, /outside `?lore\/?`/i);
});

// S5-fix3.1 — el imperativo real de escritura en lore/ va después de la nota.
// Adversarial: "Source note first" como subtítulo después de "Write the full
// entry" no basta — un agente que sigue la lista numerada escribe primero.
// Este test mira el orden ejecutable: la primera aparición del imperativo
// real de escritura en lore/ debe estar después de la nota breve de fuente.
test("S5-fix3.1 Step 1 ejecutable: Write the full entry va después de la nota breve", () => {
  const skill = readFileSync(join(skillsRoot, "save-to-lore", "SKILL.md"), "utf8");
  const iStep1 = skill.indexOf("### Step 1");
  const iStep2 = skill.indexOf("### Step 2");
  assert.notEqual(iStep1, -1);
  assert.ok(iStep2 > iStep1);
  const paso1 = skill.slice(iStep1, iStep2);
  const iNota = paso1.search(/brief source note/i);
  const iWrite = paso1.indexOf("Write the full entry");
  assert.ok(iNota !== -1, "el Step 1 nombra la nota breve de fuente");
  assert.ok(iWrite !== -1, "el Step 1 contiene el imperativo real de escritura en lore/");
  assert.ok(iWrite > iNota, "la escritura en lore/ va después de la nota breve, no antes");
});

// S5-fix3.2 — la CLI selecciona la Pista nueva: archivo de dos secciones donde
// la vieja tiene evidencia válida y la nueva no. La vía de archivo completo
// sigue pasando (diagnóstico); la selección de la Pista nueva falla; y la
// misma Pista pasa cuando su evidencia resuelve.
test("S5-fix3.2 la CLI selecciona la Pista nueva por encabezado", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "viejo.md"), "# viejo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista vieja\n\nevidencia: ../notas/viejo.md\n\n## Pista nueva\n\nUna afirmacion nueva que no cita nada.\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const entero = spawnSync(process.execPath, [mod, "--pista", pista, "--base", join(dir, "lore")], { encoding: "utf8" });
  assert.equal(entero.status, 0, "archivo completo: pasa como diagnóstico");
  const nueva = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.notEqual(nueva.status, 0, "la Pista nueva sin evidencia falla");
  // La misma Pista con evidencia que resuelve pasa.
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  writeFileSync(
    pista,
    "## Pista vieja\n\nevidencia: ../notas/viejo.md\n\n## Pista nueva\n\nevidencia: ../notas/nuevo.md\n",
    "utf8",
  );
  const ahora = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(ahora.status, 0, String(ahora.stderr).slice(0, 300));
});

test("S5-fix3.2 la CLI selecciona por intervalo de líneas", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "viejo.md"), "# viejo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  const lineas = [
    "## Pista vieja",
    "",
    "evidencia: ../notas/viejo.md",
    "",
    "## Pista nueva",
    "",
    "Una afirmacion nueva que no cita nada.",
    "",
  ];
  writeFileSync(pista, lineas.join("\n"), "utf8");
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const nueva = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--lineas", "5-8"],
    { encoding: "utf8" },
  );
  assert.notEqual(nueva.status, 0, "el intervalo de la Pista nueva sin evidencia falla");
  const vieja = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--lineas", "1-3"],
    { encoding: "utf8" },
  );
  assert.equal(vieja.status, 0, "el intervalo de la Pista vieja con evidencia pasa");
});

// S5-fix4 — la selección de Pista es inequívoca: coincidencia exacta del
// encabezado (solo caja y espacios exteriores se ignoran). Un prefijo similar
// (`Pista nueva antigua` antes de `Pista nueva`) no desvía la selección; dos
// encabezados exactos iguales fallan por ambigüedad con salida 2 y piden
// --lineas A-B en vez de elegir el primero en silencio.
test("S5-fix4 la CLI exige encabezado exacto: prefijo similar no desvía", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "viejo.md"), "# viejo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva antigua\n\nevidencia: ../notas/viejo.md\n\n## Pista nueva\n\nUna afirmacion nueva que no cita nada.\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const nueva = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(nueva.status, 1, `la Pista nueva exacta sin evidencia falla, no la vieja con evidencia: ${nueva.stdout.slice(0, 200)} ${nueva.stderr.slice(0, 200)}`);
  // La misma Pista nueva con evidencia que resuelve pasa.
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  writeFileSync(
    pista,
    "## Pista nueva antigua\n\nevidencia: ../notas/viejo.md\n\n## Pista nueva\n\nevidencia: ../notas/nuevo.md\n",
    "utf8",
  );
  const ahora = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(ahora.status, 0, String(ahora.stderr).slice(0, 300));
});

test("S5-fix4 dos encabezados exactos iguales fallan por ambigüedad con salida 2", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "a.md"), "# a\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nevidencia: ../notas/a.md\n\n## Pista nueva\n\nevidencia: ../notas/a.md\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 2, `el duplicado exacto falla por ambigüedad con salida 2: ${r.stderr.slice(0, 300)}`);
  assert.match(r.stderr, /--lineas/);
});

// S5-fix5.1 — --seccion ignora encabezados dentro de cercas Markdown.
// RED: un solo `## Pista nueva` dentro de ```markdown…``` con una línea
// `evidencia:` válida devolvía ok:true (salida 0): la puerta verificaba el
// ejemplo en vez de la Pista real. Ahora sale 2 por sección ausente.
test("S5-fix5.1 la CLI ignora un encabezado solo cercado con backticks: sale 2", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "ejemplo.md"), "# ejemplo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "# Ejemplo de uso\n\n```markdown\n## Pista nueva\n\nevidencia: ../notas/ejemplo.md\n```\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 2, `el ejemplo cercado no es la Pista: ${r.stdout.slice(0, 200)} ${r.stderr.slice(0, 200)}`);
  assert.match(r.stderr, /sin-seccion/);
});

test("S5-fix5.1 la CLI ignora cercas de tildes", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "ejemplo.md"), "# ejemplo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "# Ejemplo de uso\n\n~~~\n## Pista nueva\n\nevidencia: ../notas/ejemplo.md\n~~~\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 2, `el ejemplo cercado con tildes no es la Pista: ${r.stderr.slice(0, 200)}`);
  assert.match(r.stderr, /sin-seccion/);
});

test("S5-fix5.1 la cerca de cierre exige mismo carácter y al menos la longitud de apertura", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "ejemplo.md"), "# ejemplo\n", "utf8");
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  // Otro carácter no cierra: todo lo que sigue sigue cercado.
  const pistaOtro = join(dir, "lore", "otro.md");
  writeFileSync(
    pistaOtro,
    "```\n## Pista nueva\n\nevidencia: ../notas/ejemplo.md\n~~~\n\n## Pista nueva\n\nSin evidencia.\n",
    "utf8",
  );
  const otro = spawnSync(
    process.execPath,
    [mod, "--pista", pistaOtro, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(otro.status, 2, `~~~ no cierra una cerca de backticks: ${otro.stderr.slice(0, 200)}`);
  // Cierre más corto que la apertura no cierra.
  const pistaCorta = join(dir, "lore", "corta.md");
  writeFileSync(
    pistaCorta,
    "````markdown\n## Pista nueva\n\nevidencia: ../notas/ejemplo.md\n```\n\n## Pista nueva\n\nSin evidencia.\n",
    "utf8",
  );
  const corta = spawnSync(
    process.execPath,
    [mod, "--pista", pistaCorta, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(corta.status, 2, `un cierre más corto no abre de nuevo: ${corta.stderr.slice(0, 200)}`);
});

// S5-fix5.2 — cercado + real: --seccion elige la Pista real; dos reales
// exactas siguen fallando por ambigüedad aunque haya un ejemplo cercado.
test("S5-fix5.2 con ejemplo cercado y Pista real, --seccion elige la real", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "ejemplo.md"), "# ejemplo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "# Ejemplo de uso\n\n```markdown\n## Pista nueva\n\nevidencia: ../notas/ejemplo.md\n```\n\n## Pista nueva\n\nUna afirmacion nueva que no cita nada.\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const sin = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(sin.status, 1, `la Pista real sin evidencia falla, no el ejemplo con evidencia: ${sin.stdout.slice(0, 200)}`);
  const alcance = JSON.parse(sin.stdout);
  assert.equal(alcance.alcance.desde, 9, "la selección empieza en la Pista real, no en el ejemplo");
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  writeFileSync(
    pista,
    "# Ejemplo de uso\n\n```markdown\n## Pista nueva\n\nevidencia: ../notas/ejemplo.md\n```\n\n## Pista nueva\n\nevidencia: ../notas/nuevo.md\n",
    "utf8",
  );
  const con = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(con.status, 0, String(con.stderr).slice(0, 300));
});

test("S5-fix5.2 dos Pistas reales más un ejemplo cercado siguen ambiguas con salida 2", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "a.md"), "# a\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "```markdown\n## Pista nueva\n\nevidencia: ../notas/a.md\n```\n\n## Pista nueva\n\nevidencia: ../notas/a.md\n\n## Pista nueva\n\nevidencia: ../notas/a.md\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 2, `el duplicado real sigue ambiguo: ${r.stderr.slice(0, 300)}`);
  assert.match(r.stderr, /ambigua: 2 encabezados/);
  assert.match(r.stderr, /--lineas/);
});

// S5-fix5.3 — recomendación bunny S5-fix4 §1: la frase de la documentación
// (encabezado exacto, solo caja y espacios exteriores, --lineas como
// alternativa) queda fijada por prueba en SKILL y los dos REFERENCE, no solo
// por lectura. Sigue el patrón de S5-fix2.2 y S5-fix3.1.
test("S5-fix5.3 SKILL y REFERENCE documentan encabezado exacto y --lineas como alternativa", () => {
  const skill = readFileSync(join(skillsRoot, "save-to-lore", "SKILL.md"), "utf8");
  assert.match(skill, /matches the heading text exactly/i);
  assert.match(skill, /only case and outer spaces ignored/i);
  assert.match(skill, /--lineas/);
  const es = readFileSync(join(root, "docs", "REFERENCE_es.md"), "utf8");
  assert.match(es, /texto exacto del encabezado/i);
  assert.match(es, /solo caja y espacios exteriores se ignoran/i);
  assert.match(es, /--lineas/);
  const en = readFileSync(join(root, "docs", "REFERENCE_en.md"), "utf8");
  assert.match(en, /matches the heading text exactly/i);
  assert.match(en, /only case and outer spaces ignored/i);
  assert.match(en, /--lineas/);
});

// S5-fix6 — la evidencia tambien debe estar fuera de ejemplos: fix5 ignoro
// los encabezados cercados al seleccionar, pero `extraeEvidencia` contaba la
// linea `evidencia:` dentro de la cerca. Una Pista nueva sin evidencia propia
// pasaba con el puntero prestado de un ejemplo. Ahora la extraccion reutiliza
// el rastreo de cercas y la seccion viaja con sus cercas intactas.
// RED: Pista real sin evidencia propia + cerca cerrada con encabezado y
// `evidencia:` valido dentro -> salida 1, no 0.
test("S5-fix6 la evidencia dentro de una cerca cerrada no verifica la Pista: sale 1", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nUna afirmacion nueva sin evidencia propia.\n\n```markdown\n## Plantilla de ejemplo\n\nevidencia: ../notas/otro.md\n```\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 1, `la evidencia prestada del ejemplo no verifica: ${r.stdout.slice(0, 200)} ${r.stderr.slice(0, 200)}`);
  assert.match(r.stdout, /sin-evidencia/);
});

test("S5-fix6 la evidencia en cerca de tildes tampoco verifica: sale 1", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nSin evidencia propia.\n\n~~~\n## Ejemplo\n\nevidencia: ../notas/otro.md\n~~~\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 1, `la evidencia en tildes no verifica: ${r.stdout.slice(0, 200)}`);
});

test("S5-fix6 la evidencia en cerca sin cerrar tampoco verifica: sale 1", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nSin evidencia propia.\n\n```markdown\n## Ejemplo\n\nevidencia: ../notas/otro.md\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 1, `la evidencia tras cerca sin cerrar no verifica: ${r.stdout.slice(0, 200)}`);
});

test("S5-fix6 la Pista real con evidencia real fuera de la cerca si pasa", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nevidencia: ../notas/nuevo.md\n\n```markdown\n## Plantilla de ejemplo\n\nevidencia: ../notas/otro.md\n```\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 0, `la evidencia propia fuera de la cerca verifica: ${r.stderr.slice(0, 300)}`);
  const alcance = JSON.parse(r.stdout);
  assert.deepEqual(alcance.punteros, ["../notas/nuevo.md"], "el puntero del ejemplo no se suma al propio");
});

// S5-fix2.3 — la salvaguarda se ejecuta: la verificación de evidencia tiene una
// invocación CLI concreta y portable desde la skill, con un archivo real.
// El comando sale distinto de cero si falta evidencia.
test("S5-fix2.3 la verificación de evidencia corre como CLI portable y sale distinto de cero sin evidencia", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "caso.md"), "# caso\n", "utf8");
  const buena = join(dir, "lore", "pista.md");
  writeFileSync(buena, "> Pista.\n\nevidencia: ../notas/caso.md\n", "utf8");
  const mala = join(dir, "lore", "vacia.md");
  writeFileSync(mala, "> Sin evidencia citada.\n", "utf8");
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const ok = spawnSync(process.execPath, [mod, "--pista", buena, "--base", join(dir, "lore")], { encoding: "utf8" });
  assert.equal(ok.status, 0, String(ok.stderr).slice(0, 300));
  const no = spawnSync(process.execPath, [mod, "--pista", mala, "--base", join(dir, "lore")], { encoding: "utf8" });
  assert.notEqual(no.status, 0);
});

// S5-fix7 — cerrar falsos verdes de evidencia prestada: contrato sencillo para
// donde vive `evidencia:` (columna 0-3 con espacios, sin `>`, sin tabulador;
// 4+ espacios es codigo indentado y nunca cuenta), cercas anidadas en citas
// (`> ``` ```) rastreadas, y --lineas interpretado contra el archivo completo.
// RED: Pista real sin evidencia propia + (1) ejemplo indentado, (2) cerca en
// cita con continuacion perezosa, (3) rango que empieza dentro de una cerca.
test("S5-fix7 la evidencia en bloque indentado no verifica la Pista: sale 1", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nSin evidencia propia. Solo un ejemplo indentado:\n\n    ## Ejemplo indentado\n\n    evidencia: ../notas/otro.md\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 1, `el ejemplo indentado no aporta evidencia: ${r.stdout.slice(0, 200)} ${r.stderr.slice(0, 200)}`);
  assert.match(r.stdout, /sin-evidencia/);
});

test("S5-fix7 la evidencia en cerca dentro de cita con continuacion perezosa no verifica: sale 1", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nSin evidencia propia. Ejemplo dentro de una cita.\n\n> ```markdown\n> ## Ejemplo\nevidencia: ../notas/otro.md\n> ```\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 1, `la cerca en cita no aporta evidencia: ${r.stdout.slice(0, 200)} ${r.stderr.slice(0, 200)}`);
  assert.match(r.stdout, /sin-evidencia/);
});

test("S5-fix7 --lineas que empieza dentro de una cerca no identifica Pista real: sale 2", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "# Notas varias\n\n```markdown\n## Pista prestada\n\nevidencia: ../notas/otro.md\n\ntexto del ejemplo\n```\n\n## Pista real\n\nSin evidencia propia.\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--lineas", "4-6"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 2, `el rango dentro del ejemplo no es una Pista: ${r.stdout.slice(0, 200)} ${r.stderr.slice(0, 200)}`);
  assert.match(r.stderr, /fuera-de-ejemplo/);
});

test("S5-fix7 positivo: Pista real con puntero propio verifica", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(pista, "## Pista nueva\n\nevidencia: ../notas/nuevo.md\n", "utf8");
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 0, `la evidencia propia verifica: ${r.stderr.slice(0, 300)}`);
  assert.deepEqual(JSON.parse(r.stdout).punteros, ["../notas/nuevo.md"]);
});

test("S5-fix7 positivo: evidencia propia tras un ejemplo cercado verifica solo con lo propio", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\n```markdown\n## Plantilla de ejemplo\n\nevidencia: ../notas/otro.md\n```\n\nevidencia: ../notas/nuevo.md\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const r = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 0, `la evidencia tras el ejemplo verifica: ${r.stderr.slice(0, 300)}`);
  assert.deepEqual(JSON.parse(r.stdout).punteros, ["../notas/nuevo.md"], "el puntero del ejemplo no se suma al propio");
});

test("S5-fix7 positivo: duplicados exactos se seleccionan con --lineas", (t) => {
  const dir = baseTemporal(t);
  mkdirSync(join(dir, "lore"), { recursive: true });
  mkdirSync(join(dir, "notas"), { recursive: true });
  writeFileSync(join(dir, "notas", "otro.md"), "# otro\n", "utf8");
  writeFileSync(join(dir, "notas", "nuevo.md"), "# nuevo\n", "utf8");
  const pista = join(dir, "lore", "principios.md");
  writeFileSync(
    pista,
    "## Pista nueva\n\nevidencia: ../notas/otro.md\n\n## Pista nueva\n\nevidencia: ../notas/nuevo.md\n",
    "utf8",
  );
  const mod = join(root, "skills", "save-to-lore", "scripts", "save-to-lore.mjs");
  const ambigua = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--seccion", "Pista nueva"],
    { encoding: "utf8" },
  );
  assert.equal(ambigua.status, 2, "el duplicado exacto sigue ambiguo por --seccion");
  const segunda = spawnSync(
    process.execPath,
    [mod, "--pista", pista, "--base", join(dir, "lore"), "--lineas", "5-7"],
    { encoding: "utf8" },
  );
  assert.equal(segunda.status, 0, `la segunda Pista por --lineas verifica: ${segunda.stderr.slice(0, 300)}`);
  assert.deepEqual(JSON.parse(segunda.stdout).punteros, ["../notas/nuevo.md"]);
});
