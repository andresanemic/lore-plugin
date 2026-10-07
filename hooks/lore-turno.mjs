// El recordatorio por turno y la marca visible — Lore Plugin (R28, R40, R46).
//
// El problema que esto arregla no es la primera vez: es la segunda. Un agente con un
// acuerdo aprobado en el disco lo encuentra, lo lee y lo sostiene — eso se observo, y
// por eso esta pieza NO se justifica como un arreglo del registro. Lo que se observo
// es lo otro: un turno que hacia 18 decisiones y dejo `FASES.md` diciendo lo que
// diciendo antes, con el acuerdo a la vista y sabiendolo de memoria. Saber no es
// recordar, y lo que falta no es el acuerdo sino que alguien vuelva a poner delante,
// en cada turno y sin que la persona lo note, el registro que esta en vigor y DONDE
// VIVE EL ESTADO.
//
// Por eso el recordatorio es un puntero y no un cuerpo. Si metiera el texto de un
// `lore/principios.md` ahi, cada turno volveria a pagar el mismo criterio que el host
// ya cargo una vez: mas tokens y ningun criterio nuevo. Lo que entra por turno son las
// dos perillas y el estado del acuerdo, y eso son menos de 60 tokens.
//
// Eso se corrigio una vez, y queda anotado aqui para que no se lea como una excepcion
// escondida. El puntero era el LUGAR del estado, no su veredicto: quien lo leyo coordino
// quince tareas sin abrir ni una operacion ni escribir un recibo, en un kit cuya version
// distinta de cero es justamente la operacion. Al abrir, `puertaDeOperacion` no nombra el
// lugar: entrega lo que el kernel dice de lo guardado y el archivo exacto donde esta. Un
// puntero que no puede fallar en voz alta no es una puerta. Los turnos que siguen siendo
// dos perillas, y lo que no cabe en el presupuesto sigue sin entrar.
//
// La persona puede elegir el nivel y apagarlo. El defecto es `full` porque el
// recordatorio es lo que sostiene el acuerdo turno a turno, que es la segunda de las
// cuatro apuestas; apagarlo es una eleccion suya, no un defecto del kit.

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { leer as leerAcuerdo, recordatorio } from "../skills/use-lore/scripts/acuerdo.mjs";
import { operationEntry } from "../skills/vespi/core/operation-state.mjs";

// Vocabulario cerrado, como el de intensidad y ritmo: un nivel que solo existe en
// una sesion no es una perilla, es un remembered typo que nadie va a recuperar.
export const NIVELES = ["off", "lite", "full"];
export const DEFECTO_NIVEL = "full";

export const ESTADO = ".lore-nivel";

// La perilla y el defecto. `nivelDesde` es ESTRICTO y lanza: escribir un nivel que no
// existe tiene que ser un error visible, no un default silencioso que nadie va a ver.
// Resolver el nivel de verdad (`nivel`) es LENIENTE y nunca lanza: un archivo roto o
// una variable de entorno con basura no pueden dejar un turno sin recordatorio, que es
// justo el techo que este mecanismo existe para no tocar.
export function nivelDesde(valor) {
  if (valor === null || valor === undefined || valor === "") return DEFECTO_NIVEL;
  const limpio = String(valor).trim().toLowerCase();
  if (!NIVELES.includes(limpio)) {
    throw new TypeError(`Nivel desconocido: «${valor}». Vale ${NIVELES.join(", ")}.`);
  }
  return limpio;
}

// Donde vive la perilla. `LORE_ESTADO_DIR` existe para que las pruebas y un host
// aislado no toquen el home de la persona; el defecto es su home, que es donde una
// perilla de la persona debe estar.
export function estadoDir(env = process.env) {
  return env.LORE_ESTADO_DIR || homedir();
}

export function estado(dir, escribir = null) {
  const base = dir || estadoDir();
  if (escribir !== null && escribir !== undefined) {
    const nivel = nivelDesde(escribir);
    const target = join(base, ESTADO);
    const temporal = `${target}.${randomUUID()}.tmp`;
    try {
      mkdirSync(base, { recursive: true });
      writeFileSync(temporal, `${JSON.stringify({ nivel, desde: new Date().toISOString() }, null, 2)}\n`, { flag: "wx" });
      renameSync(temporal, target);
    } finally {
      if (existsSync(temporal)) unlinkSync(temporal);
    }
    return { nivel, escrito: true, ruta: target };
  }
  let crudo = null;
  try {
    crudo = JSON.parse(readFileSync(join(base, ESTADO), "utf8"));
  } catch {
    return { nivel: DEFECTO_NIVEL, motivo: "sin-estado" };
  }
  try {
    return { nivel: nivelDesde(crudo?.nivel), motivo: "leido" };
  } catch {
    return { nivel: DEFECTO_NIVEL, motivo: "ilegible" };
  }
}

// La variable del entorno manda sobre el archivo, y solo si es un nivel de verdad: el
// archivo es la eleccion permanente de la persona y una variable mal escrita no
// deserve guardarla por encima.
export function nivel({ estadoDir: dir, env = process.env } = {}) {
  if (typeof env.LORE_NIVEL === "string" && env.LORE_NIVEL.trim() !== "") {
    try {
      return nivelDesde(env.LORE_NIVEL);
    } catch {
      /* no es un nivel: se sigue al archivo */
    }
  }
  return estado(dir ?? estadoDir(env)).nivel;
}

// La marca visible. Cuesta cero tokens porque la linea de estado no entra al contexto,
// y es lo unico que la persona ve sin que nadie la interrumpa: apagado no aparece
// nada, que es la forma de que "apagado" sea un hecho y no una promesa.
export function marca(nivelActual) {
  const n = nivelDesde(nivelActual);
  if (n === "off") return "";
  return n === "full" ? "[Lore Plugin]" : "[Lore Plugin lite]";
}

const SIN_LORE = { inyectar: false, por: "sin-lore", texto: null, nivel: DEFECTO_NIVEL, turno: null };

// --- la quinta ranura: el para qué, que es del árbol y no del acuerdo -------------
//
// Este archivo se escribió entero con cuatro ranuras —las dos perillas, la cuenta de límites y
// el estado del acuerdo— y creyó que esas eran el registro. No lo eran: ninguna era el *para
// qué*, y el para qué es lo que gobierna. La promesa de que viaja por el recordatorio está
// escrita, textual, en el `lore/identidad.md` de los árboles que usan este kit, y el canal que
// debía cargarla tenía vocabulario cerrado sin esa palabra. RC2 verde, x402 integrado y el
// instrumento medido no cambiaron nada de lo que una persona vivió, y esto es lo que faltaba.
//
// Es `principios.md` §31, textual: *«Una pista que gobierna continuamente —tono, registro,
// gusto, una postura— no tiene paso que la nombre, así que el instrumento no la ve o la ve como
// sospechosa.»* El para qué gobierna continuamente y no tenía paso.
//
// De dónde se lee, y por qué este. `lore/identidad.md` del árbol, y no el bloque
// `<!-- lore:always-on -->` ni el `CLAUDE.md`, porque es el archivo donde la promesa está escrita:
// en los árboles reales que la tienen, el bloque siempre-activo no la repite — nombra
// `lore/identidad.md` como «qué es este bot y su norte» — y el `CLAUDE.md` la menciona en la
// línea de Vespi sin nombrarla. Medido sobre 40 árboles reales con `lore/identidad.md`: el
// marcador del para qué está en 2, el bloque siempre-activo en 39 y el `CLAUDE.md` en 39.
//
// Y el motivo importa tanto como la palabra. De los 40 árboles, 38 no declaran para qué, y para
// esos el kit no puede exigir una promesa que no sabe leer: no inventa ninguna y lo dice en el
// `por` en vez de dejar un silencio que otro lee como «no hay nada». Eso no es una tarea para el
// árbol: es la línea que separa lo que el kit puede leer de lo que tendría que adivinar.
const IDENTIDAD = join("lore", "identidad.md");
const RUTA_IDENTIDAD = "lore/identidad.md";
const MARCA_PARA_QUE = /\*\*El para qu(?:é|e)\s*:\s*([^*]+?)\*\*/i;

// El enunciado de 2.5 dice *«menos de diez palabras»*, y la cuenta es de la ranura entera —
// «para qué» incluido — porque es lo que entra al turno. Lo que no cabe NO se resume: se nombra
// dónde está. Un resumen sería una taxonomía del propósito, y si hay que nombrarlo para poder
// decirlo, es que todavía no se entendió.
export const PARA_QUE_MAX_PALABRAS = 10;

const SIN_PARA_QUE = { por: "sin-leer", texto: null, palabras: 0 };

// Lo que se toma es el encabezado del marcador y no su cuerpo, y esa es toda la diferencia entre
// esto y un resumen. En un árbol real el cuerpo son veintiocho palabras —«cuidar juntos un Entre
// vivo entre una persona y una máquina…»— y emitirlas todas sería leer el texto en voz alta en
// lugar de perturbarlo. El encabezado son tres palabras del árbol, sin completar: el texto
// perturba y el receptor reconstruye, y no al revés.
export function paraQueDe(raiz) {
  let crudo;
  try {
    crudo = readFileSync(join(raiz, IDENTIDAD), "utf8");
  } catch {
    return { ...SIN_PARA_QUE, por: "sin-identidad" };
  }
  const linea = crudo.split(/\r?\n/).find((l) => MARCA_PARA_QUE.test(l));
  if (!linea) return { ...SIN_PARA_QUE, por: "sin-declarar" };

  // El encabezado carga la procedencia entre paréntesis —*«(Andrés, 2026-09-28)»*—, y eso es de
  // dónde, no de qué: la fecha no viaja al turno. Sin ella el encabezado dice *«jardineros del
  // Entre»*, que son las palabras del árbol y no las del kit.
  //
  // El punto final va PRIMERO y el paréntesis después, y el orden no es de estilo: el árbol
  // escribe «…(Andrés, 2026-09-28).», con el punto FUERA del paréntesis, así que quitar el
  // paréntesis antes de quitar el punto no encuentra nada y la procedencia se cuela al turno.
  // El orden inverso loije una vez —la fecha viajando y el conteo de palabras corrido— que es
  // lo que un test que solo mira el principio del texto no ve.
  const encabezado = (linea.match(MARCA_PARA_QUE)?.[1] ?? "")
    .replace(/[\r\n\t\v\f\0]+/g, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/[.;:]\s*$/, "")
    .replace(/\s*\([^()]*\)\s*$/, "")
    .trim()
    .replace(/[.;:]\s*$/, "");
  if (encabezado === "") return { ...SIN_PARA_QUE, por: "declarado-vacio" };

  const palabras = encabezado.split(/\s+/).filter(Boolean).length;
  if (palabras + 2 > PARA_QUE_MAX_PALABRAS) {
    return { por: "declarado-largo", texto: `para qué en ${RUTA_IDENTIDAD}`, palabras };
  }
  return { por: "declarado", texto: `para qué ${encabezado}`, palabras };
}

// Lo que la apertura decia cuando no habia nada que abrir. Sigue siendo lo cierto en un arbol sin
// operacion: ahi FASES.md es solo un lugar, y nombrarlo es todo lo que hay que decir.
const PUNTERO = "el estado vive en FASES.md";

// La puerta. Con una operacion abierta, lo que entra al turno es el veredicto del kernel sobre lo
// guardado, el siguiente paso, lo que queda pendiente por rol y el archivo exacto donde esta
// escrito: no el nombre del lugar donde vive el estado. Ese puntero fue el defecto medido —quien lo
// leyo coordino quince tareas sin abrir ni una operacion ni escribir un recibo— porque un puntero no
// puede fallar en voz alta.
//
// Dos veces sin puerta: si el arbol no tiene Lore, o si no hay acuerdo en vigor, `inyeccion` ya
// callo antes de llegar aqui, y sin acuerdo no hay registro que sostener. Y si el FASES.md esta
// danado o el disco no responde, esto devuelve el puntero viejo: una puerta que no puede abrirse
// no puede ser la que tumba la sesion. El techo de este mecanismo es no romper nada.
//
// Pero el puntero solo es honesto cuando NO hay nada que abrir. Cuando si lo hay y la lectura
// falla, devolver el puntero hace que el fallo sea indistinguible de una apertura de verdad —que
// es el defecto que este archivo ya pago una vez, con quince tareas coordinadas sin abrir nada—.
// Por eso el fallo se dice, con el motivo y el archivo. Sigue sin lanzar: el techo no se cambia,
// lo que cambia es que el silencio no es una de las respuestas posibles.
function puertaDeOperacion(raiz) {
  let entrada;
  try {
    entrada = operationEntry({ root: raiz });
  } catch (error) {
    const motivo = typeof error?.message === "string" && error.message !== ""
      ? error.message
      : String(error);
    return `la puerta no pudo leer el estado: ${motivo} · revisa ${join(raiz, "FASES.md")} a mano antes de coordinar`;
  }
  if (!entrada?.open) return PUNTERO;
  const limpieza = (valor, max = 80) => String(valor ?? "")
    .replace(/[\r\n\t\v\f\0]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
  const pendiente = (entrada.pending_by_role ?? [])
    .map(({ role, tasks }) => `${limpieza(role)}: ${tasks.map((task) => `${limpieza(task.id)} (${limpieza(task.state)})`).join(", ")}`)
    .join("; ");
  return `operacion ${limpieza(entrada.id)} abierta en ${entrada.file} · estado ${limpieza(entrada.state)} · veredicto ${limpieza(entrada.reason)}`
    + ` · siguiente ${limpieza(entrada.next_step)}`
    + (pendiente ? ` · pendiente ${pendiente}` : "")
    + ` · primera respuesta: nombra este archivo y el siguiente paso en menos de diez palabras, sin afirmar una acción aún no ejecutada`
    + ` · antes de coordinar, abre ${entrada.file}`;
}

// La semilla de la puerta: lo que la puerta dice cuando HAY algo que abrir, y `null` cuando no.
//
// Vive aqui y no en la fabrica del plugin por una razon que no es de estilo: las tres preguntas —
// hay acuerdo, hay arbol con Lore, hay operacion abierta— ya tienen una sola respuesta en este
// modulo, y una segunda en el adaptador de OpenCode seria dos verdades sobre la misma puerta. Esta
// es la pieza que le permite a la fabrica sembrar el veredicto sin decidir cuando hablar.
//
// Lo que NO se siembra, y es lo mas importante de esta funcion: el puntero. Sin operacion abierta
// la puerta dice \`PUNTERO\` —donde vive el estado— y sembrar eso seria sembrar el defecto que las
// lineas 118-137 de este archivo ya cobaron una vez: quien lo leyo coordino quince tareas sin
// abrir nada. Un puntero que no puede fallar en voz alta no es una puerta, y esta semilla solo
// transporta la puerta.
//
// El nivel NO se consulta aqui: \`nivel()\` lee \`LORE_ESTADO_DIR\` y en el instante de cargar la
// fabrica todavia no esta puesto —las pruebas lo ponen despues de construir el plugin—, asi que
// decidir "apagado" aqui seria decidir con el reloj de otra persona. Lo decide el hook, en el
// momento de decir, que es cuando la perilla ya es legible.
export function semillaDePuerta({ raiz } = {}) {
  try {
    if (!raiz || !existsSync(join(raiz, "lore"))) return null;
    if (!leerAcuerdo(raiz)) return null;
    const veredicto = puertaDeOperacion(raiz);
    return veredicto === PUNTERO ? null : veredicto;
  } catch (error) {
    // El techo de este mecanismo es no romper nada, y no se cambia: esto no lanza.
    // Lo que cambia es que el silencio no es una de las respuestas posibles: el motivo
    // viaja como motivo —distinguible del veredicto— y la fábrica lo encola a la apertura.
    const motivo = typeof error?.message === "string" && error.message !== ""
      ? error.message
      : String(error);
    return `la puerta no pudo sembrar su veredicto: ${motivo} · la inyección del turno lo dirá`;
  }
}

// El cuerpo del recordatorio. `texto` es lo que entra al turno; `inyectar` dice si
// entra, y los dos estan en el mismo objeto porque la razon de que algo calla importa
// tanto como su contenido: un hook que calla sin poder explicar por que es un hook que
// nadie puede depurar.
export function inyeccion({ raiz, turno = null, nivel: n = DEFECTO_NIVEL, hoy = null } = {}) {
  const nivelActual = nivelDesde(n);
  if (nivelActual === "off") return { ...SIN_LORE, por: "apagado", nivel: nivelActual, turno };
  // `lite` abre y no repite: el turno ya tiene el contrato cargado y repetir cada vez
  // el mismo registro es gastar por un suelo que el host ya puso. El piso sigue puesto
  // al abrir, que es cuando no esta en ningun contexto de la sesion.
  if (nivelActual === "lite" && turno !== null) {
    return { ...SIN_LORE, por: "solo-apertura", nivel: nivelActual, turno };
  }
  if (!raiz || !existsSync(join(raiz, "lore"))) return { ...SIN_LORE, nivel: nivelActual, turno };

  // La quinta ranura se lee ANTES de la pregunta por el acuerdo, y al abrir solamente: es el
  // piso de la sesión, no un turno. Va antes porque no es del acuerdo —es del árbol—, y un
  // acuerdo ausente no puede borrar lo que el árbol ya declaró.
  const paraQue = turno === null ? paraQueDe(raiz) : SIN_PARA_QUE;

  const acuerdo = leerAcuerdo(raiz);
  // Sin acuerdo en vigor calla TODO el canal, no solo la apertura.
  //
  // La versión anterior de esta línea callaba al abrir y dejaba que el turno pusiera "el
  // suelo". Sin acuerdo, lo que se decía eran los DEFECTOS del kit, y esos ya están en el
  // bloque siempre-activo y en la skill: repetirlos en cada turno no sostenía nada —no hay
  // intensidades elegidas que se puedan apartar, no hay un FASES.md que sostener— y sí
  // costaba lo que R40 prohíbe, que es volver a pagar un criterio que el host ya cargó una
  // vez. Es el mismo impuesto permanente que el encabezado del adaptador de OpenCode
  // rechaza para la línea federada, aplicado al mismo sitio.
  //
  // El recordatorio por turno existe para un registro que EXISTE y se puede apartar. Sin
  // acuerdo no hay nada que recordar, y el suelo ya está puesto sin que nadie lo diga.
  //
  // Lo que sí sale sin acuerdo es la quinta ranura, y esto es el punto del salto: el para qué
  // nunca estuvo en el acuerdo —es del árbol, y el árbol no lo aparta—, así que silenciarlo
  // aquí devolvía el kit al hueco exacto que vino a cerrar. Callar el suelo es honesto porque
  // el suelo ya está cargado; callar el para qué no lo era, porque no lo estaba en ninguna parte.
  if (!acuerdo) {
    if (paraQue.texto) {
      return { inyectar: true, por: "para-que", texto: `[para qué del árbol: ${paraQue.texto}]`, nivel: nivelActual, turno, acuerdo: false, paraQue };
    }
    return { ...SIN_LORE, por: "sin-acuerdo", nivel: nivelActual, turno, paraQue };
  }

  const r = recordatorio({ acuerdo, turno, paraQue: paraQue.texto });
  // La apuesta del hook caida no apaga el kit: el recordatorio se guarda a mano y el
  // resto del acuerdo sigue en vigor. Por eso esto no es `inyectar: false` sino el
  // texto que el modulo ya sabe dar.
  const texto = r.texto ?? `sin hook: el registro de este turno se guarda a mano en ${r.en}.`;

  // La apertura es la puerta: pregunta que operacion esta abierta y entrega el veredicto de esa,
  // no el lugar donde el estado vive. Una vez por sesion, y solo si hay un acuerdo en vigor:
  // anunciarle a quien nunca pidio uno que no lo tiene es exactamente el ruido de entrada que R40
  // prohibe.
  const apertura = turno === null && acuerdo
    ? `${texto} · nivel ${nivelActual} · ${puertaDeOperacion(raiz)}`
    : texto;

  return { inyectar: true, por: r.por, texto: apertura, nivel: nivelActual, turno, acuerdo: Boolean(acuerdo), paraQue };
}
