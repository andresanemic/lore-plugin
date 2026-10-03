import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

test('the built data package contains only allowlisted public data and no sensitive patterns', async () => {
  const index = JSON.parse(await readFile(new URL('data/index.json', root), 'utf8'));
  assert.ok(index.documents.length > 0);
  const files = await readdir(new URL('data/content', root));
  assert.equal(files.length, index.documents.length);
  assert.deepEqual(new Set(index.documents.map((doc) => doc.file.split('/').at(-1))), new Set(files));
  const allowlist = JSON.parse(await readFile(new URL('public-allowlist.json', root), 'utf8'));
  assert.ok(allowlist.some((entry) => entry.id === 'vespi-kernel-changelog' && entry.type === 'vespi-kernel'));
  assert.ok(index.documents.every((doc) => allowlist.some((entry) => doc.id === entry.id || doc.id.startsWith(`${entry.id}-`))));
  const text = `${JSON.stringify(index)}\n${(await Promise.all(files.map((file) => readFile(new URL(`data/content/${file}`, root), 'utf8')))).join('\n')}`;
  assert.doesNotMatch(text, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
  assert.doesNotMatch(text, /\b(?:sk-[A-Za-z0-9_-]{16,}|S[A-Z2-7]{55})\b/);
  assert.doesNotMatch(text, /\b(?:API[_-]?KEY|SECRET[_-]?KEY|ACCESS[_-]?TOKEN)\s*[:=]\s*['"]?[A-Za-z0-9_-]{12,}/i);
  assert.doesNotMatch(text, /C:\\Users\\|genealogia-afectiva/i);
  assert.doesNotMatch(text, /\b(?:\+?\d[ .()-]?){9,}\d\b/);
});

test('each allowlisted source still matches its pinned SHA-256', async () => {
  const allowlist = JSON.parse(await readFile(new URL('public-allowlist.json', root), 'utf8'));
  for (const entry of allowlist) {
    const source = await readFile(new URL(`../../../${entry.source}`, import.meta.url));
    assert.equal(createHash('sha256').update(source).digest('hex'), entry.sha256, entry.source);
  }
});

test('runtime code does not import process, network, or filesystem APIs outside the package reader and HTTP adapter', async () => {
  const files = ['src/protocol.mjs','src/data.mjs','src/tools.mjs','src/context.mjs','bin/lore-kit-mcp.mjs','api/mcp.js','vendor/receipt.cjs'];
  for (const file of files) {
    const text = await readFile(new URL(file, root), 'utf8');
    const imports = [...text.matchAll(/(?:from\s+|import\s*\(|require\s*\()(['"])(?:node:)?(child_process|net|http|fs(?:\/promises)?)\1/g)].map((match) => match[2]);
    assert.ok(!imports.some((name) => ['child_process','net'].includes(name)), file);
    assert.ok(!imports.includes('http') || file === 'api/mcp.js', file);
    assert.ok(!imports.some((name) => name.startsWith('fs')) || file === 'src/data.mjs', file);
  }
  const toolSource = await readFile(new URL('src/tools.mjs', root), 'utf8');
  assert.doesNotMatch(toolSource, /skills\/vespi\/core\/vespi\.mjs/);
  assert.doesNotMatch(toolSource, /\.\.\/\.\.\/\.\.\/skills/);
  const vendoredReceipt = await readFile(new URL('vendor/receipt.cjs', root));
  const kernelReceipt = await readFile(new URL('../../../skills/vespi/core/kernel/receipt.js', import.meta.url));
  assert.deepEqual(vendoredReceipt, kernelReceipt);
});

test('the JSON-RPC core is transport-neutral and receives document and tool access through its context', async () => {
  const source = await readFile(new URL('src/protocol.mjs', root), 'utf8');
  assert.doesNotMatch(source, /from ['"]\.\/(?:data|tools)\.mjs['"]/);
  assert.match(source, /ctx\.listDocuments/);
  assert.match(source, /ctx\.getDocument/);
  assert.match(source, /ctx\.callTool/);
});

test('the real stdio executable completes a protocol round trip', async () => {
  const { spawn } = await import('node:child_process');
  const child = spawn(process.execPath, [fileURLToPath(new URL('../bin/lore-kit-mcp.mjs', import.meta.url))], { stdio: ['pipe','pipe','pipe'] });
  const lines = [];
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => lines.push(chunk));
  child.stdin.write(`${JSON.stringify({ jsonrpc:'2.0', id:1, method:'initialize', params:{protocolVersion:'2025-06-18'} })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc:'2.0', method:'notifications/initialized' })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc:'2.0', id:2, method:'tools/call', params:{name:'kit_about',arguments:{}} })}\n`);
  child.stdin.end();
  await new Promise((resolve) => child.on('close', resolve));
  const output = lines.join('').trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  assert.equal(output[0].result.protocolVersion, '2025-06-18');
  assert.equal(output.length, 2);
  assert.ok(output[1].result.content[0].text);
});
