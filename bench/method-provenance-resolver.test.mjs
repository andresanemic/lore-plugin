import assert from "node:assert/strict";
import test from "node:test";
import { resolveKernelDir, verifyMethodCopy } from "./method-provenance-resolver.mjs";

test("el resolver prioriza file URL y cae a los candidatos relativos correctos", () => {
  const seen = [];
  const result = resolveKernelDir({
    repoRoot: "C:/Claude/plugins/proyectos/lore-plugin-rc7",
    configured: "file:///C:/external/kernel",
    exists(path) { const normalized = path.replaceAll("\\", "/"); seen.push(normalized); return normalized === "C:/external/kernel/docs/METHOD.md"; },
  });
  assert.equal(result.replaceAll("\\", "/"), "C:/external/kernel");
  assert.equal(seen.length, 1);
  const fallback = resolveKernelDir({ repoRoot: "C:/Claude/plugins/proyectos/lore-plugin-rc7", exists: (path) => path.replaceAll("\\", "/").endsWith("kernel-cdx/docs/METHOD.md") });
  assert.equal(fallback.replaceAll("\\", "/"), "C:/Claude/founder/proyectos/vespi/kernel-cdx");
});

test("la comparación acepta copias iguales y rechaza copias distintas", () => {
  assert.equal(verifyMethodCopy("same\n", "same\r\n"), true);
  assert.throws(() => verifyMethodCopy("method A", "method B"), /English method text differs/);
});

test("el gate de liberación explica cómo resolver un kernel ausente", () => {
  assert.throws(() => resolveKernelDir({ repoRoot: "C:/kit", exists: () => false, release: true }), /VESPI_KERNEL_DIR=\.\.\./);
});
