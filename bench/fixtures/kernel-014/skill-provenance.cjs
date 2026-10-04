'use strict';
// FIXTURE SINTETICO — no es el kernel de Vespi. Misma forma contractual que el plano describe para
// la procedencia de skills: registrar, verificar con un resolvedor del host, autorizar o cargar, y
// sellar un recibo. El punto que esta prueba quiere preservar es que el segundo argumento de
// loadSkill es el RESULTADO DE VERIFICACION y no la decision de authorizeSkill.
const { createHash } = require('node:crypto');

const records = new Map();
const SKILL_PROVENANCE_STATUSES = Object.freeze(['verified', 'not_verifiable', 'unverified']);

const digestOf = (bytes) => createHash('sha256').update(bytes).digest('hex');

function registerSkillProvenance(spec) {
  const claim = {
    name: spec?.name ?? null,
    repository: spec?.repository ?? null,
    commit: spec?.commit ?? null,
    author: spec?.author ?? null,
    content: spec?.content ?? null,
    authorities: spec?.authorities ?? null,
  };
  if (claim.name === null || claim.repository === null || claim.commit === null) {
    return { ok: false, code: 'incomplete_spec' };
  }
  records.set(claim, true);
  return { ok: true, claim };
}

function recordOf(claim) {
  return claim !== null && typeof claim === 'object' && records.get(claim) === true;
}

async function verifySkillProvenance(claim, resolver, options = {}) {
  if (!recordOf(claim)) {
    return { status: 'not_verifiable', reason: 'this claim was not produced for this skill by this kernel', coverage: {}, contentRecomputed: false };
  }
  if (typeof resolver !== 'function') throw new Error('verifySkillProvenance needs a resolver');
  // El resolvedor solo recibe name, repository y commit. No recibe el author ni el digest que el kit
  // espera: si se los pasara, un resolvedor que devuelve la propia declaracion compararia consigo mismo.
  const observed = await resolver({ name: claim.name, repository: claim.repository, commit: claim.commit });
  const coverage = { repository: false, commit_exists: false, author: false, content_digest: false };
  if (observed?.repository === claim.repository) coverage.repository = true;
  if (observed?.commitExists === true) coverage.commit_exists = true;
  if (observed?.author === claim.author) coverage.author = true;
  // Camino fuerte: los bytes del contenido y el digest RECALCULADO aqui, no el declarado.
  if (typeof observed?.content === 'string' || Buffer.isBuffer(observed?.content)) {
    const bytes = Buffer.isBuffer(observed.content) ? observed.content : Buffer.from(observed.content, 'utf8');
    if (options.requireContent !== false && bytes.equals(Buffer.from(claim.content ?? '', 'utf8'))) {
      coverage.content_digest = digestOf(bytes) === digestOf(Buffer.from(claim.content, 'utf8'));
    }
  }
  const status = coverage.repository && coverage.commit_exists && coverage.author && coverage.content_digest ? 'verified' : 'not_verifiable';
  const verification = { status, coverage, contentRecomputed: true, observation: observed ?? null };
  records.set(verification, claim);
  return verification;
}

function verificationOf(claim, verification) {
  if (!recordOf(claim) || !recordOf(verification)) return null;
  return records.get(verification) === claim ? verification : null;
}

function authorizeSkill(claim, verification, requested) {
  const known = verificationOf(claim, verification);
  if (known === null) {
    return { authorized: false, reason: 'this verification result was not produced for this skill by this kernel', coverage: {} };
  }
  const authorities = claim.authorities ?? {};
  const wanted = requested?.authorities ?? null;
  if (wanted !== null && !Object.entries(wanted).every(([name, ok]) => ok !== true || authorities[name] === true)) {
    const coverage = { ...known.coverage, authority_scope: false };
    return { authorized: false, reason: 'authority outside the declared scope', coverage };
  }
  return { authorized: true, granted: wanted ?? authorities, coverage: { ...known.coverage } };
}

function loadSkill(claim, verification, content, requested) {
  // loadSkill vuelve a autorizar por dentro: el segundo parametro es la verificacion, no la decision.
  const decision = authorizeSkill(claim, verification, requested);
  if (decision.authorized !== true) return decision;
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ''), 'utf8');
  const recomputed = digestOf(bytes);
  return {
    ...decision,
    loaded: true,
    contentDigest: recomputed,
    coverage: { ...decision.coverage, loaded_content_digest: recomputed === digestOf(Buffer.from(claim.content ?? '', 'utf8')) },
  };
}

function buildSkillReceipt(spec, decisionOrLoad) {
  return {
    status: decisionOrLoad?.authorized === true ? 'verified' : 'not_verified',
    capability: 'skill-provenance',
    spec: { name: spec?.name ?? null, repository: spec?.repository ?? null, commit: spec?.commit ?? null },
    coverage: decisionOrLoad?.coverage ?? {},
    // Sellar aqui no es una garantia: es que nadie adds campos despues.
    digest: digestOf(`${spec?.name ?? ''}|${spec?.commit ?? ''}|${decisionOrLoad?.authorized === true}`),
  };
}

function listSkillProvenance() {
  return [...records.keys()].filter((key) => recordOf(key)).map((claim) => ({ name: claim.name, repository: claim.repository, commit: claim.commit }));
}

module.exports = {
  registerSkillProvenance,
  verifySkillProvenance,
  authorizeSkill,
  loadSkill,
  buildSkillReceipt,
  listSkillProvenance,
  SKILL_PROVENANCE_STATUSES,
};
