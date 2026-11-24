import fs from 'node:fs';
import { resolveBrowser, getProfileStatePath, isManagedGhostProcess } from './browser-profiles.js';

// Compatibility helper: returns only the endpoint recorded for a managed Ghost process.
export async function findCdpEndpoint(browserName = 'edge') {
  const browser = resolveBrowser(browserName);
  if (browser.engine === 'firefox' || browser.engine === 'webkit') {
    throw new Error(`${browser.id} uses Playwright browser-server transport, not CDP.`);
  }
  const state = getProfileStatePath(browser);
  if (!fs.existsSync(state.pid) || !fs.existsSync(state.endpoint)) {
    throw new Error(`Ghost ${browser.id} is not running. Start it with node scripts/ghost-launcher.js --browser ${browser.id}.`);
  }
  const pid = Number(fs.readFileSync(state.pid, 'utf8').trim());
  if (!isManagedGhostProcess(pid, browser)) {
    throw new Error('The recorded process does not belong to the selected isolated profile.');
  }
  const endpoint = fs.readFileSync(state.endpoint, 'utf8').trim();
  const expected = `http://127.0.0.1:${browser.port}`;
  if (endpoint !== expected) throw new Error('The recorded endpoint does not match this browser.');
  const response = await fetch(`${endpoint}/json/version`);
  if (!response.ok) throw new Error('The managed Ghost endpoint is unavailable.');
  const info = await response.json();
  if (!info.webSocketDebuggerUrl || new URL(info.webSocketDebuggerUrl).hostname !== '127.0.0.1') {
    throw new Error('Refusing a browser endpoint that is not bound to 127.0.0.1.');
  }
  return endpoint;
}
