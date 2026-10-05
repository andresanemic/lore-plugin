# Vespi kernel copy provenance

Fixed copy of Vespi kernel **0.1.4**, a candidate cut with publication date pending, in Lore Plugin 2.4.9. Canonical source: `founder/proyectos/vespi/kernel/src/`, branch `release/0.1.4-prep`, commit `03f78db3911089151288851260f5253c0dc988c6`.

The vendored modules are `authority.js`, `continuity.js`, `delegation.js`, `emergency.js`, `operation.js`, `receipt.js`, `skill-provenance.js`, `time.js`, `x402.js` and `zk.js`. `zk-bn254-reference.js`, an experimental cryptographic reference, is NOT vendored.

Each module carries a three-line provenance header followed by the exact committed source bytes. The table below does not verify itself: `bench/vespi-kernel-provenance.test.mjs` compares each body with the pinned Git source.

| Module | SHA-256 of source bytes | Bytes |
|---|---|---|
| `authority.js` | `fcf7952489d6f9c42616b52f54832524926d2f2ba6c0ea6514480a7bdc7a265e` | 3441 |
| `continuity.js` | `abbee9cab8c92b2c4680dba2d573bf8eb6a50ab63194e4a0b0b525af5f044e6c` | 10154 |
| `delegation.js` | `e285645231ae867aca6b070b648601e09720dfd4537837a6c36fe10f3a008b7a` | 14748 |
| `emergency.js` | `73bd7199b4d8fbf373331bc7b75d9940cdd9896383739461252c2888f08a408c` | 100288 |
| `operation.js` | `bcbf64e529e9ca722922e5ee4db8183ac9821a2b10260d850eb6a197d52749af` | 41323 |
| `receipt.js` | `b5d042d7c0900131e14f7fc005d2712c41953bc72baacacee328245f9b112407` | 19034 |
| `skill-provenance.js` | `d416956c0fc8ad04d1d3cca21c20c05046c3705701cd22e03447ffe9f509872b` | 72426 |
| `time.js` | `3ed3565a3843b62341e61a2de405eab77b8218a37ac4ef1b41d49f4a4718502d` | 1525 |
| `x402.js` | `eb78be491fcde5dd2b6305defc3a346f2b5c1d554193abee5669d4b8544fc48f` | 59372 |
| `zk.js` | `1849635452a4e137dddb36ceb0500c32552230246f21c772695d407728ed7bd5` | 29906 |