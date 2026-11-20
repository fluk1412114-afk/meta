# Meta AI capability map and live verification

This file is a decision guide, not a static feature guarantee. Meta AI changes frequently and capabilities can differ by country, account, device, and rollout.

## Capability families

| Capability family | Intended use | Required live verification |
|---|---|---|
| Meta AI assistant | Questions, reasoning, writing, planning | Chat/composer available; response received |
| Facebook discovery | Search posts, topics, public discussion, accessible friend posts | Current surface exposes relevant search/context and candidate posts open successfully |
| Instagram discovery | Search posts, Reels, creators, topics | Current surface exposes relevant search/context and candidate posts open successfully |
| Threads discovery | Search discussions, topics, public conversation | Current surface exposes relevant search/context and candidate posts open successfully |
| Image generation/editing | Create or modify images | Image creation/edit controls visible; new result appears |
| Video generation | Create or animate video | Video creation controls visible; playable result appears |
| Multi-step assistance | Research → plan → creative output | Each step is supported and independently verified |

## Live verification checklist

Before relying on a capability:
- Confirm the domain and product surface are Meta-owned and expected.
- Confirm the user is signed in to the intended account without inspecting secrets.
- Inspect available UI labels and controls; do not rely on remembered selectors alone.
- Check whether the feature is available in this account and region.
- Distinguish search results from generated answers and recommendations.
- Verify result freshness and source dates where relevant.
- Record actual output metadata and file properties.

## Names, models, modes, quotas, and availability

Model names, Instant/Think modes, limits, output formats, generation quotas, and regional availability are volatile. Do not hardcode them as guaranteed facts. Prefer the labels and settings currently shown in the UI. If a user asks for a particular resolution, duration, voice, or model, verify that the UI offers it before promising it.

## Known constraints

- A social platform being part of Meta does not mean every post is searchable from Meta AI.
- A signed-in account's access rights still apply; private or restricted content must remain inaccessible.
- Image generation support does not imply video generation support, and a video feature may have separate limits.
- A submitted prompt does not prove successful generation; a visible result does not prove a successful download.
- UI selectors may change. Re-identify elements by accessible role, label, and surrounding context before updating automation.



## Website, artifact, and file delivery

Website/code generation and file creation or download are possible workflow targets only when the current Meta AI interface exposes a supported creation or artifact flow. Inspect the exact controls and resulting artifact before relying on them.

Distinguish these outcomes precisely:
- **Website code/artifact created** — the content or project artifact exists in Meta's interface or returned output.
- **File offered for download** — a visible download action or link is available.
- **File downloaded** — the download completed and the file can be verified at an observed location.
- **Website deployed** — the site is actually published to a reachable hosting destination; never infer this from generated code or a preview.

Meta's website session does not grant access to the user's local filesystem, desktop, installed applications, or everyday browser. Use Remote or another authorized computer-access tool for local inspection, saving, editing, installation, execution, or deployment steps outside Meta AI. Do not claim those local steps are complete unless separately verified.

## Directly verified in this account

### 2026-11-18 — HTML artifact creation and export

- Surface: Meta AI website → Artifacts, signed-in session used by the `meta` skill.
- Action: requested a Thai responsive one-page website, opened the HTML artifact preview, and used the artifact download control.
- Observed export behavior: the initial React-based HTML artifact exported as a `.tar.gz` containing `App.tsx`, `index.css`, and an image asset; it was not a standalone HTML file.
- Follow-up: asked Meta AI for a separate standalone `index.html` with inline CSS/JavaScript and no build step. Meta created a separate HTML artifact; its download control returned an actual `index.html` file.
- Independent verification: file opened from `file://` in Chromium; mobile width 390px and desktop width 1440px had no horizontal overflow; hamburger menu opened/closed; navigation scrolled; booking modal opened; demo form completed locally; no external HTTP requests were observed. A placeholder typo was sent back to Meta, corrected, and the final file was downloaded and re-tested.
- Limitation: Meta's preview artifact and standalone downloadable HTML are distinct output paths. When a single-file HTML is required, explicitly request a separate standalone `index.html` and verify the downloaded filename and contents.

## Maintaining this map

When a new feature is directly verified, add:
- date observed;
- exact product surface and visible label;
- account/region context only if known and relevant;
- action tested and observable outcome;
- known limitations or uncertainty.

Mark reports from third parties or untested UI elements as unverified. Re-check volatile claims before using them in a new task.
