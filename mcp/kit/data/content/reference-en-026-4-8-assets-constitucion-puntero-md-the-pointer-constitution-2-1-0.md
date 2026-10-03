### 4.8 `assets/constitucion-puntero.md` — the pointer constitution (2.1.0)

**Scope:** shipped **with the kit**, not generated into your repository. It is a template you copy.

**Purpose:** let a repository governed by **spec-kit** coexist with Lore without either body of
criteria silently absorbing the other. spec-kit's constitution is authoritative over the *cycle*
(spec → plan → tasks → implement); Lore is authoritative over the *criteria* that constrains how any
of it gets built. The template makes that boundary explicit instead of leaving it to whoever writes
the next document.

**Why it is a pointer and not a copy.** A constitution that restates the Lore's rules becomes a second source that drifts invisibly — both documents keep reading correctly on their own. The template points at `lore/` for anything Lore owns and states in writing that it does not govern there.

**Its own rule, and the one people skip:** a clause of the *"this document supersedes all other practices"* family is **revoked in writing, with its reason** — never merely deleted. An omission leaves a hole the next template regeneration fills back in. Arbitrating a governing document is `save-to-lore` **graft**, the hardest case that mode has.

See [`SPEC_KIT_en.md`](./SPEC_KIT_en.md) for installation and the three entry scenarios.

---

