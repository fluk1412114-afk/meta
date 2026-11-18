// Diagnostic helper for an already-running Chrome CDP endpoint.
// Usage: node scripts/connect-meta-ai.js [http://127.0.0.1:9222]
// Requires: npm install playwright
// This script does not read or export cookies, storage, or credentials.

const { chromium } = require('playwright');

(async () => {
  const endpoint = process.argv[2] || 'http://127.0.0.1:9222';
  let browser;

  try {
    browser = await chromium.connectOverCDP(endpoint);
    const contexts = browser.contexts();
    const pages = contexts.flatMap((context) => context.pages());
    console.log('Connected to existing Chrome via CDP.');
    console.log(`Contexts: ${contexts.length}; tabs: ${pages.length}`);

    for (const [index, page] of pages.entries()) {
      let title = '';
      let url = '';
      try {
        title = await page.title();
        url = page.url();
      } catch {
        // A tab may close while being inspected.
      }
      console.log(`[${index}] ${title} — ${url}`);
    }

    const metaTab = pages.find((page) => {
      try {
        return new URL(page.url()).hostname.endsWith('meta.ai');
      } catch {
        return false;
      }
    });

    if (metaTab) {
      console.log('Meta AI tab detected. Ready for an explicitly requested workflow.');
    } else {
      console.log('No Meta AI tab detected. Open Meta AI in this Chrome session first.');
    }
  } catch (error) {
    console.error('Could not connect to the existing Chrome CDP endpoint.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    // Disconnect the Playwright client; do not close the user's Chrome.
    if (browser) await browser.close().catch(() => {});
  }
})();
