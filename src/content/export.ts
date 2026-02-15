import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getProjectDir } from "../lib/paths.js";
import { getContent, listContent, updateContent } from "./crud.js";
import type { ContentType } from "../types.js";

// ── Path resolution ──────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveDefaultPath(contentType: ContentType, title: string): string {
  const slug = slugify(title);
  const map: Record<ContentType, string> = {
    readme: "README.md",
    blog_post: `blog/${slug}.md`,
    social_post: `social/${slug}.md`,
    landing_page: "landing-page.md",
    email: `email/${slug}.md`,
    changelog: "CHANGELOG.md",
    press_release: `press/${slug}.md`,
    docs: `docs/${slug}.md`,
    ad_copy: `ads/${slug}.md`,
  };
  return map[contentType];
}

// ── Export single content ────────────────────────────────────

export interface ExportResult {
  file_path: string;
  status: string;
  content_id: string;
}

export async function exportContent(
  id: string,
  options?: { targetPath?: string; overwrite?: boolean },
): Promise<ExportResult> {
  const content = getContent(id);
  if (!content) throw new Error("Content not found");

  const projectDir = getProjectDir();
  const relativePath = options?.targetPath ?? resolveDefaultPath(content.content_type, content.title);
  const absPath = join(projectDir, relativePath);

  // Handle readme collision
  let finalPath = absPath;
  if (content.content_type === "readme" && !options?.targetPath) {
    const existing = join(projectDir, "README.md");
    if (existsSync(existing) && !options?.overwrite) {
      finalPath = join(projectDir, "README-gtm.md");
    }
  }

  if (existsSync(finalPath) && !options?.overwrite) {
    throw new Error(`File already exists: ${finalPath}. Use overwrite=true or provide a different target_path.`);
  }

  // Ensure directory exists
  mkdirSync(dirname(finalPath), { recursive: true });

  // Write file
  writeFileSync(finalPath, content.body, "utf-8");

  // Update content metadata
  const now = new Date().toISOString();
  const filePathRelative = finalPath.replace(projectDir + "/", "");
  updateContent(id, {
    published_at: now,
    file_path: filePathRelative,
  } as Parameters<typeof updateContent>[1]);

  return {
    file_path: filePathRelative,
    status: content.status,
    content_id: id,
  };
}

// ── Export all content ───────────────────────────────────────

export interface ExportAllResult {
  exported: ExportResult[];
  skipped: Array<{ content_id: string; title: string; reason: string }>;
}

export async function exportAllContent(
  filters: { product_id?: string; plan_id?: string },
  options?: { overwrite?: boolean },
): Promise<ExportAllResult> {
  const items = listContent({ ...filters, status: "final" });
  const exported: ExportResult[] = [];
  const skipped: ExportAllResult["skipped"] = [];

  for (const item of items) {
    try {
      const result = await exportContent(item.id, { overwrite: options?.overwrite });
      exported.push(result);
    } catch (err) {
      skipped.push({
        content_id: item.id,
        title: item.title,
        reason: String(err instanceof Error ? err.message : err),
      });
    }
  }

  return { exported, skipped };
}

// ── Diff check ───────────────────────────────────────────────

export type DiffStatus = "not_exported" | "in_sync" | "file_modified" | "db_modified" | "both_modified";

export interface DiffResult {
  status: DiffStatus;
  file_path?: string;
}

export function getContentDiff(id: string): DiffResult {
  const content = getContent(id);
  if (!content) throw new Error("Content not found");

  if (!content.file_path || !content.published_at) {
    return { status: "not_exported" };
  }

  const projectDir = getProjectDir();
  const absPath = join(projectDir, content.file_path);

  if (!existsSync(absPath)) {
    return { status: "not_exported", file_path: content.file_path };
  }

  const fileBody = readFileSync(absPath, "utf-8");
  const fileChanged = fileBody !== content.body;
  const dbChanged = content.updated_at > content.published_at;

  if (fileChanged && dbChanged) return { status: "both_modified", file_path: content.file_path };
  if (fileChanged) return { status: "file_modified", file_path: content.file_path };
  if (dbChanged) return { status: "db_modified", file_path: content.file_path };
  return { status: "in_sync", file_path: content.file_path };
}
