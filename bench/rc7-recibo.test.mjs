// RC7 — cierre local del recibo MYCELIUM: suite de regresión contra el defecto y susillingos.
//
// Uso:
//   LORE_KIT=<raíz del kit>  node --test --test-reporter=tap rc7-recibo.test.mjs
//
// Contra el candidato anterior esta suite debe fallar por las razones nombradas abajo; contra
// el candidato RC7 debe pasar. Una prueba que pasa en los dos lados no prueba nada y se quitó.
//
// Lo que NO hace esta suite: no corre agentes, no concede permisos, no modifica instalaciones
// reales, no invoca npm. Todo toca HOME sintéticos bajo os.tmpdir(), y cada uno se comprueba
// dentro de tmpdir antes de borrarse.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync,
  readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

// Sin LORE_KIT la prueba se corre contra este mismo repositorio, que es lo que `npm test`
// tiene que poder hacer sin que nadie le pase una variable.
const KIT_ROOT = resolve(process.env.LORE_KIT ?? join(import.meta.dirname, ".."));

const installer = await import(pathToFileURL(join(KIT_ROOT, "scripts", "installer.mjs")).href);

// --- utilidades ----------------------------------------------------------------

const SIN_NPM = mkdtempSync(join(tmpdir(), "rc7-sin-npm-"));

function entornoSinNpm(extra = {}) {
  return {
    ...process.env,
    PATH: SIN_NPM,
    PATHEXT: process.env.PATHEXT,
    npm_config_offline: "true",
    npm_config_registry: "http://127.0.0.1:9/",
    ...extra,
  };
}

function correr(args, env = entornoSinNpm()) {
  return spawnSync(process.execPath, args, { env, encoding: "utf8" });
}

function homeSintetico(tag) {
  return realpathSync.native(mkdtempSync(join(tmpdir(), `rc7-${tag}-`)));
}

function dentroDeTmp(path) {
  const rel = relative(realpathSync.native(tmpdir()), resolve(path));
  return rel === "" || (!rel.startsWith("..") && !/^[A-Za-z]:/.test(rel));
}

function limpiar(dir) {
  assert.ok(dentroDeTmp(dir), `no se borra fuera de tmpdir: ${dir}`);
  rmSync(dir, { recursive: true, force: true });
}

// Huella de un árbol, recalculada acá y no con el código del kit: si las dos compartieran una
// definición rota, coincidirían igual y la aserción no valdría.
function huellaArbol(root) {
  if (!existsSync(root)) return null;
  const h = createHash("sha256");
  const archivos = [];
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) recorrer(full);
      else if (e.isFile()) archivos.push(full);
    }
  };
  const st = lstatSync(root);
  if (st.isFile()) {
    h.update(root.split(/[\\/]/).pop());
    h.update("\0");
    h.update(readFileSync(root));
    return h.digest("hex");
  }
  recorrer(root);
  archivos.sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
  for (const a of archivos) {
    h.update(relative(root, a).replaceAll("\\", "/"));
    h.update("\0");
    h.update(readFileSync(a));
    h.update("\n");
  }
  return h.digest("hex");
}

// Una instalación mínima de la que el instalador parte: lo que un kit necesita para
// instalar, y nada que el kit no declare obligatorio.
function bundleMinimo(base) {
  const raiz = join(base, "kit");
  const archivos = [
    "scripts/lore-cli.mjs",
    "scripts/installer.mjs",
    "hooks/lore-guard.mjs",
    "hooks/lore-state.mjs",
    "hooks/lore-turno.mjs",
  ];
  for (const rel of archivos) {
    const p = join(raiz, ...rel.split("/"));
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, `// fixture ${rel}\nexport const stub = true;\n`, "utf8");
  }
  return raiz;
}

// Copia real del kit a un temporal, para poder mutilarlo sin tocar el original.
function kitRealEn(base, { quitar = null, etiqueta = "kit" } = {}) {
  const raiz = join(base, etiqueta);
  mkdirSync(raiz, { recursive: true });
  for (const rel of ["scripts", "hooks", "skills", "package.json"]) {
    const p = join(KIT_ROOT, rel);
    if (existsSync(p)) cpSync(p, join(raiz, rel), { recursive: true, force: true });
  }
  if (quitar) {
    for (const rel of quitar) rmSync(join(raiz, ...rel.split("/")), { force: true });
  }
  return raiz;
}

// Un conjunto de rutas relativas tal como las distribuye la entrada local.
function conjuntoRelativo(ruta) {
  return ruta.split(/[\\/]/).join("/").replace(/^entry\/[^/]+\//, "");
}

// --- A · el bundle completo es condición, no filtro -----------------------------
//
// RED contra el candidato anterior: `CLI_CHAIN` recorría ausencias con `continue` y
// después filtraba precisamente esas ausencias antes de verificar, de modo que un
// `packageRoot` vacío pasaba por verdad vacía y devolvía `verified: true`.

test("un paquete sin ningún miembro obligatorio falla en vez de declarar verificación", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-vacio-"));
  const home = homeSintetico("vacio");
  const vacio = join(base, "kit");
  mkdirSync(vacio, { recursive: true });

  assert.throws(
    () => installer.installCli({ home, packageRoot: vacio }),
    /bundle|obligatorio|required|missing|falt/i,
    "un paquete vacío no puede pasar por verificado: no hay nada que verificar",
  );
  limpiar(base);
  limpiar(home);
});

test("un paquete al que le falta un miembro obligatorio falla antes de instalar nada", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-incompleto-"));
  const home = homeSintetico("incompleto");
  const kit = kitRealEn(base, { quitar: ["hooks/lore-state.mjs"] });

  assert.throws(
    () => installer.installCli({ home, packageRoot: kit }),
    /bundle|obligatorio|required|missing|falt/i,
    "un bundle incompleto tiene que fallar nombrando lo que falta, no instalarse a medias",
  );

  const raiz = join(home, ".lore-plugin");
  if (existsSync(raiz)) {
    const written = [];
    const recorrer = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, e.name);
        if (e.isDirectory()) recorrer(full);
        else written.push(full);
      }
    };
    recorrer(raiz);
    assert.deepEqual(written, [], "una validación que falla no puede dejar instalación parcial");
  }
  limpiar(base);
  limpiar(home);
});

test("el fallo nombra el miembro que falta", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-nombre-"));
  const home = homeSintetico("nombre");
  const kit = kitRealEn(base, { quitar: ["hooks/lore-turno.mjs"] });

  let mensaje = "";
  try {
    installer.installCli({ home, packageRoot: kit });
  } catch (e) {
    mensaje = String(e && e.message);
  }
  assert.match(
    mensaje, /lore-turno\.mjs/,
    "un error de bundle sin el nombre del miembro es un error que no se puede resolver",
  );
  limpiar(base);
  limpiar(home);
});

// --- B · el perímetro se comprueba componente por componente --------------------
//
// RED contra el candidato anterior: se comprobaban la raíz y el archivo destino, pero los
// directorios intermedios no. Una junction en `.lore-plugin/hooks` sacaba la escritura del
// destino declarado y la verificación la daba por buena.

// La invarianta que importa no es «lanza»: es que nada se escriba fuera del destino declarado.
// Unjunction en un directorio que el diseño ya no atraviesa no produce ningún escape, y exigir
// que lance sería exigir que el instalador se queje de una ruta que no usa. Por eso cada caso
// afirma las dos cosas a la vez: o el instalador rechaza, o no escribe fuera.

function instalarConJunction(intermedio) {
  const base = mkdtempSync(join(tmpdir(), `rc7-${intermedio.replace(/[^a-z0-9]/gi, "-")}-`));
  const home = homeSintetico("junc");
  const kit = kitRealEn(base);
  const fuera = join(base, "fuera-del-destino");
  mkdirSync(fuera, { recursive: true });
  const enlace = join(home, ".lore-plugin", intermedio);
  mkdirSync(dirname(enlace), { recursive: true });
  symlinkSync(fuera, enlace, "junction");

  let fallo = null;
  try {
    installer.installCli({ home, packageRoot: kit, host: "claude" });
  } catch (e) {
    fallo = String(e && e.message);
  }
  return { base, home, fuera, fallo };
}

test("una junction intermedia no puede sacar la escritura del destino declarado", () => {
  // Los cuatro candidatos a directorio intermedio en el diseño vigente. El caso que la
  // revisión reprodujo (`hooks`) se incluye aunque hoy no se atraviese: si una versión futura
  // volviera a escribir ahí, la propiedad tiene que seguir sostenida.
  for (const intermedio of ["entry", "p", "staging", "hooks"]) {
    const { base, home, fuera, fallo } = instalarConJunction(intermedio);
    const escapado = readdirSync(fuera);
    assert.ok(
      fallo !== null || escapado.length === 0,
      `${intermedio}: la escritura se escapó del destino declarado sin que el instalador lo rechazara: ${escapado.join(", ")}`,
    );
    limpiar(base);
    limpiar(home);
  }
});

test("una junction en un componente que sí se atraviesa se rechaza antes de escribir", () => {
  for (const intermedio of ["entry", "p", "staging"]) {
    const { base, home, fuera, fallo } = instalarConJunction(intermedio);
    assert.ok(
      fallo !== null,
      `${intermedio}: un componente atravesado por la instalación no puede ser un enlace y seguir installing`,
    );
    assert.deepEqual(readdirSync(fuera), [], `${intermedio}: nada escrito fuera`);
    limpiar(base);
    limpiar(home);
  }
});

test("un enlace en un ancestro del destino no saca la escritura de la raíz física de HOME", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-ancestro-"));
  const homeReal = homeSintetico("ancestro-real");
  const kit = kitRealEn(base);
  const fuera = join(base, "fuera-ancestro");
  mkdirSync(fuera, { recursive: true });
  // HOME es un enlace a otro lado: todo lo que se escriba "bajo HOME" sale de la raíz real.
  const home = join(base, "home-enlazado");
  symlinkSync(homeReal, home, "junction");

  let fallo = null;
  try {
    installer.installCli({ home, packageRoot: kit, host: "claude" });
  } catch (e) {
    fallo = String(e && e.message);
  }
  assert.ok(
    fallo !== null || readdirSync(fuera).length === 0,
    "un HOME enlazado no puede escribir fuera de la raíz física a la que apunta",
  );
  limpiar(base);
  limpiar(homeReal);
});

test("una comparación léxica de prefijo no basta: la resolución física es la que cuenta", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-fisico-"));
  const home = homeSintetico("fisico");
  const kit = kitRealEn(base);
  const fuera = join(base, "hermano");
  mkdirSync(fuera, { recursive: true });
  mkdirSync(join(home, ".lore-plugin"), { recursive: true });
  symlinkSync(fuera, join(home, ".lore-plugin", "scripts"), "junction");

  let fallo = null;
  try {
    installer.installCli({ home, packageRoot: kit, host: "claude" });
  } catch (e) {
    fallo = String(e && e.message);
  }
  // El prefijo léxico dice .lore-plugin/scripts y la física dice otra carpeta. Lo que se
  // afirma es el hecho físico, no la excepción.
  assert.ok(
    fallo !== null || readdirSync(fuera).length === 0,
    "la comparación léxica de prefijo dejó pasar una escritura física fuera del destino",
  );
  limpiar(base);
  limpiar(home);
});

// --- C · instalar un corte no cambia el ejecutable de otro host -----------------

test("instalar un corte para un host no cambia los bytes que ejecuta otro host", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-cortes-"));
  const home = homeSintetico("cortes");
  const kitA = kitRealEn(base, { etiqueta: "kit-a" });
  const kitB = kitRealEn(base, { etiqueta: "kit-b" });
  writeFileSync(join(kitB, "scripts", "lore-cli.mjs"), "// CORTE B\nexport const stub = true;\n", "utf8");

  installer.installCli({ home, packageRoot: kitA, host: "claude" });
  const antes = huellaArbol(join(home, ".lore-plugin", "entry", "claude"));
  assert.ok(antes, "Claude necesita una entrada propia");

  installer.installCli({ home, packageRoot: kitB, host: "codex" });
  const despues = huellaArbol(join(home, ".lore-plugin", "entry", "claude"));
  assert.equal(
    despues, antes,
    "instalar el corte B para Codex cambió lo que Claude ejecuta: la raíz runtime es mutable y global",
  );
  limpiar(base);
  limpiar(home);
});

test("el paquete instalado es inmutable: volver a instalar otro corte no borra el anterior", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-inmutable-"));
  const home = homeSintetico("inmutable");
  const kitA = kitRealEn(base, { etiqueta: "kit-a" });
  const kitB = kitRealEn(base, { etiqueta: "kit-b" });
  writeFileSync(join(kitB, "scripts", "lore-cli.mjs"), "// CORTE B\nexport const stub = true;\n", "utf8");

  const a = installer.installCli({ home, packageRoot: kitA, host: "claude" });
  installer.installCli({ home, packageRoot: kitB, host: "claude" });

  assert.ok(
    a.packageRoot && existsSync(a.packageRoot),
    "el corte que una vez ejecutó este host tiene que seguir en disco, byte a byte",
  );
  assert.equal(
    huellaArbol(a.packageRoot), a.digest,
    "el paquete guardado no es el que se instaló: no hay procedencia que verificar",
  );
  limpiar(base);
  limpiar(home);
});

test("la entrada declara de qué corte es: hay un recibo de procedencia", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-procedencia-"));
  const home = homeSintetico("procedencia");
  const kit = kitRealEn(base);

  const r = installer.installCli({ home, packageRoot: kit, host: "claude" });
  assert.equal(r.verified, true, "una instalación correcta se declara verificada");
  assert.match(String(r.digest), /^[0-9a-f]{64}$/, "la entrada declara el digest del corte");
  assert.equal(
    r.digest, huellaArbol(r.entryRoot),
    "el digest certificado no es el del contenido efectivamente instalado",
  );
  limpiar(base);
  limpiar(home);
});

// --- D · Claude recibe la capacidad que la prosa promete -----------------------

test("Claude recibe la entrada local que la prosa nombra", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-claude-"));
  const home = homeSintetico("claude");
  const kit = kitRealEn(base);

  assert.equal(
    typeof installer.installClaude, "function",
    "no hay instalación de Claude: la prosa promete una ruta que ese host no tiene",
  );
  const r = installer.installClaude({ home, packageRoot: kit });
  assert.equal(r.cli.verified, true, "la entrada de Claude se verifica o no es nada");
  assert.ok(
    existsSync(join(r.cli.entryRoot, "scripts", "lore-cli.mjs")),
    "la entrada de Claude no trae el ejecutable",
  );
  limpiar(base);
  limpiar(home);
});

test("tres instalaciones aisladas desde HOME vacío traen el comando local completo", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-tres-"));
  const kit = kitRealEn(base);

  for (const [host, instalar] of [
    ["claude", (h) => installer.installClaude({ home: h, packageRoot: kit })],
    ["codex", (h) => installer.installCodex({ home: h, packageRoot: kit })],
    ["opencode", (h) => installer.installOpenCode({ home: h, packageRoot: kit })],
  ]) {
    const home = homeSintetico(`tres-${host}`);
    const r = instalar(home);
    const entrada = r.cli && r.cli.entryRoot;
    assert.ok(entrada, `${host}: la instalación no declara entrada local`);
    assert.ok(
      existsSync(join(entrada, "scripts", "lore-cli.mjs")),
      `${host}: la entrada local no trae el ejecutable que la prosa nombra`,
    );
    assert.equal(r.cli.verified, true, `${host}: la entrada no verifica su propio digest`);
    limpiar(home);
  }
  limpiar(base);
});

// --- E · la validación ocurre antes de cualquier mutación -----------------------

test("una preinstalación válida sobrevive a un bundle que falla la validación", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-previo-"));
  const home = homeSintetico("previo");
  const kitBueno = kitRealEn(base, { etiqueta: "kit-bueno" });
  const kitMalo = kitRealEn(base, { etiqueta: "kit-malo", quitar: ["hooks/lore-state.mjs"] });

  installer.installCodex({ home, packageRoot: kitBueno });
  const antes = {
    plugins: huellaArbol(join(home, ".agents", "plugins")),
    mercado: readFileSync(join(home, ".agents", "plugins", "marketplace.json"), "utf8"),
  };

  assert.throws(
    () => installer.installCodex({ home, packageRoot: kitMalo }),
    /bundle|obligatorio|required|missing|falt/i,
    "el bundle inválido tiene que rechazarse",
  );

  assert.equal(
    huellaArbol(join(home, ".agents", "plugins")), antes.plugins,
    "el marketplace ya había sido modificado antes de que la validación fallara",
  );
  assert.equal(
    readFileSync(join(home, ".agents", "plugins", "marketplace.json"), "utf8"), antes.mercado,
    "la configuración del host cambió en un intento que debía fallar sin tocar nada",
  );
  limpiar(base);
  limpiar(home);
});

// --- F · la entrada promete exactamente lo que distribuye ----------------------

test("la entrada local y su cadena no importan nada fuera de node y de sí misma", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-imports-"));
  const home = homeSintetico("imports");
  const kit = kitRealEn(base);
  const r = installer.installCli({ home, packageRoot: kit, host: "claude" });

  const mjs = [];
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) recorrer(full);
      else if (e.name.endsWith(".mjs")) mjs.push(full);
    }
  };
  recorrer(r.entryRoot);
  assert.ok(mjs.length > 0, "la entrada local debe traer su cadena");

  for (const archivo of mjs) {
    for (const m of readFileSync(archivo, "utf8").matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
      assert.ok(
        m[1].startsWith("node:") || m[1].startsWith("."),
        `${relative(r.entryRoot, archivo)} importa "${m[1]}": exige instalar dependencias que el host no tiene`,
      );
    }
  }
  limpiar(base);
  limpiar(home);
});

test("todo módulo que la entrada local importa transitivamente está en la cadena", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-cadena-"));
  const home = homeSintetico("cadena");
  const kit = kitRealEn(base);
  const r = installer.installCli({ home, packageRoot: kit, host: "claude" });

  const presentes = new Set();
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) recorrer(full);
      else if (e.name.endsWith(".mjs")) presentes.add(conjuntoRelativo(relative(r.entryRoot, full)));
    }
  };
  recorrer(r.entryRoot);

  assert.ok(
    presentes.has("scripts/lore-cli.mjs"),
    `la entrada local debe existir; distribuye: ${[...presentes].sort().join(", ")}`,
  );

  // Cerrar el cierre transitivo es lo que separa "funciona hoy" de "no promete de más": un
  // módulo que falta solo rompe cuando alguien lo importa, y ese alguien puede ser el host.
  const vistos = new Set();
  const pila = ["scripts/lore-cli.mjs"];
  while (pila.length) {
    const rel = pila.pop();
    if (vistos.has(rel)) continue;
    vistos.add(rel);
    if (!presentes.has(rel)) continue;
    const p = join(r.entryRoot, ...rel.split("/"));
    for (const m of readFileSync(p, "utf8").matchAll(/(?:from|import)\s+["'](\.[^"']+)["']/g)) {
      pila.push(join(dirname(rel), m[1]).replaceAll("\\", "/"));
    }
  }

  for (const rel of vistos) {
    assert.ok(
      presentes.has(rel),
      `la entrada importa transitivamente "${rel}", que no distribuye: el ejecutable no arranca`,
    );
  }
  limpiar(base);
  limpiar(home);
});

// --- G · la prosa dice la verdad ----------------------------------------------

function skillsDe(kit) {
  const archivos = [];
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) recorrer(full);
      else if (e.name.endsWith(".md")) archivos.push(full);
    }
  };
  recorrer(join(kit, "skills"));
  return archivos;
}

function ocurrencias(archivos, raiz, patron) {
  const halladas = [];
  for (const archivo of archivos) {
    for (const [i, linea] of readFileSync(archivo, "utf8").split("\n").entries()) {
      if (patron.test(linea)) halladas.push(`${relative(raiz, archivo)}:${i + 1}: ${linea.trim()}`);
    }
  }
  return halladas;
}

test("ninguna skill instalada manda correr un comando que solo resuelve en npm", () => {
  const archivos = skillsDe(KIT_ROOT);
  assert.deepEqual(
    ocurrencias(archivos, KIT_ROOT, /\bnpx\s+lore-plugin\b/),
    [],
    "una skill no puede instruir un comando cuya única resolución es el registro de npm",
  );
});

test("la prosa nombra el contrato de fallo, y lo nombra en inglés", () => {
  const mycelium = readFileSync(join(KIT_ROOT, "skills", "transmute-lore", "modes", "mycelium.md"), "utf8");
  assert.match(
    mycelium,
    /without (?:the )?(?:executable|CLI|runner)[^\n]*no (?:close|closure)/i,
    "la prosa debe decir en inglés qué se declara cuando el ejecutable no se puede correr",
  );
});

test("la prosa no afirma que el recibo cierre por sí solo", () => {
  const mycelium = readFileSync(join(KIT_ROOT, "skills", "transmute-lore", "modes", "mycelium.md"), "utf8");
  assert.doesNotMatch(
    mycelium,
    /the only thing that closes it/i,
    "el recibo es condición de persistencia, no certifica que la revisión ocurriera",
  );
  assert.match(
    mycelium,
    /review (?:performed|actually happened)[^\n]{0,120}receipt/i,
    "la prosa tiene que conservar la distinción entre revisión realizada y recibo escrito",
  );
});

test("la prosa que un agente lee para decidir y para navegar está en inglés", () => {
  // El alcance es la `description` del frontmatter y los encabezados: son las dos superficies
  // que el host lee antes de que el agente abra el cuerpo.
  //
  // Lo que queda fuera son los literales citados de lo que una persona dice: `poda en lore`,
  // `corre el micelio`, `guárdalo como formato base`. Son disparadores de búsqueda y están
  // en el idioma en que llegan; traducirlos rompe el disparador y además es reescribir la
  // evidencia de un caso real para que una prueba pasara.
  const SIN_LITERALES = /"[^"]*"|'[^']*'/g;
  const español = /\b(nunca|también|así|porque|pero|debe|deben|debería|además|entonces|cuando|donde|árbol|árboles|criterio|sesión|escritura|guardia)\b/i;
  const ofensas = [];

  const escanear = (donde, texto, linea) => {
    const limpio = texto.replace(SIN_LITERALES, '""');
    if (español.test(limpio)) ofensas.push(`${donde}${linea !== undefined ? `:${linea}` : ""}: ${texto.trim().slice(0, 100)}`);
  };

  for (const archivo of skillsDe(KIT_ROOT)) {
    const texto = readFileSync(archivo, "utf8");

    const fm = texto.split("---")[1] ?? "";
    for (const [i, linea] of fm.split("\n").entries()) {
      if (/^description:/i.test(linea)) escanear(`${relative(KIT_ROOT, archivo)} (description:${i + 1})`, linea);
    }
    for (const [i, linea] of texto.split("\n").entries()) {
      if (/^#{1,4}\s/.test(linea)) escanear(`${relative(KIT_ROOT, archivo)}:${i + 1}`, linea);
    }
  }

  assert.deepEqual(
    ofensas, [],
    `la prosa pública que el agente lee para decidir va en inglés; estas no lo cumplen:\n${ofensas.slice(0, 12).join("\n")}`,
  );
});

// --- H · el recibo sigue siendo un hecho --------------------------------------

test("el entorno de la prueba no resuelve npm ni npx", () => {
  const control = spawnSync("npx", ["lore-plugin", "mycelium", "receipt"], { env: entornoSinNpm(), encoding: "utf8" });
  assert.notEqual(
    control.status ?? 1, 0,
    "el control tiene que fallar: si npx resolviera, la prueba no demostraría independencia de npm",
  );
});

test("la entrada local escribe un recibo real sin npm, y su huella se recalcula por fuera", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-recibo-"));
  const home = homeSintetico("recibo");
  const kit = kitRealEn(base);
  const r = installer.installCli({ home, packageRoot: kit, host: "claude" });
  const tree = arbolFixture(join(base, "arbol"));

  // R4: escribir es el efecto y el efecto se pide —`--accept-always-on` es la autoridad de
  // escribir, no solo la del crecimiento. Lo que esta prueba sigue certifying es lo de antes:
  // la entrada local escribe un recibo real sin npm, y su huella se recalcula por fuera.
  const salida = correr([join(r.entryRoot, "scripts", "lore-cli.mjs"), "mycelium", "receipt", "--tree", tree, "--accept-always-on"]);
  assert.equal(salida.status, 0, `el recibo debería escribirse sin npm. stdout: ${salida.stdout} stderr: ${salida.stderr}`);

  const recibo = JSON.parse(readFileSync(join(tree, ".lore-mycelium"), "utf8"));
  assert.equal(recibo.version, 2, "recibo v2");
  assert.equal(recibo.digest, huellaLore(tree), "la huella debe ser la del contenido del Lore");
  assert.ok(Number.isInteger(recibo.alwaysOnBytes) && recibo.alwaysOnBytes > 0, "alwaysOnBytes debe estar grabado");

  const permitidos = new Set(["version", "digest", "alwaysOnBytes", "announce", "sweepType"]);
  for (const clave of Object.keys(recibo)) {
    assert.ok(permitidos.has(clave), `"${clave}" no es un hecho derivado del contenido: un recibo no certifica una revisión`);
  }
  limpiar(base);
  limpiar(home);
});

test("el crecimiento del bloque siempre-activo sin autoridad deja el recibo intacto", () => {
  const base = mkdtempSync(join(tmpdir(), "rc7-crecimiento-"));
  const home = homeSintetico("crecimiento");
  const kit = kitRealEn(base);
  const r = installer.installCli({ home, packageRoot: kit, host: "claude" });
  const tree = arbolFixture(join(base, "arbol"));
  const cli = join(r.entryRoot, "scripts", "lore-cli.mjs");

  assert.equal(correr([cli, "mycelium", "receipt", "--tree", tree, "--accept-always-on"]).status, 0, "primer recibo");
  const antes = readFileSync(join(tree, ".lore-mycelium"), "utf8");

  writeFileSync(join(tree, "lore", "principios.md"), `# Principios\n\nLey.\n\n${"criterio ".repeat(1200)}\n`, "utf8");

  const intento = correr([cli, "mycelium", "receipt", "--tree", tree]);
  assert.notEqual(intento.status, 0, "un crecimiento material sin autoridad no puede escribir el recibo");
  assert.equal(readFileSync(join(tree, ".lore-mycelium"), "utf8"), antes, "el recibo se sobrescribió mientras la autoridad estaba pendiente");

  const conAutoridad = correr([cli, "mycelium", "receipt", "--tree", tree, "--accept-always-on"]);
  assert.equal(conAutoridad.status, 0, `con autoridad debe escribir. salida: ${conAutoridad.stdout}`);
  limpiar(base);
  limpiar(home);
});

// --- fixture del árbol -------------------------------------------------------

const LORE_DEL_FIXTURE = [
  "lore/enrutamiento.md",
  "lore/identidad.md",
  "lore/index.md",
  "lore/principios.md",
];

function huellaLore(tree) {
  const h = createHash("sha256");
  for (const rel of LORE_DEL_FIXTURE) {
    const cuerpo = readFileSync(join(tree, ...rel.split("/")), "utf8").replace(/\r\n/g, "\n");
    h.update(rel);
    h.update("\0");
    h.update(createHash("sha256").update(cuerpo).digest("hex"));
    h.update("\n");
  }
  return h.digest("hex");
}

function arbolFixture(base) {
  const tree = join(base, "arbol");
  mkdirSync(join(tree, "lore"), { recursive: true });
  writeFileSync(join(tree, "CLAUDE.md"), [
    "# Fixture", "",
    "<!-- lore:always-on -->",
    "- `lore/identidad.md` — norte.",
    "- `lore/principios.md` — leyes.",
    "- `lore/index.md` — mapa.",
    "<!-- /lore:always-on -->", "",
  ].join("\n"), "utf8");
  writeFileSync(join(tree, "lore", "identidad.md"), "# Identity\n\nCriterion.\n", "utf8");
  writeFileSync(join(tree, "lore", "principios.md"), "# Principles\n\nLaw.\n", "utf8");
  writeFileSync(join(tree, "lore", "index.md"), "# Index\n\n- identity.md\n- principles.md\n", "utf8");
  writeFileSync(join(tree, "lore", "enrutamiento.md"), "# Routing\n\nNone.\n", "utf8");
  writeFileSync(join(tree, "FASES.md"), "# FASES\n\nState.\n", "utf8");
  return tree;
}