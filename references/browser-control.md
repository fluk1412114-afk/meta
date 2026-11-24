# Browser control for Meta AI

Ghost Mode is the default transport. It launches a dedicated browser process with a per-browser isolated profile and keeps all automation endpoints on loopback. The separate Tunnel Dashboard Edge Browser MCP remains an optional external integration; it is not required by Ghost Mode.

## Ghost Mode browser registry

| Browser | Executable | Port | Transport | Notes |
|---|---|---:|---|---|
| Chrome | chrome.exe | 9223 | chromium.connectOverCDP | Default browser |
| Edge | msedge.exe | 9224 | chromium.connectOverCDP | Chromium |
| Brave | brave.exe | 9225 | chromium.connectOverCDP | executablePath + Chrome-compatible channel |
| Firefox | firefox.exe | 9226 | firefox.connect | Playwright browser server; not raw CDP |
| WebKit | Playwright WebKit | 9227 | webkit.connect | Experimental; macOS only |

Profiles are isolated under `%LOCALAPPDATA%\MetaAI-CDP-Profile\<browser>` on Windows. If the requested browser is unavailable, fallback order is Chrome → Edge → Brave → Firefox. The selected browser is logged. WebKit is not part of automatic fallback.

## Start and connect

```powershell
node scripts/ghost-launcher.js --browser chrome
node scripts/ghost-launcher.js --browser edge
node scripts/ghost-launcher.js --browser brave
node scripts/ghost-launcher.js --browser firefox
node scripts/ghost-launcher.js --browser edge --headed
node scripts/connect-meta-ai.js --browser edge
node scripts/create-image.js "A warm minimalist coffee shop" --browser brave
```

Chromium launches with `--headless=new`; Firefox uses Playwright `headless: true`. Headed mode is used only when the user passes `--headed`. Chromium connects with `chromium.connectOverCDP('http://127.0.0.1:<port>')`. Firefox connects using Playwright's own transport because Firefox does not offer compatible raw CDP.

## Watch and manage

Run `node scripts/viewer-server.js --browser edge`, then open `http://127.0.0.1:9229/viewer`. The viewer is read-only. Chromium uses `Page.startScreencast`; Firefox/WebKit use screenshot polling every 800 ms. It displays browser, URL, status, and screenshot.

```powershell
node scripts/ghost-launcher.js list-browsers
node scripts/ghost-launcher.js stop --browser edge
```

## No desktop interference

All actions use Playwright locators and browser-protocol input. The scripts never use pyautogui, pynput, robotjs, xdotool, OS mouse/keyboard APIs, or focus/active-window manipulation. Headless mode means the browser runs without a visible window by default. The viewer is the only intended way to watch activity.

All CDP and Playwright endpoints bind to `127.0.0.1`, never `0.0.0.0`. Do not expose debugging ports through a firewall, tunnel, or LAN.

## Authentication and sensitive actions

- Sign-in is manual only. Never automate passwords, OTP, MFA, CAPTCHA, or verification steps. Complete these yourself in headed mode if necessary.
- Never inspect or export cookies, credentials, local storage, browser databases, or profile secrets.
- Before any public post, comment, message, purchase, payment, follow, share, or account change, show the exact action and obtain explicit confirmation in chat immediately before submission.
- Use only the selected isolated profile. Do not attach to the user's everyday browser profile.
- Respect Meta AI's account, privacy, regional, and feature limits.

## Optional Edge Browser MCP

The separately installed Tunnel Dashboard Edge extension/Bridge may still be used by other workflows when its runtime tools are available and the user has paired it. It is independent of Ghost Mode and does not share Ghost Mode's Playwright connection or profile. Do not silently switch transports mid-task.

## Tunnel Dashboard Edge Browser MCP (optional attached-browser transport)

Use this integration when the user explicitly wants to control their already-open Microsoft Edge session, inspect existing tabs, or use Tunnel Dashboard (TD) browser tools. It is separate from Ghost Mode and must not be treated as a Playwright CDP endpoint.

### Connection and verification

- The local Edge Browser MCP Bridge listens on `http://127.0.0.1:38471`. Keep it loopback-only; never expose it on a LAN, public interface, reverse proxy, or tunnel.
- Pair the TD Edge Control extension with the local Bridge using TD's pairing flow. Never print, paste into chat, commit, log, or otherwise disclose the pairing token.
- If the extension reports `origin_not_allowed:""`, the request may have no Origin header. Diagnose the actual request and runtime version. A missing Origin may be accepted only for a loopback request that also presents the correct pairing token; if an Origin is present, validate that it is the expected extension origin. Never allow arbitrary origins, disable token checks, or bind the Bridge beyond loopback.
- After changing Bridge code, restart the TD application/Bridge process so the running worker loads the updated code, then reload the Edge extension from `edge://extensions` and reconnect.
- “Connected to local MCP Bridge” is only a transport-level signal. Verify actual browser operations before reporting the integration ready.

### Browser-control smoke test

When TD browser tools are available, run a read-only test in this order:

1. `browser_status`: require `connected: true` and a recent `lastSeenAt`.
2. `browser_list_tabs`: confirm the extension returns tab IDs, titles, and URLs.
3. `browser_get_page` on a returned tab ID: confirm title, URL, and visible page text are readable.
4. `browser_get_elements` on the same tab: confirm interactive controls can be inspected.
5. Use `browser_screenshot` only when visual verification is useful. Use navigation/click/type only when needed for the user's requested task.

Do not infer success merely because an MCP tool returned without an error. Inspect the resulting page/state. Start with read-only checks; consequential actions remain subject to explicit-confirmation rules. If a test fails, report the exact failed operation and stop rather than repeatedly reconnecting or weakening authorization.

### Transport selection

- Ghost Mode remains the default isolated transport and is preferred for autonomous Meta AI workflows.
- Use Tunnel Dashboard Edge Browser MCP only when the user asks to use the existing Edge session or when that attached session is materially required.
- Do not silently switch between Ghost Mode and the attached Edge session during a task.
