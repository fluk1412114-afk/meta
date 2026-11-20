# meta — meta ai for any ai

Use Meta AI through its website as an adaptive assistant for social discovery, research, image and video generation, planning, and multi-step tasks. The same skill remains available as a portable Agent Skill for other AI tools.

## Option A — Claude Code Plugin

Add this repository as a marketplace, then install the `meta` plugin:

```text
/plugin marketplace add fluk1412114-afk/meta
/plugin install meta@meta
```

After installation, invoke the skill with `/meta` or ask Claude Code to use Meta AI. The plugin bundles the skill instructions, reference guides, browser helpers, and Playwright dependency manifest.

## Option B — Install by copying files for other AI tools

The root-level files remain available for AI tools that support Agent Skills or manual skill installation.

1. Copy `SKILL.md` into a skill folder named `meta` supported by your AI tool.
2. Copy the `references/` and `scripts/` folders beside that `SKILL.md`.
3. Copy `package.json` beside the skill files if you want to use the included Node.js helpers.
4. In that folder, run `npm install` to install Playwright before using the browser helpers.
5. Follow the destination AI tool's instructions for registering or enabling local skills.

Example layout:

```text
meta/
├── SKILL.md
├── package.json
├── references/
│   ├── assistant-agent.md
│   ├── capability-map.md
│   ├── collaboration-model.md
│   ├── creative-generation.md
│   └── social-research.md
└── scripts/
    ├── connect-meta-ai.js
    ├── create-image.js
    ├── find-cdp-endpoint.js
    └── launch-meta-cdp.js
```

## What the skill does

- Routes requests to social discovery, assistant/reasoning, image generation, video generation, or multi-step workflows based on the live Meta AI interface.
- Uses a dedicated persistent Chrome profile and local CDP/Playwright helpers.
- Keeps ChatGPT (or the current AI) as an independent analyst and quality reviewer.
- Verifies generated results and downloads instead of assuming that a submitted prompt succeeded.
- Preserves privacy, account access controls, and explicit approval for consequential actions.

## Requirements for browser helpers

- Windows with Google Chrome installed (the current CDP launcher targets standard Windows Chrome locations).
- Node.js and npm.
- Playwright installed from the included `package.json`.
- A user-signed-in Meta AI session in the dedicated Chrome profile. Sign in manually when prompted.

The skill does not bypass login, CAPTCHA, MFA, access controls, or paid-feature approvals. Current Meta AI features vary by account, region, and rollout; the live UI is authoritative.

## Repository layout

```text
.
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── meta/
│       ├── .claude-plugin/plugin.json
│       └── skills/meta/
│           ├── SKILL.md
│           ├── package.json
│           ├── references/
│           └── scripts/
├── SKILL.md
├── package.json
├── references/
└── scripts/
```

The root-level skill and its supporting files are retained for non-Claude AI tools. The plugin contains a separate copy so its relative paths resolve within the installed plugin.
