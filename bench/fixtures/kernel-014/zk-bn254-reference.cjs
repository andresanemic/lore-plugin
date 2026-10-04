'use strict';
// FIXTURE SINTETICO — no es el kernel de Vespi. La referencia ZK del kernel declara en su propia
// documentacion que es experimental y no auditada. El plano deja este modulo FUERA de la fachada:
// su presencia fisica en la copia vendorizada es parte del conjunto, no un backend del kit.
const { createZkVerifier } = require('./zk.js');

function createReferenceBackend() {
  return async () => {
    throw new Error('reference backend: experimental, not audited');
  };
}

module.exports = { createReferenceBackend, createZkVerifier };
