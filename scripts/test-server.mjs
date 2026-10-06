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
    const headers = { 'Content-Type':types[extname(file)] || 'application/octet-stream', 'Accept-Ranges':'bytes', 'Content-Length':bytes.length };
    // Video-Scrubbing benötigt Teilanfragen wie auf dem echten Webserver.
    if (request.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      const start = range?.[1] ? Number(range[1]) : Math.max(0, bytes.length - Number(range?.[2]));
      const end = range?.[1] && range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      if (!range || (!range[1] && !range[2]) || start > end || start >= bytes.length) {
        response.writeHead(416, { 'Content-Range':`bytes */${bytes.length}` });
        return response.end();
      }
      response.writeHead(206, { ...headers, 'Content-Range':`bytes ${start}-${end}/${bytes.length}`, 'Content-Length':end - start + 1 });
      return response.end(request.method === 'HEAD' ? undefined : bytes.subarray(start, end + 1));
    }
    response.writeHead(200, headers);
    if (request.method === 'HEAD') return response.end();
    response.end(bytes);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(3199, '127.0.0.1');
