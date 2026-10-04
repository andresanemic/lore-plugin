# Optional kernel capabilities / Capacidades opcionales del kernel

## 1. When this applies / Cuándo aplica

Optional capabilities from the pinned kernel are used only when the agreement names them. Import the
named functions from `skills/vespi/core/vespi.mjs`. Nothing is activated by default: no port, payment,
external skill or ZK backend is connected for you.

Del kernel fijado, solo se usan cuando el acuerdo las nombra. Importa las funciones por su nombre desde
`skills/vespi/core/vespi.mjs`. Nada se activa por defecto: no se conecta por ti ningun puerto, pago,
skill externa ni backend ZK.

Which of them exist is a fact of the vendored copy, not a promise of this document. Read
`OPTIONAL_CAPABILITIES` first: each capability reports `present`, its module path, the names it exposes
and the ones it misses. An absent module stays absent; the facade does not invent, fill or stub it.

Cuales existen es un hecho de la copia vendorizada, no una promesa. `OPTIONAL_CAPABILITIES` declara
`present`, la ruta y los nombres; un modulo ausente sigue ausente, sin relleno.

## 2. Native sequence / Secuencia nativa

**Emergency permission.** `createEmergencyPermission(grant, {authorizeGrantor, resolveVerifier})` →
`exerciseEmergency(permission, request, {ledger, resolveVerifier})` → `reviewEmergencyUse(permission,
useId, {ledger, by, decision, now})`. Grant, use, review: the receipt exists before the effect is
proven. Conceder, ejercer, revisar.

**Skill provenance.** `registerSkillProvenance(spec)` → `verifySkillProvenance(claim, resolver,
options)` → `authorizeSkill(claim, verification, requested)` or `loadSkill(claim, verification,
content, requested)` → `buildSkillReceipt(spec, decisionOrLoad)`. The second argument of `loadSkill` is
the **verification result**, not the decision: `loadSkill` authorizes again inside. El segundo argumento
de `loadSkill` es el resultado de verificación, no la decisión.

**x402 paid effect.** `createX402Payment(spec, ports)` returns `{id, required, run}`; use
`payment.run(operation, io)`. No public `perform`, no second runner for durability. The ports are the
host's: `http.discover`, `http.sendPaid`, `signer.prepare`, `inspectPrepared`, `verifySettlement`,
`validateOutput`, and `claims` (`reserveEffect`, `claimTransaction`, both required).
`createMemoryPaymentClaims` serves tests and demos and loses deduplication on restart.

**ZK verification port.** `createZkVerifier(config)` returns an async function taking `{proof,
publicInputs}`; the config fixes `verificationKey`, `expectedVkDigest`, `circuitDigest`,
`expectedPublicInputs`, `backend` and `backendDigest`. Expected inputs come from the agreement, not the
requester. `backendDigest` is a provenance claim, not a certification of the injected bytes.

## 3. Coverage vocabulary / Vocabulario de cobertura

Coverage names belong to a capability and a verification stage. Only a true check counts as covered. A
false check is not covered; an absent check does not silently pass and does not tell you whether it
failed or was never measured. Each host declares its required checks, their evidence source and the
reason for omissions. Empty coverage proves nothing. Keep observed failures separate from unmeasured
checks and permanent limits.

Los nombres de cobertura pertenecen a una capacidad y una etapa de verificación. Solo una
comprobación `true` cuenta como cubierta. Una `false` no está cubierta; una ausente no aprueba en
silencio ni dice si falló o nunca se midió. Cada host declara qué comprobaciones requiere, de dónde
sale su evidencia y por qué omite alguna. Una cobertura vacía no demuestra nada. Mantén separados los
fallos observados, lo no medido y los límites permanentes.

Identifiers keep the kernel's spelling. This guide is the editorial owner of the vocabulary; each
module and `receipt.js` stay the executable owner of what they accept. Los identificadores conservan la
escritura del kernel: esta guía es la dueña editorial del vocabulario.

| Capability / Capacidad | Stage / Etapa | Names / Nombres |
|---|---|---|
| emergency | grant, use / concesion, uso | `grantor_authority`, `trigger_verified`, `effect_verified` |
| emergency | review / revision | `post_use_review` |
| provenance | verify / verificacion | `repository`, `commit_exists`, `author`, `content_digest` |
| provenance | load / carga | `loaded_content_digest`; `authority_scope` only when a scope refusal adds it |
| x402 | contract / contrato | `terms`, `prepared`, `settlement`, `delivery`, `transactionUnique` |
| x402 | settlement controls allowed / controles de liquidacion permitidos | `settlement_invocation`, `settlement_authorization`, `settlement_prepared`, `settlement_transfer`, `settlement_payer`, `settlement_source`, `settlement_exactAmount` |
| zk | proof / prueba | `zk.verification-key-pinned`, `zk.public-inputs-bound`, `zk.proof-valid` |
| zk | permanent limits false / limites permanentes | `zk.presenter-authentication`, `zk.institutional-attestation`, `zk.replay-prevention`, `zk.transport-privacy` |
| any receipt / cualquier recibo | common / comun | `external anchor` in `notCovered` while no anchor is verified |

A successful use covers the first two emergency checks and leaves `effect_verified` false. A pending
review says only that a declared reviewer closed it: not a favourable review, not a proven effect.
`contentRecomputed` is reported separately and is not a check name. The allowed settlement controls are
a catalogue a host declares it needs, not proof that any receipt measured all seven. Domain names are
the host's own: `host.local-effect-observed`, with evidence and owner.

Un uso exitoso cubre las dos primeras y `effect_verified` sigue false. Una revisión pendiente solo dice
que un revisor declarado la cerró. Los controles de liquidación permitidos son un catálogo, no cobertura
medida.

## 4. Limits / Límites

- Emergency: in-memory ledger, in-process link, no restore after a restart. `maxUses` limits uses, not
  money. An accepted review does not prove the effect; the receipt stays `not_verified`. Never read
  `not_verified` as "it did not happen".
- Provenance: it does not authenticate the grantor and does not evaluate safety, quality or licence; a
  fork with coherent bytes is coherent provenance. Its objects belong to the process; one rebuilt from
  JSON keeps no private link.
- x402: local tests exercise a contract with injected ports, not a new live transaction. Settlement and
  delivery are separate verifications. Memory stores do not deduplicate across restarts or processes.
  Ports are trusted code, not a sandbox. A cancellation does not prove a port stopped. Anchoring is a
  separate capability: a pending anchor does not prove the payment's network.
- ZK: Groth16/BN254 port, injected backend, at most 32 public inputs in the profile read. The four limits
  above are always false. The port creates no proofs and certifies no cadastre or rule. The kit ships no
  default reference backend; an experimental one is not an audited one.
- Common: nothing is added to a native receipt after sealing; integrity, declared coverage, effect
  verification and persistence are separate findings.

La revisión de emergencia no prueba el efecto. La procedencia no certifica que una skill sea segura.
Las pruebas locales de pago no prueban un pago nuevo en vivo. Un resultado ZK no identifica a quien
presenta ni evita la repetición. Nada se añade a un recibo nativo tras el sello.

## 5. Who owns the ports / Quién es dueño de los puertos

The host. Every gate above is a port it supplies: grantor, signal verifier, provenance resolver, payment
ports, claims store, ZK backend. No defaults, and a port returning the agent's own claim does not replace
the person's gate. `OPTIONAL_CAPABILITIES` says what arrived; the ports say what happened.

El host aporta toda compuerta, sin puerto por defecto: un puerto que devuelve la afirmación del agente no
sustituye la compuerta de la persona.

## Reporting / Informe

Four editorial labels, not new kernel states: proven by the cited test; refuted by it; not measured; out
of scope. Keep native `status`, `code` and `reason` beside them. "Test port" and "test backend" describe
one run's support, not a certification. Never derive "it did not happen" from `not_verified`.

Cuatro etiquetas que no son estados nuevos del kernel: comprobado, refutado, no medido, fuera de
alcance, con el `status`, `code` y `reason` nativos al lado.
