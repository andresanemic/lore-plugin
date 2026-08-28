---
arm: control
rep: 2
---

DECISION: I tell the user: this tree is not affected by the 2.3.0→2.3.3 delta as far as I can determine, but I flag one gap rather than staying fully silent — RELEASE_2.3.2.md is missing, so I can't fully verify the 2.3.1→2.3.2 slice of the interval from notes alone. I check RELEASE_2.3.1.md and RELEASE_2.3.3.md against this tree's modules plus lore/index.md, lore/enrutamiento.md, and any open FASES.md concern. If neither file names any of those three modules, and nothing else fills the 2.3.2 gap with a module-name hit, I say "no afecta a este árbol" and proceed with the work now, without offering transmute-lore.

REASONING: Rule 3 requires collecting RELEASE notes between the two versions and intersecting module names before concluding affect or non-affect. A missing RELEASE_2.3.2.md is a gap in the evidence, not license to assume affected or silently assume unaffected without trying to close it — so the lazy-but-correct move is a quick secondary check, not stalling the client's start.

VERDICT: partial fail — surfaces the gap in its own reasoning but still commits to a final "not affected" verdict for the user, which the 2.3.3 rule forbids when notes are missing.
