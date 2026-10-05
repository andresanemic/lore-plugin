import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const S = "../skills/vespi/core/operation-state.mjs";

test("operation state: a new session reloads the durable block in FASES.md", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "vespi-operation-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const { createArtifact, transitionArtifact, saveOperationState, loadOperationState } = await import(S);
  let artifact = createArtifact({ goal: "review a candidate", owner: "coordinator" });
  artifact = transitionArtifact(artifact, { state: "authorized", note: "scope checked" });
  artifact = transitionArtifact(artifact, { state: "blocked", note: "provider unavailable" });
  await saveOperationState(root, artifact);

  const contents = await readFile(join(root, "FASES.md"), "utf8");
  const restored = await loadOperationState(root, artifact.id);
  assert.match(contents, /provider unavailable/);
  assert.deepEqual(restored, artifact);
});

test("operation state: transitions append checkpoints and reject illegal transitions", async () => {
  const { createArtifact, transitionArtifact } = await import(S);
  const artifact = createArtifact({ goal: "g", owner: "coordinator" });
  const authorized = transitionArtifact(artifact, { state: "authorized", note: "grant checked" });
  assert.equal(authorized.state, "authorized");
  assert.equal(authorized.checkpoints.length, 2);
  assert.throws(() => transitionArtifact(artifact, { state: "closed", note: "done" }), /verified/);
});

test("operation state: closure requires an observed independent verification", async () => {
  const { createArtifact, transitionArtifact } = await import(S);
  const artifact = createArtifact({ goal: "g", owner: "coordinator" });
  const verified = { ...artifact, state: "verified", verification: { verified: true, reason: "independent check" } };
  const closed = transitionArtifact(verified, { state: "closed", note: "verified output delivered" });
  assert.equal(closed.state, "closed");
  assert.throws(
    () => transitionArtifact({ ...artifact, state: "verified", verification: { verified: false } }, { state: "closed", note: "done" }),
    /verified/,
  );
});

test("operation state: stale premises block resume but fresh blocked work can resume", async () => {
  const { createArtifact, resumeArtifact } = await import(S);
  const artifact = createArtifact({ goal: "g", owner: "coordinator" });
  const blocked = { ...artifact, state: "blocked", freshness: [{ subject: "provider", result: "fresh" }] };
  assert.deepEqual(resumeArtifact(blocked), { allowed: true, reason: "fresh" });
  assert.deepEqual(
    resumeArtifact({ ...blocked, freshness: [{ subject: "grant", result: "stale" }] }),
    { allowed: false, reason: "stale_premise" },
  );
});

test("operation state: invalid identifiers cannot escape the operations directory", async () => {
  const { loadOperationState } = await import(S);
  await assert.rejects(() => loadOperationState(tmpdir(), "../outside"), /invalid operation id/);
});
