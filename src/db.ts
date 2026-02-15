import { DatabaseSync } from "node:sqlite";
import { getDbPath } from "./lib/paths.js";
import { log } from "./lib/logger.js";

let db: DatabaseSync | null = null;
let connectedAt = 0;
const TTL = 5_000;

export function getDb(): DatabaseSync {
  const now = Date.now();
  if (db && now - connectedAt < TTL) return db;
  if (db) {
    try {
      db.close();
    } catch {
      // ignore
    }
  }
  const path = getDbPath();
  db = new DatabaseSync(path);
  connectedAt = now;
  db.exec("PRAGMA journal_mode=WAL");
  db.exec("PRAGMA foreign_keys=ON");
  migrate(db);
  log.info("Database connected", { path });
  return db;
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      target_audience TEXT NOT NULL DEFAULT '',
      key_differentiators TEXT NOT NULL DEFAULT '[]',
      technical_capabilities TEXT NOT NULL DEFAULT '[]',
      project_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','active','completed','archived')),
      positioning TEXT NOT NULL DEFAULT '{}',
      messaging TEXT NOT NULL DEFAULT '{}',
      icp TEXT NOT NULL DEFAULT '{}',
      channels TEXT NOT NULL DEFAULT '[]',
      pricing TEXT NOT NULL DEFAULT '{}',
      timeline TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      plan_id TEXT REFERENCES plans(id) ON DELETE SET NULL,
      content_type TEXT NOT NULL CHECK(content_type IN (
        'landing_page','readme','docs','email','social_post',
        'changelog','press_release','blog_post','ad_copy'
      )),
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','final')),
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS launch_items (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      category TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','done','skipped')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('critical','high','medium','low')),
      due_date TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_plans_product ON plans(product_id);
    CREATE INDEX IF NOT EXISTS idx_content_product ON content(product_id);
    CREATE INDEX IF NOT EXISTS idx_content_plan ON content(plan_id);
    CREATE INDEX IF NOT EXISTS idx_launch_items_plan ON launch_items(plan_id);
  `);
}

export function closeDb(): void {
  if (db) {
    try {
      db.close();
    } catch {
      // ignore
    }
    db = null;
  }
}
