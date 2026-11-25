import fs from 'node:fs';
import { resolveBrowser, getProfileStatePath } from './browser-profiles.js';
import { ensureGhost } from './ghost-launcher.js';
import { chromium, firefox, webkit } from 'playwright-core';

const BLOCKED_AUTH = /password|passcode|one[- ]time|otp|verification[- ]code|captcha|two[- ]factor|mfa/i;
const SENSITIVE_ACTION = /\b(post|publish|comment|share|message|send message|follow|purchase|buy|checkout|pay|payment|delete account|change password|account settings)\b/i;

export async function connectGhost({ browser = 'chrome' } = {}) {
  const ensured = await ensureGhost({ browser });
  const selected = resolveBrowser(ensured.browser);
  const state = getProfileStatePath(selected);
  let connected;
  if (selected.engine === 'firefox' || selected.engine === 'webkit') {
    if (!fs.existsSync(state.endpoint)) {
      throw new Error(`Ghost ${selected.id} is not running. Start it with node scripts/ghost-launcher.js --browser=${selected.id}.`);
    }
    const endpoint = fs.readFileSync(state.endpoint, 'utf8').trim();
    if (!endpoint.startsWith('ws://127.0.0.1:')) throw new Error('Refusing a non-loopback Playwright endpoint.');
    connected = await (selected.engine === 'webkit' ? webkit : firefox).connect(endpoint);
  } else {
    const endpoint = `http://127.0.0.1:${selected.port}`;
    const response = await fetch(`${endpoint}/json/version`);
    if (!response.ok) throw new Error(`Ghost ${selected.id} CDP endpoint is unavailable.`);
    const info = await response.json();
    if (!info.webSocketDebuggerUrl || new URL(info.webSocketDebuggerUrl).hostname !== '127.0.0.1') {
      throw new Error('Refusing a CDP endpoint that is not bound to 127.0.0.1.');
    }
    connected = await chromium.connectOverCDP(endpoint);
  }

  const context = connected.contexts()[0] || await connected.newContext();
  const pages = context.pages();
  const page = pages.find(item => {
    try { return new URL(item.url()).hostname === 'www.meta.ai' || new URL(item.url()).hostname === 'meta.ai'; }
    catch { return false; }
  }) || pages[0] || await context.newPage();

  return { browser: connected, context, page, selectedBrowser: selected.id, profilePath: selected.profilePath };
}

export async function safeFill(locator, value) {
  const metadata = await locator.evaluate(element => ({
    tag: element.tagName,
    type: element.getAttribute('type') || '',
    name: element.getAttribute('name') || '',
    autocomplete: element.getAttribute('autocomplete') || '',
    placeholder: element.getAttribute('placeholder') || '',
    aria: element.getAttribute('aria-label') || ''
  }));
  const identity = Object.values(metadata).join(' ');
  if (metadata.type.toLowerCase() === 'password' || BLOCKED_AUTH.test(identity)) {
    throw new Error('Ghost Mode never fills passwords, OTP/MFA codes, CAPTCHA, or verification fields. Complete sign-in manually.');
  }
  await locator.fill(String(value));
}

export async function safeClick(locator, { confirmed = false } = {}) {
  const details = await locator.evaluate(element => ({
    text: (element.innerText || element.textContent || '').slice(0, 300),
    aria: element.getAttribute('aria-label') || '',
    title: element.getAttribute('title') || '',
    href: element.getAttribute('href') || '',
    type: element.getAttribute('type') || ''
  }));
  const identity = Object.values(details).join(' ');
  if (SENSITIVE_ACTION.test(identity) && !confirmed) {
    throw new Error('This action may publish, message, purchase, or change an account. Obtain explicit confirmation in chat, then pass { confirmed: true }.');
  }
  await locator.click();
}

export async function waitForMetaAI(page, { timeout = 45000, navigate = true } = {}) {
  let hostname = '';
  try { hostname = new URL(page.url()).hostname.toLowerCase(); } catch {}
  if (navigate && hostname !== 'meta.ai' && !hostname.endsWith('.meta.ai')) {
    await page.goto('https://www.meta.ai/', { waitUntil: 'domcontentloaded', timeout });
  }
  await page.waitForURL(url => url.hostname === 'meta.ai' || url.hostname.endsWith('.meta.ai'), { timeout });
  return page;
}
