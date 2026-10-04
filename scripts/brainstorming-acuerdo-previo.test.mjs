import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = join(root, "skills", "brainstorming-lore", "SKILL.md");
const leer = () => readFileSync(skillPath, "utf8").replace(/\r\n/g, "\n");

// Medición previa a la incorporación de la guía (encargo R5, 2026-10-04, antes de tocar el
// archivo): 18148 B y 302 líneas con CRLF normalizado a LF. Las dos cifras están escritas, no
// calculadas: si una cambia, alguien lo decide. Es `principios.md` #24 aplicado a un archivo que
// se carga siempre — lo que entra paga con texto que sale, y el saldo se mira en rojo.
const BYTES_ANTES = 18148;
const LINEAS_ANTES = 302;
const TECHO_SECCION = 1600;

// El `description` es lo que decide el disparo de la skill en los tres hosts, y este encargo no lo
// toca. Se guarda la huella del bloque entero: si alguien lo reescribe, esta prueba dice quién.
const FRONTMATTER_ANTES = "e4a2561f7268aae15afb24e10466dafbb28a14b7438e1f496c02e7c6a5a0bfff";

function seccion(texto) {
  const cabecera = texto.match(/^### The prior agreement [^\n]*$/m);
  assert.ok(cabecera, "brainstorming-lore no tiene la sección del acuerdo previo");
  const resto = texto.slice(cabecera.index + cabecera[0].length);
  const fin = resto.search(/^#{2,3} /m);
  return (fin === -1 ? resto : resto.slice(0, fin)).trim();
}

test("la guía del acuerdo previo se ofrece con sus propias palabras y no se impone", () => {
  const s = seccion(leer());
  // «Con sus palabras»: el encabezado y el cuerpo lo dicen de dos maneras distintas, para que
  // podar uno de los dos no borre el ofrecimiento.
  assert.match(leer(), /^### The prior agreement — offered, never imposed$/m, "el encabezado no declara que se ofrece");
  assert.match(s, /offer of shape, not a requirement/i, "falta decir que es una oferta y no un requisito");
  assert.match(s, /stays optional/i, "falta la salida: la guía se puede Declinear");
  // Caso adversarial: la forma que se convierte en lista de verificación es ceremonia, y la propia
  // guía lo dice — es lo que impide que un esqueleto se vuelva un checklist que nadie decide.
  assert.match(s, /checklist is ceremony/i);
  assert.doesNotMatch(s, /you must|must be|always do|required to/i, "la guía se volvió imperativa");
});

test("la guía nombra la reserva de sorpresa y la enmienda fechada", () => {
  const s = seccion(leer());
  assert.match(s, /surprise reserve/i);
  assert.match(s, /execution, not the idea/i, "la reserva tiene que ser la ejecución, no la idea");
  assert.match(s, /dated amendment/i);
  assert.match(s, /not reopened on the agent'?s own initiative/i, "falta lo aprobado no se reabre por iniciativa propia");
  assert.match(s, /never [\s\S]{0,30}silence/i, "una enmienda en silencio no es una enmienda");
});

test("la guía fija el eje del acuerdo y sus dos cierres antes de construir", () => {
  const s = seccion(leer());
  assert.match(s, /one point per message/i, "falta la conversación de a un punto");
  assert.match(s, /one question/i);
  assert.match(s, /recommended option with the risk/i, "falta la opción recomendada con su riesgo dicho");
  assert.match(s, /before anything is built/i, "el acuerdo se escribe antes de construir");
  assert.match(s, /\*\*why\*\*[^*]*heart/i, "falta el eje porqué con su corazón");
  assert.match(s, /\*\*what\*\*[^*]*lineage/i, "falta el eje qué con su herencia");
  assert.match(s, /\*\*how\*\*[^*]*material/i, "falta el eje cómo con su materia");
  assert.match(s, /hard limits/i, "faltan los límites duros");
  assert.match(s, /agreed pruning/i, "falta la poda acordada");
  assert.match(s, /first look[\s\S]{0,60}without the numbers/i, "falta la primera mirada sin cifras");
});

test("la guía viene marcada como conjetura, con su ascenso y su refutación", () => {
  const s = seccion(leer());
  // save-to-lore: una `conjecture` se escribe con su condición de ascenso, en la misma entrada.
  assert.match(s, /`conjecture`/);
  assert.match(s, /one origin/i, "falta el origen del que sale");
  assert.match(s, /no replication/i, "una conjetura sin replicar no dice que no se ha replicado");
  assert.match(s, /ascends when [\s\S]{0,140}\bno\b/i, "falta la condición de ascenso");
  assert.match(s, /refuted when/i, "falta la condición de refutación");
});

test("los bloques de dominio del ritual de origen no viajan con la guía", () => {
  const s = seccion(leer());
  for (const bloque of [/fisura/i, /RUC-?D/i, /instantánea futura/i, /maestros/i, /constelación/i, /pok[eé]mon/i]) {
    assert.doesNotMatch(s, bloque, `la guía arrastró un bloque del dominio de origen: ${bloque}`);
  }
});

test("el archivo no crece respecto de su tamaño inicial", () => {
  // Se mide antes de mirar la sección: si el peso se pasara, tiene que decirse solo, sin que el
  // fallo de la sección nueva lo tape.
  const texto = leer();
  const total = Buffer.byteLength(texto, "utf8");
  const lineas = texto.split("\n").length - 1;
  assert.ok(total <= BYTES_ANTES, `el archivo creció: ${total} B contra ${BYTES_ANTES} B antes`);
  assert.ok(lineas <= LINEAS_ANTES, `el archivo creció: ${lineas} líneas contra ${LINEAS_ANTES} antes`);
});

test("la sección nueva cabe en su techo", () => {
  const bytes = Buffer.byteLength(seccion(leer()), "utf8");
  assert.ok(bytes <= TECHO_SECCION, `la sección ocupa ${bytes} B y el techo son ${TECHO_SECCION}`);
});

test("el frontmatter de brainstorming-lore sigue siendo el de antes de la guía", () => {
  const texto = leer();
  const fin = texto.indexOf("\n---\n", 4) + 5;
  const huella = createHash("sha256").update(texto.slice(0, fin)).digest("hex");
  assert.equal(huella, FRONTMATTER_ANTES, "el `description` cambió: la guía no podía tocarlo");
});
