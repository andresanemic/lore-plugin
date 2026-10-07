import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(repo, "hooks", "codex-guard.mjs");
const receipt = ".lore-mycelium";
const roots = [];

function tree(files = { "lore/principios.md": "# Principios\n" }) {
  const dir = mkdtempSync(join(tmpdir(), "codex-lore-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) write(dir, rel, body);
  return dir;
}

function write(dir, rel, body) {
  const full = join(dir, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
}

function run(cwd, event, payload = {}) {
  const input = {
    cwd,
    hook_event_name: event === "session_start" ? "SessionStart" : "PostToolUse",
    session_id: "probe-session",
    transcript_path: join(cwd, "transcript.jsonl"),
    model: "probe-model",
    permission_mode: "never",
  };
  if (event === "post_tool_use") {
    Object.assign(input, {
      turn_id: "probe-turn",
      tool_name: "exec_command",
      tool_input: {},
      tool_response: {},
      tool_use_id: "probe-tool",
    });
  }
  Object.assign(input, payload);
  return execFileSync("node", [hook, event], {
    input: JSON.stringify(input), encoding: "utf8",
  });
}

function injected(stdout, event = "PostToolUse") {
  assert.notEqual(stdout.trim(), "");
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, event);
  return parsed.hookSpecificOutput.additionalContext;
}

// PreToolUse sin SessionStart previo: id fresco, sin raíz registrada, la jurisdicción cae al cwd.
function freshSession() {
  return `pre-${process.pid}-${Math.random().toString(36).slice(2)}`;
}

function preWrite(cwd, target, sessionId = freshSession()) {
  return execFileSync("node", [hook, "pre_tool_use"], {
    input: JSON.stringify({
      cwd,
      hook_event_name: "PreToolUse",
      session_id: sessionId,
      turn_id: "probe-turn",
      tool_name: "apply_patch",
      tool_input: { command: `*** Begin Patch\n*** Update File: ${target}\n@@\n-old\n+new\n*** End Patch` },
      tool_use_id: "probe-tool",
      permission_mode: "never",
    }),
    encoding: "utf8",
  });
}

function claudePreWrite(cwd, target, sessionId = freshSession()) {
  return execFileSync("node", [hook, "pre_tool_use"], {
    input: JSON.stringify({
      cwd,
      hook_event_name: "PreToolUse",
      session_id: sessionId,
      tool_name: "Edit",
      tool_input: {
        file_path: target,
        old_string: "old",
        new_string: "new",
      },
      tool_use_id: "probe-tool",
      permission_mode: "bypassPermissions",
    }),
    encoding: "utf8",
  });
}

function preMove(cwd, source, target, sessionId = freshSession()) {
  return execFileSync("node", [hook, "pre_tool_use"], {
    input: JSON.stringify({
      cwd,
      hook_event_name: "PreToolUse",
      session_id: sessionId,
      turn_id: "probe-turn",
      tool_name: "apply_patch",
      tool_input: { command: `*** Begin Patch\n*** Update File: ${source}\n*** Move to: ${target}\n@@\n-old\n+new\n*** End Patch` },
      tool_use_id: "probe-tool",
      permission_mode: "never",
    }),
    encoding: "utf8",
  });
}


// RC7: la guardia identifica y anota una escritura en otro árbol, pero no decide. La decisión
// es del permiso nativo del host (allow, ask o deny), que ya recoge lo que la persona concedió.
function delega(salida, ruta) {
  const r = JSON.parse(salida);
  assert.equal(r.hookSpecificOutput, undefined, "la guardia no decide: delega en el permiso del host");
  assert.match(r.systemMessage, /la decide el permiso de tu host/);
  if (ruta) assert.ok(r.systemMessage.includes(ruta), "nombra la ruta escrita");
}

test("PreToolUse permite el scratchpad de la sesión aunque esté fuera del árbol", () => {
  const own = tree();
  const scratch = join(tmpdir(), "claude", "sesion-probe", "scratchpad", "borrador.md");
  assert.equal(preWrite(own, scratch), "");
  assert.equal(claudePreWrite(own, scratch), "");
});

test("PreToolUse delega en el permiso del host las escrituras sobre árboles federados y las anota", () => {
  const hive = mkdtempSync(join(tmpdir(), "lore-hive-"));
  roots.push(hive);
  const own = join(hive, "bots", "proyectos", "bot-probe");
  const federated = join(hive, "investigacion-cientifica");
  const stranger = join(hive, "otro-arbol");
  for (const dir of [own, federated, stranger]) mkdirSync(dir, { recursive: true });
  write(own, "lore/principios.md", "# Propio\n");
  write(own, "lore/enrutamiento.md",
    "# Enrutamiento\n\n| Proyecto | Cuándo | Dónde vive su Lore |\n|---|---|---|\n| Investigación Científica | evidencia | `investigacion-cientifica` |\n");
  write(federated, "lore/metodo.md", "# Método\n");
  write(stranger, "lore/principios.md", "# Ajeno\n");

  delega(preWrite(own, join(federated, "lore", "metodo.md")), join(federated, "lore", "metodo.md"));
  delega(claudePreWrite(own, join(federated, "lore", "metodo.md")), join(federated, "lore", "metodo.md"));
  delega(preWrite(own, join(stranger, "lore", "principios.md")), join(stranger, "lore", "principios.md"));
});

test("la jurisdicción se ancla en la raíz donde abrió la sesión, no en el cwd que deriva", () => {
  const hive = mkdtempSync(join(tmpdir(), "lore-hive-"));
  roots.push(hive);
  const own = join(hive, "agentes", "vendedor");
  const other = join(hive, "agentes", "cliente");
  for (const dir of [own, other]) mkdirSync(dir, { recursive: true });
  write(own, "lore/principios.md", "# Propio\n");
  write(other, "lore/principios.md", "# Ajeno\n");
  const sessionId = `drift-${Date.now()}`;

  assert.equal(run(own, "session_start", { session_id: sessionId }), "");
  // el cwd derivó al árbol ajeno; el propio sigue permitido y el ajeno se delega al host (nunca deny ni ask)
  assert.equal(preWrite(other, join(own, "lore", "principios.md"), sessionId), "");
  delega(preWrite(other, join(other, "lore", "principios.md"), sessionId), join(other, "lore", "principios.md"));
});

// 2026-09-25, bot-lus-lore: Claude Code re-dispara SessionStart al compactar (source "compact")
// con el cwd ya derivado; la raíz registrada no puede sobrescribirse con ese cwd.
test("una compactación con el cwd derivado no re-ancla la jurisdicción", () => {
  const hive = mkdtempSync(join(tmpdir(), "lore-hive-"));
  roots.push(hive);
  const own = join(hive, "bots", "bot-probe");
  const drifted = join(hive, "plugins", "kit", "skills", "una-skill");
  for (const dir of [own, drifted]) mkdirSync(dir, { recursive: true });
  write(own, "lore/principios.md", "# Propio\n");
  write(drifted, "lore/principios.md", "# Ajeno\n");
  const sessionId = `compact-${Date.now()}`;

  assert.equal(run(own, "session_start", { session_id: sessionId, source: "startup" }), "");
  run(drifted, "session_start", { session_id: sessionId, source: "compact" });
  assert.equal(claudePreWrite(drifted, join(own, "lore", "principios.md"), sessionId), "");
  delega(claudePreWrite(own, join(drifted, "lore", "principios.md"), sessionId), join(drifted, "lore", "principios.md"));
});

test("el aviso de una escritura en otro árbol no manda a un lugar inexistente ni pide abstenerse", () => {
  const own = tree();
  // R16: el aviso nombra la ruta escrita; no manda a intercambio/ ni dice «propón el cambio al dueño».
  const otherTree = mkdtempSync(join(tmpdir(), "lore-fuera-"));
  roots.push(otherTree);
  mkdirSync(join(otherTree, "lore"), { recursive: true });
  const outside = join(otherTree, "x.md");
  delega(claudePreWrite(own, outside), outside);
  const aviso = JSON.parse(claudePreWrite(own, outside)).systemMessage;
  assert.doesNotMatch(aviso, /intercambio|propón el cambio/i);
});

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});

test("SessionStart establishes a silent baseline before the first tool", () => {
  const dir = tree();
  assert.equal(run(dir, "session_start"), "");
  assert.equal(existsSync(join(dir, receipt)), true);
  assert.equal(JSON.parse(readFileSync(join(dir, receipt), "utf8")).version, 2);
});

test("SessionStart is silent even when the receipt was already stale from before", () => {
  const dir = tree();
  writeFileSync(join(dir, receipt),
    `${JSON.stringify({ version: 2, digest: "0".repeat(64), alwaysOnBytes: 0, sweepType: "structural" })}\n`);
  assert.equal(run(dir, "session_start"), "");
  // no evalúa en el arranque: no reescribe el recibo desfasado
  assert.equal(JSON.parse(readFileSync(join(dir, receipt), "utf8")).digest, "0".repeat(64));
});

test("SessionStart red path fires once on a federated bot with undeclared load", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `canon/`\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
  });
  const out = run(dir, "session_start");
  assert.equal(out.trim().split("\n").length, 1);
  assert.match(out, /mycelium federated/);
});

test("SessionStart stays silent on a federated bot with full declaration", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `canon/`\n- `lore/enrutamiento.md`\n- `FASES.md`\n- el triplete de cada árbol hermano entra siempre que la tarea los enrute; son hermanos, no ancestros, el host no lo inyecta.\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
  });
  assert.equal(run(dir, "session_start"), "");
});

test("SessionStart stays silent on a packaged bot with the rule and no canon", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/enrutamiento.md`\n- `FASES.md`\n- árboles hermanos: el triplete entra siempre que la tarea los enrute, no son ancestros, el host no los inyecta.\n<!-- /lore:always-on -->\n",
    "lore/enrutamiento.md": "# routing\n",
  });
  assert.equal(run(dir, "session_start"), "");
});

test("a receipt stale from before the session stays silent until an in-session change", () => {
  const dir = tree();
  writeFileSync(join(dir, receipt),
    `${JSON.stringify({ version: 2, digest: "0".repeat(64), alwaysOnBytes: 0, sweepType: "structural" })}\n`);
  run(dir, "session_start");
  assert.equal(run(dir, "post_tool_use"), "");
  write(dir, "lore/principios.md", "# Principios\n\n## Nueva\n");
  assert.match(injected(run(dir, "post_tool_use")), /cambios de criterio.*trabajo que deben guiar/i);
});

test("clean PostToolUse stays silent", () => {
  const dir = tree();
  run(dir, "session_start");
  assert.equal(run(dir, "post_tool_use"), "");
});

test("a Lore change injects one plain action before close", () => {
  const dir = tree();
  run(dir, "session_start");
  write(dir, "lore/principios.md", "# Principios\n\n## Nueva\n");
  const context = injected(run(dir, "post_tool_use"));
  assert.match(context, /Mensaje del hook, no del usuario/);
  assert.match(context, /no le informes al usuario que revisaste/i);
  assert.match(context, /cambios de criterio.*trabajo que deben guiar/i);
  assert.match(context, /conserva una sola parte: la respuesta que ya ibas a dar/i);
  assert.doesNotMatch(context, /MYCELIUM|save-to-lore|transmute-lore|receipt|junction/i);
});

test("an always-on expansion injects only the approval needed", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(9_000),
  });
  run(dir, "session_start");
  write(dir, "CLAUDE.md",
    "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n");
  const context = injected(run(dir, "post_tool_use"));
  assert.doesNotMatch(context, /trabajo que deben guiar/i);
  assert.match(context, /9,0 KB/);
  assert.match(context, /aprobación/i);
});

test("both pending conditions share one injection", () => {
  const dir = tree({
    "CLAUDE.md": "<!-- lore:always-on -->\n- `lore/criterio.md`\n<!-- /lore:always-on -->\n",
    "lore/criterio.md": "x".repeat(29_855),
  });
  run(dir, "session_start");
  write(dir, "lore/criterio.md", "x".repeat(68_608));
  const stdout = run(dir, "post_tool_use");
  const context = injected(stdout);
  assert.equal(stdout.trim().split("\n").length, 1);
  assert.match(context, /cambios de criterio.*trabajo que deben guiar/i);
  assert.match(context, /29,9 KB.*68,6 KB.*130%/s);
});

test("phase state changes do not inject Lore work", () => {
  const dir = tree({
    "lore/principios.md": "# Principios\n",
    "FASES.md": "# Estado. NO es Lore.\n",
  });
  run(dir, "session_start");
  write(dir, "FASES.md", "# Estado. NO es Lore.\n\n- avance\n");
  assert.equal(run(dir, "post_tool_use"), "");
});

test("a Claude-shaped PostToolUse payload is ignored", () => {
  const dir = tree();
  run(dir, "session_start");
  write(dir, "lore/principios.md", "# Cambio\n");
  assert.equal(run(dir, "post_tool_use", { turn_id: undefined }), "");
});

test("invalid input fails open", () => {
  assert.equal(execFileSync("node", [hook, "post_tool_use"], {
    input: "{", encoding: "utf8",
  }), "");
});

test("session_start en árbol vacío abre en silencio (fail open)", () => {
  const dir = mkdtempSync(join(tmpdir(), "codex-lore-empty-"));
  roots.push(dir);
  assert.equal(run(dir, "session_start"), "");
});

test("post_tool_use sin baseline la fija sin intervenir (fail open)", () => {
  const dir = tree();
  assert.equal(run(dir, "post_tool_use"), "");
});

test("recibo ausente tras abrir la sesión conserva la comparación contra el baseline", () => {
  const clean = tree();
  run(clean, "session_start");
  rmSync(join(clean, receipt));
  assert.equal(run(clean, "post_tool_use"), "", "una sesión limpia sigue en silencio");

  const changed = tree();
  run(changed, "session_start");
  rmSync(join(changed, receipt));
  write(changed, "lore/principios.md", "# Principios\n\nCambio posterior a la apertura.\n");
  assert.match(injected(run(changed, "post_tool_use")), /cambios de criterio.*trabajo que deben guiar/i);
});

test("payload de más de 1 MiB falla abierto sin salida ruidosa", () => {
  const dir = tree();
  run(dir, "session_start");
  write(dir, "lore/principios.md", "# Principios\n\nCambio posterior.\n");
  const payload = JSON.stringify({
    cwd: dir,
    session_id: "probe-session",
    turn_id: "probe-turn",
    tool_name: "exec_command",
    tool_input: {},
    tool_response: {},
    tool_use_id: "probe-tool",
    padding: "x".repeat(1_048_577),
  });

  assert.ok(Buffer.byteLength(payload) > 1_048_576);
  assert.equal(execFileSync("node", [hook, "post_tool_use"], { input: payload, encoding: "utf8" }), "");
});

test("PreToolUse permite el árbol propio y el intercambio hermano, y delega al host el canon ajeno", () => {
  const hive = mkdtempSync(join(tmpdir(), "lore-hive-"));
  roots.push(hive);
  const own = join(hive, "agentes", "vendedor");
  const other = join(hive, "agentes", "cliente");
  const exchange = join(hive, "intercambio");
  for (const dir of [own, other, exchange]) mkdirSync(dir, { recursive: true });
  write(own, "lore/principios.md", "# Propio\n");

  assert.equal(preWrite(own, join(own, "lore", "principios.md")), "");
  assert.equal(preWrite(own, join(exchange, "mensaje.md")), "");

  delega(preWrite(own, join(other, "canon", "frontera.md")), join(other, "canon", "frontera.md"));
  delega(preMove(own, join(own, "nota.md"), join(other, "nota.md")), join(other, "nota.md"));
  delega(claudePreWrite(own, join(other, "canon", "frontera.md")), join(other, "canon", "frontera.md"));
});
