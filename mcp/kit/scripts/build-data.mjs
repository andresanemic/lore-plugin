import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WORKTREE = resolve(ROOT, '../..');
const ALLOWLIST = join(ROOT, 'public-allowlist.json');
const DATA = join(ROOT, 'data');
const allowlist = JSON.parse(await readFile(ALLOWLIST, 'utf8'));
const sensitive = [
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,
  /\b(?:sk-[A-Za-z0-9_-]{16,}|S[A-Z2-7]{55})\b/g,
  /\b(?:API[_-]?KEY|SECRET[_-]?KEY|ACCESS[_-]?TOKEN)\s*[:=]\s*['"]?[A-Za-z0-9_-]{12,}/gi,
  /C:\\Users\\[^\s"'<>]+/gi,
  /genealogia-afectiva/gi,
  /\b(?:\+?\d[ .()-]?){9,}\d\b/g
];
// --refresh: after you REVIEW a change to an allowlisted source, re-pin its hash and rebuild (new sources are never added by this flag).
const refresh = process.argv.includes('--refresh');
const changed = [];
const docs = [];
const content = [];
const safe = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
for (const item of allowlist) {
  const source = resolve(WORKTREE, item.source);
  if (!source.startsWith(`${WORKTREE}${process.platform === 'win32' ? '\\' : '/'}`)) throw new Error(`source escapes worktree: ${item.source}`);
  const original = await readFile(source, 'utf8');
  const sha256 = createHash('sha256').update(original).digest('hex');
  if (sha256 !== item.sha256) {
    if (!refresh) throw new Error(`SHA-256 changed for ${item.source}; review the change, then run: node mcp/kit/scripts/build-data.mjs --refresh`);
    item.sha256 = sha256;
    changed.push(item.source);
  }
  const text = original.replace(sensitive[0], '[public contact omitted]').replace(sensitive[1], '[secret-like string omitted]').replace(sensitive[2], '[secret-like assignment omitted]').replace(sensitive[3], '[local path omitted]').replace(sensitive[4], '[private folder name omitted]').replace(sensitive[5], '[phone-like string omitted]');
  const sections = item.type === 'reference' ? splitSections(text) : [{ title: item.title, text }];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const id = item.type === 'reference' ? `${item.id}-${String(i + 1).padStart(3, '0')}-${safe(section.title)}` : item.id;
    const file = `content/${id}.md`;
    const data = { id, type: item.type, lang: item.lang, title: section.title, path: item.path, sha256, contentSha256: createHash('sha256').update(section.text, 'utf8').digest('hex'), file };
    docs.push(data); content.push([file, section.text]);
  }
}
if (changed.length) {
  await writeFile(ALLOWLIST, `${JSON.stringify(allowlist, null, 2)}
`, 'utf8');
  console.log(`Re-pinned ${changed.length} reviewed source(s): ${changed.join(', ')}`);
}
const all = content.map(([, text]) => text).join('\n');
for (const pattern of sensitive) { pattern.lastIndex = 0; if (pattern.test(all)) throw new Error(`privacy scan found a sensitive pattern (${pattern})`); }
await rm(DATA, { recursive: true, force: true });
await mkdir(join(DATA, 'content'), { recursive: true });
for (const [file, text] of content) await writeFile(join(DATA, file), text, 'utf8');
await writeFile(join(DATA, 'index.json'), `${JSON.stringify({ packageVersion: '0.1.0', builtAt: new Date().toISOString(), documents: docs }, null, 2)}\n`, 'utf8');
console.log(`Built ${docs.length} public documents; privacy scan passed.`);

function splitSections(text) {
  const headings = [...text.matchAll(/^#{1,6} .+$/gm)];
  if (!headings.length) return [{ title: 'Reference', text }];
  return headings.map((match, index) => ({
    title: match[0].replace(/^#+\s*/, ''),
    text: text.slice(match.index, headings[index + 1]?.index ?? undefined)
  }));
}
