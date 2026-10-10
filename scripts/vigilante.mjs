// El vigilante de las FASES — Lore Plugin 2.5.2.
//
// Verifica desde afuera, con un proceso aparte del que trabaja, que el estado de cada árbol con Lore
// (área, proyecto, bot: cualquier directorio con `FASES.md`) siga a su trabajo. Toma de Farolero que
// el verificador relee el almacén y recalcula, sin fiarse de lo que reporta quien ejecutó, y que lo
// bloqueado vuelve a una persona con su razón y un paso nombrado; toma de TEMIS que un revisor
// independiente reconstruye desde la historia y compara, y que el registro lleva un digest: un
// recibo editado a mano no verifica.
//
// Mide sincronía, no veracidad: dice si `FASES.md` se movió después del último trabajo del árbol, no
// si lo que dice es cierto. Eso va en `notCovered`, a la vista, igual que en el recibo del kernel.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export const RECIBO = ".lore-vigilante.json";
export const SALTOS = ".lore-fases-saltos";
const FASES = ["FASES.md", "PHASES.md"];
// Lo que no es trabajo del proyecto: ni el estado del kit, ni dependencias, ni temporales.
const IGNORADO = /(^|[\\/])(\.git|node_modules|\.next|dist|out|tmp|\.job|\.superpowers)([\\/]|$)|(^|[\\/])\.(lore|bot)-[^\\/]*$/;
const SALTAR_DIRS = new Set([".git", "node_modules", ".next", "dist", "out", "tmp", ".job", ".superpowers", "backups", "_worktrees-archivo"]);

const git = (cwd, ...args) => {
  try {
    return execFileSync("git", ["-c", "core.quotepath=off", "-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
  } catch {
    return null;
  }
};

export const archivoDeFases = (dir) => FASES.map((n) => join(dir, n)).find((p) => existsSync(p)) ?? null;

/** Árboles con FASES.md bajo `raiz` (incluida), sin entrar en carpetas que no son del proyecto. */
export function arbolesDe(raiz, { maxProfundidad = 6 } = {}) {
  const out = [];
  const visita = (dir, nivel) => {
    if (archivoDeFases(dir)) out.push(dir);
    if (nivel >= maxProfundidad) return;
    let entradas;
    try { entradas = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entradas) {
      if (!e.isDirectory() || e.isSymbolicLink() || SALTAR_DIRS.has(e.name)) continue;
      visita(join(dir, e.name), nivel + 1);
    }
  };
  visita(resolve(raiz), 0);
  return out;
}

/** El árbol (directorio con FASES.md) más cercano que contiene `archivo`, sin salir de `tope`. */
export function arbolDeArchivo(archivo, tope) {
  let dir = dirname(resolve(archivo));
  const limite = resolve(tope);
  for (;;) {
    if (archivoDeFases(dir)) return dir;
    if (dir === limite) return null;
    const padre = dirname(dir);
    if (padre === dir || !dir.startsWith(limite)) return null;
    dir = padre;
  }
}

const esFases = (rel) => FASES.includes(rel.split(/[\\/]/).pop() ?? "") ;
const relativoA = (base, p) => relative(base, p).split(sep).join("/");

/** Veredicto de un árbol: ¿`FASES.md` se movió después del último trabajo de ese árbol? */
export function estadoDeArbol(arbol) {
  const fases = archivoDeFases(arbol);
  const nombre = fases.split(/[\\/]/).pop();
  const top = git(arbol, "rev-parse", "--show-toplevel")?.trim();
  if (!top) return mtimes(arbol, fases);

  const rutaFases = relativoA(top, fases);
  const ancla = git(top, "log", "-1", "--format=%H", "--", rutaFases)?.trim() || null;
  const prefijo = relativoA(top, arbol);
  const alcance = prefijo === "" ? "." : prefijo;

  // Archivos que cambiaron en commits posteriores a la última vez que se tocó FASES.md.
  const rango = ancla ? [`${ancla}..HEAD`] : ["HEAD"];
  const nombres = git(top, "log", ...rango, "--name-only", "--format=", "--", alcance) ?? "";
  const commitsDespues = ancla
    ? Number((git(top, "rev-list", "--count", `${ancla}..HEAD`, "--", alcance) ?? "0").trim() || 0)
    : null;
  const posteriores = [...new Set(nombres.split("\n").map((l) => l.trim()).filter(Boolean))]
    .filter((f) => !esFases(f) && !IGNORADO.test(f) && arbolDeArchivo(join(top, f), top) === arbol);

  // Cambios sin commitear en este árbol (sin contar FASES.md ni lo ignorado).
  const sucios = (git(top, "status", "--porcelain", "--", alcance) ?? "").split("\n").filter(Boolean)
    .map((l) => l.slice(3).replace(/^"|"$/g, "").split(" -> ").pop())
    .filter((f) => !esFases(f) && !IGNORADO.test(f) && arbolDeArchivo(join(top, f), top) === arbol);
  const fasesSucia = (git(top, "status", "--porcelain", "--", rutaFases) ?? "").trim() !== "";

  const desfasada = posteriores.length > 0 || (sucios.length > 0 && !fasesSucia);
  return {
    arbol, fases: nombre, modo: "git",
    estado: desfasada ? "desfasada" : "al-dia",
    ancla,
    commitsDespues,
    archivosDespues: posteriores.slice(0, 12),
    archivosSinCommit: sucios.slice(0, 12),
  };
}

// Sin git no hay historia que reconstruir: se compara la fecha del archivo de estado con la del trabajo.
function mtimes(arbol, fases) {
  const tFases = statSync(fases).mtimeMs;
  let masNuevo = 0;
  let archivo = null;
  const recorre = (dir, n) => {
    if (n > 4) return;
    let es; try { es = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of es) {
      const p = join(dir, e.name);
      const rel = relativoA(arbol, p);
      if (IGNORADO.test(rel) || (e.isDirectory() && SALTAR_DIRS.has(e.name))) continue;
      if (e.isDirectory() && !e.isSymbolicLink()) { recorre(p, n + 1); continue; }
      if (!e.isFile() || esFases(rel)) continue;
      const t = statSync(p).mtimeMs;
      if (t > masNuevo) { masNuevo = t; archivo = rel; }
    }
  };
  recorre(arbol, 0);
  return {
    arbol, fases: fases.split(/[\\/]/).pop(), modo: "fechas",
    estado: masNuevo > tFases ? "desfasada" : "al-dia",
    ancla: null, commitsDespues: null,
    archivosDespues: archivo && masNuevo > tFases ? [archivo] : [],
    archivosSinCommit: [],
  };
}

function lecturaSaltos(raiz) {
  const f = join(raiz, SALTOS);
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").split("\n").filter(Boolean);
}

const canonico = (v) => JSON.stringify(v, (_k, x) => (x && typeof x === "object" && !Array.isArray(x)
  ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x));
export const sello = (cuerpo) => createHash("sha256").update(canonico(cuerpo)).digest("hex");

export const NO_CUBIERTO = [
  "que lo que dice FASES.md sea cierto: el vigilante mide si el estado se movió, no si describe bien lo hecho",
  "agentes o árboles sin historia de git: se comparan fechas de archivo, que un copiado altera",
  "el motivo de cada salto de la regla (LORE_FASES=skip): se cuentan y se listan, no se juzgan",
  "trabajo hecho fuera de este árbol de directorios",
];

export function verificar(raiz) {
  const base = resolve(raiz);
  const arboles = arbolesDe(base).map((a) => ({ ...estadoDeArbol(a), arbol: relativoA(base, a) || "." }));
  const saltos = lecturaSaltos(base);
  const cuerpo = {
    version: 1,
    raiz: ".",
    arboles,
    saltos: saltos.length,
    veredicto: arboles.some((a) => a.estado === "desfasada") ? "desfasado" : "al-dia",
    coverage: ["sincronía de FASES.md con el trabajo de cada árbol, reconstruida desde git o desde fechas", "cuenta de saltos de la regla"],
    notCovered: NO_CUBIERTO,
  };
  return { ...cuerpo, digest: sello(cuerpo), generadoEn: new Date().toISOString() };
}

export function escribirRecibo(raiz, recibo) {
  writeFileSync(join(resolve(raiz), RECIBO), `${JSON.stringify(recibo, null, 2)}\n`);
}

/** Relee el recibo y recalcula su digest: uno editado a mano, o de otra raíz, no verifica. */
export function verificarRecibo(ruta) {
  let r;
  try { r = JSON.parse(readFileSync(ruta, "utf8")); } catch { return { ok: false, motivo: "recibo ilegible" }; }
  const { digest, generadoEn: _g, ...cuerpo } = r;
  if (typeof digest !== "string" || sello(cuerpo) !== digest) return { ok: false, motivo: "el digest no coincide: el recibo se editó a mano" };
  return { ok: true, veredicto: r.veredicto, arboles: r.arboles.length };
}

export function informe(recibo) {
  const lineas = [`vigilante: ${recibo.veredicto === "al-dia" ? "todo al día" : "FASES desfasadas"} (${recibo.arboles.length} árbol(es), ${recibo.saltos} salto(s) de la regla)`];
  for (const a of recibo.arboles.filter((x) => x.estado === "desfasada")) {
    const hay = [...a.archivosDespues, ...a.archivosSinCommit];
    lineas.push(`  · ${a.arbol}/${a.fases}: ${a.commitsDespues ?? "?"} commit(s) y ${a.archivosSinCommit.length} cambio(s) sin commit después de su último estado — ${hay.slice(0, 4).join(", ")}${hay.length > 4 ? ", …" : ""}`);
  }
  if (recibo.veredicto !== "al-dia") lineas.push("  siguiente paso: concilia cada FASES.md con esos cambios y vuelve a correr `lore-plugin vigilante`.");
  lineas.push(`  no cubierto: ${recibo.notCovered.join(" · ")}`);
  return lineas.join("\n");
}
