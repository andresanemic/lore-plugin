'use strict';
// FIXTURE SINTETICO — no es el kernel de Vespi. Misma forma contractual que el plano describe para el
// puerto ZK: el backend lo inyecta el host, las entradas esperadas vienen del acuerdo, y cuatro
// comprobaciones son limites permanentes que ningun backend puede volver true.
const { createHash } = require('node:crypto');

const ZK_CHECK_KEYS = Object.freeze(['zk.verification-key-pinned', 'zk.public-inputs-bound', 'zk.proof-valid']);
const LIMIT_CHECKS = Object.freeze(['zk.presenter-authentication', 'zk.institutional-attestation', 'zk.replay-prevention', 'zk.transport-privacy']);
const VK_SCHEMA = Object.freeze({ verificationKey: 'string', digest: 'string' });
const EVIDENCE_SCHEMA = Object.freeze({ result: 'string', verified: 'boolean', coverage: 'object' });
const COVERED_CHECKS = new Set(ZK_CHECK_KEYS);
const FP_MODULUS = '21888242871839275222246405745257275088548364400416034343698204186575808495617';
const SCALAR_MODULUS = '21888242871839275222246405745257275088696311157297823662689037894645226208583';

const LIMITS_ALWAYS_FALSE = () => Object.fromEntries(LIMIT_CHECKS.map((key) => [key, false]));

function digestZkVerificationKey(key) {
  return createHash('sha256').update(JSON.stringify(key ?? null)).digest('hex');
}

function claimsZk(verified) {
  return { ...Object.fromEntries(ZK_CHECK_KEYS.map((key) => [key, verified === true])), ...LIMITS_ALWAYS_FALSE() };
}

function createZkVerifier(config) {
  return async function verify({ proof = null, publicInputs = null } = {}) {
    if (typeof config?.backend !== 'function') {
      return { verified: false, result: 'unavailable', code: 'backend_unavailable', coverage: claimsZk(false) };
    }
    const expected = config.expectedPublicInputs ?? null;
    if (expected !== null) {
      const same = Array.isArray(publicInputs) && Array.isArray(expected)
        && publicInputs.length === expected.length
        && publicInputs.every((value, index) => String(value) === String(expected[index]));
      if (!same) {
        // Los inputs distintos del acuerdo no llegan al backend: no hay a quien preguntar.
        return { verified: false, result: 'invalid', code: 'public_inputs_mismatch', coverage: claimsZk(false) };
      }
    }
    if (config.expectedVkDigest !== undefined && digestZkVerificationKey(config.verificationKey) !== config.expectedVkDigest) {
      return { verified: false, result: 'invalid', code: 'verification_key_mismatch', coverage: claimsZk(false) };
    }
    const answer = await config.backend({ proof, publicInputs });
    // Un backend que devuelve un objeto truthy no es una verificacion: es la declaracion del host.
    if (answer !== true) {
      return { verified: false, result: 'invalid', code: 'proof_rejected', coverage: claimsZk(false), observed: answer ?? null };
    }
    return { verified: true, result: 'verified', code: null, coverage: claimsZk(true), backendDigest: config.backendDigest ?? null };
  };
}

function readZkEvidence(receipt) {
  const evidence = receipt?.verification?.zk ?? null;
  return evidence === null ? { present: false, result: null, verified: null, code: null } : { present: true, result: evidence.result ?? null, verified: evidence.verified ?? null, code: evidence.code ?? null };
}

function readZkClaim(receipt) {
  return { zk: readZkEvidence(receipt).result, reason: receipt?.verification?.reason ?? null };
}

function reconcileZk(receipt, verification) {
  const observed = readZkEvidence(receipt);
  // Un zk con result 'verified' y verified false es consistente a proposito; lo incoherente es al reves.
  if (observed.present && observed.result === 'verified' && observed.verified !== true) {
    return { ok: false, code: 'zk_inconsistent' };
  }
  if (verification?.verified === false && observed.observed === 'verified') {
    return { ok: false, code: 'zk_inconsistent' };
  }
  return { ok: true, code: null };
}

module.exports = {
  createZkVerifier,
  digestZkVerificationKey,
  readZkEvidence,
  readZkClaim,
  reconcileZk,
  claimsZk,
  ZK_CHECK_KEYS,
  LIMIT_CHECKS,
  VK_SCHEMA,
  EVIDENCE_SCHEMA,
  COVERED_CHECKS,
  FP_MODULUS,
  SCALAR_MODULUS,
};
