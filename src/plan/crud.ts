import { randomUUID } from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { getDb } from "../db.js";
import type { PlanRecord, PlanStatus } from "../types.js";

export function createPlan(input: {
  product_id: string;
  name: string;
  positioning?: Record<string, unknown>;
  messaging?: Record<string, unknown>;
  icp?: Record<string, unknown>;
  channels?: string[];
  pricing?: Record<string, unknown>;
  timeline?: Record<string, unknown>[];
  notes?: string;
}): PlanRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO plans (id, product_id, name, positioning, messaging, icp, channels, pricing, timeline, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.product_id,
    input.name,
    JSON.stringify(input.positioning ?? {}),
    JSON.stringify(input.messaging ?? {}),
    JSON.stringify(input.icp ?? {}),
    JSON.stringify(input.channels ?? []),
    JSON.stringify(input.pricing ?? {}),
    JSON.stringify(input.timeline ?? []),
    input.notes ?? "",
    now,
    now,
  );

  return getPlan(id)!;
}

export function getPlan(id: string): PlanRecord | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM plans WHERE id = ?").get(id) as unknown as PlanRecord | undefined;
}

export function listPlans(productId?: string): PlanRecord[] {
  const db = getDb();
  if (productId) {
    return db.prepare("SELECT * FROM plans WHERE product_id = ? ORDER BY created_at DESC").all(productId) as unknown as PlanRecord[];
  }
  return db.prepare("SELECT * FROM plans ORDER BY created_at DESC").all() as unknown as PlanRecord[];
}

export function updatePlan(
  id: string,
  updates: Partial<Omit<PlanRecord, "id" | "product_id" | "created_at">>,
): PlanRecord | undefined {
  const db = getDb();
  const existing = getPlan(id);
  if (!existing) return undefined;

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

  db.prepare(`UPDATE plans SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getPlan(id);
}

export function updatePlanStatus(id: string, status: PlanStatus): PlanRecord | undefined {
  return updatePlan(id, { status });
}

export function deletePlan(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM plans WHERE id = ?").run(id);
  return result.changes > 0;
}
