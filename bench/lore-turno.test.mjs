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
    `el turno超出了 su presupuesto: ${Buffer.byteLength(context)} bytes`);
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
  // Y la sesion de Claude Code no pide nada al abrir: el arranque calla (2.4.7).
  const dir = arbol();
  acuerdoAprobado(dir);
  assert.equal(corre(dir, "session_start", { estadoDir: estadoTmp(), source: "startup" }), "");
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

import { LorePlugin } from "../hooks/opencode-plugin.js";

let sesiones = 0;

function idOpenCode() {
  return `opencode-probe-${process.pid}-${++sesiones}`;
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
      { sessionID: idOpenCode(), tool: "write" },
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

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});
