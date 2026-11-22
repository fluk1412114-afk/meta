import { connectGhost, waitForMetaAI } from './ghost-controller.js';

const args = process.argv.slice(2);
const browserIndex = args.indexOf('--browser');
const browser = browserIndex >= 0 ? args[browserIndex + 1] : 'chrome';
let connection;

try {
  connection = await connectGhost({ browser });
  const { browser: client, context, page, selectedBrowser } = connection;
  console.log(`Connected to dedicated Ghost Browser: ${selectedBrowser}`);
  console.log(`Contexts: ${client.contexts().length}; tabs: ${context.pages().length}`);
  await waitForMetaAI(page, { navigate: false, timeout: 5000 }).catch(() => {});
  const isMeta = /(^|\.)meta\.ai$/i.test(new URL(page.url()).hostname);
  console.log(isMeta
    ? 'Meta AI tab detected. Ready for an explicitly requested workflow.'
    : 'No Meta AI tab detected. Open Meta AI in this isolated Ghost profile first.');
} catch (error) {
  console.error('GHOST_CONNECT_FAILED:', error.message);
  process.exitCode = 1;
} finally {
  if (connection?.browser) await connection.browser.close().catch(() => {});
}
