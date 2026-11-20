// Discover only the dedicated Meta AI Chrome profile; never attach to everyday Chrome.
const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');
const PROFILE = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'MetaAI-CDP-Profile');
async function findCdpEndpoint() {
  const port = process.env.META_AI_CDP_PORT || '9222';
  if (process.platform !== 'win32') throw new Error('This helper currently verifies the dedicated Windows Chrome profile only.');
  const ps = "$ErrorActionPreference='Stop'; Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { $_.CommandLine -match '--remote-debugging-port=(\\d+)' -and $_.CommandLine -like '*MetaAI-CDP-Profile*' -and $_.CommandLine -notmatch '--type=' } | ForEach-Object { [regex]::Match($_.CommandLine, '--remote-debugging-port=(\\d+)').Groups[1].Value } | Sort-Object -Unique";
  let output;
  try { output = execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8', windowsHide: true }); }
  catch { throw new Error('Could not inspect Chrome processes safely.'); }
  const ports = [...new Set(output.split(/\r?\n/).map((x) => x.trim()).filter((x) => /^\d+$/.test(x)))];
  if (!ports.includes(String(port))) throw new Error(`No CDP process found for the dedicated Meta AI profile on port ${port}. Run node scripts/launch-meta-cdp.js; do not attach to another Chrome profile.`);
  const endpoint = `http://127.0.0.1:${port}`;
  let response;
  try { response = await fetch(endpoint + '/json/version'); } catch { throw new Error('Dedicated Chrome CDP endpoint is not reachable.'); }
  if (!response.ok) throw new Error('Dedicated Chrome CDP endpoint is unavailable.');
  return endpoint;
}
module.exports = { findCdpEndpoint, META_AI_PROFILE: PROFILE };
