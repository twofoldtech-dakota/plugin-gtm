import { describe, it, expect, beforeEach } from "vitest";
import { createProduct } from "../../src/product/crud.js";
import {
  createContent,
  getContent,
  listContent,
  updateContent,
  deleteContent,
} from "../../src/content/crud.js";
import { listVersions } from "../../src/content/versions.js";
import { useTestDb } from "../helpers/setup-db.js";

describe("content CRUD", () => {
  useTestDb();

  let productId: string;

  beforeEach(() => {
    const p = createProduct({ name: "Content Test Product" });
    productId = p.id;
  });

  describe("createContent", () => {
    it("creates with minimal input", () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "My Post",
      });
      expect(c.id).toBeTruthy();
      expect(c.product_id).toBe(productId);
      expect(c.plan_id).toBeNull();
      expect(c.content_type).toBe("blog_post");
      expect(c.title).toBe("My Post");
      expect(c.body).toBe("");
      expect(c.status).toBe("draft");
      expect(c.metadata).toBe("{}");
      expect(c.published_at).toBeNull();
      expect(c.file_path).toBeNull();
    });

    it("creates with full input", () => {
      const c = createContent({
        product_id: productId,
        content_type: "email",
        title: "Welcome Email",
        body: "Hello world",
        status: "review",
        metadata: { variant: "A" },
      });
      expect(c.body).toBe("Hello world");
      expect(c.status).toBe("review");
      expect(JSON.parse(c.metadata)).toEqual({ variant: "A" });
    });
  });

  describe("getContent", () => {
    it("returns content by id", () => {
      const c = createContent({ product_id: productId, content_type: "docs", title: "API Docs" });
      const found = getContent(c.id);
      expect(found).toBeDefined();
      expect(found!.title).toBe("API Docs");
    });

    it("returns undefined for unknown id", () => {
      expect(getContent("nonexistent")).toBeUndefined();
    });
  });

  describe("listContent", () => {
    it("filters by product_id", () => {
      createContent({ product_id: productId, content_type: "blog_post", title: "Post 1" });
      createContent({ product_id: productId, content_type: "email", title: "Email 1" });
      expect(listContent({ product_id: productId })).toHaveLength(2);
    });

    it("filters by content_type", () => {
      createContent({ product_id: productId, content_type: "blog_post", title: "BP" });
      createContent({ product_id: productId, content_type: "email", title: "EM" });
      const blogs = listContent({ product_id: productId, content_type: "blog_post" });
      expect(blogs).toHaveLength(1);
      expect(blogs[0].content_type).toBe("blog_post");
    });

    it("filters by status", () => {
      createContent({ product_id: productId, content_type: "docs", title: "Draft", status: "draft" });
      createContent({ product_id: productId, content_type: "docs", title: "Final", status: "final" });
      const finals = listContent({ product_id: productId, status: "final" });
      expect(finals).toHaveLength(1);
      expect(finals[0].title).toBe("Final");
    });
  });

  describe("updateContent", () => {
    it("updates specified fields", () => {
      const c = createContent({ product_id: productId, content_type: "readme", title: "README" });
      const updated = updateContent(c.id, { title: "Updated README", status: "review" });
      expect(updated).toBeDefined();
      expect(updated!.title).toBe("Updated README");
      expect(updated!.status).toBe("review");
    });

    it("returns undefined for unknown id", () => {
      expect(updateContent("nonexistent", { title: "X" })).toBeUndefined();
    });

    it("auto-snapshots when body changes", () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Versioned",
        body: "v1 body",
      });

      // No versions yet
      expect(listVersions(c.id)).toHaveLength(0);

      // Update body — should create a snapshot of the OLD body
      updateContent(c.id, { body: "v2 body" });
      const versions = listVersions(c.id);
      expect(versions).toHaveLength(1);
      expect(versions[0].body).toBe("v1 body");
      expect(versions[0].version_number).toBe(1);
    });

    it("does NOT snapshot when body is unchanged", () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "No Version",
        body: "same body",
      });

      updateContent(c.id, { title: "New Title" });
      expect(listVersions(c.id)).toHaveLength(0);
    });

    it("does NOT snapshot when body is set to same value", () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Same Body",
        body: "same",
      });

      updateContent(c.id, { body: "same" });
      expect(listVersions(c.id)).toHaveLength(0);
    });
  });

  describe("deleteContent", () => {
    it("deletes content and returns true", () => {
      const c = createContent({ product_id: productId, content_type: "email", title: "Delete Me" });
      expect(deleteContent(c.id)).toBe(true);
      expect(getContent(c.id)).toBeUndefined();
    });

    it("returns false for unknown id", () => {
      expect(deleteContent("nonexistent")).toBe(false);
    });

    it("cascades delete to versions", () => {
      const c = createContent({
        product_id: productId,
        content_type: "blog_post",
        title: "Cascade",
        body: "original",
      });
      updateContent(c.id, { body: "updated" });
      expect(listVersions(c.id)).toHaveLength(1);

      deleteContent(c.id);
      expect(listVersions(c.id)).toHaveLength(0);
    });
  });
});
