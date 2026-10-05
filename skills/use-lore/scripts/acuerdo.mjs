// El acuerdo de trabajo - Lore Plugin.
//
// Un acuerdo no es un menu ni una ceremonia: es la manera en que la persona y el kit van a
// trabajar durante un trabajo que dura mas de una sesion. Este modulo no redacta su prosa -eso
// es del agente- sino que sostiene lo que si es un hecho verificable:
//
//   > que el acuerdo tiene que pasar por TRES PUERTAS juntas antes de existir (recapitulacion
//     completa de la IA, aprobacion explicita de la persona, y quedar escrito antes de
//     construir); le faltan dos, no existe;
//   > que se ofrece, nunca se impone: sin acuerdo el kit opera igual, con los defectos;
//   > que las perillas tienen vocabulario cerrado y valores por defecto documentados, para que
//     "cercana" siga significando lo mismo en la sesion treinta;
//   > que lo que cambia despues entra como enmienda FECHADA y se agrega, y lo anterior no se
//     reescribe nunca - un acuerdo que se corrige a escondidas no es un acuerdo;
//   > y que el trabajo NO DEPENDE de un acuerdo: si una apuesta cae, se sigue.
//
// El documento `acuerdo.md` vive en la raiz del arbol, junto a `FASES.md` y no dentro de
// `lore/`: es una decision de la persona sobre un trabajo, no criterio que deba heredarse ni
// recorrer el indice. El estado legible por maquina va aparte, en `.lore-acuerdo`, por la misma
// razon que `.lore-mycelium`: el documento se agrega y no se toca; el recibo se reescribe.
//
// Tres decisiones de este modulo nacieron de una revision que le encontro seis defectos a un
// intento anterior, y cada una esta comentada donde vive porque el error que previene es el que
// volveria si alguien la "simplifica":
//
//   1. `aprobado` es un campo booleano explicito. Sin el, el aviso de actualizacion escribia un
//      recibo con la forma de un acuerdo y `leer()` lo devolvia: preguntar "hay acuerdo" después
//      de avisar contestaba que si.
//   2. `registrar` mira antes de escribir. Un acuerdo que se reescribe pierde para siempre la
//      recapitulacion de la persona, que es la puerta que no se puede volver a pasar.
//   3. Una enmienda sin fecha, o con `saca` y `agrega` aplicados los dos desde la lista original,
//      o con los limites renderizados como `[object Object]`, es una enmienda que pierde
//      informacion. Las tres se comprueban.

import { createHash } from "node:crypto";
import { appendFileSync, existsSync, lstatSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ACUERDO = "acuerdo.md";
export const RECIBO = ".lore-acuerdo";

// La version que trae el acuerdo. Coincide con `package.json` desde que 2.4.9 se publica; el aviso a quien actualiza
// sigue siendo sobre la pieza, no sobre el bump.
export const ACTUAL = "2.4.9";

// Vocabulario cerrado. Un valor fuera de estas listas no es una eleccion: es un error visible,
// porque un "carinosa" que solo existe en una sesion no es un registro.
export const INTENSIDADES = ["sobria", "cercana"];
export const RITMOS = ["despacio", "normal", "rapido"];
export const DEFECTO = { intensidad: "cercana", ritmo: "normal" };

// LAS CUATRO APUESTAS DEL ACUERDO, con sus palabras exactas. No son del aparato: son del
// comportamiento que se supone que el kit tiene, y por eso pueden caer sin que el trabajo pare.
//
// Estas cuatro, y solo estas cuatro. "El acuerdo nunca se impone" NO esta aqui: es una regla dura
// de "lo que no se mueve sin la palabra de la persona" (abajo), y por eso no degrada nunca.
// Confundir las dos cosas es el defecto que esta lista existe para que no se repita.
export const APUESTAS = [
  {
    id: "frases-cotidianas",
    texto: "Que las frases cotidianas alcancen para repartir el trabajo entre las tres skills.",
    // Al caer: la frase ya no alcanza a la skill, y se pregunta. Falla hacia la pregunta.
    por: "sin-frases",
  },
  {
    id: "recordatorio-por-hook",
    texto: "Que el recordatorio por hook sostenga el registro turno a turno.",
    // Al caer: no hay recordatorio por turno, y el registro se guarda a mano en FASES.md.
    por: "sin-hook",
  },
  {
    id: "avisar-sin-bloquear",
    texto: "Que OpenCode permita avisar sin bloquear.",
    // Al caer: el aviso no se puede emitir suelto, y queda disponible para acompanar lo que el
    // kit ya vaya a decir. Sigue sin bloquear, porque bloquear nunca fue la apuesta.
    por: "sin-aviso-directo",
  },
  {
    // La cuarta. Estaba ausente de la lista entera, con su texto y su `por`: el acuerdo la
    // declara y sin ella el kit se pasaba una cuenta que el propio acuerdo le hacia.
    id: "leer-uso-de-la-sesion",
    texto: "Que cada host deje leer el uso de la sesión; donde no, se usan las señales contables y se declara por escrito.",
    // Al caer: el host no deja leer el uso de la sesion, y quedan las SENALES CONTABLES -una
    // compactacion, muchos turnos- que ademas hay que DECLARAR por escrito, porque contarlas
    // como si fueran el uso seria mentirle a la persona sobre lo que el kit sabe.
    por: "senales-contables",
  },
];


const APUESTA_POR_ID = new Map(APUESTAS.map((a) => [a.id, a]));

// Lo que no se mueve sin la palabra de la persona. NO es una apuesta: es la palabra. Nada de lo
// que hay aqui degrada cuando cae una apuesta, y por eso se lista aparte.
//
// CRUZAR cualquiera de estas detiene el kit. Son cinco, y son las cinco del acuerdo con ese signo.
const NO_SE_MUEVE = [
  "congelar-una-version",
  "publicar-una-version",
  "escribir-criterio-fuera-de-la-skill",
  "imponer-el-acuerdo",
  "usar-el-modelo-mas-caro-por-defecto",
];

// Lo que el acuerdo declara como regla dura que SIGUE vigente, y que por eso NO detiene nada.
//
// La sexta frase de la misma lista del acuerdo -"La guardia registra escrituras en el árbol de otra persona y el permiso del host decide si avanzan"-
// tiene el signo contrario a las otras cinco: la guardia registra la escritura y el permiso del
// host decide si avanza. No es una condición de parada; la gobernanza propietaria sigue vigente.
const SIGUE_DENTRO = ["anotar-escrituras-ajenas"];

// Un numero de version no es una familia. La ley que lo pide tiene una razon concreta: un bump
// del proveedor dejaba a la gente clavada en un modelo legacy por un pin que nadie iba a
// revisar. `gpt-5` tiene digitos y es una familia; `4.5.1` es una version.
const ES_VERSION = /^v?\d+(?:\.\d+)*$/i;
// El mismo defecto pegado del lado del nombre: `4.5.1` entero lo agarraba la regla de arriba, y
// `opus-4.5.1` se escapaba. Es la misma version,=colgada de otra manera.
const VERSION_PEGADA = /[-_ ]v?\d+(?:\.\d+)+/i;
const ES_IDENTIFICADOR = /^[a-z0-9][a-z0-9-]*$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

// Las familias que este kit reconoce. La familia de un limite es un IDENTIFICADOR -el nombre que
// el proveedor da a la linea de modelos-, no una frase con la version pegada al lado. Sin lista,
// "opus-4.5.1" pasaba por familia y el limite quedaba clavado en una version que nadie revisa: que
// es justo lo que la ley del acuerdo quiere que no pase. Es el tercer vocabulario cerrado del
// acuerdo, junto a intensidad y ritmo, y crece aqui cuando la persona nombr una familia nueva.
export const FAMILIAS = [
  "opus", "sonnet", "haiku", "claude",
  "gpt", "o1", "o3",
  "gemini", "flash",
  "llama", "mistral", "grok", "deepseek", "qwen", "kimi",
];

// Los dias de cada mes. Febrero se mira aparte, porque depende del ano.
const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const bisiesto = (ano) => (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;

// Una fecha es una fecha del CALENDARIO, no cuatro digitos con guiones. El patron solo aceptaba
// la forma y dejaba pasar `2026-99-99`, que es un mes que no existe: un limite temporal con esa
// fecha se caduca nunca, y una garantia que no caduca nunca no es una garantia. Se mira el mes, y
// el dia contra el mes -con el 29 de febrero solo en ano bisiesto-.
function fechaReal(valor) {
  if (typeof valor !== "string" || !FECHA.test(valor.trim())) return false;
  const [ano, mes, dia] = valor.trim().split("-").map(Number);
  if (mes < 1 || mes > 12 || dia < 1) return false;
  const ultimo = mes === 2 && bisiesto(ano) ? 29 : DIAS_POR_MES[mes - 1];
  return dia <= ultimo;
}

function familiaConocida(nombre) {
  if (!ES_IDENTIFICADOR.test(nombre)) return false;
  // `gpt-5` y `flash-preview` son una familia con su variante; la raiz es la que decide.
  return FAMILIAS.includes(nombre.split("-")[0].toLowerCase());
}

const caida = (acuerdo, apuesta) => (acuerdo?.apuestasCaidas ?? []).includes(apuesta);

function texto(valor, nombre) {
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new TypeError(`El limite necesita ${nombre}.`);
  }
  return valor.trim();
}

// --- 2. las perillas del primer acuerdo ---------------------------------------

function limite(entrada) {
  if (entrada === null || typeof entrada !== "object") {
    throw new TypeError("Un limite es un objeto con familia y nivel.");
  }
  // La version colgada al lado es el mismo error con otro nombre, y se nombra primero: el
  // mensaje tiene que decir cual de los dos problemas es.
  for (const llave of Object.keys(entrada)) {
    if (/^(?:version|versions|versiones?)$/i.test(llave)) {
      throw new TypeError("Un limite nombra familia y nivel, no una version.");
    }
  }

  const familia = texto(entrada.familia, "familia");
  if (ES_VERSION.test(familia)) {
    throw new TypeError(`«${familia}» es una version, no una familia: nombra la familia y el nivel.`);
  }
  // La misma version pegada del lado del nombre. Es la forma en que se colaba.
  if (VERSION_PEGADA.test(familia)) {
    throw new TypeError(
      `«${familia}» trae la version pegada al lado. Una familia se nombra sola -«opus»- y el nivel va aparte.`,
    );
  }
  // Y una familia que este kit no reconoce es un error visible, no un registro: un limite sobre
  // una familia inventada no protege de nada, y en tres meses nadie sabe que se quiso decir otra.
  if (!familiaConocida(familia)) {
    throw new TypeError(
      `«${familia}» no es una familia de modelo que este kit reconozca. Las que reconoce: ${FAMILIAS.join(", ")}.`,
    );
  }
  const nivel = texto(entrada.nivel, "nivel");
  const salida = { familia, nivel, nunca: entrada.nunca === true };

  // Lo que depende de algo temporal dice hasta cuando. Sin la fecha, un limite temporal es una
  // promesa sin plazo, que es como no decir nada; y con una fecha que no existe, es lo mismo con
  // la forma de fecha encima, que es peor porque parece que tiene plazo.
  if (entrada.temporal === true || entrada.vence !== undefined) {
    if (!fechaReal(entrada.vence)) {
      const recibido = entrada.vence === undefined ? "nada" : `«${String(entrada.vence)}»`;
      throw new TypeError(
        `Un limite temporal necesita su fecha de vencimiento (vence) como una fecha real -YYYY-MM-DD-; recibí ${recibido}.`,
      );
    }
    salida.temporal = true;
    // Se guarda recortada: fechaReal() valida entrada.vence.trim(), y guardar el original sin
    // recortar deja una fecha con espacios que la comparacion de vigente() hace por string -
    // " 2026-12-31 " ordena antes que "2026-09-28" porque el espacio pesa menos que el digito, y
    // un limite vigente parecia vencido (Codex, revision de S4v3).
    salida.vence = entrada.vence.trim();
  }
  return salida;
}

export function vigente(limite, hoy) {
  if (!limite?.vence) return true;
  // Sin el dia de hoy no se puede afirmar que algo vencio, y un limite es una restriccion que
  // puso la persona: perderla en silencio es el peor de los dos errores.
  if (!fechaReal(hoy)) return true;
  // Vence al FINAL del dia dicho: «hasta el 31» incluye el 31.
  return hoy <= limite.vence;
}

export function elegir({ porque, trabajo = null, intensidad, ritmo, cubre = [], limites = [] } = {}) {
  // El por que va primero porque la enmienda de RC4 lo exige: el acuerdo que ofrece el kit
  // empieza por el por que. Un acuerdo sin el no se puede redactar, y no es una puerta nueva -
  // es que el documento no tendria la gravedad que lo hace un acuerdo y no una lista de ajustes.
  const elPorque = typeof porque === "string" ? porque.trim() : "";
  if (elPorque === "") {
    throw new TypeError("El acuerdo empieza por el por que: sin el, no hay nada que acordar.");
  }
  if (intensidad !== undefined && !INTENSIDADES.includes(intensidad)) {
    throw new TypeError(`Intensidad desconocida: «${intensidad}». Vale ${INTENSIDADES.join(" o ")}.`);
  }
  if (ritmo !== undefined && !RITMOS.includes(ritmo)) {
    throw new TypeError(`Ritmo desconocido: «${ritmo}». Vale ${RITMOS.join(", ")}.`);
  }
  if (!Array.isArray(cubre) || !Array.isArray(limites)) {
    throw new TypeError("Las piezas cubiertas y los limites son listas.");
  }
  return {
    porque: elPorque,
    trabajo,
    intensidad: intensidad ?? DEFECTO.intensidad,
    ritmo: ritmo ?? DEFECTO.ritmo,
    cubre: [...cubre],
    limites: limites.map(limite),
    apuestas: APUESTAS.map((a) => a.id),
    apuestasCaidas: [],
    enmiendas: [],
  };
}

// Lo que se hace mientras la persona no contesta: el mismo trabajo, con los valores por defecto.
// Esto no es un modo deprecado - es el estado normal de quien nunca acepto un acuerdo, y por
// eso se llama por lo que hace y no por lo que le falta. Los limites del acuerdo que ya existe si
// se respetan, y los que ya vencieron no: la fecha los retira aunque el documento siga escrito.
export function sinAcuerdo(actual = null, hoy = null) {
  const base = typeof actual === "string" ? leer(actual) : actual;
  return {
    intensidad: INTENSIDADES.includes(base?.intensidad) ? base.intensidad : DEFECTO.intensidad,
    ritmo: RITMOS.includes(base?.ritmo) ? base.ritmo : DEFECTO.ritmo,
    cubre: [],
    limites: (base?.limites ?? []).filter((limite) => vigente(limite, hoy)),
    acordado: false,
  };
}

// --- 1. el primer uso ofrece, y ofrecer no bloquea ---------------------------

const POR_QUE_POR_DEFECTO = "Por que lo haces, en tus palabras.";

export function primeraVez({ raiz, trabajo } = {}) {
  const acuerdo = leer(raiz);
  if (acuerdo) return { ofrece: false, motivo: "ya-hay-acuerdo", acuerdo, porQue: acuerdo.porque };
  // El umbral es el del acuerdo: trabajo que tiene que durar mas de una sesion. Uno de una sola
  // sentada no lo necesita, y ofrecerlo ahi es ceremonia.
  if (!Number.isFinite(trabajo?.sesiones) || trabajo.sesiones <= 1) {
    return { ofrece: false, motivo: "trabajo-corto", acuerdo: null, porQue: null };
  }
  // Lo que se ofrece es el hueco del por que: el acuerdo empieza ahi, no por el qué.
  return {
    ofrece: true,
    motivo: "primer-uso",
    acuerdo: null,
    porQue: trabajo?.porque ?? POR_QUE_POR_DEFECTO,
  };
}

// --- 3. las tres puertas, y la escritura --------------------------------------

function leerRecibo(raiz) {
  if (!raiz) return null;
  try {
    const parsed = JSON.parse(readFileSync(join(raiz, RECIBO), "utf8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

// `opcional` es para lo que puede no tener donde escribirse: el rastro del aviso, que se calcula
// y se dice antes de que la carpeta destino exista. En los otros tres llamadores la escritura es
// parte del acto -sin `acuerdo.md` no hay acuerdo, sin recibo no hay estado- y ahi fallar en voz
// alta es lo correcto. Devuelve si pudo escribir, para que el que opciona lo diga.
function escribirRecibo(raiz, estado, { opcional = false } = {}) {
  if (!raiz) return false;
  const target = join(raiz, RECIBO);
  const temporal = join(raiz, `${RECIBO}.${process.pid}.tmp`);
  try {
    writeFileSync(temporal, `${JSON.stringify(estado, null, 2)}\n`);
    renameSync(temporal, target);
    return true;
  } catch (error) {
    if (!opcional) throw error;
    return false;
  } finally {
    if (existsSync(temporal)) unlinkSync(temporal);
  }
}

function linea(limite) {
  const hasta = limite.vence ? ` - never, until ${limite.vence}` : limite.nunca ? " - never" : "";
  return `- \`${limite.familia}\` at \`${limite.nivel}\`${hasta}`;
}

// Un valor se escribe como se lee. interpolated() con un objeto produce `[object Object]`, y una
// enmienda con `[object Object]` en el documento es una enmienda que no se puede auditar.
function valorLegible(valor) {
  if (Array.isArray(valor)) {
    return valor.map((uno) => valorLegible(uno)).join("`, `");
  }
  if (valor && typeof valor === "object") {
    if (valor.familia !== undefined && valor.nivel !== undefined) return linea(valor);
    return Object.entries(valor).map(([k, v]) => `${k}: ${valorLegible(v)}`).join(", ");
  }
  if (valor === true) return "sí";
  if (valor === false) return "no";
  return String(valor);
}

function documento(acuerdo, { recapitulacion, ahora }) {
  const titulo = acuerdo.trabajo ? `Agreement - ${acuerdo.trabajo}` : "Agreement";
  return [
    `# ${titulo}`,
    "",
    `Opened ${ahora}. Approved by the person before any building started.`,
    "",
    // EL POR QUE PRIMERO. Antes del qué y del cómo: es lo que le da gravedad al resto, y por
    // eso va en la primera sección del documento y no como un párrafo más abajo.
    "## Why - yours, in your own words",
    "",
    acuerdo.porque,
    "",
    "## The recap - the AI's own words, complete",
    "",
    recapitulacion,
    "",
    "## The dials",
    "",
    `- Intensity: \`${acuerdo.intensidad}\` (default \`${DEFECTO.intensidad}\`) - \`${INTENSIDADES.join("` | `")}\``,
    `- Tempo: \`${acuerdo.ritmo}\` (default \`${DEFECTO.ritmo}\`) - \`${RITMOS.join("` | `")}\``,
    "",
    "## Limits of use - model family and level, never a version number",
    "",
    ...(acuerdo.limites.length ? acuerdo.limites.map(linea) : ["- None yet."]),
    "",
    "## The four bets - the names the kit checks",
    "",
    ...APUESTAS.map((a, i) => `${i + 1}. **${a.id}** - ${a.texto}`),
    "",
    "## What does not move without your word - a hard rule, never a bet",
    "",
    "Crossing any of these stops the kit:",
    "",
    ...NO_SE_MUEVE.map((id) => `- \`${id}\``),
    "",
    "## What stays in force either way - a hard rule that is not a stop",
    "",
    "The guard records writes into another owner's tree; the host's permissions decide whether they proceed, and the owning governance remains in force.",
    "",
    ...SIGUE_DENTRO.map((id) => `- \`${id}\``),
    "",
  ].join("\n");
}

export function registrar(acuerdo, { raiz, aprobado, recapitulacion, ahora } = {}) {
  // Las puertas se comprueban en el orden en que se cumplen: primero la voz de la IA, despues
  // la de la persona, despues el disco. Faltar cualquiera deja el arbol intacto.
  if (typeof recapitulacion !== "string" || recapitulacion.trim() === "") {
    return { escrito: false, falta: "recapitulacion", ruta: ACUERDO };
  }
  if (aprobado !== true) {
    return { escrito: false, falta: "aprobacion", ruta: ACUERDO };
  }
  // Y antes de escribir: si ya hay acuerdo, NO se sobrescribe. El primer documento lleva la
  // recapitulacion de la persona, y esa puerta no se vuelve a pasar. Lo que cambia despues
  // entra por `enmendar`, que agrega al final y deja lo de arriba byte a byte.
  if (existsSync(join(raiz, ACUERDO)) || leerRecibo(raiz)?.aprobado === true) {
    return { escrito: false, falta: "ya-existe", ruta: ACUERDO, redirige: "enmendar" };
  }
  const ruta = join(raiz, ACUERDO);
  writeFileSync(ruta, documento(acuerdo, { recapitulacion, ahora }), "utf8");
  // `aprobado: true` es lo unico que hace que este recibo cuente como acuerdo. Se escribe aqui y
  // en ningun otro lado: el aviso de actualizacion escribe este mismo archivo y NO lo pone.
  //
  // El recibo PREVIO va DEBAJO, no se descarta. Registrar REEMPLAZABA el archivo entero, y con el
  // se iba el rastro de que el aviso ya se habia mostrado: la secuencia aviso -> se registra el
  // acuerdo -> el aviso volvia a salir, porque el registro habia borrado la prueba de que ya
  // habia salido. Un campo que no le pertenece a este registro no es de este registro para
  // borrarlo: `aviso` vive en este archivo y lo escribe otra puerta.
  try {
    escribirRecibo(raiz, {
      ...(leerRecibo(raiz) ?? {}),
      ...acuerdo,
      version: 1,
      aprobado: true,
      aprobadoEn: ahora ?? null,
      resumen: recapitulacion,
    });
  } catch (error) {
    try {
      unlinkSync(ruta);
    } catch {
      // Preserva el error original: si tampoco se puede limpiar, al menos el fallo de registro
      // sigue visible para quien lo invoco.
    }
    throw error;
  }
  return { escrito: true, falta: null, ruta: ACUERDO };
}

// Un acuerdo existe solo si las tres puertas pasaron. Se lee el `aprobado` explicito y no se
// infiere de que el archivo exista: un recibo con la forma de un acuerdo pero sin ese campo es
// el estado que deja el aviso de actualizacion, y contarlo seria una mentira comoda.
export function leer(raiz) {
  const recibo = leerRecibo(raiz);
  if (!recibo || recibo.version !== 1 || recibo.aprobado !== true) return null;
  return recibo;
}

export function hayAcuerdo(raiz) {
  return leer(raiz) !== null;
}

// --- el acuerdo que la persona YA escribió (fricción 1, R4) ------------------------
//
// `registrar` se niega cuando `acuerdo.md` ya existe, y su plantilla trae encabezados en
// inglés. Eso cerraba la puerta a un acuerdo que la persona hubiera escrito en su idioma: el
// bot de Desarrollo Web (2026-10-04) tuvo que fabricar el recibo con su propio código en un
// directorio temporal y copiarlo, porque no había camino. Aquí lo hay.
//
// Lo que hace es lo UNO que un recibo es: un hecho. Que el documento existe, que no está
// vacío, que es texto, y qué bytes tiene. Lo que NO hace, y por eso se dice aquí, es reescribir
// el documento ni traducirlo ni deducir de él unas perillas que la persona no escribió. Un
// recibo con `intensidad` inventada sería peor que no tener recibo: `leer()` lo devolvería y
// el kit operaría con un valor que nadie eligió.
//
// Y no se activa solo. Tener `acuerdo.md` en el árbol no registra nada: el registro es un acto,
// y el acto lo hace quien decide. Ver `14f`.

// La huella es del CONTENIDO y normalizada a LF, igual que la del estado de Lore
// (`hooks/lore-state.mjs`): tocar el archivo sin cambiarlo no cambia la huella, y el mismo
// documento da la misma huella en otra máquina.
function huellaDocumento(cuerpo) {
  return createHash("sha256").update(String(cuerpo).replace(/\r\n/g, "\n")).digest("hex");
}

// Un acuerdo es texto. La pregunta es qué lo hace texto, y la respuesta no es una lista de
// extensiones —un `.png` renombrado a `acuerdo.md` la pasa— sino el contenido: UTF-8 que
// vuelve a sí mismo al codificar, y sin caracteres de control que no sean de línea. Un
// volcado de memoria o un binario fallan las dos cosas.
function esTexto(cuerpo) {
  const bytes = Buffer.from(cuerpo, "utf8");
  if (!Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes)) return false;
  let control = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    const b = bytes[i];
    if (b === 9 || b === 10 || b === 13) continue;
    if (b < 32 || b === 127) control += 1;
  }
  return bytes.length === 0 || control / bytes.length < 0.02;
}

function leerDocumento(raiz) {
  // La raíz tiene que ser un directorio. Un archivo no es un árbol, y sin árbol no hay dónde
  // escribir el recibo: decirlo es más honesto que escribir un recibo al lado de un archivo.
  let raizReal;
  try {
    raizReal = lstatSync(raiz);
  } catch {
    return { falta: "raiz" };
  }
  if (!raizReal.isDirectory()) return { falta: "raiz" };

  const ruta = join(raiz, ACUERDO);
  // `lstat` y no `stat`: un enlace —o un junction, que en Windows no necesita privilegios—
  // es la forma en que una ruta sale del árbol sin que nada lo parezca. Se mira el enlace, no
  // el destino, y un enlace no es el archivo de este árbol.
  let info;
  try {
    info = lstatSync(ruta);
  } catch {
    return { falta: "no-existe" };
  }
  if (info.isSymbolicLink() || !info.isFile()) return { falta: "no-regular" };

  const crudo = readFileSync(ruta);
  if (!esTexto(crudo)) return { falta: "no-texto" };
  const cuerpo = crudo.toString("utf8");
  if (cuerpo.trim() === "") return { falta: "vacio" };
  return { cuerpo, huella: huellaDocumento(cuerpo) };
}

/**
 * Registra un acuerdo que la persona ya escribió. No reescribe ni traduce el texto: verifica
 * que el documento exista y tenga contenido, calcula su huella y escribe el recibo `.lore-acuerdo`
 * que el kit ya reconoce. Se ofrece; nunca se activa solo.
 */
export function registrarEscrito({ raiz, ahora } = {}) {
  const leido = leerDocumento(raiz);
  if (leido.falta) return { escrito: false, falta: leido.falta, ruta: ACUERDO };

  // Un recibo que ya existe tiene la última palabra sobre si el documento sigue siendo el que
  // se registró. Si coincide, registrar otra vez no cambia nada y dice que vaya a enmendar. Si
  // NO coincide, el texto cambió por una puerta que no es la enmienda: pisar ese recibo
  // registraría una huella nueva y borraría el rastro de que el documento se editó a mano,
  // que es justo lo que un acuerdo no debe hacer sin que nadie lo haya autorizado.
  const previo = leerRecibo(raiz);
  if (previo?.aprobado === true) {
    if (previo.documentoDigest === undefined) {
      return { escrito: false, falta: "recibo-desfasado", ruta: ACUERDO, redirige: "enmendar" };
    }
    if (previo.documentoDigest !== leido.huella) {
      return { escrito: false, falta: "recibo-desfasado", ruta: ACUERDO, redirige: "enmendar" };
    }
    return { escrito: false, falta: "ya-existe", ruta: ACUERDO, redirige: "enmendar" };
  }

  // El mismo merge que `registrar()`: un campo que no le pertenece a este registro no es de
  // este registro para borrarlo. `aviso` vive en este archivo y lo escribe otra puerta.
  escribirRecibo(raiz, {
    ...(previo ?? {}),
    version: 1,
    aprobado: true,
    aprobadoEn: ahora ?? null,
    documento: ACUERDO,
    documentoDigest: leido.huella,
    escritaPorLaPersona: true,
  });
  return { escrito: true, falta: null, ruta: ACUERDO };
}

// --- la enmienda en prosa --------------------------------------------------------------
//
// `enmendar` entiende perillas, límites y piezas cubiertas. Es el vocabulario cerrado del
// acuerdo, y sirve para lo que el kit tiene que leer. No alcanza para «además los playgrounds
// se prueban antes de entregar»: una frase así no es un error de quien la escribió, es un tipo
// de cambio que el kit no tiene un lugar donde poner. Aquí la frase entra tal cual, fechada, al
// final del documento, y el recibo se actualiza con la huella nueva.
//
// Las tres puertas siguen siendo las mismas: acuerdo registrado, palabra de la persona, fecha
// real. Una enmienda en prosa es más fácil de autorizar que una de perillas, no más fácil de
// pasar por alto.

/**
 * Agrega una enmienda en prosa libre al final del acuerdo existente y actualiza el recibo.
 * `autorizado` es la palabra de la persona: sin ella no se escribe nada.
 */
export function enmendarEnProsa({ raiz, texto, ahora, autorizado } = {}) {
  if (autorizado !== true) return { enmendada: false, razon: "sin-autorizacion" };

  // Lo mismo que `enmendar`: solo se enmenda lo que YA PASÓ por las tres puertas. Un archivo
  // lleno de texto y sin recibo es un documento, no un acuerdo, y `appendFileSync` lo
  // convertiría en uno con la forma del aprobado sin que nadie lo hubiera aprobado.
  const acuerdo = raiz ? leer(raiz) : null;
  if (!acuerdo) return { enmendada: false, razon: "sin-acuerdo-registrado" };

  // Una enmienda sin texto no es una enmienda: es un encabezado fechado con nada debajo, que
  // tres meses después se lee como un cambio que alguien decidió y no escribió.
  const cuerpo = typeof texto === "string" ? texto.trim() : "";
  if (cuerpo === "") return { enmendada: false, razon: "sin-texto" };

  if (!fechaReal(ahora)) {
    throw new TypeError(
      `Una enmienda necesita su fecha (YYYY-MM-DD) y que sea una fecha real; recibí ${JSON.stringify(ahora ?? null)}.`,
    );
  }

  const amendment = { fecha: ahora.trim(), que: "prosa" };
  appendFileSync(join(raiz, ACUERDO), enmiendaProsa(amendment, cuerpo), "utf8");

  const siguiente = {
    ...acuerdo,
    enmendada: true,
    enmiendas: [...(acuerdo.enmiendas ?? []), amendment],
  };
  // La huella se recalcula sobre el disco DESPUÉS de agregar: es la del documento que queda,
  // no la que tenía antes. Es lo que hace que `registrarEscrito` pueda decir después
  // «ya-existe» en vez de «el texto cambió por fuera».
  escribirRecibo(raiz, {
    ...(leerRecibo(raiz) ?? {}),
    ...siguiente,
    version: 1,
    aprobado: true,
    documentoDigest: huellaDocumento(readFileSync(join(raiz, ACUERDO), "utf8")),
  });
  return { ...leer(raiz), enmendada: true };
}

// El andamiaje es el mismo que el de `enmendar()` y en el mismo idioma, porque el documento
// que genera el kit es en inglés; lo que la persona escribió va debajo, sin tocarlo. Un
// `## Amendment` en inglés sobre una frase en español no la traduce: solo la nombra.
function enmiendaProsa({ fecha }, cuerpo) {
  return [
    "",
    `## Amendment ${fecha} - prose`,
    "",
    "Authorized by the person, in their own words. Everything above stays as it was.",
    "",
    cuerpo,
    "",
  ].join("\n");
}

// Una apuesta que cae es un hecho del arbol, no una variable del turno: se anota en el recibo
// para que las funciones que dependen de ella (el aviso, el reparto, el recordatorio) la lean de
// verdad y no de un flag que alguien tiene que acordarse de pasar.
export function anotarCaida(raiz, apuesta) {
  if (!APUESTA_POR_ID.has(apuesta)) {
    throw new TypeError(`«${apuesta}» no es una apuesta de este acuerdo.`);
  }
  const recibo = leerRecibo(raiz) ?? {};
  const caidas = recibo.apuestasCaidas ?? [];
  if (caidas.includes(apuesta)) return leer(raiz);
  escribirRecibo(raiz, {
    ...recibo,
    version: recibo.version ?? 1,
    apuestasCaidas: [...caidas, apuesta],
  });
  return leer(raiz);
}

// --- 5. enmiendas fechadas -----------------------------------------------------

function valorDe(cambio, campo, actual) {
  return Object.hasOwn(cambio, campo) ? cambio[campo] : actual;
}

export function enmendar(acuerdo, { cambio, autorizado, ahora, raiz } = {}) {
  // Sin la palabra de la persona no hay enmienda: el acuerdo sigue como estaba y el objeto
  // devuelto lo dice, para que el error se vea en vez de dejar rastro a medias.
  if (autorizado !== true) return { ...acuerdo, enmendada: false };

  // Solo se enmenda lo que YA PASO por las tres puertas. `appendFileSync` crea el archivo que no
  // existe, asi que sin esta guarda `enmendar` fabricaba un acuerdo aprobado de la nada: con la
  // palabra de la persona y sin recapitulacion ni registro, dejaba un documento con la forma del
  // primero y un recibo con `aprobado: true`. Las tres puertas no se saltaban, se esquivaban por
  // la puerta de al lado. `leer` exige el `aprobado: true` explicito, asi que un recibo que solo
  // trae el aviso de actualizacion tampoco cuenta como algo que enmendar.
  if (raiz && leer(raiz) === null) {
    return { ...acuerdo, enmendada: false, razon: "sin-acuerdo-registrado" };
  }

  // Una enmienda sin fecha no es una enmienda: es un cambio sin cuándo, que es indistinguible de
  // uno que nunca pasó. Se rechaza en vez de aceptar `fecha: null`, porque null es exactamente
  // el valor que hace el registro ilegible tres meses después.
  if (!fechaReal(ahora)) {
    throw new TypeError(
      `Una enmienda necesita su fecha (YYYY-MM-DD) y que sea una fecha real; recibí ${JSON.stringify(ahora ?? null)}.`,
    );
  }

  const amendment = { fecha: ahora.trim(), que: Object.keys(cambio ?? {}).join(" + ") };
  const siguiente = {
    ...acuerdo,
    enmendada: true,
    enmiendas: [...(acuerdo.enmiendas ?? []), amendment],
  };

  for (const campo of ["intensidad", "ritmo"]) {
    const valor = valorDe(cambio, campo, undefined);
    if (valor !== undefined) {
      if (campo === "intensidad" && !INTENSIDADES.includes(valor)) {
        throw new TypeError(`Intensidad desconocida: «${valor}».`);
      }
      if (campo === "ritmo" && !RITMOS.includes(valor)) {
        throw new TypeError(`Ritmo desconocido: «${valor}».`);
      }
      siguiente[campo] = valor;
    }
  }
  // Sacar y agregar se aplican EN ORDEN, y el segundo arranca de lo que el primero dejo. Aplicar
  // los dos desde la lista original hace que `agrega` recupere lo que `saca` acaba de retirar, y
  // una operacion que se contradice a si misma parece tener efecto.
  // Las dos aceptan una pieza sola o una lista: pedir a quien enmienda que sepa cual de las dos
  // formas espera el modulo es una formality que solo produce errores.
  if (cambio?.saca !== undefined) {
    const fuera = Array.isArray(cambio.saca) ? cambio.saca : [cambio.saca];
    siguiente.cubre = siguiente.cubre.filter((pieza) => !fuera.includes(pieza));
  }
  if (cambio?.agrega !== undefined) {
    const dentro = Array.isArray(cambio.agrega) ? cambio.agrega : [cambio.agrega];
    siguiente.cubre = [...new Set([...siguiente.cubre, ...dentro])];
  }
  if (Array.isArray(cambio?.limites)) {
    siguiente.limites = cambio.limites.map(limite);
  }

  if (raiz) {
    // Se AGREGA al final del documento. El acuerdo original queda byte a byte como estaba, que
    // es lo que hace que el registro de cambios tenga algo que leer.
    appendFileSync(join(raiz, ACUERDO), enmienda(amendment, cambio), "utf8");
    // El mismo merge que registrar(): el disco manda para lo que esta enmienda no toca. Sin esto,
    // un `acuerdo` en memoria que no traia `aviso` lo borraba al escribir, el mismo bug que
    // registrar() ya habia cerrado por otro camino (Codex, revision de S4v3).
    escribirRecibo(raiz, { ...(leerRecibo(raiz) ?? {}), ...siguiente, version: 1, aprobado: true });
  }
  return siguiente;
}

function enmienda({ fecha, que }, cambio) {
  const detalle = Object.entries(cambio ?? {})
    .map(([campo, valor]) => `\`${campo}\` → \`${valorLegible(valor)}\``)
    .join(", ");
  return [
    "",
    `## Amendment ${fecha} - ${que}`,
    "",
    "Authorized by the person. Everything above stays as it was.",
    "",
    `Changed: ${detalle}.`,
    "",
  ].join("\n");
}

// --- 4. el chequeo silencioso --------------------------------------------------

export function cubriendo(acuerdo, pieza) {
  return (acuerdo?.cubre ?? []).includes(pieza);
}

export function cubrir(acuerdo, pieza) {
  // Sin acuerdo no hay lista contra la que comprobar: nada esta cubierto por un acuerdo que no
  // existe. Y aun asi NO se pregunta. La oferta ya se hizo una vez, en el umbral; preguntar por
  // cada pieza despues seria convertir el acuerdo en un peaje, y "nunca se impone" es regla dura
  // (ver NO_SE_MUEVE). `cubierto: false` con `preguntar: false` es exactamente esa distincion:
  // no cubierto no es lo mismo que worthy de preguntar.
  if (!acuerdo) {
    return { cubierto: false, preguntar: false, por: "sin-acuerdo", frase: null };
  }
  if (cubriendo(acuerdo, pieza)) {
    return { cubierto: true, preguntar: false, por: "acuerdo", frase: null };
  }
  return {
    cubierto: false,
    preguntar: true,
    por: "fuera-del-acuerdo",
    frase: `«${pieza}» no está cubierto por el acuerdo que hicimos. ¿Seguimos?`,
  };
}

// --- 3. el aviso unico a quien actualiza ---------------------------------------

export function mensajeActualizacion({ raiz, desde, ahora } = {}) {
  const recibo = leerRecibo(raiz) ?? {};
  if (avisoRegistrado(recibo)) return { mensaje: null, yaDice: true, modo: "directo", bloquea: false };
  if (!desde || desde === ACTUAL) {
    return { mensaje: null, yaDice: true, modo: "directo", bloquea: false };
  }

  // Tres cosas, en llano y en este orden: que llego, que puede hacer, y la invitacion. La ultima
  // frase es la que importa: sin limites declarados, el kit corre con lo que el host ofrece, y
  // eso no es una decision que la persona haya tomado.
  const mensaje = [
    `Llegó Vespi con el kit ${ACTUAL}.`,
    "Puede ofrecerte un acuerdo de trabajo: en el primer uso te lo pone delante,",
    "y obliga solo si tú lo aceptas; hasta entonces todo funciona como antes.",
    "Es tuyo para fijarlo ahora, si quieres: cómo te hablan las skills (sobria o cercana),",
    "a qué ritmo (despacio, normal o rápido), y qué límites de uso pones —qué familias de",
    "modelo y qué niveles nunca se tocan—. Dilo y los fijamos.",
  ].join(" ");

  // La apuesta de avisar sin bloquear decide COMO se entrega, no SI se entrega. Sin ella, el
  // aviso no se puede emitir suelto y queda disponible para acompanar lo proximo que el kit ya
  // vaya a decir. Bloquear nunca fue la apuesta, asi que en ninguno de los dos casos bloquea.
  const caidaAviso = caida(leer(raiz), "avisar-sin-bloquear");
  const modo = caidaAviso ? "disponible" : "directo";

  // Nótese lo que este recibo NO lleva: `aprobado: true`. Mostrar el aviso no aprueba un
  // acuerdo, y escribirlo aqui era exactamente el defecto - preguntar despues "hay acuerdo"
  // contestaba que si, sobre un arbol donde nadie habia aprobado nada.
  //
  // Y nótese lo que este recibo SÍ puede no tener: donde escribirse. `create-area` y `create-bot`
  // corren este comando en su umbral, ANTES del `mkdir` de la carpeta destino, y ahi la
  // escritura era una ENOENT que tumbaba el flujo de creacion entero por un mensaje informativo.
  // El aviso es un mensaje, no un documento: se calcula, se dice, y el rastro es un extra. Donde
  // no se pudo escribir, se devuelve `rastro: false` y el aviso puede volver a salir la proxima
  // vez - que es el precio honesto de no tener arbol donde anotarlo.
  const rastro = escribirRecibo(raiz, {
    ...recibo,
    version: recibo.version ?? 1,
    aviso: { desde, cuando: ahora ?? null },
  }, { opcional: true });
  return { mensaje, yaDice: false, modo, bloquea: false, rastro };
}

const avisoRegistrado = (recibo) => Boolean(recibo?.aviso?.desde);

// --- las apuestas, y lo que cada una sostiene -------------------------------

const plano = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Las frases cotidianas del acuerdo. Cada una decide a quien le toca, no que hacer: la forma no
// existe todavia es una cosa distinta de la forma que existe y esta en riesgo. El orden importa:
// la frase angostada por el diseño se revisa antes que la forma general, porque la contiene
// ("quiero hacer esto y no sé cómo ... hay que pensar el diseño" trae las dos, y le toca a
// brainstorming-lore por la angosta). Sin ese orden la ancha se comería a la angosta y "no sé
// cómo" dispararía las dos a la vez.
// El riesgo va primero. Una frase puede traer las dos senales a la vez -"esto me esta complicando
// el diseno"- y el orden decide cual gana: si brainstorming-lore fuera primero, "diseno" le
// ganaba a "me esta complicando" y una frase de riesgo real se iba a pensar el diseno en vez de
// sostener la forma que ya existe. El acuerdo dice que vespi es para cuando "la forma existe y
// esta en riesgo", que es una senal mas urgente que "todavia no hay forma" o "quiero pensarlo".
// Confirmado con Codex, revision de S3v2: reparte() mandaba "me esta complicando el diseno" a
// brainstorming-lore por el orden viejo.
const FRASES = [
  { skill: "vespi", cuando: ["me esta complicando", "se esta complicando", "se esta perdiendo", "lo que decidimos", "perdiamos", "sigamos manana", "esta en riesgo", "se me complico", "lo estamos perdiendo", "notas de varios proyectos", "coordina lo que ya estamos haciendo entre varios proyectos"] },
  { skill: "brainstorming-lore", cuando: ["diseno", "diseño", "disenar", "piensa el", "pensar el", "lo pienso", "ayudame a pensar", "help me think", "antes de construir", "como deberia ser"] },
  { skill: "use-lore", cuando: ["no se como", "no se cómo", "no hay forma de trabajo", "todavia no hay forma", "no se por donde", "ayudame a empezar"] },
];

export function reparte({ frase, acuerdo } = {}) {
  // Al caer la apuesta de las frases, la frase ya no alcanza a la skill. La funcion no se inventa
  // una ruta: dice que hay que preguntar. Falla hacia la pregunta, que es el lado barato.
  if (caida(acuerdo, "frases-cotidianas")) {
    return { skill: null, por: "sin-frases", preguntar: true };
  }
  const texto = plano(frase);
  if (texto === "") return { skill: null, por: "sin-frase", preguntar: true };
  for (const regla of FRASES) {
    if (regla.cuando.some((m) => texto.includes(plano(m)))) {
      return { skill: regla.skill, por: "frase", preguntar: false };
    }
  }
  return { skill: null, por: "sin-coincidencia", preguntar: true };
}

// El recordatorio por turno que la persona nunca ve. Al caer la apuesta del hook no hay
// recordatorio: el modulo dice donde se guarda el registro en su lugar, en vez de devolver un
// texto vacio que el agente tendria que inventar.
//
// `turno: null` es la apertura de la sesion: el texto es el mismo y no lleva numero, porque
// un "turno 0" al abrir seria un numero falso, y un "turno 1" gastaria el primer turno
// contandolo.
export function recordatorio({ acuerdo, turno = null } = {}) {
  if (caida(acuerdo, "recordatorio-por-hook")) {
    return { texto: null, visible: false, por: "sin-hook", en: "FASES.md", turno };
  }
  // El recordatorio viaja al canal de sistema del host, asi que sus palabras solo pueden venir
  // del vocabulario cerrado: un `.lore-acuerdo` con texto libre en `intensidad` o `ritmo` no
  // llega a hablar por el sistema. Los limites se cuentan, no se citan (H9).
  const intensidad = INTENSIDADES.includes(acuerdo?.intensidad) ? acuerdo.intensidad : DEFECTO.intensidad;
  const ritmo = RITMOS.includes(acuerdo?.ritmo) ? acuerdo.ritmo : DEFECTO.ritmo;
  const limites = Array.isArray(acuerdo?.limites) ? acuerdo.limites.length : 0;
  const diales = [
    `hablo ${intensidad}`,
    `a ritmo ${ritmo}`,
    `hay ${limites} limites`,
    `acuerdo ${acuerdo ? "vigente" : "sin acuerdo, por los defectos"}`,
  ];
  const cuerpo = diales.join("; ");
  return {
    texto: turno === null || turno === undefined ? cuerpo : `Turno ${turno}: ${cuerpo}.`,
    visible: false,
    por: "acuerdo",
    turno,
  };
}

// --- 6. la apuesta que cae -----------------------------------------------------

export function caer(acuerdo, apuesta) {
  // Solo las cuatro. "imponer-el-acuerdo" y las demas reglas duras no entran por esta puerta: no
  // son apuestas y no pueden caer, por mas que se les pase el nombre.
  if (!APUESTA_POR_ID.has(apuesta)) {
    throw new TypeError(`«${apuesta}» no es una apuesta de este acuerdo.`);
  }
  const caidas = acuerdo.apuestasCaidas ?? [];
  if (caidas.includes(apuesta)) return { ...acuerdo, apuestasCaidas: caidas };
  return { ...acuerdo, apuestasCaidas: [...caidas, apuesta] };
}

// La pregunta es si el trabajo puede seguir, y no tiene nada que ver con las apuestas: un
// trabajo sigue mientras haya una forma de trabajar legible, y sin acuerdo la forma son los
// valores por defecto. Lo unico que la detiene es un acuerdo ilegible - y eso no es una apuesta
// caida, es un archivo roto.
export function puedeOperar(acuerdo) {
  if (acuerdo === null || acuerdo === undefined) return true;
  // Un acuerdo que la persona escribió en prosa no declara perillas, y eso no es un acuerdo
  // ilegible: es un acuerdo del que el kit no sabe más. Sin este `??`, un acuerdo escrito a
  // mano pararía el kit por no declarar algo que nunca se pidió que declarara — la primera
  // puerta sin la que el segundo camino de registro no habría servido de nada. Lo ilegible
  // sigue siendo lo ilegible: una perilla declarada con un valor que no existe.
  return INTENSIDADES.includes(acuerdo?.intensidad ?? DEFECTO.intensidad)
    && RITMOS.includes(acuerdo?.ritmo ?? DEFECTO.ritmo);
}

export function noSeMueve() {
  return [...NO_SE_MUEVE];
}

// Las reglas duras que se mantienen y que NO detienen nada. Se exponen aparte porque confundirlas
// con las de parar fue la inversión: registrar escrituras ajenas y dejar decidir al host mantiene
// la gobernanza propietaria; tratarlo como una alarma detendría el kit sin motivo.
export function sigueDentro() {
  return [...SIGUE_DENTRO];
}

// La pregunta es "¿esto cruza algo que no se movia sin tu palabra?". Para `NO_SE_MUEVE` la
// respuesta es que si, y el kit para. Para `SIGUE_DENTRO` la respuesta es que no: eso sigue
//-documentado, vigente y sin pedir permiso- y preguntar por el es lo que estaba al reves.
export function decision(acuerdo, cosa) {
  return NO_SE_MUEVE.includes(cosa) ? "parar" : "seguir";
}

// --- la puerta de la linea de comandos ----------------------------------------
// Los create-* invocan esto desde su procedimiento real: por eso es un comando y no solo una
// funcion importada. `primera-vez` es la oferta (y trae el hueco del por que, que es por donde el
// acuerdo empieza); `aviso` es el mensaje unico a quien actualiza.

const OPCIONES = ["primera-vez", "aviso", "registrar-escrito", "enmendar-prosa"];

function banderas(argv) {
  const salida = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) salida[argv[i].slice(2)] = argv[i + 1]?.startsWith("--") ? true : argv[++i];
  }
  return salida;
}

export function lineaDeComandos(argv = process.argv.slice(2)) {
  const [subcomando, ...resto] = argv;
  if (!OPCIONES.includes(subcomando)) {
    return { ok: false, salida: { error: `subcomando desconocido: ${subcomando ?? "(ninguno)"}`, validos: OPCIONES } };
  }
  const op = banderas(resto);
  const raiz = typeof op.raiz === "string" ? op.raiz : null;
  if (!raiz) return { ok: false, salida: { error: "falta --raiz" } };

  if (subcomando === "primera-vez") {
    const sesiones = Number(op.sesiones ?? Number.NaN);
    return { ok: true, salida: primeraVez({ raiz, trabajo: { sesiones } }) };
  }
  if (subcomando === "registrar-escrito") {
    // El registro de un acuerdo que la persona ya escribió. Se ofrece y no se dispara: quien
    // corre esto decide que el documento es un acuerdo, y el módulo solo deja constancia.
    return { ok: true, salida: registrarEscrito({ raiz, ahora: op.ahora ?? null }) };
  }
  if (subcomando === "enmendar-prosa") {
    return {
      ok: true,
      salida: enmendarEnProsa({
        raiz,
        texto: typeof op.texto === "string" ? op.texto : "",
        ahora: op.ahora ?? null,
        // La palabra de la persona llega por bandera y es explícita: `--autorizado`. Sin ella el
        // comando responde que no enmendó, que es más honesto que escribir y avisar después.
        autorizado: op.autorizado === true || op.autorizado === "true",
      }),
    };
  }
  return {
    ok: true,
    salida: mensajeActualizacion({ raiz, desde: op.desde, ahora: op.ahora ?? null }),
  };
}

const invocadoComo = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invocadoComo) {
  const { ok, salida } = lineaDeComandos();
  process.stdout.write(`${JSON.stringify(salida, null, 2)}\n`);
  if (!ok) process.exitCode = 1;
}
