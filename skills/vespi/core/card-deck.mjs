// Baraja de perturbaciones para el Entre.
// Cada carta es una perturbación candidata (su clase requiere evidencia posterior). La información es una
// instigación, no un dato). El coordinador ofrece una carta al detectar un loop o estancamiento.
// El usuario no necesita saber que existe — es como el radiador de un auto.
//
// Módulo compartido del kit: no es una skill. Vive en scripts/ como archivo único para que el
// instalador (copyFileSync) lo copie sin tratarlo como skill.

const CARTAS = [
  { id: "eno-1", fuente: "Eno", texto: "Trata lo que ya está presente." },
  { id: "eno-2", fuente: "Eno", texto: "Pregunta a tu jefe." },
  { id: "eno-3", fuente: "Eno", texto: "No rompas el silencio." },
  { id: "eno-4", fuente: "Eno", texto: "No hagas excepciones." },
  { id: "eno-5", fuente: "Eno", texto: "¿Cuál es la realidad de esta situación?" },
  { id: "eno-6", fuente: "Eno", texto: "Enciende una luz de emergencia." },
  { id: "eno-7", fuente: "Eno", texto: "Define el 'campo' como un objeto." },
  { id: "eno-8", fuente: "Eno", texto: "Corta un enlace vital." },
  { id: "eno-9", fuente: "Eno", texto: "Recuerda las sesiones tranquilas." },
  { id: "eno-10", fuente: "Eno", texto: "Toma un descanso." },
  { id: "eno-11", fuente: "Eno", texto: "Cierra los ojos y escucha los sonidos." },
  { id: "eno-12", fuente: "Eno", texto: "¿Qué es lo que realmente importa?" },
  { id: "eno-13", fuente: "Eno", texto: "¿Cuánto es demasiado?" },
  { id: "eno-14", fuente: "Eno", texto: "Haz lo más difícil primero." },
  { id: "eno-15", fuente: "Eno", texto: "Trabaja a una velocidad diferente." },
  { id: "eno-16", fuente: "Eno", texto: "Quita lo obvio y mantén lo ambiguo." },
  { id: "eno-17", fuente: "Eno", texto: "Cambia de instrumento." },
  { id: "eno-18", fuente: "Eno", texto: "No cambies nada y sigue trabajando." },
  { id: "schmidt-1", fuente: "Schmidt", texto: "El sistema es el mensaje." },
  { id: "schmidt-2", fuente: "Schmidt", texto: "¿Quién participa? ¿Quién falta?" },
  { id: "schmidt-3", fuente: "Schmidt", texto: "¿Cuál es la pregunta correcta?" },
  { id: "schmidt-4", fuente: "Schmidt", texto: "¿Qué pasaría si lo haces al revés?" },
  { id: "schmidt-5", fuente: "Schmidt", texto: "Mira desde el final." },
  { id: "schmidt-6", fuente: "Schmidt", texto: "¿Cuál es el costo real?" },
  { id: "schmidt-7", fuente: "Schmidt", texto: "¿A quién le importa?" },
  { id: "schmidt-8", fuente: "Schmidt", texto: "¿Qué puedes medir?" },
  { id: "schmidt-9", fuente: "Schmidt", texto: "La solución es el problema." },
  { id: "schmidt-10", fuente: "Schmidt", texto: "¿Cuál es la restricción que no has cuestionado?" },
  { id: "simondon-1", fuente: "Simondon", texto: "La información es una instigación, no un dato. ¿Qué te instiga?" },
  { id: "simondon-2", fuente: "Simondon", texto: "El germen más pequeño se extiende en todas las direcciones. ¿Cuál es tu germen?" },
  { id: "simondon-3", fuente: "Simondon", texto: "El autómata no inventa fines. ¿Tú sí?" },
  { id: "simondon-4", fuente: "Simondon", texto: "La relación no nace entre dos términos ya constituidos: es la resonancia interna de un sistema. ¿Qué sistema estás resonando?" },
  { id: "seneca-1", fuente: "Séneca", texto: "No eres maestro, eres testigo. Habla desde el hospital." },
  { id: "berman-1", fuente: "Berman", texto: "Lo sólido se desvanece en el aire. ¿Qué estás destruyendo al construir?" },
  { id: "berman-2", fuente: "Berman", texto: "El desarrollador construye y destruye, convencido de que los que sufren son los que más se beneficiarán. ¿A quién estás pasando por encima?" },
  { id: "camus-1", fuente: "Camus", texto: "Declara la frontera y lo que no pudiste decidir." },
  { id: "debord-1", fuente: "Debord", texto: "El espectáculo no es un conjunto de imágenes, sino una relación social mediatizada por imágenes. ¿Qué estás representando en vez de viviendo?" },
  { id: "debord-2", fuente: "Debord", texto: "En el espectáculo, lo que aparece es bueno y lo que es bueno aparece. ¿Qué estás mostrando en vez de haciendo?" },
  { id: "chejov-1", fuente: "Chéjov", texto: "Si hay un arma en el primer acto, debe dispararse en el tercero. ¿Qué dejaste colgado sin disparar?" },
  { id: "chejov-2", fuente: "Chéjov", texto: "El arte no soporta lo superfluo. ¿Qué pieza está de más?" },
  { id: "althusser-1", fuente: "Althusser", texto: "¿A quién le estás diciendo «¡Eh, usted!»? ¿Y quién se está volviendo sujeto al responderte?" },
  { id: "dialectica-1", fuente: "Dialéctica", texto: "¿Cuál es la negación de lo que estás haciendo? ¿Y qué la supera sin borrarla?" },
  { id: "picantes-1", fuente: "Los Picantes", texto: "La operación común importa más que el integrante aislado. ¿Estás coordinando o protagonizando?" },
  { id: "gamificacion-1", fuente: "Gamificación", texto: "El juego no es el premio. ¿Qué regla estás siguiendo que nadie propuso?" },
  { id: "deporte-1", fuente: "Deporte", texto: "El marcador no es el juego. ¿Qué estás midiendo en vez de jugando?" },
];

// Baraja del Entre acordada — acuerdo 013 (decisiones 1 a 11), cerrado el
// 2026-09-28 en `bot-lus-lore/specs/013-acuerdo-vespi/baraja/`. Escrita por Muse
// Spark 1.3 free desde el jardín y curada por el bot: 48 cartas en las cuatro
// familias de la decisión 4 (mestros y obras, decisiones de acuerdos, casos
// reales, derivas), dichas a medias para que la persona las termine, sin nombrar
// su fuente (decisión 2).
//
// Estado: pasa la prueba de la decisión 8 el 2026-10-09 — baraja propia 61% de
// reconocimiento (14/23) contra 42% de Eno (5/12) y 17% de sin carta (2/12),
// con la cuota de ruido más baja de las tres. Recibo, cohortes y veredicto con
// su inestabilidad declarada: `bot-lus-lore/operations/2026-10-09-baraja-prueba-
// decision-8/resultado.md`. La activación de la tirada silenciosa fue palabra de
// Andrés.
//
// Silenciosa (decisión 11): la saca un hook, nunca el agente, y ninguna persona
// usuaria la ve. Convive con el mazo anterior y con la carta de brainstorming-
// lore; no las reemplaza (decisión 6). La versión 0 del acuerdo queda congelada
// como control y no viaja aquí.
//
// Observación registrada, no corregida aquí: las entradas eno-* y schmidt-* de
// arriba son traducciones locales guardadas; las decisiones 6 y 9 piden consultar
// a Eno en vivo en su página pública y no guardar el mazo. Queda anotada para la
// campaña de compatibilidad kernel-proyectos.
const BARAJA_ENTRE = [
  { id: "entre-1", familia: "1 maestros y obras", texto: "¿Qué quieres controlar que puedes soltar hoy?" },
  { id: "entre-2", familia: "1 maestros y obras", texto: "¿Dónde puede rozar sin romperse ni fundirse?" },
  { id: "entre-3", familia: "1 maestros y obras", texto: "Pregunta quién es hoy, no quién era." },
  { id: "entre-4", familia: "1 maestros y obras", texto: "Lanza algo pequeño antes de dar el paso." },
  { id: "entre-5", familia: "1 maestros y obras", texto: "¿Qué aprendiste que no se borra al repetir?" },
  { id: "entre-6", familia: "1 maestros y obras", texto: "¿Qué mínimo necesitas hoy para poder decidir?" },
  { id: "entre-7", familia: "1 maestros y obras", texto: "Empieza siempre por lo mismo y luego varía." },
  { id: "entre-8", familia: "1 maestros y obras", texto: "¿Cuándo vuelven a ponerse al día contigo?" },
  { id: "entre-9", familia: "1 maestros y obras", texto: "¿Qué bueno conservas aunque esto se acabe?" },
  { id: "entre-10", familia: "1 maestros y obras", texto: "Nombra tú si esto cierra o continúa." },
  { id: "entre-11", familia: "1 maestros y obras", texto: "Muestra el desgaste y corta la explicación." },
  { id: "entre-12", familia: "1 maestros y obras", texto: "¿Qué objeto dice el adiós por ti?" },
  { id: "entre-13", familia: "2 decisiones", texto: "¿Quién puede decir que no, hasta cuándo, y a quién se le avisa?" },
  { id: "entre-14", familia: "2 decisiones", texto: "¿Qué miraste, y qué dejaste sin mirar?" },
  { id: "entre-15", familia: "2 decisiones", texto: "Toma la idea y pide permiso para el resto." },
  { id: "entre-16", familia: "2 decisiones", texto: "¿Puedes probarlo sin que te lo crean?" },
  { id: "entre-17", familia: "2 decisiones", texto: "¿Qué te aprieta hoy, y por dónde entrarías?" },
  { id: "entre-18", familia: "2 decisiones", texto: "¿Qué cambió de verdad antes de anotarlo?" },
  { id: "entre-19", familia: "2 decisiones", texto: "¿Puedes repetirlo antes de darlo por acordado?" },
  { id: "entre-20", familia: "2 decisiones", texto: "¿Esto te complica o aún no sabes cómo?" },
  { id: "entre-21", familia: "2 decisiones", texto: "¿Qué guardarías ahora, antes de que se pierda?" },
  { id: "entre-22", familia: "2 decisiones", texto: "¿Te emociona, te enorgullece y lo recomendarías?" },
  { id: "entre-23", familia: "2 decisiones", texto: "Devuélvelo trabado con lo que salió." },
  { id: "entre-24", familia: "2 decisiones", texto: "¿Esto te ayuda a cerrar o te retiene?" },
  { id: "entre-25", familia: "3 casos", texto: "¿Miraste lo tuyo, o solo lo de los demás?" },
  { id: "entre-26", familia: "3 casos", texto: "¿En qué momento se complicó lo que era simple?" },
  { id: "entre-27", familia: "3 casos", texto: "¿Lo mostraste antes de que te dieran permiso?" },
  { id: "entre-28", familia: "3 casos", texto: "¿Te dieron el qué, o también el cómo?" },
  { id: "entre-29", familia: "3 casos", texto: "¿Quién decidió esto, de verdad?" },
  { id: "entre-30", familia: "3 casos", texto: "¿Volviste a la fuente, o al resumen?" },
  { id: "entre-31", familia: "3 casos", texto: "¿El límite se aplica, o solo se dice?" },
  { id: "entre-32", familia: "3 casos", texto: "¿Lo ya acordado se hizo antes de renegociar?" },
  { id: "entre-33", familia: "3 casos", texto: "¿Qué se pierde si cierras ahora mismo?" },
  { id: "entre-34", familia: "3 casos", texto: "¿Quedó algo abierto antes de cambiar de tema?" },
  { id: "entre-35", familia: "3 casos", texto: "¿Quien retome sabrá cómo trabajan, o solo qué sigue?" },
  { id: "entre-36", familia: "3 casos", texto: "¿Qué podrías soltar en otras manos, y quién mira?" },
  { id: "entre-37", familia: "4 derivas", texto: "¿Qué distancia necesita para poder acercarse?" },
  { id: "entre-38", familia: "4 derivas", texto: "¿Habitas el lugar o solo lo recorres?" },
  { id: "entre-39", familia: "4 derivas", texto: "¿Aquí podrías vivir un día común?" },
  { id: "entre-40", familia: "4 derivas", texto: "¿Puedes querer varios lugares sin romperte?" },
  { id: "entre-41", familia: "4 derivas", texto: "¿Qué harías sin la excusa que te duele?" },
  { id: "entre-42", familia: "4 derivas", texto: "¿Te tratan como eras o como eres?" },
  { id: "entre-43", familia: "4 derivas", texto: "Quédate igual aunque cambiar te convenga." },
  { id: "entre-44", familia: "4 derivas", texto: "Cierra opciones para que exista una elección." },
  { id: "entre-45", familia: "4 derivas", texto: "Deja el misterio sin querer resolverlo." },
  { id: "entre-46", familia: "4 derivas", texto: "¿Vas lento, o vas a tu ritmo?" },
  { id: "entre-47", familia: "4 derivas", texto: "¿A quién cuidas y quién te cuida a ti?" },
  { id: "entre-48", familia: "4 derivas", texto: "Obedece solo si puedes hacerlo tuyo." },
];
for (const carta of BARAJA_ENTRE) {
  if (!CARTAS.some((c) => c.id === carta.id)) CARTAS.push({ ...carta, fuente: "baraja-entre" });
}

export function tirarCarta({ semilla = null, fuente = null } = {}) {
  let cartas = CARTAS;
  if (fuente) {
    const filtradas = cartas.filter((c) => c.fuente === fuente);
    if (filtradas.length) cartas = filtradas;
  }
  if (!cartas.length) return null;

  let indice;
  if (typeof semilla === "number") {
    indice = Math.floor(Math.abs(semilla)) % cartas.length;
  } else {
    indice = Math.floor(Math.random() * cartas.length);
  }

  const carta = cartas[indice];
  return { id: carta.id, fuente: carta.fuente, texto: carta.texto, total: CARTAS.length };
}

export function tirarMultiples(n = 2, opts = {}) {
  const usados = new Set();
  const resultados = [];
  const max = Math.min(n, CARTAS.length);
  let intentos = 0;
  while (resultados.length < max && intentos < CARTAS.length * 2) {
    intentos++;
    const carta = tirarCarta(opts);
    if (!carta || usados.has(carta.id)) continue;
    usados.add(carta.id);
    resultados.push(carta);
  }
  return resultados;
}

export function listarFuentes() {
  return [...new Set(CARTAS.map((c) => c.fuente))];
}

export function cargarBaraja() {
  return { cartas: CARTAS, total: CARTAS.length };
}
