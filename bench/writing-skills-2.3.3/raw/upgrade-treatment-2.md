---
arm: treatment
rep: 2
---

DECISION: I tell the user: I do not claim "affected" or "unaffected" outright — I report the RELEASE_2.3.2.md gap, offer one optional manual UPGRADE review via transmute-lore, and since the user just deferred (wants to start now), I proceed with the work without blocking.

REASONING: Rule 3 explicitly separates two failure modes: don't infer affect from the version number alone, but also don't claim affected/unaffected when a RELEASE note in the interval is missing. Here 2.3.1 and 2.3.3 notes exist but 2.3.2 doesn't, so the interval isn't fully covered regardless of what the two available notes say about module intersection — the gap itself, not the visible deltas, is dispositive.

VERDICT: matches the 2.3.3 rule exactly.
