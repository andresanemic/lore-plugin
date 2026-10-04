// Fricción 1 del RC9: `sameTree` comparaba bytes y se negaba a actualizar una copia que solo
// differed en CR+LF contra LF. Aquí vive el contrato de esa comparación: qué es texto, qué
// diferencia cuenta y qué no, y qué clase de objeto nunca se sigue.
//
// La definición de texto está en `installer.mjs`, junto a la comparación que la usa. Aquí solo
// se declara lo que tiene que ser cierto, con los casos adversariales al lado de la bondad.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { sameTree } from "./installer.mjs";

const LF = (text) => text.replaceAll("\r\n", "\n");

/** Un árbol con los archivos dados, en `base/<name>`. Las claves son rutas con `/`. */
function tree(base, name, files) {
  const root = join(base, name);
  mkdirSync(root, { recursive: true });
  for (const [relative, content] of Object.entries(files)) {
    const path = join(root, ...relative.split("/"));
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  return root;
}

function scratch(t) {
  const base = mkdtempSync(join(tmpdir(), "lore-eol-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  return base;
}

function junction(t, target, link) {
  try {
    symlinkSync(target, link, "junction");
    return true;
  } catch (error) {
    if (error.code === "EPERM" || error.code === "EACCES") return false;
    throw error;
  }
}

// --- el caso real ---------------------------------------------------------------------

test("el caso real del 2026-10-04: arbol fuente en CRLF y copia instalada en LF son el mismo arbol", (t) => {
  const base = scratch(t);
  // La marca TUI tal como se instala desde un checkout de Windows.
  const crlf = "export default {\r\n  id: 'lore-plugin.statusline',\r\n  tui(api) { /* [Lore Plugin] */ }\r\n};\r\n";
  const source = tree(base, "fuente", {
    "plugins/opencode-statusline.tui.tsx": crlf,
    "skills/use-lore/SKILL.md": "---\r\nname: use-lore\r\n---\r\n",
  });
  const installed = tree(base, "instalada", {
    "plugins/opencode-statusline.tui.tsx": LF(crlf),
    "skills/use-lore/SKILL.md": "---\nname: use-lore\n---\n",
  });
  assert.equal(sameTree(source, installed), true);
});

test("un archivo suelto en CRLF y su copia en LF son el mismo archivo", (t) => {
  // La produccion compara archivos, no arboles: `opencode-statusline.tui.tsx` contra su copia.
  const base = scratch(t);
  const crlf = "export default {\r\n  id: 'lore-plugin.statusline',\r\n};\r\n";
  const source = join(base, "fuente.tsx");
  const installed = join(base, "instalada.tsx");
  writeFileSync(source, crlf);
  writeFileSync(installed, LF(crlf));
  assert.equal(sameTree(source, installed), true);
});

// --- texto: por extension y por contenido, con el binario por delante ------------------

test("un binario con CR LF que cambio de verdad no pasa por el mismo arbol", (t) => {
  const base = scratch(t);
  // NUL en la firma: binario por contenido, y sus finales de linea no se tocan.
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01]);
  const source = tree(base, "fuente", { "assets/logo.png": png });
  const instalado = tree(base, "instalado", { "assets/logo.png": Buffer.concat([png, Buffer.from([0x0d, 0x0a])]) });
  assert.equal(sameTree(source, instalado), false);
});

test("una extension de binario manda sobre el contenido: sin NUL tampoco es texto", (t) => {
  const base = scratch(t);
  // Sin un solo NUL, la heuristica de contenido lo declararia texto. La extension lo veta:
  // un `.png` nunca es texto por mucho que se lo pida su contenido.
  const source = tree(base, "fuente", { "assets/doble.png": "hola\r\n" });
  const instalado = tree(base, "instalado", { "assets/doble.png": "hola\n" });
  assert.equal(sameTree(source, instalado), false);
});

test("un archivo de texto con cambio real de contenido no es el mismo arbol", (t) => {
  const base = scratch(t);
  const source = tree(base, "fuente", { "SKILL.md": "---\nname: use-lore\n---\n" });
  const instalado = tree(base, "instalado", { "SKILL.md": "---\nname: create-lore\n---\n" });
  assert.equal(sameTree(source, instalado), false);
});

test("un cambio de una sola letra que solo existe en una linea terminada en CR LF tampoco pasa", (t) => {
  const base = scratch(t);
  // La comparacion no puede "dar por buena" el CR como si fuera el unico cambio: aqui el CR
  // esta en las dos copias y lo que cambia es la letra.
  const source = tree(base, "fuente", { "a.md": "uno\r\ndos\r\n" });
  const instalado = tree(base, "instalado", { "a.md": "uno\r\ntres\r\n" });
  assert.equal(sameTree(source, instalado), false);
});

// --- CR sueltos y mezclas --------------------------------------------------------------

test("mezcla de CRLF y LF contra todo LF: el mismo arbol", (t) => {
  const base = scratch(t);
  // Un archivo medio convertido a mano no es un motivo para negar la instalacion.
  const source = tree(base, "fuente", { "a.md": "uno\r\ndos\ntres\r\ncuatro\n" });
  const instalado = tree(base, "instalado", { "a.md": "uno\ndos\ntres\ncuatro\n" });
  assert.equal(sameTree(source, instalado), true);
});

test("mezcla de CRLF y LF contra todo CRLF: el mismo arbol", (t) => {
  const base = scratch(t);
  const source = tree(base, "fuente", { "a.md": "uno\r\ndos\ntres\r\n" });
  const instalado = tree(base, "instalado", { "a.md": "uno\r\ndos\r\ntres\r\n" });
  assert.equal(sameTree(source, instalado), true);
});

test("CR suelto sin LF no es un final de linea: contra LF no es el mismo arbol", (t) => {
  const base = scratch(t);
  // Un CR que no precede a un LF es un byte, no un final de linea. Si lo normalizaramos,
  // dos archivos que no son el mismo se contarian como el mismo.
  const source = tree(base, "fuente", { "a.md": "uno\r dos\n" });
  const instalado = tree(base, "instalado", { "a.md": "uno\r dos\n".replaceAll("\r", "\n") });
  assert.equal(sameTree(source, instalado), false);
});

test("CR LF contra CR CR LF: el segundo CR cuenta", (t) => {
  const base = scratch(t);
  // `\r\r\n` no es lo mismo que `\r\n`: al quitar el CR que precede al LF queda un CR de mas.
  const source = tree(base, "fuente", { "a.md": "uno\r\n" });
  const instalado = tree(base, "instalado", { "a.md": "uno\r\r\n" });
  assert.equal(sameTree(source, instalado), false);
});

test("CR LF contra LF LF: los dos LF no se funden", (t) => {
  const base = scratch(t);
  const source = tree(base, "fuente", { "a.md": "uno\r\n" });
  const instalado = tree(base, "instalado", { "a.md": "uno\n\n" });
  assert.equal(sameTree(source, installed), false);
});

// --- cardinalidad ----------------------------------------------------------------------

test("un archivo vacio es un archivo: dos arboles con el vacio son el mismo", (t) => {
  const base = scratch(t);
  const source = tree(base, "fuente", { "vacio.md": "" });
  const instalado = tree(base, "instalado", { "vacio.md": "" });
  assert.equal(sameTree(source, instalado), true);
});

test("un archivo vacio no es un archivo ausente", (t) => {
  const base = scratch(t);
  const source = tree(base, "fuente", { "vacio.md": "" });
  const instalado = tree(base, "instalado", {});
  assert.equal(sameTree(source, instalado), false);
});

test("un archivo de mas y un archivo de menos no son el mismo arbol", (t) => {
  const base = scratch(t);
  const comun = { "SKILL.md": "---\nname: use-lore\n---\n", "lore/identidad.md": "# I\n" };
  const source = tree(base, "fuente", comun);
  assert.equal(sameTree(source, tree(base, "con-uno-de-mas", { ...comun, "lore/notas.md": "# N\n" })), false);
  assert.equal(sameTree(source, tree(base, "con-uno-de-menos", { "SKILL.md": comun["SKILL.md"] })), false);
});

test("un archivo partido en dos no es el mismo archivo", (t) => {
  const base = scratch(t);
  // La cardinalidad cuenta. Sin ella, "x\\ny\\n" seria el mismo arbol que "x\\n" + "y\\n".
  const source = tree(base, "fuente", { "a.md": "x\ny\n" });
  const partido = tree(base, "partido", { "a.md": "x\n", "b.md": "y\n" });
  assert.equal(sameTree(source, partido), false);
});

// --- identidad por contenido, no por nombre ni por fecha -------------------------------

test("la identidad la da el contenido: mismo contenido con distinta fecha, mismo arbol", (t) => {
  const base = scratch(t);
  const source = tree(base, "fuente", { "a.md": "---\nname: use-lore\n---\n" });
  const instalado = tree(base, "instalado", { "a.md": "---\nname: use-lore\n---\n" });
  const antes = new Date("2001-02-03T04:05:06Z");
  utimesSync(join(source, "a.md"), antes, antes);
  utimesSync(join(instalado, "a.md"), new Date("2038-01-19T03:14:07Z"), new Date("2038-01-19T03:14:07Z"));
  assert.equal(sameTree(source, instalado), true);
});

test("el mismo contenido en otra posicion no es el mismo arbol", (t) => {
  const base = scratch(t);
  // El contenido decide la igualdad de dos archivos, pero la posicion es parte de lo que se
  // instala: `skills/use-lore/SKILL.md` no es `skills/create-lore/SKILL.md` porque se llame igual.
  const source = tree(base, "fuente", { "use-lore/SKILL.md": "mismo\n" });
  const otro = tree(base, "otro", { "create-lore/SKILL.md": "mismo\n" });
  assert.equal(sameTree(source, otro), false);
});

// --- enlaces simbolicos y junctions: no se siguen ----------------------------------------

test("una junction no es el directorio al que apunta", (t) => {
  const base = scratch(t);
  const destino = join(base, "destino");
  mkdirSync(join(destino), { recursive: true });
  writeFileSync(join(destino, "SKILL.md"), "mismo\n");

  const conDirectorio = tree(base, "con-directorio", { "use-lore/SKILL.md": "mismo\n" });
  const conJunction = tree(base, "con-junction", {});
  mkdirSync(join(conJunction, "use-lore"), { recursive: true });
  if (!junction(t, destino, join(conJunction, "use-lore"))) {
    t.skip("este sistema no permite crear junctions");
    return;
  }
  // Si la comparacion siguiera el enlace, las dos copias cloparian: mismo contenido al otro
  // lado del enlace. No se sigue: un enlace no es lo que apunta, y el instalador tiene que verlo.
  assert.equal(sameTree(conDirectorio, conJunction), false);
});

test("una junction colada no aporta su contenido a la comparacion", (t) => {
  const base = scratch(t);
  const comun = { "use-lore/SKILL.md": "mismo\n" };
  const source = tree(base, "fuente", comun);

  const conLink = tree(base, "con-link", comun);
  const conLinkVacio = tree(base, "con-link-vacio", comun);
  for (const [root, nombre] of [[conLink, "con-archivo"], [conLinkVacio, "vacio"]]) {
    const destino = join(base, `detras-${nombre}`);
    mkdirSync(destino, { recursive: true });
    if (nombre === "con-archivo") writeFileSync(join(destino, "oculto.md"), "esto no cuenta\n");
    if (!junction(t, destino, join(root, "escondite"))) {
      t.skip("este sistema no permite crear junctions");
      return;
    }
  }
  // Lo que hay detras de la junction no cambia el veredicto: hay una diferencia (la propia
  // junction) y esa diferencia no se cura con lo que el enlace esconda.
  assert.equal(sameTree(source, conLink), false);
  assert.equal(sameTree(source, conLinkVacio), false);
});

test("un enlace simbolico a un archivo no se sigue", (t) => {
  const base = scratch(t);
  const destino = join(base, "real.md");
  writeFileSync(destino, "contenido real\n");
  const source = tree(base, "fuente", { "real.md": "contenido real\n" });
  const conLink = tree(base, "con-link", {});
  try {
    symlinkSync(destino, join(conLink, "real.md"), "file");
  } catch (error) {
    if (error.code === "EPERM" || error.code === "EACCES") {
      t.skip("este sistema no permite crear enlaces simbolicos a archivos sin privilegio");
      return;
    }
    throw error;
  }
  assert.equal(sameTree(source, conLink), false);
});

// --- lo que el RC8 ya hacia, intacto -----------------------------------------------------

test("sin raiz, sin arbol y con arboles distintos: false en los tres casos", (t) => {
  const base = scratch(t);
  const arbol = tree(base, "arbol", { "a.md": "a\n" });
  assert.equal(sameTree(join(base, "no-existe"), arbol), false);
  assert.equal(sameTree(arbol, join(base, "tampoco-existe")), false);
  assert.equal(sameTree(join(base, "no-existe"), join(base, "tampoco-existe")), false);
  assert.equal(sameTree(base, join(base, "arbol")), false);
});

test("un archivo y un directorio con el mismo nombre no son el mismo arbol", (t) => {
  const base = scratch(t);
  const archivo = join(base, "a");
  writeFileSync(archivo, "contenido\n");
  const arbol = tree(base, "arbol", { a: "contenido\n" });
  assert.equal(sameTree(archivo, arbol), false);
});