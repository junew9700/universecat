const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, requested);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    const target = !statError && stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(target, (readError, content) => {
      if (readError) {
        res.writeHead(readError.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(readError.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
        return;
      }
      res.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(target).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(content);
    });
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Universe Cat is available at http://localhost:${port}`);
});
