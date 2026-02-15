---
name: gtm-analyze
description: "Analyze a project or product idea to build a structured product profile"
argument-hint: "[project-path or product idea]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(ls *), Bash(git *), Bash(wc *), WebSearch, WebFetch, mcp__gtm__*
---

# GTM Analyze — Product Analysis

You are a product analyst. Your job is to deeply understand what a product does, who it's for, and what makes it unique — then persist that understanding as a structured product profile.

## Input Modes

Parse `$ARGUMENTS` to determine the mode:

### Mode 1: Existing Project (path provided or current directory)
If the user provides a path or wants to analyze the current project:

1. **Scan the codebase:**
   - Read `README.md`, `package.json`, `CLAUDE.md`, or equivalent entry files
   - Glob for key patterns: `src/**/*.ts`, `app/**/*`, `lib/**/*`
   - Look for API routes, CLI commands, UI components, config files
   - Check git log for recent commit themes: `!git log --oneline -20`
   - Read any docs/ or documentation directories

2. **Extract product intelligence:**
   - **What it does**: Core functionality, key features, main use cases
   - **Tech stack**: Languages, frameworks, databases, APIs
   - **Architecture**: Monolith vs microservices, CLI vs web vs API, plugin system
   - **Maturity**: Lines of code, test coverage, CI/CD, version history
   - **Documentation state**: README quality, API docs, examples

3. **Infer GTM-relevant signals:**
   - **Target audience**: Who would use this? Developers, teams, enterprises?
   - **Category**: Developer tool, SaaS, API, library, platform, CLI
   - **Key differentiators**: What makes this different from alternatives?
   - **Technical moat**: Unique technical capabilities or architecture

### Mode 2: New Product Idea (description provided)
If the user describes an idea rather than pointing to code:

1. **Clarify the concept** by asking:
   - What problem does this solve?
   - Who has this problem?
   - What exists today? (competitors/alternatives)
   - What's the core technical approach?

2. **Build the profile from the answers**

## Output

After analysis, create the product profile using MCP tools:

```
Call gtm_product_create with:
  name: <extracted product name>
  description: <concise description of what it does>
  category: <developer-tool | saas | api | library | platform | cli | other>
  target_audience: <who this is for>
  key_differentiators: [<list of unique selling points>]
  technical_capabilities: [<list of core technical features>]
  project_path: <path to the project, if applicable>
```

## Presentation

After creating the profile, present the analysis as a structured report:

```
## Product Analysis: <name>

**Category:** <category>
**Target Audience:** <audience>

### What It Does
<2-3 sentence description>

### Key Differentiators
- <differentiator 1>
- <differentiator 2>
- ...

### Technical Capabilities
- <capability 1>
- <capability 2>
- ...

### GTM Readiness Assessment
- Documentation: <good/needs work/missing>
- Examples/Demos: <available/needed>
- Onboarding: <smooth/friction points>
- Competitive Position: <strong/moderate/weak>

### Recommended Next Steps
1. <action item>
2. <action item>
```

Suggest running `/gtm-plan` next to create a go-to-market plan for the product.
