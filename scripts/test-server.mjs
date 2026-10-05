import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// Lokaler Testserver; wird ausschließlich von den Browser-Tests gestartet.
const root = resolve(import.meta.dirname, '..');
const types = { '.css':'text/css', '.js':'text/javascript', '.html':'text/html', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.mp4':'video/mp4' };
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    const file = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + sep)) throw new Error('Invalid path');
    const bytes = await readFile(file);
    response.writeHead(200, { 'Content-Type':types[extname(file)] || 'application/octet-stream' });
    response.end(bytes);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(3199, '127.0.0.1');
