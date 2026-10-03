### The daily loop

1. You work with your AI agent to solve a problem in your project.
2. You decide whether the solution revealed **criteria** that should shape future decisions.
3. You use `save-to-lore` to capture that criterion into your Markdown Lore.
4. Future sessions reuse that criterion instead of starting from scratch.

**Example — capturing a hydration bug.** You and Claude debug a hydration problem in Next.js. Instead
of just fixing it:

```text
save-to-lore "Hydration issue with initial opacity in Next.js"
```

Lore helps you extract the **Invariant Clue** (e.g. "the initial state goes in the markup; the
library confirms it with `fromTo`, never creates it"), decide whether it belongs to a project module
or to the Area's `principios.md`, and update the right Markdown artifacts — always after your approval
at the threshold.

