import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';

const port = Number(process.env.PORT || 4174);
const root = resolve('dist');
const cache = new Map();
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml' };
async function report(kind, ids) {
  const url = `https://aviationweather.gov/api/data/${kind}?ids=${ids}&format=json`;
  const response = await fetch(url, { headers: { 'User-Agent':'NavLog/0.2 (aviation planning prototype)' }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`${kind} upstream ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`${kind} invalid upstream response`);
  const item = data.find(value => value.icaoId === ids || value.id === ids) || data[0];
  if (!item || !(kind === 'metar' ? item.rawOb : item.rawTAF)) return null;
  const time = kind === 'metar' ? item.obsTime : item.issueTime;
  return { raw: kind === 'metar' ? item.rawOb : item.rawTAF, time: typeof time === 'number' ? new Date(time * 1000).toISOString() : time || null };
}
export async function weather(ids) {
  if (!/^[A-Z0-9]{4}$/.test(ids)) throw new Error('Enter a four character airport code');
  const cached = cache.get(ids);
  if (cached && Date.now() - cached.at < 5 * 60_000) return cached.value;
  const [metar, taf] = await Promise.allSettled([report('metar', ids), report('taf', ids)]);
  const failures = [metar, taf].filter(result => result.status === 'rejected');
  const value = { metar: metar.status === 'fulfilled' ? metar.value : null, taf: taf.status === 'fulfilled' ? taf.value : null, fetchedAt: new Date().toISOString(), ...(failures.length ? { error: failures.map(result => result.reason.message).join('; ') } : {}) };
  if (!failures.length) cache.set(ids, { at: Date.now(), value });
  return value;
}
if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  http.createServer(async (req,res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify({ service:'navlog-weather', status:'ok' })); return;
      }
      if (url.pathname === '/api/weather') {
        const ids = (url.searchParams.get('ids') || '').toUpperCase();
        const value = await weather(ids);
        res.writeHead(200, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(value)); return;
      }
      const path = resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!path.startsWith(root + '/') && path !== root) { res.writeHead(403); res.end(); return; }
      let target = path;
      try { if (!(await stat(target)).isFile()) target = join(root,'index.html'); } catch { target = join(root,'index.html'); }
      res.writeHead(200, { 'Content-Type':types[extname(target)] || 'application/octet-stream' }); res.end(await readFile(target));
    } catch (error) { res.writeHead(502, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify({ error: error.message })); }
  }).listen(port, () => console.log(`NavLog listening on http://localhost:${port}`));
}
