# Optional kernel capabilities / Capacidades opcionales del kernel

## 1. When this applies / Cuándo aplica

Use only capabilities named by the agreement; import them from `skills/vespi/core/vespi.mjs`. Nothing
connects by default: ports, payments, external skills and the ZK backend stay inactive.

Usa solo capacidades que nombre el acuerdo e impórtalas desde `skills/vespi/core/vespi.mjs`. Puertos,
pagos, skills externas y backend ZK quedan inactivos por defecto.

Presence comes from the vendored copy. `OPTIONAL_CAPABILITIES` lists `present`, module, `exposed` and
`missing`; the facade never invents or stubs absent modules or exports.

La copia vendorizada determina la presencia. `OPTIONAL_CAPABILITIES` lista `present`, modulo, `exposed` y
`missing`; la fachada no inventa ni rellena modulos ni nombres.

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

Emergency use covers only its first two checks; `effect_verified` stays false. A pending review means
only that the declared reviewer closed it, not that the review favoured the action or proved its effect.
`contentRecomputed` is separate from check names. Allowed settlement controls are a host-declared
catalogue, not evidence that a receipt measured all seven. Hosts own domain names and their evidence.

El uso solo cubre las dos primeras; `effect_verified` sigue false. Cerrar una revisión pendiente no
aprueba el efecto. Los controles permitidos son un catálogo, no cobertura medida.

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

The host supplies every gate: grantor, signal verifier, provenance resolver, payment ports, claims store
and ZK backend. No defaults; an agent echo cannot replace the person's gate. The capability map says
what arrived; ports say what happened.

El host aporta cada compuerta, sin puertos por defecto; el eco del agente no sustituye la compuerta
humana.

## Reporting / Informe

Four editorial labels, not kernel states: proven by the cited test, refuted, not measured, out of scope.
Keep native `status`, `code` and `reason`. Test ports and backends support only that run, not a
certification. `not_verified` never means an event did not happen.

Cuatro etiquetas editoriales, no estados del kernel: comprobado por prueba citada, refutado, no medido,
fuera de alcance. Conserva `status`, `code` y `reason` nativos.
