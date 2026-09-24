import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { collect, compose, extractTo, isSafeExtractPath, parseExtractBlocks, posix, verifySnapshot } from "./crystallize.mjs";

const require = createRequire(import.meta.url);

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "lore-crystallize-"));
  const area = join(root, "founder");
  const project = join(area, "proyectos", "Demo");
  const bot = join(root, "bots", "proyectos", "bot-demo");
  mkdirSync(join(area, "lore"), { recursive: true });
  mkdirSync(join(project, "lore"), { recursive: true });
  mkdirSync(join(bot, "lore"), { recursive: true });
  mkdirSync(join(bot, "canon"), { recursive: true });
  mkdirSync(join(bot, "scripts"), { recursive: true });
  writeFileSync(join(area, "CLAUDE.md"), "# Área founder\n", "utf8");
  writeFileSync(join(area, "FASES.md"), "# FASES área\n", "utf8");
  writeFileSync(join(area, "lore", "principios.md"), "# Principios del área\nNunca cruzar cuerpos.\n", "utf8");
  writeFileSync(join(project, "CLAUDE.md"), "# Demo producto\n", "utf8");
  writeFileSync(join(project, "FASES.md"), "# FASES demo\n", "utf8");
  writeFileSync(join(project, "package.json"), '{"version":"2.2.0"}\n', "utf8");
  writeFileSync(join(project, "lore", "identidad.md"), "# Identidad demo\nSomos el producto.\n", "utf8");
  writeFileSync(join(bot, "CLAUDE.md"), "# Bot demo\nCargar canon y enrutar.\n", "utf8");
  writeFileSync(join(bot, "FASES.md"), "# FASES bot\n", "utf8");
  writeFileSync(join(bot, "canon", "frontera.md"), "# Frontera\n", "utf8");
  writeFileSync(join(bot, "lore", "enrutamiento.md"), [
    "# Enrutamiento",
    "",
    "| Proyecto | Dónde vive su Lore |",
    "|---|---|",
    "| Demo | `founder/proyectos/Demo` |",
    "| — (área) | `founder` |",
    "",
  ].join("\n"), "utf8");
  writeFileSync(join(bot, "scripts", "ecosistema.json"), `${JSON.stringify({
    raiz: posix(root),
    copia: false,
    fuentes: [
      {
        destino: "producto",
        origen: "founder/proyectos/Demo",
        incluir: ["lore", "CLAUDE.md", "FASES.md", "package.json"],
        proyecto: "Demo",
        tipo: "producto",
        cuando: "producto",
      },
      {
        destino: "areas/founder",
        origen: "founder",
        incluir: ["lore", "CLAUDE.md", "FASES.md"],
        proyecto: "— (área)",
        tipo: "producto",
        cuando: "método",
      },
    ],
  }, null, 2)}\n`, "utf8");
  return { root, bot };
}

test("rechaza rutas de extracción inseguras", () => {
  assert.equal(isSafeExtractPath("founder/lore/identidad.md"), true);
  assert.equal(isSafeExtractPath("../etc/passwd"), false);
  assert.equal(isSafeExtractPath("C:/Claude/x.md"), false);
  assert.equal(isSafeExtractPath("/tmp/x.md"), false);
});

test("pack + extract reconstruye el enrutamiento de un bot federado", () => {
  const { root, bot } = fixture();
  const collected = collect(bot);
  const paths = collected.files.map((f) => f.path);
  assert.ok(paths.includes("bots/proyectos/bot-demo/CLAUDE.md"));
  assert.ok(paths.includes("bots/proyectos/bot-demo/canon/frontera.md"));
  assert.ok(paths.includes("bots/proyectos/bot-demo/scripts/ecosistema.json"));
  assert.ok(paths.includes("founder/lore/principios.md"));
  assert.ok(paths.includes("founder/proyectos/Demo/lore/identidad.md"));
  assert.ok(paths.includes("founder/proyectos/Demo/package.json"));
  assert.ok(!paths.some((p) => p.includes("notas")));

  const md = compose({ ...collected, generatedAt: "2026-08-18" });
  assert.doesNotMatch(md, /\| # \| Dueño \| Ruta \|/);
  assert.equal((md.match(/^## Demo$/gm) || []).length, 1);
  assert.match(md, /- `founder\/proyectos\/Demo\/lore\/identidad\.md` · \d+ bytes · `[0-9A-F]{12}`/);
  assert.match(md, /<!-- lore:extract path="founder\/lore\/principios.md"/);
  assert.match(md, /<!-- \/lore:extract -->/);
  const blocks = parseExtractBlocks(md);
  assert.equal(blocks.length, collected.files.length);

  const out = join(root, "extraido");
  const result = extractTo(md, out);
  assert.deepEqual(result.missing, []);
  assert.equal(existsSync(join(out, "founder", "lore", "principios.md")), true);
  assert.equal(existsSync(join(out, "founder", "proyectos", "Demo", "lore", "identidad.md")), true);
  assert.equal(existsSync(join(out, "bots", "proyectos", "bot-demo", "lore", "enrutamiento.md")), true);
  const eco = JSON.parse(readFileSync(join(out, "bots", "proyectos", "bot-demo", "scripts", "ecosistema.json"), "utf8"));
  assert.equal(posix(eco.raiz), posix(out));
  assert.match(readFileSync(join(out, "founder", "lore", "principios.md"), "utf8"), /Nunca cruzar cuerpos/);
});

test("pack + extract conserva un marcador de cierre literal dentro del cuerpo", () => {
  const { root, bot } = fixture();
  const body = "# Formato\n\n```markdown\n<!-- /lore:extract -->\n```\n\nDespués del ejemplo.\n";
  writeFileSync(join(bot, "lore", "formato.md"), body, "utf8");

  const md = compose({ ...collect(bot), generatedAt: "2026-09-12" });
  const block = parseExtractBlocks(md).find((item) => item.path.endsWith("lore/formato.md"));
  assert.equal(block?.body, body);

  const out = join(root, "extraido-con-marcador");
  extractTo(md, out);
  assert.equal(
    readFileSync(join(out, "bots", "proyectos", "bot-demo", "lore", "formato.md"), "utf8"),
    body,
  );
});

test("extract no interpreta referencias lore relativas como rutas de la raíz", () => {
  const { root, bot } = fixture();
  const routing = join(bot, "lore", "enrutamiento.md");
  writeFileSync(
    routing,
    `${readFileSync(routing, "utf8")}Cada árbol abre \`lore/\`, \`lore/index.md\` y, cuando corresponda, \`lore/mecanica.md\`.\n`,
    "utf8",
  );

  const md = compose({ ...collect(bot), generatedAt: "2026-09-12" });
  const result = extractTo(md, join(root, "extraido-con-rutas-relativas"));
  assert.deepEqual(result.missing, []);
});

test("pack omite archivos sensibles y aborta ante marcadores de secreto", () => {
  const { bot } = fixture();
  writeFileSync(join(bot, "canon", "credentials.json"), '{"api_key":"secret"}\n', "utf8");
  let collected = collect(bot);
  assert.ok(!collected.files.some((f) => f.path.endsWith("credentials.json")));

  writeFileSync(
    join(bot, "canon", "operacion.md"),
    "# Operación\nOPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456\n",
    "utf8",
  );
  assert.throws(() => collect(bot), /possible secret.*operacion\.md/i);
});

test("pack omite *.test.* — código de prueba, no criterio — aunque lleve fixtures de secreto", () => {
  const { bot } = fixture();
  writeFileSync(
    join(bot, "lore", "helper.test.mjs"),
    'const fake = "OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456";\nexport { fake };\n',
    "utf8",
  );
  const collected = collect(bot);
  assert.ok(!collected.files.some((f) => f.path.endsWith("helper.test.mjs")));
});

// CRYSTALLIZE 2.0 — validity-aware, provenance-aware, explicit holes, readback verify.

test("2.0: filas sin fuente viva ni copia se registran como huecos explícitos", () => {
  const { root, bot } = fixture();
  const ecoPath = join(bot, "scripts", "ecosistema.json");
  const eco = JSON.parse(readFileSync(ecoPath, "utf8"));
  eco.fuentes.push({ destino: "fantasma", origen: "ausente/del-todo", incluir: ["lore"], proyecto: "Fantasma" });
  writeFileSync(ecoPath, `${JSON.stringify(eco, null, 2)}\n`, "utf8");
  const collected = collect(bot);
  assert.ok(collected.holes.some((h) => h.origen === "ausente/del-todo"), "el hueco debe existir");
  assert.match(collected.holes[0].reason ?? "", /missing|ausente|sin fuente/i);
  const md = compose({ ...collected, generatedAt: "2026-09-24" });
  assert.match(md, /## Huecos expl.citos/);
  assert.match(md, /ausente\/del-todo/);
});

test("2.0: cada extract lleva provenance (source, as_of) y validity", () => {
  const { bot } = fixture();
  const collected = collect(bot);
  const md = compose({ ...collected, generatedAt: "2026-09-24" });
  assert.match(md, /<!-- lore:extract path="[^"]+" owner="[^"]*" source="(live|copy)" as_of="2026-09-24"/);
  const blocks = parseExtractBlocks(md);
  const fases = blocks.find((b) => b.path.endsWith("FASES.md"));
  assert.equal(fases?.validity, "mixed");
  const lore = blocks.find((b) => b.path.endsWith("lore/principios.md"));
  assert.equal(lore?.validity, "current");
  assert.equal(lore?.source, "live");
  assert.match(lore?.as_of ?? "", /^\d{4}-\d{2}-\d{2}$/);
});

test("2.0: verify compara el snapshot contra el árbol vivo", () => {
  const { root, bot } = fixture();
  const collected = collect(bot);
  const md = compose({ ...collected, generatedAt: "2026-09-24" });
  const v = verifySnapshot(md, bot);
  assert.equal(v.drift.length, 0);
  assert.equal(v.missing.length, 0);
  assert.ok(v.matched > 0);
  // Deriva real: cambia un vivo y el verify lo detecta.
  writeFileSync(join(bot, "canon", "frontera.md"), "# Frontera\nCambio posterior.\n", "utf8");
  const v2 = verifySnapshot(md, bot);
  assert.ok(v2.drift.some((d) => d.path.endsWith("canon/frontera.md")));
});

test("exam: extract rechaza path que escapa y reporta punteros rotos", () => {
  const { root, bot } = fixture();
  const collected = collect(bot);
  let md = compose({ ...collected, generatedAt: "2026-09-24" });
  // Snapshot hostil: un bloque con path de escape.
  md += '\n### `evil`\n\n<!-- lore:extract path="../evil.md" owner="x" -->\nmal\n<!-- /lore:extract -->\n';
  assert.throws(() => extractTo(md, join(root, "hostil")), /unsafe|escaped/);
});

test("exam: extract con copia reconstruye lore-ecosistema y no deja rotos", () => {
  const { root, bot } = fixture();
  const ecoPath = join(bot, "scripts", "ecosistema.json");
  const eco = JSON.parse(readFileSync(ecoPath, "utf8"));
  eco.copia = true;
  writeFileSync(ecoPath, `${JSON.stringify(eco, null, 2)}\n`, "utf8");
  const md = compose({ ...collect(bot), generatedAt: "2026-09-24" });
  const out = join(root, "extraido-copia");
  const result = extractTo(md, out);
  assert.deepEqual(result.missing, []);
  assert.equal(existsSync(join(out, "bots", "proyectos", "bot-demo", "lore-ecosistema", "producto", "lore", "identidad.md")), true);
});

test("2.0: CLI verify sale 0 en snapshot fiel y 1 con deriva", () => {
  const { execFileSync } = require("node:child_process");
  const script = join(process.cwd(), "skills", "transmute-lore", "scripts", "crystallize.mjs");
  const { root, bot } = fixture();
  const snap = join(root, "snap.md");
  const run = (args) => {
    try {
      const out = execFileSync(process.execPath, [script, ...args], { encoding: "utf8" });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status, out: String(e.stdout ?? "") };
    }
  };
  run(["pack", "--bot", bot, "--out", snap]);
  const clean = run(["verify", "--from", snap, "--bot", bot]);
  assert.equal(clean.code, 0);
  assert.match(clean.out, /"drift": \[\]/);
  writeFileSync(join(bot, "canon", "frontera.md"), "# Frontera\nCambio posterior.\n", "utf8");
  const dirty = run(["verify", "--from", snap, "--bot", bot]);
  assert.equal(dirty.code, 1);
  assert.match(dirty.out, /canon\/frontera\.md/);
});

test("2.0: snapshot pre-2.0 (sin attrs) sigue parseando y verificando", () => {
  const { bot } = fixture();
  const collected = collect(bot);
  let md = compose({ ...collected, generatedAt: "2026-09-24" });
  // Degrada a formato 1.0: quita los attrs nuevos de cada marcador.
  md = md.replaceAll(/ source="(live|copy)" as_of="[^"]*" validity="(current|mixed|history)"/g, "");
  const blocks = parseExtractBlocks(md);
  assert.equal(blocks.length, collected.files.length);
  assert.equal(blocks[0].source, "unknown");
  const v = verifySnapshot(md, bot);
  assert.equal(v.drift.length, 0);
  assert.ok(v.matched > 0);
});

test("2.0: pack en bot sin ecosistema.json falla con razón", () => {

  const { execFileSync } = require("node:child_process");
  const script = join(process.cwd(), "skills", "transmute-lore", "scripts", "crystallize.mjs");
  const { root } = fixture();
  const empty = join(root, "vacio");
  mkdirSync(empty, { recursive: true });
  let code = -1;
  try {
    execFileSync(process.execPath, [script, "pack", "--bot", empty, "--out", join(root, "x.md")], { encoding: "utf8" });
  } catch (e) {
    code = e.status;
  }
  assert.notEqual(code, 0);
});

test("2.0: verify no reporta deriva falsa en archivos CRLF", () => {
  const { root, bot } = fixture();
  const crlf = "# Principios\r\n\r\nLínea dos.\r\n";
  writeFileSync(join(bot, "lore", "principios-crlf.md"), crlf, "utf8");
  const collected = collect(bot);
  assert.ok(collected.files.some((f) => f.path.endsWith("lore/principios-crlf.md")));
  const md = compose({ ...collected, generatedAt: "2026-09-24" });
  const v = verifySnapshot(md, bot);
  assert.ok(!v.drift.some((d) => d.path.endsWith("lore/principios-crlf.md")), "CRLF vivo = snapshot: matched, no drift");
  assert.ok(v.matched > 0);
});

test("exam: verify acepta vivo sin salto final (el snapshot siempre lo trae)", () => {
  const { root, bot } = fixture();
  writeFileSync(join(bot, "lore", "sintesis.md"), "# Síntesis sin newline final", "utf8");
  const md = compose({ ...collect(bot), generatedAt: "2026-09-24" });
  const v = verifySnapshot(md, bot);
  assert.ok(!v.drift.some((d) => d.path.endsWith("lore/sintesis.md")));
});
