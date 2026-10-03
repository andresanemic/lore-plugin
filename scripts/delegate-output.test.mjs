import assert from "node:assert/strict";
import test from "node:test";
import { classifyDelegateOutput } from "../skills/vespi/core/host-resources.mjs";

test("la salida del delegado solo cuenta como entrega con todos los artefactos y sin causa conocida", () => {
  const known = [
    ["An active OpenCode Go subscription is required", "suscripcion-opencode-go"],
    ["Upstream request failed", "proveedor-gratuito"],
    ["database is locked", "base-opencode-bloqueada"],
    ["permission requested; auto-rejecting", "permiso-rechazado"],
    ["The user rejected permission", "permiso-rechazado"],
    ["File not found", "adjunto-no-encontrado"],
    ["cannot write C:/work/file.md: EPERM access is denied", "sandbox-escritura-codex"],
  ];
  for (const [text, cause] of known) {
    const result = classifyDelegateOutput({ exitCode: 0, text, expectedArtifacts: ["out.md"], artifactsPresent: ["out.md"] });
    assert.equal(result.delivered, false);
    assert.equal(result.cause, cause);
    assert.ok(result.nextStep);
  }
  assert.deepEqual(classifyDelegateOutput({ exitCode: 0 }), {
    delivered: false,
    cause: "sin-entrega",
    nextStep: "comprueba el artefacto; no cuentes la salida 0 como entrega",
  });
  assert.equal(classifyDelegateOutput({ exitCode: 0, expectedArtifacts: ["out.md"], artifactsPresent: ["out.md"] }).delivered, true);
  assert.equal(classifyDelegateOutput({ exitCode: 2, text: "Upstream request failed", expectedArtifacts: ["out.md"], artifactsPresent: ["out.md"] }).delivered, false);
  assert.equal(classifyDelegateOutput({ exitCode: 0, text: { __proto__: "x" }, expectedArtifacts: ["x"], artifactsPresent: ["x"] }).delivered, true);
  assert.equal(classifyDelegateOutput({ exitCode: 0, text: "x".repeat(1_000_000) }).delivered, false);
});
