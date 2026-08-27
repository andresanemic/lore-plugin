# Protocol amendments

## 2026-08-26 — blind reviewer and secondary preference

After 10 of 16 valid first-pass runs had completed, the user assigned blind binary semantic adjudication to GPT-5.6 Sol and removed the separate human pairwise-preference diagnostic. The randomized arm key remains hidden from the adjudicator until all criterion verdicts are frozen.

This amendment changes neither the four tasks, the 128 first-pass criterion decisions, the arms, model, reasoning effort, repair rule nor the three primary metrics. No pairwise-preference result will be reported.

## 2026-08-26 — repair session operationalization

The preregistration says both that every measured run uses an ephemeral session and that a failed run's session is reused for repair. The first-pass harness followed the former rule, so those sessions cannot be resumed. Before any repair was run, the repair was therefore operationalized as a fresh isolated Terra-medium session receiving only the original task, the complete prior output, and the identifiers and frozen descriptions of failed criteria. It receives no arm name, new example or drafted solution.

Attempts-to-goal remains `1`, `2` or censored `>2`, and time-to-goal remains the sum of measured attempt durations. The interpretation narrows from same-session correction to controlled revision of the same artifact.
