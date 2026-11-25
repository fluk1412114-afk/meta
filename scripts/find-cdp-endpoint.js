// Backward-compatible lookup for the dedicated legacy Chrome profile.
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

export const META_AI_PROFILE = path.join(
  process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
  'MetaAI-CDP-Profile', 'chrome'
);

export async function findCdpEndpoint() {
  if (process.platform !== 'win32') {
    throw new Error('The legacy Chrome helper currently verifies the Windows profile only. Use Ghost Mode for cross-platform browser selection.');
  }
  const port = process.env.META_AI_CDP_PORT || '9223';
  const escaped = META_AI_PROFILE.replace(/'/g, "''");
  const ps = `$ErrorActionPreference='Stop'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -match '--remote-debugging-port=(\\d+)' -and $_.CommandLine -like '*${escaped}*' -and $_.CommandLine -notmatch '--type=' } | ForEach-Object { [regex]::Match($_.CommandLine, '--remote-debugging-port=(\\d+)').Groups[1].Value } | Sort-Object -Unique`;
  let output;
  try {
    output = execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], {
      encoding: 'utf8', windowsHide: true
    });
  } catch { throw new Error('Could not inspect Chrome processes safely.'); }
  const ports = [...new Set(output.split(/\r?\n/).map(value => value.trim()).filter(value => /^\d+$/.test(value)))];
  if (!ports.includes(String(port))) {
    throw new Error(`No dedicated Chrome profile found on port ${port}. Start Ghost Mode with node scripts/ghost-launcher.js --browser chrome.`);
  }
  const endpoint = `http://127.0.0.1:${port}`;
  const response = await fetch(`${endpoint}/json/version`).catch(() => null);
  if (!response?.ok) throw new Error('Dedicated Chrome CDP endpoint is not reachable.');
  const info = await response.json();
  if (!info.webSocketDebuggerUrl || new URL(info.webSocketDebuggerUrl).hostname !== '127.0.0.1') {
    throw new Error('Refusing a non-loopback CDP endpoint.');
  }
  return endpoint;
}
