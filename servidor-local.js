const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = 4173;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

http.createServer((request, response) => {
  const requested = decodeURIComponent(request.url.split('?')[0]);
  const relative = requested === '/' ? '/index.html' : requested;
  const file = path.resolve(root, `.${relative}`);

  const relativeFile = path.relative(root, file);
  if (relativeFile.startsWith('..') || path.isAbsolute(relativeFile) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Nexulvi aberto em http://127.0.0.1:${port}`);
});
