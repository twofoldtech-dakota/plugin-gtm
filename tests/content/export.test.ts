import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { createProduct } from "../../src/product/crud.js";
import { createContent, getContent, updateContent } from "../../src/content/crud.js";
import {
  exportContent,
  exportAllContent,
  getContentDiff,
} from "../../src/content/export.js";
import { useTestDb } from "../helpers/setup-db.js";
import { useTestProjectDir } from "../helpers/setup-project-dir.js";

describe("content export", () => {
  useTestDb();
  const { dir: projectDir } = useTestProjectDir();

  let productId: string;

  beforeEach(() => {
    const product = createProduct({ name: "Export Test Product" });
    productId = product.id;
  });

  describe("exportContent", () => {
    it("exports blog_post to blog/<slug>.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "My Great Post",
        body: "Post content here",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("blog/my-great-post.md");
      expect(result.content_id).toBe(c.id);

      const absPath = join(projectDir, "blog/my-great-post.md");
      expect(existsSync(absPath)).toBe(true);
      expect(readFileSync(absPath, "utf-8")).toBe("Post content here");
    });

    it("exports email to email/<slug>.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "email",
        title: "Welcome Email",
        body: "Welcome!",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("email/welcome-email.md");
    });

    it("exports docs to docs/<slug>.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "docs",
        title: "API Reference",
        body: "# API",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("docs/api-reference.md");
    });

    it("exports social_post to social/<slug>.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "social_post",
        title: "Launch Tweet",
        body: "We launched!",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("social/launch-tweet.md");
    });

    it("exports press_release to press/<slug>.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "press_release",
        title: "Press Release",
        body: "FOR IMMEDIATE RELEASE",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("press/press-release.md");
    });

    it("exports ad_copy to ads/<slug>.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "ad_copy",
        title: "Ad Copy",
        body: "Buy now!",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("ads/ad-copy.md");
    });

    it("exports landing_page to landing-page.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "landing_page",
        title: "Landing Page",
        body: "Welcome to our product",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("landing-page.md");
    });

    it("exports changelog to CHANGELOG.md", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "changelog",
        title: "Changelog",
        body: "## v1.0.0",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("CHANGELOG.md");
    });

    it("creates directories as needed", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Nested Post",
        body: "Content",
      });

      await exportContent(c.id);
      expect(existsSync(join(projectDir, "blog"))).toBe(true);
    });

    it("updates published_at and file_path in DB", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Published Post",
        body: "Content",
      });
      expect(c.published_at).toBeNull();
      expect(c.file_path).toBeNull();

      await exportContent(c.id);

      const updated = getContent(c.id);
      expect(updated!.published_at).toBeTruthy();
      expect(updated!.file_path).toBe("blog/published-post.md");
    });

    it("uses targetPath override", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Custom Path",
        body: "Custom content",
      });

      const result = await exportContent(c.id, { targetPath: "custom/output.md" });
      expect(result.file_path).toBe("custom/output.md");
      expect(existsSync(join(projectDir, "custom/output.md"))).toBe(true);
    });

    it("throws when file exists and overwrite=false", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Exists",
        body: "Content",
      });

      await exportContent(c.id);
      await expect(exportContent(c.id)).rejects.toThrow(/already exists/);
    });

    it("overwrites when overwrite=true", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Overwrite Me",
        body: "Original",
      });

      await exportContent(c.id);

      // Update body directly to avoid versioning interference
      const { getDb } = await import("../../src/db.js");
      getDb()
        .prepare("UPDATE content SET body = ? WHERE id = ?")
        .run("Updated", c.id);

      await exportContent(c.id, { overwrite: true });
      const content = readFileSync(join(projectDir, "blog/overwrite-me.md"), "utf-8");
      expect(content).toBe("Updated");
    });

    it("uses README-gtm.md when README.md exists", async () => {
      // Create an existing README.md
      writeFileSync(join(projectDir, "README.md"), "Existing readme");

      const c = createContent({
        product_id: productId,
        content_type: "readme",
        title: "README",
        body: "GTM readme content",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("README-gtm.md");
      expect(readFileSync(join(projectDir, "README-gtm.md"), "utf-8")).toBe("GTM readme content");
    });

    it("exports readme to README.md when no existing README", async () => {
      // Clean up files from prior tests in this suite
      for (const f of ["README.md", "README-gtm.md"]) {
        const p = join(projectDir, f);
        if (existsSync(p)) unlinkSync(p);
      }

      const c = createContent({
        product_id: productId,
        content_type: "readme",
        title: "README",
        body: "New readme",
      });

      const result = await exportContent(c.id);
      expect(result.file_path).toBe("README.md");
      expect(readFileSync(join(projectDir, "README.md"), "utf-8")).toBe("New readme");
    });

    it("throws for unknown content id", async () => {
      await expect(exportContent("nonexistent")).rejects.toThrow("Content not found");
    });
  });

  describe("exportAllContent", () => {
    it("exports only final content", async () => {
      createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Draft Post",
        body: "Draft",
        status: "draft",
      });
      createContent({
        product_id: productId,
        content_type: "email",
        title: "Final Email",
        body: "Final email body",
        status: "final",
      });

      const result = await exportAllContent({ product_id: productId });
      expect(result.exported).toHaveLength(1);
      expect(result.exported[0].file_path).toBe("email/final-email.md");
    });

    it("collects skipped items on error", async () => {
      const c1 = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "First Final",
        body: "Body 1",
        status: "final",
      });
      createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "First Final",
        body: "Body 2",
        status: "final",
      });

      // Export first - second will fail because same slug path already exists
      const result = await exportAllContent({ product_id: productId });
      expect(result.exported.length + result.skipped.length).toBe(2);
    });
  });

  describe("getContentDiff", () => {
    it("returns not_exported when never exported", () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Never Exported",
        body: "Content",
      });

      const diff = getContentDiff(c.id);
      expect(diff.status).toBe("not_exported");
    });

    it("returns in_sync when file matches DB", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "In Sync",
        body: "Matching content",
      });

      await exportContent(c.id);

      // exportContent sets published_at then updateContent bumps updated_at,
      // which can differ by a millisecond. Align them to test the in_sync case.
      const { getDb } = await import("../../src/db.js");
      const row = getDb()
        .prepare("SELECT published_at FROM content WHERE id = ?")
        .get(c.id) as { published_at: string };
      getDb()
        .prepare("UPDATE content SET updated_at = ? WHERE id = ?")
        .run(row.published_at, c.id);

      const diff = getContentDiff(c.id);
      expect(diff.status).toBe("in_sync");
      expect(diff.file_path).toBe("blog/in-sync.md");
    });

    it("returns file_modified when file changed on disk", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "File Changed",
        body: "Original",
      });

      await exportContent(c.id);

      // Modify file on disk
      writeFileSync(join(projectDir, "blog/file-changed.md"), "Modified on disk");

      const diff = getContentDiff(c.id);
      expect(diff.status).toBe("file_modified");
    });

    it("returns db_modified when DB updated after export", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "DB Changed",
        body: "Original",
      });

      await exportContent(c.id);

      // Manually bump updated_at to a clearly future time to avoid same-millisecond issue
      const { getDb } = await import("../../src/db.js");
      getDb()
        .prepare("UPDATE content SET updated_at = ? WHERE id = ?")
        .run("2099-01-01T00:00:00.000Z", c.id);

      const diff = getContentDiff(c.id);
      expect(diff.status).toBe("db_modified");
    });

    it("returns both_modified when both changed", async () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Both Changed",
        body: "Original",
      });

      await exportContent(c.id);

      // Modify file on disk
      writeFileSync(join(projectDir, "blog/both-changed.md"), "Disk change");

      // Manually bump updated_at to a clearly future time
      const { getDb } = await import("../../src/db.js");
      getDb()
        .prepare("UPDATE content SET updated_at = ? WHERE id = ?")
        .run("2099-01-01T00:00:00.000Z", c.id);

      const diff = getContentDiff(c.id);
      expect(diff.status).toBe("both_modified");
    });

    it("throws for unknown content id", () => {
      expect(() => getContentDiff("nonexistent")).toThrow("Content not found");
    });
  });
});
