import test from 'node:test';
import assert from 'node:assert/strict';
import { safeFill, safeClick } from '../scripts/ghost-controller.js';

function fakeLocator({ text = '', aria = '', title = '', href = '', type = '', name = '', autocomplete = '', placeholder = '' } = {}) {
  const calls = { fill: [], click: 0 };
  const element = {
    tagName: 'INPUT',
    getAttribute(key) {
      return ({ type, name, autocomplete, placeholder, 'aria-label': aria, title, href })[key] || '';
    },
    get innerText() { return text; },
    get textContent() { return text; }
  };
  return {
    calls,
    async evaluate(fn) { return fn(element); },
    async fill(value) { calls.fill.push(value); },
    async click() { calls.click += 1; }
  };
}

test('safeFill allows ordinary prompt fields', async () => {
  const locator = fakeLocator({ name: 'prompt', placeholder: 'Ask Meta AI' });
  await safeFill(locator, 'A landscape at sunrise');
  assert.deepEqual(locator.calls.fill, ['A landscape at sunrise']);
});

test('safeFill blocks password, OTP, and CAPTCHA fields', async () => {
  for (const metadata of [
    { type: 'password' },
    { name: 'otp_code' },
    { placeholder: 'Enter CAPTCHA' },
    { autocomplete: 'one-time-code' }
  ]) {
    const locator = fakeLocator(metadata);
    await assert.rejects(() => safeFill(locator, 'secret'), /never fills passwords/);
    assert.equal(locator.calls.fill.length, 0);
  }
});

test('safeClick blocks consequential actions without explicit confirmation', async () => {
  const locator = fakeLocator({ text: 'Publish post' });
  await assert.rejects(() => safeClick(locator), /explicit confirmation/);
  assert.equal(locator.calls.click, 0);
});

test('safeClick permits a consequential action only with confirmation', async () => {
  const locator = fakeLocator({ aria: 'Send message' });
  await safeClick(locator, { confirmed: true });
  assert.equal(locator.calls.click, 1);
});

test('safeClick permits ordinary navigation and controls', async () => {
  const locator = fakeLocator({ text: 'Open settings' });
  await safeClick(locator);
  assert.equal(locator.calls.click, 1);
});
