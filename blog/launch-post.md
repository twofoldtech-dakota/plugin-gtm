# Ship It, Then Sell It — From Your Terminal

**Alt titles:**
- How I Launch Every Project Without Leaving the Terminal
- We Built a GTM Engine for Claude Code, Then Used It to Launch Itself

---

You know the feeling. You've been heads-down for weeks, building something real. The code works. The tests pass. You push the last commit and lean back.

Now what?

Now you need positioning. A messaging framework. An ideal customer profile. A launch timeline. Landing page copy. A polished README. Social media posts. An email. A blog post. Maybe competitive research to make sure you're not walking into a crowded room with nothing to say.

So you open Notion. Then Figma. Then ChatGPT in a browser tab. Then a Google Doc. Then Twitter to look at how other people announced their thing. You're five tools deep, context-switching between your code and a scattered pile of marketing artifacts that don't talk to each other and won't exist next week.

This is the part where most developer projects die — not because the code was bad, but because the launch never happened.

## The problem is structural

It's not that developers can't do marketing. It's that the tools don't meet them where they work. Every GTM tool assumes you're a marketer sitting in a dashboard. None of them assume you're a developer sitting in a terminal who just finished building the thing and wants to ship it *right now*.

And none of them can look at your code.

That last part matters. Generic GTM tools ask you to manually describe your product, your audience, your features. But the answers are already in your codebase — in the README you half-wrote, in the package.json description, in the API routes, in the commit history. The gap between "built" and "launched" is an information extraction problem, and the information is sitting right there.

## Building plugin-gtm

We built [plugin-gtm](https://github.com/twofoldtech-dakota/plugin-gtm) to close that gap. It's a Claude Code plugin — meaning it runs natively in the terminal where you already write code — and it handles the full go-to-market workflow:

**Analyze** → Scan your codebase and extract a structured product profile. What does it do? Who's it for? What makes it different? What's the tech stack? How mature is it? The plugin reads your source files, README, package.json, git history, and documentation to figure this out.

**Plan** → Build a complete GTM strategy. Positioning (using the classic "For [audience] who need [thing], this product provides [value] unlike [competitor]" framework). Messaging (tagline, elevator pitch, value props, objection handling). Ideal customer profile. Distribution channels prioritized for your product category. Pricing strategy. A phased launch timeline. And an auto-generated launch checklist with priorities.

**Content** → Generate every piece of launch content from the plan. Landing page copy. README. Emails. Social posts (platform-specific variants for Twitter, LinkedIn, Reddit, HN). Blog posts. Changelog entries. Everything uses the same positioning and messaging, so your voice stays consistent across channels.

**Research** → Competitive analysis, market sizing, channel research, and pricing benchmarks using web search. Findings feed back into the plan so your strategy is grounded in real data.

Everything persists in SQLite. Your product profiles, plans, content, and launch checklists survive across sessions. You can come back tomorrow and pick up where you left off.

## The compound startup angle

plugin-gtm isn't a standalone tool. It's the third piece of a system we're building:

- **[plugin-architect](https://github.com/twofoldtech-dakota/plugin-architect)** — Expert guidance for designing and building Claude Code plugins. It knows the entire extension ecosystem and helps you plan architecture, choose components, and write production code.

- **[plugin-hive](https://github.com/twofoldtech-dakota/plugin-hive)** — Multi-agent workflow orchestration. Decompose complex work into discrete tasks distributed across specialized AI agents. Think of it as a pipeline engine for Claude Code.

- **[plugin-gtm](https://github.com/twofoldtech-dakota/plugin-gtm)** — Go-to-market engine. Analyze, plan, generate, launch.

The idea is borrowed from the [compound startup model](https://www.rippling.com/glossary/compound-startup): build multiple integrated products in parallel that share a foundation and compound on each other. In our case, the shared foundation is the Claude Code plugin system — skills, MCP servers, and hive blueprints that interoperate.

plugin-gtm ships with four hive-compatible blueprints:
- `gtm-full-launch` — End-to-end launch workflow across 7 agent flights
- `gtm-content-sprint` — Generate all content assets in parallel
- `gtm-competitive-intel` — Deep competitive research with parallel analysis
- `gtm-idea-to-plan` — Validate a raw idea through to a complete GTM plan

When plugin-hive's execution engine is ready, these blueprints will run as automated multi-agent swarms — each flight handled by a specialized bee with its own context and tools.

## Dogfooding the loop

Here's the part we couldn't resist: we used plugin-gtm to launch itself.

The product analysis, GTM plan, README, social media posts, and this blog post were all generated through plugin-gtm's own skill workflows. The `/gtm-analyze` skill scanned plugin-gtm's codebase. The `/gtm-plan` skill built a positioning framework, messaging, ICP, channel strategy, pricing model, and launch timeline. The `/gtm-content` skill generated each piece of launch content using that plan.

It's a proof of concept and a launch artifact at the same time.

## Getting started

Install the plugin:

```bash
claude plugin install https://github.com/twofoldtech-dakota/plugin-gtm.git
```

Then try it on whatever you're working on:

```
/gtm-analyze        # Scan your project
/gtm-plan           # Build the GTM strategy
/gtm-content readme # Generate a README
/gtm status         # Check your progress
```

It requires Node.js >= 22 (for native SQLite support). MIT licensed. The full source, architecture docs, and hive blueprints are on [GitHub](https://github.com/twofoldtech-dakota/plugin-gtm).

## What's next

- Finalize hive blueprint integration once plugin-hive's execution engine ships
- Template library for common product categories (developer tool, SaaS, API, open-source library)
- Content variant generation for A/B testing
- Analytics integration to close the loop between launch content and actual metrics

If you build with Claude Code and you've ever felt the friction between finishing code and actually shipping, give it a try. And if you have ideas for what a GTM engine should do, [open an issue](https://github.com/twofoldtech-dakota/plugin-gtm/issues).

Ship it, then sell it. From your terminal.
