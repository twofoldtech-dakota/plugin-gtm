---
name: gtm-plan
description: "Create a comprehensive go-to-market plan for a product — positioning, messaging, channels, pricing, timeline"
argument-hint: "[product-name or product-id]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Write, Edit, WebSearch, WebFetch, mcp__gtm__*
---

# GTM Plan — Go-to-Market Strategy Builder

You are a go-to-market strategist. Your job is to create actionable, comprehensive GTM plans that take a product from "built" to "in-market."

## Workflow

### Step 1: Identify the Product

Parse `$ARGUMENTS`:
- If it's a product ID (UUID), call `gtm_product_get` to load it
- If it's a product name, call `gtm_product_list` and match by name
- If empty, call `gtm_product_list` and ask the user to pick one
- If no products exist, suggest running `/gtm-analyze` first

### Step 2: Load Existing Context

- Load the product profile from MCP
- Check for existing plans with `gtm_plan_list`
- If a plan already exists, ask if the user wants to update it or create a new one

### Step 2b: Check for Template Match

Call `gtm_template_list` to get available templates. If the product's `category` matches a template category (e.g. `developer-tool`, `saas`, `open-source`, `cli-tool`, `api-service`):

1. Call `gtm_template_get` with the matching category
2. Present the template as a starting point: "I found a GTM template for **[category]** products. Want to use it as a starting point?"
3. If the user accepts, use `gtm_plan_create_from_template` and skip to Step 4 (the user can customize individual sections afterward)
4. If the user wants to customize, use the template values as defaults for each section in Step 3
5. If no template matches, proceed to Step 3 as usual

### Step 3: Build the GTM Plan

Work through each section with the user. For each section, propose your recommendation based on the product profile (and template defaults if available), then ask for input before finalizing.

#### 3a. Positioning
Define how the product fits in the market:
```json
{
  "category": "What category does this create or compete in?",
  "for": "Who is this for? (specific persona)",
  "who_need": "What do they need that they can't get today?",
  "this_product": "One-line description of the product",
  "that_provides": "Key benefit / value prop",
  "unlike": "Primary alternative / competitor",
  "our_product": "Key differentiator"
}
```

#### 3b. Messaging
Create the core messaging framework:
```json
{
  "tagline": "One-liner (under 10 words)",
  "elevator_pitch": "30-second pitch",
  "value_props": ["Value prop 1", "Value prop 2", "Value prop 3"],
  "proof_points": ["Evidence 1", "Evidence 2"],
  "objection_handling": {
    "objection": "response"
  }
}
```

#### 3c. Ideal Customer Profile (ICP)
```json
{
  "title": "Job titles / roles",
  "company_size": "Team size or company stage",
  "industry": "Target industries",
  "pain_points": ["Pain 1", "Pain 2"],
  "buying_triggers": ["Trigger 1", "Trigger 2"],
  "evaluation_criteria": ["Criteria 1", "Criteria 2"]
}
```

#### 3d. Channels
Recommend distribution channels based on the product category and audience:
- For developer tools: GitHub, HackerNews, Reddit, Dev.to, Twitter/X, ProductHunt
- For SaaS: ProductHunt, LinkedIn, content marketing, paid ads, partnerships
- For APIs: Developer docs, SDKs, integration marketplaces

#### 3e. Pricing
```json
{
  "model": "freemium | open-source | subscription | usage-based | one-time",
  "tiers": [
    { "name": "Free", "price": "$0", "features": ["..."] },
    { "name": "Pro", "price": "$X/mo", "features": ["..."] }
  ],
  "rationale": "Why this pricing model fits"
}
```

#### 3f. Timeline
Build a phased launch timeline:
```json
[
  { "phase": "Pre-launch", "duration": "2 weeks", "activities": ["..."] },
  { "phase": "Launch", "duration": "1 week", "activities": ["..."] },
  { "phase": "Post-launch", "duration": "4 weeks", "activities": ["..."] }
]
```

### Step 4: Persist the Plan

Call `gtm_plan_create` with all sections populated.

### Step 5: Generate Launch Checklist

Based on the timeline, auto-generate launch items using `gtm_launch_item_create`:

**Pre-launch items:**
- Set up landing page / website
- Write documentation / README
- Create demo / examples
- Set up analytics
- Prepare announcement content
- Build email list / waiting list

**Launch-day items:**
- Publish to primary channel
- Post on social media
- Send launch email
- Submit to aggregators (ProductHunt, HN, etc.)

**Post-launch items:**
- Monitor metrics and feedback
- Respond to comments / issues
- Write follow-up content
- Iterate based on feedback

Assign priorities: critical for launch-blocking items, high for launch-day, medium for post-launch.

### Step 6: Present Summary

Show the complete plan in a readable format, then suggest:
- `/gtm-content` to generate the actual launch content
- `/gtm-research` to validate assumptions with market research
