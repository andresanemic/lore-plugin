#!/usr/bin/env node
/**
 * stale-lore — verifica rastro de capacidades centrales y retira las que no se ejercen.
 *
 * Funciones puras que la skill invoca como procedimiento; sin efectos laterales
 * salvo escribir el changelog de retiros y leer el arbol para comprobar rastro.
 *
 * Diseno corregido el 2026-10-07 tras la primera corrida real (ver
 * `stale-lore.red.test.mjs` y el recibo `PRUEBA-EN-VIVO-2.5.md`). La version de 2.5
 * media una *mencion textual* y por eso daba falso-rojo sobre el kit (nadie menciona
 * las capacidades ahi) y falso-verde si un FASES las nombraba. Ahora mide *artefacto*:
 * el rastro es la forma de lo que la capacidad produce en el arbol del usuario.
 *
 * Regla de honestidad: una capacidad sin detector declarado no se puede declarar
 * `stale` — se reporta como `sinDetector` y no se retira. No se afirma lo que no
 * se midio.
 *
 * El campo `ejercido` que este modulo escribe en el recibo del kernel
 * sera leido por el kernel 0.1.5 cuando este exponga el contrato.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const STALE_POR_DEFECTO_DIAS = 7;

// La capacidad que mide no es la capacidad medida: no se retira a si misma.
const CAPACIDAD_MEDIDORA = 'stale-lore';

// --- 1. Derivar capacidades centrales del arbol ---

/**
 * Deriva la lista de capacidades centrales del arbol: una skill es una capacidad.
 * La fuente es `skills/<nombre>/SKILL.md`. No hay lista hardcodeada: si el arbol
 * no tiene skills, no declara capacidades.
 */
export function leeCapacidadesCentrales(raiz) {
  const capacidades = [];
  const skillsDir = join(raiz, 'skills');
  if (!existsSync(skillsDir) || !statSync(skillsDir).isDirectory()) return capacidades;
  for (const name of readdirSync(skillsDir)) {
    if (existsSync(join(skillsDir, name, 'SKILL.md'))) capacidades.push(name);
  }
  return capacidades.sort();
}

// --- 2. Mapa de rastros: que artefacto deja cada capacidad y donde ---

const esDirectorio = (p) => {
  try { return statSync(p).isDirectory(); } catch { return false; }
};
const esArchivo = (p) => {
  try { return statSync(p).isFile(); } catch { return false; }
};

/** Recorre un directorio y devuelve los archivos cuyo contenido cumple `predicado`. */
function archivosCon(raiz, subdir, predicado, limite = 400) {
  const base = join(raiz, subdir);
  const hallados = [];
  if (!esDirectorio(base)) return hallados;
  const pila = [base];
  while (pila.length && hallados.length < limite) {
    const actual = pila.pop();
    let entradas;
    try { entradas = readdirSync(actual, { withFileTypes: true }); } catch { continue; }
    for (const e of entradas) {
      const p = join(actual, e.name);
      if (e.isDirectory()) { if (!e.name.startsWith('.')) pila.push(p); continue; }
      if (!e.isFile() || !e.name.endsWith('.md')) continue;
      try { if (predicado(readFileSync(p, 'utf8'))) hallados.push(p); } catch {}
    }
  }
  return hallados;
}

/**
 * Rastro por capacidad: la forma de lo que produce, buscada donde el usuario trabaja.
 * `null` = sin detector declarado (no se puede afirmar stale).
 * Cada detector devuelve las fuentes halladas (vacío = no ejercida).
 */
const RASTROS = {
  'save-to-lore': (raiz) => {
    const pistas = archivosCon(raiz, 'lore', (t) => /\*\*Pista\b/.test(t));
    return pistas.length ? ['lore:Pista'] : [];
  },
  'use-lore': (raiz) => {
    const fuentes = [];
    for (const contrato of ['CLAUDE.md', 'AGENTS.md']) {
      const p = join(raiz, contrato);
      if (esArchivo(p)) {
        try { if (readFileSync(p, 'utf8').includes('<!-- lore:always-on -->')) fuentes.push(`contrato:${contrato}`); } catch {}
      }
    }
    return fuentes;
  },
  'transmute-lore': (raiz) => {
    const fuentes = [];
    const changelog = join(raiz, 'CHANGELOG.md');
    if (esArchivo(changelog)) {
      try { if (/## Capacidades retiradas/.test(readFileSync(changelog, 'utf8'))) fuentes.push('changelog:retiros'); } catch {}
    }
    return fuentes;
  },
  'brainstorming-lore': (raiz) => {
    const acuerdos = archivosCon(raiz, 'specs', (t) => /^# .*acuerdo/im.test(t) || /acuerdo de/i.test(t));
    return acuerdos.length ? ['specs:acuerdo'] : [];
  },
  'create-area': (raiz) => {
    const fuentes = [];
    if (esDirectorio(join(raiz, 'lore')) && (esDirectorio(join(raiz, 'proyectos')) || esDirectorio(join(raiz, 'projects')))) {
      fuentes.push('area:lore+proyectos');
    }
    return fuentes;
  },
  'create-bot': (raiz) => {
    const fuentes = [];
    if (esDirectorio(join(raiz, 'canon')) && esDirectorio(join(raiz, 'lore')) && esArchivo(join(raiz, 'CLAUDE.md'))) {
      fuentes.push('bot:canon+lore+contrato');
    }
    return fuentes;
  },
  'vespi': (raiz) => {
    const fuentes = [];
    const recibos = join(raiz, '.lore', 'receipts');
    if (esDirectorio(recibos)) {
      try { if (readdirSync(recibos).some((f) => f.endsWith('.json'))) fuentes.push('recibos:kernel'); } catch {}
    }
    const operaciones = archivosCon(raiz, 'operations', (t) => /^#\s.*recibo/im.test(t));
    if (operaciones.length) fuentes.push('operations:recibo');
    return fuentes;
  },
  // Sin detector declarado todavia: no se afirma nada sobre ellas.
  'create-project': null,
  [CAPACIDAD_MEDIDORA]: null,
};

// --- 3. Buscar rastro de uso ---

/**
 * Busca rastro de que una capacidad se ejercio en el arbol del usuario.
 * Retorna { encontrado, ultimoUso, fuentes, sinDetector }.
 * `ultimoUso` es null salvo que una fuente traiga fecha propia; no se fabrica.
 */
export function buscaRastroCapacidad(capacidad, raiz, opciones = {}) {
  const detector = Object.prototype.hasOwnProperty.call(RASTROS, capacidad) ? RASTROS[capacidad] : null;
  if (!detector) {
    return { encontrado: false, ultimoUso: null, fuentes: [], sinDetector: true };
  }
  const fuentes = detector(raiz) || [];
  return { encontrado: fuentes.length > 0, ultimoUso: null, fuentes, sinDetector: false };
}

// --- 4. Calculo de dias sin rastro ---

/**
 * Calcula los dias entre la ultima fecha de uso y ahora.
 * Retorna null si no hay fecha de uso (nunca se ejercio). Nunca inventa una cifra.
 */
export function diasSinRastro(ultimoUso, ahora) {
  if (!ultimoUso) return null;
  const ultimo = new Date(ultimoUso);
  if (Number.isNaN(ultimo.getTime())) return null;
  return Math.floor((ahora.getTime() - ultimo.getTime()) / 86400000);
}

// --- 5. Marcar campo ejercido en recibo ---

/**
 * Actualiza el campo `ejercido` en un recibo del kernel.
 * Estados validos: 'ejercido' | 'no-ejercido' | 'stale'.
 * Retorna una copia del recibo con el campo actualizado (no muta el original).
 */
export function marcaEjercido(recibo, estado) {
  const estadosValidos = new Set(['ejercido', 'no-ejercido', 'stale']);
  if (!estadosValidos.has(estado)) {
    throw new Error(`estado ejercido invalido: ${estado}. Validos: ${[...estadosValidos].join(', ')}`);
  }
  return { ...recibo, ejercido: estado, ejercido_en: new Date().toISOString() };
}

// --- 6. Verificar si una capacidad esta stale ---

/**
 * Determina si una capacidad esta stale. Una capacidad sin detector no es stale:
 * no se afirma lo que no se midio.
 * Retorna { stale, dias, nuncaEjercida, umbral, sinDetector }.
 */
export function verificaStale(capacidad, opciones = {}) {
  const ahora = opciones.ahora || new Date();
  const umbral = opciones.umbralDias || STALE_POR_DEFECTO_DIAS;
  const { ultimoUso = null, encontrado = false, sinDetector = false } = opciones;

  if (sinDetector) {
    return { stale: false, dias: null, nuncaEjercida: false, umbral, capacidad, sinDetector: true };
  }
  if (!encontrado && !ultimoUso) {
    return { stale: true, dias: null, nuncaEjercida: true, umbral, capacidad, sinDetector: false };
  }
  const dias = diasSinRastro(ultimoUso, ahora);
  if (dias === null) {
    // Hay rastro sin fecha propia: ejercida, sin dias que medir.
    return { stale: false, dias: null, nuncaEjercida: false, umbral, capacidad, sinDetector: false };
  }
  return { stale: dias > umbral, dias, nuncaEjercida: false, umbral, capacidad, sinDetector: false };
}

// --- 7. Ejecutar retiro con rastro declarativo ---

/**
 * Escribe entradas de retiro en el CHANGELOG del arbol.
 * Cada entrada: capacidad, fecha, diasSinUso (null = nunca), razon, reemplazo (o null).
 */
export function ejecutaRetiro(raiz, entradas) {
  if (!Array.isArray(entradas) || entradas.length === 0) return;
  const changelogPath = join(raiz, 'CHANGELOG.md');
  let contenido = existsSync(changelogPath) ? readFileSync(changelogPath, 'utf8') : '';

  const retiradas = entradas.map((e) => {
    const cuando = e.diasSinUso === null || e.diasSinUso === undefined
      ? 'nunca se ejercio'
      : `sin rastro de uso en ${e.diasSinUso} dias`;
    const mig = e.reemplazo ? `**Migracion:** usar ${e.reemplazo}\n` : `**Estado:** sin soporte\n`;
    return `- **${e.capacidad}** — retirada el ${e.fecha}. ${cuando}. Razon: ${e.razon}\n${mig}`;
  }).join('\n');

  const seccion = `\n## Capacidades retiradas\n\n${retiradas}\n`;
  if (!contenido.includes('## Capacidades retiradas')) {
    const h1 = contenido.indexOf('\n# ');
    if (h1 !== -1) {
      const punto = contenido.indexOf('\n', h1 + 1);
      contenido = contenido.slice(0, punto) + '\n' + seccion + contenido.slice(punto);
    } else {
      contenido = contenido + seccion;
    }
  } else {
    contenido = contenido.replace(/## Capacidades retiradas\n/, `## Capacidades retiradas\n\n${retiradas}\n`);
  }
  writeFileSync(changelogPath, contenido);
}

// --- 8. Flujo completo (orquestador) ---

/**
 * Ciclo completo: deriva capacidades, busca rastro, verifica stale, retira las que
 * pasaron el umbral. Nunca retira la capacidad medidora ni una sin detector.
 * Solo lectura si opciones.dryRun es true.
 */
export function ejecutaStaleLore(raiz, opciones = {}) {
  const umbral = opciones.umbralDias || STALE_POR_DEFECTO_DIAS;
  const ahora = opciones.ahora || new Date();
  const capacidades = leeCapacidadesCentrales(raiz);
  const retiros = [];
  const evaluadas = [];

  for (const cap of capacidades) {
    const rastro = buscaRastroCapacidad(cap, raiz, { ahora });
    const stale = verificaStale(cap, {
      ultimoUso: rastro.ultimoUso,
      encontrado: rastro.encontrado,
      sinDetector: rastro.sinDetector,
      umbralDias: umbral,
      ahora,
    });

    evaluadas.push({
      capacidad: cap,
      encontrado: rastro.encontrado,
      fuentes: rastro.fuentes,
      ...stale,
    });

    if (stale.stale && cap !== CAPACIDAD_MEDIDORA) {
      retiros.push({
        capacidad: cap,
        fecha: ahora.toISOString().slice(0, 10),
        diasSinUso: stale.dias,
        razon: stale.nuncaEjercida
          ? 'sin artefacto que pruebe ejercicio en el arbol'
          : `sin rastro de uso en ${stale.dias} dias`,
        reemplazo: opciones.reemplazos?.[cap] || null,
      });
    }
  }

  if (!opciones.dryRun && retiros.length > 0) ejecutaRetiro(raiz, retiros);

  return { evaluadas, retiros, dryRun: !!opciones.dryRun };
}
