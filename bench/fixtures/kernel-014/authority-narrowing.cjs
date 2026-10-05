'use strict';
// FIXTURE SINTETICO — no es el kernel de Vespi. Dos modulos que el plano deja FUERA de la fachada:
// la referencia BN254 experimental y el comparador de gasto. Existen aqui para que la prueba de
// absorcion pueda comprobar que la fachada no los expone aunque la copia vendorizada los traiga.
const COVERED = Object.freeze({ spend: true });

function narrowSpendAuthority(parent, child) {
  if (parent?.asset !== child?.asset) return { ok: false, code: 'asset_mismatch' };
  return { ok: true, code: null, reason: 'child covered by parent', coverage: COVERED };
}

function isSpendNarrowing(value) {
  return value?.asset === 'spend';
}

module.exports = { narrowSpendAuthority, isSpendNarrowing };
