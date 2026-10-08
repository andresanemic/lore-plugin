// L4 — el recordatorio por turno y la marca visible (R28, R40, R46).
//
// RED primero. Este archivo se escribio entero antes de que existiera
// `hooks/lore-turno.mjs` ni el evento `user_prompt_submit`, y fallo por eso: la
// capacidad no existia. Despues se escribio lo minimo y se volvio a correr.
//
// Lo que se prueba aqui es el MECANISMO: que el hook ponga el recordatorio en
// cada turno y no lo ponga donde no toca. Que eso llegue de verdad a una sesion
// real lo prueba `claude --plugin-dir` con el hook vivo, que esta en el informe y
// no en este archivo: un test unitario no acredita recepcion.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  DEFECTO_NIVEL,
  NIVELES,
  estado,
  inyeccion,
  marca,
  nivel,
  nivelDesde,
} from "../hooks/lore-turno.mjs";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(repo, "hooks", "codex-guard.mjs");
const statusline = join(repo, "hooks", "statusline.mjs");
const roots = [];
let sesion = 0;

function arbol(files = { "lore/principios.md": "# Principios\n" }) {
  const dir = mkdtempSync(join(tmpdir(), "lore-turno-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) escribe(dir, rel, body);
  return dir;
}

function escribe(dir, rel, body) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
}

// Un estado de nivel aislado por test: nunca se toca el home de la persona.
function estadoTmp() {
  const dir = mkdtempSync(join(tmpdir(), "lore-nivel-"));
  roots.push(dir);
  return dir;
}

// El recibo de un acuerdo aprobado, tal como lo escribe `acuerdo.mjs`.
function acuerdoAprobado(dir, extra = {}) {
  writeFileSync(join(dir, ".lore-acuerdo"), `${JSON.stringify({
    version: 1,
    aprobado: true,
    porque: "que el trabajo dure mas de una sesion",
    intensidad: "cercana",
    ritmo: "normal",
    cubre: ["el-turno"],
    limites: [],
    apuestas: ["frases-cotidianas", "recordatorio-por-hook", "avisar-sin-bloquear", "leer-uso-de-la-sesion"],
    apuestasCaidas: [],
    enmiendas: [],
    ...extra,
  })}\n`);
}

function corre(cwd, evento, { estadoDir, nivel: n, session_id, source } = {}) {
  const input = {
    cwd,
    hook_event_name: evento === "session_start" ? "SessionStart" : "UserPromptSubmit",
    session_id: session_id ?? `turno-${++sesion}`,
    transcript_path: join(cwd, "transcript.jsonl"),
    model: "probe-model",
    permission_mode: "never",
    prompt: "seguimos con lo quedbcamos",
  };
  if (source) input.source = source;
  if (n !== undefined) input.nivel = n;
  return execFileSync("node", [hook, evento === "session_start" ? "session_start" : "user_prompt_submit"], {
    input: JSON.stringify(input),
    encoding: "utf8",
    env: { ...process.env, LORE_ESTADO_DIR: estadoDir, ...(n ? { LORE_NIVEL: n } : {}) },
  });
}

function contexto(stdout, evento = "UserPromptSubmit") {
  assert.notEqual(stdout.trim(), "", `el hook no inyecto nada en ${evento}`);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, evento);
  return parsed.hookSpecificOutput.additionalContext;
}

// --- 1. el recordatorio llega, en cada turno ---------------------------------

test("UserPromptSubmit pone el registro vigente y el estado del acuerdo en el turno", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const estadoDir = estadoTmp();
  corre(dir, "turno", { estadoDir });
  corre(dir, "turno", { estadoDir });
  const context = contexto(corre(dir, "turno", { estadoDir }));
  assert.match(context, /cercana/);
  assert.match(context, /normal/);
  assert.match(context, /vigente/i);
});

test("sin acuerdo en vigor el turno calla, y no disfraza al suelo de acuerdo", () => {
  // Cambio de política, con su razón escrita en `inyeccion`. La versión anterior decía el
  // suelo en cada turno ("acuerdo sin acuerdo, por los defectos"); ahora calla. Lo que se
  // decía eran los DEFECTOS del kit, que ya están en el bloque siempre-activo: repetirlos
  // cada turno no sostenía un registro —no hay ninguno— y era el duplicado que R40 prohíbe.
  const dir = arbol();
  const r = inyeccion({ raiz: dir, turno: 1, nivel: "full" });
  assert.equal(r.inyectar, false);
  assert.equal(r.por, "sin-acuerdo");
  // Y el texto que antes salía no vuelve disfrazado por ningún otro camino.
  assert.equal(corre(dir, "turno", { estadoDir: estadoTmp() }), "");
});

test("con la apuesta del hook caida el recordatorio dice donde se guarda el registro", () => {
  const dir = arbol();
  acuerdoAprobado(dir, { apuestasCaidas: ["recordatorio-por-hook"] });
  const context = contexto(corre(dir, "turno", { estadoDir: estadoTmp() }));
  assert.match(context, /FASES\.md/);
});

test("al abrir dice lo mismo y nombra el nivel y donde vive el estado", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true);
  assert.match(r.texto, /cercana/);
  assert.match(r.texto, /full/);
  assert.match(r.texto, /FASES\.md/);
});

test("sin acuerdo en vigor la apertura y el turno callan: nadie pidio un acuerdo que no existe", () => {
  const dir = arbol();
  const apertura = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(apertura.inyectar, false);
  assert.equal(apertura.por, "sin-acuerdo");
  // Y el turno también: el suelo del kit ya está en el bloque siempre-activo, así que
  // decirlo otra vez en cada turno sería cobrar dos veces el mismo criterio.
  assert.equal(inyeccion({ raiz: dir, turno: 1, nivel: "full" }).inyectar, false);
});

test("cada turno cuenta el suyo y el conteo no se reinicia solo", () => {
  const dir = arbol();
  // Con acuerdo aprobado: el conteo solo tiene sentido donde hay algo que sostener.
  acuerdoAprobado(dir);
  const estadoDir = estadoTmp();
  const id = `conteo-${++sesion}`;
  const tres = [1, 2, 3].map(() => contexto(corre(dir, "turno", { estadoDir, session_id: id })));
  assert.match(tres[0], /Turno 1\b/);
  assert.match(tres[2], /Turno 3\b/);
});

// --- 2. liviano: la puerta de bytes y la de duplicados -----------------------

test("el recordatorio cabe en un presupuesto de tokens que se puede leer de un vistazo", () => {
  const dir = arbol();
  acuerdoAprobado(dir, { limites: [{ familia: "opus", nivel: "alto" }] });
  const context = contexto(corre(dir, "turno", { estadoDir: estadoTmp() }));
  assert.ok(Buffer.byteLength(context) <= 400,
    `el turno excedió su presupuesto: ${Buffer.byteLength(context)} bytes`);
});

test("el recordatorio no repite ninguna linea de un cuerpo de Lore ya cargado", () => {
  const marcaUnica = "Pista unica que solo existe en el cuerpo: aguante-la-ya-cargada-7749.";
  const dir = arbol({ "lore/principios.md": `# Principios\n\n${marcaUnica}\n` });
  writeFileSync(join(dir, ".lore-acuerdo"), `${JSON.stringify({
    version: 1, aprobado: true, porque: "x", intensidad: "cercana", ritmo: "normal",
    cubre: [], limites: [], apuestas: [], apuestasCaidas: [], enmiendas: [],
  })}\n`);
  const context = contexto(corre(dir, "turno", { estadoDir: estadoTmp() }));
  assert.ok(!context.includes(marcaUnica));
  assert.ok(!context.includes("aguante-la-ya-cargada-7749"));
});

test("el recordatorio no narra la maquinaria ni pregunta nada", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const context = contexto(corre(dir, "turno", { estadoDir: estadoTmp() }));
  assert.doesNotMatch(context, /MYCELIUM|use-lore|vespi|save-to-lore|hook|statusline|¿|\?/i);
});

// --- 3. el control: donde NO debe aparecer -----------------------------------

test("con el nivel apagado el hook no dice absolutamente nada", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const estadoDir = estadoTmp();
  assert.equal(corre(dir, "turno", { estadoDir, nivel: "off" }), "");
});

test("con el nivel lite el turno calla y solo abre", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const estadoDir = estadoTmp();
  assert.equal(corre(dir, "turno", { estadoDir, nivel: "lite" }), "");
  assert.equal(inyeccion({ raiz: dir, turno: null, nivel: "lite" }).inyectar, true);
});

test("en un arbol sin Lore el hook no dice nada, ni con acuerdo aprobado", () => {
  const dir = mkdtempSync(join(tmpdir(), "lore-turno-vacio-"));
  roots.push(dir);
  writeFileSync(join(dir, ".lore-acuerdo"), `${JSON.stringify({
    version: 1, aprobado: true, porque: "x", intensidad: "cercana", ritmo: "normal",
    cubre: [], limites: [], apuestas: [], apuestasCaidas: [], enmiendas: [],
  })}\n`);
  assert.equal(corre(dir, "turno", { estadoDir: estadoTmp() }), "");
});

test("un trabajo de una sola sesion recibe el registro y ninguna oferta de cierre", () => {
  const dir = arbol();
  // Con acuerdo aprobado, que es el caso donde el recordatorio llega: el control vale más
  // así, porque la prueba es que el registro SÍ se entrega y aun así no se ofrece nada.
  // Sin acuerdo el canal calla (ver "sin acuerdo en vigor el turno calla").
  acuerdoAprobado(dir);
  const context = contexto(corre(dir, "turno", { estadoDir: estadoTmp() }));
  assert.ok(context.length > 0, "sin registro no hay nada que ofrecer ni que callar");
  assert.doesNotMatch(context, /descanso|cerrar|cierre|guardar lo aprendido|checkpoint|ofrezco/i);
});

// --- 4. el nivel: la perilla y el apagado -------------------------------------

test("los niveles son un vocabulario cerrado y el defecto es full", () => {
  assert.deepEqual(NIVELES, ["off", "lite", "full"]);
  assert.equal(DEFECTO_NIVEL, "full");
  assert.equal(nivelDesde(undefined), DEFECTO_NIVEL);
  assert.equal(nivelDesde("lite"), "lite");
  // Una perilla que no existe no es una eleccion: es un error visible, no un default.
  assert.throws(() => nivelDesde("ultra"), /nivel/i);
});

test("el nivel escrito se lee en el siguiente turno", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const estadoDir = estadoTmp();
  assert.equal(estado(estadoDir).nivel, DEFECTO_NIVEL);
  estado(estadoDir, "off");
  assert.equal(corre(dir, "turno", { estadoDir }), "");
  estado(estadoDir, "full");
  contexto(corre(dir, "turno", { estadoDir }));
});

test("la marca es exactamente [Lore Plugin] y desaparece cuando esta apagado", () => {
  assert.equal(marca("full"), "[Lore Plugin]");
  assert.equal(marca("lite"), "[Lore Plugin lite]");
  assert.equal(marca("off"), "");
  assert.equal(marca(null), "[Lore Plugin]");
});

test("un estado de nivel escrito a mano y roto no rompe el turno", () => {
  const estadoDir = estadoTmp();
  writeFileSync(join(estadoDir, ".lore-nivel"), "{ esto no es json");
  assert.equal(estado(estadoDir).nivel, DEFECTO_NIVEL);
});

// --- 5. el comando y la linea de estado ---------------------------------------

test("lore-plugin nivel escribe el nivel y lo vuelve a leer", () => {
  const estadoDir = estadoTmp();
  const env = { ...process.env, LORE_ESTADO_DIR: estadoDir };
  const salida = execFileSync("node", [join(repo, "scripts", "lore-plugin.mjs"), "nivel", "lite"], {
    encoding: "utf8", env,
  });
  assert.match(salida, /lite/);
  assert.equal(JSON.parse(readFileSync(join(estadoDir, ".lore-nivel"), "utf8")).nivel, "lite");
});

test("la linea de estado imprime la marca y se calla cuando el nivel esta apagado", () => {
  const estadoDir = estadoTmp();
  const correr = (n) => execFileSync("node", [statusline], {
    input: JSON.stringify({ session_id: "s", cwd: process.cwd() }),
    encoding: "utf8",
    env: { ...process.env, LORE_ESTADO_DIR: estadoDir, ...(n ? { LORE_NIVEL: n } : {}) },
  });
  assert.equal(correr("full").trim(), "[Lore Plugin]");
  assert.equal(correr("lite").trim(), "[Lore Plugin lite]");
  assert.equal(correr("off").trim(), "");
  // Sin nivel escrito y sin env: el defecto, que es visible.
  assert.equal(correr("__sin_nivel__").trim(), "[Lore Plugin]");
  // Y un nivel apagado escrito en el archivo manda cuando no hay nada en el entorno.
  estado(estadoDir, "off");
  assert.equal(correr(undefined).trim(), "");
});

test("la linea de estado con la entrada rota no escribe nada y no revienta", () => {
  const out = execFileSync("node", [statusline], {
    input: "{ roto",
    encoding: "utf8",
    env: { ...process.env, LORE_ESTADO_DIR: estadoTmp() },
  });
  assert.equal(out.trim(), "");
});

// --- 6. la ley de 2.4.7, medida otra vez -------------------------------------
//
// Esta seccion existe porque se quiso enganchar `UserPromptSubmit` a Claude Code y
// la suite lo impidio. Se midio antes de decidir, no despues: Claude Code 2.1.284,
// sesion fresca con `--plugin-dir`, dos turnos, hook vivo. El recordatorio LLEGO al
// modelo y el modelo lo devolvio en su propia prosa:
//
//   "Contexto de tu hook: «Turno 2: hablo cercana; a ritmo normal; hay 0 limites;
//    acuerdo vigente.» Lo tomo como indicaciones tuyas."
//
// Dos turnos, los dos. Es el defecto que 2.4.7 registro al retirar el adaptador, y en
// esta version de Claude Code sigue igual. Por eso la ley no se toca.

test("Claude Code NO recibe el recordatorio por prompt: la ley de 2.4.7 sigue", () => {
  const hooks = JSON.parse(readFileSync(join(repo, "hooks", "hooks.json"), "utf8"));
  assert.equal(hooks.hooks?.UserPromptSubmit, undefined,
    "UserPromptSubmit en hooks.json devuelve a Claude Code el recordatorio que el agente narra");
  assert.equal(hooks.hooks?.Stop, undefined, "el hook Stop quedó atrás: ahí el campo es visible");
  // La apertura entrega ahora el estado; UserPromptSubmit y Stop siguen sin registrarse.
  const dir = arbol();
  acuerdoAprobado(dir);
  assert.match(contexto(corre(dir, "session_start", { estadoDir: estadoTmp(), source: "startup" }), "SessionStart"), /FASES\.md/);
});

test("el guard contesta user_prompt_submit para el host con forma Codex", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const context = contexto(corre(dir, "turno", { estadoDir: estadoTmp() }));
  assert.match(context, /Turno 1/);
});

test("lo que si es privado en Claude Code no lleva nada al contexto del modelo", () => {
  // La marca vive en la linea de estado, que el host no manda al modelo. Eso es lo
  // que la hace invisible para el agente y visible para la persona, al reves que el
  // `additionalContext`. La prueba es de forma, no de resultado: el script no imprime
  // nada mas que la marca.
  const out = execFileSync("node", [statusline], {
    input: JSON.stringify({ session_id: "s", cwd: process.cwd() }),
    encoding: "utf8",
    env: { ...process.env, LORE_ESTADO_DIR: estadoTmp(), LORE_NIVEL: "full" },
  });
  assert.equal(out, "[Lore Plugin]\n");
});

test("lo que se inyecta es un hecho, no una promesa: la funcion dice si inyecto", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  assert.equal(inyeccion({ raiz: dir, turno: 1, nivel: "full" }).inyectar, true);
  assert.equal(inyeccion({ raiz: dir, turno: 1, nivel: "off" }).inyectar, false);
  assert.equal(inyeccion({ raiz: dir, turno: 1, nivel: "full" }).texto.length > 0, true);
});

test("el nivel se resuelve desde el env, y el env manda sobre el archivo", () => {
  const estadoDir = estadoTmp();
  estado(estadoDir, "off");
  assert.equal(nivel({ estadoDir, env: {} }), "off");
  assert.equal(nivel({ estadoDir, env: { LORE_NIVEL: "full" } }), "full");
});

// --- 7. el canal por turno en el host donde SI es privado --------------------
//
// La seccion 6 dejo el mecanismo sin registrar en ningun host: en Claude Code el
// unico evento disponible es el que 2.4.7 ya retiro porque el modelo lo narra, y en
// Codex no hay todavia un archivo de hooks en el repo. OpenCode si tiene un canal que
// no es el prompt: `experimental.chat.system.transform` corre en cada peticion al
// modelo y su `system` es el prompt de sistema. Ahi el recordatorio va como lo que es
// —una instruccion—, no como algo que la persona dijo.
//
// Leido del binario instalado (opencode-ai 1.18.33, `opencode.exe`), no de la
// documentacion: en `LLMRequestPrep.prepare` el arreglo `system` se arma, se dispara
// el trigger con `{sessionID, model}` y `{system}`, y lo que se empuje ahi entra en la
// peticion. El mismo binario lista el evento entre los hooks que dispara.

import OpenCodePlugin from "../hooks/opencode-plugin.js";
const LorePlugin = OpenCodePlugin.server;

let sesiones = 0;
const fixtureRun = (await import("node:crypto")).randomUUID();

function idOpenCode() {
  return `opencode-probe-${process.pid}-${fixtureRun}-${++sesiones}`;
}

// Corre el plugin como lo corre el host: la fabrica una vez, y despues un transform
// por peticion al modelo. `env` aísla la perilla; nunca se toca el home de la persona.
async function pideAlModelo(plugin, sessionID, veces, env = {}) {
  const previo = process.env.LORE_ESTADO_DIR;
  process.env.LORE_ESTADO_DIR = env.LORE_ESTADO_DIR;
  const pedidos = [];
  try {
    for (let i = 0; i < veces; i += 1) {
      await plugin["chat.message"]({ sessionID, messageID: `user-${i}` }, { message: { role: "user" }, parts: [] });
      const output = { system: ["prompt-de-sistema-del-host"] };
      await plugin["experimental.chat.system.transform"]({ sessionID, model: { id: "probe" } }, output);
      pedidos.push(output.system.join("."));
    }
  } finally {
    if (previo === undefined) delete process.env.LORE_ESTADO_DIR;
    else process.env.LORE_ESTADO_DIR = previo;
  }
  return pedidos;
}

// Lo que el host entrega al modelo es el arreglo unido: eso es lo que se mide.
function registroDe(pedido) {
  const partes = pedido.split("prompt-de-sistema-del-host").filter((p) => p.trim() !== "");
  return partes.join("").trim();
}

test("OpenCode recibe el registro vigente en cada turno por el sistema, no por el prompt", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const plugin = await LorePlugin({ directory: dir });
  const [primero, segundo] = await pideAlModelo(plugin, idOpenCode(), 2, { LORE_ESTADO_DIR: estadoTmp() });

  // El primer turno de una sesion es la apertura: nombra el nivel y donde vive el estado.
  assert.match(registroDe(primero), /nivel full/);
  assert.match(registroDe(primero), /el estado vive en FASES\.md/);
  // Y el segundo ya es un turno cualquiera, con su numero.
  assert.match(registroDe(segundo), /Turno 2/);
  // El texto base del host se conserva: el recordatorio se suma, no reemplaza.
  assert.ok(primero.startsWith("prompt-de-sistema-del-host"));
});

test("RC6: una petición auxiliar no consume la apertura ni se cuenta como turno humano", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const plugin = await LorePlugin({ directory: dir });
  const sessionID = idOpenCode();
  const previo = process.env.LORE_ESTADO_DIR;
  process.env.LORE_ESTADO_DIR = estadoTmp();
  try {
    const auxiliar = { system: ["base"] };
    await plugin["experimental.chat.system.transform"]({ sessionID }, auxiliar);
    assert.equal(auxiliar.system.join(""), "base");
    await plugin["chat.message"]({ sessionID, messageID: "u1" }, { message: { role: "user" }, parts: [] });
    for (let i = 0; i < 2; i += 1) {
      const output = { system: ["base"] };
      await plugin["experimental.chat.system.transform"]({ sessionID }, output);
      assert.match(output.system.join("."), /nivel full/, "el título no debe gastar la apertura");
      assert.doesNotMatch(output.system.join("."), /Turno 2/);
    }
    await plugin["chat.message"]({ sessionID, messageID: "u2" }, { message: { role: "user" }, parts: [] });
    const segundo = { system: ["base"] };
    await plugin["experimental.chat.system.transform"]({ sessionID }, segundo);
    assert.match(segundo.system.join("."), /Turno 2/);
  } finally {
    if (previo === undefined) delete process.env.LORE_ESTADO_DIR;
    else process.env.LORE_ESTADO_DIR = previo;
  }
});

test("el turno de OpenCode no se pierde cuando el texto del host ya tiene cuerpo", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const plugin = await LorePlugin({ directory: dir });
  const [primero] = await pideAlModelo(plugin, idOpenCode(), 1, { LORE_ESTADO_DIR: estadoTmp() });
  assert.ok(registroDe(primero).length > 0, "el arreglo de system se sobreescribio en vez de crecer");
});

test("en OpenCode apagado el sistema del host queda intacto, byte a byte", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const e = estadoTmp();
  estado(e, "off");
  const plugin = await LorePlugin({ directory: dir });
  const pedidos = await pideAlModelo(plugin, idOpenCode(), 2, { LORE_ESTADO_DIR: e });
  for (const pedido of pedidos) assert.equal(registroDe(pedido), "");
});

test("en OpenCode el nivel lite abre y calla: el turno ya tiene el contrato cargado", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const e = estadoTmp();
  estado(e, "lite");
  const plugin = await LorePlugin({ directory: dir });
  const [primero, segundo] = await pideAlModelo(plugin, idOpenCode(), 2, { LORE_ESTADO_DIR: e });
  assert.match(registroDe(primero), /nivel lite/);
  assert.equal(registroDe(segundo), "");
});

test("en OpenCode un arbol sin Lore no ensucia el sistema aunque el nivel este en full", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lore-turno-sin-lore-"));
  roots.push(dir);
  writeFileSync(join(dir, "notas.md"), "# sin lore\n");
  const plugin = await LorePlugin({ directory: dir });
  const pedidos = await pideAlModelo(plugin, idOpenCode(), 2, { LORE_ESTADO_DIR: estadoTmp() });
  for (const pedido of pedidos) assert.equal(registroDe(pedido), "");
});

test("en OpenCode la perilla rota deja pasar el turno y vuelve al defecto", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const e = estadoTmp();
  writeFileSync(join(e, ".lore-nivel"), "{esto no es json");
  const plugin = await LorePlugin({ directory: dir });
  const [primero] = await pideAlModelo(plugin, idOpenCode(), 1, { LORE_ESTADO_DIR: e });
  assert.match(registroDe(primero), /nivel full/);
});

test("el aviso de la guardia y el registro del turno salen juntos, no se pisan", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const plugin = await LorePlugin({ directory: dir });
  const e = estadoTmp();
  const previo = process.env.LORE_ESTADO_DIR;
  process.env.LORE_ESTADO_DIR = e;
  const sessionID = idOpenCode();
  try {
    // Una escritura fuera del arbol con Lore: la guardia encola su aviso.
    await plugin["tool.execute.before"](
      { sessionID, tool: "write" },
      { args: { filePath: join(dir, "..", "fuera.txt"), content: "x" } },
    );
    await plugin["chat.message"]({ sessionID, messageID: "human-first" }, { message: { role: "user" }, parts: [] });
    const output = { system: ["base"] };
    await plugin["experimental.chat.system.transform"]({ sessionID, model: { id: "probe" } }, output);
    const joined = output.system.join(".");
    assert.match(joined, /Lore Plugin: escritura fuera/);
    assert.match(joined, /nivel full/);
    // Y la peticion siguiente ya no repite ninguno de los dos.
    const siguiente = { system: ["base"] };
    await plugin["experimental.chat.system.transform"]({ sessionID, model: { id: "probe" } }, siguiente);
    assert.doesNotMatch(siguiente.system.join("."), /escritura fuera/);
  } finally {
    if (previo === undefined) delete process.env.LORE_ESTADO_DIR;
    else process.env.LORE_ESTADO_DIR = previo;
  }
});

test("en OpenCode un arbol con Lore pero sin acuerdo en vigor calla: el suelo ya esta cargado", async () => {
  // El árbol tiene `lore/` y nada más: nadie pasó por `use-lore`, no hay intensidades
  // elegidas ni un FASES.md que sostener. El texto que se inyectaría sin acuerdo son los
  // DEFECTOS del kit, y esos ya están en el bloque siempre-activo y en la skill. Repetirlos
  // en cada petición al modelo no sostiene nada: es el duplicado que R40 prohíbe, y el
  // impuesto permanente que el propio encabezado del adaptador rechaza para la línea
  // federada. El recordatorio por turno existe para un registro que puede apartarse.
  const dir = arbol();
  const plugin = await LorePlugin({ directory: dir });
  const pedidos = await pideAlModelo(plugin, idOpenCode(), 3, { LORE_ESTADO_DIR: estadoTmp() });
  for (const pedido of pedidos) assert.equal(registroDe(pedido), "");
});

// --- 8. la puerta: la apertura entrega el veredicto, no el lugar donde vive ----
//
// Este archivo se escribio entero creyendo que un puntero era un recordatorio. No lo es: el
// coordinador leyo «el estado vive en FASES.md», salto el archivo que ahi se le senalaba y coordino
// quince tareas sin abrir ni una operacion ni escribir un recibo. El puntero nombra el lugar y no
// puede fallar en voz alta, asi que no es una puerta: es una nota. Lo que se prueba aqui es que
// al abrir, con una operacion abierta de verdad, lo que llega al modelo es el veredicto del kernel,
// el siguiente paso y la tarea pendiente por rol.

function operacionAbierta(dir) {
  const cli = join(repo, "scripts", "lore-plugin.mjs");
  const op = (...args) => execFileSync("node", [cli, "operation", ...args], { encoding: "utf8" });
  const hold = JSON.parse(op("hold", "--root", dir, "--json", JSON.stringify({
    goal: "Retomar el cotejo", owner: "coordinador", authority: { spend: [] },
    scope: "Solo apertura del fixture", expected_effect: { kind: "none" }, done: "La apertura indica la tarea pendiente", roles: ["daimon", "advisor", "verifier"], verifier: "fixture-verifier",
  })));
  op("authorize", "--root", dir, "--id", hold.id, "--json", JSON.stringify({ by: "Andres", words: "corre el cotejo" }));
  const plan = JSON.parse(op("plan", "--root", dir, "--id", hold.id, "--json", JSON.stringify({
    role: "daimon", question: "Que dicen las fuentes?", sources: ["https://example.test/norma"],
    output: { path: join(dir, "daimon.md") }, timeoutMs: 600_000,
    nextCheckAt: new Date(Date.now() + 60_000).toISOString(),
  })));
  return { id: hold.id, task: plan.task };
}

test("con una operacion abierta la apertura entrega el siguiente paso y la tarea pendiente", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const { id, task } = operacionAbierta(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true);
  assert.match(r.texto, new RegExp(id), "la apertura no nombra la operacion abierta");
  assert.match(r.texto, /dispatch/, "la apertura no dice el siguiente paso");
  assert.match(r.texto, new RegExp(task), "la apertura no dice la tarea pendiente");
  assert.match(r.texto, /daimon/, "la apertura no dice que rol la tiene pendiente");
});

test("con una operacion abierta la apertura NO se conforma con nombrar donde vive el estado", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  operacionAbierta(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.doesNotMatch(r.texto, /el estado vive en FASES\.md/,
    "con una operacion abierta, el puntero es exactamente el defecto que esta puerta arregla");
});

test("sin operacion abierta la apertura conserva el puntero: no hay nada que abrir ahi", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true);
  assert.match(r.texto, /el estado vive en FASES\.md/);
});

test("una apertura con operacion abierta nombra el archivo exacto que hay que abrir", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const { id } = operacionAbierta(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.match(r.texto, new RegExp(`FASES\\.md#${id}`));
});

test("el turno que sigue NO repite el veredicto: la puerta abre una vez por sesion", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  operacionAbierta(dir);
  const apertura = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  const turno = inyeccion({ raiz: dir, turno: 2, nivel: "full" });
  assert.match(apertura.texto, /dispatch/);
  assert.doesNotMatch(turno.texto, /dispatch/);
});

// --- 8b. RC2: la puerta por el canal que ya existe, no detras del guard de turnos ---
//
// La puerta no faltaba: corria en cada inyeccion. Lo que hacia era esperar. Su texto lo compone
// `inyeccion`, y a `inyeccion` solo se llega cuando `chat.message` ya conto un turno humano —el
// guard de `opencode-plugin.js`—. `experimental.chat.system.transform` es el unico canal que llega
// al modelo, y el sistema no puede hablar antes de que la persona escriba: lo que puede es no
// esperar a que el modelo YA haya acted, que es la diferencia entre esto y un `UserPromptSubmit`.
//
// Por eso el rojo no se escribe con `chat.message` delante: ahi el veredicto ya llegaba y el test
// passaría sin el arreglo. El rojo es la peticion que el host hace sin que el guard haya corrido, y
// es la que hoy recibe solo `base`.

test("RC2: el primer system.transform lleva el veredicto de la puerta aunque el guard no haya corrido", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const { id, task } = operacionAbierta(dir);
  const previo = process.env.LORE_ESTADO_DIR;
  process.env.LORE_ESTADO_DIR = estadoTmp();
  try {
    const plugin = await LorePlugin({ directory: dir });
    const salida = { system: ["base"] };
    await plugin["experimental.chat.system.transform"]({ sessionID: idOpenCode(), model: { id: "probe" } }, salida);
    const unido = salida.system.join(".");
    assert.match(unido, new RegExp(id), `la puerta no nombro la operacion abierta: ${unido}`);
    assert.match(unido, new RegExp(task), `la puerta no nombro la tarea pendiente: ${unido}`);
    assert.match(unido, /dispatch/, `la puerta no dijo el siguiente paso: ${unido}`);
  } finally {
    if (previo === undefined) delete process.env.LORE_ESTADO_DIR;
    else process.env.LORE_ESTADO_DIR = previo;
  }
});

test("RC2: la semilla de la puerta no se dice dos veces en la misma peticion", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const { id } = operacionAbierta(dir);
  const previo = process.env.LORE_ESTADO_DIR;
  process.env.LORE_ESTADO_DIR = estadoTmp();
  try {
    const plugin = await LorePlugin({ directory: dir });
    const sessionID = idOpenCode();
    // Con el guard delante la inyeccion ya lleva el veredicto dentro de su texto: sembrarlo otra
    // vez lo diria dos veces en el mismo prompt del sistema, que es gasto y no enfasis.
    await plugin["chat.message"]({ sessionID, messageID: "u1" }, { message: { role: "user" }, parts: [] });
    const salida = { system: ["base"] };
    await plugin["experimental.chat.system.transform"]({ sessionID, model: { id: "probe" } }, salida);
    const unido = salida.system.join(".");
    const apariciones = unido.split("abierta en FASES.md#").length - 1;
    assert.equal(apariciones, 1, `el veredicto de ${id} tiene que llegar una vez, no repetido: ${unido}`);
  } finally {
    if (previo === undefined) delete process.env.LORE_ESTADO_DIR;
    else process.env.LORE_ESTADO_DIR = previo;
  }
});

// --- 9. una puerta que no puede abrirse tiene que decirlo -------------------------------
//
// El techo declarado de este mecanismo es no romper nada, y por eso todo lo que puede fallar
// esta dentro de un catch que se calla. Fallar abierto esta bien; fallar en silencio no: asi el
// hook no inyecta nada y la sesion sigue como si no hubiera puerta, que es exactamente el defecto
// que la seccion 8 acaba de pagar. Y el puntero al que se degrada la puerta cuando no puede leer
// es el mismo que ya se declaro insuficiente, lo que hace el fallo indistinguible de una
// apertura de verdad: quien lee no tiene forma de saber que la puerta esta caida.

function fasesIlegible(dir) {
  rmSync(join(dir, "FASES.md"), { force: true, recursive: true });
  mkdirSync(join(dir, "FASES.md"), { recursive: true });
}

// El hook como lo corre el host, y lo que de verdad le llega: el arreglo `system` entero. Cuando
// el host entrega un arreglo que no admite la escritura, el fallo ocurre DENTRO del try de la
// inyeccion; ahi el unico canal que queda es stderr, y callar en los dos es no dejar rastro.
async function transformSinCanal(plugin, sessionID) {
  const errores = [];
  const previo = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk) => { errores.push(String(chunk)); return true; };
  try {
    await plugin["chat.message"]({ sessionID, messageID: "human-1" }, { message: { role: "user" }, parts: [] });
    // El arreglo `system` es lo que no admite la escritura: congelado, `push` revienta DENTRO del
    // try de la inyeccion y ahi el unico canal que queda es stderr. Congelar el `output` entero
    // no serviria de nada: el guard de la primera linea lo rechazaria antes de intentarlo.
    await plugin["experimental.chat.system.transform"](
      { sessionID, model: { id: "probe" } },
      { system: Object.freeze(["base"]) },
    );
  } finally {
    process.stderr.write = previo;
  }
  return errores.join("");
}

test("si FASES.md no se puede leer, la apertura lo dice y no vuelve al puntero", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const { id } = operacionAbierta(dir);
  fasesIlegible(dir);
  process.env.LORE_ESTADO_DIR = estadoTmp();
  const plugin = await LorePlugin({ directory: dir });
  const salida = { system: ["base"] };
  const sessionID = idOpenCode();
  await plugin["chat.message"]({ sessionID, messageID: "u1" }, { message: { role: "user" }, parts: [] });
  await plugin["experimental.chat.system.transform"]({ sessionID, model: { id: "probe" } }, salida);
  const unido = salida.system.join(".");
  assert.match(unido, new RegExp(`no (se pudo|pudo) leer|no se leyo`),
    `la puerta caida tiene que decir que no pudo leer el estado: ${unido}`);
  assert.doesNotMatch(unido, /el estado vive en FASES\.md/,
    "volver al puntero es indistinguible de una apertura de verdad: es el defecto que la seccion 8 pago");
});

test("un bloque de operacion ilegible tambien se dice, no se disimula", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  operacionAbierta(dir);
  writeFileSync(join(dir, "FASES.md"), "<!-- vespi:operacion op-corrupto -->\n\nun bloque sin estructura\n");
  process.env.LORE_ESTADO_DIR = estadoTmp();
  const plugin = await LorePlugin({ directory: dir });
  const salida = { system: ["base"] };
  const sessionID = idOpenCode();
  await plugin["chat.message"]({ sessionID, messageID: "u1" }, { message: { role: "user" }, parts: [] });
  await plugin["experimental.chat.system.transform"]({ sessionID, model: { id: "probe" } }, salida);
  const unido = salida.system.join(".");
  assert.match(unido, /op-corrupto|no (se pudo|pudo) leer|no se leyo/i,
    `un FASES.md que no se puede parsear tiene que nombrarse: ${unido}`);
});

test("la puerta caida no tumba el turno: sigue habiendo texto y el host no se rompe", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  operacionAbierta(dir);
  fasesIlegible(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true, "el techo sigue siendo no romper nada");
  assert.equal(typeof r.texto, "string");
  assert.ok(r.texto.length > 0);
});

test("si el host no admite la escritura, el hook deja rastro en stderr", async () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  operacionAbierta(dir);
  process.env.LORE_ESTADO_DIR = estadoTmp();
  const plugin = await LorePlugin({ directory: dir });
  const rastro = await transformSinCanal(plugin, idOpenCode());
  assert.match(rastro, /Lore Plugin/,
    `el fallo del canal tiene que quedar en stderr, no en la nada: ${JSON.stringify(rastro)}`);
});

test("sin acuerdo en vigor el hook sigue callado: el fallo no se confunde con una apuesta", () => {
  const dir = arbol();
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, false);
  assert.equal(r.por, "sin-acuerdo");
});

// --- 10. la quinta ranura: el para qué, que es del árbol y no del acuerdo ------------
//
// Este archivo se escribió entero creyendo que cuatro ranuras eran el registro. No lo son:
// eran las dos perillas, la cuenta de límites y el estado del acuerdo — y el *para qué* no
// estaba en ninguna. La promesa sí estaba escrita, textual, en el `lore/identidad.md` de los
// bots que usan este kit: *«Viaja en el recordatorio de cada turno ... para que ningún agente
// trabaje sin tenerlo delante»*. El canal que debía cargarla tenía vocabulario cerrado y el
// para qué no estaba en él. RC2 verde, x402 integrado y el instrumento medido no cambiaron
// nada de lo que alguien vivió, y esto es lo que faltaba.
//
// Es `principios.md` §31, textual: *«Una pista que gobierna continuamente —tono, registro,
// gusto, una postura— no tiene paso que la nombre, así que el instrumento no la ve o la ve
// como sospechosa.»* El para qué gobierna continuamente. No tenía paso. Esta sección es el paso.

const IDENTIDAD_REAL = `# Identidad

Bot local para investigar LUS y desarrollar Lore Plugin sin confundir teoría, evidencia y producto.

Norte: una instrucción corta abre por sí sola los cuerpos correctos y conserva la procedencia de cada afirmación.

**El para qué: jardineros del Entre (Andrés, 2026-09-28).** El para qué de este bot y de todo agente que trabaje con él es cuidar juntos un Entre vivo entre una persona y una máquina, donde la persona se emociona, siente que sí podía y queda con más agencia que antes. Primero se recibe a la persona y después se trabaja; la coordinación, la delegación, los recibos, las cartas y las chispas sirven a eso y no lo reemplazan. Viaja en el recordatorio de cada turno, al modo de Ponytail (R28, R46), para que ningún agente trabaje sin tenerlo delante. Andrés: «RC4 y Vespi deben siempre seguir ese why, ese es su propósito, así deben funcionar los agentes que trabajan con Lore Plugin». Procedencia: enmiendas «la misión» y «la forma del porqué» de \`bots/proyectos/bot-lus-lore/specs/012-rc4/acuerdo.md\`; R50 y caso 20 del mismo bot.
`;

// El árbol que la promesa necesita: Lore presente, identidad presente, identidad declarando.
function arbolQueDeclara(identidad = IDENTIDAD_REAL) {
  return arbol({ "lore/principios.md": "# Principios\n", "lore/identidad.md": identidad });
}

// Lo que se dice del para qué es una ranura, no una frase: se toma hasta el separador.
function ranuraParaQue(texto) {
  return String(texto ?? "").match(/para qué[^·]*/)?.[0].trim() ?? "";
}

test("la apertura NO emite el para qué que lore/identidad.md declara en el árbol", () => {
  const dir = arbolQueDeclara();
  acuerdoAprobado(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true);
  assert.match(r.texto, /jardineros del Entre/,
    `la apertura no dice para qué es este trabajo y el árbol ya lo declaró: ${r.texto}`);
  // Lo que viaja es de qué, no de dónde: la procedencia es para el que audita el árbol, y una
  // fecha en el prompt es peso que no perturba nada.
  assert.doesNotMatch(r.texto, /2026-09-28/, "la procedencia del para qué no viaja al turno");
});

test("sin acuerdo en vigor la apertura emite el para qué igual: es del árbol, no del acuerdo", () => {
  // El registro puede apartarse; el para qué no. Por eso esta ranura se emite aunque el
  // acuerdo que gobierna lo demás no exista: nadie pidió un acuerdo y el árbol sí declaró.
  const dir = arbolQueDeclara();
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true,
    "el para qué no es del acuerdo: el acuerdo ausente no puede borrar lo que el árbol declaró");
  assert.match(r.texto, /jardineros del Entre/, `sin acuerdo tampoco se dice para qué: ${r.texto}`);
});

test("el para qué emitido no pasa de diez palabras", () => {
  const dir = arbolQueDeclara();
  acuerdoAprobado(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  const ranura = ranuraParaQue(r.texto);
  assert.notEqual(ranura, "", `la apertura no trae quinta ranura: ${r.texto}`);
  assert.ok(ranura.split(/\s+/).length <= 10,
    `«menos de diez palabras» es el enunciado, y esta ranura lo pasó: ${ranura}`);
});

test("un para qué declarado que no cabe no se emite entero: se dice que existe y dónde", () => {
  // El enunciado prefiere eso a un resumen. Un resumen sería una taxonomía del propósito, y
  // §31 manda #24 sobre las capas: si hay que nombrarlo para poder decirlo, no se entendió.
  const ocho = Array(8).fill("palabra").join(" ");   // ocho palabras: la ranura entera son diez
  const dir = arbolQueDeclara(`**El para qué: ${ocho} (Andrés, 2026-01-01).**\n`);
  acuerdoAprobado(dir);
  const dentro = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.match(dentro.texto, new RegExp(`para qué ${ocho}`),
    `una promesa que cabe en el enunciado se emite entera, no degradada: ${dentro.texto}`);

  const dir2 = arbolQueDeclara(`**El para qué: ${Array(12).fill("palabra").join(" ")}.** Y el cuerpo largo sigue.\n`);
  acuerdoAprobado(dir2);
  const r = inyeccion({ raiz: dir2, turno: null, nivel: "full" });
  assert.doesNotMatch(r.texto, /palabra palabra/,
    "no cabe entero y se emitió entero: el enunciado prefirió el puntero a la versión corta");
  assert.match(r.texto, /para qué en lore\/identidad\.md/,
    `si no cabe entero, tiene que decir dónde está: ${r.texto}`);
});

test("con el nivel apagado el para qué no sale y el kit sigue entero", () => {
  const dir = arbolQueDeclara();
  acuerdoAprobado(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "off" });
  assert.equal(r.inyectar, false);
  assert.equal(r.por, "apagado");
  assert.equal(r.texto, null);
  // Y por el canal de verdad del host, tampoco.
  assert.equal(corre(dir, "session_start", { estadoDir: estadoTmp(), nivel: "off", source: "startup" }), "");
});

test("un árbol que no declara para qué no recibe ninguno inventado, y el kit lo dice", () => {
  // Aquí está el límite honesto: en 40 árboles reales con `lore/identidad.md`, solo 2
  // declaran el marcador del para qué. Para los otros 38 el kit no puede exigir una promesa
  // que no sabe leer, así que no inventa ninguna — y no se queda en silencio, que es otra
  // forma de mentir: dice que no lo encontró.
  const conIdentidad = arbolQueDeclara("# Identidad\n\nNorte: una instrucción corta abre los cuerpos.\n");
  acuerdoAprobado(conIdentidad);
  const r = inyeccion({ raiz: conIdentidad, turno: null, nivel: "full" });
  assert.doesNotMatch(r.texto, /para qué/,
    "el kit no puede exigir una promesa que no sabe leer, y menos fabricarla");
  assert.equal(r.paraQue?.por, "sin-declarar",
    "callar no es decirlo: el motivo de la ranura ausente tiene que ser legible");
});

test("un árbol sin lore/identidad.md tampoco recibe un para qué inventado", () => {
  const dir = arbol();
  acuerdoAprobado(dir);
  const r = inyeccion({ raiz: dir, turno: null, nivel: "full" });
  assert.equal(r.inyectar, true);
  assert.doesNotMatch(r.texto, /para qué/);
  // El motivo distingue los dos ausentes: el archivo no está, o el archivo está y no lo declara.
  // Un solo motivo para los dos sería no saber cuál de los dos pasó.
  assert.equal(r.paraQue?.por, "sin-identidad");
});

test("el para qué es de la apertura: el turno que sigue no lo vuelve a pagar", () => {
  const dir = arbolQueDeclara();
  acuerdoAprobado(dir);
  assert.match(inyeccion({ raiz: dir, turno: null, nivel: "full" }).texto, /jardineros del Entre/);
  assert.doesNotMatch(inyeccion({ raiz: dir, turno: 2, nivel: "full" }).texto, /jardineros del Entre/,
    "la apertura es una vez por sesión; repetir el para qué cada turno es el impuesto que R40 prohíbe");
});

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});
