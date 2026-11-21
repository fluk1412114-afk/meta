# Browser control for Meta AI

Use this guide whenever operating the Meta AI website. Prefer the user's paired Microsoft Edge Browser MCP extension. Keep the existing dedicated Chrome CDP/Playwright engine as a fallback.

## Transport selection

1. Call browser_status first when that MCP tool is available.
2. If status confirms the Edge extension is connected, use the Edge tools: browser_list_tabs, browser_get_page, browser_get_elements, browser_navigate, browser_click, browser_type, and browser_screenshot.
3. If status is unavailable, disconnected, or the tools are not exposed in the current runtime, do not pretend Edge is connected. Use the existing dedicated Chrome CDP/Playwright fallback described in SKILL.md, if available.
4. Do not restart Tunnel Client, MCP Bridge, browser, or other services as a troubleshooting shortcut. Ask for authorization before a service restart.
5. Do not silently switch between Edge and Chrome during an active workflow. Explain why, then re-check the target page and signed-in state.

The Edge integration is supplied by the separate Tunnel Dashboard MCP Bridge and unpacked Edge extension; it is not bundled in this repository. Pairing, extension installation, and site permissions must be completed by the user. Never print pairing tokens in chat or store them in this repository.

## Safe interaction loop

1. Confirm the intended Meta AI tab using the tab list and page inspection.
2. Inspect the live page and relevant visible controls; do not rely on stale selectors or assumed layouts.
3. Use the smallest action needed. Prefer visible, semantic controls over coordinates.
4. Inspect the page again after navigation, submission, modal changes, or generation.
5. Verify the requested outcome independently before reporting completion.

Use the browser only within the signed-in account's normal permissions. Do not read browser profile files, cookies, local storage, session tokens, passwords, or hidden page/application state. Do not execute arbitrary JavaScript, use DevTools/CDP, or bypass browser security through the Edge MCP transport.

## User authorization and sensitive actions

- Reading public/accessible content and preparing drafts may proceed within the user's request.
- Posting, commenting, reacting, following, messaging, sharing, purchasing, spending paid credits, or changing account/security settings require explicit user authorization. For consequential public or interpersonal actions, show the final content/details and obtain a final confirmation immediately before submission.
- Never automate sign-in, passwords, OTP, MFA, CAPTCHA, or account verification. Pause and let the user complete those steps.
- Respect privacy settings and access boundaries. Do not try to expose private, deleted, hidden, or otherwise inaccessible content.

## Tool argument discipline

Use the exact argument schema advertised by the active MCP tool. Select a tab using the returned tab identifier, not a guessed ID. Do not invent a tab ID, selector, element reference, URL, or screenshot. If an action fails, re-inspect the page and retry only when there is a clear, safe reason; avoid repeated blind clicks or typing.

## Current limitations

- Edge MCP availability is runtime-dependent. A repository instruction cannot install or expose MCP tools by itself.
- The extension and Bridge must be paired and connected, and the extension must have the user's approved site access for the Meta AI origin.
- Screenshot capture may require the target tab to be active in its browser window.
- The existing Chrome CDP helper is a separate fallback; it does not become an Edge integration merely because this guide is installed.
