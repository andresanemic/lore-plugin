import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hook = join(root, "hooks", "mycelium-guard.mjs");

const tmp = mkdtempSync(join(tmpdir(), "mycelium-guard-"));

// Run the hook with a given transcript (array of event objects) and stdin payload.
// Returns { stdout, status }.
function run(events, { stopHookActive = false, noPath = false } = {}) {
  const transcriptPath = join(tmp, `t-${Math.random().toString(36).slice(2)}.jsonl`);
  writeFileSync(transcriptPath, events.map((e) => JSON.stringify(e)).join("\n"));
  const stdin = JSON.stringify({
    transcript_path: noPath ? undefined : transcriptPath,
    stop_hook_active: stopHookActive,
  });
  try {
    const stdout = execFileSync("node", [hook], { input: stdin, encoding: "utf8" });
    return { stdout, status: 0 };
  } catch (err) {
    return { stdout: err.stdout ?? "", status: err.status ?? 1 };
  }
}

const assistant = (...blocks) => ({ type: "assistant", message: { role: "assistant", content: blocks } });
const edit = (file_path) => ({ type: "tool_use", name: "Edit", input: { file_path } });
const say = (text) => ({ type: "text", text });

test("bloquea cuando se editó Lore y no corrió MYCELIUM después", () => {
  const { stdout, status } = run([
    assistant(say("voy a guardar la pista"), edit("C:/proj/lore/produccion-decks.md")),
    assistant(say("listo, quedó indexado")),
  ]);
  assert.equal(status, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.decision, "block");
  assert.match(out.reason, /MYCELIUM/);
});

test("no bloquea si MYCELIUM corrió después de la última escritura de Lore", () => {
  const { stdout } = run([
    assistant(edit("C:/proj/lore/produccion-decks.md")),
    assistant(say("Corro MYCELIUM de salida sobre lo que se escribió: 0 hallazgos.")),
  ]);
  assert.equal(stdout.trim(), "");
});

test("no bloquea cuando no se editó ningún archivo de Lore", () => {
  const { stdout } = run([
    assistant(edit("C:/proj/src/index.js"), edit("C:/proj/README.md")),
    assistant(say("hecho")),
  ]);
  assert.equal(stdout.trim(), "");
});

test("reconoce FASES.md e index dentro de lore/ como escritura de Lore", () => {
  assert.equal(JSON.parse(run([assistant(edit("C:/a/FASES.md"))]).stdout).decision, "block");
  assert.equal(JSON.parse(run([assistant(edit("C:/a/lore/index.md"))]).stdout).decision, "block");
});

test("guarda anti-bucle: stop_hook_active corta en seco", () => {
  const { stdout } = run([assistant(edit("C:/proj/lore/x.md"))], { stopHookActive: true });
  assert.equal(stdout.trim(), "");
});

test("falla abierto sin transcript_path", () => {
  const { stdout, status } = run([], { noPath: true });
  assert.equal(status, 0);
  assert.equal(stdout.trim(), "");
});

test("una skill transmute-lore MYCELIUM posterior cuenta como barrido", () => {
  const { stdout } = run([
    assistant(edit("C:/proj/lore/x.md")),
    assistant({ type: "tool_use", name: "Skill", input: { skill: "lore:transmute-lore", args: "MYCELIUM mode over what this pass wrote" } }),
  ]);
  assert.equal(stdout.trim(), "");
});
