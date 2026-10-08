# Vespi kernel copy provenance

Fixed copy of the Vespi kernel **0.1.5** in the Lore Plugin 2.5.1 candidate. Remote tag `v0.1.5-kernel` was observed on 2026-10-08; no associated GitHub Release was found, and `master` remains at 0.1.4. Canonical source: `founder/proyectos/vespi/kernel/src/`, branch `release/0.1.5-prep`, commit `ed559e83c976dd6e6a379a5510db776206f670b4`.

Each module carries a three-line provenance header followed by the exact committed source bytes. The table below does not verify itself: `bench/vespi-kernel-provenance.test.mjs` compares the body with `git show ed559e83c976dd6e6a379a5510db776206f670b4:src/<file>`.

| Module | SHA-256 of source bytes | Bytes |
|---|---|---|
| `authority.js` | `fcf7952489d6f9c42616b52f54832524926d2f2ba6c0ea6514480a7bdc7a265e` | 3441 |
| `continuity.js` | `abbee9cab8c92b2c4680dba2d573bf8eb6a50ab63194e4a0b0b525af5f044e6c` | 10154 |
| `delegation.js` | `357d8b9398ac2b2c3508565e6c2293cc6abff3801f09a60f985dc1c781e002a3` | 17111 |
| `emergency.js` | `73bd7199b4d8fbf373331bc7b75d9940cdd9896383739461252c2888f08a408c` | 100288 |
| `operation.js` | `9a95815fc10435cb55415da1531e1545168eaf209518630b83f24b10f0e78d48` | 45050 |
| `receipt.js` | `d006eff3538b2c701366ba09d1e41a32d267b2bad44177f0095541ce9b2a644d` | 20911 |
| `skill-provenance.js` | `d416956c0fc8ad04d1d3cca21c20c05046c3705701cd22e03447ffe9f509872b` | 72426 |
| `time.js` | `3ed3565a3843b62341e61a2de405eab77b8218a37ac4ef1b41d49f4a4718502d` | 1525 |
| `x402.js` | `63c6765b98c70758fad50859ae66df7833d300c93a961749df85b36aaf9282a2` | 60151 |

| `zk.js` | `e7885a6ceafe8665212323456b17fd5fac61c1907e361d17da31b56a051b9820` | 30685 |
