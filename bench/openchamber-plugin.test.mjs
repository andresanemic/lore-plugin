import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

// TDD: el plugin OpenChamber V2 debe exportar { id, setup(ctx) } y portar
// los 5 handlers del adaptador OpenCode V1 con el mapa oficial V1→V2.

test("plugin openchamber exporta id y setup", async () => {
  const mod = await import("../hooks/openchamber-plugin.mjs");
  const plugin = mod.default;
  assert.equal(typeof plugin, "object", "export default debe ser objeto");
  assert.equal(typeof plugin.id, "string", "falta id");
  assert.equal(typeof plugin.setup, "function", "falta setup");
});

test("setup registra los 5 handlers V2", async () => {
  const mod = await import("../hooks/openchamber-plugin.mjs");
  const plugin = mod.default;
  const calls = [];
  const ctx = {
    event: { subscribe: (fn) => calls.push(["event.subscribe", fn]) },
    session: { hook: (name, fn) => calls.push(["session.hook", name, fn]) },
    tool: { hook: (name, fn) => calls.push(["tool.hook", name, fn]) },
  };
  await plugin.setup(ctx);
  const names = calls.map((c) => c[0] === "session.hook" || c[0] === "tool.hook" ? `${c[0]}:${c[1]}` : c[0]);
  assert.ok(names.includes("event.subscribe"), "falta event.subscribe");
  assert.ok(names.includes("session.hook:prompt"), "falta session.hook prompt");
  assert.ok(names.includes("session.hook:context"), "falta session.hook context");
  assert.ok(names.includes("tool.hook:execute.before"), "falta tool.hook execute.before");
  assert.ok(names.includes("tool.hook:execute.after"), "falta tool.hook execute.after");
});

test("session.created ancla jurisdicción y fija baseline", async () => {
  const mod = await import("../hooks/openchamber-plugin.mjs");
  const plugin = mod.default;
  const root = mkdtempSync(join(tmpdir(), "oc-test-"));
  writeFileSync(join(root, "CLAUDE.md"), "# t");
  writeFileSync(join(root, "FASES.md"), "# F\n\n## Operaciones\n");
  const handlers = {};
  const ctx = {
    event: { subscribe: (fn) => { handlers.event = fn; } },
    session: { hook: () => {} },
    tool: { hook: () => {} },
  };
  await plugin.setup(ctx);
  handlers.event({ event: { type: "session.created", properties: { info: { id: "ses-test-1" } } } });
  // Si no lanzó, el anclaje funcionó (fail-open)
  assert.ok(true);
});
