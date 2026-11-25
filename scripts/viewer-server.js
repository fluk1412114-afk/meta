import http from 'node:http';
import { connectGhost } from './ghost-controller.js';

const args = process.argv.slice(2);
const arg = name => {
  const inline = args.find(value => value.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const browserName = arg('--browser') || 'chrome';
const port = Number(arg('--port') || 9229);
const HOST = '127.0.0.1';
const clients = new Set();
let current = { browser: browserName, url: 'about:blank', status: 'starting' };
let cdpSession;
let screenshotTimer;
let browserConnection;
let page;
let captureActive = false;
let screenshotBusy = false;

function broadcastFrame(buffer) {
  const frame = Buffer.from(buffer);
  const header = Buffer.from(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
  for (const response of clients) {
    try { response.write(header); response.write(frame); response.write('\r\n'); }
    catch { clients.delete(response); }
  }
}

const html = `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meta Ghost Viewer</title>
<style>
body{margin:0;background:#111827;color:#e5e7eb;font:14px system-ui}header{padding:12px 18px;background:#1f2937;display:flex;gap:24px;flex-wrap:wrap}main{padding:12px}img{display:block;max-width:100%;max-height:calc(100vh - 90px);margin:auto;background:#030712}small{color:#9ca3af}
</style>
<header><span>Browser: <b id="browser">connecting</b></span><span>URL: <b id="url">—</b></span><span>Status: <b id="status">starting</b></span><small>Read-only viewer · 127.0.0.1 only</small></header>
<main><img src="/stream" alt="Live browser screenshot"></main>
<script>
async function refresh(){try{const r=await fetch('/status');const s=await r.json();document.getElementById('browser').textContent=s.browser;document.getElementById('url').textContent=s.url;document.getElementById('status').textContent=s.status}catch(e){document.getElementById('status').textContent='disconnected'}}
refresh();setInterval(refresh,1000);
</script></html>`;

async function start() {
  browserConnection = await connectGhost({ browser: browserName });
  page = browserConnection.page;
  current = { browser: browserConnection.selectedBrowser, url: page.url(), status: 'connected · waiting for viewer' };
  page.on('framenavigated', () => { current.url = page.url(); });
}

async function startCapture() {
  if (captureActive || !browserConnection || clients.size === 0) return;
  captureActive = true;
  current.status = 'streaming';
  if (browserConnection.selectedBrowser === 'firefox' || browserConnection.selectedBrowser === 'webkit') {
    screenshotTimer = setInterval(async () => {
      if (screenshotBusy || clients.size === 0) return;
      screenshotBusy = true;
      try { broadcastFrame(await page.screenshot({ type: 'jpeg', quality: 60 })); current.url = page.url(); }
      catch { current.status = 'screenshot unavailable'; }
      finally { screenshotBusy = false; }
    }, 1200);
    return;
  }
  cdpSession = await browserConnection.context.newCDPSession(page);
  cdpSession.on('Page.screencastFrame', async event => {
    if (clients.size) broadcastFrame(Buffer.from(event.data, 'base64'));
    try { await cdpSession.send('Page.screencastFrameAck', { sessionId: event.sessionId }); } catch {}
    current.url = page.url();
  });
  await cdpSession.send('Page.startScreencast', {
    format: 'jpeg', quality: 60, maxWidth: 1280, maxHeight: 800, everyNthFrame: 2
  });
}

async function stopCapture() {
  if (!captureActive || clients.size > 0) return;
  captureActive = false;
  clearInterval(screenshotTimer);
  screenshotTimer = undefined;
  try {
    if (cdpSession) {
      await cdpSession.send('Page.stopScreencast');
      await cdpSession.detach();
    }
  } catch {}
  cdpSession = undefined;
  current.status = 'connected · viewer idle';
}

const server = http.createServer((request, response) => {
  if (request.url === '/' || request.url === '/viewer') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    response.end(html);
    return;
  }
  if (request.url === '/status') {
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
    response.end(JSON.stringify(current));
    return;
  }
  if (request.url === '/stream') {
    response.writeHead(200, {
      'content-type': 'multipart/x-mixed-replace; boundary=frame',
      'cache-control': 'no-store', connection: 'keep-alive'
    });
    clients.add(response);
    void startCapture().catch(error => { current.status = `capture error: ${error.message}`; });
    request.on('close', () => {
      clients.delete(response);
      if (clients.size === 0) void stopCapture();
    });
    return;
  }
  response.writeHead(404); response.end('Not found');
});

server.listen(port, HOST, async () => {
  try {
    await start();
    console.log(`Ghost Viewer: http://${HOST}:${port}/viewer`);
  } catch (error) {
    current.status = `error: ${error.message}`;
    console.error('GHOST_VIEWER_FAILED:', error.message);
  }
});

async function shutdown() {
  clearInterval(screenshotTimer);
  try { if (cdpSession) { await cdpSession.send('Page.stopScreencast').catch(() => {}); await cdpSession.detach(); } } catch {}
  for (const response of clients) response.end();
  clients.clear();
  server.close();
  await stopCapture();
  // Viewer is an observer: disconnecting it must not terminate a shared Ghost Browser session.
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
