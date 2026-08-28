# Lore Plugin 2.3.3 — observable boundaries

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

2.3.3 repairs contracts that could claim more than their observable result.

`LEAVE` is still an operational recipe executed by an agent, not a deterministic runner. Its
read-only pre-flight now inventories the always-on block, surrounding host-contract instructions,
secondary contracts, `FASES.md`, hooks and generated configuration. It stops before changing a
symlink or shared contract, shows the exact removal set, writes `leave:partial` before mutation and
keeps that recovery checklist until both static and fresh-session verification pass. It preserves
`lore/`, plain `enrutamiento.md` and unrelated contract or hook content. The final marker retains
the checklist; use-lore resumes a partial exit and UPGRADE re-checks the recorded surfaces before
offering a later re-entry.

The same audit closed four adjacent contract gaps:

- federated bots load canon plus routing first; federated Lore remains reachable and is loaded on
  demand for the selected task. Packaging a bot means CRYSTALLIZE, not wrapping it as a plugin;
- the implicit `brainstorming-lore` trigger requires relevant production modules. Identity plus
  principles alone, or an empty `lore/`, do not qualify;
- the UPGRADE relevance gate still requires a module-name intersection and stays silent when none
  exists. Missing release notes now produce an explicit evidence gap, not a guessed result. The
  2.3.2 note was corrected because no standalone `barrido-lore.ps1` shipped;
- CRYSTALLIZE now omits sensitive filenames and aborts before composing a snapshot when a routed
  text contains a recognized private-key, provider-token or credential-assignment marker. Its real
  pack/extract and secret-rejection tests now run under `npm test`.

Nemotron 3 Ultra performed the initial audit. The proposed post-audit implementation was discarded;
the corrections above were rebuilt and verified with GPT-5.6 Sol medium. Static contract tests are
in [`bench/leave.test.mjs`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave.test.mjs)
and [`bench/skills-routing.test.mjs`](https://github.com/andresanemic/lore-plugin/blob/main/bench/skills-routing.test.mjs).
Fresh-agent contract-application scenarios are recorded in
[`bench/leave-agent-scenarios/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave-agent-scenarios/README.md).
Those scenarios test decisions against synthetic fixtures, not filesystem execution. The behavioral verification procedure was specified but not executed end to end.

No Obsidian executable was added: `obsidian-lore` remains an agent-run workflow and its contract is
tested statically. MYCELIUM remains read-only and reports a descriptive rate, never a normative
score. SAVE's existing exit trigger and the one-`bots`-area handoff already existed in the 2.3.2
baseline; this release does not claim them as new fixes. No LUS hypothesis is created or promoted.

Existing Lore needs no migration.

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.3

---

<a id="español"></a>

# Lore Plugin 2.3.3 — fronteras observables

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

2.3.3 repara contratos que podían prometer más que su resultado observable.

`LEAVE` sigue siendo una receta operacional ejecutada por un agente, no un runner determinista. Su
pre-flight de solo lectura ahora inventaría el bloque always-on, instrucciones circundantes del
contrato del host, contratos secundarios, `FASES.md`, hooks y configuración generada. Se detiene
antes de cambiar un symlink o contrato compartido, muestra el conjunto exacto a retirar, escribe
`leave:partial` antes de mutar y conserva ese checklist de recuperación hasta que pasan la
verificación estática y la de sesión fresca. Preserva `lore/`, `enrutamiento.md` plano y el contenido
ajeno de contratos y hooks. El marcador final conserva el checklist; use-lore reanuda una salida
parcial y UPGRADE vuelve a comprobar las superficies registradas antes de ofrecer una reentrada.

La misma auditoría cerró cuatro brechas contractuales adyacentes:

- los bots federados cargan primero canon y enrutamiento; el Lore federado queda alcanzable y se
  carga bajo demanda para la tarea elegida. Empaquetar un bot significa CRYSTALLIZE, no envolverlo
  como plugin;
- el disparo implícito de `brainstorming-lore` exige módulos de producción pertinentes. Solo
  identidad más principios, o un `lore/` vacío, no califican;
- el filtro de relevancia de UPGRADE sigue exigiendo intersección por nombre de módulo y guarda
  silencio cuando no existe. Si faltan notas de release, ahora declara el hueco de evidencia en vez
  de adivinar. Se corrigió la nota de 2.3.2 porque nunca se publicó un `barrido-lore.ps1` autónomo;
- CRYSTALLIZE ahora omite nombres de archivo sensibles y aborta antes de componer una fotografía si
  un texto enrutado contiene un marcador reconocido de clave privada, token de proveedor o asignación
  de credencial. Sus tests reales de pack/extract y rechazo de secretos ahora corren con `npm test`.

Nemotron 3 Ultra realizó la auditoría inicial. La implementación posterior a esa auditoría fue
descartada; las correcciones anteriores se reconstruyeron y verificaron con GPT-5.6 Sol medium. Los
tests estáticos de contrato están en
[`bench/leave.test.mjs`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave.test.mjs) y
[`bench/skills-routing.test.mjs`](https://github.com/andresanemic/lore-plugin/blob/main/bench/skills-routing.test.mjs).
Los escenarios de aplicación del contrato por agentes frescos están en
[`bench/leave-agent-scenarios/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave-agent-scenarios/README.md).
Esos escenarios prueban decisiones ante fixtures sintéticos, no ejecución sobre el filesystem. El
procedimiento de verificación conductual quedó especificado, pero no fue ejecutado de extremo a
extremo.

No se agregó un ejecutable Obsidian: `obsidian-lore` sigue siendo un flujo ejecutado por el agente y
su contrato se prueba estáticamente. MYCELIUM permanece read-only y reporta una tasa descriptiva,
nunca un score normativo. El disparo de salida existente de SAVE y el handoff hacia una sola Área
`bots` ya estaban en la base 2.3.2; esta release no los reclama como arreglos nuevos. No se crea ni
promueve ninguna hipótesis LUS.

El Lore existente no necesita migración.

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.3
