// R2: la copia del kernel se vendoriza con un script, no a mano.
//
// Lo que se comprueba aquí no es que el texto salga bonito, sino que las tres cosas que hoy se
// escriben a dedo (los archivos, el encabezado de tres líneas y la tabla de SOURCE.md) salgan de
// una sola ejecución reproducible, que no se pueda perder un módulo nuevo por forgot de editar una
// lista, y que `--check` no escriba.
//
// La jaula del banco es el adversarial de verdad: un repositorio Git temporal, fuera del kit, con
// un commit que después gana un módulo. Si el inventario del kit viviera en una lista escrita a
// mano, el módulo nuevo no aparecería en ninguna de las cuatro cosas que deben recogerlo.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import { KERNEL_BRANCH_HEAD, KERNEL_FILES } from "./rc8-verificar-hosts.mjs";
import { verifyHosts } from "./rc8-verificar-hosts.mjs";
import { installCodex, sameTree } from "./installer.mjs";
import { bodyAfterHeader, kernelDirOf, kernelModules, readSourceRows } from "./kernel-inventory.mjs";
import { main, parseArguments, renderSourceDocument, vendorKernel } from "./vendor-kernel.mjs";

const kit = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = [];

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function git(root, args, encoding = "utf8") {
  return execFileSync("git", ["-c", "safe.directory=*", "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", ...args], { cwd: root, encoding });
}

function put(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

// Un checkout del kernel de mentira, con su package.json y su rama. Los módulos se pasan como
// Buffers a propósito: algunos llevan CRLF y otros no, y el vendorizado no puede normalizar.
function kernelRepo({ modules, version = "0.1.4", branch = "release/0.1.4-prep" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "lore-kernel-src-"));
  temporary.push(root);
  put(join(root, "package.json"), `${JSON.stringify({ name: "vespi-kernel", version, private: true }, null, 2)}\n`);
  for (const [name, body] of Object.entries(modules)) put(join(root, "src", name), body);
  git(root, ["init", "-q", "-b", branch]);
  git(root, ["config", "user.email", "t@example.invalid"]);
  git(root, ["config", "user.name", "kit"]);
  git(root, ["add", "-A"]);
  git(root, ["commit", "-q", "-m", "kernel"]);
  return { root, ref: branch, commit: git(root, ["rev-parse", "HEAD"]).trim() };
}

function kitRoot({ version = "2.4.9" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "lore-kit-"));
  temporary.push(root);
  put(join(root, "package.json"), `${JSON.stringify({ name: "@andresanemic/lore-plugin", version }, null, 2)}\n`);
  return root;
}

const BASE_MODULES = {
  "authority.js": Buffer.from("'use strict';\nmodule.exports = { ok: true };\n"),
  "continuity.js": Buffer.from("'use strict';\r\nmodule.exports = { crlf: true };\r\n"),
  "time.js": Buffer.from(""),
};

function vendorize(extra = {}) {
  const repo = extra.repo ?? kernelRepo({ modules: BASE_MODULES });
  const kitDirectory = extra.kitDirectory ?? kitRoot();
  const report = vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: kitDirectory, published: "2026-10-05", ...extra.options });
  return { repo, kitRoot: kitDirectory, kernelDir: kernelDirOf(kitDirectory), report };
}

test("el inventario nombra los módulos del directorio vendorizado, ordenados, y nada más", () => {
  const dir = kernelDirOf(kitRoot());
  put(join(dir, "time.js"), "// a\n");
  put(join(dir, "emergency.js"), "// b\n");
  put(join(dir, "SOURCE.md"), "# no es un módulo\n");
  put(join(dir, "package.json"), '{"type":"commonjs"}');
  mkdirSync(join(dir, "notas"), { recursive: true });
  put(join(dir, "notas", "x.js"), "// anidado, no es un módulo del kernel\n");
  assert.deepEqual(kernelModules(dir), ["emergency.js", "time.js"]);
  assert.deepEqual(kernelModules(join(kitRoot(), "no-existe")), []);
});

test("quitar el encabezado corta tres líneas y deja los bytes del cuerpo intactos", () => {
  const withCrlfBody = Buffer.from("// uno\r\n// dos\n// tres\n'a';\r\n'b';\r\n");
  assert.deepEqual(bodyAfterHeader(withCrlfBody), Buffer.from("'a';\r\n'b';\r\n"));
  // Un archivo que no llega a tres líneas no tiene encabezado: se entrega vacío, no un recorte
  // inventado que compararía como si fuera el cuerpo.
  assert.equal(bodyAfterHeader(Buffer.from("// uno\n")).length, 0);
  assert.equal(bodyAfterHeader(Buffer.alloc(0)).length, 0);
});

test("SOURCE.md se lee como tabla y las filas que no son tabla no cuentan", () => {
  const digest = "0".repeat(64);
  const rows = readSourceRows(["# titulo", "", "| `a.js` | `" + digest + "` | 12 |", "| algo mas | no | no |"].join("\n"));
  assert.deepEqual([...rows.keys()], ["a.js"]);
  assert.equal(rows.get("a.js").bytes, 12);
  assert.equal(rows.get("a.js").digest.length, 64);
});

test("vendoriza todos los src/*.js del ref con el encabezado de tres líneas y los bytes exactos", () => {
  const { repo, kernelDir, report } = vendorize();
  assert.equal(report.ok, true);
  assert.deepEqual(report.selected, ["authority.js", "continuity.js", "time.js"]);
  for (const name of report.selected) {
    const vendored = readFileSync(join(kernelDir, name));
    const lines = vendored.toString("utf8").split("\n").slice(0, 3);
    assert.match(lines[0], /^\/\/ Vendored copy/);
    assert.ok(lines[0].includes(`src/${name}`), `el encabezado no apunta a su fuente: ${lines[0]}`);
    assert.ok(lines[1].includes(`commit ${repo.commit.slice(0, 7)}`), `el encabezado no declara el commit corto: ${lines[1]}`);
    assert.equal(lines[2], "// this file is not the source of truth.");
    assert.ok(bodyAfterHeader(vendored).equals(git(repo.root, ["show", `${repo.ref}:src/${name}`], "buffer")), `los bytes de ${name} no son los del ref`);
  }
  // El cuerpo con CRLF se conserva con CRLF. Normalizar finales de línea aquí cambiaría la huella.
  assert.ok(bodyAfterHeader(readFileSync(join(kernelDir, "continuity.js"))).equals(BASE_MODULES["continuity.js"]));
  assert.equal(bodyAfterHeader(readFileSync(join(kernelDir, "time.js"))).length, 0);
});

test("regenera SOURCE.md en el formato de hoy, con la tabla de huellas y bytes", () => {
  const { repo, kernelDir, report } = vendorize();
  const source = readFileSync(join(kernelDir, "SOURCE.md"), "utf8");
  assert.equal(report.kernelVersion, "0.1.4");
  assert.ok(source.includes("Fixed copy of the Vespi kernel **0.1.4** in Lore Plugin 2.4.9, published on 2026-10-05."));
  assert.ok(source.includes(`branch \`release/0.1.4-prep\`, commit \`${repo.commit}\`.`));
  assert.ok(source.includes(`\`git show ${repo.commit}:src/<file>\``));
  for (const name of report.selected) {
    const row = readSourceRows(source).get(name);
    assert.equal(row.digest, sha256(git(repo.root, ["show", `${repo.ref}:src/${name}`], "buffer")));
    assert.equal(row.bytes, git(repo.root, ["show", `${repo.ref}:src/${name}`], "buffer").length);
  }
  assert.deepEqual([...readSourceRows(source).keys()], report.selected);
  // El documento se puede rehacer byte a byte: no hay texto suelto que dependa del día ni del árbol.
  assert.equal(renderSourceDocument({ kernelVersion: "0.1.4", kitVersion: "2.4.9", published: "2026-10-05", branch: "release/0.1.4-prep", commit: repo.commit, rows: report.rows }), source);
});

test("es idempotente: dos corridas seguidas no cambian un byte", () => {
  const { repo, kitRoot: root } = vendorize();
  const before = treeDigest(kernelDirOf(root));
  const second = vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: root, published: "2026-10-05" });
  assert.equal(second.ok, true);
  assert.deepEqual(second.written, [], "la segunda corrida no tenía que escribir nada");
  assert.equal(treeDigest(kernelDirOf(root)), before);
});

test("--modules vendoriza y publica solo lo pedido", () => {
  const { kernelDir, report } = vendorize({ options: { modules: ["time.js", "authority.js"] } });
  assert.deepEqual(report.selected, ["authority.js", "time.js"]);
  assert.deepEqual(kernelModules(kernelDir), ["authority.js", "time.js"]);
  assert.deepEqual([...readSourceRows(readFileSync(join(kernelDir, "SOURCE.md"), "utf8")).keys()], ["authority.js", "time.js"]);
});

test("un módulo pedido que no existe en el ref es error, y lo dice por su nombre", () => {
  assert.throws(() => vendorKernel({ source: kernelRepo({ modules: BASE_MODULES }).root, ref: "release/0.1.4-prep", kitRoot: kitRoot(), modules: ["time.js", "skill-provenance.js"], published: "2026-10-05" }), /skill-provenance\.js/);
});

test("no crea package.json si el directorio vendorizado no tiene uno, y conserva el que hay", () => {
  const sinPaquete = vendorize();
  assert.equal(existsSync(join(sinPaquete.kernelDir, "package.json")), false);

  const conPaquete = vendorize({ kitDirectory: sinPaquete.kitRoot });
  put(join(conPaquete.kernelDir, "package.json"), '{"type":"commonjs"}');
  const report = vendorKernel({ source: conPaquete.repo.root, ref: conPaquete.repo.ref, kitRoot: conPaquete.kitRoot, published: "2026-10-05" });
  assert.equal(report.ok, true);
  assert.equal(readFileSync(join(conPaquete.kernelDir, "package.json"), "utf8"), '{"type":"commonjs"}');
});

test("rechaza un package.json vendorizado que no sea el que el kit instala", () => {
  const { repo, kitRoot: root } = vendorize();
  const dir = kernelDirOf(root);
  put(join(dir, "package.json"), '{"type":"module"}');
  assert.throws(() => vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: root, published: "2026-10-05" }), /package\.json/);
});

test("un nombre de módulo con ruta no se puede escapar del directorio vendorizado", () => {
  for (const name of ["../escape.js", "sub/dir.js", "..\\escape.js", ".hidden.js"]) {
    assert.throws(() => vendorKernel({ source: kernelRepo({ modules: BASE_MODULES }).root, ref: "release/0.1.4-prep", kitRoot: kitRoot(), modules: [name], published: "2026-10-05" }), new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `aceptó ${name}`);
  }
});

test("sin rama declarada ni SOURCE.md previo, falla en vez de inventar la rama", () => {
  // El ref es un commit: no dice en qué rama estaba, y escribir una rama cualquiera sería una
  // afirmación falsa repetida en la cabecera de cada módulo.
  const repo = kernelRepo({ modules: BASE_MODULES });
  assert.throws(() => vendorKernel({ source: repo.root, ref: repo.commit, kitRoot: kitRoot(), published: "2026-10-05" }), /--branch/);
});

test("sin fecha declarada ni SOURCE.md previo, falla en vez de inventar la fecha", () => {
  assert.throws(() => vendorKernel({ source: kernelRepo({ modules: BASE_MODULES }).root, ref: "release/0.1.4-prep", kitRoot: kitRoot(), branch: "release/0.1.4-prep" }), /--published/);
});

test("un ref que no existe y un kernel sin versión fallan con un mensaje que nombra la causa", () => {
  const repo = kernelRepo({ modules: BASE_MODULES });
  assert.throws(() => vendorKernel({ source: repo.root, ref: "no-existe", kitRoot: kitRoot(), published: "2026-10-05" }), /no-existe/);
  const sinVersion = kernelRepo({ modules: BASE_MODULES, version: undefined });
  put(join(sinVersion.root, "package.json"), '{"name":"vespi-kernel"}\n');
  git(sinVersion.root, ["commit", "-qam", "sin version"]);
  assert.throws(() => vendorKernel({ source: sinVersion.root, ref: sinVersion.ref, kitRoot: kitRoot(), published: "2026-10-05" }), /version/);
});

// --- --check ---------------------------------------------------------------------------------

test("--check pasa sobre lo recién vendorizado y no escribe un byte", () => {
  const { repo, kitRoot: root } = vendorize();
  const before = treeDigest(root);
  const report = vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: root, published: "2026-10-05", check: true });
  assert.equal(report.ok, true);
  assert.deepEqual(report.differences, []);
  assert.equal(treeDigest(root), before);
});

test("--check acusa el cuerpo alterado y el módulo que falta, nombrándolos", () => {
  const { repo, kitRoot: root } = vendorize();
  const dir = kernelDirOf(root);
  put(join(dir, "authority.js"), `${readFileSync(join(dir, "authority.js"), "utf8")}// tanganos\n`);
  rmSync(join(dir, "time.js"));
  const report = vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: root, published: "2026-10-05", check: true });
  assert.equal(report.ok, false);
  const nombrados = report.differences.map((item) => item.path);
  assert.ok(nombrados.includes(join("core", "kernel", "authority.js")), `no accused authority.js: ${JSON.stringify(report.differences)}`);
  assert.ok(nombrados.includes(join("core", "kernel", "time.js")), `no nombró time.js: ${JSON.stringify(report.differences)}`);
  assert.ok(report.differences.every((item) => item.reason), "cada diferencia dice por qué");
});

test("--check acusa el módulo vendorizado que el ref ya no trae", () => {
  const { repo, kitRoot: root } = vendorize();
  const dir = kernelDirOf(root);
  put(join(dir, "retirado.js"), "// a\n// b\n// c\nresto\n");
  const report = vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: root, published: "2026-10-05", check: true });
  assert.equal(report.ok, false);
  assert.ok(report.orphans.includes("retirado.js"), `no nombró el huérfano: ${JSON.stringify(report.orphans)}`);
});

test("escribir con un huérfano a mano es error: si no, desaparecería de SOURCE.md en silencio", () => {
  const { repo, kitRoot: root } = vendorize();
  put(join(kernelDirOf(root), "retirado.js"), "// a\n// b\n// c\nresto\n");
  assert.throws(() => vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: root, published: "2026-10-05" }), /retirado\.js/);
});

test("otro commit declarado en el encabezado es una diferencia, aunque los cuerpos coincidan", () => {
  const { repo, kitRoot: root } = vendorize();
  const otro = kernelRepo({ modules: BASE_MODULES, branch: "release/0.1.5-prep" });
  const report = vendorKernel({ source: otro.root, ref: otro.ref, kitRoot: root, published: "2026-10-05", branch: "release/0.1.5-prep", check: true });
  assert.equal(report.ok, false);
  assert.equal(report.commit, otro.commit);
  assert.ok(report.differences.length > 0);
});

test("cuando los cuerpos coinciden y solo cambia el commit del encabezado, la diferencia lo dice así", () => {
  // Es el caso del día de la integración: el kernel avanzó en documentación y los módulos no. La
  // diferencia tiene que leerse como lo que es, no como «los bytes son distintos» en siete archivos.
  const fijado = kernelRepo({ modules: BASE_MODULES, branch: "release/0.1.4-prep" });
  const kitDirectory = kitRoot();
  vendorKernel({ source: fijado.root, ref: fijado.ref, kitRoot: kitDirectory, published: "2026-10-05" });

  put(join(fijado.root, "NOTAS.md"), "una nota que no es codigo\n");
  git(fijado.root, ["add", "-A"]);
  git(fijado.root, ["commit", "-qm", "notas"]);
  const movido = git(fijado.root, ["rev-parse", "HEAD"]).trim();

  const report = vendorKernel({ source: fijado.root, ref: "HEAD", kitRoot: kitDirectory, published: "2026-10-05", check: true });
  assert.equal(report.ok, false);
  const modulos = report.differences.filter((item) => item.path !== join("core", "kernel", "SOURCE.md"));
  assert.equal(modulos.length, 3);
  assert.ok(modulos.every((item) => item.reason.includes("los cuerpos coinciden") && item.reason.includes(movido.slice(0, 7))), `razones: ${JSON.stringify(report.differences)}`);
  assert.ok(report.differences.some((item) => item.path === join("core", "kernel", "SOURCE.md")), "SOURCE.md también nombra el commit, y tiene que distinguirse");
});

test("el CLI devuelve 0 si todo cuadra, 1 si difiere y 2 si no se puede ni leer", () => {
  const repo = kernelRepo({ modules: BASE_MODULES });
  const root = kitRoot();
  const base = ["--source", repo.root, "--ref", repo.ref, "--published", "2026-10-05", "--kit", root];
  assert.equal(runCli([...base]), 0);
  assert.equal(runCli([...base, "--check"]), 0);
  put(join(kernelDirOf(root), "time.js"), "// cabecera rota\n");
  assert.equal(runCli([...base, "--check"]), 1);
  assert.equal(runCli(["--source", repo.root, "--ref", "no-existe", "--kit", root, "--published", "2026-10-05"]), 2);
  assert.equal(runCli([]), 2);
  assert.equal(runCli(["--help"]), 0);
});

test("parseArguments devuelve las opciones que el encargo nombra, y rechaza lo que no conoce", () => {
  const parsed = parseArguments(["--source", "/k", "--ref", "abc1234", "--modules", "a.js, b.js", "--check"]);
  assert.equal(parsed.source, "/k");
  assert.equal(parsed.ref, "abc1234");
  assert.deepEqual(parsed.modules, ["a.js", "b.js"]);
  assert.equal(parsed.check, true);
  assert.throws(() => parseArguments(["--source", "/k", "--ref", "a", "--inventado"]), /--inventado/);
  assert.throws(() => parseArguments(["--source", "/k"]), /--ref/);
  assert.throws(() => parseArguments(["--ref", "a"]), /--source/);
  assert.throws(() => parseArguments(["--source", "/k", "--ref"]), /--ref/);
});

// --- un módulo nuevo, sin editar ninguna lista ------------------------------------------------

function homeWithKit(kitDirectory) {
  const home = mkdtempSync(join(tmpdir(), "lore-home-"));
  temporary.push(home);
  const pluginRoot = join(home, ".agents", "plugins", "plugins", "lore");
  put(join(kitDirectory, "skills", "vespi", "SKILL.md"), "---\nname: vespi\n---\n");
  cpSync(join(kitDirectory, "skills", "vespi"), join(pluginRoot, "skills", "vespi"), { recursive: true });
  put(join(pluginRoot, "package.json"), '{"name":"@andresanemic/lore-plugin","version":"2.4.9"}\n');
  put(join(home, ".claude", "plugins", "installed_plugins.json"), JSON.stringify({ plugins: { "lore@lore-plugin": [{ installPath: join(home, ".claude", "plugins", "cache", "lore", "2.4.9") }] } }));
  const claude = join(home, ".claude", "plugins", "cache", "lore", "2.4.9");
  cpSync(join(kitDirectory, "skills"), join(claude, "skills"), { recursive: true });
  put(join(claude, "package.json"), '{"name":"@andresanemic/lore-plugin","version":"2.4.9"}\n');
  const opencodeSkills = join(home, ".config", "opencode", "skills");
  cpSync(join(kitDirectory, "skills"), opencodeSkills, { recursive: true });
  put(join(home, ".config", "opencode", "lore-plugin.json"), JSON.stringify({ name: "@andresanemic/lore-plugin", version: "2.4.9", kernelVersion: "0.1.4" }));
  return { home, pluginRoot, claude, opencodeSkills };
}

test("un módulo nuevo en el ref se vendoriza, se publica y lo recogen el inventario y el verificador de hosts", () => {
  const primero = kernelRepo({ modules: { ...BASE_MODULES, "delegation.js": Buffer.from("delegacion\n") } });
  const antes = kitRoot();
  vendorKernel({ source: primero.root, ref: primero.ref, kitRoot: antes, published: "2026-10-05" });
  assert.deepEqual(kernelModules(kernelDirOf(antes)), ["authority.js", "continuity.js", "delegation.js", "time.js"]);

  // El kernel sigue trabajando: entra un módulo más y el ref se mueve.
  put(join(primero.root, "src", "emergency.js"), "// parada de emergencia\n'use strict';\n");
  git(primero.root, ["add", "-A"]);
  git(primero.root, ["commit", "-qm", "emergency"]);
  const despues = git(primero.root, ["rev-parse", "HEAD"]).trim();
  assert.notEqual(despues, primero.commit, "el ref tiene que haberse movido");

  const kitDirectory = kitRoot();
  const report = vendorKernel({ source: primero.root, ref: "HEAD", kitRoot: kitDirectory, published: "2026-10-05" });
  assert.equal(report.ok, true);
  const dir = kernelDirOf(kitDirectory);
  assert.ok(existsSync(join(dir, "emergency.js")), "el módulo nuevo no se vendorizó");
  assert.ok(readSourceRows(readFileSync(join(dir, "SOURCE.md"), "utf8")).has("emergency.js"), "SOURCE.md no publica el módulo nuevo");
  assert.ok(kernelModules(dir).includes("emergency.js"), "el inventario no ve el módulo nuevo");

  // El verificador de hosts: sin tocar KERNEL_FILES, tiene que comprobar también el módulo nuevo.
  const { home, opencodeSkills } = homeWithKit(kitDirectory);
  const canonical = {};
  for (const name of kernelModules(dir)) canonical[name] = bodyAfterHeader(readFileSync(join(dir, name)));
  const gitShow = (_root, args) => (args[0] === "rev-parse" ? KERNEL_BRANCH_HEAD : canonical[args[1].split(":src/")[1]]);
  const hosts = verifyHosts({ home, kitRoot: kitDirectory, canonicalKernelRoot: "sin-uso", gitShow });
  assert.ok(Object.keys(hosts.hosts[0].sourceMatches).includes("emergency.js"), `el verificador no vio emergency.js: ${JSON.stringify(hosts.hosts[0].sourceMatches)}`);
  assert.ok(hosts.hosts.every((host) => host.sourceMatches["emergency.js"] === true), `los tres hosts tienen que traer el módulo nuevo con los bytes del kernel: ${JSON.stringify(hosts.hosts.map((host) => [host.name, host.sourceMatches["emergency.js"]]))}`);
  assert.equal(hosts.ok, true, "los tres hosts deberían quedar verificados con el módulo nuevo incluido");
  assert.ok(existsSync(join(opencodeSkills, "vespi", "core", "kernel", "emergency.js")), "OpenCode no tiene el módulo nuevo en su copia instalada");
});

test("el verificador acusa el módulo nuevo cuando un host tiene otra cosa", () => {
  const repo = kernelRepo({ modules: { ...BASE_MODULES, "skill-provenance.js": Buffer.from("procedencia\n") } });
  const kitDirectory = kitRoot();
  vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: kitDirectory, published: "2026-10-05" });
  const { home, opencodeSkills } = homeWithKit(kitDirectory);
  put(join(opencodeSkills, "vespi", "core", "kernel", "skill-provenance.js"), "// no es el del kernel\n// b\n// c\nresto\n");
  const canonical = {};
  for (const name of kernelModules(kernelDirOf(kitDirectory))) canonical[name] = bodyAfterHeader(readFileSync(join(kernelDirOf(kitDirectory), name)));
  const gitShow = (_root, args) => (args[0] === "rev-parse" ? KERNEL_BRANCH_HEAD : canonical[args[1].split(":src/")[1]]);
  const hosts = verifyHosts({ home, kitRoot: kitDirectory, canonicalKernelRoot: "sin-uso", gitShow });
  assert.equal(hosts.ok, false);
  assert.equal(hosts.hosts[0].sourceMatches["skill-provenance.js"], false, "un módulo nuevo alterado en un host tiene que ser diferencia");
});

test("el instalador copia el módulo nuevo y su comparación de árbol lo ve, sin lista escrita a mano", () => {
  const repo = kernelRepo({ modules: { ...BASE_MODULES, "emergency.js": Buffer.from("parada\n") } });
  const kitDirectory = kitRoot();
  vendorKernel({ source: repo.root, ref: repo.ref, kitRoot: kitDirectory, published: "2026-10-05" });
  // Un paquete instalable mínimo, con el kernel recién vendorizado dentro.
  mkdirSync(join(kitDirectory, "hooks"), { recursive: true });
  put(join(kitDirectory, "hooks", "hooks.json"), '{"hooks":{}}');
  put(join(kitDirectory, "hooks", "opencode-plugin.js"), "export const LorePlugin = async () => ({})\n");
  put(join(kitDirectory, "hooks", "opencode-input.mjs"), "export const input = true;\n");
  put(join(kitDirectory, "hooks", "lore-guard.mjs"), "export const classifyWrite = () => 'own';\n");
  put(join(kitDirectory, "hooks", "lore-state.mjs"), "export const snapshot = () => ({ fileCount: 0 });\n");
  put(join(kitDirectory, "hooks", "lore-turno.mjs"), "export const marca = () => '[Lore Plugin]';\n");
  put(join(kitDirectory, ".codex-plugin", "plugin.json"), '{"name":"lore","version":"2.4.9"}\n');
  put(join(kitDirectory, "skills", "use-lore", "SKILL.md"), "---\nname: use-lore\n---\n");
  put(join(kitDirectory, "skills", "use-lore", "scripts", "acuerdo.mjs"), "export const acuerdo = {};\n");
  put(join(kitDirectory, "scripts", "lore-plugin.mjs"), "// cli\n");
  put(join(kitDirectory, "scripts", "lore-cli.mjs"), "// local entry\n");
  put(join(kitDirectory, "scripts", "hygiene.mjs"), "export const scanHygiene = () => ({ findings: [], coverage: [], notCovered: [] });\nexport const salidaHygiene = () => [];\n");
  put(join(kitDirectory, "scripts", "installer.mjs"), "// installer\n");

  const home = mkdtempSync(join(tmpdir(), "lore-home-install-"));
  temporary.push(home);
  installCodex({ home, packageRoot: kitDirectory });

  const source = join(kitDirectory, "skills", "vespi");
  const installed = join(home, ".agents", "plugins", "plugins", "lore", "skills", "vespi");
  assert.ok(existsSync(join(installed, "core", "kernel", "emergency.js")), "el instalador no copió el módulo nuevo");
  assert.equal(sameTree(source, installed), true, "el árbol instalado no coincide con el del paquete");
  put(join(installed, "core", "kernel", "emergency.js"), "// tocado en el host\n// b\n// c\nresto\n");
  assert.equal(sameTree(source, installed), false, "un módulo nuevo alterado en el host tiene que romper la comparación de árbol");
});

test("la lista del verificador y la del inventario son la misma, sin lista escrita a mano", () => {
  assert.deepEqual(KERNEL_FILES, kernelModules(kernelDirOf(kit)));
  // Y lo que hay hoy en el kit es lo que el verificador compara contra la fuente.
  assert.ok(KERNEL_FILES.length > 0, "el kit tiene que traer módulos vendorizados");
});

function treeDigest(root) {
  const hash = createHash("sha256");
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else { hash.update(path.slice(root.length)); hash.update(readFileSync(path)); }
    }
  };
  walk(root);
  return hash.digest("hex");
}

function runCli(args) {
  const sink = () => {};
  return main(args, { stdout: sink, stderr: sink });
}