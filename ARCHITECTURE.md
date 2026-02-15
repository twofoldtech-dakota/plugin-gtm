# plugin-gtm Architecture

## Overview

plugin-gtm is the go-to-market engine in the compound startup toolkit. It takes products from "built" to "in-market" through structured analysis, strategy, content generation, and launch execution.

## Ecosystem

```
plugin-architect  →  Design & build products
plugin-hive       →  Orchestrate multi-agent workflows
plugin-gtm        →  Take products to market ← (this plugin)
```

**Workflow:** Architect builds it → GTM analyzes it → GTM plans the launch → Hive orchestrates execution → GTM tracks progress.

## Components

### 1. Skills (User Interface)

| Skill | Purpose | Entry Point |
|-------|---------|-------------|
| `/gtm` | Command router, status, list | `skills/gtm/SKILL.md` |
| `/gtm-analyze` | Product analysis | `skills/gtm-analyze/SKILL.md` |
| `/gtm-plan` | GTM strategy builder | `skills/gtm-plan/SKILL.md` |
| `/gtm-content` | Launch content generator | `skills/gtm-content/SKILL.md` |
| `/gtm-research` | Market intelligence | `skills/gtm-research/SKILL.md` |

### 2. MCP Server (Persistence & Tools)

**Stack:** Node.js 22, TypeScript, native `node:sqlite`, MCP SDK

**Tool Namespace:** `gtm_*`

| Category | Tools | Description |
|----------|-------|-------------|
| Product | `gtm_product_{create,get,list,update,delete}` | Product profile CRUD |
| Plan | `gtm_plan_{create,get,list,update,delete}` | GTM plan CRUD |
| Content | `gtm_content_{create,get,list,update,delete}` | Content library CRUD |
| Launch | `gtm_launch_item_{create,list,update,delete}`, `gtm_launch_progress` | Launch tracker |

**Resources:**
- `gtm://products` — All product profiles
- `gtm://plans` — All GTM plans

### 3. Hive Blueprints (Workflow Orchestration)

Pre-built workflows for plugin-hive (currently stubs):

| Blueprint | Flights | Purpose |
|-----------|---------|---------|
| `gtm-full-launch` | 7 | End-to-end: analyze → research → plan → content → launch |
| `gtm-content-sprint` | 5 | Generate all content assets in parallel |
| `gtm-competitive-intel` | 4 | Deep competitive analysis with parallel research |
| `gtm-idea-to-plan` | 5 | Validate idea → profile → research → plan |

## Data Model

```
┌─────────────┐
│   Product    │ ← The thing being taken to market
├─────────────┤
│ id           │
│ name         │
│ description  │
│ category     │
│ target_aud.  │
│ differenti.  │
│ tech_capab.  │
│ project_path │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│    Plan      │ ← The GTM strategy
├─────────────┤
│ id           │
│ product_id   │
│ name         │
│ status       │
│ positioning  │
│ messaging    │
│ icp          │
│ channels     │
│ pricing      │
│ timeline     │
└──┬───────┬──┘
   │ 1:N   │ 1:N
   ▼       ▼
┌──────┐ ┌────────────┐
│Content│ │Launch Items │
└──────┘ └────────────┘
```

**Storage:** SQLite via Node.js 22 native `node:sqlite` (DatabaseSync). Data stored in `$GTM_DATA_DIR` (defaults to `$PROJECT_DIR/.gtm/`).

## File Structure

```
plugin-gtm/
├── .claude-plugin/
│   ├── plugin.json            # Plugin manifest
│   └── marketplace.json       # Distribution registration
├── .mcp.json                  # MCP server registration
├── skills/
│   ├── gtm/SKILL.md
│   ├── gtm-analyze/SKILL.md
│   ├── gtm-plan/SKILL.md
│   ├── gtm-content/SKILL.md
│   └── gtm-research/SKILL.md
├── blueprints/
│   ├── gtm-full-launch.yml
│   ├── gtm-content-sprint.yml
│   ├── gtm-competitive-intel.yml
│   └── gtm-idea-to-plan.yml
├── src/
│   ├── index.ts               # MCP server entry point
│   ├── db.ts                  # SQLite database layer
│   ├── types.ts               # TypeScript type definitions
│   ├── lib/
│   │   ├── paths.ts           # Filesystem path resolution
│   │   └── logger.ts          # Structured JSON logging
│   ├── product/crud.ts        # Product CRUD operations
│   ├── plan/crud.ts           # Plan CRUD operations
│   ├── content/crud.ts        # Content CRUD operations
│   └── launch/crud.ts         # Launch tracker CRUD
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── ARCHITECTURE.md            # This file
```

## Conventions

- **Tool names:** `gtm_<entity>_<action>` (e.g., `gtm_plan_create`)
- **Types:** PascalCase with `Record` suffix (e.g., `PlanRecord`)
- **Status enums:** String unions (e.g., `"draft" | "active" | "completed"`)
- **IDs:** UUIDs via `node:crypto.randomUUID()`
- **JSON fields:** Complex data (positioning, messaging, etc.) stored as JSON strings in SQLite
- **Timestamps:** ISO 8601 strings via SQLite `datetime('now')`

## Future Considerations

- **Analytics integration:** Track launch metrics (page views, signups, conversions)
- **Template library:** Pre-built GTM templates for common product categories
- **A/B testing:** Generate content variants and track performance
- **CRM integration:** Sync leads and customer data
- **Automated distribution:** Post content to channels directly via API integrations
