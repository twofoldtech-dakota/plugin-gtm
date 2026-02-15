import { randomUUID } from "node:crypto";
import { getDb } from "../db.js";
import type { ContentVersionRecord } from "../types.js";
import { getContent } from "./crud.js";

export function snapshotVersion(contentId: string, feedback = ""): ContentVersionRecord | undefined {
  const content = getContent(contentId);
  if (!content) return undefined;

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  // Get next version number
  const last = db.prepare(
    "SELECT MAX(version_number) as max_v FROM content_versions WHERE content_id = ?",
  ).get(contentId) as { max_v: number | null } | undefined;
  const versionNumber = (last?.max_v ?? 0) + 1;

  db.prepare(`
    INSERT INTO content_versions (id, content_id, version_number, body, feedback, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, contentId, versionNumber, content.body, feedback, now);

  return getVersion(contentId, versionNumber);
}

export function listVersions(contentId: string): ContentVersionRecord[] {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM content_versions WHERE content_id = ? ORDER BY version_number ASC",
  ).all(contentId) as unknown as ContentVersionRecord[];
}

export function getVersion(contentId: string, versionNumber: number): ContentVersionRecord | undefined {
  const db = getDb();
  return db.prepare(
    "SELECT * FROM content_versions WHERE content_id = ? AND version_number = ?",
  ).get(contentId, versionNumber) as unknown as ContentVersionRecord | undefined;
}

export function restoreVersion(contentId: string, versionNumber: number): ContentVersionRecord | undefined {
  const version = getVersion(contentId, versionNumber);
  if (!version) return undefined;

  const content = getContent(contentId);
  if (!content) return undefined;

  // Snapshot the current body before restoring
  snapshotVersion(contentId, `Restored to version ${versionNumber}`);

  // Update the content body to the restored version
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE content SET body = ?, updated_at = ? WHERE id = ?").run(version.body, now, contentId);

  return version;
}
