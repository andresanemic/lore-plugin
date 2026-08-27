import { renameSync, writeFileSync } from "node:fs";

export function selectRuns(tasks, trials, wave = null) {
  if (wave != null && (!Number.isInteger(wave) || wave < 1 || wave > trials)) {
    throw new Error(`Wave inválida: ${wave}; debe estar entre 1 y ${trials}.`);
  }
  const selectedTrials = wave == null
    ? Array.from({ length: trials }, (_, index) => index + 1)
    : [wave];
  return selectedTrials.flatMap((trial) => tasks.flatMap((task, taskIndex) => {
    const loreFirst = (taskIndex + trial) % 2 === 0;
    const arms = loreFirst ? ["lore", "cold"] : ["cold", "lore"];
    return arms.map((arm) => ({ task, arm, trial }));
  }));
}

export function assertExposure(report) {
  const errors = [];
  if (report.cold?.lore_plugin !== false || report.cold?.text !== "LORE_UNAVAILABLE") {
    errors.push("cold expuso Lore Plugin");
  }
  if (report.lore?.lore_plugin !== true) errors.push("lore no expuso el plugin");
  if (report.lore?.version !== "2.3.2") errors.push("lore no cargó 2.3.2");
  if (report.lore?.read_lore !== true) errors.push("lore no leyó el skill instalado");
  if ((report.lore?.other_plugins ?? []).length) errors.push("lore expuso otros plugins");
  if (errors.length) throw new Error(`Preflight inválido: ${errors.join("; ")}.`);
  return report;
}

export function assertFrozenExecution({ execution, model, reasoningEffort, trials, preflight }) {
  assertExposure(preflight);
  if (model !== execution.model || reasoningEffort !== execution.reasoning_effort || trials !== execution.trials) {
    throw new Error(`Ejecución fuera del preregistro: ${model}/${reasoningEffort}/${trials}.`);
  }
  if (preflight.model !== model || preflight.reasoning_effort !== reasoningEffort) {
    throw new Error("El preflight no corresponde a esta configuración.");
  }
}

export function writeJsonAtomic(path, value) {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, path);
}
