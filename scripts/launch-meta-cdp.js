// Compatibility entry point. New workflows should call ghost-launcher.js directly.
import { launchGhost } from './ghost-launcher.js';

const args = process.argv.slice(2);
const browserIndex = args.indexOf('--browser');
const inlineBrowser = args.find(value => value.startsWith('--browser='));
const browser = inlineBrowser
  ? inlineBrowser.slice('--browser='.length)
  : browserIndex >= 0 ? args[browserIndex + 1] : 'edge';
const portIndex = args.indexOf('--port');
const inlinePort = args.find(value => value.startsWith('--port='));
const port = inlinePort
  ? Number(inlinePort.slice('--port='.length))
  : portIndex >= 0 ? Number(args[portIndex + 1]) : undefined;

try {
  await launchGhost({ browser, headed: args.includes('--headed'), port });
} catch (error) {
  console.error('GHOST_LAUNCH_FAILED:', error.message);
  process.exitCode = 1;
}
