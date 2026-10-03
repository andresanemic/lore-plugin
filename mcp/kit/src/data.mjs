import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const DATA_DIR = fileURLToPath(new URL('../data/', import.meta.url));
const index = JSON.parse(await readFile(join(DATA_DIR, 'index.json'), 'utf8'));
const byId = new Map(index.documents.map((doc) => [doc.id, doc]));
const contentById = new Map(await Promise.all(index.documents.map(async (doc) => [doc.id, await readFile(join(DATA_DIR, doc.file), 'utf8')])));

export function listDocuments() { return index.documents.map((doc) => ({ ...doc })); }
export function getDocument(id) {
  if (typeof id !== 'string' || id.length > 160) return null;
  const doc = byId.get(id);
  if (!doc) return null;
  return { ...doc, text: contentById.get(id) };
}
export function packageVersion() { return index.packageVersion; }
export function builtAt() { return index.builtAt; }
