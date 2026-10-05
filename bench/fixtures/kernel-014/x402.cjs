'use strict';
// FIXTURE SINTETICO — no es el kernel de Vespi. Misma forma contractual que el plano describe para
// x402: el pago es un contrato con puertos inyectados, la liquidacion y la entrega son verificaciones
// separadas, y la deduplicacion del efecto vive en el store que elige el host (claims es obligatorio).
const EFFECT_CODES = Object.freeze(['DUPLICATE_EFFECT', 'DUPLICATE_TRANSACTION']);

function createMemoryPaymentClaims() {
  const effects = new Map();
  const transactions = new Map();
  return {
    kind: 'memory',
    async reserveEffect(key) {
      if (effects.has(key)) return { reserved: false, code: EFFECT_CODES[0] };
      effects.set(key, { at: null });
      return { reserved: true };
    },
    async claimTransaction(key, txHash) {
      if (transactions.has(key)) return { claimed: false, code: EFFECT_CODES[1], txHash: transactions.get(key) };
      transactions.set(key, txHash);
      return { claimed: true, txHash };
    },
  };
}

function selectX402Terms(spec) {
  const terms = {
    asset: spec?.asset ?? null,
    amount: spec?.amount ?? null,
    to: spec?.to ?? null,
    network: spec?.network ?? null,
  };
  return Object.fromEntries(Object.entries(terms).filter(([, value]) => value !== null));
}

function createX402Payment(spec, ports) {
  const required = () => ({
    asset: spec?.asset ?? null,
    amount: spec?.amount ?? null,
    to: spec?.to ?? null,
    network: spec?.network ?? null,
  });
  return {
    id: spec?.id ?? null,
    required,
    // El contrato no expone perform publico: se usa payment.run(operation, io).
    async run(operation, io = {}) {
      const order = [];
      const terms = selectX402Terms(spec);
      if (typeof ports?.claims?.reserveEffect !== 'function') throw new Error('x402 needs a claims store chosen by the host');
      const discovered = await ports.http.discover(terms);
      order.push('discover');
      const prepared = await ports.signer.prepare(discovered);
      order.push('prepare');
      const inspected = await ports.inspectPrepared(prepared);
      order.push('inspect');
      // Una autoridad vencida antes de enviar no envia: la puerta es del puerto, no del agente.
      const expiresAt = Date.parse(inspected?.expiresAt ?? "");
      if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
        return { status: 'failed', code: 'terms_expired', order, coverage: { terms: true, prepared: true, settlement: false, delivery: false, transactionUnique: false } };
      }
      const changed = ["asset", "amount", "to", "network"].some((key) => terms[key] !== undefined && inspected?.[key] !== undefined && terms[key] !== inspected[key]);
      if (changed) {
        return { status: 'failed', code: 'terms_changed', order, coverage: { terms: false, prepared: true, settlement: false, delivery: false, transactionUnique: false } };
      }
      const effectKey = `${operation?.id ?? "op"}|${terms.asset}|${terms.amount}|${terms.to}|${terms.network}`;
      const reservation = await ports.claims.reserveEffect(effectKey);
      order.push('reserve');
      if (reservation.reserved !== true) {
        return { status: 'failed', code: reservation.code ?? EFFECT_CODES[0], order, coverage: { terms: true, prepared: true, settlement: false, delivery: false, transactionUnique: false } };
      }
      const settled = await ports.http.sendPaid(inspected);
      order.push('sendPaid');
      const settlement = await ports.verifySettlement(settled);
      order.push('verifySettlement');
      const delivery = await ports.validateOutput(settlement?.output);
      order.push('validateOutput');
      const claim = await ports.claims.claimTransaction(effectKey, settled?.txHash ?? null);
      order.push('claimTransaction');
      return {
        status: "verified",
        code: null,
        order,
        txHash: settled?.txHash ?? null,
        coverage: {
          terms: true,
          prepared: true,
          settlement: settlement?.verified === true,
          delivery: delivery?.valid === true,
          transactionUnique: claim.claimed === true,
        },
        settlementChecks: settlement?.checks ?? [],
      };
    },
  };
}

module.exports = { createX402Payment, selectX402Terms, createMemoryPaymentClaims, EFFECT_CODES };
