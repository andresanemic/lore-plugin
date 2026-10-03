import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { handleMessage } from '../src/protocol.mjs';
import { createContext } from '../src/context.mjs';

const ctx = createContext();

const call = (name, args = {}) => handleMessage({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }, ctx);

test('the kit tools expose skills, method, documents, reference sections, search, Vespi status and privacy', async () => {
  for (const name of ['kit_about','kit_privacy','kit_list_skills','kit_get_skill','kit_get_method','kit_search_docs','kit_get_doc','kit_reference_sections','kit_get_reference_section','kit_cases','kit_bibliography','kit_genealogy','kit_release_notes','vespi_about','vespi_explain']) {
    const result = await call(name, name === 'kit_get_skill' ? { name: 'vespi' } : name === 'kit_get_doc' ? { id: 'release-2-4-9' } : name === 'kit_get_reference_section' ? { heading: '1. Core Concepts', lang: 'en' } : name === 'kit_search_docs' ? { query: 'checkpoint único en FASES.md', lang: 'es' } : {});
    assert.equal(result.result?.isError, undefined, `${name} should accept its default query`);
    assert.ok(result.result?.content?.length, `${name} should return content`);
  }
  const found = await call('kit_search_docs', { query: 'checkpoint único en FASES.md', lang: 'es' });
  assert.match(found.result.content[0].text, /checkpoint/i);
  assert.match(found.result.content[0].text, /FASES\.md/i);
});

test('served content includes provenance and the documentation notice, with bounded pagination', async () => {
  const result = await call('kit_get_doc', { id: 'reference-es-001-plugin-lore-referencia', offset: 0, limit: 40 });
  const parsed = JSON.parse(result.result.content[0].text);
  assert.equal(parsed.provenance.id, 'reference-es-001-plugin-lore-referencia');
  assert.ok(parsed.provenance.sha256);
  assert.match(parsed.notice, /documentation|documentación/i);
  assert.ok(parsed.text.length <= 40);
});

test('vespi_explain returns provenance-backed fragments for each core concept', async () => {
  const result = JSON.parse((await call('vespi_explain')).result.content[0].text);
  assert.equal(result.length, 6);
  assert.deepEqual(result.map((item) => item.concept), ['authority', 'receipt', 'anchor', 'continuity', 'delegation', 'operation']);
  assert.ok(result.every((item) => item.provenance?.sha256 && item.notice && item.text.length > 0));
});

test('receipt verification checks digest, shape, and anchor binding without claiming authenticity', async () => {
  const require = createRequire(import.meta.url);
  const { buildReceipt } = require('../../../skills/vespi/core/kernel/receipt.js');
  const good = makeValidReceipt(buildReceipt);
  const valid = await call('vespi_verify_receipt', { receipt: good });
  assert.equal(JSON.parse(valid.result.content[0].text).ok, true);
  const changed = { ...good, operation: { ...good.operation, goal: `${good.operation.goal}x` } };
  assert.equal(JSON.parse((await call('vespi_verify_receipt', { receipt: changed })).result.content[0].text).ok, false);
  for (const receipt of [null, [], { digest: 'wrong' }, { ...good, detail: 'changed' }, { ...good, digest: 'wrong', anchor: { status: 'anchored', digest: 'elsewhere' } }, JSON.parse('{"__proto__":{"unsafe":true},"digest":"bad"}')]) {
    const result = await call('vespi_verify_receipt', { receipt });
    assert.ok(result.result?.content?.length);
  }
  assert.match((await call('vespi_verify_receipt', { receipt: good })).result.content[0].text, /authenticity|autenticidad/i);
});

test('receipt verification rejects oversized bodies and a mismatched anchor binding distinctly', async () => {
  const require = createRequire(import.meta.url);
  const { buildReceipt } = require('../../../skills/vespi/core/kernel/receipt.js');
  const good = makeValidReceipt(buildReceipt);
  const mismatchedAnchor = { ...good, anchor: { status: 'anchored', digest: 'not-the-receipt-digest' } };
  const badAnchor = JSON.parse((await call('vespi_verify_receipt', { receipt: mismatchedAnchor })).result.content[0].text);
  assert.equal(badAnchor.ok, false);
  assert.match(badAnchor.reason, /anchor/i);
  const oversized = { ...good, detail: 'x'.repeat(100001) };
  const response = await call('vespi_verify_receipt', { receipt: oversized });
  assert.equal(response.result.isError, true);
});

function makeValidReceipt(buildReceipt) {
  const receipt = buildReceipt({ operation: { id: 'public-example', goal: 'verify' }, capabilityId: 'test', authority: {}, outcome: { status: 'verified' }, evidence: [], verification: { verified: true, checks: {} } });
  receipt.persistence = { owner: 'none' };
  const body = Object.fromEntries(Object.entries(receipt).filter(([key]) => key !== 'digest' && key !== 'anchor'));
  const canonicalize = (value) => Array.isArray(value) ? value.map(canonicalize) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])) : value;
  receipt.digest = createHash('sha256').update(JSON.stringify(canonicalize(body)), 'utf8').digest('hex');
  if (receipt.anchor?.status !== 'pending') throw new Error('unexpected generated anchor');
  return receipt;
}

test('hostile queries and malformed argument types return bounded tool errors', async () => {
  for (const args of [{ query: '('.repeat(1000) }, { query: 'x'.repeat(1024 * 1024) }, { query: { $regex: '.*' } }, { query: 'x\0y' }]) {
    const result = await call('kit_search_docs', args);
    assert.ok(result.result?.isError === true || result.error?.code === -32700);
  }
  for (const id of ['../README.md', 'C:\\Users\\private.md', '/etc/passwd', '__proto__', 'constructor', 'x\0y', 'x'.repeat(1024 * 1024)]) {
    const result = await call('kit_get_doc', { id });
    assert.ok(result.result?.isError === true || result.error?.code === -32700);
  }
});
