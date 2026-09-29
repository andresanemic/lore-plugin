#!/usr/bin/env node
/**
 * save-to-lore — salvaguardas verificables de S5 ("lo aprendido", RC4).
 *
 * Funciones puras que la skill invoca como procedimiento; sin efectos laterales
 * salvo leer el arbol para comprobar que un puntero de evidencia resuelve.
 * Cubiertas por scripts/save-to-lore-s5.test.mjs (corre dentro de `npm test`).
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Una nota esta arbitrada cuando su frontmatter `destilado` no esta vacio
// (incluido `nada`, que es arbitraje como ruido). Es exactamente lo que
// notas.md §5 ("Close and archive") escribe: no hay ningun campo `bucket`
// que leer — notas.md clasifica en cuatro categorias en prosa, pero el
// frontmatter que deja es solo `destilado:`. Pedir una categoria que nadie
// escribe dejaba la rama "arbitrada" inalcanzable con una nota real.
export function estaArbitrada(nota) {
  if (!nota || typeof nota !== "object") return false;
  const destilado = typeof nota.destilado === "string" ? nota.destilado.trim() : "";
  return destilado.length > 0;
}

// Ninguna nota se borra antes de arbitrarse; arbitrada se archiva, nunca se borra.
export function autorizaBorrado(nota) {
  if (!estaArbitrada(nota)) {
    return { ok: false, motivo: "sin-arbitrar: la nota no tiene destilado; minar y cerrar primero" };
  }
  return { ok: false, motivo: "archivada-no-borrada: la nota arbitrada se mueve a archivadas/, nunca se borra" };
}

// Punteros de evidencia: lineas `evidencia: <ruta relativa>` dentro de la Pista.
// Contrato sencillo y verificable (no un parser general de Markdown): la linea
// de evidencia empieza en la columna 0-3 con espacios, sin `>` y sin tabulador
// inicial; 4+ espacios es codigo indentado y nunca cuenta. Las lineas dentro de
// cercas (``` o ~~~, incluso anidadas en citas `>`) se ignoran: son ejemplos,
// no evidencia propia. Reutiliza el mismo rastreo de cercas de la seleccion
// de seccion; fuera de eso el escáner es limitado y no parsea Markdown general.
export function extraeEvidencia(textoPista, mascara) {
  const lineas = String(textoPista ?? "").split(/\r?\n/);
  const cercadas = Array.isArray(mascara) && mascara.length === lineas.length ? mascara : marcaCercas(lineas);
  const punteros = [];
  for (let i = 0; i < lineas.length; i++) {
    if (cercadas[i]) continue;
    const m = lineas[i].match(/^ {0,3}evidencia:[ \t]*(.+?)[ \t]*$/i);
    if (m) punteros.push(m[1].trim().replace(/^["']|["']$/g, ""));
  }
  return punteros;
}

function esRelativa(puntero) {
  if (!puntero || typeof puntero !== "string") return false;
  if (/^[a-zA-Z]:[\\/]/.test(puntero)) return false;
  if (puntero.startsWith("/") || puntero.startsWith("\\")) return false;
  if (/^(?:https?|notion|file):\/\//i.test(puntero)) return false;
  return true;
}

// Cada Pista nueva verifica: al menos un puntero relativo (absolutas y URLs
// rechazadas) y cada uno un archivo real que existe. Subir con `..` está
// permitido: una Pista en `lore/` cita a su hermana con `../notas/caso.md` —
// lo que manda es que la evidencia sea alcanzable desde la Pista, no que el
// puntero se quede bajo un directorio.
export function verificaEvidencia(textoPista, baseDir, mascara) {
  const punteros = extraeEvidencia(textoPista, mascara);
  if (punteros.length === 0) {
    return { ok: false, punteros, faltantes: [], motivos: ["sin-evidencia: la Pista no cita evidencia: <ruta relativa>"] };
  }
  const faltantes = [];
  const motivos = [];
  for (const p of punteros) {
    if (!esRelativa(p)) {
      motivos.push(`no-relativa: ${p} (la evidencia se cita como ruta relativa alcanzable)`);
      continue;
    }
    let esArchivo = false;
    try {
      const ruta = join(String(baseDir ?? "."), p);
      esArchivo = existsSync(ruta) && statSync(ruta).isFile();
    } catch {
      esArchivo = false;
    }
    if (!esArchivo) faltantes.push(p);
  }
  if (faltantes.length > 0) motivos.push(`no-resuelve: ${faltantes.join(", ")}`);
  return { ok: motivos.length === 0, punteros, faltantes, motivos };
}

// La pregunta de nivel: kit (cualquiera) vs raiz del jardin (esta persona).
export function preguntaNivel() {
  return [
    "¿Este aprendizaje trata de cómo funcionan el Lore y los agentes para cualquier persona,",
    "o de cómo trabaja esta persona?",
    "Si es para cualquier persona va al kit como PR o propuesta, nunca auto-commiteado al repositorio del kit.",
    "Si es de esta persona va a la raíz de su jardín, fuera del kit.",
  ].join(" ");
}

export function resuelveNivel(respuesta) {
  const r = String(respuesta ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // La maquina no adivina: exige un token explicito y una eleccion inequivoca.
  // `includes()` sobre subcadenas enrutaba mal ("toolkit" iba al kit,
  // "jardineria" al jardin); y una respuesta negada o con los dos destinos
  // ("no lo mandes al kit, es de esta persona") se asumia en vez de preguntar.
  const niega = /\b(no|ni|tampoco|nunca|jamas)\b/.test(r);
  const kit = /\bkit\b/.test(r) || r.includes("cualquier");
  const jardin = /\bjardin\b/.test(r) || r.includes("esta persona") || r.includes("raiz");
  if (!niega && kit && !jardin) {
    return {
      destino: "kit",
      via: "PR o propuesta",
      prohibido: "auto-commit al repositorio del kit",
    };
  }
  if (!niega && jardin && !kit) {
    return {
      destino: "raiz-del-jardin",
      via: "escritura directa en la raiz del jardin, fuera del kit",
      prohibido: "nada: ahi si se escribe directo",
    };
  }
  throw new Error(`nivel desconocido (${respuesta}): responde kit (cualquier persona) o jardin (esta persona)`);
}

// Alcance de una Pista nueva dentro de un archivo con varias: por encabezado
// exacto (--seccion "<texto exacto del encabezado>", solo caja y espacios
// exteriores se ignoran) o por intervalo de lineas 1-indexed (--lineas A-B).
// La via sin seleccion verifica el archivo completo y sirve solo como
// diagnostico, nunca como puerta de la Pista nueva. Dos encabezados exactos
// iguales no se desambiguan: fallan y piden --lineas A-B.
// Los encabezados dentro de cercas Markdown (``` o ~~~) se ignoran: no son
// Pistas, son ejemplos. No es un parser general: solo se rastrea la cerca
// (mismo caracter de apertura, longitud de cierre >= apertura). Las cercas
// anidadas en citas (`> ```) tambien se rastrean: se ignora el prefijo de cita
// antes de reconocer la marca. Los bloques indentados no se rastrean como
// cercas; los cubre el contrato de `extraeEvidencia` (4+ espacios no es
// evidencia).
function sinCita(linea) {
  let resto = String(linea ?? "");
  for (;;) {
    const m = resto.match(/^ {0,3}>[ \t]?/);
    if (!m) return resto;
    resto = resto.slice(m[0].length);
  }
}
function marcaCercas(lineas) {
  const dentro = new Array(lineas.length).fill(false);
  let caracter = null;
  let longitud = 0;
  let abierta = false;
  for (let i = 0; i < lineas.length; i++) {
    const vista = sinCita(lineas[i]);
    if (!abierta) {
      const abre = vista.match(/^ {0,3}(`{3,}|~{3,})/);
      if (abre) {
        caracter = abre[1][0];
        longitud = abre[1].length;
        abierta = true;
      }
    } else {
      const cierra = vista.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (cierra && cierra[1][0] === caracter && cierra[1].length >= longitud) {
        abierta = false;
        caracter = null;
        longitud = 0;
      } else {
        dentro[i] = true;
      }
    }
  }
  return dentro;
}
export function seleccionaSeccion(texto, nombre) {
  const buscado = String(nombre ?? "").trim().toLowerCase();
  if (buscado.length === 0) return { ok: false, motivo: "sin-seccion: falta el texto del encabezado" };
  const lineas = String(texto ?? "").split(/\r?\n/);
  const cercadas = marcaCercas(lineas);
  const candidatos = [];
  for (let i = 0; i < lineas.length; i++) {
    if (cercadas[i]) continue;
    const m = lineas[i].match(/^(#{1,6})\s+(.*)$/);
    if (m && m[2].trim().toLowerCase() === buscado) {
      candidatos.push({ inicio: i, nivel: m[1].length });
    }
  }
  if (candidatos.length === 0) return { ok: false, motivo: `sin-seccion: ningun encabezado es exactamente ${nombre}` };
  if (candidatos.length > 1) {
    const donde = candidatos.map((c) => c.inicio + 1).join(", ");
    return {
      ok: false,
      motivo: `ambigua: ${candidatos.length} encabezados son exactamente ${nombre} (lineas ${donde}); usa --lineas A-B`,
    };
  }
  const { inicio, nivel } = candidatos[0];
  let fin = lineas.length;
  for (let i = inicio + 1; i < lineas.length; i++) {
    if (cercadas[i]) continue;
    const m = lineas[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= nivel) {
      fin = i;
      break;
    }
  }
  return { ok: true, texto: lineas.slice(inicio, fin).join("\n"), desde: inicio + 1, hasta: fin };
}

export function seleccionaLineas(texto, rango) {
  const m = String(rango ?? "").match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (!m) return { ok: false, motivo: `rango-invalido: usa A-B con lineas 1-indexed (${rango})` };
  const lineas = String(texto ?? "").split(/\r?\n/);
  const desde = Number(m[1]);
  const hasta = Number(m[2]);
  if (desde < 1 || hasta > lineas.length || desde > hasta) {
    return { ok: false, motivo: `rango-invalido: ${rango} fuera de 1-${lineas.length}` };
  }
  return { ok: true, texto: lineas.slice(desde - 1, hasta).join("\n"), desde, hasta };
}

// CLI portable: `node skills/save-to-lore/scripts/save-to-lore.mjs
// --pista <pista.md> [--base <dir>] [--seccion "<encabezado>" | --lineas A-B]`.
// Sale 0 si la evidencia verifica y distinto de cero si falta; 2 por uso
// inválido. Sin --base se usa la carpeta que contiene la Pista, porque el
// puntero es relativo al archivo que guarda la Pista (p. ej.
// `../notas/caso.md` desde `lore/`). Con --seccion/--lineas se verifica solo
// la Pista nueva seleccionada; sin seleccion se verifica el archivo completo
// como diagnostico, nunca como puerta de la Pista nueva.
const esCLI = typeof process.argv[1] === "string" && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esCLI) {
  const args = process.argv.slice(2);
  const valor = (nombres) => {
    const i = args.findIndex((a) => nombres.includes(a));
    return i === -1 ? null : args[i + 1] ?? null;
  };
  if (args.includes("--help") || args.includes("-h")) {
    console.log("uso: node save-to-lore.mjs --pista <pista.md> [--base <dir>] [--seccion \"<encabezado>\" | --lineas A-B]");
    console.log("sin --seccion/--lineas verifica el archivo completo (diagnostico); con seleccion verifica la Pista nueva");
    process.exit(0);
  }
  const pistaPath = valor(["--pista"]);
  if (!pistaPath) {
    console.error("falta --pista <pista.md>");
    process.exit(2);
  }
  const seccion = valor(["--seccion"]);
  const lineas = valor(["--lineas"]);
  if (seccion !== null && lineas !== null) {
    console.error("usa --seccion o --lineas, no ambos");
    process.exit(2);
  }
  let texto;
  try {
    texto = readFileSync(pistaPath, "utf8");
  } catch {
    console.error(`no se lee la pista: ${pistaPath}`);
    process.exit(2);
  }
  let alcance = null;
  let mascaraSel;
  if (seccion !== null) {
    const sel = seleccionaSeccion(texto, seccion);
    if (!sel.ok) {
      console.error(sel.motivo);
      process.exit(2);
    }
    alcance = { modo: "seccion", seccion, desde: sel.desde, hasta: sel.hasta };
    texto = sel.texto;
  } else if (lineas !== null) {
    const sel = seleccionaLineas(texto, lineas);
    if (!sel.ok) {
      console.error(sel.motivo);
      process.exit(2);
    }
    // El rango se interpreta contra el archivo completo: la mascara de cercas
    // se calcula desde el inicio del archivo, no desde el inicio del recorte.
    // Un rango que empieza dentro de un ejemplo cercado no identifica una
    // Pista real (p. ej. un encabezado prestado): falla por seleccion (2).
    const mascaraCompleta = marcaCercas(texto.split(/\r?\n/));
    if (mascaraCompleta[sel.desde - 1]) {
      console.error(`fuera-de-ejemplo: --lineas ${lineas} empieza dentro de un ejemplo cercado; el rango debe identificar una Pista real, no un encabezado prestado`);
      process.exit(2);
    }
    alcance = { modo: "lineas", lineas, desde: sel.desde, hasta: sel.hasta };
    mascaraSel = mascaraCompleta.slice(sel.desde - 1, sel.hasta);
    texto = sel.texto;
  }
  const base = valor(["--base"]) ?? dirname(resolve(pistaPath));
  const r = verificaEvidencia(texto, base, mascaraSel);
  console.log(JSON.stringify(alcance ? { ...r, alcance } : r));
  process.exit(r.ok ? 0 : 1);
}
