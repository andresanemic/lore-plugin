import { join } from "node:path";

export function resolveSuite(benchRoot, name) {
  if (name != null && !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(name)) {
    throw new Error(`Suite inválida: "${name}"`);
  }
  return { root: name ? join(benchRoot, name) : benchRoot };
}
