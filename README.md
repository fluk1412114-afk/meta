# meta — Meta AI Agent Skill

An adaptive Agent Skill for using Meta AI through its website for social discovery, research, planning, image/video workflows, and multi-step tasks. Ghost Mode is the default browser transport: it launches isolated browser profiles headlessly and does not interfere with the user's desktop input or active window.

> This repository is a community-maintained skill and automation helper, not an official Meta product or client. Meta AI features vary by account, region, and rollout. Always verify the live UI before relying on a capability.

## Quick start

**Requirements:** Windows 10/11, Node.js 20+, npm, and at least one supported browser installed.

```powershell
git clone https://github.com/fluk1412114-afk/meta.git
cd meta
npm ci
```

Start Ghost Mode with the default Chrome browser:

```powershell
node scripts/ghost-launcher.js
```

Choose another installed browser:

```powershell
node scripts/ghost-launcher.js --browser chrome
node scripts/ghost-launcher.js --browser edge
node scripts/ghost-launcher.js --browser brave
node scripts/ghost-launcher.js --browser firefox
```

Firefox requires the Playwright-managed Firefox engine once per machine:

```powershell
npx playwright-core install firefox
```

On macOS, experimental WebKit can be installed with `npx playwright-core install webkit` and started with `--browser webkit`. WebKit is not included in automatic fallback.

Ghost Mode is headless by default. To show the browser window explicitly:

```powershell
node scripts/ghost-launcher.js --browser edge --headed
```

If manual sign-in is required, stop the current Ghost process and restart with `--headed`; complete sign-in yourself, then restart without `--headed` for hidden operation. Passwords, MFA/OTP, CAPTCHA, and verification are never automated. The browser profile is isolated per browser under `%LOCALAPPDATA%\MetaAI-CDP-Profile\<browser>`.

Connect to Meta AI:

```powershell
node scripts/connect-meta-ai.js --browser edge
```

Generate an image:

```powershell
node scripts/create-image.js "A warm minimalist coffee shop in a garden at sunrise" --browser brave
```

Watch the live browser (read-only):

```powershell
node scripts/viewer-server.js --browser edge
# Open http://127.0.0.1:9229/viewer
```

Manage browsers:

```powershell
node scripts/ghost-launcher.js list-browsers
node scripts/ghost-launcher.js stop --browser edge
```

If the requested browser is unavailable, the launcher falls back in this order: Chrome → Edge → Brave → Firefox, and logs the selected browser.

## Browser and safety model

- Chrome, Edge, and Brave use Playwright Chromium over CDP; Firefox uses Playwright's Firefox transport (not raw CDP); WebKit is experimental and macOS-only.
- Debugging endpoints bind to `127.0.0.1` only, never `0.0.0.0`.
- No pyautogui, pynput, robotjs, xdotool, OS-level mouse/keyboard, focus switching, or active-window manipulation.
- Do not use the user's everyday browser profile. Each browser has a separate isolated profile.
- The viewer is read-only. Chromium uses Page.startScreencast; Firefox/WebKit use screenshot polling every 800 ms.
- Never publish browser profiles, cookies, credentials, tokens, or local storage.
- Before any public post, message, purchase, payment, share, follow, comment, or account change, obtain explicit confirmation in chat immediately before submission.
- Sign-in is manual only. Never automate passwords, MFA, CAPTCHA, or verification.

See [references/browser-control.md](references/browser-control.md) and [references/ghost-mode.md](references/ghost-mode.md) for architecture, ports, limitations, and extension guidance.

## Install the Skill

Cloning the repository does not automatically register the Skill with Codex. To install it for the current Windows user:

```powershell
$skills = Join-Path $HOME ".agents\skills"
New-Item -ItemType Directory -Force -Path $skills | Out-Null
git clone https://github.com/fluk1412114-afk/meta.git (Join-Path $skills "meta")
Set-Location (Join-Path $skills "meta")
npm ci
```

- Codex CLI / IDE: invoke with `$meta`.
- ChatGPT Desktop with standalone Skills support: import the folder only if the current Skills UI provides that flow, then invoke with `@meta`.
- Repository-scoped install: place the complete folder at `.agents/skills/meta/` in your project.

See the [complete Thai installation and usage guide](docs/INSTALL-AND-USAGE-TH.md) for prerequisites, setup order, workflows, security, troubleshooting, and updates.

## Repository map

| Path | Purpose |
|---|---|
| `SKILL.md` | Main agent instructions and routing |
| `scripts/browser-profiles.js` | Browser registry, executable detection, profile isolation, fallback |
| `scripts/ghost-launcher.js` | Headless browser launcher, stop, and list commands |
| `scripts/ghost-controller.js` | Playwright connections and safe locator helpers |
| `scripts/viewer-server.js` | Read-only loopback live viewer |
| `scripts/connect-meta-ai.js` | Meta AI connection diagnostic |
| `scripts/create-image.js` | Image generation and download helper |
| `references/ghost-mode.md` | Ghost Mode architecture and extension guide |
| `references/browser-control.md` | Browser transports and safety rules |

## License

No license file is currently present in this repository. Do not assume the code is open for unrestricted reuse or redistribution; contact the repository owner for licensing terms.
