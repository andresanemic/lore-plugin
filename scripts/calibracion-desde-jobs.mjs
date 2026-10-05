// Smoke input adapter for the scratchpad's .inicio/.fin pairs and matching prompts.
// Estimates use each prompt's declared time cap as the only available baseline.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { calibrateEstimates } from "../skills/vespi/core/coordinator.mjs";

// La raiz de los trabajos llega por argumento o por LORE_JOBS_ROOT: una ruta fija en el
// arbol es la ruta de la maquina de quien lo escribio, y no debe viajar en el paquete.
const root = process.argv[2] ?? process.env.LORE_JOBS_ROOT;
const day = process.argv[3] ?? new Date().toISOString().slice(0, 10);
if (!root) {
  console.error("Falta la raiz de los trabajos: pasa el primer argumento o define LORE_JOBS_ROOT.");
  process.exit(2);
}
const files = await readdir(root);
const tasks = [];
for (const name of files.filter((file) => file.endsWith(".inicio"))) {
  const base = name.slice(0, -".inicio".length);
  if (!files.includes(`${base}.fin`)) continue;
  const [startText, finishText, prompt] = await Promise.all([
    readFile(join(root, `${base}.inicio`), "utf8"),
    readFile(join(root, `${base}.fin`), "utf8"),
    readFile(join(root, `prompt-${base}.txt`), "utf8").catch(() => ""),
  ]);
  const startedAt = startText.trim();
  const finishedAt = finishText.trim();
  if (!startedAt.startsWith(`${day}T`)) continue;
  const role = prompt.match(/ENCARGO\s+(DAIMON|ADVISOR|WORKER)\b/i)?.[1]?.toLowerCase();
  const minutes = prompt.match(/Tiempo máximo:\s*(\d+)\s*minutos/i)?.[1];
  if (!role || !minutes || !Number.isFinite(Date.parse(startedAt)) || !Number.isFinite(Date.parse(finishedAt))) continue;
  tasks.push({ role, estimateMs: Number(minutes) * 60_000, executor: { startedAt }, finishedAt });
}
process.stdout.write(`${JSON.stringify({ day, basis: "requested time cap from matching prompt; host/model not recorded", tasks: tasks.length, calibration: calibrateEstimates(tasks) }, null, 2)}\n`);
