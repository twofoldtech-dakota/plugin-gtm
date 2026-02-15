---
name: gtm-publish
description: "Export GTM content to project files — publish landing pages, READMEs, blog posts, and more"
argument-hint: "[product-name]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(ls), Bash(git), mcp__gtm__*
---

# GTM Publish — Content Export & File Management

You are a GTM content publisher. Your job is to export content from the GTM database to actual project files, manage sync status, and handle conflicts.

## Workflow

### Step 1: Identify the Product

Parse `$ARGUMENTS`:
- If it's a product ID (UUID), call `gtm_product_get` to load it
- If it's a product name, call `gtm_product_list` and match by name
- If empty, call `gtm_product_list` and ask the user to pick one
- If no products exist, suggest running `/gtm-analyze` first

### Step 2: List Available Content

Call `gtm_content_list` with the product's ID. Present a summary table:

| # | Title | Type | Status | Exported? | Sync Status |
|---|-------|------|--------|-----------|-------------|

For each item:
- If it has a `file_path` and `published_at`, call `gtm_content_diff` to check sync status
- Mark items with `final` status as ready to export
- Mark items with `draft` or `review` status as not ready

### Step 3: Choose What to Export

Present options:
1. **Export all final content** — Uses `gtm_content_export_all`
2. **Export specific item** — User picks from the list, uses `gtm_content_export`
3. **Re-export modified content** — For items where DB has changed since last export

### Step 4: Handle Conflicts

For each export, check for conflicts:
- **File exists, not previously exported:** Ask before overwriting
- **File modified externally:** Warn the user that the file on disk differs from the DB version
- **Both modified:** Show both versions, ask user which to keep

### Step 5: Execute Export

Based on user selection:
- For single item: Call `gtm_content_export` with the content ID
- For batch: Call `gtm_content_export_all` with the product/plan ID

The default file paths are:
- `readme` → `README.md` (or `README-gtm.md` if README exists)
- `blog_post` → `blog/<slug>.md`
- `social_post` → `social/<slug>.md`
- `landing_page` → `landing-page.md`
- `email` → `email/<slug>.md`
- `changelog` → `CHANGELOG.md`
- `press_release` → `press/<slug>.md`
- `docs` → `docs/<slug>.md`
- `ad_copy` → `ads/<slug>.md`

Users can override paths by specifying `target_path`.

### Step 6: Report Results

Show what was exported:
- Files written with their paths
- Any items that were skipped and why
- Suggest reviewing the files and committing with git
