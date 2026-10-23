// L1 de 2.5.3 en Claude Code - la entrega la observa el host, no el coordinador. El hook
// hooks/delivery-observer.mjs corre en PreToolUse y PostToolUse de la herramienta de agentes y registra
// huellas (prompt, tool_use_id, sesion, transcript), nunca el contenido. `operation prompt` da el encargo
// canonico; `operation confirm-delivery` solo pone la tarea en marcha con un par Pre/Post cuya huella
// coincide con ese encargo y que el transcript de la sesion respalda. Lo que se lanzo por otra via (Bash)
// no deja par y queda sin observar. La integridad es la del mismo usuario del sistema operativo: un
// usuario que reescribe registro y transcript a la vez no se detecta aqui, y el recibo lo dice.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const AQUI = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(AQUI, "../scripts/lore-plugin.mjs");
const HOOK = resolve(AQUI, "../hooks/delivery-observer.mjs");
const REGISTRO = ".lore-deliveries.jsonl";
const sha = (text) => createHash("sha256").update(text).digest("hex");
const futuro = (ms = 600_000) => new Date(Date.now() + ms).toISOString();

function cli(args) {
  const r = spawnSync(process.execPath, [CLI, "operation", ...args], { encoding: "utf8" });
  const line = r.stdout.trim().split(/\r?\n/).filter(Boolean).pop();
  let json = null;
  try { json = line ? JSON.parse(line) : null; } catch { json = null; }
  return { code: r.status, json, err: r.stderr };
}

function hook(event, payload) {
  return spawnSync(process.execPath, [HOOK, event], { encoding: "utf8", input: JSON.stringify(payload) });
}

async function operacionConTrabajador(t) {
  const root = await mkdtemp(join(tmpdir(), "delivery-observer-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const hold = cli(["hold", "--root", root, "--json", JSON.stringify({ goal: "Fusionar tres ensayos", owner: "coordinador", authority: { spend: [] }, scope: "tres ensayos", expected_effect: { kind: "none" }, done: "fusion revisada", roles: ["worker", "verifier"], verifier: "verificador" })]);
  assert.equal(hold.code, 0, hold.err);
  const id = hold.json.id;
  assert.equal(cli(["authorize", "--root", root, "--id", id, "--json", JSON.stringify({ by: "Andres", words: "adelante" })]).code, 0);
  const plan = cli(["plan", "--root", root, "--id", id, "--json", JSON.stringify({ role: "worker", question: "Fusiona los tres", sources: ["a.md", "b.md", "c.md"], scope: "solo la fusion", done_criterion: "cubre los tres y nada mas", proof: "contraste con originales", output: { path: "fusion.md" }, timeoutMs: 600000, nextCheckAt: futuro(60_000) })]);
  assert.equal(plan.code, 0, plan.err);
  const prompt = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(prompt.code, 0, prompt.err);
  return { root, id, prompt: prompt.json.prompt, promptSha: prompt.json.prompt_sha256 };
}

async function transcriptCon(root, toolUseId, prompt) {
  const file = join(root, "transcript.jsonl");
  const linea = { type: "assistant", message: { content: [{ type: "tool_use", id: toolUseId, name: "Agent", input: { description: "worker", prompt } }] } };
  await appendFile(file, `${JSON.stringify(linea)}\n`);
  return file;
}

function eventoAgente(root, transcript, toolUseId, prompt, extra = {}) {
  return { session_id: "sesion-prueba", transcript_path: transcript, cwd: root, tool_name: "Agent", tool_use_id: toolUseId, tool_input: { description: "worker", prompt }, ...extra };
}

test("operation prompt renders the canonical commission with the shipped method", async (t) => {
  const { prompt, promptSha } = await operacionConTrabajador(t);
  const metodo = await readFile(resolve(AQUI, "../skills/vespi/method.md"), "utf8");
  assert.ok(prompt.includes(metodo), "el prompt lleva el metodo entero");
  assert.match(prompt, /^# Task t1 of operation /m);
  assert.equal(promptSha, sha(prompt));
});

test("the hook records fingerprints of a task prompt and nothing else", async (t) => {
  const { root, prompt } = await operacionConTrabajador(t);
  const transcript = await transcriptCon(root, "toolu_1", prompt);
  assert.equal(hook("pre", eventoAgente(root, transcript, "toolu_1", prompt)).status, 0);
  assert.equal(hook("post", eventoAgente(root, transcript, "toolu_1", prompt, { tool_response: { agentId: "agente-7" } })).status, 0);
  assert.equal(hook("pre", eventoAgente(root, transcript, "toolu_2", "un prompt cualquiera")).status, 0, "un prompt sin encargo no se registra");
  assert.equal(hook("pre", { ...eventoAgente(root, transcript, "toolu_3", prompt), tool_name: "Bash" }).status, 0, "otra herramienta no se registra");
  const lineas = (await readFile(join(root, REGISTRO), "utf8")).trim().split("\n").map((l) => JSON.parse(l));
  assert.equal(lineas.length, 2);
  assert.deepEqual(lineas.map((l) => l.event), ["pre", "post"]);
  assert.equal(lineas[0].prompt_sha256, sha(prompt));
  assert.equal(lineas[1].agent_id, "agente-7");
  assert.ok(!JSON.stringify(lineas).includes("Fusiona los tres"), "el registro no guarda el contenido del encargo");
});

test("(a) an observed Pre/Post pair backed by the transcript puts the task in motion", async (t) => {
  const { root, id, prompt } = await operacionConTrabajador(t);
  const transcript = await transcriptCon(root, "toolu_1", prompt);
  hook("pre", eventoAgente(root, transcript, "toolu_1", prompt));
  hook("post", eventoAgente(root, transcript, "toolu_1", prompt, { tool_response: { agentId: "agente-7" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1", "--json", JSON.stringify({ hostName: "claude-code", model: "m" })]);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.json.task.state, "running");
  const entrega = r.json.task.delivery;
  assert.equal(entrega.observed_by, "claude-code-hook");
  assert.equal(entrega.host_observation.tool_use_id, "toolu_1");
  assert.equal(entrega.host_observation.transcript, "matched");
  assert.equal(entrega.host_observation.integrity, "same-os-user");
  assert.equal(entrega.recipient, "agente-7");
});

test("(b) a prompt altered by one byte does not confirm the delivery", async (t) => {
  const { root, id, prompt } = await operacionConTrabajador(t);
  const alterado = prompt.replace("Fusiona", "Fusionx");
  const transcript = await transcriptCon(root, "toolu_1", alterado);
  hook("pre", eventoAgente(root, transcript, "toolu_1", alterado));
  hook("post", eventoAgente(root, transcript, "toolu_1", alterado, { tool_response: { agentId: "agente-7" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.code, 0, r.err);
  assert.notEqual(r.json.task.state, "running");
  assert.match(r.json.task.blocked.cause, /not observed|no observada/i);
});

test("(c) a worker launched by another route leaves no observation and never runs", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.code, 0, r.err);
  assert.notEqual(r.json.task.state, "running");
  assert.equal(r.json.task.executor, null);
  assert.match(r.json.task.blocked.cause, /not observed|no observada/i);
});

test("(d) an observation appended by hand without transcript backing is refused", async (t) => {
  const { root, id, promptSha } = await operacionConTrabajador(t);
  const forjada = [
    { event: "pre", tool_use_id: "toolu_falso", session_id: "s", transcript_path: join(root, "no-existe.jsonl"), tool_name: "Agent", operation: id, task: "t1", prompt_sha256: promptSha, at: new Date().toISOString() },
    { event: "post", tool_use_id: "toolu_falso", session_id: "s", transcript_path: join(root, "no-existe.jsonl"), tool_name: "Agent", operation: id, task: "t1", prompt_sha256: promptSha, agent_id: "nadie", at: new Date().toISOString() },
  ];
  await writeFile(join(root, REGISTRO), forjada.map((l) => JSON.stringify(l)).join("\n") + "\n");
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.code, 0, r.err);
  assert.notEqual(r.json.task.state, "running");
  assert.match(r.json.task.blocked.cause, /transcript/i);
});

test("the hook never blocks or prints, even with malformed input", () => {
  const r = spawnSync(process.execPath, [HOOK, "pre"], { encoding: "utf8", input: "{no es json" });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "");
  assert.ok(!existsSync(join(tmpdir(), REGISTRO)) || true);
});

// Rediseno tras la prueba real del 2026-10-20: el modelo no copia el encargo. Escribe una referencia corta
// y el hook PreToolUse la expande en el host al encargo canonico, solo si la huella referida coincide.
test("the hook expands a short reference into the canonical commission on the host", async (t) => {
  const { root, id, prompt, promptSha } = await operacionConTrabajador(t);
  const referencia = `@lore-task ${id} t1 sha256:${promptSha}`;
  const r = hook("pre", eventoAgente(root, null, "toolu_r1", referencia));
  assert.equal(r.status, 0);
  const salida = JSON.parse(r.stdout);
  assert.equal(salida.hookSpecificOutput.hookEventName, "PreToolUse");
  assert.equal(salida.hookSpecificOutput.updatedInput.prompt, prompt, "el trabajador recibe el encargo canonico, byte a byte");
  assert.equal(salida.hookSpecificOutput.permissionDecision, undefined, "el hook no decide el permiso");
  const linea = JSON.parse((await readFile(join(root, REGISTRO), "utf8")).trim().split("\n").pop());
  assert.equal(linea.expanded, true);
  assert.equal(linea.prompt_sha256, promptSha);
});

test("a reference to another fingerprint is not expanded", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const r = hook("pre", eventoAgente(root, null, "toolu_r2", `@lore-task ${id} t1 sha256:${"0".repeat(64)}`));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, "", "sin coincidencia no hay reescritura");
  const linea = JSON.parse((await readFile(join(root, REGISTRO), "utf8")).trim().split("\n").pop());
  assert.equal(linea.expanded, false);
  assert.match(linea.refused, /fingerprint/);
});

test("(a) by reference: expanded on the host and backed by the transcript puts the task in motion", async (t) => {
  const { root, id, promptSha } = await operacionConTrabajador(t);
  const referencia = `@lore-task ${id} t1 sha256:${promptSha}`;
  const transcript = await transcriptCon(root, "toolu_r3", referencia);
  hook("pre", eventoAgente(root, transcript, "toolu_r3", referencia));
  hook("post", eventoAgente(root, transcript, "toolu_r3", referencia, { tool_response: { agentId: "agente-9" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.json.task.state, "running");
  assert.equal(r.json.task.delivery.host_observation.transcript, "matched-reference");
  assert.equal(r.json.task.delivery.host_observation.expanded_by_host, true);
});

test("operation prompt also returns the short reference", async (t) => {
  const { root, id, promptSha } = await operacionConTrabajador(t);
  const r = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.json.reference, `@lore-task ${id} t1 sha256:${promptSha}`);
});

// El transcript del propio subagente (`<sesion>/subagents/agent-<id>.jsonl`, con su `.meta.json` que nombra
// el tool_use) dice que recibio el trabajador: es la recepcion vista por el host, no por el coordinador.
async function subagente(transcript, agentId, toolUseId, primerMensaje) {
  const dir = join(dirname(transcript), "transcript", "subagents");
  await import("node:fs/promises").then((fs) => fs.mkdir(dir, { recursive: true }));
  await writeFile(join(dir, `agent-${agentId}.jsonl`), `${JSON.stringify({ type: "user", message: { role: "user", content: primerMensaje } })}\n`);
  await writeFile(join(dir, `agent-${agentId}.meta.json`), JSON.stringify({ toolUseId }));
}

test("the worker's own transcript proves what it received", async (t) => {
  const { root, id, prompt, promptSha } = await operacionConTrabajador(t);
  const referencia = `@lore-task ${id} t1 sha256:${promptSha}`;
  const transcript = await transcriptCon(root, "toolu_s1", referencia);
  await subagente(transcript, "agente-s1", "toolu_s1", prompt);
  hook("pre", eventoAgente(root, transcript, "toolu_s1", referencia));
  hook("post", eventoAgente(root, transcript, "toolu_s1", referencia, { tool_response: { agentId: "agente-s1" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.json.task.state, "running");
  assert.equal(r.json.task.delivery.host_observation.worker_received, "matched");
});

test("a worker whose own transcript shows another commission is not in motion", async (t) => {
  const { root, id, promptSha } = await operacionConTrabajador(t);
  const referencia = `@lore-task ${id} t1 sha256:${promptSha}`;
  const transcript = await transcriptCon(root, "toolu_s2", referencia);
  await subagente(transcript, "agente-s2", "toolu_s2", referencia);
  hook("pre", eventoAgente(root, transcript, "toolu_s2", referencia));
  hook("post", eventoAgente(root, transcript, "toolu_s2", referencia, { tool_response: { agentId: "agente-s2" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.notEqual(r.json.task.state, "running");
  assert.match(r.json.task.blocked.cause, /worker|trabajador/i);
});

// Ruta del trabajador del kit: la referencia apunta al encargo sin metodo y el hook solo la expande si el
// tipo de agente es el trabajador del kit, cuya definicion lleva el metodo fijado.
function eventoTrabajadorKit(root, transcript, toolUseId, prompt, tipo = "lore:lore-worker", extra = {}) {
  const evento = eventoAgente(root, transcript, toolUseId, prompt, extra);
  return { ...evento, tool_input: { ...evento.tool_input, subagent_type: tipo } };
}

function hookConPlugin(event, payload) {
  return spawnSync(process.execPath, [HOOK, event], { encoding: "utf8", input: JSON.stringify(payload), env: { ...process.env, CLAUDE_PLUGIN_ROOT: resolve(AQUI, "..") } });
}

test("the hook expands a worker reference into the commission only for the kit worker", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const r = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]);
  const { worker_reference: referencia, commission, method_sha256: metodo } = r.json;
  assert.ok(!commission.includes("<<<METHOD"), "el encargo del trabajador del kit no lleva el metodo");
  const h = hookConPlugin("pre", eventoTrabajadorKit(root, null, "toolu_k1", referencia));
  assert.equal(JSON.parse(h.stdout).hookSpecificOutput.updatedInput.prompt, commission);
  const linea = JSON.parse((await readFile(join(root, REGISTRO), "utf8")).trim().split("\n").pop());
  assert.equal(linea.route, "kit-worker");
  assert.equal(linea.definition_method_sha256, metodo, "el hook lee la definicion del trabajador y comprueba su metodo");
  const otro = hookConPlugin("pre", eventoTrabajadorKit(root, null, "toolu_k2", referencia, "general-purpose"));
  assert.equal(otro.stdout, "", "un encargo sin metodo no se entrega a un agente que no lo trae");
});

test("(a) kit worker: host meta, first message and definition method put the task in motion", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const { worker_reference: referencia, commission } = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]).json;
  const transcript = await transcriptCon(root, "toolu_k3", referencia);
  await subagente(transcript, "agente-k3", "toolu_k3", commission);
  await writeFile(join(dirname(transcript), "transcript", "subagents", "agent-agente-k3.meta.json"), JSON.stringify({ toolUseId: "toolu_k3", agentType: "lore:lore-worker" }));
  hookConPlugin("pre", eventoTrabajadorKit(root, transcript, "toolu_k3", referencia));
  hookConPlugin("post", eventoTrabajadorKit(root, transcript, "toolu_k3", referencia, "lore:lore-worker", { tool_response: { agentId: "agente-k3" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.json.task.state, "running");
  const vista = r.json.task.delivery.host_observation;
  assert.equal(vista.route, "kit-worker");
  assert.equal(vista.worker_agent_type, "lore:lore-worker");
  assert.equal(vista.worker_received, "matched");
});

test("a commission received by an agent of another type is not in motion", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const { worker_reference: referencia, commission } = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]).json;
  const transcript = await transcriptCon(root, "toolu_k4", referencia);
  await subagente(transcript, "agente-k4", "toolu_k4", commission);
  await writeFile(join(dirname(transcript), "transcript", "subagents", "agent-agente-k4.meta.json"), JSON.stringify({ toolUseId: "toolu_k4", agentType: "general-purpose" }));
  hookConPlugin("pre", eventoTrabajadorKit(root, transcript, "toolu_k4", referencia));
  hookConPlugin("post", eventoTrabajadorKit(root, transcript, "toolu_k4", referencia, "lore:lore-worker", { tool_response: { agentId: "agente-k4" } }));
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.notEqual(r.json.task.state, "running");
  assert.match(r.json.task.blocked.cause, /agent type|tipo/i);
});

// Prueba real 2026-10-20, corrida 1 del trabajador del kit: PostToolUse recibe la entrada ya reescrita por
// el PreToolUse, es decir el encargo sin metodo y no la referencia. El hook debe registrar ese Post.
test("the Post of a kit worker carries the expanded commission and is still recorded", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const { commission, commission_sha256 } = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]).json;
  const r = hookConPlugin("post", eventoTrabajadorKit(root, null, "toolu_k5", commission, "lore:lore-worker", { tool_response: { agentId: "agente-k5" } }));
  assert.equal(r.status, 0);
  const linea = JSON.parse((await readFile(join(root, REGISTRO), "utf8")).trim().split("\n").pop());
  assert.equal(linea.event, "post");
  assert.equal(linea.prompt_sha256, commission_sha256);
  assert.equal(linea.route, "kit-worker");
  assert.equal(linea.agent_id, "agente-k5");
});

// H1 (revision de Codex, 2026-10-20): el nombre corto `lore-worker` en otro namespace no es el trabajador
// del kit. La identidad admitida es la completa que el host da al agente de este plugin.
test("H1: a lore-worker from another plugin does not receive the commission without method", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const { worker_reference: referencia } = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]).json;
  const h = hookConPlugin("pre", eventoTrabajadorKit(root, null, "toolu_h1", referencia, "other-plugin:lore-worker"));
  assert.equal(h.stdout, "", "otro plugin con el mismo nombre corto no recibe la expansion");
  const linea = JSON.parse((await readFile(join(root, REGISTRO), "utf8")).trim().split("\n").pop());
  assert.equal(linea.expanded, false);
  const propio = hookConPlugin("pre", eventoTrabajadorKit(root, null, "toolu_h1b", referencia, "lore:lore-worker"));
  assert.ok(propio.stdout.length > 0, "control positivo: el trabajador propio si la recibe");
});

test("H1: confirmation refuses a worker of another plugin even with the exact commission", async (t) => {
  const { root, id } = await operacionConTrabajador(t);
  const { worker_reference: referencia, commission } = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]).json;
  const transcript = await transcriptCon(root, "toolu_h1c", referencia);
  await subagente(transcript, "agente-h1", "toolu_h1c", commission);
  await writeFile(join(dirname(transcript), "transcript", "subagents", "agent-agente-h1.meta.json"), JSON.stringify({ toolUseId: "toolu_h1c", agentType: "other-plugin:lore-worker" }));
  // El registro se escribe a mano como lo dejaria un hook que hubiera expandido: la confirmacion no debe
  // fiarse del nombre corto ni del registro para aceptar la identidad.
  const sha = (text) => createHash("sha256").update(text).digest("hex");
  const metodo = cli(["prompt", "--root", root, "--id", id, "--task", "t1"]).json.method_sha256;
  const base = { tool_use_id: "toolu_h1c", session_id: "s", transcript_path: transcript, tool_name: "Agent", operation: id, task: "t1", prompt_sha256: sha(commission), route: "kit-worker" };
  await writeFile(join(root, REGISTRO), [{ ...base, event: "pre", reference: true, expanded: true, definition_method_sha256: metodo, worker_agent_type: "other-plugin:lore-worker" }, { ...base, event: "post", agent_id: "agente-h1" }].map((l) => JSON.stringify(l)).join("\n") + "\n");
  const r = cli(["confirm-delivery", "--root", root, "--id", id, "--task", "t1"]);
  assert.notEqual(r.json.task.state, "running");
  assert.match(r.json.task.blocked.cause, /agent type|kit worker/i);
});
