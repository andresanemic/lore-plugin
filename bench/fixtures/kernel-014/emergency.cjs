'use strict';
// FIXTURE SINTETICO — no es el kernel de Vespi.
//
// Modulo CommonJS minimo con la forma contractual que el plano describe para la capacidad de
// emergencia: conceder antes, ejercer con senal independiente ligada al disparador declarado, recibo
// inmediato con el efecto sin verificar, y revision posterior. La fachada no lo reimplementa: lo
// reexporta. Este archivo existe para que la prueba de absorcion pueda ejercitar ese contrato sin
// depender del commit final del kernel, y para que cada ataque falle por la regla del modulo y no
// por una regla inventada en la fachada.
const identities = new WeakMap();
const ledgers = new WeakMap();

const NO_ANCHOR = ['external anchor', 'exact_state'];

function grantorAuthorityCovered(value) {
  return { grantor_authority: value === true, trigger_verified: false, effect_verified: false, post_use_review: false };
}

async function createEmergencyPermission(grant, options = {}) {
  if (typeof options.authorizeGrantor !== 'function') {
    throw new Error('emergency permission needs an authorizeGrantor port');
  }
  const grantor = grant?.grantor ?? null;
  const verdict = await options.authorizeGrantor(grantor);
  if (verdict?.authorized !== true) {
    return { ok: false, code: 'grantor_unauthorized', coverage: grantorAuthorityCovered(false), notCovered: [...NO_ANCHOR] };
  }
  const permission = {
    id: `em-${(grantor === null ? 'anon' : String(grantor)).replace(/[^a-z0-9]/gi, '')}-${grant.trigger ?? 'none'}`,
    trigger: grant?.trigger ?? null,
    maxUses: Number.isInteger(grant?.maxUses) ? grant.maxUses : 1,
    uses: 0,
    state: 'active',
    reviews: Object.create(null),
  };
  // La identidad ligada por WeakMap tiene que sobrevivir en la misma instancia del modulo: es lo que
  // hace que un objeto rehecho desde JSON no tenga autoridad.
  identities.set(permission, grantor);
  return {
    ok: true,
    permission,
    coverage: grantorAuthorityCovered(true),
    notCovered: [...NO_ANCHOR],
    effect_verified: false,
  };
}

async function exerciseEmergency(permission, request, options = {}) {
  const grantor = identities.get(permission);
  if (grantor === undefined) {
    return { ok: false, code: 'not_granted', coverage: grantorAuthorityCovered(false), notCovered: [...NO_ANCHOR] };
  }
  if (permission.state !== 'active') {
    return { ok: false, code: permission.state === 'revoked' ? 'revoked' : 'paused', coverage: grantorAuthorityCovered(true), notCovered: [...NO_ANCHOR] };
  }
  if (permission.uses >= permission.maxUses) {
    return { ok: false, code: 'uses_exhausted', coverage: grantorAuthorityCovered(true), notCovered: [...NO_ANCHOR] };
  }
  // El verificador de senal tiene que ser el del host y la senal tiene que venir ligada al disparador
  // declarado: el propio ejecutor no puede ser su propio verificador.
  const verifier = options.resolveVerifier ?? options.resolveSignal;
  if (typeof verifier !== 'function') throw new Error('exerciseEmergency needs a signal port');
  const signal = await verifier(request?.signal ?? null);
  const bound = signal !== null && signal !== undefined && signal.trigger === permission.trigger;
  if (!bound) {
    return { ok: false, code: 'trigger_unverified', coverage: grantorAuthorityCovered(true), notCovered: [...NO_ANCHOR] };
  }
  permission.uses += 1;
  const useId = `${permission.id}-use-${permission.uses}`;
  const ledger = options.ledger ?? null;
  if (ledger) ledgers.set(ledger, [...(ledgers.get(ledger) ?? []), { useId, permission: permission.id }]);
  return {
    ok: true,
    useId,
    receipt: {
      status: 'not_verified',
      capability: 'emergency',
      useId,
      trigger_verified: true,
      effect_verified: false,
      // Una revision pendiente no es una revision favorable y el efecto sigue sin probar.
      review: { status: 'pending' },
      coverage: { grantor_authority: true, trigger_verified: true, effect_verified: false, post_use_review: false },
      notCovered: [...NO_ANCHOR],
    },
  };
}

async function reviewEmergencyUse(permission, useId, { ledger = null, by = null, decision = null, now = null } = {}) {
  if (identities.get(permission) === undefined) return { ok: false, code: 'not_granted' };
  if (by === null) return { ok: false, code: 'reviewer_required' };
  permission.reviews[useId] = { by, decision, at: now, closed: true };
  const review = { status: 'closed', decision, by };
  return { ok: true, review, coverage: { ...grantorAuthorityCovered(true), post_use_review: true } };
}

function pauseEmergencyPermission(permission) {
  if (identities.get(permission) === undefined) return { ok: false, code: 'not_granted' };
  permission.state = 'paused';
  return { ok: true, state: permission.state };
}

function resumeEmergencyPermission(permission) {
  if (identities.get(permission) === undefined) return { ok: false, code: 'not_granted' };
  permission.state = 'active';
  return { ok: true, state: permission.state };
}

function revokeEmergencyPermission(permission) {
  if (identities.get(permission) === undefined) return { ok: false, code: 'not_granted' };
  permission.state = 'revoked';
  permission.reviews = Object.create(null);
  return { ok: true, state: permission.state };
}

function getEmergencyState(permission) {
  if (identities.get(permission) === undefined) return null;
  return { id: permission.id, state: permission.state, uses: permission.uses, maxUses: permission.maxUses, reviews: { ...permission.reviews } };
}

function createEmergencyLedger() {
  const ledger = { entries: [] };
  return ledger;
}

async function renewEmergencyPermission(permission, { expiresAt = null, authorizeRenewal = null } = {}) {
  // Renovar no es autorrenovar: exige el aprobador ligado al otorgar.
  if (identities.get(permission) === undefined) return { ok: false, code: 'not_granted' };
  if (typeof authorizeRenewal !== 'function') return { ok: false, code: 'approver_required' };
  const verdict = await authorizeRenewal(identities.get(permission));
  if (verdict?.authorized !== true) return { ok: false, code: 'renewal_unauthorized' };
  permission.expiresAt = expiresAt;
  return { ok: true, expiresAt };
}

module.exports = {
  createEmergencyPermission,
  createEmergencyLedger,
  exerciseEmergency,
  reviewEmergencyUse,
  pauseEmergencyPermission,
  resumeEmergencyPermission,
  revokeEmergencyPermission,
  getEmergencyState,
  renewEmergencyPermission,
};
