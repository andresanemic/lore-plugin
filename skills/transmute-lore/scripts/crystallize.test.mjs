import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { collect, compose, extractTo, isSafeExtractPath, parseExtractBlocks, posix } from "./crystallize.mjs";

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
