#!/usr/bin/env node
/**
 * Cifra y descifra las cargas del bot.
 *
 *   node scripts/canon.js cifrar canon          → skills/{{BOT_SLUG}}/canon/ → canon.enc
 *   node scripts/canon.js cifrar ecosistema     → lore-ecosistema/           → ecosistema.enc
 *   node scripts/canon.js descifrar canon
 *   node scripts/canon.js descifrar ecosistema
 *   node scripts/canon.js --self-test
 *
 * ── Por qué cifra en distribución y no en reposo ──────────────────────────
 * Las cargas viajan cifradas y se descifran UNA vez al clonar. En reposo local el criterio
 * es Markdown plano, porque el agente lo consulta en cada decisión: cifrar en el punto de
 * consulta no prohíbe leer, encarece leer — y lo caro se deja de consultar.
 * La pregunta la abrió Mantra (LonelyAchemist); esta es la respuesta invertida.
 *
 * ── Frontera declarada ────────────────────────────────────────────────────
 * Esto protege el repositorio y el tránsito. NO protege contra quien tiene la passphrase,
 * y NO cubre lo que un modelo de IA hace con el texto una vez cargado en su contexto.
 * Prometer más sería producir confianza sin respaldo.
 *
 * AES-256-GCM con clave derivada por scrypt. Solo stdlib de Node — sin dependencias.
 * La passphrase se pide por stdin, jamás como argumento: un argumento queda en el historial
 * del shell y en la lista de procesos.
 */

const crypto = require('crypto');
const zlib   = require('zlib');
const fs     = require('fs');
const path   = require('path');

const RAIZ = path.join(__dirname, '..');

// Modo `nuevo` (sin ecosistema federado): borra la línea `ecosistema`. El texto de uso se
// genera desde estas claves, así que se ajusta solo.
const CARGAS = {
  canon:      { dir: 'skills/{{BOT_SLUG}}/canon', enc: 'skills/{{BOT_SLUG}}/canon.enc' },
  ecosistema: { dir: 'lore-ecosistema',           enc: 'ecosistema.enc' },
};

const CABECERA = '# {{BOT_SLUG}} · AES-256-GCM · no editar a mano';
const SCRYPT = { N: 1 << 15, r: 8, p: 1 };

/* ── criptografía ─────────────────────────────────────────────────────── */

const derivar = (pass, salt) =>
  crypto.scryptSync(pass, salt, 32, { ...SCRYPT, maxmem: 128 * 1024 * 1024 });

function cifrarBuffer(plano, pass) {
  const salt = crypto.randomBytes(16);
  const iv   = crypto.randomBytes(12);
  const c    = crypto.createCipheriv('aes-256-gcm', derivar(pass, salt), iv);
  const ct   = Buffer.concat([c.update(plano), c.final()]);
  return Buffer.concat([salt, iv, c.getAuthTag(), ct]);
}

function descifrarBuffer(blob, pass) {
  const salt = blob.subarray(0, 16);
  const iv   = blob.subarray(16, 28);
  const tag  = blob.subarray(28, 44);
  const d    = crypto.createDecipheriv('aes-256-gcm', derivar(pass, salt), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(blob.subarray(44)), d.final()]);
}

/* ── carpeta ⇄ blob ───────────────────────────────────────────────────── */

function leerCarpeta(dir, base = dir) {
  const salida = {};
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) Object.assign(salida, leerCarpeta(p, base));
    else salida[path.relative(base, p).split(path.sep).join('/')] = fs.readFileSync(p, 'utf8');
  }
  return salida;
}

function escribirCarpeta(dir, archivos) {
  for (const [rel, contenido] of Object.entries(archivos)) {
    const destino = path.join(dir, rel);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, contenido, 'utf8');
  }
}

const empaquetar    = archivos => zlib.gzipSync(Buffer.from(JSON.stringify(archivos), 'utf8'));
const desempaquetar = buf      => JSON.parse(zlib.gunzipSync(buf).toString('utf8'));

/* ── passphrase por stdin, sin eco ────────────────────────────────────── */

function pedirPassphrase(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {                       // pipe: se lee una línea y ya
      let dato = '';
      process.stdin.on('data', d => (dato += d));
      process.stdin.on('end', () => resolve(dato.trim()));
      return;
    }
    process.stderr.write(prompt);
    let pass = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const FIN    = ['\r', '\n', String.fromCharCode(4)];   // Enter, Ctrl-D
    const BORRAR = [String.fromCharCode(127), '\b'];       // Backspace, Delete
    const CTRL_C = String.fromCharCode(3);
    const onData = ch => {
      if (FIN.includes(ch)) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stderr.write('\n');
        pass ? resolve(pass) : reject(new Error('passphrase vacía'));
      } else if (ch === CTRL_C) {
        process.stderr.write('\n');
        process.exit(130);
      } else if (BORRAR.includes(ch)) {
        pass = pass.slice(0, -1);
      } else {
        pass += ch;
      }
    };
    process.stdin.on('data', onData);
  });
}

/* ── comandos ─────────────────────────────────────────────────────────── */

async function cifrar(nombre) {
  const { dir, enc } = CARGAS[nombre];
  const rutaDir = path.join(RAIZ, dir);
  if (!fs.existsSync(rutaDir)) throw new Error(`no existe ${dir}/ — nada que cifrar`);

  const archivos = leerCarpeta(rutaDir);
  const n = Object.keys(archivos).length;
  if (!n) throw new Error(`${dir}/ está vacío`);

  const pass = await pedirPassphrase(`Passphrase para cifrar «${nombre}»: `);
  const blob = cifrarBuffer(empaquetar(archivos), pass);
  fs.writeFileSync(path.join(RAIZ, enc), `${CABECERA}\n${blob.toString('base64')}\n`, 'utf8');
  console.log(`✓ ${n} archivo(s) de ${dir}/ → ${enc}`);
}

async function descifrar(nombre) {
  const { dir, enc } = CARGAS[nombre];
  const rutaEnc = path.join(RAIZ, enc);
  if (!fs.existsSync(rutaEnc)) throw new Error(`no existe ${enc}`);

  const b64  = fs.readFileSync(rutaEnc, 'utf8').split('\n').slice(1).join('');
  const pass = await pedirPassphrase(`Passphrase para descifrar «${nombre}»: `);

  let archivos;
  try {
    archivos = desempaquetar(descifrarBuffer(Buffer.from(b64, 'base64'), pass));
  } catch {
    throw new Error('no se pudo descifrar: passphrase incorrecta o archivo alterado');
  }

  escribirCarpeta(path.join(RAIZ, dir), archivos);
  console.log(`✓ ${Object.keys(archivos).length} archivo(s) → ${dir}/`);
}

/* ── self-test ────────────────────────────────────────────────────────── */

function selfTest() {
  const assert = require('assert');
  const original = { 'a.md': '# hola\nñandú 🜂', 'sub/b.md': 'x'.repeat(5000) };

  const blob = cifrarBuffer(empaquetar(original), 'clave-de-prueba');
  assert.deepStrictEqual(desempaquetar(descifrarBuffer(blob, 'clave-de-prueba')), original,
    'el round-trip debe devolver exactamente lo mismo');

  assert.throws(() => descifrarBuffer(blob, 'clave-equivocada'), /./,
    'una passphrase equivocada debe fallar, no devolver basura');

  const alterado = Buffer.from(blob);
  alterado[alterado.length - 1] ^= 1;
  assert.throws(() => descifrarBuffer(alterado, 'clave-de-prueba'), /./,
    'GCM debe detectar un ciphertext alterado');

  assert.ok(!blob.includes(Buffer.from('hola')), 'el texto plano no puede aparecer en el blob');

  console.log('✓ self-test: round-trip, passphrase incorrecta, alteración y fuga — todo OK');
}

/* ── entrada ──────────────────────────────────────────────────────────── */

const cargas = Object.keys(CARGAS).join('|');
const uso = `uso:
  node scripts/canon.js cifrar     <${cargas}>
  node scripts/canon.js descifrar  <${cargas}>
  node scripts/canon.js --self-test`;

(async () => {
  const [cmd, carga] = process.argv.slice(2);
  if (cmd === '--self-test') return selfTest();
  if (!['cifrar', 'descifrar'].includes(cmd) || !CARGAS[carga]) {
    console.error(uso);
    process.exit(1);
  }
  await (cmd === 'cifrar' ? cifrar(carga) : descifrar(carga));
})().catch(e => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
