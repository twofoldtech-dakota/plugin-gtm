import { randomUUID } from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { getDb } from "../db.js";
import type { ProductRecord } from "../types.js";

export function createProduct(input: {
  name: string;
  description?: string;
  category?: string;
  target_audience?: string;
  key_differentiators?: string[];
  technical_capabilities?: string[];
  project_path?: string;
}): ProductRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO products (id, name, description, category, target_audience, key_differentiators, technical_capabilities, project_path, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.name,
    input.description ?? "",
    input.category ?? "",
    input.target_audience ?? "",
    JSON.stringify(input.key_differentiators ?? []),
    JSON.stringify(input.technical_capabilities ?? []),
    input.project_path ?? null,
    now,
    now,
  );

  return getProduct(id)!;
}

export function getProduct(id: string): ProductRecord | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM products WHERE id = ?").get(id) as unknown as ProductRecord | undefined;
}

export function listProducts(): ProductRecord[] {
  const db = getDb();
  return db.prepare("SELECT * FROM products ORDER BY created_at DESC").all() as unknown as ProductRecord[];
}

export function updateProduct(
  id: string,
  updates: Partial<Omit<ProductRecord, "id" | "created_at">>,
): ProductRecord | undefined {
  const db = getDb();
  const existing = getProduct(id);
  if (!existing) return undefined;

  const fields: string[] = [];
  const values: SQLInputValue[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === "updated_at") continue;
    fields.push(`${key} = ?`);
    values.push(value as SQLInputValue);
  }

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  db.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return getProduct(id);
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return result.changes > 0;
}
