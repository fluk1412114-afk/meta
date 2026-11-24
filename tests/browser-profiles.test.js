import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { PROFILE_ROOT, getBrowserProfile, listBrowsers, resolveBrowser } from '../scripts/browser-profiles.js';

test('every registered browser has a distinct profile directory and port', () => {
  const browsers = listBrowsers();
  const profiles = browsers.map(item => getBrowserProfile(item.browser).profilePath);
  const ports = browsers.map(item => item.port);
  assert.equal(new Set(profiles).size, profiles.length);
  assert.equal(new Set(ports).size, ports.length);
  for (const profile of profiles) {
    assert.equal(path.dirname(profile), PROFILE_ROOT);
  }
});

test('Edge is the default browser preference', () => {
  assert.equal(getBrowserProfile().id, 'edge');
});

test('unsupported browser names are rejected instead of silently mapped', () => {
  assert.throws(() => getBrowserProfile('my-everyday-profile'), /Unsupported browser/);
  assert.throws(() => resolveBrowser('my-everyday-profile'), /Unsupported browser/);
});
