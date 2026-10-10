import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolveKernelDir, verifyMethodCopy } from "./method-provenance-resolver.mjs";

test("el resolver prioriza file URL y cae a los candidatos relativos correctos", (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "method-provenance-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const repoRoot = join(fixture, "plugins", "proyectos", "lore-plugin-rc7");
  const external = join(fixture, "external", "kernel");
  mkdirSync(join(external, "docs"), { recursive: true });
  writeFileSync(join(external, "docs", "METHOD.md"), "method\n");
  const result = resolveKernelDir({ repoRoot, configured: pathToFileURL(external).href });
  assert.equal(resolve(result), resolve(external));

  const fallback = join(fixture, "founder", "proyectos", "vespi", "kernel-cdx");
  mkdirSync(join(fallback, "docs"), { recursive: true });
  writeFileSync(join(fallback, "docs", "METHOD.md"), "method\n");
  assert.equal(resolve(resolveKernelDir({ repoRoot })), resolve(fallback));
});

test("la comparación acepta copias iguales y rechaza copias distintas", () => {
  assert.equal(verifyMethodCopy("same\n", "same\r\n"), true);
  assert.throws(() => verifyMethodCopy("method A", "method B"), /English method text differs/);
});

test("el gate de liberación explica cómo resolver un kernel ausente", () => {
  assert.throws(() => resolveKernelDir({ repoRoot: "C:/kit", exists: () => false, release: true }), /VESPI_KERNEL_DIR=\.\.\./);
});
