// RC5: la copia del kernel es verificable contra el commit fuente, no contra su propio inventario.
// Cada archivo de core/kernel/ = 3 líneas de procedencia + los bytes exactos de la fuente; el
// SHA-256 los publica core/kernel/SOURCE.md y el commit fijado los lee Git, fuera del kit.
//
// La prueba separa dos cosas que a simple vista se parecen. La deriva legítima es la que el kit
// DECLARA: dice «estoy fijado en el commit X» y sus bytes son los de X, aunque X no sea el HEAD de
// la fuente. La mentira es la inversa: dice estar en X y trae los bytes de otro. Por eso el commit
// esperado vive aquí, escrito desde fuera, y SOURCE.md es disposable: es una de las cosas que se
// comprueba, no la fuente de la comprobación.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { readGitSource } from "./git-source.mjs";
import { kernelDirOf, kernelModules, readSourceRows } from "../scripts/kernel-inventory.mjs";

const kit = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const kernelDir = kernelDirOf(kit);

// El corte que RC5 adopta. No se lee de SOURCE.md: SOURCE.md es parte de lo que se verifica.
const PINNED_COMMIT = "98a33280fb35cb1fc7feda483e7dd57b97362c49";
const short = PINNED_COMMIT.slice(0, 7);

// La lista de módulos tampoco se escribe. La fuente única es el directorio vendorizado, y R2 dejó de
// tener una lista escrita a mano en dos archivos: cuando el kernel gana un módulo, la prueba lo ve
// porque mira lo que el kit trae, y no porque alguien añadiera su nombre aquí. Lo que esta prueba ya no
// puede decir con una lista propia —«estos son los del corte»— lo dice contra el propio Git, abajo.
const VENDORED = kernelModules(kernelDir);

// Dónde vive la fuente canónica, para leer los bytes EN el commit fijado y no desde el directorio
// de trabajo, que puede estar adelantado, atrasado o sucio. Es relativo a propósito: nada de rutas
// absolutas de una máquina en un archivo que se distribuye. Se puede anular con VESPI_KERNEL_ROOT o VESPI_KERNEL_DIR (la misma variable que usa method-provenance).
const kernelRoot = [process.env.VESPI_KERNEL_ROOT, process.env.VESPI_KERNEL_DIR, resolve(kit, "..", "..", "..", "founder", "proyectos", "vespi", "kernel")]
  .find((candidate) => candidate && existsSync(join(candidate, ".git")));

// H18: sin la fuente canonica, estas tres preguntas no tienen respuesta, y un `t.skip` callado
// las hacia desaparecer del resumen. Aqui el salto se declara: dice que se salto, por que, y lo
// dice en una linea que la suite imprime siempre (AVISO DE PROCEDENCIA). En CI el salto es un
// fallo: una verificacion que solo corre a veces no verifica. Ninguna asercion se relaja.
const MARCA_SIN_FUENTE = "procedencia NO verificada contra Git";
export const sinFuente = { marca: MARCA_SIN_FUENTE, esVisible: true };

if (!kernelRoot) {
  process.stderr.write([
    `${MARCA_SIN_FUENTE}: no se encontro el repositorio canonico del kernel.`,
    "Las tres comprobaciones que comparan los bytes con Git quedan sin verificar en esta corrida.",
    "Lo que se verifica aqui es solo la tabla de hashes de SOURCE.md, que vive en el mismo directorio",
    "y se edita en el mismo commit. Se puede anular la ruta con VESPI_KERNEL_ROOT.",
    ""].join(" ") + String.fromCharCode(10));
}

export function exigirFuente(t, que, { hayFuente = Boolean(kernelRoot), esCI = process.env.CI === "true" } = {}) {
  if (hayFuente) return true;
  const motivo = `${MARCA_SIN_FUENTE}: ${que} necesita el repositorio canonico del kernel, que no esta en esta corrida`;
  if (esCI) {
    assert.fail(`${motivo}. En CI esto es un fallo a proposito: dejar la verificacion sin correr no puede pasar inadvertido.`);
  }
  t.diagnostic(motivo);
  return t.skip(motivo);
}

const source = readFileSync(join(kernelDir, "SOURCE.md"), "utf8");
const rows = readSourceRows(source);

const claims = [
  ["SOURCE.md", source],
  ["SKILL.md", readFileSync(join(kit, "skills", "vespi", "SKILL.md"), "utf8")],
  ["core/vespi.mjs", readFileSync(join(kit, "skills", "vespi", "core", "vespi.mjs"), "utf8")],
];

// Un commit afirmado en el kit puede venir con comillas invertidas o sin ellas; las dos formas
// son la misma afirmación y el barrido tiene que verlas igual.
const COMMIT_CLAIM = /commit `?([0-9a-f]{7,40})\b/g;

function body(name) {
  const file = readFileSync(join(kernelDir, name));
  let cut = 0;
  for (let i = 0; i < 3; i++) cut = file.indexOf(0x0a, cut) + 1;
  return file.subarray(cut);
}

function header(name) {
  return readFileSync(join(kernelDir, name), "utf8").split("\n").slice(0, 3);
}

function fromSourceCommit(commit, name) {
  return readGitSource({ root: kernelRoot, commit, name });
}

test("SOURCE.md inventaría los módulos que el kit trae, y solo esos", () => {
  assert.deepEqual([...rows.keys()].sort(), VENDORED);
});

test("el directorio vendorizado es exactamente el src del commit fijado, leído de Git", (t) => {
  // El reemplazo de la lista escrita a mano. Antes la prueba comparaba el directorio con seis
  // nombres tecleados aquí; ahora lo compara con lo que el commit fijado declara tener, que es la
  // misma pregunta con mejor fuente: ¿le falta al kit un módulo del corte, o trae de más?
  exigirFuente(t, "el conjunto del corte");
  const listed = execFileSync("git", ["-c", `safe.directory=${kernelRoot.replaceAll("\\", "/")}`, "ls-tree", "--name-only", `${PINNED_COMMIT}:src`], { cwd: kernelRoot, encoding: "utf8" })
    .split("\n").map((line) => line.trim()).filter((name) => name.endsWith(".js") && name !== "zk-bn254-reference.js").sort();
  assert.ok(!VENDORED.includes("zk-bn254-reference.js"), "the experimental ZK reference is not part of the vendored cut");
  assert.deepEqual(VENDORED, listed);
});

test("cada módulo lleva un encabezado de tres líneas que declara el commit fijado", () => {
  for (const name of VENDORED) {
    const path = join(kernelDir, name);
    assert.ok(existsSync(path), `core/kernel/${name} no está vendorizado`);
    const [first, second, third] = header(name);
    assert.match(first, /^\/\/ Vendored copy/);
    assert.ok(first.includes(`src/${name}`), `el encabezado de core/kernel/${name} no apunta a su fuente`);
    assert.ok(second.includes(`commit ${short}`), `el encabezado de core/kernel/${name} no declara el commit ${short}`);
    assert.equal(third, "// this file is not the source of truth.");
  }
});

test("todo commit que el kit afirma en público es el commit fijado", () => {
  let seen = 0;
  for (const [where, text] of claims) {
    for (const [, commit] of text.matchAll(COMMIT_CLAIM)) {
      seen += 1;
      assert.ok(PINNED_COMMIT.startsWith(commit), `${where} afirma el commit ${commit}, que no es el fijado ${short}`);
    }
  }
  // Sin este conteo el barrido pasa en vacío: un archivo que nombra su commit con comillas
  // invertidas no lo encuentra el patrón, y un archivo que no nombra ninguno parecería limpio.
  assert.equal(seen, 3, `el kit afirma un commit en ${seen} de 3 archivos que declaran procedencia`);
});

test("cada módulo declara el commit al que dice corresponder a sus bytes", (t) => {
  exigirFuente(t, "la deriva declarada");
  for (const name of VENDORED) {
    assert.ok(existsSync(join(kernelDir, name)), `core/kernel/${name} no está vendorizado, y no hay encabezado que leer`);
    const [, declared] = header(name)[1].match(/commit ([0-9a-f]{7,40})\b/);
    assert.ok(
      body(name).equals(fromSourceCommit(declared, name)),
      `core/kernel/${name} declara el commit ${declared} y sus bytes no son los de ese commit`,
    );
  }
});

test("quitar el encabezado deja los bytes que SOURCE.md publica", () => {
  for (const name of VENDORED) {
    const row = rows.get(name);
    assert.ok(row, `SOURCE.md no publica ${name}`);
    const bytes = body(name);
    assert.equal(bytes.length, row.bytes, `core/kernel/${name}: el tamaño tras el encabezado no es el publicado`);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), row.digest, `core/kernel/${name}: la huella tras el encabezado no es la publicada`);
  }
});

test("los bytes tras el encabezado son los del commit fuente, leídos de Git", (t) => {
  exigirFuente(t, "los bytes frente al commit");
  for (const name of VENDORED) {
    assert.ok(
      body(name).equals(fromSourceCommit(PINNED_COMMIT, name)),
      `core/kernel/${name}: tras el encabezado no están los bytes de ${short}:src/${name}`,
    );
  }
});

test("la afirmación pública nombra cada módulo del corte", () => {
  const skill = claims[1][1];
  assert.ok(
    [...skill.matchAll(COMMIT_CLAIM)].some(([, commit]) => PINNED_COMMIT.startsWith(commit)),
    `SKILL.md no nombra el commit ${short}`,
  );
  for (const name of VENDORED) {
    assert.ok(skill.includes(`\`${name}\``), `SKILL.md no nombra ${name}`);
  }
});

// H18: el salto tiene que ser visible y con su razón, y en CI tiene que ser un fallo. Esta
// prueba no depende de si la fuente está o no: mira cómo el archivo se comporta.
test("H18: la procedencia dice que no se verificó, con su razón, y en CI el salto es un fallo", async () => {
  const propio = import.meta.url;
  const fuente = readFileSync(fileURLToPath(propio), "utf8");
  assert.ok(fuente.includes('"procedencia NO verificada contra Git"'),
    "el archivo declara la marca que la suite imprime cuando no verifica contra Git");
  assert.equal((fuente.match(/^  exigirFuente\(t, /gm) ?? []).length, 3,
    "las tres comprobaciones que necesitan Git pasan por la misma guarda");
  assert.equal((fuente.match(/t\.skip\(motivo\)/g) ?? []).length, 1,
    "el unico salto del archivo es el de la guarda, que declara el motivo antes de saltar");
  assert.match(fuente, /process\.env\.CI === "true"/,
    "en CI la falta de la fuente canonica es un fallo, no un salto");
});

test("H18b: sin la fuente canonica el salto dice su motivo, y en CI es un fallo", async () => {
  const { exigirFuente } = await import("./vespi-kernel-provenance.test.mjs");
  const dicho = [];
  const t = {
    diagnostic: (motivo) => dicho.push(["diagnostic", motivo]),
    skip: (motivo) => { dicho.push(["skip", motivo]); return "skip"; },
  };
  assert.equal(exigirFuente(t, "los bytes frente al commit", { hayFuente: false, esCI: false }), "skip");
  assert.deepEqual(dicho.map(([k]) => k), ["diagnostic", "skip"], "el motivo se dice antes de saltarse");
  for (const [, motivo] of dicho) assert.match(motivo, /procedencia NO verificada contra Git/, motivo);
  assert.match(dicho[1][1], /los bytes frente al commit/, "el motivo nombra que comprobacion se quedo sin correr");

  assert.throws(() => exigirFuente(t, "los bytes frente al commit", { hayFuente: false, esCI: true }),
    /procedencia NO verificada contra Git/,
    "en CI la falta de la fuente canonica es un fallo, no un salto");
  assert.equal(exigirFuente(t, "los bytes frente al commit", { hayFuente: true, esCI: true }), true,
    "con la fuente canonica a mano, la guarda no dice nada");
});
