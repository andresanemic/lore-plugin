import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// S3v2 requisito 6 — el instrumento que valida el frontmatter tiene que poder fallar.
//
// El intento anterior (S3, guardado en `git stash list`) dejo los `description` con dos puntos
// internos sin comillas ni bloque —`campo: same: strain: ...`—, y eso rompe el parseo de YAML. La
// prueba que lo habria tomado no existia: extraia el texto con una expresion regular y nunca
// se lo mostraba a un parser. Estas pruebas son la autoprueba del parser, con la forma rota exacta
// de S3 como caso: un validador que nunca rechaza nada no es un validador, y esta suite lo
// demuestra en vez de suponerlo.
//
// Dos motores, y por que: este paquete se publica sin dependencias (`package.json` no declara
// ninguna y `files` no incluye `node_modules/`), asi que `yaml` y `js-yaml` no se pueden instalar
// como requisito. Cuando alguno de los dos se puede resolver, `parseFrontmatter` lo usa —un
// parser de verdad beats uno escrito a mano— y este archivo lo dice en la salida. Cuando no,
// entra el parser propio, y las pruebas de abajo lo ejercitan de todos modos, en cada corrida y
// en cada maquina, para que el respaldo no se pudra.

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODULO = () => import("./yaml-frontmatter.mjs");
const leer = (rel) => readFileSync(join(root, rel), "utf8");

// La forma rota que S3 dejo en `skills/vespi/SKILL.md`, copiada del stash y no del archivo vivo:
// asi esta autoprueba no depende de que el defecto vuelva.
const ROTO_DE_S3 = [
  "---",
  "name: vespi",
  "description: Use when the person says the shape of the work is at risk rather than missing — \"esto me está",
  "  complicando\", \"sigamos mañana\" — or when countable signals say the same: a compaction, a change of host.",
  "  The form already exists and is under strain: hold the current route, revalidate before continuing.",
  "---",
  "",
  "# Vespi",
].join("\n");

test("0a: el motor se declara, para que la salida diga que se midio", async () => {
  const { MOTOR } = await MODULO();
  assert.ok(["yaml", "js-yaml", "propio"].includes(MOTOR), `motor desconocido: ${MOTOR}`);
  console.log(`      [S3v2] frontmatter validado con el motor: ${MOTOR}`);
});

test("0b: un mapeo plano con escalares sin comillas se lee", async () => {
  const { parseFrontmatter } = await MODULO();
  const r = parseFrontmatter("---\nname: vespi\ndescription: Use when a task is under strain\n---\n\n# Vespi\n");
  assert.equal(r.data.name, "vespi");
  assert.equal(r.data.description, "Use when a task is under strain");
  assert.equal(r.cuerpo.trim(), "# Vespi");
});

test("0c: el escalar plegado '>-' une sus lineas con espacios", async () => {
  const { parseFrontmatter } = await MODULO();
  const r = parseFrontmatter([
    "---",
    "name: brainstorming-lore",
    "description: >-",
    "  Use only when designing or materially changing an artifact owned",
    "  by the Lore system: a Lore body or module, work area.",
    "---",
    "",
    "cuerpo",
  ].join("\n"));
  assert.equal(
    r.data.description,
    "Use only when designing or materially changing an artifact owned by the Lore system: a Lore body or module, work area.",
  );
});

test("0d: el escalar literal '|-' conserva los saltos de linea y quita el ultimo", async () => {
  const { parseFrontmatter } = await MODULO();
  const r = parseFrontmatter("---\nname: x\ndescription: |-\n  uno\n  dos\n---\n");
  assert.equal(r.data.description, "uno\ndos");
});

test("0e: un escalar con comillas se lee sin las comillas y con sus escapes", async () => {
  const { parseFrontmatter } = await MODULO();
  const r = parseFrontmatter('---\nname: x\ndescription: "Use when \\"no se como\\" arrives"\n---\n');
  assert.equal(r.data.description, 'Use when "no se como" arrives');
  const s = parseFrontmatter("---\nname: x\ndescription: 'Use when it''s quoted'\n---\n");
  assert.equal(s.data.description, "Use when it's quoted");
});

test("1: la forma rota de S3 se rechaza, y el error dice la linea", async () => {
  const { parseFrontmatter } = await MODULO();
  assert.throws(
    () => parseFrontmatter(ROTO_DE_S3),
    (e) => {
      assert.match(e.message, /YAML/);
      assert.match(e.message, /línea 3|línea 4/, `el error no localiza la linea: ${e.message}`);
      return true;
    },
    "el parser acepto el `campo: same: strain:` sin comillas de S3, que es el defecto entero",
  );
});

test("1b: un escalar plano que termina en ':' tambien se rechaza", async () => {
  const { parseFrontmatter } = await MODULO();
  assert.throws(() => parseFrontmatter("---\nname: x\ndescription: Use when:\n---\n"), /YAML/);
});

test("1c: un escalar plano con '#' al final es comentario, y el valor es lo de antes", async () => {
  const { parseFrontmatter } = await MODULO();
  const r = parseFrontmatter("---\nname: x\ndescription: Use when a  # nota al final\n---\n");
  assert.equal(r.data.description, "Use when a");
});

test("1d: lo que el parser no entiende lo dice, en vez de adivinar", async () => {
  const { parseFrontmatter } = await MODULO();
  // Una secuencia de nivel superior no es el frontmatter de una skill. Un parser que la leyera
  // como texto plano devolveria un `data` sin `description` y el fallo apareceria dos archivos
  // mas adelante, en el host.
  assert.throws(() => parseFrontmatter("---\n- name: vespi\n---\n"), /YAML/);
  // Un mapeo anidado tambien: este frontmatter es de una linea por clave.
  assert.throws(() => parseFrontmatter("---\nname: x\nmeta:\n  owner: y\n---\n"), /YAML/);
  // Y un escalar con un indicador inicial es un tipo que este parser no cubre.
  assert.throws(() => parseFrontmatter("---\nname: x\ndescription: [a, b]\n---\n"), /YAML/);
});

test("1e: un archivo sin frontmatter se rechaza con un mensaje que lo dice", async () => {
  const { parseFrontmatter } = await MODULO();
  assert.throws(() => parseFrontmatter("# Vespi\n\ncuerpo"), /frontmatter/);
});

test("2: los finales de linea CRLF no cambian lo que se lee", async () => {
  const { parseFrontmatter } = await MODULO();
  const lf = parseFrontmatter("---\nname: x\ndescription: Use when a\n---\n\ncuerpo\n");
  const crlf = parseFrontmatter("---\r\nname: x\r\ndescription: Use when a\r\n---\r\n\r\ncuerpo\r\n");
  assert.deepEqual(crlf.data, lf.data);
  assert.equal(crlf.cuerpo, lf.cuerpo);
});

test("3: el parser propio lee las tres SKILL.md del reparto, y no las tres solo", async () => {
  // El respaldo se ejercita siempre, sin importar que motor haya salido: un respaldo que solo
  // corre cuando falta la libreria es un respaldo que nadie llega a ver fallar.
  const { parseFrontmatterPropio } = await MODULO();
  for (const skill of ["use-lore", "brainstorming-lore", "vespi"]) {
    const r = parseFrontmatterPropio(leer(join("skills", skill, "SKILL.md")));
    assert.equal(r.data.name, skill, `${skill}: el name del frontmatter no es el de la carpeta`);
    assert.equal(typeof r.data.description, "string");
    assert.ok(r.data.description.length > 40, `${skill}: la description llego vacia o cortada`);
    assert.ok(r.cuerpo.length > 500, `${skill}: el cuerpo no quedo separado del frontmatter`);
  }
});

test("3b: donde hay dos motores, los dos dicen lo mismo sobre las tres skills", async (t) => {
  const { MOTOR, parseFrontmatter, parseFrontmatterPropio } = await MODULO();
  if (MOTOR === "propio") {
    t.skip("no hay yaml ni js-yaml resolubles en esta maquina: solo corre el parser propio");
    return;
  }
  for (const skill of ["use-lore", "brainstorming-lore", "vespi"]) {
    const texto = leer(join("skills", skill, "SKILL.md"));
    assert.deepEqual(
      parseFrontmatter(texto).data,
      parseFrontmatterPropio(texto).data,
      `${skill}: ${MOTOR} y el parser propio no leen lo mismo`,
    );
  }
});
