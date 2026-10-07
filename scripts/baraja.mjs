// Baraja de perturbaciones para el Entre.
// Cada carta es un germen externo que instiga a reconstruir (Simondon: la información es una
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
