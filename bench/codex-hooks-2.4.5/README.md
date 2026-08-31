# Codex hook probe for 2.4.5

Measured on 2026-08-31 with `codex-cli 0.147.0` and the isolated plugin under `marketplace/`.

## Result

`SessionEnd` runs after the final turn. Returning either a block decision or additional context did not change the exit code, prevent closure, or create another turn. It is useful for cleanup, not for enforcing a postcondition.

`PostToolUse` runs before the agent can close. Additional context was observed by the agent as `CODEX_HOOK_PROBE_INJECT`, and a block decision was reported by Codex as `CODEX_HOOK_PROBE_BLOCK`. It is the selected event for the 2.4.5 Codex adapter.

Because `PostToolUse` runs only after a tool, `SessionStart` establishes the receipt before the first tool can mutate the tree. Its captured payload contained only the structural keys `cwd`, `hook_event_name`, `model`, `permission_mode`, `session_id`, `source`, and `transcript_path`. The product adapter uses `SessionStart` for the baseline and `PostToolUse` for enforcement; it does not register the ineffective `SessionEnd` branch.

The product response uses additional context, not the visible block error. This lets Codex act before closing without showing hook protocol or internal vocabulary to the user.

## Fresh candidate session

The personal candidate installed and loaded as `lore@personal` 2.4.5 from the Codex cache. Codex announced the guide in one simple line; that remaining visibility is acceptable for this candidate and stays open for refinement through 2.4.6–2.5.

The fresh workspace was read-only, so the mutation itself did not execute. Codex ended by asking only for write permission in plain language, without exposing hook, skill, mode, receipt, or MYCELIUM internals. Automated tests and the latency probe cover the enforcement path; a writable fresh-host mutation remains a verification boundary, not a blocker for the 2.4.5 candidate.

## Healthy-path measurement

Twenty sequential ephemeral sessions each invoked `Get-Location` once. The probe produced exactly 20 `post_tool_use` records, wrote 0 bytes to stdout in observe mode, averaged 0.315 ms internally, and reached a maximum of 0.528 ms.

The JSONL record contains only the event, timestamp, working directory, sorted payload keys, and probe elapsed time. It excludes prompts, tool inputs, tool responses, file contents, and environment variables.

## Reproduction

1. Add `marketplace/` as a local Codex marketplace.
2. Install `lore-hook-probe@lore-hook-probe`.
3. Set per-event modes in `fixture/.lore-hook-probe-mode`.
4. Run `codex exec --ephemeral --json --dangerously-bypass-hook-trust -C <fixture> <prompt>`.
5. Inspect `fixture/.lore-hook-probe.jsonl` and remove the temporary plugin and marketplace.

The bypass flag was limited to the reviewed local probe. The product hook still uses the normal Codex trust policy.
