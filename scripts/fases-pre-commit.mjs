#!/usr/bin/env node
// Pre-commit de git: un commit que cambia el trabajo de un árbol con Lore no entra sin el FASES.md
// de ese árbol en el mismo commit. Es la mitad que obliga; la otra, `vigilante`, verifica desde afuera.
// Corre `plugins/lore/principios.md` §52 (una regla que depende de que alguien se acuerde no gobierna) y la pista «Lo que Andrés pide se escribe en FASES en el mismo turno» de `bot-lus-lore/lore/principios.md`.
//
// Va en git y no en un hook del host a propósito: corre igual desde Claude Code, Codex, OpenCode o
// una persona, y lo que muestra es la salida de `git commit`, no un mensaje del host que el agente
// narre (el defecto de 2.4.4 que cerró el hook `Stop`). Lo bloqueado vuelve a una persona con su
// razón y un paso nombrado.
//
// Salto: `LORE_FASES=skip git commit …`. Queda contado en `.lore-fases-saltos`, que el vigilante
// informa. `git commit --no-verify` salta todo git y el vigilante lo ve como FASES desfasadas.

import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { SALTOS, arbolDeArchivo } from "./vigilante.mjs";

const IGNORADO = /(^|[\\/])(\.git|node_modules|\.next|dist|out|tmp|\.job|\.superpowers)([\\/]|$)|(^|[\\/])\.(lore|bot)-[^\\/]*$/;
const esFases = (f) => /(^|[\\/])(FASES|PHASES)\.md$/i.test(f);

const salida = (...a) => execFileSync("git", ["-c", "core.quotepath=off", ...a], { encoding: "utf8" });

try {
  const top = salida("rev-parse", "--show-toplevel").trim();
  const preparados = salida("diff", "--cached", "--name-only", "--diff-filter=ACMRD").split("\n").filter(Boolean);
  if (preparados.length === 0) process.exit(0);

  const exigen = new Map(); // árbol -> archivos de trabajo preparados
  const fasesPreparadas = new Set();
  for (const f of preparados) {
    const abs = resolve(top, f);
    if (esFases(f)) {
      fasesPreparadas.add(abs.replace(/[\\/](FASES|PHASES)\.md$/i, ""));
      continue;
    }
    if (IGNORADO.test(f)) continue;
    const arbol = arbolDeArchivo(abs, top);
    if (!arbol) continue;
    exigen.set(arbol, [...(exigen.get(arbol) ?? []), f]);
  }
  const faltan = [...exigen].filter(([arbol]) => !fasesPreparadas.has(arbol));
  if (faltan.length === 0) process.exit(0);

  if (process.env.LORE_FASES === "skip") {
    appendFileSync(join(top, SALTOS), `${new Date().toISOString()} ${faltan.map(([a]) => a).join(",")}\n`);
    process.exit(0);
  }

  const out = ["Commit detenido: el estado del proyecto no sigue a este trabajo."];
  for (const [arbol, archivos] of faltan) {
    out.push(`  · ${arbol.replace(top, "").replace(/^[\\/]/, "") || "."}: cambian ${archivos.slice(0, 3).join(", ")}${archivos.length > 3 ? ` y ${archivos.length - 3} más` : ""} y FASES.md no va en el commit.`);
  }
  out.push("Siguiente paso: actualiza ese FASES.md (qué quedó hecho y qué sigue), agrégalo con `git add` y repite el commit.");
  out.push("Si de verdad no hay estado que registrar: LORE_FASES=skip git commit … (queda contado).");
  process.stderr.write(`${out.join("\n")}\n`);
  process.exit(1);
} catch {
  process.exit(0); // el techo de esta pieza es no romper un commit por un fallo propio
}
