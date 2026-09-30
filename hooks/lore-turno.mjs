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
// La persona puede elegir el nivel y apagarlo. El defecto es `full` porque el
// recordatorio es lo que sostiene el acuerdo turno a turno, que es la segunda de las
// cuatro apuestas; apagarlo es una eleccion suya, no un defecto del kit.

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { leer as leerAcuerdo, recordatorio } from "../skills/use-lore/scripts/acuerdo.mjs";

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
    const temporal = `${target}.${process.pid}.tmp`;
    try {
      mkdirSync(base, { recursive: true });
      writeFileSync(temporal, `${JSON.stringify({ nivel, desde: new Date().toISOString() }, null, 2)}\n`);
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
  if (!acuerdo) {
    return { ...SIN_LORE, por: "sin-acuerdo", nivel: nivelActual, turno };
  }

  const r = recordatorio({ acuerdo, turno });
  // La apuesta del hook caida no apaga el kit: el recordatorio se guarda a mano y el
  // resto del acuerdo sigue en vigor. Por eso esto no es `inyectar: false` sino el
  // texto que el modulo ya sabe dar.
  const texto = r.texto ?? `sin hook: el registro de este turno se guarda a mano en ${r.en}.`;

  // La apertura nombra el nivel y donde vive el estado. Una vez por sesion, y solo si
  // hay un acuerdo en vigor: anunciarle a quien nunca pidio uno que no lo tiene es
  // exactamente el ruido de entrada que R40 prohibe.
  const apertura = turno === null && acuerdo
    ? `${texto} · nivel ${nivelActual} · el estado vive en FASES.md`
    : texto;

  return { inyectar: true, por: r.por, texto: apertura, nivel: nivelActual, turno, acuerdo: Boolean(acuerdo) };
}
