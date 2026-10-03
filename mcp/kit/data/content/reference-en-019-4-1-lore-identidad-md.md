### 4.1 `lore/identidad.md`

**Scope:** Area or project.

**Purpose:**

- Define the identity of the project or Area.
- Capture the minimum quality standard that must be upheld.

**Typical contents:**

- Name and description.
- Core intent and audience.
- Non‑negotiable quality bar (e.g. “No user‑visible regressions in production”).
- **`registro:`** — how technical you want the kit to speak to you: `tecnico`, `equilibrado`
  (default) or `llano`. One line. See below.

**The `registro:` key (2.1.0).** It sets how much ground surrounds a rule when the kit explains
itself — `tecnico` keeps the specification and drops the scene, `llano` grows the scene and explains
a technical term the first time it appears, `equilibrado` is half and half. **It never moves the rules
themselves:** a threshold is still a threshold, a `MUST` is still a `MUST`, and a validity boundary is
never omitted. A calibrator that could switch off a gate would be a way of skipping the kit by asking
it nicely.

It is **inferred, never asked** — from how the person writes during the brainstorm — then declared out
loud in one line with the correction offered in the same breath. It is a **declared preference, not
criteria**: it constrains no decision about the work, so it carries no confidence marker and is never
promoted to the area. Absent the line, assume `equilibrado`.

**Guidelines:**

- Keep it short and stable.
- Update only when identity or standards truly change.

---

