# Closure audit

Audited on 2026-08-27 before README publication.

- Instrument boundary: `tasks.json` and all fixtures are unchanged from the frozen isolated-harness commit `d64f270`.
- Primary sample: 16 valid attempt-1 runs, eight per arm; all use `gpt-5.6-terra` with medium reasoning.
- Repairs: 10 valid attempt-2 runs, exactly one for each first-pass failure; no operational `n/a` result remains in the measured set.
- Exposure: cold read Lore in 0/14 measured executions; treatment read Lore in 12/12.
- Blind review: 128 first-pass and 80 repair criterion judgments were committed before their arm keys were opened. Packet SHA-256 values match both manifests and reveal keys.
- Reproduction: rerunning `node bench/effect-2.3.2/summary.mjs` leaves `results/summary.json` unchanged.
- Publication hygiene: the public benchmark contains no workspace-root or user-profile paths.

Two protocol amendments are preserved rather than hidden: GPT-5.6 Sol became the binary blind reviewer and the secondary preference comparison was removed; repairs use fresh isolated sessions because primary sessions were ephemeral. See [`protocol-amendments.md`](./protocol-amendments.md).

The comparison remains limited to this complete treatment, model, host, four synthetic tasks and two trials per arm. It does not isolate the plugin from the routed Lore or establish a universal effect.
