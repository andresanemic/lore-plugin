#!/usr/bin/env node
/**
 * CRYSTALLIZE pack / extract.
 * Ships with transmute-lore so a third person does not have to write an extractor.
 *
 *   node crystallize.mjs pack    --bot <dir> --out <snapshot.md>
 *   node crystallize.mjs extract --from <snapshot.md> --out <folder>
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TEXT_EXT = new Set([
  ".md", ".json", ".mjs", ".js", ".cjs", ".txt", ".yml", ".yaml",
  ".csv", ".log", ".ts", ".mts", ".cts",
]);
const NAMED_TEXT = new Set(["LICENSE", ".gitignore"]);
const SKIP_DIR = new Set([
  ".git", "node_modules", ".claude", "assets", "local", "backups",
  "notas", "notes", "cristalizaciones",
]);

const EXTRACT_OPEN =
  /<!-- lore:extract path="([^"]+)" owner="([^"]*)"(?: destino="([^"]*)")? -->\r?\n/;
const EXTRACT_CLOSE = "<!-- /lore:extract -->";

export function posix(p) {
  return String(p).split(/[\\/]/).join("/");
}

export function isSafeExtractPath(path) {
  if (!path || typeof path !== "string") return false;
  if (path.includes("..")) return false;
  if (path.startsWith("/") || path.startsWith("\\")) return false;
  if (/^[a-zA-Z]:/.test(path)) return false;
  return true;
}

function isTextFile(abs) {
  const name = abs.split(/[\\/]/).pop();
  const dot = name.lastIndexOf(".");
  const ext = dot === -1 ? "" : name.slice(dot).toLowerCase();
  return TEXT_EXT.has(ext) || NAMED_TEXT.has(name);
}

function skipRel(rel) {
  const parts = posix(rel).split("/");
  if (parts.some((p) => SKIP_DIR.has(p))) return true;
  if (/cristalizado/i.test(rel)) return true;
  if (/(^|\/)\.env(\.|$)/i.test(rel)) return true;
  if (/(^|\/)package-lock\.json$/.test(posix(rel))) return true;
  if (/(^|\/)pnpm-lock\.yaml$/.test(posix(rel))) return true;
  return false;
}

function walkFiles(absDir) {
  const out = [];
  if (!existsSync(absDir)) return out;
  const st = statSync(absDir);
  if (st.isFile()) return [absDir];
  for (const name of readdirSync(absDir)) {
    const p = join(absDir, name);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

function sha256(abs) {
  return createHash("sha256").update(readFileSync(abs)).digest("hex").toUpperCase();
}

function mkdirp(dir) {
  mkdirSync(dir, { recursive: true });
}

function copyTree(src, dest) {
  if (!existsSync(src)) return 0;
  const st = statSync(src);
  if (st.isFile()) {
    mkdirp(dirname(dest));
    copyFileSync(src, dest);
    return 1;
  }
  let n = 0;
  for (const name of readdirSync(src)) {
    n += copyTree(join(src, name), join(dest, name));
  }
  return n;
}

function attrEscape(s) {
  return String(s ?? "").replace(/"/g, "'");
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--") && i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
      out[a.slice(2)] = argv[++i];
    } else if (a.startsWith("--")) {
      out[a.slice(2)] = true;
    } else {
      out._.push(a);
    }
  }
  return out;
}

function botRelFrom(raiz, botDir) {
  const name = botDir.replace(/[\\/]+$/, "").split(/[\\/]/).pop();
  try {
    const rel = posix(relative(raiz, botDir));
    if (!rel || rel.startsWith("..")) return `bots/proyectos/${name}`;
    return rel;
  } catch {
    return `bots/proyectos/${name}`;
  }
}

function addFile(files, seen, abs, extractPath, owner, dest) {
  if (!existsSync(abs) || !statSync(abs).isFile()) return;
  if (!isTextFile(abs)) return;
  const path = posix(extractPath);
  if (!isSafeExtractPath(path)) return;
  if (skipRel(path)) return;
  if (seen.has(path)) return;
  seen.add(path);
  const body = readFileSync(abs, "utf8");
  files.push({
    path,
    owner: owner || "",
    dest: dest || "",
    abs,
    bytes: Buffer.byteLength(body, "utf8"),
    sha: sha256(abs),
    body,
  });
}

export function collect(botDir) {
  const ecoPath = join(botDir, "scripts", "ecosistema.json");
  if (!existsSync(ecoPath)) {
    throw new Error(`no scripts/ecosistema.json in ${botDir}`);
  }
  const eco = JSON.parse(readFileSync(ecoPath, "utf8"));
  const raiz = resolve(eco.raiz);
  const botName = botDir.replace(/[\\/]+$/, "").split(/[\\/]/).pop();
  const botRel = botRelFrom(raiz, botDir);
  const botOwner = botName;
  const files = [];
  const seen = new Set();

  const botItems = [
    "CLAUDE.md",
    "AGENTS.md",
    "FASES.md",
    "README.md",
    "lore",
    "canon",
    "scripts/ecosistema.json",
  ];
  for (const item of botItems) {
    const absItem = join(botDir, ...item.split("/"));
    if (!existsSync(absItem)) continue;
    if (statSync(absItem).isFile()) {
      addFile(files, seen, absItem, `${botRel}/${item}`, botOwner, "");
    } else {
      for (const f of walkFiles(absItem)) {
        const rel = posix(relative(botDir, f));
        addFile(files, seen, f, `${botRel}/${rel}`, botOwner, "");
      }
    }
  }

  const skillRoot = join(botDir, "skills");
  if (existsSync(skillRoot)) {
    for (const f of walkFiles(skillRoot)) {
      const rel = posix(relative(botDir, f));
      const keep =
        /SKILL\.md$/i.test(rel) ||
        /(^|\/)canon\//.test(rel);
      if (!keep) continue;
      addFile(files, seen, f, `${botRel}/${rel}`, botOwner, "");
    }
  }

  for (const row of eco.fuentes || []) {
    const incluir = row.incluir || ["lore", "CLAUDE.md", "AGENTS.md", "FASES.md"];
    const live = join(raiz, ...String(row.origen).split("/"));
    const copy = join(botDir, "lore-ecosistema", ...String(row.destino).split("/"));
    const base = existsSync(live) ? live : copy;
    const source = existsSync(live) ? "live" : existsSync(copy) ? "copy" : "missing";
    const owner = row.proyecto || row.destino || row.origen;
    if (source === "missing") continue;
    for (const item of incluir) {
      const absItem = join(base, ...String(item).split("/"));
      if (!existsSync(absItem)) continue;
      if (statSync(absItem).isFile()) {
        addFile(files, seen, absItem, `${row.origen}/${item}`, owner, row.destino || "");
      } else {
        for (const f of walkFiles(absItem)) {
          const rel = posix(relative(base, f));
          addFile(files, seen, f, `${row.origen}/${rel}`, owner, row.destino || "");
        }
      }
    }
  }

  files.sort((a, b) => a.path.localeCompare(b.path));
  return { eco, raiz, botName, botRel, files };
}

export function compose({ botName, botRel, files, generatedAt }) {
  const lines = [];
  const w = (s = "") => lines.push(s);
  w(`# ${botName} — lore-cristalizado`);
  w("");
  w("> **Copia de lectura generada. Puede quedar obsoleta.** Las fuentes vivas conservan la autoridad.");
  w("> No escribas criterio de vuelta en este archivo. Regenera desde el árbol vivo.");
  w("> Cada archivo va marcado con `<!-- lore:extract path=\"...\" owner=\"...\" -->` para extraerlo");
  w("> a una mini-raíz cuyo `enrutamiento.md` resuelve. El extractor viaja con `transmute-lore`.");
  w("");
  w(`- Generado: ${generatedAt}`);
  w(`- Bot: \`${botRel}\``);
  w(`- Archivos: ${files.length}`);
  w(`- Bytes: ${files.reduce((n, f) => n + f.bytes, 0)}`);
  w("");
  w("## Manifiesto");
  w("");
  for (const f of files) w(`- \`${f.path}\` · ${f.bytes} bytes · \`${f.sha.slice(0, 12)}\``);
  w("");
  w("## Cuerpos");
  w("");
  for (const owner of new Set(files.map((f) => f.owner))) {
    w(`## ${owner}`);
    w("");
    for (const f of files.filter((item) => item.owner === owner)) {
      const destAttr = f.dest ? ` destino="${attrEscape(f.dest)}"` : "";
      const body = f.body.endsWith("\n") ? f.body : `${f.body}\n`;
      w(`### \`${f.path}\``);
      w("");
      w(`<!-- lore:extract path="${attrEscape(f.path)}" owner="${attrEscape(f.owner)}"${destAttr} -->`);
      w(body.replace(/\n$/, ""));
      w(EXTRACT_CLOSE);
      w("");
    }
  }
  w("## Omisiones");
  w("");
  w("Quedan fuera por defecto: `notas/`, `notes/`, scripts que no sean `ecosistema.json`,");
  w("binarios, secretos, lockfiles, cristalizaciones anidadas, `node_modules/`, `.git`.");
  w("");
  w("## Regenerar / extraer");
  w("");
  w("```text");
  w("node skills/transmute-lore/scripts/crystallize.mjs pack --bot <bot-dir> --out <este-archivo>");
  w("node skills/transmute-lore/scripts/crystallize.mjs extract --from <este-archivo> --out <carpeta>");
  w("```");
  w("");
  return lines.join("\n");
}

export function parseExtractBlocks(text) {
  const blocks = [];
  const re = new RegExp(EXTRACT_OPEN.source + "([\\s\\S]*?)" + EXTRACT_CLOSE.replace("/", "\\/"), "g");
  let m;
  while ((m = re.exec(text))) {
    blocks.push({
      path: m[1],
      owner: m[2] || "",
      dest: m[3] || "",
      body: m[4].replace(/\r\n/g, "\n"),
    });
  }
  return blocks;
}

function isRoutePath(p) {
  if (!p) return false;
  if (p.startsWith("lore-ecosistema/")) return true;
  if (p.includes("/")) {
    if (/\.(js|mjs|json|md)$/.test(p) && !p.startsWith("lore/") && !p.includes("/lore/")) {
      if (p.startsWith("scripts/") || p.startsWith("canon/")) return false;
    }
    return true;
  }
  return /^(founder|community-manager|desarrollo-web|transferencia-tecnologica|investigacion-cientifica|divulgacion-cientifica|hackaton|plugins|bots)$/.test(p);
}

export function extractTo(mdText, outDir) {
  const blocks = parseExtractBlocks(mdText);
  if (!blocks.length) throw new Error("no extract markers in snapshot");
  const outAbs = resolve(outDir);
  mkdirp(outAbs);
  const written = [];
  for (const b of blocks) {
    if (!isSafeExtractPath(b.path)) {
      throw new Error(`unsafe extract path: ${b.path}`);
    }
    const dest = resolve(outAbs, ...b.path.split("/"));
    if (!dest.startsWith(outAbs)) throw new Error(`path escaped out dir: ${b.path}`);
    mkdirp(dirname(dest));
    const body = b.body.endsWith("\n") ? b.body : `${b.body}\n`;
    writeFileSync(dest, body, "utf8");
    written.push({ ...b, dest });
  }

  const raizPosix = posix(outAbs);
  const ecos = written.filter((w) => w.path.endsWith("scripts/ecosistema.json"));
  for (const e of ecos) {
    const eco = JSON.parse(readFileSync(e.dest, "utf8"));
    eco.raiz = raizPosix;
    writeFileSync(e.dest, `${JSON.stringify(eco, null, 2)}\n`, "utf8");
    if (eco.copia) {
      const botRel = posix(dirname(dirname(e.path)));
      for (const row of eco.fuentes || []) {
        const src = resolve(outAbs, ...String(row.origen).split("/"));
        const copyDest = resolve(
          outAbs,
          ...botRel.split("/"),
          "lore-ecosistema",
          ...String(row.destino).split("/"),
        );
        if (existsSync(src)) copyTree(src, copyDest);
      }
    }
  }

  const missing = [];
  const checked = [];
  for (const e of ecos) {
    const eco = JSON.parse(readFileSync(e.dest, "utf8"));
    for (const row of eco.fuentes || []) {
      const live = resolve(outAbs, ...String(row.origen).split("/"));
      checked.push(row.origen);
      if (!existsSync(live)) missing.push(row.origen);
    }
  }
  const enru = written.filter((w) => w.path.endsWith("lore/enrutamiento.md"));
  for (const e of enru) {
    const text = readFileSync(e.dest, "utf8");
    const botDir = dirname(dirname(e.dest));
    for (const m of text.matchAll(/`([^`]+)`/g)) {
      const p = m[1];
      if (!isRoutePath(p)) continue;
      const target = p.startsWith("lore-ecosistema/")
        ? resolve(botDir, ...p.split("/"))
        : resolve(outAbs, ...p.split("/"));
      checked.push(p);
      if (!existsSync(target)) missing.push(p);
    }
  }

  const leeme = [
    "# Mini-raíz extraída de una cristalización",
    "",
    "Esta carpeta espeja la `raiz` del manifiesto (`ecosistema.json`). No es el árbol vivo.",
    "",
    "- Abre el bot en `bots/proyectos/{slug}/`.",
    "- `scripts/ecosistema.json` ya apunta `raiz` a **esta** carpeta.",
    "- `lore/enrutamiento.md` se resuelve contra esa raíz (y, si `copia` estaba encendida, contra `lore-ecosistema/`).",
    "- No escribas criterio de vuelta acá: regenera desde las fuentes vivas.",
    "",
    `Archivos extraídos: ${written.length}`,
    `Punteros comprobados: ${checked.length}`,
    `Punteros rotos: ${missing.length}`,
    "",
  ];
  writeFileSync(join(outAbs, "LEEME.md"), leeme.join("\n"), "utf8");

  return { written, missing: [...new Set(missing)], checked: [...new Set(checked)], outAbs };
}

function usage() {
  console.log(`Usage:
  node crystallize.mjs pack    --bot <dir> --out <snapshot.md>
  node crystallize.mjs extract --from <snapshot.md> --out <folder>`);
}

function main(argv) {
  const args = parseArgs(argv);
  const verb = args._[0];
  if (verb === "pack") {
    if (!args.bot || !args.out) {
      usage();
      process.exit(2);
    }
    const botDir = resolve(args.bot);
    const collected = collect(botDir);
    const md = compose({
      ...collected,
      generatedAt: new Date().toISOString().slice(0, 10),
    });
    mkdirp(dirname(resolve(args.out)));
    writeFileSync(resolve(args.out), md, "utf8");
    const bytes = Buffer.byteLength(md, "utf8");
    console.log(JSON.stringify({
      ok: true,
      verb: "pack",
      bot: collected.botRel,
      files: collected.files.length,
      bytes,
      out: resolve(args.out),
    }, null, 2));
    return;
  }
  if (verb === "extract") {
    if (!args.from || !args.out) {
      usage();
      process.exit(2);
    }
    const md = readFileSync(resolve(args.from), "utf8");
    const result = extractTo(md, resolve(args.out));
    const payload = {
      ok: result.missing.length === 0,
      verb: "extract",
      files: result.written.length,
      checked: result.checked.length,
      missing: result.missing,
      out: result.outAbs,
    };
    console.log(JSON.stringify(payload, null, 2));
    if (result.missing.length) process.exit(1);
    return;
  }
  usage();
  process.exit(verb ? 2 : 0);
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main(process.argv.slice(2));
