import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function resolveKernelDir({ repoRoot, configured = null, exists = existsSync, release = false }) {
  const candidates = [
    ...(configured ? [configured.startsWith("file:") ? fileURLToPath(configured) : resolve(configured)] : []),
    resolve(repoRoot, "../../../founder/proyectos/vespi/kernel"),
    resolve(repoRoot, "../../../founder/proyectos/vespi/kernel-cdx"),
  ];
  const result = candidates.find((candidate) => exists(resolve(candidate, "docs", "METHOD.md")));
  if (!result && release) throw new Error("Vespi method provenance is required for release; set VESPI_KERNEL_DIR=... to the kernel root (path or file: URL). ");
  return result;
}

export function verifyMethodCopy(skill, kernelEnglish) {
  const normalize = (text) => text.replace(/\r\n/g, "\n").trimEnd();
  if (normalize(skill) !== normalize(kernelEnglish)) throw new Error("English method text differs between the skill and Vespi kernel");
  return true;
}
