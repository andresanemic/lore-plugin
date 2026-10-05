// Smoke input adapter for the scratchpad's .inicio/.fin pairs and matching prompts.
// Estimates use each prompt's declared time cap as the only available baseline.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { calibrateEstimates } from "../skills/vespi/core/coordinator.mjs";

const root = process.argv[2] ?? "C:/Users/andre/AppData/Local/Temp/claude/C--Claude-bots-proyectos-bot-lus-lore/cb64e85b-ef54-40fb-b1ef-58412e18e892/scratchpad/jobs";
const day = process.argv[3] ?? new Date().toISOString().slice(0, 10);
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
