// Los hechos sobre la copia vendorizada del kernel, en un solo sitio.
//
// Antes de R2 el kit tenía la lista de módulos escrita a mano en dos archivos: `PINNED_MODULES` en
// la prueba de procedencia y `KERNEL_FILES` en el verificador de hosts. Dos listas, un solo hecho.
// Cuando el kernel ganó un módulo, las dos se olvidaron por separado y el kit siguió declarando
// una copia que ya no era la que traía.
//
// La fuente única es el DIRECTORIO vendorizado: los `*.js` que hay en
// `skills/vespi/core/kernel/`. No es la tabla de SOURCE.md, porque esa tabla es precisamente lo que
// la prueba tiene que comprobar; si la lista saliera de ahí, la comparación se comprobaría a sí
// misma. No es una constante en código, porque una constante es otra lista que se puede olvidar.
//
// Lo que sí sigue escrito desde fuera es el COMMIT fijado. Ese es el corte, y un corte lo declara
// una persona, no un directorio.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// El rótulo de la fuente canónica es relativo y fijo a propósito: nada de rutas absolutas de una
// máquina en un archivo que se distribuye a tres hosts.
export const CANONICAL_SOURCE_DIR = "founder/proyectos/vespi/kernel/src/";

// La prueba que se citan en SOURCE.md. Si se renombra, el texto del documento tiene que cambiar con ella.
export const PROVENANCE_TEST = "bench/vespi-kernel-provenance.test.mjs";

// Lo que el kit instala en el directorio del kernel para que Node lo trate como CommonJS. No viene
// del repositorio del kernel: es una decisión del kit, y por eso no se copia desde allí.
export const VENDORED_PACKAGE_JSON = '{"type":"commonjs"}';

// El encabezado son tres líneas. Ni dos ni cuatro: la prueba cuenta tres, el verificador quita tres.
export const HEADER_LINES = 3;

export function kernelDirOf(kitRoot) {
  return join(kitRoot, "skills", "vespi", "core", "kernel");
}

export function kernelModules(kernelDir) {
  if (!existsSync(kernelDir)) return [];
  return readdirSync(kernelDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => entry.name)
    .sort();
}

export function headerLinesOf(file) {
  return file.toString("utf8").split("\n").slice(0, HEADER_LINES);
}

// Los bytes que hay detrás del encabezado. Si el archivo no llega a tres líneas, no tiene
// encabezado, y el cuerpo es vacío: devolver un recorte inventado haría que un archivo roto
// pareciera coincidir con algo.
export function bodyAfterHeader(file) {
  let cut = 0;
  for (let line = 0; line < HEADER_LINES; line++) {
    const next = file.indexOf(0x0a, cut);
    if (next < 0) return Buffer.alloc(0);
    cut = next + 1;
  }
  return file.subarray(cut);
}

const SOURCE_ROW = /^\| `([A-Za-z0-9._-]+\.js)` \| `([0-9a-f]{64})` \| (\d+) \|$/gm;

export function readSourceRows(source) {
  return new Map([...String(source).matchAll(SOURCE_ROW)].map((row) => [row[1], { digest: row[2], bytes: Number(row[3]) }]));
}

// Lo que SOURCE.md ya afirma, para no inventar lo que hoy está escrito. Se lee del documento
// existente y no del día: `published` es un dato del corte, no de la fuente.
export function declaredBranch(source) {
  return String(source).match(/branch `([^`]+)`/)?.[1] ?? null;
}

export function declaredPublished(source) {
  return String(source).match(/published on (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
}

export function declaredCommit(source) {
  return String(source).match(/commit `([0-9a-f]{40})`/)?.[1] ?? null;
}

// El package.json del directorio vendorizado, si existe. Solo se conserva el que el kit ya
// instaló; su contenido se comprueba aparte para que nadie lo cambie en silencio.
export function readVendoredPackageJson(kernelDir) {
  const path = join(kernelDir, "package.json");
  if (!existsSync(path) || !statSync(path).isFile()) return null;
  return readFileSync(path, "utf8");
}