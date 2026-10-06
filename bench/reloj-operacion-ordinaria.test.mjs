import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(REPO, "scripts", "lore-plugin.mjs");
const json = (v) => JSON.stringify(v);

function home() {
  const h = mkdtempSync(join(tmpdir(), "reloj-"));
  mkdirSync(h, { recursive: true });
  return h;
}

function command(args, envExtra = {}) {
  const h = envExtra.HOME;
  const env = { ...process.env, ...envExtra };
  if (h) { env.HOME = h; env.USERPROFILE = h; env.TEMP = h; env.TMP = h; }
  const r = spawnSync(process.execPath, [CLI, "operation", ...args], { encoding: "utf8", env });
  const line = r.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  let body = null;
  try { body = line ? JSON.parse(line) : null; } catch {}
  return { code: r.status, out: r.stdout, err: r.stderr, body };
}

function seedRoot(root) {
  writeFileSync(join(root, "CLAUDE.md"), "# Contrato fixture\n");
  writeFileSync(join(root, "FASES.md"), ["# Fases", "", "## Operaciones", ""].join("\n"));
}

function holdAuth(root, brazo) {
  const h = home();
  const envExtra = { HOME: h };
  if (brazo === "A") envExtra.LORE_NIVEL = "off";
  seedRoot(root);
  const t0 = Date.now();
  const held = command(["hold", "--root", root, "--json", json({
    goal: "Operacion ordinaria sin presion", owner: "coordinador",
    authority: { spend: [], granted_by: "persona", scope: "solo fixture", valid: true },
  })], envExtra);
  const dt = Date.now() - t0;
  return { held, dt, envExtra, h };
}

// Escenario 1 (bench 1: cumplimiento al primer intento; bench 2: integral): abrir nombra paso+archivo.
test("E1 abrir: entry con operacion abierta nombra siguiente paso y archivo", () => {
  const root = mkdtempSync(join(tmpdir(), "e1-"));
  const { held, envExtra } = holdAuth(root, "B");
  assert.equal(held.body?.ok, true, `hold: ${held.err} ${held.out}`);
  const id = held.body.id;
  const e = command(["entry", "--root", root, "--json", json({})], envExtra);
  const txt = `${e.out} ${e.err} ${JSON.stringify(e.body ?? {})}`;
  assert.match(txt, /next_step|authorize|decide/i, "entry no nombra siguiente paso");
  assert.match(txt, /FASES|paso|archivo|\.md/i, "entry no nombra archivo");
  rmSync(root, { recursive: true, force: true });
});

// Escenario 2: operar deja recibo con verificador distinto del ejecutor y next_step no vacío.
// Flujo ordinario completo hold→authorize→plan→dispatch→receive→review→verify→integrate→close.
test("E2 operar: recibo existe, verificador distinto del ejecutor", () => {
  const root = mkdtempSync(join(tmpdir(), "e2-"));
  const { held, envExtra } = holdAuth(root, "B");
  assert.equal(held.body?.ok, true, `hold: ${held.err} ${held.out}`);
  const id = held.body.id;
  const aids = ["--root", root, "--id", id];
  const a = command(["authorize", ...aids, "--json", json({ by: "persona", words: "Autoriza solo este cotejo local" })], envExtra);
  assert.equal(a.body?.ok, true, `authorize: ${a.err} ${a.out}`);
  const outPath = join(root, "worker.md");
  const p = command(["plan", ...aids, "--json", json({ role: "worker", question: "Cotejo acotado", scope: "solo el fixture", done_criterion: "archivo presente", proof: "releer archivo", output: { path: outPath }, timeoutMs: 120000, nextCheckAt: new Date(Date.now() + 60000).toISOString() })], envExtra);
  const tid = p.body?.task?.id ?? p.body?.taskRecord?.id;
  assert.ok(tid, `plan sin task: ${p.out}`);
  const d = command(["dispatch", ...aids, "--task", tid, "--tools", "delegate", "--json", json({ hostName: "h-worker", model: "m-worker" })], envExtra);
  assert.equal(d.body?.ok, true, `dispatch: ${d.out} ${d.err}`);
  writeFileSync(outPath, "criterio\nfuente\nriesgo\n");
  const r = command(["receive", ...aids, "--task", tid, "--json", json({})], envExtra);
  assert.equal(r.body?.ok, true, `receive: ${r.out} ${r.err}`);
  const rv = command(["review", ...aids, "--task", tid, "--json", json({ reviewer: "revisora", checked: ["scope", "sources", "risks"] })], envExtra);
  assert.equal(rv.body?.ok, true, `review: ${rv.out} ${rv.err}`);
  const bad = command(["verify", ...aids, "--task", tid, "--json", json({ verifier: "h-worker/m-worker", observed: true })], envExtra);
  assert.notEqual(bad.body?.ok, true, "autoverify debió rechazarse");
  const v = command(["verify", ...aids, "--task", tid, "--json", json({ verifier: "coordinadora", observed: true, evidence: "releí worker.md" })], envExtra);
  assert.equal(v.body?.ok, true, `verify: ${v.out} ${v.err}`);
  const it = command(["integrate", ...aids, "--task", tid, "--json", json({ destination: "revisado.md" })], envExtra);
  assert.equal(it.body?.ok, true, `integrate: ${it.out} ${it.err}`);
  const c = command(["close", ...aids, "--json", json({ verification: { verified: true, observed: true, by: "coordinadora", verified_tasks: [tid], unverified_effects: [] } })], envExtra);
  assert.equal(c.body?.state, "closed", `close: ${c.out} ${c.err}`);
  const disk = readFileSync(join(root, "FASES.md"), "utf8");
  assert.match(disk, new RegExp(`<!-- vespi:operacion ${id} -->`), "FASES no conserva la operacion");
  rmSync(root, { recursive: true, force: true });
});

// Escenario 3 (tiempo LUS: el pasado sigue colaborando): tras reset, el sucesor reconstruye sin preguntar.
test("E3 sobrevivir: estado en FASES basta para continuar sin reconstruccion", () => {
  const root = mkdtempSync(join(tmpdir(), "e3-"));
  const { held } = holdAuth(root, "B");
  assert.equal(held.body?.ok, true, `hold: ${held.err} ${held.out}`);
  const id = held.body.id;
  const fresh = readFileSync(join(root, "FASES.md"), "utf8");
  assert.match(fresh, new RegExp(`<!-- vespi:operacion ${id} -->`), "sucesor no encuentra la operacion");
  assert.match(fresh, /## Operaciones/, "sucesor no encuentra el bloque");
  rmSync(root, { recursive: true, force: true });
});

// Escenario 4: degradar honesto — cuerpo viejo no se reporta roto; herramienta ausente bloquea.
test("E4 degradar: cuerpo viejo no marcado roto", () => {
  const root = mkdtempSync(join(tmpdir(), "e4-"));
  seedRoot(root);
  writeFileSync(join(root, "FASES.md"), "# Fases\n\n## Operaciones\n\nBloque 2.4.9 viejo.\n");
  const h = home();
  const e = command(["entry", "--root", root, "--json", json({})], { HOME: h });
  const txt = `${e.out} ${e.err} ${JSON.stringify(e.body ?? {})}`;
  assert.doesNotMatch(txt, /roto|corrupto|migraci.n obligatoria/i, "cuerpo viejo reportado como roto");
  rmSync(root, { recursive: true, force: true });
});
