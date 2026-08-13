import { existsSync, readFileSync } from "node:fs";

export function shouldRun(rawPath, retryNa) {
  if (!existsSync(rawPath)) return true;
  if (!retryNa) return true;

  return JSON.parse(readFileSync(rawPath, "utf8")).error === true;
}

export function isRateLimit(text) {
  return /you(?:'|’)ve hit your (?:session|weekly) limit/i.test(text);
}
