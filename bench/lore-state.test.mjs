import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { ANNOUNCE_POOL, RECEIPT, claimAnnounce, digest, readReceipt, snapshot, writeReceipt, writeSessionBaseline } from "../hooks/lore-state.mjs";

const OPEN = "<!-- lore:always-on -->";
const CLOSE = "<!-- /lore:always-on -->";
const roots = [];

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), "lore-state-"));
  roots.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  }
  return dir;
}

test.after(() => {
  for (const dir of roots) rmSync(dir, { recursive: true, force: true });
});

test("snapshot sums pointed criterion bodies once and excludes phase state", () => {
  const dir = tree({
    "CLAUDE.md": `${OPEN}\n- \`lore/identidad.md\`\n- \`lore/identidad.md\`\n- \`lore/principios.md\`\n- \`FASES.md\`\n${CLOSE}\n`,
    "lore/identidad.md": "# Id\r\n",
    "lore/principios.md": "# Principios\n",
    "FASES.md": "# Estado muy largo\n",
  });

  const state = snapshot(dir);
  assert.equal(state.alwaysOnBytes,
    Buffer.byteLength("# Id\n") + Buffer.byteLength("# Principios\n"));
  assert.equal(state.fileCount, 2);
  assert.match(state.digest, /^[0-9a-f]{64}$/);
});

test("snapshot prefers CLAUDE.md and ignores unresolved and non-criterion pointers", () => {
  const dir = tree({
    "CLAUDE.md": `${OPEN}\n- \`lore/uno.md\`\n- \`docs/otro.md\`\n- \`lore/falta.md\`\n${CLOSE}\n`,
    "AGENTS.md": `${OPEN}\n- \`lore/dos.md\`\n${CLOSE}\n`,
    "lore/uno.md": "uno\n",
    "lore/dos.md": "dos\n",
    "docs/otro.md": "otro\n",
  });

  assert.equal(snapshot(dir).alwaysOnBytes, Buffer.byteLength("uno\n"));
});

test("readReceipt preserves v1 without inventing a size", () => {
  const dir = tree({});
  writeFileSync(join(dir, RECEIPT), `${"a".repeat(64)}\n`);
  assert.deepEqual(readReceipt(dir), {
    version: 1,
    digest: "a".repeat(64),
    alwaysOnBytes: null,
  });
});

test("readReceipt accepts valid v2", () => {
  const dir = tree({});
  writeFileSync(join(dir, RECEIPT), JSON.stringify({
    version: 2,
    digest: "b".repeat(64),
    alwaysOnBytes: 28418,
  }));
  assert.deepEqual(readReceipt(dir), {
    version: 2,
    digest: "b".repeat(64),
    alwaysOnBytes: 28418,
  });
});

test("readReceipt rejects partial or invalid v2 JSON", () => {
  const dir = tree({});
  for (const value of [
    "{\"version\":2",
    JSON.stringify({ version: 2, digest: "x".repeat(64), alwaysOnBytes: 1 }),
    JSON.stringify({ version: 2, digest: "c".repeat(64), alwaysOnBytes: -1 }),
    JSON.stringify({ version: 3, digest: "c".repeat(64), alwaysOnBytes: 1 }),
  ]) {
    writeFileSync(join(dir, RECEIPT), value);
    assert.equal(readReceipt(dir), null);
  }
});

test("writeReceipt writes v2 atomically and returns the accepted state", () => {
  const dir = tree({
    "CLAUDE.md": `${OPEN}\n- \`lore/identidad.md\`\n${CLOSE}\n`,
    "lore/identidad.md": "# Id\n",
  });

  const receipt = writeReceipt(dir);
  assert.deepEqual(readReceipt(dir), receipt);
  assert.equal(receipt.version, 2);
  assert.equal(receipt.alwaysOnBytes, Buffer.byteLength("# Id\n"));
  assert.deepEqual(readdirSync(dir).filter((name) => name.includes(".tmp")), []);
  assert.equal(readFileSync(join(dir, RECEIPT), "utf8"), `${JSON.stringify(receipt)}\n`);
});

test("session baseline filenames use a SHA-2 digest for the session identifier", (t) => {
  const dir = tree({});
  const sessionDir = join(tmpdir(), "lore-plugin-sessions");
  const sessionId = `codeql-${process.pid}-${Date.now()}`;
  const expected = `${createHash("sha256").update(`${sessionId}\0${resolve(dir)}`).digest("hex")}.json`;
  t.after(() => rmSync(join(sessionDir, expected), { force: true }));

  writeSessionBaseline(sessionId, dir, {
    digest: "d".repeat(64),
    alwaysOnBytes: 0,
  });

  assert.equal(existsSync(join(sessionDir, expected)), true);
  assert.match(expected, /^[0-9a-f]{64}\.json$/);
});

test("session directory and baseline files have private Unix permissions", (t) => {
  if (process.platform === "win32") {
    t.skip("Windows ignora los bits mode de chmod y open");
    return;
  }
  const dir = tree({});
  const sessionId = `permissions-${process.pid}-${Date.now()}`;
  const key = createHash("sha256").update(`${sessionId}\0${resolve(dir)}`).digest("hex");
  const target = join(tmpdir(), "lore-plugin-sessions", `${key}.json`);
  t.after(() => rmSync(target, { force: true }));

  writeSessionBaseline(sessionId, dir, { digest: "e".repeat(64), alwaysOnBytes: 0 });

  assert.equal(statSync(join(tmpdir(), "lore-plugin-sessions")).mode & 0o777, 0o700);
  assert.equal(statSync(target).mode & 0o777, 0o600);
});

// --- ecualización del Anuncio (2.4.8, en trial) ------------------------------
//
// El pool existe para que la orientación no se vuelva ceremonia. Lo que se prueba
// acá es lo que el pool NO puede hacer tanto como lo que hace: no inventa un
// recibo, no sobrevive a su propio agotamiento, y el barrido no se lo borra.

const bare = () => tree({
  "CLAUDE.md": `${OPEN}\n- \`lore/identidad.md\`\n${CLOSE}\n`,
  "lore/identidad.md": "# Id\n",
});

function swept() {
  const dir = bare();
  writeReceipt(dir);
  return dir;
}

test("el pool se agota una vez por árbol y despues no queda presupuesto", () => {
  const dir = swept();
  for (let i = 1; i <= ANNOUNCE_POOL; i += 1) {
    const claim = claimAnnounce(dir);
    assert.equal(claim.granted, true, `franja ${i} deberia otorgarse`);
    assert.equal(claim.used, i);
  }
  const spent = claimAnnounce(dir);
  assert.equal(spent.granted, false);
  assert.equal(spent.reason, "exhausted");
  assert.equal(spent.used, ANNOUNCE_POOL);
});

test("sin recibo no se reclama: el Anuncio nunca escribe un digest que nadie aceptó", () => {
  const dir = bare();
  const claim = claimAnnounce(dir);
  assert.equal(claim.granted, false);
  assert.equal(claim.reason, "no-receipt");
  assert.equal(existsSync(join(dir, RECEIPT)), false, "no se fabrica evidencia de un barrido que no corrió");
});

test("el barrido no borra el pool: un recibo nuevo lo lleva adelante", () => {
  const dir = swept();
  claimAnnounce(dir);
  writeFileSync(join(dir, "lore", "identidad.md"), "# Id\n\nOtra cosa.\n");
  const receipt = writeReceipt(dir, snapshot(dir));
  assert.equal(receipt.announce.used, 1, "el pool sobrevive al barrido");
  assert.equal(readReceipt(dir).announce.used, 1);
  assert.equal(claimAnnounce(dir).used, 2, "sigue contando desde donde iba");
});

test("un recibo sin Anuncio no lleva la clave: ausente y cero no son el mismo hecho", () => {
  const dir = swept();
  assert.equal("announce" in writeReceipt(dir), false);
  assert.equal("announce" in readReceipt(dir), false);
});

test("exam: digest por contenido — tocar sin cambiar no mueve nada; cambiar sí", () => {
  const dir = tree({ "lore/criterio.md": "criterio\n" });
  const before = digest(dir);
  const file = join(dir, "lore", "criterio.md");
  const atime = new Date("2020-01-01T00:00:00Z");
  const mtime = new Date();
  utimesSync(file, atime, mtime);
  assert.equal(digest(dir), before);
  writeFileSync(file, "criterio cambiado\n");
  assert.notEqual(digest(dir), before);
});

test("exam: recibo inválido no se escribe — TypeError, no recibo corrupto", () => {
  const dir = tree({ "lore/criterio.md": "criterio\n" });
  for (const bad of [null, {}, { digest: "zzz", alwaysOnBytes: 0 }, { digest: "a".repeat(64), alwaysOnBytes: -1 }]) {
    assert.throws(() => writeReceipt(dir, bad), TypeError);
  }
  assert.equal(readReceipt(dir), null);
});

// H8: el nombre del temporal se derivaba de `process.pid`, así que un árbol hostil podía
// versionar un enlace o un hardlink para un rango de PID y la escritura pasaba por él. El
// temporal lleva ahora un nombre no predecible y se crea en exclusiva: si ese nombre ya
// existe, la escritura falla con EEXIST en vez de escribir encima de lo que hubiera.
const fuenteDeEstado = () => readFile(new URL("../hooks/lore-state.mjs", import.meta.url), "utf8");

test("H8: un temporal plantado no recibe la escritura y el recibo sigue intacto", async () => {
  const dir = tree({ "lore/principios.md": OPEN + "\nprincipios\n" + CLOSE + "\n" });
  const fuente = await fuenteDeEstado();
  assert.doesNotMatch(fuente, /process\.pid/, "el nombre del temporal no se deriva del PID");
  assert.match(fuente, /flag:\s*"wx"/, "el temporal se crea en exclusiva");

  // Nombres que un atacante podría adivinar antes de que el proceso arranque.
  const plantados = [`${RECEIPT}.${process.pid}.tmp`, `${RECEIPT}.${process.pid + 1}.tmp`, `${RECEIPT}.tmp`, `${RECEIPT}.0.tmp`];
  for (const nombre of plantados) writeFileSync(join(dir, nombre), `plantado: ${nombre}\n`);

  const recibo = writeReceipt(dir);
  assert.equal(recibo.version, 2, "la escritura del recibo sigue funcionando");
  for (const nombre of plantados) {
    assert.equal(readFileSync(join(dir, nombre), "utf8"), `plantado: ${nombre}\n`, `el temporal adivinado ${nombre} no se pisa`);
  }
  const sobrantes = readdirSync(dir).filter((name) => name.endsWith(".tmp") && !plantados.includes(name));
  assert.deepEqual(sobrantes, [], `quedan temporales del kit en el árbol: ${sobrantes.join(", ")}`);
  assert.equal(existsSync(join(dir, RECEIPT)), true, "el recibo se escribió");
});

test("H8b: el temporal se crea en exclusiva y no se queda en el árbol", async () => {
  // El nombre lleva `randomUUID()`, así que la colisión no se provoca desde fuera: lo que sí
  // es observable es que la escritura pide creación exclusiva y que ningún temporal sobrevive.
  const fuente = await fuenteDeEstado();
  const enExclusiva = [...fuente.matchAll(/flag:\s*"wx"/g)];
  assert.ok(enExclusiva.length >= 5, `temporales escritos en exclusiva: ${enExclusiva.length}`);
  assert.ok((fuente.match(/randomUUID\(\)\}\.tmp/g) ?? []).length >= 5, "los cinco temporales llevan nombre no predecible");
  const dir = tree({ "lore/principios.md": OPEN + "\nprincipios\n" + CLOSE + "\n" });
  for (let i = 0; i < 5; i++) {
    writeReceipt(dir);
    assert.deepEqual(readdirSync(dir).filter((name) => name.endsWith(".tmp")), [],
      "el temporal se renombra o se borra, nunca se queda");
  }
});

