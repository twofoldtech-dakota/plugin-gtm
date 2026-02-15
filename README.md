# plugin-gtm

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js >= 22](https://img.shields.io/badge/Node.js-%3E%3D22-green.svg)](https://nodejs.org)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-blueviolet.svg)](https://code.claude.com/docs/en/plugins)

Go-to-market engine for Claude Code. Analyze your product, build a GTM strategy, generate launch content, and track your launch — all from the terminal.

## Why

You just built something. Now you need to ship it. That means positioning, messaging, a launch plan, landing page copy, social posts, a README... and suddenly you're in five different tabs context-switching between your code and a pile of marketing tools.

plugin-gtm keeps you in the terminal. Point it at your codebase, and it figures out what you built, who it's for, and how to take it to market.

## What You Get

| Skill | What it does |
|-------|-------------|
| `/gtm` | Command router — check status, list products, get help |
| `/gtm-analyze` | Scan a project codebase or describe an idea → structured product profile |
| `/gtm-plan` | Build a full GTM plan: positioning, messaging, ICP, channels, pricing, timeline |
| `/gtm-content` | Generate launch content: landing pages, README, emails, social posts, blog posts |
| `/gtm-research` | Competitive analysis, market sizing, channel research |

**20 MCP tools** for persistent storage — product profiles, plans, content, and launch checklists survive across sessions in SQLite.

**4 hive blueprints** for multi-agent orchestration via [plugin-hive](https://github.com/twofoldtech-dakota/plugin-hive):
- `gtm-full-launch` — End-to-end: analyze → research → plan → content → launch
- `gtm-content-sprint` — Generate all content assets in parallel
- `gtm-competitive-intel` — Deep competitive research
- `gtm-idea-to-plan` — Validate a raw idea through to a complete plan

## Install

**Step 1** — Add the marketplace (once per machine):

```
/plugin marketplace add twofoldtech-dakota/plugin-gtm
```

**Step 2** — Install the plugin:

```
/plugin install plugin-gtm@twofoldtech-dakota-plugin-gtm
```

Requires Node.js >= 22 (for native `node:sqlite`).

## Quick Start

### Analyze an existing project

```
/gtm-analyze
```

Point it at your current project or provide a path. It reads your codebase — README, package.json, source files, git history — and extracts what the product does, who it's for, and what makes it different. The result is persisted as a product profile.

### Build a GTM plan

```
/gtm-plan
```

Walks you through positioning, messaging, ideal customer profile, distribution channels, pricing, and a phased launch timeline. Generates a launch checklist automatically.

### Generate launch content

```
/gtm-content readme
/gtm-content landing_page
/gtm-content social_post
/gtm-content email
/gtm-content blog_post
```

Generates content based on your product profile and GTM plan. Everything stays consistent — same voice, same messaging, same positioning.

### Research the market

```
/gtm-research competitive
/gtm-research channels
/gtm-research pricing
```

Competitive analysis, channel research, and pricing benchmarks using web search. Findings can be applied back to your GTM plan.

### Check status

```
/gtm status
```

See all your products, plans, and launch progress at a glance.

## The Compound Startup Toolkit

plugin-gtm is one piece of a three-plugin system:

```
plugin-architect  →  Design & build products
plugin-hive       →  Orchestrate multi-agent workflows
plugin-gtm        →  Take products to market
```

| Plugin | Repo |
|--------|------|
| plugin-architect | [twofoldtech-dakota/plugin-architect](https://github.com/twofoldtech-dakota/plugin-architect) |
| plugin-hive | [twofoldtech-dakota/plugin-hive](https://github.com/twofoldtech-dakota/plugin-hive) |
| plugin-gtm | You're here |

The workflow: **Architect** designs and builds it → **GTM** analyzes it and plans the launch → **Hive** orchestrates multi-agent execution → **GTM** tracks progress.

## MCP Tools Reference

All tools are namespaced with `gtm_` and available to Claude when the plugin is installed.

| Category | Tools |
|----------|-------|
| Product | `gtm_product_create`, `gtm_product_get`, `gtm_product_list`, `gtm_product_update`, `gtm_product_delete` |
| Plan | `gtm_plan_create`, `gtm_plan_get`, `gtm_plan_list`, `gtm_plan_update`, `gtm_plan_delete` |
| Content | `gtm_content_create`, `gtm_content_get`, `gtm_content_list`, `gtm_content_update`, `gtm_content_delete` |
| Launch | `gtm_launch_item_create`, `gtm_launch_item_list`, `gtm_launch_item_update`, `gtm_launch_item_delete`, `gtm_launch_progress` |

## Architecture

```
plugin-gtm/
├── .claude-plugin/       # Plugin manifest + marketplace registration
├── .mcp.json             # MCP server registration
├── skills/               # 5 user-facing skills (SKILL.md files)
├── blueprints/           # 4 hive-compatible workflow definitions
└── src/                  # MCP server (TypeScript, Node.js 22, SQLite)
    ├── index.ts          # Tool + resource registration
    ├── db.ts             # SQLite persistence layer
    ├── types.ts          # Type definitions
    ├── product/          # Product profile CRUD
    ├── plan/             # GTM plan CRUD
    ├── content/          # Content library CRUD
    └── launch/           # Launch tracker CRUD
```

Data is stored in `.gtm/gtm.db` inside your project directory (configurable via `GTM_DATA_DIR`).

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design document.

## Development

```bash
git clone https://github.com/twofoldtech-dakota/plugin-gtm.git
cd plugin-gtm
npm install
npm run build
```

For local development with file watching:

```bash
npm run dev
```

To test the local copy as a plugin:

```bash
claude --plugin-dir .
```

## License

MIT
