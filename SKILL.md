---
name: meta
description: Operate Meta AI on the web as an adaptive assistant for social discovery, post research, image and video generation, planning, and multi-step tasks. Invoke when the user types /meta, says meta as a standalone command, begins a request with meta, or asks to use Meta AI.
---

# meta — Adaptive Meta AI Agent

> **Installation and first-run setup:** see [README.md](README.md) for the quick start and [คู่มือติดตั้งและใช้งานฉบับเต็ม](docs/INSTALL-AND-USAGE-TH.md) for Windows prerequisites, Codex Skill installation, Edge Browser MCP pairing, Chrome CDP fallback, usage, security, and troubleshooting.


Use Meta AI through the real website as a flexible operator. Select the workflow from the user's goal and the capabilities actually available in the signed-in account and current UI. Do not force every request through a fixed pipeline.

## Operating model

Meta AI is the **web-side operational lead**. ChatGPT is the **independent analyst and quality reviewer**. The user remains the final authority. Follow [references/collaboration-model.md](references/collaboration-model.md) for responsibilities, handoffs, escalation, and verification.

1. Parse the user's goal and prepare a clear brief and acceptance criteria.
2. Select the relevant Meta AI website capability: social discovery/research, assistant/reasoning, image/video generation, website/artifact creation, file delivery, or a multi-step combination. Website/file creation and delivery are conditional on the current UI actually supporting them.
3. Read only the relevant guide(s):
   - Browser transport selection and safe interaction: [references/browser-control.md](references/browser-control.md)\n   - Collaboration roles and handoff loop: [references/collaboration-model.md](references/collaboration-model.md)
   - Social search, Facebook, Instagram, Threads, friends' posts: [references/social-research.md](references/social-research.md)
   - Image/video creation and output handling: [references/creative-generation.md](references/creative-generation.md)
   - Planning, analysis, general assistant work: [references/assistant-agent.md](references/assistant-agent.md)
   - Feature discovery, account/region limits, and capability verification: [references/capability-map.md](references/capability-map.md)
4. Prefer the paired Microsoft Edge Browser MCP when its tools are exposed and browser_status confirms connection; otherwise use the dedicated Chrome CDP/Playwright fallback. Follow [references/browser-control.md](references/browser-control.md). Inspect the live page before acting; UI and feature availability can change.
5. Let Meta lead the supported website-side execution. ChatGPT independently reviews important outputs and sends focused correction requests to Meta when needed.
6. Route local computer, local filesystem, installed-app, command-line, or external deployment work to Remote or another explicitly authorized tool. Meta itself has no direct access to the user's computer.
7. Verify the actual result before reporting success. Distinguish completed, partially completed, blocked, and unverified work.

Do not ask the user to choose an internal mode when their intent is clear. Infer sensible defaults and proceed. Ask one concise question only if an essential choice cannot be inferred or an external action requires authorization.

## Adaptive routing

- "Find / search / what's trending / what did my friend post" → social discovery, if the current Meta surface can access the requested content.
- "Make / generate / edit an image" → image workflow.
- "Make / generate a clip / video / Reel" → video workflow; use images or story planning first only when useful or requested.
- "Think / plan / compare / summarize / help me do..." → assistant workflow.
- Requests such as "find a real post, turn it into a 30-second video" → chain social research → summarize the source and trend → create a concept/script → generate media where supported → verify outputs.
- If Meta AI cannot perform a step, do not pretend it can. Offer the closest useful alternative, such as preparing prompts or a plan in chat.

## Browser engine — preserve and reuse

This skill owns a local copy of the working CDP/Playwright helpers. Do not replace them with a different browser integration unless the user explicitly asks.

- Engine files: scripts/launch-meta-cdp.js, scripts/find-cdp-endpoint.js, scripts/connect-meta-ai.js, and scripts/create-image.js.
- Node dependency: Playwright, declared in package.json.
- Dedicated persistent Chrome profile: %LOCALAPPDATA%\MetaAI-CDP-Profile; CDP port defaults to 9222.
- Launch/reuse with node scripts/launch-meta-cdp.js; connect only through find-cdp-endpoint.js and chromium.connectOverCDP.
- Reuse the existing context/profile and signed-in session. Never attach to the user's everyday Chrome profile.
- Do not read, export, copy, print, or persist cookies, local storage, passwords, auth tokens, or other profile secrets.
- Do not automate credentials, bypass CAPTCHA, MFA, access controls, or account verification. If sign-in or a challenge is needed, leave it to the user.
- Disconnect the Playwright client when finished; do not close Chrome or unrelated tabs. Keep the user's session available.
- Prefer semantic locators and visible UI. Re-discover selectors when the page changes; do not assume old selectors still work.
- Avoid foreground mouse/keyboard control unless required and authorized. Do not interfere with unrelated tabs.
- Do not publish, comment, react, follow, message, share, or change account settings unless explicitly requested. For consequential public or interpersonal actions, prepare the content and obtain a final confirmation immediately before submission.
- Do not purchase, spend paid credits, or trigger paid features without explicit approval.

The image helper is a known working path for image generation, but its selectors may become stale. Inspect and update it only when the live UI proves a change is needed. Do not assume the helper supports video or social search.

## Reliability and reporting

- Treat the live Meta AI interface as the source of truth for current capabilities, modes, limits, and available controls.
- A prompt being submitted is not proof that generation finished. A visible generated result is not proof it downloaded. Verify each stage independently.
- Never invent post content, author identity, engagement counts, image/video dimensions, download paths, or completion status.
- For social research, separate what the post actually says from Meta AI's interpretation or the agent's own inference.
- Respect the signed-in account's access and the platform's privacy controls. Do not attempt to access private content, hidden data, deleted content, or content the account cannot normally view.
- If a workflow is blocked, report the exact blocker and preserve any completed work. Do not loop retries indefinitely.
- Respond in the user's language (normally Thai). Keep explanations concise and include links or saved file locations only when verified.

## Knowledge maintenance

The references are operational guidance, not a claim that every feature is available everywhere. Meta changes products, rollouts, model names, and regional access. Before relying on a feature, verify it in the current UI and, when useful, consult current official Meta documentation. Record new discoveries with date, account/region context if known, and whether directly verified or merely reported. Never convert an unverified observation into a universal capability claim.
