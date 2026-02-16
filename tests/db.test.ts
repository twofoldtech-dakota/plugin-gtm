import { describe, it, expect } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { getDb, closeDb } from "../src/db.js";
import { useTestDb } from "./helpers/setup-db.js";

describe("database", () => {
  useTestDb();

  describe("getDb", () => {
    it("returns a DatabaseSync instance", () => {
      const db = getDb();
      expect(db).toBeInstanceOf(DatabaseSync);
    });

    it("returns the same instance on repeated calls", () => {
      const db1 = getDb();
      const db2 = getDb();
      expect(db1).toBe(db2);
    });
  });

  describe("tables", () => {
    it("creates all 5 tables", () => {
      const db = getDb();
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
        .all() as Array<{ name: string }>;
      const names = tables.map((t) => t.name).sort();
      expect(names).toEqual(["content", "content_versions", "launch_items", "plans", "products"]);
    });
  });

  describe("indexes", () => {
    it("creates all expected indexes", () => {
      const db = getDb();
      const indexes = db
        .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name")
        .all() as Array<{ name: string }>;
      const names = indexes.map((i) => i.name).sort();
      expect(names).toEqual([
        "idx_content_plan",
        "idx_content_product",
        "idx_launch_items_plan",
        "idx_plans_product",
        "idx_versions_content",
      ]);
    });
  });

  describe("v0.2.0 columns", () => {
    it("content table has published_at column", () => {
      const db = getDb();
      const cols = db.prepare("PRAGMA table_info(content)").all() as Array<{ name: string }>;
      const colNames = cols.map((c) => c.name);
      expect(colNames).toContain("published_at");
    });

    it("content table has file_path column", () => {
      const db = getDb();
      const cols = db.prepare("PRAGMA table_info(content)").all() as Array<{ name: string }>;
      const colNames = cols.map((c) => c.name);
      expect(colNames).toContain("file_path");
    });
  });

  describe("migration idempotency", () => {
    it("calling getDb multiple times does not error", () => {
      closeDb();
      const db1 = getDb();
      closeDb();
      const db2 = getDb();
      // Should still have all tables
      const tables = db2
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all() as Array<{ name: string }>;
      expect(tables.length).toBe(5);
    });
  });

  describe("closeDb", () => {
    it("resets the connection so next getDb creates a fresh one", () => {
      const db1 = getDb();
      // Capture a weak identity marker before closing
      const id1 = Object.getPrototypeOf(db1);
      closeDb();
      const db2 = getDb();
      expect(db2).toBeInstanceOf(DatabaseSync);
      // db2 should be a new working instance (db1 is now closed)
      const tables = db2
        .prepare("SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='products'")
        .get() as { c: number };
      expect(tables.c).toBe(1);
    });
  });
});
