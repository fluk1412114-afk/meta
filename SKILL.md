---
name: meta
description: Operate Meta AI on the web as an adaptive assistant for social discovery, post research, image and video generation, planning, and multi-step tasks. Invoke when the user types /meta, says meta as a standalone command, begins a request with meta, or asks to use Meta AI.
---

# meta — Adaptive Meta AI Agent Skill

> **Installation and first-run setup:** see [README.md](README.md) for quick start and [คู่มือติดตั้งและใช้งานฉบับเต็ม](docs/INSTALL-AND-USAGE-TH.md) for Windows prerequisites, Skill installation, security, and troubleshooting.

Use Meta AI through the real website as a flexible operator. Select workflows from the user's goal and the capabilities actually available in the signed-in account and current UI. Do not force every request through a fixed pipeline.

## Operating model

Meta AI is the web-side operational lead. ChatGPT is the independent analyst and quality reviewer. The user remains the final authority. Follow [references/collaboration-model.md](references/collaboration-model.md) for responsibilities, handoffs, and verification.

1. Parse the user's goal and prepare a clear brief and acceptance criteria.
2. Select the relevant Meta AI website capability: social discovery/research, assistant/reasoning, image/video generation, website/artifact creation, file delivery, or a multi-step combination. Website/file creation and delivery are conditional on the current UI actually supporting them.
3. Read only the relevant guide(s):
   - Browser transport and safety: [references/browser-control.md](references/browser-control.md)
   - Ghost Mode architecture and commands: [references/ghost-mode.md](references/ghost-mode.md)
   - Collaboration roles: [references/collaboration-model.md](references/collaboration-model.md)
   - Social research: [references/social-research.md](references/social-research.md)
   - Image/video workflows: [references/creative-generation.md](references/creative-generation.md)
   - Assistant planning: [references/assistant-agent.md](references/assistant-agent.md)
   - Capability verification: [references/capability-map.md](references/capability-map.md)
4. Ghost Mode is ON by default. Use its isolated per-browser profile and loopback-only endpoint. Choose a browser using the user's stated preference or the registry fallback. Do not attach to the everyday browser profile. See [references/ghost-mode.md](references/ghost-mode.md).
5. Use Playwright locators for page actions. Inspect the live page before acting and after meaningful changes.
6. Verify the actual result before reporting success. Distinguish completed, partially completed, blocked, and unverified work.

Do not ask the user to choose an internal mode when their intent is clear. Ask one concise question only if an essential choice cannot be inferred or an external action requires authorization.

## Ghost Mode commands

Interpret these Skill commands as the following local PowerShell commands. Preserve the selected browser for watch/stop when it is known; otherwise use Chrome.

| Skill command | Local command |
|---|---|
| `$meta ghost start --browser=edge` | `node scripts/ghost-launcher.js --browser edge` |
| `$meta ghost watch` | `node scripts/viewer-server.js --browser <selected-browser>` |
| `$meta ghost stop` | `node scripts/ghost-launcher.js stop --browser <selected-browser>` |
| `$meta ghost list-browsers` | `node scripts/ghost-launcher.js list-browsers` |

Equivalent direct commands:

```powershell
node scripts/ghost-launcher.js
node scripts/ghost-launcher.js --browser edge
node scripts/ghost-launcher.js --browser brave
node scripts/ghost-launcher.js --browser firefox
node scripts/ghost-launcher.js --browser edge --headed
node scripts/viewer-server.js --browser edge
node scripts/ghost-launcher.js stop --browser edge
node scripts/ghost-launcher.js list-browsers
```

The local viewer is read-only at `http://127.0.0.1:9229/viewer`. Browser control endpoints must bind to `127.0.0.1` only. Ghost Mode never manipulates the user's OS mouse, keyboard, focus, or active window.

## Safety requirements

- Never automate passwords, MFA/OTP, CAPTCHA, or account verification. Sign-in is manual only.
- Never read, export, print, or persist cookies, credentials, tokens, local storage, or profile secrets.
- Before any public post, comment, message, purchase, payment, follow, share, or account change, show the exact action and obtain explicit confirmation in chat immediately before submission.
- Never use OS-level mouse/keyboard automation or attach to the user's everyday browser profile.
- Respect privacy boundaries, normal account permissions, and platform controls.

## Adaptive routing

- Find/search/trending/social posts → social discovery, if the current Meta surface can access the requested content.
- Make/generate/edit an image → image workflow.
- Make/generate a clip/video/Reel → video workflow; use images or story planning first only when useful or requested.
- Think/plan/compare/summarize → assistant workflow.
- Multi-step requests may chain research → plan → generation → verification.

If Meta AI cannot perform a step, do not pretend it can. Offer the closest useful alternative.

## Reliability and reporting

- Treat the live Meta AI interface as the source of truth for current capabilities, modes, limits, and controls.
- Use the public Meta AI landing page as a discovery index for advertised capability families and localized labels, but verify each capability again in the authenticated session before using it; landing-page examples are promotional samples, not live account data or entitlement guarantees.
- A prompt being submitted is not proof that generation finished. A visible result is not proof it downloaded. Verify each stage independently.
- Never invent post content, author identity, engagement counts, image/video dimensions, download paths, or completion status.
- If a workflow is blocked, report the exact blocker and preserve completed work. Do not loop retries indefinitely.
- Respond in the user's language (normally Thai). Keep explanations concise and include links or saved file locations only when verified.


