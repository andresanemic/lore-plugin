// L5 (RC5): los hooks del kit llegan a OpenCode como plugin equivalente, instalado por
// `lore-plugin install --target opencode`, con las mismas pruebas (RC4 §El kit).
//
// Este archivo no simula el kit: monta un HOME aislado, corre el instalador real, y carga
// el plugin por el MISMO mecanismo que usa OpenCode v1.18.33 — el glob `{plugin,plugins}/*.{ts,js}`
// sobre el directorio de configuración, importando el módulo y tomando sus exports. Lo que
// OpenCode hace con ese módulo está en su binario instalado, no en su documentación; la
// adenda L5 lo prohíbe explícitamente como prueba de carga ("No confundir ambas APIs ni usar
// la existencia de un test simulado como prueba de carga por el host real"). Aquí se prueba
// el contrato; la carga real por el host se prueba aparte, en el smoke.
//
// El caso ciego que arranca todo: `hooks/lore-guard.mjs` nombra las herramientas como las
// nombra Claude — `Write`, `Edit`, `apply_patch`, y el destino en `file_path` o `command`.
// OpenCode 1.18.33 las nombra `write`, `edit`, `apply_patch`, con el destino en `filePath` y
// el parche en `patchText`. `structuredWritePaths` devuelve `[]` para las tres. Sin destino
// no hay clasificación, sin clasificación no hay bloqueo: la guardia entera pasa en silencio
// sobre un host que la usa todos los días. Eso es lo que este archivo primero ve fallar.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

import { installOpenCode, sameTree } from "./installer.mjs";
import { classifyWrite, structuredWritePaths } from "../hooks/lore-guard.mjs";
import { alVocabularioDelKit } from "../hooks/opencode-input.mjs";
import { readSessionRoot } from "../hooks/lore-state.mjs";

const RAIZ_KIT = resolve(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

// --- el mecanismo de carga de OpenCode v1.18.33, verbatim del binario instalado ---------
//
// ConfigPlugin.load: `scan("{plugin,plugins}/*.{ts,js}", {cwd, absolute, dot, symlink})`.
// Un solo nivel, sin recursión, y `.mjs` NO está en el patrón. Plugin.collect (el runtime)
// recorre `Object.values(modulo)` y tira `TypeError("Plugin export is not a function")` si
// algún export no es función ni un objeto con `server`.

function archivosPlugin(configDir) {
  return ["plugin", "plugins"].flatMap((sub) => {
    const full = join(configDir, sub);
    if (!existsSync(full)) return [];
    return readdirSync(full, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(ts|js)$/.test(entry.name))
      .map((entry) => join(full, entry.name))
      .sort();
  });
}

async function cargarComoOpenCode(configDir) {
  const funciones = [];
  for (const archivo of archivosPlugin(configDir)) {
    const modulo = await import(pathToFileURL(archivo).href);
    for (const valor of Object.values(modulo)) {
      if (typeof valor === "function") funciones.push(valor);
      else if (valor && typeof valor === "object" && typeof valor.server === "function") funciones.push(valor.server);
      else throw new TypeError("Plugin export is not a function");
    }
  }
  return funciones;
}

// ---蒙特aje -----------------------------------------------------------------------------

function arbolConLore(base, nombre) {
  const dir = join(base, nombre);
  mkdirSync(join(dir, "lore"), { recursive: true });
  writeFileSync(join(dir, "CLAUDE.md"), "# proyecto\n");
  writeFileSync(join(dir, "lore", "principios.md"), `# criterio de ${nombre}\n`);
  return dir;
}

/** HOME aislado con el plugin instalado, y un árbol de trabajo con uno propio y uno ajeno. */
function montar() {
  const base = mkdtempSync(join(tmpdir(), "lore-oc-"));
  SESION = `sesion-${base.replace(/[^a-zA-Z0-9]/g, "")}`;
  const home = join(base, "home");
  mkdirSync(home, { recursive: true });
  const configDir = join(home, ".config", "opencode");
  mkdirSync(configDir, { recursive: true });

  const trabajo = join(base, "trabajo");
  mkdirSync(trabajo, { recursive: true });
  const propio = arbolConLore(trabajo, "area-propia");
  const ajeno = arbolConLore(trabajo, "area-ajena");

  const resultado = installOpenCode({ home, packageRoot: RAIZ_KIT });
  return { base, home, configDir, trabajo, propio, ajeno, resultado };
}

async function abrir(montaje, raiz = montaje.propio) {
  const [plugin] = await cargarComoOpenCode(montaje.configDir);
  assert.equal(typeof plugin, "function", "OpenCode no encontró ningún plugin en el directorio de configuración");
  const hooks = await plugin({ directory: raiz, worktree: raiz, project: { id: "prueba" } });
  return hooks;
}

// La raíz de sesión se persiste en `<tmp>/lore-plugin-sessions/` y se indexa SOLO por
// session_id — así la jurisdicción queda anclada donde abrió la sesión y no en el cwd que
// sigue al `cd`. Consecuencia que esta suite tiene que respetar: cada montaje es una sesión
// distinta, y por eso lleva su propio id. Compartirlo haría que una prueba leyera la raíz
// de otra que ya no existe.
let SESION = "sin-sesion";

const antes = (tool, args) => [{ tool, sessionID: SESION, callID: "llamada-1" }, { args }];

/** El primer evento real de una sesión: leer algo. Arma raíz y base, y no dice nada. */
const armarSesion = (hooks, montaje) =>
  hooks["tool.execute.before"](...antes("read", { filePath: join(montaje.propio, "lore", "principios.md") }));

function avisoEnCola(hooks) {
  const salida = [];
  hooks["experimental.chat.system.transform"]({}, { system: salida });
  return salida.join("\n");
}

// ===========================================================================================
// 1. El contrato de carga: qué encuentra OpenCode y qué no tolera
// ===========================================================================================

test("el target opencode instala un plugin que el glob de OpenCode sí encuentra", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));

  const encontrados = archivosPlugin(montaje.configDir);
  assert.equal(encontrados.length, 1,
    `OpenCode v1 carga {plugin,plugins}/*.{ts,js}; se esperaba 1 archivo .js/.ts y hay ${encontrados.length}: ${encontrados.join(", ")}`);
});

test("el plugin exporta una sola función: OpenCode tira TypeError ante cualquier otro export", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));

  const [archivo] = archivosPlugin(montaje.configDir);
  const modulo = await import(pathToFileURL(archivo).href);
  const exports = Object.values(modulo);
  assert.equal(exports.length, 1, `un segundo export tumba el plugin entero: ${Object.keys(modulo).join(", ")}`);
  assert.equal(typeof exports[0], "function");
});

test("los módulos compartidos viajan como .mjs, fuera del glob, y el runtime no los carga de plugin", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));

  const dir = join(montaje.configDir, "plugin");
  assert.equal(existsSync(join(dir, "lore-guard.mjs")), true, "sin el núcleo compartido no hay clasificación");
  assert.equal(existsSync(join(dir, "lore-state.mjs")), true, "sin el estado no hay recibo ni base de sesión");
  assert.deepEqual(archivosPlugin(montaje.configDir).filter((f) => f.endsWith(".mjs")), [],
    ".mjs queda fuera de {plugin,plugins}/*.{ts,js}: el núcleo se comparte sin volverse plugin");
});

test("el núcleo que OpenCode ejecuta es el mismo, byte a byte (C1 del acuerdo RC4)", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));

  const dir = join(montaje.configDir, "plugin");
  for (const nombre of ["lore-guard.mjs", "lore-state.mjs"]) {
    assert.equal(
      sameTree(join(RAIZ_KIT, "hooks", nombre), join(dir, nombre)),
      true,
      `${nombre}: la copia que carga OpenCode difiere del origen`,
    );
  }
  assert.equal(montaje.resultado.verified, true, "el instalador no verificó por digest lo que instala");
});

test("instalar en opencode no toca opencode.jsonc ni borra los plugins que ya estaban", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));

  const ajenos = join(montaje.configDir, "plugin", "otro-plugin.js");
  writeFileSync(ajenos, "export const Otro = async () => ({})\n");
  const config = join(montaje.configDir, "opencode.jsonc");
  writeFileSync(config, '{\n  "$schema": "https://opencode.ai/config.json"\n}\n');
  const antes = readFileSync(config, "utf8");

  installOpenCode({ home: montaje.home, packageRoot: RAIZ_KIT });

  assert.equal(existsSync(ajenos), true, "instalar Lore no puede borrar el plugin de otra persona");
  assert.equal(readFileSync(config, "utf8"), antes,
    "los plugins locales se autodescubren: no hay que editar la configuración del usuario para instalar");
});

test("instalar sobre un directorio de plugin que es un enlace simbólico se niega, no lo sigue", (t) => {
  const base = mkdtempSync(join(tmpdir(), "lore-oc-symlink-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const home = join(base, "home");
  const destino = join(base, "real");
  mkdirSync(join(home, ".config", "opencode"), { recursive: true });
  mkdirSync(destino, { recursive: true });
  // Junction en Windows: es el enlace simbólico que un usuario real puede tener.
  symlinkSync(destino, join(home, ".config", "opencode", "plugin"), "junction");
  assert.throws(() => installOpenCode({ home, packageRoot: RAIZ_KIT }), /symbolic-link|symbolic/);
});

// ===========================================================================================
// 2. Equivalencia de conducta: las tres clases de R16
// ===========================================================================================

test("CIEGO R16: la guardia no ve ninguna escritura de OpenCode y por eso no bloquea nada", () => {
  // El defecto, medido sobre el núcleo que los tres hosts comparten. Si esto pasara, el
  // mapeo del adaptador ya no estaría haciendo falta y esta prueba se vuelve personaje.
  assert.deepEqual(structuredWritePaths("write", { filePath: "C:\\x\\lore\\principios.md" }), [],
    "OpenCode llama `write` con `filePath`; la guardia escucha `Write` con `file_path`");
  assert.deepEqual(structuredWritePaths("edit", { filePath: "C:\\x\\lore\\principios.md" }), [],
    "OpenCode llama `edit` con `filePath`");
  assert.deepEqual(structuredWritePaths("apply_patch", { patchText: "*** Update File: lore/principios.md" }), [],
    "OpenCode entrega el parche en `patchText`; la guardia lo lee de `command`");
});

test("propio pasa en silencio", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  await hooks["tool.execute.before"](...antes("write", {
    filePath: join(montaje.propio, "lore", "principios.md"),
    content: "otro criterio\n",
  }));

  assert.equal(avisoEnCola(hooks), "", "lo propio no genera aviso ni aviso de contexto");
});

test("ajeno se delega al permiso nativo de OpenCode; el hook no rechaza la escritura", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  const destino = join(montaje.ajeno, "lore", "principios.md");

  assert.doesNotThrow(
    () => hooks["tool.execute.before"](...antes("write", { filePath: destino, content: "x" })),
  );
  assert.equal(avisoEnCola(hooks), "", "el hook no sustituye el permiso nativo por un aviso de aprobación");
});

test("apply_patch ajeno se entrega al permiso nativo sin rechazo del hook", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  assert.doesNotThrow(
    () => hooks["tool.execute.before"](...antes("apply_patch", {
      patchText: `*** Begin Patch\n*** Update File: ${join(montaje.ajeno, "lore", "principios.md")}\n@@\n-a\n+b\n*** End Patch`,
    })),
  );
  assert.equal(avisoEnCola(hooks), "", "el hook deja decidir al gate `edit` de OpenCode");
});

test("apply_patch con destino propio pasa", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  await hooks["tool.execute.before"](...antes("apply_patch", {
    patchText: `*** Begin Patch\n*** Update File: ${join(montaje.propio, "lore", "principios.md")}\n@@\n-a\n+b\n*** End Patch`,
  }));
});

test("desconocido avisa sin bloquear (la apuesta del acuerdo: que OpenCode permita avisar sin bloquear)", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  const suelta = join(montaje.trabajo, "suelta.md");

  await hooks["tool.execute.before"](...antes("write", { filePath: suelta, content: "x" }));

  const aviso = avisoEnCola(hooks);
  assert.match(aviso, /Lore Plugin/, "lo desconocido se dice, no se bloquea en silencio");
  assert.ok(aviso.includes(suelta), "el aviso nombra la ruta");
});

test("la memoria de la sesión es jurisdicción propia en los tres hosts (NC-B-2, regresión permanente)", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  // La memoria de Claude Code sigue siendo propia: el arreglo de NC-B-2 no puede romperse
  // por meter un tercer host. El nombre de proyecto se deriva de la raíz —un nombre
  // inventado aquí pasaba solo con el arreglo anterior, que miraba la forma de la ruta.
  const raizKit = resolve(homedir(), ".claude", "projects", RAIZ_KIT.replace(/[^A-Za-z0-9]/g, "-"), "memory");
  assert.equal(classifyWrite(RAIZ_KIT, join(raizKit, "nota.md")), "own");

  // Y el propio OpenCode no se bloquea ni se avisa de su propia memoria de sesión.
  const sesionPropia = join(tmpdir(), "lore-plugin-sessions", "algo.json");
  assert.equal(classifyWrite(montaje.propio, sesionPropia), "own",
    "el estado de sesión del propio kit es jurisdicción propia, no desconocido");
  await hooks["tool.execute.before"](...antes("write", { filePath: sesionPropia, content: "{}" }));
  assert.equal(avisoEnCola(hooks), "", "y no genera ruido: un kit no avisa de sus propios archivos");
});

test("payload malformado: abierto, igual que en Claude y Codex", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  // El acuerdo RC4 no nombra ningún punto donde la guardia falle cerrada, y el encabezado de
  // hooks/codex-guard.mjs dice lo contrario en una línea: "Fails open on any error". Un fallo
  // cerrado aquí rompería la equivalencia de conducta —el propio host empezaría a bloquear
  // escrituras que los otros dos dejan pasar— y no hay ninguna razón acordada para pagarlo.
  for (const [tool, args] of [
    ["write", {}],
    ["write", null],
    ["write", { filePath: 42 }],
    ["edit", undefined],
    ["apply_patch", { patchText: "" }],
    ["tool-que-no-existe", { filePath: "x" }],
  ]) {
    await hooks["tool.execute.before"](...antes(tool, args));
  }
  assert.equal(avisoEnCola(hooks), "", "un payload que no se puede leer no produce veredicto ni ruido");
});

test("el fallo cerrado que sí exige el acuerdo es el del instalador: digest distinto no es instalación", (t) => {
  const base = mkdtempSync(join(tmpdir(), "lore-oc-cerrado-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const home = join(base, "home");
  const packageRoot = join(base, "paquete");
  mkdirSync(join(packageRoot, "skills", "use-lore"), { recursive: true });
  mkdirSync(join(packageRoot, "hooks"), { recursive: true });
  writeFileSync(join(packageRoot, "skills", "use-lore", "SKILL.md"), "---\nname: use-lore\n---\n");
  writeFileSync(join(packageRoot, "hooks", "opencode-plugin.js"), "export const P = async () => ({})\n");
  writeFileSync(join(packageRoot, "hooks", "opencode-input.mjs"), "export const input = true;\n");
  writeFileSync(join(packageRoot, "hooks", "lore-guard.mjs"), "export const x = 1;\n");
  writeFileSync(join(packageRoot, "hooks", "lore-state.mjs"), "export const y = 1;\n");
  writeFileSync(join(packageRoot, "hooks", "lore-turno.mjs"), "export const marca = () => '[Lore Plugin]'; export const nivel = () => 'full';\n");
  writeFileSync(join(packageRoot, "hooks", "opencode-statusline.tui.tsx"), "export default { id: 'lore-plugin.statusline', tui(api) { api.slots.register({ slots: { app_bottom: () => <text>[Lore Plugin]</text> } }); } };\n");
  // La entrada local y su cadena son obligatorias desde RC7. Este paquete mínimo las declara:
  // un fixture que las omitiera no mediría el instalador que se instala, sino otro.
  mkdirSync(join(packageRoot, "scripts"), { recursive: true });
  mkdirSync(join(packageRoot, "skills", "use-lore", "scripts"), { recursive: true });
  writeFileSync(join(packageRoot, "scripts", "lore-cli.mjs"), "// local entry\n");
  writeFileSync(join(packageRoot, "scripts", "installer.mjs"), "// installer\n");
  writeFileSync(join(packageRoot, "skills", "use-lore", "scripts", "acuerdo.mjs"), "export const acuerdo = {};\n");

  const resultado = installOpenCode({ home, packageRoot });
  assert.equal(resultado.verified, true);
  // Y la entrada local queda verificada con su propio digest, no de palabra.
  assert.equal(resultado.cli.verified, true);

  // C1: el instalador verifica por digest la copia que cada host ejecuta. Si alguien altera
  // lo instalado, la verificación tiene que delatarlo — no dar por buena una copia distinta.
  const instalado = join(home, ".config", "opencode", "plugin", "lore-guard.mjs");
  writeFileSync(instalado, "export const x = 2;\n");
  assert.equal(sameTree(join(packageRoot, "hooks", "lore-guard.mjs"), instalado), false);
});

// ===========================================================================================
// 3. Estado del Lore: la misma postergación que en PostToolUse
// ===========================================================================================

test("no interviene al abrir: el primer evento arma la base y un árbol intacto no dice nada", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  // Sin `session.start`, el primer evento de la sesión es lo que arma la base. Es el mismo
  // contrato de postergación de `codex-guard.mjs`: el primer avistamiento nunca interviene.
  await armarSesion(hooks, montaje);
  await hooks["tool.execute.after"]({ tool: "read", sessionID: SESION, callID: "l1" }, {});

  assert.equal(avisoEnCola(hooks), "",
    "nadie revisa si algo está roto en el primer segundo de una sesión; se empieza a trabajar");
});

test("después de que la sesión toca el Lore, la intervención llega al modelo", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  await armarSesion(hooks, montaje);
  writeFileSync(join(montaje.propio, "lore", "principios.md"), "# criterio cambiado en la sesión\n");
  await hooks["tool.execute.after"]({ tool: "write", sessionID: SESION, callID: "l1" }, {});

  const aviso = avisoEnCola(hooks);
  assert.match(aviso, /Mensaje del hook, no del usuario/,
    "es el mismo texto que formatIntervention produce para Claude y Codex");
  assert.equal(avisoEnCola(hooks), "", "y se dice una vez: el mensaje no se acumula en cada turno");
});

test("recibo ausente tras abrir conserva la comparación contra el baseline", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  await armarSesion(hooks, montaje);
  rmSync(join(montaje.propio, ".lore-mycelium"));
  writeFileSync(join(montaje.propio, "lore", "principios.md"), "# criterio cambiado\n");
  await hooks["tool.execute.after"]({ tool: "write", sessionID: SESION, callID: "l1" }, {});

  assert.match(avisoEnCola(hooks), /cambios de criterio.*trabajo que deben guiar/i);
});

test("coste de contexto: con nada que decir, el plugin no añade un solo byte al prompt", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  for (let turno = 0; turno < 5; turno += 1) {
    await armarSesion(hooks, montaje);
    await hooks["tool.execute.after"]({ tool: "read", sessionID: SESION, callID: `l-${turno}` }, {});
    const antesDelPrompt = [];
    hooks["experimental.chat.system.transform"]({}, { system: antesDelPrompt });
    assert.equal(antesDelPrompt.length, 0, `turno ${turno}: el prompt creció sin motivo`);
  }
});

test("el plugin no inyecta el jardín de Andrés en un usuario general", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  const dir = join(montaje.configDir, "plugin");
  for (const archivo of readdirSync(dir)) {
    const texto = readFileSync(join(dir, archivo), "utf8");
    for (const prohibido of ["C:\\Claude", "andamiaje", "bot-lus-lore", "picantes", "founder/"]) {
      assert.equal(texto.includes(prohibido), false,
        `${archivo} carga el jardín de Andrés en el host de cualquiera`);
    }
  }

  writeFileSync(join(montaje.propio, "lore", "principios.md"), "# cambió\n");
  await armarSesion(hooks, montaje);
  await hooks["tool.execute.after"]({ tool: "write", sessionID: SESION, callID: "l1" }, {});
  const aviso = avisoEnCola(hooks);
  for (const prohibido of ["C:\\Claude", "andamiaje", "bot-lus-lore", "picantes", "founder/"]) {
    assert.equal(aviso.includes(prohibido), false, "el texto que ve el modelo no nombra el jardín de Andrés");
  }
});

// ===========================================================================================
// 4. La apertura de una sesión dentro de un host ya cargado
// ===========================================================================================

test("CIEGO apertura: `session.created` llega al plugin y sin él la segunda sesión no abre", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  const OTRA = `${SESION}-segunda`;

  // El bus de OpenCode publica `session.created`, y el runtime se lo entrega a `event` en cada
  // plugin cargado — filtrado por el directorio de la instancia. No hay hook `session.start`
  // (eso sí es cierto, y está en el NC), pero el evento existe: es la única apertura POR SESIÓN
  // que la v1 ofrece. El cuerpo de la fábrica corre una vez, al cargar el host, así que sin
  // `event` la segunda sesión del mismo proceso no tiene apertura en ninguna parte.
  assert.equal(typeof hooks.event, "function",
    "el plugin no escucha el bus de eventos: la apertura de la segunda sesión no ocurre");

  await hooks.event({
    event: { id: "ev-1", type: "session.created", properties: { info: { id: OTRA } } },
  });

  // Entre la apertura y el primer evento de la sesión, otro dueño del Lore escribió.
  // En Claude y Codex `session_start` fija la base AQUÍ, y el desfase se ve después.
  // Con la base fijada en el primer evento —que ya es posterior al cambio— el desfase queda
  // tragado: `loreDeparted` nunca da true y la sesión no se entera de nada.
  writeFileSync(join(montaje.propio, "lore", "principios.md"), "# lo toco otro dueño, después de que abriera\n");
  await hooks["tool.execute.after"]({ tool: "write", sessionID: OTRA, callID: "l1" }, {});

  const aviso = avisoEnCola(hooks);
  assert.match(aviso, /Mensaje del hook, no del usuario/,
    "la base se fijó en el primer evento, ya posterior al cambio: el desfase queda tragado y la sesión nunca lo ve");
});

test("la apertura ancla la jurisdicción de esa sesión, y no la re-ancla en un evento posterior", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  const OTRA = `${SESION}-segunda`;

  await hooks.event({
    event: { id: "ev-1", type: "session.created", properties: { info: { id: OTRA } } },
  });
  assert.equal(readSessionRoot(OTRA), montaje.propio,
    "la sesión queda anclada al directorio donde abrió, como en `session_start` de Claude y Codex");

  // Un `session.created` repetido (OpenCode reemite al reanudar) no debe re-anclar.
  await hooks.event({
    event: { id: "ev-2", type: "session.created", properties: { info: { id: OTRA } } },
  });
  assert.equal(readSessionRoot(OTRA), montaje.propio, "y repetir el evento no mueve la raíz");
});

test("la base de la apertura es el estado de la apertura, no el de la carga del host", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  const OTRA = `${SESION}-segunda`;

  // El host se cargó antes de que esta sesión existiera. Si la base se copiase del snapshot de
  // carga, el cambio de otro dueño quedaría DEL LADO de la sesión y el kit lo contaría como suyo
  // — que es exactamente lo que la postergación de `PostToolUse` existe para no pasar.
  writeFileSync(join(montaje.propio, "lore", "principios.md"), "# lo toco otro dueño, ANTES de que esta sesion abriera\n");

  await hooks.event({
    event: { id: "ev-1", type: "session.created", properties: { info: { id: OTRA } } },
  });
  await hooks["tool.execute.after"]({ tool: "write", sessionID: OTRA, callID: "l1" }, {});

  assert.equal(avisoEnCola(hooks), "",
    "un cambio anterior a la apertura no es de esta sesión: el kit no lo reporta como suyo");
});

test("el resto del bus no cuesta: un evento que no es de sesión se devuelve sin tocar disco", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  // El bus dispara por cada parte de mensaje, muchas veces por turno. El manejador tiene que
  // ser una comparación de cadena: si leyera disco en cada evento, el kit pagaría el coste de
  // contexto con el de latencia, que es el que la persona sí nota.
  for (const type of ["message.updated", "message.part.updated", "session.updated", "session.idle", "lsp.diagnostics"]) {
    hooks.event({ event: { id: `ev-${type}`, type, properties: { sessionID: SESION, info: { id: SESION } } } });
  }
  assert.equal(avisoEnCola(hooks), "", "escuchar el bus no produce ruido");
});

test("un bus roto no tumba la sesión: el manejador de eventos falla abierto", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);

  // El runtime llama a `event` dentro del `listen` del bus, sin try: un manejador que revienta
  // se lleva por delante el bus entero, que es la parte compartida del host. Nada que venga
  // de ahi puede propagarse.
  for (const properties of [null, undefined, {}, { info: null }, { info: { id: 42 } }, { info: {} }]) {
    hooks.event({ event: { id: "ev-x", type: "session.created", properties } });
  }
  hooks.event(null);
  hooks.event({});
  assert.equal(avisoEnCola(hooks), "", "nada de eso produce veredicto ni ruido");
});

test("el código que el instalador pone en la máquina de cualquiera no nombra el jardín de Andrés", (t) => {
  // `hooks/` es lo que los tres hosts ejecutan: `installCodex` lo copia entero, Claude recibe el
  // paquete, y OpenCode recibe cuatro de esos archivos. Las skills son prosa y pueden citar un
  // criterio por su fuente —`founder/proyectos/vespi/kernel/src/` lo necesita la prueba de
  // procedencia, y quitarlo rompe la verificación—; el código que corre en el computer de un
  // usuario general no puede decir el nombre del árbol de nadie. El motivo estaba; la dirección
  // privada no viaja.
  const base = mkdtempSync(join(tmpdir(), "lore-oc-jardin-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));

  const dir = join(RAIZ_KIT, "hooks");
  const fugas = [];
  for (const nombre of readdirSync(dir)) {
    const texto = readFileSync(join(dir, nombre), "utf8");
    for (const prohibido of ["C:\\Claude", "andamiaje", "bot-lus-lore", "picantes", "founder/"]) {
      if (texto.includes(prohibido)) fugas.push(`${nombre}: ${prohibido}`);
    }
  }
  assert.deepEqual(fugas, [],
    `el jardín de Andrés viaja dentro del código que se instala: ${fugas.join(" | ")}`);
});

test("la ruta estructurada reconoce el destino `path` de OpenCode v2", async (t) => {
  const montaje = montar();
  t.after(() => rmSync(montaje.base, { recursive: true, force: true }));
  const hooks = await abrir(montaje);
  const destino = join(montaje.ajeno, "lore", "principios.md");

  assert.deepEqual(alVocabularioDelKit("write", { path: destino }), {
    tool: "Write", input: { file_path: destino },
  });
  assert.doesNotThrow(
    () => hooks["tool.execute.before"](...antes("write", { path: destino, content: "x" })),
  );
  assert.equal(avisoEnCola(hooks), "", "la traducción no convierte el hook en un deny");
});

test("el normalizador cubre los payloads write/edit y apply_patch de OpenCode", () => {
  const destino = "C:/otro-arbol/lore/principios.md";
  assert.deepEqual(alVocabularioDelKit("write", { filePath: destino }), {
    tool: "Write", input: { file_path: destino },
  });
  assert.deepEqual(alVocabularioDelKit("edit", { path: destino }), {
    tool: "Edit", input: { file_path: destino },
  });
  const patch = "*** Begin Patch\\n*** Update File: C:/otro-arbol/lore/principios.md\\n*** End Patch";
  assert.deepEqual(alVocabularioDelKit("apply_patch", { patchText: patch }), {
    tool: "apply_patch", input: { command: patch },
  });
});
