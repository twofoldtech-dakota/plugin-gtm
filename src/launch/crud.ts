import { randomUUID } from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { getDb } from "../db.js";
import type { LaunchItemRecord, LaunchItemStatus, LaunchItemPriority } from "../types.js";

export function createLaunchItem(input: {
  plan_id: string;
  category: string;
  title: string;
  description?: string;
  priority?: LaunchItemPriority;
  due_date?: string;
}): LaunchItemRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO launch_items (id, plan_id, category, title, description, priority, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.plan_id,
    input.category,
    input.title,
    input.description ?? "",
    input.priority ?? "medium",
    input.due_date ?? null,
    now,
    now,
  );

  return getLaunchItem(id)!;
}

export function getLaunchItem(id: string): LaunchItemRecord | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM launch_items WHERE id = ?").get(id) as unknown as LaunchItemRecord | undefined;
}

export function listLaunchItems(planId: string, status?: LaunchItemStatus): LaunchItemRecord[] {
  const db = getDb();
  if (status) {
    return db
      .prepare("SELECT * FROM launch_items WHERE plan_id = ? AND status = ? ORDER BY priority, created_at")
      .all(planId, status) as unknown as LaunchItemRecord[];
  }
  return db
    .prepare("SELECT * FROM launch_items WHERE plan_id = ? ORDER BY priority, created_at")
    .all(planId) as unknown as LaunchItemRecord[];
}

export function updateLaunchItem(
  id: string,
  updates: Partial<Omit<LaunchItemRecord, "id" | "plan_id" | "created_at">>,
): LaunchItemRecord | undefined {
  const db = getDb();
  const existing = getLaunchItem(id);
  if (!existing) return undefined;

  const fields: string[] = [];
  const values: SQLInputValue[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === "updated_at") continue;
    fields.push(`${key} = ?`);
    values.push(value as SQLInputValue);
  }

  if (updates.status === "done" && !updates.completed_at) {
    fields.push("completed_at = ?");
    values.push(new Date().toISOString());
  }

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE launch_items SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getLaunchItem(id);
}

export function deleteLaunchItem(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM launch_items WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getLaunchProgress(planId: string): {
  total: number;
  done: number;
  in_progress: number;
  pending: number;
  skipped: number;
  percent_complete: number;
} {
  const items = listLaunchItems(planId);
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const in_progress = items.filter((i) => i.status === "in_progress").length;
  const pending = items.filter((i) => i.status === "pending").length;
  const skipped = items.filter((i) => i.status === "skipped").length;
  const percent_complete = total > 0 ? Math.round((done / total) * 100) : 0;

  return { total, done, in_progress, pending, skipped, percent_complete };
}
