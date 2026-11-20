// Launch or reuse Meta AI's dedicated persistent Chrome CDP profile.
// First run opens Chrome for the user to sign in manually; later runs reuse that profile.
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const PROFILE = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'MetaAI-CDP-Profile');
const PORT = Number(process.env.META_AI_CDP_PORT || 9222);
const ENDPOINT = `http://127.0.0.1:${PORT}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function chromePath() {
  const candidates = [process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe'), process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'), process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}
function matchingProcesses() {
  const ps = "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Select-Object -ExpandProperty CommandLine";
  try { return execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8', windowsHide: true }).split(/\\r?\\n/).filter(Boolean); }
  catch { throw new Error('Cannot inspect Chrome processes safely; refusing to launch another instance.'); }
}
async function ready() {
  try { const r = await fetch(`${ENDPOINT}/json/version`); return r.ok; } catch { return false; }
}
(async () => {
  const processes = matchingProcesses();
  const sameProfile = processes.some((line) => line.toLowerCase().includes(PROFILE.toLowerCase()));
  if (await ready()) {
    if (!sameProfile) throw new Error('Port is active but does not belong to the dedicated Meta AI profile. Refusing to attach to the user’s everyday Chrome.');
    console.log('CDP_READY:', ENDPOINT); console.log('PROFILE:', PROFILE); return;
  }
  if (sameProfile) throw new Error('The dedicated profile is already running but its CDP endpoint is unavailable. Do not start a second Chrome; inspect the existing process/port.');
  const profileArg = `--user-data-dir=${PROFILE}`;
  const chrome = chromePath();
  if (!chrome) throw new Error('Chrome executable not found in standard installation paths. No browser was launched.');
  fs.mkdirSync(PROFILE, { recursive: true });
  const args = [`--remote-debugging-port=${PORT}`, profileArg, '--no-first-run', '--no-default-browser-check', 'https://www.meta.ai/'];
  const child = spawn(chrome, args, { detached: true, stdio: 'ignore', windowsHide: false });
  child.unref();
  for (let i = 0; i < 30; i++) { if (await ready()) { console.log('CDP_READY:', ENDPOINT); console.log('PROFILE:', PROFILE); console.log('FIRST_RUN_LOGIN:', 'If Meta asks, complete sign-in manually in this Chrome window.'); return; } await sleep(1000); }
  throw new Error('Chrome was started but CDP did not become ready within 30 seconds. Do not start another instance.');
})().catch((error) => { console.error('META_CDP_LAUNCH_FAILED:', error.message); process.exitCode = 1; });
