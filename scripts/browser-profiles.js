import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { firefox, webkit } from 'playwright-core';

const platform = process.platform;
const localBase = process.env.LOCALAPPDATA ||
  (platform === 'win32' ? path.join(os.homedir(), 'AppData', 'Local') :
    platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support') :
      process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'));
export const PROFILE_ROOT = path.join(localBase, 'MetaAI-Ghost-Profile');

const winRoots = [
  process.env.PROGRAMFILES,
  process.env['PROGRAMFILES(X86)'],
  process.env.LOCALAPPDATA
].filter(Boolean);

const definitions = {
  chrome: {
    name: 'Chrome', executable: 'chrome.exe', port: 9223, channel: 'chrome',
    win: winRoots.map(root => path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe')),
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      path.join(os.homedir(), 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome')],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium', '/usr/bin/chromium-browser']
  },
  edge: {
    name: 'Edge', executable: 'msedge.exe', port: 9224, channel: 'msedge',
    win: winRoots.map(root => path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe')),
    darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      path.join(os.homedir(), 'Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge')],
    linux: ['/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable']
  },
  brave: {
    name: 'Brave', executable: 'brave.exe', port: 9225, channel: 'chrome',
    win: winRoots.map(root => path.join(root, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe')),
    darwin: ['/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      path.join(os.homedir(), 'Applications/Brave Browser.app/Contents/MacOS/Brave Browser')],
    linux: ['/usr/bin/brave-browser', '/usr/bin/brave']
  },
  firefox: {
    name: 'Firefox', executable: 'firefox.exe', port: 9226, engine: 'firefox',
    win: [
      ...winRoots.map(root => path.join(root, 'Mozilla Firefox', 'firefox.exe')),
      path.join(process.env.LOCALAPPDATA || '', 'Mozilla Firefox', 'firefox.exe')
    ],
    darwin: ['/Applications/Firefox.app/Contents/MacOS/firefox',
      path.join(os.homedir(), 'Applications/Firefox.app/Contents/MacOS/firefox')],
    linux: ['/usr/bin/firefox', '/usr/bin/firefox-esr']
  },
  webkit: {
    name: 'WebKit (experimental)', executable: null, port: 9227, engine: 'webkit',
    experimental: true, macOSOnly: true
  }
};

function findOnPath(command) {
  const lookup = platform === 'win32' ? 'where.exe' : 'which';
  try {
    const output = execFileSync(lookup, [command], { encoding: 'utf8', windowsHide: true });
    return output.split(/\r?\n/).map(item => item.trim()).find(Boolean) || null;
  } catch {
    return null;
  }
}

function playwrightExecutable(engine) {
  try {
    return (engine === 'webkit' ? webkit : firefox).executablePath();
  } catch {
    return null;
  }
}

export function getBrowserProfile(name = 'edge') {
  const key = String(name || 'edge').toLowerCase();
  const definition = definitions[key];
  if (!definition) throw new Error(`Unsupported browser "${key}". Choose: ${Object.keys(definitions).join(', ')}.`);
  if (definition.macOSOnly && platform !== 'darwin') {
    return { ...definition, id: key, installed: false, reason: 'WebKit is experimental and macOS-only.' };
  }
  let executablePath = null;
  if (definition.executable) {
    const candidates = platform === 'win32' ? definition.win :
      platform === 'darwin' ? definition.darwin : definition.linux;
    executablePath = candidates.find(candidate => candidate && fs.existsSync(candidate)) ||
      findOnPath(definition.executable.replace(/\.exe$/i, ''));
  }
  const playwrightExecutablePath = definition.engine ? playwrightExecutable(definition.engine) : null;
  const engineInstalled = !definition.engine ||
    Boolean(playwrightExecutablePath && fs.existsSync(playwrightExecutablePath));
  const installed = definition.engine === 'webkit'
    ? platform === 'darwin' && engineInstalled
    : Boolean(executablePath && engineInstalled);
  return {
    ...definition, id: key, executablePath, playwrightExecutablePath, installed,
    profilePath: path.join(PROFILE_ROOT, key),
    reason: definition.engine && !engineInstalled
      ? `Install the Playwright ${definition.engine} browser with npx playwright-core install ${definition.engine}.`
      : null
  };
}

export function listBrowsers() {
  return Object.keys(definitions).map(name => {
    const item = getBrowserProfile(name);
    return {
      browser: item.id, name: item.name, installed: item.installed,
      executablePath: item.executablePath || null, port: item.port,
      channel: item.channel || null, experimental: Boolean(item.experimental),
      reason: item.reason || null
    };
  });
}

export function resolveBrowser(requested = 'edge') {
  const requestedKey = String(requested || 'edge').toLowerCase();
  const selected = getBrowserProfile(requestedKey);
  if (selected.installed) return { ...selected, requested: requestedKey, fallback: false };
  const order = ['edge', 'chrome', 'brave', 'firefox'];
  for (const key of order) {
    const candidate = getBrowserProfile(key);
    if (candidate.installed) {
      return { ...candidate, requested: requestedKey, fallback: true };
    }
  }
  throw new Error('No supported installed browser found. Install Microsoft Edge, Chrome, Brave, or Firefox.');
}

export function getProfileStatePath(browser) {
  const item = typeof browser === 'string' ? getBrowserProfile(browser) : browser;
  fs.mkdirSync(item.profilePath, { recursive: true });
  return {
    pid: path.join(item.profilePath, '.ghost.pid'),
    endpoint: path.join(item.profilePath, '.ghost-endpoint')
  };
}
