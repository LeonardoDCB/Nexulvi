'use strict';
// Preview do artefato real, na mesma base usada em produção.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../site.config');
const root = path.resolve(process.env.BUILD_OUTPUT || path.join(__dirname, '../dist'));
const base = new URL(process.env.SITE_URL || config.siteUrl).pathname;
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end(); return; }
  if (pathname === base.slice(0, -1) && base !== '/') { response.writeHead(301, { Location: base }); response.end(); return; }
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : null;
  const file = relative === null ? '' : path.resolve(root, relative + (pathname.endsWith('/') ? 'index.html' : ''));
  const valid = file && !path.relative(root, file).startsWith('..') && !path.isAbsolute(path.relative(root, file)) && fs.existsSync(file) && fs.statSync(file).isFile();
  const selected = valid ? file : path.join(root, '404.html');
  response.writeHead(valid ? 200 : 404, { 'Content-Type': types[path.extname(selected)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  if (request.method === 'HEAD') { response.end(); return; }
  fs.createReadStream(selected).on('error', () => response.destroy()).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}${base}`));
