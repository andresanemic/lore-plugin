// L1 de 2.5.3 en Claude Code - el trabajador del kit. La prueba real del 2026-10-20 mostro que el
// clasificador del modo automatico puede negar un lanzamiento cuyo prompt lleva los 10 KB del metodo. El
// kit trae entonces su propio tipo de trabajador, `agents/lore-worker.md`, cuya definicion contiene el
// metodo; el prompt lleva solo el encargo. La definicion se genera desde skills/vespi/method.md y no se
// escribe a mano: si los dos textos se separan, esta prueba falla.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AGENTE = resolve(RAIZ, "agents/lore-worker.md");
const METODO = resolve(RAIZ, "skills/vespi/method.md");

test("the kit worker definition carries the shipped method byte for byte", async () => {
  const agente = await readFile(AGENTE, "utf8");
  const metodo = await readFile(METODO, "utf8");
  assert.match(agente, /^---\nname: lore-worker\n/);
  const inicio = agente.indexOf("\n<<<METHOD\n");
  const fin = agente.lastIndexOf("\nMETHOD>>>\n");
  assert.ok(inicio > 0 && fin > inicio, "la definicion delimita el metodo");
  assert.equal(agente.slice(inicio + "\n<<<METHOD\n".length, fin), metodo);
});

test("the worker definition is generated, and --check catches drift", () => {
  const r = spawnSync(process.execPath, [resolve(RAIZ, "scripts/build-worker-agent.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("the package distributes the worker definition", async () => {
  const pkg = JSON.parse(await readFile(resolve(RAIZ, "package.json"), "utf8"));
  assert.ok(pkg.files.some((entry) => entry === "agents/" || entry === "agents"), "agents/ viaja en el paquete");
});
