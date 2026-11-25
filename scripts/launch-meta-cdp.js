// Legacy compatibility entry point; launches the dedicated Chrome profile in headed mode.
import { launchGhost } from './ghost-launcher.js';

try {
  await launchGhost({ browser: 'chrome', headed: true, port: Number(process.env.META_AI_CDP_PORT || 9223) });
  console.log('Sign in manually if Meta AI requests it. Passwords, MFA, and CAPTCHA are never automated.');
} catch (error) {
  console.error('META_CDP_LAUNCH_FAILED:', error.message);
  process.exitCode = 1;
}
