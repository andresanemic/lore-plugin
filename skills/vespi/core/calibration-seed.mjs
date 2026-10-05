import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DEFAULT_PATH = fileURLToPath(new URL("./calibration-seed.json", import.meta.url));
const KINDS = new Set(["review", "build", "fix", "write"]);

export function validateCalibrationSeed(value) {
  const header = value?.header;
  if (!header || typeof header.source !== "string" || !header.source.trim()
    || typeof header.observedOn !== "string" || !header.observedOn.trim()
    || typeof header.scope !== "string" || !header.scope.trim()
    || header.notAMeasurementOnYourMachine !== true || !Array.isArray(value.entries)) return false;
  const seen = new Set();
  return value.entries.every((entry) => {
    if (!entry || !KINDS.has(entry.kind) || seen.has(entry.kind)) return false;
    seen.add(entry.kind);
    return Number.isInteger(entry.samples) && entry.samples >= 3
      && [entry.medianMinutes, entry.p80Minutes, entry.minMinutes, entry.maxMinutes].every((n) => Number.isFinite(n) && n > 0)
      && entry.minMinutes <= entry.medianMinutes && entry.medianMinutes <= entry.p80Minutes
      && entry.p80Minutes <= entry.maxMinutes;
  });
}

export async function readCalibrationSeed(path = DEFAULT_PATH) {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    return validateCalibrationSeed(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
