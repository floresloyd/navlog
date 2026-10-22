import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const children = [];
let shuttingDown = false;
function stop(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
  process.exitCode = code;
}
function start(label, file, args = []) {
  const child = spawn(process.execPath, [file, ...args], { stdio: 'inherit', env: process.env });
  children.push(child);
  child.on('exit', code => {
    if (!shuttingDown) { console.error(`${label} stopped (${code ?? 'signal'}).`); stop(code || 1); }
  });
  return child;
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
start('Weather API', 'server/weather.mjs');
let ready = false;
for (let attempt = 0; attempt < 40 && !shuttingDown; attempt++) {
  try {
    const response = await fetch('http://127.0.0.1:4174/api/health', { signal: AbortSignal.timeout(500) });
    const data = await response.json();
    if (response.ok && data.service === 'navlog-weather') { ready = true; break; }
  } catch { /* Wait for the weather server to start. */ }
  await delay(100);
}
if (!ready) { console.error('Weather API did not start on port 4174.'); stop(1); }
else start('Vite', 'node_modules/vite/bin/vite.js', ['--strictPort']);
