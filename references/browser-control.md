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

Normal workflows should not require a separate manual start command. Browser launch is lazy: `connectGhost()` starts Ghost only when needed and reuses a healthy managed session. The isolated browser remains headless unless `--headed` is explicitly requested. Do not launch the Viewer for routine automation.

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
