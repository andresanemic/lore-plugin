import assert from "node:assert/strict";
import test from "node:test";
import { readGitSource } from "./git-source.mjs";

test("git limita safe.directory a la ruta leída y vuelve reconocible el rechazo de propietario", () => {
  const root = "C:/external/vespi";
  let captured;
  const bytes = readGitSource({ root, commit: "abc1234", name: "authority.js", exec(command, args, options) {
    captured = { command, args, options };
    return Buffer.from("source");
  } });
  assert.equal(bytes.toString(), "source");
  assert.deepEqual(captured.args.slice(0, 3), ["-c", `safe.directory=${root}`, "show"]);
  assert.equal(captured.options.cwd, root);
  assert.throws(() => readGitSource({ root, commit: "abc1234", name: "authority.js", exec() {
    const error = new Error("git rejected");
    error.stderr = Buffer.from("fatal: detected dubious ownership");
    throw error;
  } }), /C:\/external\/vespi.*dubious ownership/i);
});
