import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// Garantía: el código que este repositorio publica lo parsea un parser real.
// CodeQL (extractor javascript-typescript) no puede procesar un archivo con
// error de sintaxis y GitHub lo reporta como «Could not process some files
// due to syntax errors». Esta prueba es la versión local de ese check.

const root = fileURLToPath(new URL("..", import.meta.url));

// Extensiones que `node --check` parsea sin dependencias. Es la frontera
// declarada: .ts/.tsx quedan fuera porque Node no los lee, y la frontera se
// verifica por inventario exacto abajo — un archivo nuevo de esas extensiones
// rompe la prueba en vez de pasar en silencio.
const EXTENSIONES_LOCALES = new Set([".js", ".mjs", ".cjs"]);
const FRONTERA_DECLARADA = ["hooks/opencode-statusline.tui.tsx"];

function recorrer(dir, encontrados = []) {
  for (const nombre of readdirSync(dir)) {
    if (nombre === ".git" || nombre === "node_modules") continue;
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) recorrer(ruta, encontrados);
    else encontrados.push(ruta);
  }
  return encontrados;
}

const archivos = recorrer(root);
const relativos = (rutas) => rutas.map((ruta) => relative(root, ruta).split(/[\\/]/).join("/")).sort();

test("el código publicado lo parsea Node, igual que lo lee CodeQL", () => {
  const revisables = archivos.filter((ruta) => EXTENSIONES_LOCALES.has(ruta.slice(ruta.lastIndexOf("."))));
  const roto = [];
  for (const ruta of revisables) {
    try {
      execFileSync(process.execPath, ["--check", ruta], { stdio: "pipe" });
    } catch (error) {
      const detalle = String(error.stderr || error.message).split("\n").find((linea) => linea.includes("SyntaxError")) || "SyntaxError";
      roto.push(`${relativos([ruta])[0]}: ${detalle.trim()}`);
    }
  }
  assert.deepEqual(roto, [], `archivos que ningún parser acepta (CodeQL tampoco):\n${roto.join("\n")}`);
});

test("la frontera .ts/.tsx existe, tiene inventario y no crece en silencio", () => {
  const fuera = relativos(archivos.filter((ruta) => /\.(tsx?|jsx)$/.test(ruta)));
  assert.deepEqual(
    fuera,
    FRONTERA_DECLARADA,
    "un archivo .ts/.tsx/.jsx nueva quedó fuera del parseo local: declararla en FRONTERA_DECLARADA con su razón, o cubrirla con un parser que la lea",
  );
});
