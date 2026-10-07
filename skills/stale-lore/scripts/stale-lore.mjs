#!/usr/bin/env node
/**
 * stale-lore — verifica rastro de capacidades centrales y retira las que no se ejercen.
 *
 * Funciones puras que la skill invoca como procedimiento; sin efectos laterales
 * salvo escribir el changelog de retiros y leer el arbol para comprobar rastro.
 * Cubiertas por scripts/stale-lore.test.mjs.
 *
 * El campo `ejercido` que este modulo escribe en el recibo del kernel
 * sera leido por el kernel 0.1.5 cuando este exponga el contrato.
 * Hora funciona como extension compatible con 0.1.4.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

export const STALE_POR_DEFECTO_DIAS = 7;

// --- 1. Derivar capacidades centrales ---

const CAPACIDADES_DESCRIPCIONES = {
  'create-area': ['create-area', 'area'],
  'create-project': ['create-project', 'proyecto'],
  'create-bot': ['create-bot', 'bot'],
  'use-lore': ['use-lore', 'mapa'],
  'save-to-lore': ['save-to-lore', 'captura', 'destila'],
  'transmute-lore': ['transmute-lore', 'transmute', 'poda', 'micelio'],
  'brainstorming-lore': ['brainstorming-lore', 'brainstorm'],
  'vespi': ['vespi', 'operacion bajo presion'],
  'stale-lore': ['stale-lore', 'retira capacidades'],
};

/**
 * Deriva la lista de capacidades centrales del kit desde:
 * - Skills con frontmatter en el arbol (directorio skills/<nombre>/SKILL.md)
 * - README que anuncie las skills del kit
 * - Contratos (CLAUDE.md, AGENTS.md) con el bloque lore:always-on
 */
export function leeCapacidadesCentrales(raiz) {
  const capacidades = new Set();

  // Leer skills del arbol
  const skillsDir = join(raiz, 'skills');
  if (existsSync(skillsDir)) {
    try {
      const entries = readFileSync(skillsDir, 'utf8');
    } catch {}
    try {
      const { readdirSync } = require('node:fs');
      for (const name of readdirSync(skillsDir)) {
        const skillMd = join(skillsDir, name, 'SKILL.md');
        if (existsSync(skillMd)) capacidades.add(name);
      }
    } catch {}
  }

  // Leer README.md
  const readmePath = join(raiz, 'README.md');
  if (existsSync(readmePath)) {
    try {
      const readme = readFileSync(readmePath, 'utf8').toLowerCase();
      for (const [capacidad, terminos] of Object.entries(CAPACIDADES_DESCRIPCIONES)) {
        for (const termino of terminos) {
          if (readme.includes(termino.toLowerCase())) {
            capacidades.add(capacidad);
            break;
          }
        }
      }
    } catch {}
  }

  // Leer contratos con lore:always-on
  for (const contrato of ['CLAUDE.md', 'AGENTS.md']) {
    const path = join(raiz, contrato);
    if (existsSync(path)) {
      try {
        const contenido = readFileSync(path, 'utf8');
        if (contenido.includes('<!-- lore:always-on -->')) {
          // Extraer menciones de skills
          for (const capacidad of Object.keys(CAPACIDADES_DESCRIPCIONES)) {
            if (contenido.toLowerCase().includes(capacidad.toLowerCase())) {
              capacidades.add(capacidad);
            }
          }
        }
      } catch {}
    }
  }

  // Siempre incluir las capacidades canonicas del kit
  for (const cap of Object.keys(CAPACIDADES_DESCRIPCIONES)) {
    capacidades.add(cap);
  }

  return [...capacidades].sort();
}

// --- 2. Buscar rastro de uso ---

/**
 * Busca rastro de que una capacidad se ejercio en el arbol del usuario.
 * Fuentes de rastro:
 * - Recibos del kernel (.lore/receipts/<capacidad>.json)
 * - FASES.md (menciones en operaciones)
 * - Archivos del arbol (menciones en contenido)
 * Retorna { encontrado, ultimoUso, fuentes }.
 */
export function buscaRastroCapacidad(capacidad, raiz, opciones = {}) {
  const ahora = opciones.ahora || new Date();
  const fuentes = [];
  let ultimoUso = null;

  // Recibos del kernel
  const receiptsDir = join(raiz, '.lore', 'receipts');
  const receiptFile = join(receiptsDir, `${capacidad}.json`);
  if (existsSync(receiptFile)) {
    try {
      const raw = readFileSync(receiptFile, 'utf8');
      const recibos = JSON.parse(raw);
      if (Array.isArray(recibos) && recibos.length > 0) {
        // Ordenar por fecha descendiente
        const ordenados = [...recibos]
          .filter(r => r.at || r.fecha)
          .sort((a, b) => new Date(b.at || b.fecha) - new Date(a.at || a.fecha));
        if (ordenados.length > 0) {
          ultimoUso = ordenados[0].at || ordenados[0].fecha;
          fuentes.push('recibo');
        }
      }
    } catch {}
  }

  // FASES.md
  for (const fasesFile of ['FASES.md', 'fases.md']) {
    const fasesPath = join(raiz, fasesFile);
    if (existsSync(fasesPath)) {
      try {
        const contenido = readFileSync(fasesPath, 'utf8');
        if (contenido.toLowerCase().includes(capacidad.toLowerCase())) {
          fuentes.push('fases');
          // No extraemos fecha de FASES.md; el mero hecho de mencion es rastro reciente
          if (!ultimoUso) ultimoUso = ahora.toISOString();
        }
      } catch {}
    }
  }

  return {
    encontrado: fuentes.length > 0,
    ultimoUso,
    fuentes,
  };
}

// --- 3. Calculo de dias sin rastro ---

/**
 * Calcula los dias entre la ultima fecha de uso y ahora.
 * Retorna null si no hay fecha de uso (nunca se ejercio).
 */
export function diasSinRastro(ultimoUso, ahora) {
  if (!ultimoUso) return null;
  const ultimo = new Date(ultimoUso);
  const diff = ahora.getTime() - ultimo.getTime();
  return Math.floor(diff / 86400000);
}

// --- 4. Marcar campo ejercido en recibo ---

/**
 * Actualiza el campo `ejercido` en un recibo del kernel.
 * Estados validos: 'ejercido' | 'no-ejercido' | 'stale'.
 * El kernel 0.1.5 leera este campo; en 0.1.4 se escribe como extension compatible.
 * Retorna una copia del recibo con el campo actualizado (no muta el original).
 */
export function marcaEjercido(recibo, estado) {
  const estadosValidos = new Set(['ejercido', 'no-ejercido', 'stale']);
  if (!estadosValidos.has(estado)) {
    throw new Error(`estado ejercido invalido: ${estado}. Validos: ${[...estadosValidos].join(', ')}`);
  }
  return {
    ...recibo,
    ejercido: estado,
    ejercido_en: new Date().toISOString(),
  };
}

// --- 5. Verificar si una capacidad esta stale ---

/**
 * Determina si una capacidad esta stale (sin rastro en el umbral configurado).
 * Retorna { stale, dias, nuncaEjercida, umbral }.
 */
export function verificaStale(capacidad, opciones = {}) {
  const ahora = opciones.ahora || new Date();
  const umbral = opciones.umbralDias || STALE_POR_DEFECTO_DIAS;
  const ultimoUso = opciones.ultimoUso;

  if (!ultimoUso) {
    return { stale: true, dias: null, nuncaEjercida: true, umbral, capacidad };
  }

  const dias = diasSinRastro(ultimoUso, ahora);
  return {
    stale: dias > umbral,
    dias,
    nuncaEjercida: false,
    umbral,
    capacidad,
  };
}

// --- 6. Ejecutar retiro con rastro declarativo ---

/**
 * Escribe entradas de retiro en el CHANGELOG del arbol.
 * Cada entrada tiene: capacidad, fecha, diasSinUso, razon, reemplazo (o null).
 * Secciones: "## Capacidades retiradas".
 */
export function ejecutaRetiro(raiz, entradas) {
  if (!Array.isArray(entradas) || entradas.length === 0) return;

  const changelogPath = join(raiz, 'CHANGELOG.md');
  let contenido = '';
  if (existsSync(changelogPath)) {
    contenido = readFileSync(changelogPath, 'utf8');
  }

  const retiradas = entradas
    .map(e => {
      const mig = e.reemplazo
        ? `**Migracion:** usar ${e.reemplazo}\n`
        : `**Estado:** sin soporte\n`;
      return `- **${e.capacidad}** — retirada el ${e.fecha}. Sin rastro de uso en ${e.diasSinUso} dias. Razon: ${e.razon}\n${mig}`;
    })
    .join('\n');

  const seccion = `\n## Capacidades retiradas\n\n${retiradas}\n`;

  // Insertar seccion despues del primer H1 si existe
  if (!contenido.includes('## Capacidades retiradas')) {
    const h1Index = contenido.indexOf('\n# ');
    if (h1Index !== -1) {
      const insertPoint = contenido.indexOf('\n', h1Index + 1);
      contenido = contenido.slice(0, insertPoint) + '\n' + seccion + contenido.slice(insertPoint);
    } else {
      contenido = contenido + seccion;
    }
  } else {
    // Anadir a la seccion existente
    contenido = contenido.replace(
      /## Capacidades retiradas\n/,
      `## Capacidades retiradas\n\n${retiradas}\n`
    );
  }

  writeFileSync(changelogPath, contenido);
}

// --- 7. Flujo completo (orquestador) ---

/**
 * Ejecuta el ciclo completo: deriva capacidades, busca rastro, verifica stale,
 * retira las que pasaron el umbral. Retira en el changelog y marca recibos.
 * Solo modo lectura si opciones.dryRun es true.
 */
export function ejecutaStaleLore(raiz, opciones = {}) {
  const umbral = opciones.umbralDias || STALE_POR_DEFECTO_DIAS;
  const ahora = opciones.ahora || new Date();
  const capacidades = leeCapacidadesCentrales(raiz);
  const retiros = [];
  const evaluadas = [];

  for (const cap of capacidades) {
    const rastro = buscaRastroCapacidad(cap, raiz, { ahora });
    const stale = verificaStale(cap, { ultimoUso: rastro.ultimoUso, umbralDias: umbral, ahora });

    evaluadas.push({
      capacidad: cap,
      encontrado: rastro.encontrado,
      fuentes: rastro.fuentes,
      ...stale,
    });

    if (stale.stale) {
      retiros.push({
        capacidad: cap,
        fecha: ahora.toISOString().slice(0, 10),
        diasSinUso: stale.dias || 999,
        razon: stale.nuncaEjercida
          ? 'sin rastro de uso en el arbol; nunca se ejercio'
          : `sin rastro de uso en ${stale.dias} dias`,
        reemplazo: opciones.reemplazos?.[cap] || null,
      });
    }
  }

  if (!opciones.dryRun && retiros.length > 0) {
    ejecutaRetiro(raiz, retiros);
  }

  return {
    evaluadas,
    retiros,
    dryRun: !!opciones.dryRun,
  };
}
