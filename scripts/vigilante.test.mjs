// El vigilante de las FASES y el pre-commit que las obliga (2.5.2).
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { RECIBO, escribirRecibo, estadoDeArbol, verificar, verificarRecibo } from "./vigilante.mjs";

const aqui = dirname(fileURLToPath(import.meta.url));
const CLI = join(aqui, "lore-plugin.mjs");
const roots = [];
test.after(() => { for (const d of roots) rmSync(d, { recursive: true, force: true }); });

const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, "-c", "user.name=t", "-c", "user.email=t@t", ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const put = (dir, rel, body = "x\n") => { const f = join(dir, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, body); };

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "vigilante-"));
  roots.push(dir);
  git(dir, "init", "-q", "-b", "main");
  put(dir, "FASES.md", "# FASES\n");
  put(dir, "src/a.js", "a\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "inicio");
  return dir;
}

test("un árbol cuyo FASES.md acompañó al último trabajo está al día", () => {
  const dir = repo();
  assert.equal(estadoDeArbol(dir).estado, "al-dia");
  assert.equal(verificar(dir).veredicto, "al-dia");
});

test("un commit de trabajo sin FASES.md deja el árbol desfasado, y tocar FASES.md lo concilia", () => {
  const dir = repo();
  put(dir, "src/b.js");
  git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "trabajo");
  const e = estadoDeArbol(dir);
  assert.equal(e.estado, "desfasada");
  assert.equal(e.commitsDespues, 1);
  assert.deepEqual(e.archivosDespues, ["src/b.js"]);
  put(dir, "FASES.md", "# FASES\nhecho: b\n");
  git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "estado");
  assert.equal(estadoDeArbol(dir).estado, "al-dia");
});

test("el trabajo sin commitear también cuenta, salvo que FASES.md ya esté cambiado", () => {
  const dir = repo();
  put(dir, "src/c.js");
  assert.equal(estadoDeArbol(dir).estado, "desfasada");
  put(dir, "FASES.md", "# FASES\nen curso\n");
  assert.equal(estadoDeArbol(dir).estado, "al-dia");
});

test("cada árbol anidado se juzga por su propio FASES.md", () => {
  const dir = repo();
  put(dir, "proyectos/uno/FASES.md", "# uno\n");
  put(dir, "proyectos/uno/src/x.js");
  git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "uno");
  put(dir, "proyectos/uno/src/y.js");
  git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "trabajo en uno");
  const r = verificar(dir);
  const por = Object.fromEntries(r.arboles.map((a) => [a.arbol, a.estado]));
  assert.equal(por["."], "al-dia", "el trabajo de un proyecto no desfasa al área");
  assert.equal(por["proyectos/uno"], "desfasada");
});

test("el recibo lleva coverage y notCovered, sale sellado y uno editado a mano no verifica", () => {
  const dir = repo();
  const recibo = verificar(dir);
  assert.ok(recibo.coverage.length > 0 && recibo.notCovered.length > 0);
  assert.match(recibo.notCovered.join(" "), /sea cierto/, "declara que mide sincronía, no veracidad");
  escribirRecibo(dir, recibo);
  assert.equal(verificarRecibo(join(dir, RECIBO)).ok, true);
  const editado = JSON.parse(readFileSync(join(dir, RECIBO), "utf8"));
  editado.veredicto = "al-dia"; editado.arboles[0].estado = "al-dia"; editado.saltos = 99;
  writeFileSync(join(dir, RECIBO), JSON.stringify(editado));
  assert.equal(verificarRecibo(join(dir, RECIBO)).ok, false);
});

test("el CLI sale con 1 cuando hay FASES desfasadas y con 0 cuando no", () => {
  const dir = repo();
  assert.equal(spawnSync("node", [CLI, "vigilante", dir], { encoding: "utf8" }).status, 0);
  put(dir, "src/d.js"); git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "d");
  const r = spawnSync("node", [CLI, "vigilante", dir], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FASES desfasadas/);
  assert.match(r.stdout, /siguiente paso/);
});

test("el pre-commit detiene el commit que deja atrás a FASES.md, con su razón y su paso", () => {
  const dir = repo();
  assert.equal(spawnSync("node", [CLI, "fases", "install-hook", dir], { encoding: "utf8" }).status, 0);
  put(dir, "src/e.js");
  git(dir, "add", "-A");
  let falla;
  try { git(dir, "commit", "-q", "-m", "sin estado"); } catch (e) { falla = e; }
  assert.ok(falla, "el commit se detiene");
  assert.match(String(falla.stderr), /FASES\.md no va en el commit/);
  assert.match(String(falla.stderr), /Siguiente paso/);
  put(dir, "FASES.md", "# FASES\ne\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "con estado"); // pasa
});

test("el salto de la regla deja constancia y el vigilante la cuenta; sin trabajo nuevo no estorba", () => {
  const dir = repo();
  spawnSync("node", [CLI, "fases", "install-hook", dir]);
  put(dir, "src/f.js"); git(dir, "add", "-A");
  execFileSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "salto"], { env: { ...process.env, LORE_FASES: "skip" } });
  assert.equal(verificar(dir).saltos, 1);
  put(dir, "FASES.md", "# FASES\nf\n"); git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", "solo estado");
});

test("no pisa un pre-commit ajeno", () => {
  const dir = repo();
  writeFileSync(join(dir, ".git", "hooks", "pre-commit"), "#!/bin/sh\nexit 0\n");
  const r = spawnSync("node", [CLI, "fases", "install-hook", dir], { encoding: "utf8" });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no lo piso/);
});
