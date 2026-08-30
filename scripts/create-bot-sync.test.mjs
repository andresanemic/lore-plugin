import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const template = join(import.meta.dirname, "..", "skills", "create-bot", "plantillas", "sync.js");

test("sync solo reescribe enrutamiento.md cuando cambia el manifiesto", (t) => {
  const root = mkdtempSync(join(tmpdir(), "lore-bot-sync-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const scripts = join(root, "scripts");
  mkdirSync(scripts, { recursive: true });
  copyFileSync(template, join(scripts, "sync.js"));
  writeFileSync(join(scripts, "ecosistema.json"), JSON.stringify({
    raiz: root,
    nota: "",
    copia: false,
    fuentes: [],
  }));

  execFileSync(process.execPath, [join(scripts, "sync.js")]);
  const routing = join(root, "lore", "enrutamiento.md");
  const oldDate = new Date("2000-01-01T00:00:00Z");
  const before = readFileSync(routing, "utf8").replace(
    /> Última generación: .*\./,
    "> Última generación: 2000-01-01 00:00.",
  );
  writeFileSync(routing, before);
  utimesSync(routing, oldDate, oldDate);

  execFileSync(process.execPath, [join(scripts, "sync.js")]);

  assert.equal(readFileSync(routing, "utf8"), before);
  assert.equal(statSync(routing).mtimeMs, oldDate.getTime());

  writeFileSync(join(scripts, "ecosistema.json"), JSON.stringify({
    raiz: root,
    nota: "Cambio real.",
    copia: false,
    fuentes: [],
  }));
  execFileSync(process.execPath, [join(scripts, "sync.js")]);

  assert.match(readFileSync(routing, "utf8"), /Cambio real\./);
  assert.ok(statSync(routing).mtimeMs > oldDate.getTime());
});
