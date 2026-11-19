// Diagnostic helper for the dedicated Meta AI Chrome CDP profile only.
// Usage: node scripts/connect-meta-ai.js
// Requires: npm install playwright
// This script does not read or export cookies, storage, credentials, tab titles, or URLs.

const { chromium } = require('playwright');
const { findCdpEndpoint } = require('./find-cdp-endpoint');

(async () => {
  let browser;

  try {
    // Resolve and validate the dedicated localhost endpoint; never accept a caller-supplied URL.
    const endpoint = await findCdpEndpoint();
    const parsedEndpoint = new URL(endpoint);
    if (
      parsedEndpoint.protocol !== 'http:' ||
      !['127.0.0.1', 'localhost', '[::1]'].includes(parsedEndpoint.hostname)
    ) {
      throw new Error('Refusing a non-local Chrome CDP endpoint.');
    }

    browser = await chromium.connectOverCDP(endpoint);
    const contexts = browser.contexts();
    const pages = contexts.flatMap((context) => context.pages());
    console.log('Connected to the dedicated local Chrome CDP profile.');
    console.log(`Contexts: ${contexts.length}; tabs: ${pages.length}`);

    const metaTab = pages.some((page) => {
      try {
        const hostname = new URL(page.url()).hostname.toLowerCase();
        return hostname === 'meta.ai' || hostname.endsWith('.meta.ai');
      } catch {
        return false;
      }
    });

    console.log(metaTab
      ? 'Meta AI tab detected. Ready for an explicitly requested workflow.'
      : 'No Meta AI tab detected. Open Meta AI in this dedicated Chrome session first.');
  } catch (error) {
    console.error('Could not connect to the dedicated local Meta AI Chrome profile.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    // Disconnect the Playwright client; do not close the user's Chrome.
    if (browser) await browser.close().catch(() => {});
  }
})();
