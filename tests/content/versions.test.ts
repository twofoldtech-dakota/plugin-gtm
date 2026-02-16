import { describe, it, expect, beforeEach } from "vitest";
import { createProduct } from "../../src/product/crud.js";
import { createContent, getContent } from "../../src/content/crud.js";
import { getDb } from "../../src/db.js";
import {
  snapshotVersion,
  listVersions,
  getVersion,
  restoreVersion,
} from "../../src/content/versions.js";
import { useTestDb } from "../helpers/setup-db.js";

describe("content versioning", () => {
  useTestDb();

  let productId: string;
  let contentId: string;

  beforeEach(() => {
    const product = createProduct({ name: "Version Test Product" });
    productId = product.id;
    const content = createContent({
      product_id: productId,
      content_type: "blog_post",
      title: "Versioned Post",
      body: "Original body",
    });
    contentId = content.id;
  });

  describe("snapshotVersion", () => {
    it("creates a version with incrementing number", () => {
      const v1 = snapshotVersion(contentId);
      expect(v1).toBeDefined();
      expect(v1!.version_number).toBe(1);
      expect(v1!.body).toBe("Original body");
      expect(v1!.content_id).toBe(contentId);
      expect(v1!.feedback).toBe("");

      const v2 = snapshotVersion(contentId, "Needs revision");
      expect(v2!.version_number).toBe(2);
      expect(v2!.feedback).toBe("Needs revision");
    });

    it("returns undefined for unknown content", () => {
      expect(snapshotVersion("nonexistent")).toBeUndefined();
    });
  });

  describe("listVersions", () => {
    it("returns versions in ascending order", () => {
      snapshotVersion(contentId);
      snapshotVersion(contentId);
      snapshotVersion(contentId);

      const versions = listVersions(contentId);
      expect(versions).toHaveLength(3);
      expect(versions[0].version_number).toBe(1);
      expect(versions[1].version_number).toBe(2);
      expect(versions[2].version_number).toBe(3);
    });

    it("returns empty array for content with no versions", () => {
      const c = createContent({
        product_id: productId,
        content_type: "email",
        title: "No Versions",
      });
      expect(listVersions(c.id)).toHaveLength(0);
    });
  });

  describe("getVersion", () => {
    it("returns specific version", () => {
      snapshotVersion(contentId);
      snapshotVersion(contentId);

      const v = getVersion(contentId, 2);
      expect(v).toBeDefined();
      expect(v!.version_number).toBe(2);
    });

    it("returns undefined for nonexistent version number", () => {
      expect(getVersion(contentId, 99)).toBeUndefined();
    });
  });

  describe("restoreVersion", () => {
    it("restores content body to specified version", () => {
      // Snapshot original body (v1)
      snapshotVersion(contentId);

      // Manually update body in DB to simulate editing
      getDb()
        .prepare("UPDATE content SET body = ? WHERE id = ?")
        .run("Modified body", contentId);

      // Restore to version 1
      const restored = restoreVersion(contentId, 1);
      expect(restored).toBeDefined();
      expect(restored!.body).toBe("Original body");

      // Content body should be restored
      const content = getContent(contentId);
      expect(content!.body).toBe("Original body");
    });

    it("snapshots current body before restoring", () => {
      snapshotVersion(contentId); // v1: "Original body"

      getDb()
        .prepare("UPDATE content SET body = ? WHERE id = ?")
        .run("Modified body", contentId);

      restoreVersion(contentId, 1);

      // Should have: v1 (Original body), v2 (Modified body - auto-snapshot before restore)
      const versions = listVersions(contentId);
      expect(versions).toHaveLength(2);
      expect(versions[0].body).toBe("Original body");
      expect(versions[1].body).toBe("Modified body");
      expect(versions[1].feedback).toContain("Restored to version 1");
    });

    it("returns undefined for nonexistent version", () => {
      expect(restoreVersion(contentId, 99)).toBeUndefined();
    });
  });
});
