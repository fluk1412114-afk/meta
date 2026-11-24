# Browser control for Meta AI

Ghost Mode is the only browser transport supported by this Skill. It launches a dedicated browser process with a per-browser isolated profile and keeps all automation endpoints on loopback. It never connects to an already-running everyday browser session.

## Browser registry and defaults

| Browser | Default | Executable | Port | Transport |
|---|---:|---|---:|---|
| Microsoft Edge | Yes | msedge.exe | 9224 | Playwright Chromium CDP |
| Chrome | Fallback | chrome.exe | 9223 | Playwright Chromium CDP |
| Brave | Fallback | brave.exe | 9225 | Playwright Chromium CDP |
| Firefox | Fallback | firefox.exe | 9226 | Playwright browser server |
| WebKit | Experimental | Playwright WebKit | 9227 | Playwright browser server; macOS only |

The automatic fallback order is Edge → Chrome → Brave → Firefox. WebKit is opt-in and is not part of automatic fallback. The actual selected browser must be logged and reported when fallback occurs.

Profiles are isolated under `%LOCALAPPDATA%\MetaAI-CDP-Profile\<browser>` on Windows. Each browser has a distinct profile directory and transport port. Never point a profile at the user's normal browser data directory.

## Start and connect

```powershell
npm ci
node scripts/ghost-launcher.js --browser edge
node scripts/connect-meta-ai.js --browser edge
node scripts/create-image.js "A warm minimalist coffee shop" --browser edge
```

Chromium launches with `--headless=new`; Firefox uses Playwright `headless: true`. Headed mode is opt-in with `--headed`. Chromium connects only to its registered `http://127.0.0.1:<port>` endpoint. Firefox connects only to its recorded `ws://127.0.0.1:<port>` Playwright endpoint.

Before connecting, the controller requires a live PID record and a matching endpoint record for the selected browser. It rejects missing, stale, non-loopback, or mismatched endpoint state. It never searches for or attaches to an arbitrary browser debugging port.

## Watch and manage

Run `node scripts/viewer-server.js --browser edge`, then open `http://127.0.0.1:9229/viewer`. The viewer is read-only. Chromium uses `Page.startScreencast`; Firefox/WebKit use screenshot polling every 800 ms. It displays the selected browser, a sanitized URL, status, and screenshot. URL query strings and fragments are not exposed in the status response.

```powershell
node scripts/ghost-launcher.js list-browsers
node scripts/ghost-launcher.js stop --browser edge
```

The stop command checks that the recorded process command line contains the selected isolated profile path before terminating it. If ownership cannot be verified, it refuses to stop the process.

## No desktop interference

All page actions use Playwright locators and browser-protocol input inside the isolated browser process. The scripts never use pyautogui, pynput, robotjs, xdotool, OS mouse/keyboard APIs, desktop-control APIs, active-window switching, or focus manipulation. Headless mode means the browser runs without a visible window by default. The viewer is the intended way to watch activity.

All CDP and Playwright endpoints bind to `127.0.0.1`, never `0.0.0.0`. Do not expose debugging ports through a firewall, reverse proxy, tunnel, or LAN.

## Authentication and sensitive actions

- Sign-in is manual only. Never automate passwords, OTP, MFA, CAPTCHA, or verification steps. Complete these yourself in headed mode if necessary.
- Never inspect or export cookies, credentials, local storage, browser databases, or profile secrets.
- Before any public post, comment, message, purchase, payment, follow, share, or account change, show the exact action and obtain explicit confirmation in chat immediately before submission.
- Use only the selected isolated profile. Do not attach to the user's everyday browser profile.
- Respect Meta AI's account, privacy, regional, and feature limits.

## Troubleshooting

- If the selected browser is missing, the launcher reports the fallback browser. Install the requested browser or explicitly select an installed alternative.
- If the transport port is busy, the launcher refuses to attach. Inspect the process using that port; do not change the endpoint validation to bypass the refusal.
- If the PID or endpoint state is missing or stale, stop only the recorded Ghost process after verifying its profile ownership, then launch a fresh session.
- If Firefox is selected, install its Playwright browser binary with `npx playwright-core install firefox`.
- If a page action fails, inspect the live page and selector. Do not retry repeatedly against a changed or ambiguous interface.
