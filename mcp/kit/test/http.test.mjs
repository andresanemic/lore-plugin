import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/mcp.js';

function response() {
  return { headers: {}, statusCode: 0, body: '', setHeader(key, value) { this.headers[key] = value; }, end(value = '') { this.body = value; } };
}

test('the stateless HTTP adapter accepts POST /mcp JSON and returns application/json', async () => {
  const res = response();
  await handler({ method: 'POST', url: '/mcp', body: { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } } }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /application\/json/);
  assert.equal(JSON.parse(res.body).result.protocolVersion, '2025-06-18');
});

test('GET returns 405 and a batch POST stays stateless', async () => {
  const get = response();
  await handler({ method: 'GET', url: '/mcp' }, get);
  assert.equal(get.statusCode, 405);
  const post = response();
  await handler({ method: 'POST', url: '/mcp', body: [{ jsonrpc: '2.0', id: 1, method: 'ping' }] }, post);
  assert.deepEqual(JSON.parse(post.body), [{ jsonrpc: '2.0', id: 1, result: {} }]);
});
