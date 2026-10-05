import { createRequire } from "node:module";

// S3v2 requisito 6 — el frontmatter de un SKILL.md, leido por un parser de YAML de verdad.
//
// Por que este archivo existe: el `description` es lo unico que el host lee antes de decidir si
// carga una skill (el cuerpo no se lee nunca antes de esa decision), asi que el `description` es el
// disparador y su sintaxis es la del kit. Un intento anterior escribio un `description` con dos
// puntos internos y sin comillas —`campo: same: strain: ...`—: el host que parsea YAML recibe una
// linea que no es un escalar plano y la skill deja de existir para el discovery, sin error visible
// en ningun lado del repositorio. La prueba que lo habria tomado no existia, porque extracia el
// texto con una expresion regular; una regex no falla, devuelve lo que le parece.
//
// Este paquete se publica sin dependencias, y no se puede instalar una en la maquina de quien lo
// usa, asi que el parser propio va aqui. Es un subconjunto estricto y lo dice: lo que no cubre lo
// rechaza con un error, nunca lo adivina. Un frontmatter que este parser no entiende es un
// frontmatter que nadie va a entender despues en el host.
//
// Cuando `yaml` o `js-yaml` se pueden resolver, mandan ellos: un parser de verdad le gana a uno
// escrito a mano, y el propio queda como autoprueba y como respaldo. Los dos errores se normalizan
// a la misma forma, con el numero de linea, para que la falla se localize igual en cada maquina.

const require = createRequire(import.meta.url);

function resolverMotor() {
  for (const nombre of ["yaml", "js-yaml"]) {
    try {
      const mod = require(nombre);
      const parse = mod.parse ?? mod.load;
      if (typeof parse === "function") return { MOTOR: nombre, parse };
    } catch {
      // No esta: se sigue con el siguiente, y si no hay ninguno, con el parser propio.
    }
  }
  return { MOTOR: "propio", parse: null };
}

const encontrado = resolverMotor();
export const MOTOR = encontrado.MOTOR;

// El error de todos los caminos, con la linea. Sin numero de linea el error obliga a buscar a
// mano en un archivo que puede pesar 60 KB, y un fallo de sintaxis que no se localiza no se
// repara el mismo dia.
export class YamlFrontmatterError extends Error {
  constructor(mensaje, linea) {
    super(linea === null ? `YAML inválido: ${mensaje}` : `YAML inválido en la línea ${linea}: ${mensaje}`);
    this.name = "YamlFrontmatterError";
    this.linea = linea;
  }
}

const plano = (s) => String(s).replace(/\r\n/g, "\n");

// El cierre del frontmatter: una linea que es exactamente `---`. Un `---` que aparece adentro,
// en un escalar literal, no cierra nada; por eso se busca por linea y no por subcadena.
const CIERRE = /^---[ \t]*$/;

function abrir(texto) {
  const t = plano(texto);
  if (!t.startsWith("---\n")) {
    throw new YamlFrontmatterError("el archivo no abre con un frontmatter `---` en la primera linea", 1);
  }
  const lineas = t.split("\n");
  const cierre = lineas.findIndex((l, i) => i > 0 && CIERRE.test(l));
  if (cierre === -1) {
    throw new YamlFrontmatterError("el frontmatter abre pero nunca cierra con `---`", lineas.length);
  }
  return {
    lineas: lineas.slice(1, cierre),
    cuerpo: lineas.slice(cierre + 1).join("\n"),
  };
}

// Lo que este parser no cubre, dicho en voz alta en vez de devuelto como texto raro: un frontmatter
// de skill es un mapeo plano de una linea por clave, y cualquier otra cosa es un error de forma.
const SIN_CUBRIR = /^[?:]\s|^-\s|^[\[\]{}&*!|>%@`]/;

// Un escalar plano puede seguir en las lineas indentadas siguientes, y YAML las pliega con un
// espacio. No se puede ignorar eso: el `description` roto de S3 estaba partido en dos lineas, y sin
// continuacion el parser senalaria «linea indentada sin clave» en vez del dos puntos —la misma
// linea, pero la causa mal dicha, que es como se pierde media hora mirando el archivo equivocado.
function continuacion(lineas, i, desde) {
  const partes = [];
  let j = desde;
  while (j < lineas.length) {
    const l = lineas[j];
    if (l.trim() === "" || !/^[ \t]/.test(l)) break;
    partes.push({ n: j + 2, t: l.trim() });
    j += 1;
  }
  return { partes, siguiente: partes.length ? j : i };
}

function escalarPlano(partes) {
  const valor = partes
    .map((p) => p.t.replace(/[ \t]+#.*$/, "").trim()) // ` #` abre comentario; `#` pegado al texto no
    .join(" ")
    .trim();
  if (valor === "") return null;
  if (SIN_CUBRIR.test(valor)) {
    throw new YamlFrontmatterError(
      `tipo de escalar que este parser no cubre: \`${valor.slice(0, 40)}\``,
      partes[0].n,
    );
  }
  // El defecto de S3, en su forma exacta: dos puntos con espacio en un escalar sin comillas no son
  // un escalar, son el principio de otra clave. YAML lo rechaza y este parser tambien — y senala la
  // linea donde esta el dos puntos, que no siempre es la primera del escalar.
  if (/:\s/.test(valor) || /:$/.test(valor)) {
    const culpable = partes.find((p) => /:\s/.test(p.t) || /:$/.test(p.t)) ?? partes[0];
    throw new YamlFrontmatterError(
      `escalar sin comillas con \`:\` dentro: \`${valor.slice(0, 60)}\`; entrecomillalo o usá un bloque \`>-\``,
      culpable.n,
    );
  }
  return valor;
}

const ESCAPES = { n: "\n", t: "\t", r: "\r", '"': '"', "\\": "\\", "/": "/", "0": "\0" };

function escalarComillado(bruto, numero) {
  const comilla = bruto[0];
  let i = 1;
  let salida = "";
  while (i < bruto.length) {
    const c = bruto[i];
    if (comilla === '"' && c === "\\") {
      const siguiente = bruto[i + 1];
      if (siguiente === "u") {
        salida += String.fromCharCode(parseInt(bruto.slice(i + 2, i + 6), 16));
        i += 6;
        continue;
      }
      if (!(siguiente in ESCAPES)) {
        throw new YamlFrontmatterError(`escape desconocido \\${siguiente}`, numero);
      }
      salida += ESCAPES[siguiente];
      i += 2;
      continue;
    }
    if (c === comilla) {
      if (comilla === "'" && bruto[i + 1] === "'") {
        salida += "'";
        i += 2;
        continue;
      }
      const cola = bruto.slice(i + 1).trim();
      assertSoloComentario(cola, numero, "despues de un escalar entrecomillado");
      return salida;
    }
    salida += c;
    i += 1;
  }
  throw new YamlFrontmatterError("escalar entrecomillado que nunca cierra", numero);
}

function assertSoloComentario(cola, numero, donde) {
  if (cola === "" || cola.startsWith("#")) return;
  throw new YamlFrontmatterError(`contenido ${donde} el valor: \`${cola.slice(0, 40)}\``, numero);
}

// `|` literal y `>` plegado, con los tres finales que YAML define: `-` quita todos los saltos del
// final, `+` los deja todos, y sin indicador queda exactamente uno.
function escalarBloque(lineas, i, indicador, chomping, sangriaExplicita) {
  const recolectadas = [];
  let j = i;
  let sangria = sangriaExplicita === 0 ? null : sangriaExplicita;
  while (j < lineas.length) {
    const l = lineas[j];
    if (l.trim() === "") {
      recolectadas.push("");
      j += 1;
      continue;
    }
    const actual = l.length - l.trimStart().length;
    if (sangria === null) {
      if (actual === 0) break; // la clave siguiente: el bloque termino
      sangria = actual;
    }
    if (actual < sangria) break;
    recolectadas.push(l.slice(sangria));
    j += 1;
  }
  while (recolectadas.length && recolectadas[recolectadas.length - 1] === "") recolectadas.pop();

  const plegado = indicador === ">";
  let texto;
  if (plegado) {
    const parrafos = [];
    let actual = [];
    for (const l of recolectadas) {
      if (l === "") {
        parrafos.push(actual.join(" "));
        actual = [];
      } else actual.push(l);
    }
    parrafos.push(actual.join(" "));
    texto = parrafos.join("\n");
  } else {
    texto = recolectadas.join("\n");
  }

  if (chomping === "-") return { valor: texto, siguiente: j };
  if (chomping === "+") return { valor: `${texto}\n`, siguiente: j };
  return { valor: texto === "" ? "" : `${texto}\n`, siguiente: j };
}

// El parser del kit. Plano, un mapeo de una linea por clave, escalares planos, entrecomillados y
// de bloque. Lo demas se rechaza con el numero de linea.
export function parseFrontmatterPropio(texto) {
  const { lineas, cuerpo } = abrir(texto);
  const data = {};
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    const numero = i + 2; // +1 por la linea de apertura, +1 porque es 1-based
    if (linea.trim() === "" || linea.trimStart().startsWith("#")) {
      i += 1;
      continue;
    }
    if (/^[ \t]/.test(linea)) {
      throw new YamlFrontmatterError(
        `linea indentada sin clave que la sostenga: \`${linea.trim().slice(0, 40)}\``,
        numero,
      );
    }
    const clave = linea.match(/^([A-Za-z_][A-Za-z0-9_.-]*)[ \t]*:(.*)$/);
    if (!clave) {
      throw new YamlFrontmatterError(
        `no es una clave de frontmatter: \`${linea.slice(0, 40)}\``,
        numero,
      );
    }
    const [, nombre, resto] = clave;
    if (Object.hasOwn(data, nombre)) {
      throw new YamlFrontmatterError(`clave repetida: \`${nombre}\``, numero);
    }

    const bruto = resto.trim();
    if (bruto === "") {
      data[nombre] = null;
      i += 1;
      continue;
    }
    if (bruto[0] === ">" || bruto[0] === "|") {
      const m = bruto.match(/^([>|])([+-]?)([1-9]?)[ \t]*(#.*)?$/);
      if (!m) {
        throw new YamlFrontmatterError(`indicador de bloque inválido: \`${bruto}\``, numero);
      }
      const { valor, siguiente } = escalarBloque(
        lineas,
        i + 1,
        m[1],
        m[2] === "" ? "clip" : m[2],
        m[3] === "" ? 0 : Number(m[3]),
      );
      data[nombre] = valor;
      i = siguiente;
      continue;
    }
    if (bruto[0] === '"' || bruto[0] === "'") {
      data[nombre] = escalarComillado(bruto, numero);
      i += 1;
      continue;
    }
    const { partes, siguiente } = continuacion(lineas, i + 1, i + 1);
    data[nombre] = escalarPlano([{ n: numero, t: bruto }, ...partes]);
    i = siguiente;
  }
  return { data, cuerpo };
}

// El punto de entrada. Con `yaml` o `js-yaml` manda el paquete; sin ellos, el parser propio. En
// ambos caminos el error sale con la misma forma, y para hallar la línea se la pide al parser
// propio: el mensaje de la librería no la trae, y el número de línea es lo que hace falta para
// reparar.
export function parseFrontmatter(texto) {
  if (!encontrado.parse) return parseFrontmatterPropio(texto);
  const { lineas, cuerpo } = abrir(texto);
  try {
    return { data: encontrado.parse(lineas.join("\n")), cuerpo };
  } catch (error) {
    try {
      parseFrontmatterPropio(texto);
    } catch (propio) {
      if (propio instanceof YamlFrontmatterError) throw propio;
    }
    throw new YamlFrontmatterError(error.message, null);
  }
}
