// ── Product Profile ──────────────────────────────────────────────

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  target_audience: string;
  key_differentiators: string; // JSON array
  technical_capabilities: string; // JSON array
  project_path: string | null;
  created_at: string;
  updated_at: string;
}

// ── GTM Plan ─────────────────────────────────────────────────────

export type PlanStatus = "draft" | "active" | "completed" | "archived";

export interface PlanRecord {
  id: string;
  product_id: string;
  name: string;
  status: PlanStatus;
  positioning: string; // JSON object
  messaging: string; // JSON object
  icp: string; // JSON object (ideal customer profile)
  channels: string; // JSON array
  pricing: string; // JSON object
  timeline: string; // JSON array
  notes: string;
  created_at: string;
  updated_at: string;
}

// ── Content Library ──────────────────────────────────────────────

export type ContentType =
  | "landing_page"
  | "readme"
  | "docs"
  | "email"
  | "social_post"
  | "changelog"
  | "press_release"
  | "blog_post"
  | "ad_copy";

export type ContentStatus = "draft" | "review" | "final";

export interface ContentRecord {
  id: string;
  product_id: string;
  plan_id: string | null;
  content_type: ContentType;
  title: string;
  body: string;
  status: ContentStatus;
  metadata: string; // JSON object (platform, variant, etc.)
  created_at: string;
  updated_at: string;
}

// ── Launch Tracker ───────────────────────────────────────────────

export type LaunchItemStatus = "pending" | "in_progress" | "done" | "skipped";
export type LaunchItemPriority = "critical" | "high" | "medium" | "low";

export interface LaunchItemRecord {
  id: string;
  plan_id: string;
  category: string;
  title: string;
  description: string;
  status: LaunchItemStatus;
  priority: LaunchItemPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
