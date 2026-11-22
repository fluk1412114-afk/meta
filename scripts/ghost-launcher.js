import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveBrowser, getProfileStatePath, listBrowsers } from './browser-profiles.js';

const __filename = fileURLToPath(import.meta.url);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const inline = args.find(value => value.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const has = flag => args.includes(flag);

async function chromiumReady(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.webSocketDebuggerUrl &&
      new URL(data.webSocketDebuggerUrl).hostname === '127.0.0.1');
  } catch { return false; }
}

function portIsBusy(port) {
  const result = spawnSync(process.execPath, ['-e',
    'const s=require("net").connect(Number(process.argv[1]),"127.0.0.1");s.on("connect",()=>{process.exit(0)});s.on("error",()=>process.exit(1));setTimeout(()=>process.exit(1),500)',
    String(port)], { stdio: 'ignore', windowsHide: true });
  return result.status === 0;
}

function writePid(state, pid) {
  fs.writeFileSync(state.pid, String(pid), { mode: 0o600 });
}

function startFirefoxWorker(browser, headed, port) {
  const state = getProfileStatePath(browser);
  const child = spawn(process.execPath, [__filename, '--worker', '--browser', browser.id,
    '--headed', String(headed), '--port', String(port)], {
    detached: true, stdio: 'ignore', windowsHide: true,
    env: { ...process.env, META_GHOST_PROFILE: browser.profilePath }
  });
  child.unref();
  writePid(state, child.pid);
  return state;
}

async function runFirefoxWorker() {
  const browserName = valueAfter('--browser', 'firefox');
  const port = Number(valueAfter('--port', '9226'));
  const headed = valueAfter('--headed', 'false') === 'true';
  const browser = resolveBrowser(browserName);
  if (browser.engine !== 'firefox' && browser.engine !== 'webkit') {
    throw new Error('Worker mode is reserved for Playwright Firefox/WebKit.');
  }
  const { firefox, webkit } = await import('playwright-core');
  const type = browser.engine === 'webkit' ? webkit : firefox;
  const state = getProfileStatePath(browser);
  const server = await type.launchServer({
    host: '127.0.0.1', port, headless: !headed,
    executablePath: browser.playwrightExecutablePath,
    args: browser.engine === 'firefox' ? ['-profile', browser.profilePath] : []
  });
  fs.writeFileSync(state.endpoint, server.wsEndpoint(), { mode: 0o600 });
  const shutdown = async () => {
    try { await server.close(); } finally {
      for (const file of [state.pid, state.endpoint]) {
        try { fs.unlinkSync(file); } catch {}
      }
      process.exit(0);
    }
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  await new Promise(() => {});
}

export async function launchGhost({ browser = 'chrome', headed = false, port } = {}) {
  const selected = resolveBrowser(browser);
  const actualPort = Number(port || selected.port);
  if (!Number.isInteger(actualPort) || actualPort < 1024 || actualPort > 65535) {
    throw new Error('CDP/Playwright port must be an integer from 1024 to 65535.');
  }
  if (portIsBusy(actualPort)) {
    if (selected.engine !== 'firefox' && selected.engine !== 'webkit' && await chromiumReady(actualPort)) {
      throw new Error(`Port ${actualPort} already has a debugging endpoint. Refusing to attach to an unknown browser/profile.`);
    }
    throw new Error(`Port ${actualPort} is already in use. Stop the process using it before launching Ghost Mode.`);
  }

  const state = getProfileStatePath(selected);
  fs.mkdirSync(selected.profilePath, { recursive: true });
  for (const file of [state.pid, state.endpoint]) {
    try { fs.unlinkSync(file); } catch {}
  }

  if (selected.engine === 'firefox' || selected.engine === 'webkit') {
    startFirefoxWorker(selected, headed, actualPort);
    for (let attempt = 0; attempt < 300; attempt++) {
      if (fs.existsSync(state.endpoint)) {
        const endpoint = fs.readFileSync(state.endpoint, 'utf8').trim();
        if (endpoint.startsWith('ws://127.0.0.1:')) {
          console.log(`Ghost Browser: ${selected.id} on http://127.0.0.1:${actualPort} (Playwright transport)`);
          return { browser: selected.id, port: actualPort, endpoint, profilePath: selected.profilePath };
        }
      }
      await sleep(100);
    }
    throw new Error(`Playwright ${selected.id} did not become ready. Inspect the worker process and profile.`);
  }

  const executableArgs = [
    '--remote-debugging-address=127.0.0.1',
    `--remote-debugging-port=${actualPort}`,
    `--user-data-dir=${selected.profilePath}`,
    '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-sync',
    '--disable-features=Translate'
  ];
  if (!headed) executableArgs.unshift('--headless=new');
  const child = spawn(selected.executablePath, executableArgs, {
    detached: true, stdio: 'ignore', windowsHide: true
  });
  child.unref();
  writePid(state, child.pid);
  for (let attempt = 0; attempt < 300; attempt++) {
    if (await chromiumReady(actualPort)) {
      console.log(`Ghost Browser: ${selected.id} on http://127.0.0.1:${actualPort}`);
      return { browser: selected.id, port: actualPort, endpoint: `http://127.0.0.1:${actualPort}`, profilePath: selected.profilePath };
    }
    await sleep(100);
  }
  throw new Error(`${selected.name} started but its local debugging endpoint did not become ready.`);
}

export async function stopGhost(browser = 'chrome') {
  const selected = resolveBrowser(browser);
  const state = getProfileStatePath(selected);
  if (!fs.existsSync(state.pid)) {
    console.log(`No Ghost process recorded for ${selected.id}.`);
    return false;
  }
  const pid = Number(fs.readFileSync(state.pid, 'utf8').trim());
  if (!Number.isInteger(pid) || pid <= 0) throw new Error('Invalid Ghost PID file; refusing to terminate an unknown process.');
  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    } else {
      process.kill(-pid, 'SIGTERM');
    }
  } catch (error) {
    if (error.code !== 'ESRCH' && error.status !== 128) throw error;
  }
  for (const file of [state.pid, state.endpoint]) {
    try { fs.unlinkSync(file); } catch {}
  }
  console.log(`Stopped Ghost Browser: ${selected.id}`);
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  (async () => {
    if (has('--worker')) return runFirefoxWorker();
    if (has('list-browsers')) {
      console.table(listBrowsers());
      return;
    }
    if (has('stop')) {
      await stopGhost(valueAfter('--browser', 'chrome'));
      return;
    }
    const browser = valueAfter('--browser', 'chrome');
    await launchGhost({ browser, headed: has('--headed'), port: valueAfter('--port', undefined) });
  })().catch(error => {
    console.error('GHOST_LAUNCH_FAILED:', error.message);
    process.exitCode = 1;
  });
}
