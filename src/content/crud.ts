import { randomUUID } from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { getDb } from "../db.js";
import type { ContentRecord, ContentType, ContentStatus } from "../types.js";
import { snapshotVersion } from "./versions.js";

export function createContent(input: {
  product_id: string;
  plan_id?: string;
  content_type: ContentType;
  title: string;
  body?: string;
  status?: ContentStatus;
  metadata?: Record<string, unknown>;
}): ContentRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO content (id, product_id, plan_id, content_type, title, body, status, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.product_id,
    input.plan_id ?? null,
    input.content_type,
    input.title,
    input.body ?? "",
    input.status ?? "draft",
    JSON.stringify(input.metadata ?? {}),
    now,
    now,
  );

  return getContent(id)!;
}

export function getContent(id: string): ContentRecord | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM content WHERE id = ?").get(id) as unknown as ContentRecord | undefined;
}

export function listContent(filters?: {
  product_id?: string;
  plan_id?: string;
  content_type?: ContentType;
  status?: ContentStatus;
}): ContentRecord[] {
  const db = getDb();
  const conditions: string[] = [];
  const values: SQLInputValue[] = [];

  if (filters?.product_id) {
    conditions.push("product_id = ?");
    values.push(filters.product_id);
  }
  if (filters?.plan_id) {
    conditions.push("plan_id = ?");
    values.push(filters.plan_id);
  }
  if (filters?.content_type) {
    conditions.push("content_type = ?");
    values.push(filters.content_type);
  }
  if (filters?.status) {
    conditions.push("status = ?");
    values.push(filters.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return db.prepare(`SELECT * FROM content ${where} ORDER BY created_at DESC`).all(...values) as unknown as ContentRecord[];
}

export function updateContent(
  id: string,
  updates: Partial<Omit<ContentRecord, "id" | "product_id" | "created_at">>,
): ContentRecord | undefined {
  const db = getDb();
  const existing = getContent(id);
  if (!existing) return undefined;

  // Auto-snapshot the current body before updating if body is changing
  if (updates.body !== undefined && updates.body !== existing.body) {
    snapshotVersion(id);
  }

  const fields: string[] = [];
  const values: SQLInputValue[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === "updated_at") continue;
    fields.push(`${key} = ?`);
    values.push((typeof value === "object" ? JSON.stringify(value) : value) as SQLInputValue);
  }

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE content SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getContent(id);
}

export function deleteContent(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM content WHERE id = ?").run(id);
  return result.changes > 0;
}
