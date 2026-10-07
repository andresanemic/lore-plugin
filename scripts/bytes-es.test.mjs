import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * La prosa en espanol se verifica en bytes, no releyendola: la consola de Windows
 * muestra `?` donde hay un ideograma, asi que leer el archivo no encuentra la corrupcion.
 * Este test la encuentra.
 *
 * El 2026-10-07 aparecieron 7 archivos del kit con ideogramas chinos donde habia
 * palabras espanolas («lo que se rompio», «tres coordinaciones», «// --- anclaje»).
 * Nadie los habia barrido porque ninguna suite mira bytes.
 */

const RAIZ = join(import.meta.dirname, '..');
const EXTENSIONES = new Set(['.md', '.json', '.mjs', '.js', '.cjs', '.txt', '.html', '.css', '.yml', '.yaml', '.toml']);
const EXCLUIR = /node_modules|[\\/]\.git[\\/]|[\\/]\.job[\\/]/;
// Ideogramas CJK y el caracter de reemplazo Unicode.
const CORRUPTO = /[\u4E00-\u9FFF\uFFFD]/g;

function archivos(dir, salida = []) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entrada.name);
    if (EXCLUIR.test(p)) continue;
    if (entrada.isDirectory()) { archivos(p, salida); continue; }
    const punto = entrada.name.lastIndexOf('.');
    if (punto === -1 || !EXTENSIONES.has(entrada.name.slice(punto))) continue;
    salida.push(p);
  }
  return salida;
}

test('ningun archivo del kit tiene ideogramas ni U+FFFD', () => {
  const malos = [];
  for (const p of archivos(RAIZ)) {
    const texto = readFileSync(p, 'utf8');
    const marcas = texto.match(CORRUPTO);
    if (marcas) {
      malos.push(`${relative(RAIZ, p).replaceAll('\\', '/')} -> ${[...new Set(marcas)].join(' ')}`);
    }
  }
  assert.deepEqual(
    malos,
    [],
    `archivos con corrupcion de bytes (ideogramas o U+FFFD donde va texto en espanol):\n  ${malos.join('\n  ')}`
  );
});
