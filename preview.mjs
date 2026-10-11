// Browser-only preview of the actual bundled extension UI. Never included in dist.
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
if (!existsSync('dist/popup.js')) {
  const result = spawnSync(process.execPath, ['build.mjs'], { stdio: 'inherit' });
  if (result.status) process.exit(result.status);
}
const portFlag = process.argv.indexOf('--port');
const port = portFlag >= 0 ? Number(process.argv[portFlag + 1]) : 4173;
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://terminal.local');
  let path = url.pathname === '/' ? '/popup.html' : url.pathname;
  if (path === '/preview-fixture.js') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(readFileSync('preview-fixture.js')); return;
  }
  if (path === '/_favicon/') {
    const host = (() => { try { return new URL(url.searchParams.get('pageUrl')).hostname; } catch { return ''; } })();
    const brands = { 'github.com': 'github-logo', 'google.com': 'google-logo', 'youtube.com': 'youtube-logo', 'spotify.com': 'spotify-logo', 'open.spotify.com': 'spotify-logo', 'stackoverflow.com': 'stack-overflow-logo', 'figma.com': 'figma-logo', 'notion.so': 'notion-logo' };
    path = `/icons/ui/${brands[host] || 'globe'}.svg`;
  }
  const file = resolve(root, '.' + path);
  if (!file.startsWith(root + '/') || !existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
  if (extname(file) === '.html') {
    let html = readFileSync(file, 'utf8');
    html = html.replace('<head>', '<head><script src="/preview-fixture.js"></script>');
    res.end(html);
  } else res.end(readFileSync(file));
}).listen(port, '0.0.0.0', () => console.log(`Extension UI preview on port ${port}; browser APIs and data are simulated.`));
