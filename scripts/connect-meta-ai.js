import { connectGhost, waitForMetaAI } from './ghost-controller.js';

const args = process.argv.slice(2);
const inlineBrowser = args.find(value => value.startsWith('--browser='));
const browserIndex = args.indexOf('--browser');
const browser = inlineBrowser
  ? inlineBrowser.slice('--browser='.length)
  : browserIndex >= 0 ? args[browserIndex + 1] : 'edge';
let connection;

try {
  connection = await connectGhost({ browser });
  const { browser: client, context, page, selectedBrowser } = connection;
  console.log(`Connected to managed isolated Ghost Browser: ${selectedBrowser}`);
  console.log(`Contexts: ${client.contexts().length}; tabs: ${context.pages().length}`);
  await waitForMetaAI(page, { navigate: false, timeout: 5000 }).catch(() => {});
  const isMeta = /(^|\\.)meta\\.ai$/i.test(new URL(page.url()).hostname);
  console.log(isMeta
    ? 'Meta AI tab detected in the isolated profile.'
    : 'No Meta AI tab detected. Open Meta AI in this isolated Ghost profile first.');
} catch (error) {
  console.error('GHOST_CONNECT_FAILED:', error.message);
  process.exitCode = 1;
} finally {
  if (connection?.browser) await connection.browser.close().catch(() => {});
}
