# meta — Meta AI Agent Skill

An adaptive Agent Skill for using Meta AI through its website for social discovery, research, planning, image/video workflows, and multi-step tasks. It prefers Microsoft Edge Browser MCP through the separate Tunnel Dashboard extension/Bridge, with the existing dedicated Windows Chrome CDP/Playwright helpers retained as a fallback.

> This repository is a community-maintained skill and automation helper, not an official Meta product or client. Meta AI features vary by account, region, and rollout. Always verify the live UI before relying on a capability.

## Quick start

**Requirements:** Windows 10/11, a Meta account with access to Meta AI, and either a paired Tunnel Dashboard Edge Browser MCP connection or Node.js 20+, npm, and Google Chrome for the fallback helpers.

```powershell
git clone https://github.com/fluk1412114-afk/meta.git
cd meta
npm ci
node scripts/launch-meta-cdp.js
```

On first launch, sign in manually in the dedicated Chrome window. Then, from another PowerShell window:

```powershell
node scripts/connect-meta-ai.js
```

Generate an image:

```powershell
node scripts/create-image.js "A warm minimalist coffee shop in a garden at sunrise"
```

The image helper saves verified downloads to `%USERPROFILE%\\Pictures\\MetaAI-Generated` by default.

## Browser control

The preferred browser transport is the Microsoft Edge extension connected to the Tunnel Dashboard MCP Bridge. This integration is maintained separately in [Tunnel Dashboard](https://github.com/fluk1412114-afk/tunnel-dashboard); install/pair the extension and grant Meta AI site access before invoking the Skill. The Skill checks `browser_status` and uses Edge MCP only when connected. If those tools are unavailable, the existing dedicated Chrome CDP/Playwright path remains available. See [browser-control.md](references/browser-control.md) for transport selection and safety rules.

## Install the Skill

Cloning the repository does not automatically register the Skill with Codex. To install it for the current Windows user:

```powershell
$skills = Join-Path $HOME ".agents\\skills"
New-Item -ItemType Directory -Force -Path $skills | Out-Null
git clone https://github.com/fluk1412114-afk/meta.git (Join-Path $skills "meta")
Set-Location (Join-Path $skills "meta")
npm ci
```

- Codex CLI / IDE: invoke with `$meta`.
- ChatGPT Desktop with standalone Skills support: add/import the folder only if the current Skills UI provides that flow, then invoke with `@meta`. Cloning this repo does not register it automatically.
- Repository-scoped install: place the complete folder at `.agents/skills/meta/` in your project.

See the [complete Thai installation and usage guide](docs/INSTALL-AND-USAGE-TH.md) for prerequisites, setup order, workflows, security, troubleshooting, and updates.

## Repository map

| Path | Purpose |
|---|---|
| `SKILL.md` | Main agent instructions and routing |
| `agents/openai.yaml` | Skill display metadata and implicit invocation |
| `references/` | Workflow guides, browser control, and capability verification |
| `references/browser-control.md` | Edge Browser MCP preferred transport and Chrome fallback rules |
| `scripts/launch-meta-cdp.js` | Launch/reuse dedicated Chrome CDP profile |
| `scripts/find-cdp-endpoint.js` | Verify the dedicated local CDP endpoint |
| `scripts/connect-meta-ai.js` | Connection diagnostic |
| `scripts/create-image.js` | Image generation and download helper |

## Security notes

- Edge Browser MCP requires the separately installed and paired Tunnel Dashboard extension/Bridge.
- The Chrome fallback uses a dedicated profile at `%LOCALAPPDATA%\\MetaAI-CDP-Profile`; do not use your everyday Chrome profile.
- Sign in manually. The scripts do not automate passwords, MFA, or CAPTCHA.
- Never publish the browser profile, cookies, storage, credentials, or private downloads.
- Keep CDP bound to the local machine. Do not expose the debugging port to a network.
- Public posting, messaging, purchases, and account-setting changes require explicit user authorization and appropriate confirmation.

## License

No license file is currently present in this repository. Do not assume the code is open for unrestricted reuse or redistribution; contact the repository owner for licensing terms.
