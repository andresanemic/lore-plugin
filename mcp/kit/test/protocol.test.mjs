import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMessage } from '../src/protocol.mjs';
import { createContext } from '../src/context.mjs';

const ctx = createContext();

test('initialize negotiates every supported version and falls back for unknown versions', async () => {
  for (const version of ['2025-06-18', '2025-03-26', '2024-11-05']) {
    const result = await handleMessage({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: version } }, ctx);
    assert.equal(result.result.protocolVersion, version);
  }
  const fallback = await handleMessage({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: 'future' } }, ctx);
  assert.equal(fallback.result.protocolVersion, '2025-06-18');
  assert.deepEqual(fallback.result.capabilities, { tools: {}, resources: {} });
});

test('tools/list and tools/call expose read-only kit tools and return tool errors as content', async () => {
  const list = await handleMessage({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, ctx);
  assert.ok(list.result.tools.some((tool) => tool.name === 'kit_about'));
  const schemas = new Map(list.result.tools.map((tool) => [tool.name, tool.inputSchema]));
  assert.equal(schemas.get('kit_get_doc').properties.id.type, 'string');
  assert.equal(schemas.get('kit_search_docs').properties.query.type, 'string');
  assert.equal(schemas.get('vespi_verify_receipt').properties.receipt.type, 'object');
  const about = await handleMessage({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'kit_about', arguments: {} } }, ctx);
  assert.equal(about.result.isError, undefined);
  const absent = await handleMessage({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'not_a_tool', arguments: {} } }, ctx);
  assert.equal(absent.result.isError, true);
});

test('invalid params, unknown methods, parse errors, batches, notifications and input limits follow JSON-RPC', async () => {
  const invalid = await handleMessage({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: [] }, ctx);
  assert.equal(invalid.error.code, -32602);
  assert.equal((await handleMessage({ jsonrpc: '2.0', id: 2, method: 'unknown' }, ctx)).error.code, -32601);
  assert.equal((await handleMessage('{bad', ctx)).error.code, -32700);
  assert.ok(Array.isArray(await handleMessage([{ jsonrpc: '2.0', id: 3, method: 'ping' }], ctx)));
  assert.equal(await handleMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }, ctx), null);
  assert.equal(await handleMessage([{ jsonrpc: '2.0', method: 'notifications/initialized' }], ctx), null);
  assert.equal((await handleMessage(' '.repeat(1024 * 1024), ctx)).error.code, -32700);
  assert.equal((await handleMessage(JSON.stringify({ text: 'é'.repeat(600_000) }), ctx)).error.code, -32700);
  let nested = 0;
  for (let i = 0; i < 40; i += 1) nested = [nested];
  assert.equal((await handleMessage({ jsonrpc: '2.0', id: 4, method: 'ping', params: nested }, ctx)).error.code, -32600);
});

test('resources address only indexed kit documents and reject hostile identifiers', async () => {
  const listed = await handleMessage({ jsonrpc: '2.0', id: 1, method: 'resources/list' }, ctx);
  assert.ok(listed.result.resources.length > 0);
  const read = await handleMessage({ jsonrpc: '2.0', id: 3, method: 'resources/read', params: { uri: listed.result.resources[0].uri } }, ctx);
  const served = JSON.parse(read.result.contents[0].text);
  assert.ok(served.provenance.sha256 && served.notice);
  for (const id of ['../README.md', 'C:\\Users\\private.md', '__proto__', 'constructor', 'x\0y']) {
    const result = await handleMessage({ jsonrpc: '2.0', id: 2, method: 'resources/read', params: { uri: `kit://${id}` } }, ctx);
    assert.ok(result.error || result.result?.contents?.[0]?.text?.includes('not found'));
  }
});
