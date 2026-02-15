# plugin-gtm Launch Email

Generated via `/gtm-content email` workflow.

---

## Subject Lines

**Primary:** Your next product launch starts with one command

**Alt 1:** We built a GTM engine inside Claude Code — here's what it does

**Alt 2:** Stop context-switching between your code and your launch plan

## Preview Text

Analyze your codebase. Build a GTM plan. Generate all launch content. From the terminal.

---

## Body

You finished building something. Now you need to ship it.

That means positioning, messaging, a launch plan, landing page copy, a README, social posts, and probably some competitive research. Most developers solve this by opening a dozen tabs and cobbling together a strategy in Google Docs.

We built something better.

**plugin-gtm** is a Claude Code plugin that handles go-to-market planning from your terminal — the same place you write code.

Here's how it works:

**1. Analyze your project**
Run `/gtm-analyze` and the plugin scans your codebase — README, package.json, source files, git history — to understand what you built, who it's for, and what makes it different. No forms to fill out.

**2. Build your GTM plan**
Run `/gtm-plan` and walk through positioning, messaging, ideal customer profile, distribution channels, pricing, and a phased launch timeline. It auto-generates a launch checklist with priorities.

**3. Generate launch content**
Run `/gtm-content` to produce landing page copy, a polished README, social media posts (Twitter, LinkedIn, Reddit, HN variants), emails, and blog posts. Everything uses the same messaging framework so your voice stays consistent.

**4. Research the market**
Run `/gtm-research` for competitive analysis, channel research, and pricing benchmarks — all via web search, with findings that feed back into your plan.

Everything persists in SQLite across sessions. No accounts. No SaaS subscriptions. Open source.

plugin-gtm is the third piece of a compound startup toolkit alongside [plugin-architect](https://github.com/twofoldtech-dakota/plugin-architect) (design & build) and [plugin-hive](https://github.com/twofoldtech-dakota/plugin-hive) (multi-agent orchestration).

**Install it now:**

```
claude plugin install https://github.com/twofoldtech-dakota/plugin-gtm.git
```

Then run `/gtm-analyze` on whatever you're working on.

[View on GitHub](https://github.com/twofoldtech-dakota/plugin-gtm)

— Dakota
