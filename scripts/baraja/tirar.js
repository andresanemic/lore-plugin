// Baraja de perturbaciones para el Entre.
// Cada carta es un germen externo que instiga a reconstruir (Simondon).
// El coordinador ofrece una carta al detectar un loop o estancamiento.
// El usuario no necesita saber que existe — es como el radiador.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cache = null;

export function cargarBaraja() {
  if (cache) return cache;
  try {
    const ruta = join(__dirname, 'baraja.json');
    const raw = readFileSync(ruta, 'utf8');
    cache = JSON.parse(raw);
    return cache;
  } catch {
    return { cartas: [] };
  }
}

export function tirarCarta({ semilla = null, fuente = null } = {}) {
  const baraja = cargarBaraja();
  let cartas = baraja.cartas || [];
  if (!cartas.length) return null;

  if (fuente) {
    const filtradas = cartas.filter((c) => c.fuente === fuente);
    if (filtradas.length) cartas = filtradas;
  }

  let indice;
  if (typeof semilla === 'number') {
    indice = Math.floor(Math.abs(semilla)) % cartas.length;
  } else {
    indice = Math.floor(Math.random() * cartas.length);
  }

  const carta = cartas[indice];
  return {
    id: carta.id,
    fuente: carta.fuente,
    texto: carta.texto,
    total: baraja.cartas.length,
  };
}

export function tirarMultiples(n = 2, opts = {}) {
  const baraja = cargarBaraja();
  const total = baraja.cartas.length || 0;
  const usados = new Set();
  const resultados = [];
  const max = Math.min(n, total);
  let intentos = 0;
  while (resultados.length < max && intentos < total * 2) {
    intentos++;
    const carta = tirarCarta(opts);
    if (!carta || usados.has(carta.id)) continue;
    usados.add(carta.id);
    resultados.push(carta);
  }
  return resultados;
}

export function listarFuentes() {
  const baraja = cargarBaraja();
  return [...new Set((baraja.cartas || []).map((c) => c.fuente))];
}
