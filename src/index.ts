#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { log } from "./lib/logger.js";

import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
} from "./product/crud.js";
import {
  createPlan,
  getPlan,
  listPlans,
  updatePlan,
  updatePlanStatus,
  deletePlan,
} from "./plan/crud.js";
import {
  createContent,
  getContent,
  listContent,
  updateContent,
  deleteContent,
} from "./content/crud.js";
import {
  createLaunchItem,
  getLaunchItem,
  listLaunchItems,
  updateLaunchItem,
  deleteLaunchItem,
  getLaunchProgress,
} from "./launch/crud.js";

const server = new McpServer({
  name: "gtm",
  version: "0.1.0",
});

// ── Product Tools ────────────────────────────────────────────────

server.tool(
  "gtm_product_create",
  "Create a new product profile from analysis of a project or idea",
  {
    name: z.string().describe("Product name"),
    description: z.string().optional().describe("What the product does"),
    category: z.string().optional().describe("Product category (e.g. developer-tool, saas, api)"),
    target_audience: z.string().optional().describe("Who this product is for"),
    key_differentiators: z.array(z.string()).optional().describe("What makes it unique"),
    technical_capabilities: z.array(z.string()).optional().describe("Core technical features"),
    project_path: z.string().optional().describe("Path to the project codebase"),
  },
  async (params) => {
    try {
      const product = createProduct(params);
      return { content: [{ type: "text", text: JSON.stringify(product, null, 2) }] };
    } catch (err) {
      log.error("gtm_product_create failed", err);
      return { content: [{ type: "text", text: `Error: ${err}` }], isError: true };
    }
  },
);

server.tool(
  "gtm_product_get",
  "Get a product profile by ID",
  { id: z.string().describe("Product ID") },
  async ({ id }) => {
    const product = getProduct(id);
    if (!product) return { content: [{ type: "text", text: "Product not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(product, null, 2) }] };
  },
);

server.tool(
  "gtm_product_list",
  "List all product profiles",
  {},
  async () => {
    const products = listProducts();
    return { content: [{ type: "text", text: JSON.stringify(products, null, 2) }] };
  },
);

server.tool(
  "gtm_product_update",
  "Update a product profile",
  {
    id: z.string().describe("Product ID"),
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    target_audience: z.string().optional(),
    key_differentiators: z.string().optional().describe("JSON array of differentiators"),
    technical_capabilities: z.string().optional().describe("JSON array of capabilities"),
    project_path: z.string().optional(),
  },
  async ({ id, ...updates }) => {
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    const product = updateProduct(id, filtered);
    if (!product) return { content: [{ type: "text", text: "Product not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(product, null, 2) }] };
  },
);

server.tool(
  "gtm_product_delete",
  "Delete a product profile and all associated plans, content, and launch items",
  { id: z.string().describe("Product ID") },
  async ({ id }) => {
    const ok = deleteProduct(id);
    return { content: [{ type: "text", text: ok ? "Deleted" : "Product not found" }] };
  },
);

// ── Plan Tools ───────────────────────────────────────────────────

server.tool(
  "gtm_plan_create",
  "Create a new GTM plan for a product",
  {
    product_id: z.string().describe("Product ID this plan belongs to"),
    name: z.string().describe("Plan name (e.g. 'v1.0 Launch Plan')"),
    positioning: z.record(z.unknown()).optional().describe("Positioning statement, category, value prop"),
    messaging: z.record(z.unknown()).optional().describe("Key messages, taglines, elevator pitch"),
    icp: z.record(z.unknown()).optional().describe("Ideal customer profile"),
    channels: z.array(z.string()).optional().describe("Distribution channels"),
    pricing: z.record(z.unknown()).optional().describe("Pricing strategy"),
    timeline: z.array(z.record(z.unknown())).optional().describe("Launch timeline milestones"),
    notes: z.string().optional(),
  },
  async (params) => {
    try {
      const plan = createPlan(params);
      return { content: [{ type: "text", text: JSON.stringify(plan, null, 2) }] };
    } catch (err) {
      log.error("gtm_plan_create failed", err);
      return { content: [{ type: "text", text: `Error: ${err}` }], isError: true };
    }
  },
);

server.tool(
  "gtm_plan_get",
  "Get a GTM plan by ID",
  { id: z.string().describe("Plan ID") },
  async ({ id }) => {
    const plan = getPlan(id);
    if (!plan) return { content: [{ type: "text", text: "Plan not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(plan, null, 2) }] };
  },
);

server.tool(
  "gtm_plan_list",
  "List GTM plans, optionally filtered by product",
  { product_id: z.string().optional().describe("Filter by product ID") },
  async ({ product_id }) => {
    const plans = listPlans(product_id);
    return { content: [{ type: "text", text: JSON.stringify(plans, null, 2) }] };
  },
);

server.tool(
  "gtm_plan_update",
  "Update a GTM plan with new strategy data",
  {
    id: z.string().describe("Plan ID"),
    name: z.string().optional(),
    status: z.enum(["draft", "active", "completed", "archived"]).optional(),
    positioning: z.record(z.unknown()).optional(),
    messaging: z.record(z.unknown()).optional(),
    icp: z.record(z.unknown()).optional(),
    channels: z.array(z.string()).optional(),
    pricing: z.record(z.unknown()).optional(),
    timeline: z.array(z.record(z.unknown())).optional(),
    notes: z.string().optional(),
  },
  async ({ id, ...updates }) => {
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    const plan = updatePlan(id, filtered);
    if (!plan) return { content: [{ type: "text", text: "Plan not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(plan, null, 2) }] };
  },
);

server.tool(
  "gtm_plan_delete",
  "Delete a GTM plan",
  { id: z.string().describe("Plan ID") },
  async ({ id }) => {
    const ok = deletePlan(id);
    return { content: [{ type: "text", text: ok ? "Deleted" : "Plan not found" }] };
  },
);

// ── Content Tools ────────────────────────────────────────────────

server.tool(
  "gtm_content_create",
  "Store a piece of GTM content (landing page, readme, email, social post, etc.)",
  {
    product_id: z.string().describe("Product ID"),
    plan_id: z.string().optional().describe("Associated plan ID"),
    content_type: z
      .enum([
        "landing_page", "readme", "docs", "email", "social_post",
        "changelog", "press_release", "blog_post", "ad_copy",
      ])
      .describe("Type of content"),
    title: z.string().describe("Content title"),
    body: z.string().optional().describe("Content body"),
    status: z.enum(["draft", "review", "final"]).optional(),
    metadata: z.record(z.unknown()).optional().describe("Extra metadata (platform, variant, etc.)"),
  },
  async (params) => {
    try {
      const item = createContent(params);
      return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
    } catch (err) {
      log.error("gtm_content_create failed", err);
      return { content: [{ type: "text", text: `Error: ${err}` }], isError: true };
    }
  },
);

server.tool(
  "gtm_content_get",
  "Get a content item by ID",
  { id: z.string().describe("Content ID") },
  async ({ id }) => {
    const item = getContent(id);
    if (!item) return { content: [{ type: "text", text: "Content not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
  },
);

server.tool(
  "gtm_content_list",
  "List content items with optional filters",
  {
    product_id: z.string().optional(),
    plan_id: z.string().optional(),
    content_type: z
      .enum([
        "landing_page", "readme", "docs", "email", "social_post",
        "changelog", "press_release", "blog_post", "ad_copy",
      ])
      .optional(),
    status: z.enum(["draft", "review", "final"]).optional(),
  },
  async (filters) => {
    const filtered = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined),
    ) as Parameters<typeof listContent>[0];
    const items = listContent(filtered);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  },
);

server.tool(
  "gtm_content_update",
  "Update a content item",
  {
    id: z.string().describe("Content ID"),
    title: z.string().optional(),
    body: z.string().optional(),
    status: z.enum(["draft", "review", "final"]).optional(),
    metadata: z.record(z.unknown()).optional(),
  },
  async ({ id, ...updates }) => {
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    const item = updateContent(id, filtered);
    if (!item) return { content: [{ type: "text", text: "Content not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
  },
);

server.tool(
  "gtm_content_delete",
  "Delete a content item",
  { id: z.string().describe("Content ID") },
  async ({ id }) => {
    const ok = deleteContent(id);
    return { content: [{ type: "text", text: ok ? "Deleted" : "Content not found" }] };
  },
);

// ── Launch Tracker Tools ─────────────────────────────────────────

server.tool(
  "gtm_launch_item_create",
  "Add a launch checklist item to a plan",
  {
    plan_id: z.string().describe("Plan ID"),
    category: z.string().describe("Category (e.g. 'pre-launch', 'launch-day', 'post-launch')"),
    title: z.string().describe("Item title"),
    description: z.string().optional(),
    priority: z.enum(["critical", "high", "medium", "low"]).optional(),
    due_date: z.string().optional().describe("Due date (ISO 8601)"),
  },
  async (params) => {
    try {
      const item = createLaunchItem(params);
      return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
    } catch (err) {
      log.error("gtm_launch_item_create failed", err);
      return { content: [{ type: "text", text: `Error: ${err}` }], isError: true };
    }
  },
);

server.tool(
  "gtm_launch_item_list",
  "List launch checklist items for a plan",
  {
    plan_id: z.string().describe("Plan ID"),
    status: z.enum(["pending", "in_progress", "done", "skipped"]).optional(),
  },
  async ({ plan_id, status }) => {
    const items = listLaunchItems(plan_id, status);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  },
);

server.tool(
  "gtm_launch_item_update",
  "Update a launch checklist item (mark done, change priority, etc.)",
  {
    id: z.string().describe("Launch item ID"),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["pending", "in_progress", "done", "skipped"]).optional(),
    priority: z.enum(["critical", "high", "medium", "low"]).optional(),
    due_date: z.string().optional(),
  },
  async ({ id, ...updates }) => {
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    const item = updateLaunchItem(id, filtered);
    if (!item) return { content: [{ type: "text", text: "Launch item not found" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }] };
  },
);

server.tool(
  "gtm_launch_item_delete",
  "Delete a launch checklist item",
  { id: z.string().describe("Launch item ID") },
  async ({ id }) => {
    const ok = deleteLaunchItem(id);
    return { content: [{ type: "text", text: ok ? "Deleted" : "Launch item not found" }] };
  },
);

server.tool(
  "gtm_launch_progress",
  "Get launch progress summary for a plan",
  { plan_id: z.string().describe("Plan ID") },
  async ({ plan_id }) => {
    const progress = getLaunchProgress(plan_id);
    return { content: [{ type: "text", text: JSON.stringify(progress, null, 2) }] };
  },
);

// ── Resources ────────────────────────────────────────────────────

server.resource("products", "gtm://products", async () => {
  const products = listProducts();
  return {
    contents: [
      {
        uri: "gtm://products",
        mimeType: "application/json",
        text: JSON.stringify(products, null, 2),
      },
    ],
  };
});

server.resource("plans", "gtm://plans", async () => {
  const plans = listPlans();
  return {
    contents: [
      {
        uri: "gtm://plans",
        mimeType: "application/json",
        text: JSON.stringify(plans, null, 2),
      },
    ],
  };
});

// ── Start ────────────────────────────────────────────────────────

async function main() {
  log.info("GTM MCP server starting");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info("GTM MCP server connected");
}

main().catch((err) => {
  log.error("GTM MCP server fatal error", err);
  process.exit(1);
});
