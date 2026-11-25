# Ghost Mode architecture

Ghost Mode is the default browser transport for this Skill. Browser startup is lazy and task-driven: `connectGhost()` starts a managed browser only when a workflow needs it, then reuses the existing managed session when its PID and loopback endpoint are healthy. It operates a separate browser process and isolated profile; it does not attach to the user's everyday browser. Workflows must not terminate a session that may still be in use; explicit `ghost stop` remains a user-directed action.

## Isolation and control model

- Profiles are stored at `%LOCALAPPDATA%\MetaAI-CDP-Profile\<browser>` on Windows. macOS/Linux use the platform's local application-data directory with the same `MetaAI-CDP-Profile/<browser>` layout.
- Chrome, Edge, and Brave use their own executable, port, and profile. Firefox and experimental macOS WebKit use Playwright's browser-server transport, not raw CDP.
- Firefox automation requires the Playwright-managed engine installed with `npx playwright-core install firefox`. WebKit requires `npx playwright-core install webkit` and is macOS-only.
- All debug and Playwright endpoints bind to `127.0.0.1`. Never expose them on `0.0.0.0`, a LAN address, or a public interface.
- Chromium defaults to `--headless=new`; Firefox/WebKit default to Playwright `headless: true`. Headed mode is opt-in with `--headed`.
- Browser interactions use Playwright locators and browser protocol input. No OS-level mouse/keyboard injection, desktop automation, or focus switching is used.
- Ghost Mode does not read or export cookies, credentials, local storage, browser databases, or profile secrets.

## Supported browsers

| Browser | Executable | Port | Playwright transport | Notes |
|---|---|---:|---|---|
| Chrome | chrome.exe | 9223 | chromium.connectOverCDP | Chromium headless by default |
| Edge | msedge.exe | 9224 | chromium.connectOverCDP | Chromium headless by default |
| Brave | brave.exe | 9225 | chromium.connectOverCDP | Uses Chromium channel compatibility |
| Firefox | firefox.exe | 9226 | firefox.connect | Playwright browser server; no raw CDP |
| WebKit | Playwright WebKit | 9227 | webkit.connect | Experimental, macOS only |

If the requested browser is not installed, selection falls back in this order: Chrome, Edge, Brave, Firefox. The selected browser is logged. WebKit is opt-in and is not in the fallback list.

## Commands

```powershell
node scripts/ghost-launcher.js --browser chrome
node scripts/ghost-launcher.js --browser edge
node scripts/ghost-launcher.js --browser brave
node scripts/ghost-launcher.js --browser firefox
node scripts/ghost-launcher.js --browser edge --headed
node scripts/ghost-launcher.js list-browsers
node scripts/ghost-launcher.js stop --browser edge
node scripts/viewer-server.js --browser edge
```

The viewer is read-only and listens at `http://127.0.0.1:9229/viewer`. It connects only when explicitly requested. Frame capture starts only while at least one viewer stream is connected and stops when the last viewer disconnects. Chromium uses `Page.startScreencast` at a reduced frame size/rate; Firefox/WebKit use screenshot polling at 1200 ms. Closing the Viewer does not terminate the Ghost Browser session. It is not exposed to the network.

## Manual sign-in and consequential actions

Sign-in is manual. Ghost Mode refuses password, OTP/MFA, CAPTCHA, and verification fields. Complete authentication or challenges yourself in headed mode, then return to headless operation if desired. Do not store credentials in scripts, chat, logs, or the repository.

Before any public post, comment, message, purchase, payment, follow, share, or account change, the agent must show the exact action and obtain explicit confirmation in chat immediately before submission. Helpers block common sensitive actions unless the caller explicitly supplies a confirmation flag after that chat confirmation. Do not use the flag as a substitute for user consent.

## Adding a browser

1. Add the browser definition to `scripts/browser-profiles.js`, including executable candidates, engine, profile root, and a unique loopback port.
2. For Chromium-compatible browsers, use the Chromium CDP path and verify the CDP websocket host is exactly `127.0.0.1`.
3. For Firefox-like engines, use Playwright's browser-server transport and the corresponding `<engine>.connect()`; do not assume raw CDP compatibility.
4. Add the browser to the viewer's transport selection and fallback policy only if it is supported.
5. Update this table and add an isolation/connection smoke test. Never reuse another browser's profile directory.
