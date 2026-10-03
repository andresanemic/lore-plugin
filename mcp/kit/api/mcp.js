import { handleMessage } from '../src/protocol.mjs';
import { createContext } from '../src/context.mjs';

const context = createContext();

export default async function handler(req, res) {
  if (req.method === 'GET') { res.statusCode = 405; res.setHeader('Allow', 'POST'); res.end('Method Not Allowed'); return; }
  if (req.method !== 'POST' || new URL(req.url ?? '/mcp', 'http://localhost').pathname !== '/mcp') { res.statusCode = 404; res.end('Not Found'); return; }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  let body = req.body;
  if (body === undefined) {
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 1024 * 1024) { res.statusCode = 413; res.end(JSON.stringify({ error: 'Message exceeds the 1 MiB limit' })); return; } chunks.push(chunk); }
    body = Buffer.concat(chunks).toString('utf8');
  }
  const response = await handleMessage(body, context);
  res.statusCode = 200;
  res.end(JSON.stringify(response));
}
