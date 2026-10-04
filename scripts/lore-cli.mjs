// The local entry point: the executable MYCELIUM prose invokes by path.
//
// It exists because the prose orders a command that had exactly one resolution — the npm
// registry, where the package was not published. An instruction that names something the host
// does not have is not an instruction: it is a promise, and a promise writes no receipt.
//
// Why a separate entry instead of `lore-plugin.mjs`: that file carries the whole surface —
// install, statusline, crystallize — and `crystallize` shells out to
// `skills/transmute-lore/scripts/crystallize.mjs`, which does not travel in a short chain.
// Copying the whole entry and promising one part leaves an executable that advertises
// capabilities it lacks. This entry advertises exactly what it ships: MYCELIUM, the level
// knob a skill may also reach through the same launcher, and the read-only hygiene scan
// `save-to-lore` orders at the close of every pass. Everything else stays on the
// npm/marketplace path, where the full package is present — and what stays out is declared,
// with its reason, where the prosa is checked against it (`NO_VIAJA_EN_LA_ENTRADA_LOCAL`).
// The behaviour below is the installed `lore-plugin.mjs` behaviour, reduced to this subset.
// It is not a re-implementation: a receipt computed two ways would be a second truth.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateState, formatIntervention } from "../hooks/lore-guard.mjs";
import { claimAnnounce, readReceipt, snapshot, unnamedBodies, writeReceipt, RECEIPT } from "../hooks/lore-state.mjs";
import { DEFECTO_NIVEL, NIVELES, estado, estadoDir, marca } from "../hooks/lore-turno.mjs";
import { scanHygiene, salidaHygiene } from "./hygiene.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..", "..");

const args = process.argv.slice(2);
const command = args[0];
const tree = args.includes("--tree") ? resolve(args[args.indexOf("--tree") + 1]) : process.cwd();

function usage(stream = process.stderr) {
  stream.write([
    "Usage: lore-cli mycelium receipt   [--tree <dir>] [--accept-always-on]",
    "       lore-cli mycelium bodies    [--tree <dir>]",
    "       lore-cli mycelium federated [--tree <dir>]",
    "       lore-cli mycelium announce  [--tree <dir>]",
    "       lore-cli hygiene [ruta] [--json]",
    "       lore-cli nivel [off|lite|full]",
    "       lore-cli --help",
    "",
  ].join("\n"));
}

// Preguntar la guía sale con 0, también aquí: esta entrada es la misma CLI reducida, y la prosa
// la invoca por ruta. Un 2 donde solo se preguntaba delata a quien no conoce el 2.
if (command === undefined || args.includes("--help") || args.includes("-h")) {
  usage(process.stdout);
  process.exit(0);
}

// Records that the MYCELIUM sweep ran over this tree. The receipt is a fact derived from the
// content of the Lore, not a sentence about it.
if (command === "mycelium") {
  const sub = args[1];
  if (!["receipt", "bodies", "announce", "federated"].includes(sub)) {
    usage();
    process.exit(2);
  }

  // Is this tree's criterion actually loaded? Reports data, not a verdict: a body that is not
  // named is repaired either by naming it so it loads, or by declaring it out of the universe
  // in writing with its reason — and no directory walk knows which one applies.
  if (sub === "bodies") {
    const r = unnamedBodies(tree);
    if (!r.contract) {
      console.log(`No CLAUDE.md or AGENTS.md at ${tree} - nothing to compare the bodies against.`);
      process.exit(0);
    }
    const total = r.unnamed.length + r.unindexed.length;
    if (total === 0) {
      console.log(`${r.contract}: every core piece is named${r.hasBlock ? " in the always-on block" : ""}, and the index reaches every module.`);
    } else {
      for (const f of r.unnamed) console.log(`  not named by ${r.contract}: ${f}`);
      for (const f of r.unindexed) console.log(`  not named by lore/index.md: ${f}`);
      console.log("");
      console.log("Two repairs are possible and they are opposite: name it so it loads, or");
      console.log("declare it out of the universe in writing, with its reason. Decide each one.");
    }
    // Declared coverage: the line above is true and narrower than it reads. It says which
    // class of object was left out of the universe, and no verdict about it.
    console.log("");
    console.log("Coverage: this walked contract -> index -> module and nothing else. It did not");
    console.log("ask what step runs any clue, and validity boundaries were never in its universe.");
    console.log("");
    console.log("This scan does not close the sweep: closing needs the full MYCELIUM pass (every clue gets a step, a junction written or declined with its reason) and then `mycelium receipt`.");
    process.exit(0);
  }

  // Federated check: the always-on of a bot that federates sibling trees carries the triplete
  // rule. Reports data, not a verdict: in red it says the rule is missing and points at
  // transmute-lore UPGRADE. It does not demand literal bodies.
  if (sub === "federated") {
    const contract = ["CLAUDE.md", "AGENTS.md"].map((n) => join(tree, n)).find((p) => existsSync(p)) || null;
    if (!contract) {
      console.log(`No CLAUDE.md or AGENTS.md at ${tree} - nothing to check the federated load against.`);
      process.exit(0);
    }
    if (!existsSync(join(tree, "lore", "enrutamiento.md"))) {
      console.log(`No lore/enrutamiento.md at ${tree} - not a federated bot, nothing to check.`);
      process.exit(0);
    }
    const text = readFileSync(contract, "utf8");
    const block = (text.match(/<!-- lore:always-on -->([\s\S]*?)<!-- \/lore:always-on -->/) || [])[1] || "";
    const hasRule = /triplete/i.test(block) && /(hermano|no ancestro|no los inyecta|no lo inyecta)/i.test(block);
    if (hasRule) {
      console.log(`${contract}: federated load declares the triplete rule.`);
      console.log("This scan does not close the sweep: it checked one rule, not what step runs each clue. Closing needs the full MYCELIUM pass and then `mycelium receipt`.");
      process.exit(0);
    }
    console.log("  the always-on block does not declare the triplete rule for sibling trees");
    console.log("");
    console.log("Declare the rule or run transmute-lore UPGRADE.");
    console.log("This scan does not close the sweep: it checked one rule, not what step runs each clue. Closing needs the full MYCELIUM pass and then `mycelium receipt`.");
    process.exit(1);
  }

  // The Announce budget: claims one of the tree's three slots. It does not emit the announce
  // —that is the agent's prose— and it does not decide its content; it only says whether
  // budget is left, and declares its own coverage for the same reason `bodies` does.
  if (sub === "announce") {
    const claim = claimAnnounce(tree);
    if (claim.granted) {
      console.log(`Announce ${claim.used}/${claim.pool} claimed for ${tree}.`);
      console.log("This meters per tree. One per session is written in use-lore and nothing here checks it.");
      process.exit(0);
    }
    console.log(claim.reason === "exhausted"
      ? `Announce pool spent for ${tree} (${claim.used}/${claim.pool}). No budget left.`
      : `No ${RECEIPT} at ${tree} - no recorded sweep to meter an announce against.`);
    process.exit(1);
  }

  const current = snapshot(tree);
  if (current.fileCount === 0) {
    console.log(`No Lore files found under ${tree} - nothing to record.`);
    process.exit(1);
  }
  const guard = evaluateState(current, readReceipt(tree));
  if (guard.requiresApproval && !args.includes("--accept-always-on")) {
    console.log(formatIntervention({ ...guard, pendingLore: false }));
    process.exit(2);
  }
  const value = writeReceipt(tree, current);
  console.log(`MYCELIUM state recorded for ${current.fileCount} Lore file(s) in ${tree}`);
  console.log("This records the state of the tree; it does not certify that the sweep ran (every clue getting a step, a junction written or declined with its reason).");
  console.log(`${RECEIPT}: ${value.digest.slice(0, 12)}...`);
  process.exit(0);
}

// El escaneo de higiene de salida. `save-to-lore` lo ordena al cerrar cada pase y lo nombra
// `lore-plugin hygiene`, que es la entrada de la via npm: en un host donde esa via no resuelve,
// la orden no se puede correr donde se la pide (friccion 6, recibo de Desarrollo Web
// 2026-10-04). Aqui se ofrece la MISMA escaneo, delegando en `hygiene.mjs` y con la misma
// redaccion — no una copia: el escaneo y su salida son de solo lectura y no propongan nada
// que no fuera a proponer la otra entrada.
if (command === "hygiene") {
  const targetPath = args.slice(1).find((arg) => arg !== "--json") ?? process.cwd();
  for (const linea of salidaHygiene(scanHygiene(resolve(targetPath)), { json: args.includes("--json") })) {
    console.log(linea);
  }
  process.exit(0);
}

// The per-turn reminder knob. It lives outside the tree on purpose: the level belongs to the
// person, not the project, and has to hold in an area, in a bot and in a tree with no Lore.
if (command === "nivel") {
  const pedido = args[1];
  if (pedido === undefined || pedido === true) {
    console.log(`nivel: ${estado(estadoDir()).nivel} (${NIVELES.join(" | ")}; por defecto ${DEFECTO_NIVEL})`);
    process.exit(0);
  }
  const escrito = estado(estadoDir(), pedido);
  console.log(`nivel: ${escrito.nivel} — escrito en ${escrito.ruta}`);
  console.log(`marca en la linea de estado: ${marca(escrito.nivel) || "(ninguna: apagado)"}`);
  process.exit(0);
}

usage();
process.exit(2);