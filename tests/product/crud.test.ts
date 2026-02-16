import { describe, it, expect } from "vitest";
import { createProduct, getProduct, listProducts, updateProduct, deleteProduct } from "../../src/product/crud.js";
import { createPlan } from "../../src/plan/crud.js";
import { listPlans } from "../../src/plan/crud.js";
import { useTestDb } from "../helpers/setup-db.js";

describe("product CRUD", () => {
  useTestDb();

  describe("createProduct", () => {
    it("creates with minimal input", () => {
      const p = createProduct({ name: "Test Product" });
      expect(p.id).toBeTruthy();
      expect(p.name).toBe("Test Product");
      expect(p.description).toBe("");
      expect(p.category).toBe("");
      expect(p.target_audience).toBe("");
      expect(p.key_differentiators).toBe("[]");
      expect(p.technical_capabilities).toBe("[]");
      expect(p.project_path).toBeNull();
      expect(p.created_at).toBeTruthy();
      expect(p.updated_at).toBeTruthy();
    });

    it("creates with full input", () => {
      const p = createProduct({
        name: "Full Product",
        description: "A great product",
        category: "SaaS",
        target_audience: "Developers",
        key_differentiators: ["fast", "reliable"],
        technical_capabilities: ["API", "SDK"],
        project_path: "/tmp/project",
      });
      expect(p.name).toBe("Full Product");
      expect(p.description).toBe("A great product");
      expect(p.category).toBe("SaaS");
      expect(p.target_audience).toBe("Developers");
      expect(JSON.parse(p.key_differentiators)).toEqual(["fast", "reliable"]);
      expect(JSON.parse(p.technical_capabilities)).toEqual(["API", "SDK"]);
      expect(p.project_path).toBe("/tmp/project");
    });
  });

  describe("getProduct", () => {
    it("returns product by id", () => {
      const created = createProduct({ name: "Get Me" });
      const found = getProduct(created.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe("Get Me");
    });

    it("returns undefined for unknown id", () => {
      expect(getProduct("nonexistent")).toBeUndefined();
    });
  });

  describe("listProducts", () => {
    it("returns products ordered by created_at DESC", () => {
      const p1 = createProduct({ name: "First" });
      const p2 = createProduct({ name: "Second" });
      const list = listProducts();
      // Most recent first
      const names = list.map((p) => p.name);
      const i1 = names.indexOf("First");
      const i2 = names.indexOf("Second");
      expect(i2).toBeLessThan(i1);
    });
  });

  describe("updateProduct", () => {
    it("updates specified fields", () => {
      const p = createProduct({ name: "Original" });
      const updated = updateProduct(p.id, { name: "Updated", description: "New desc" });
      expect(updated).toBeDefined();
      expect(updated!.name).toBe("Updated");
      expect(updated!.description).toBe("New desc");
      expect(updated!.updated_at).not.toBe(p.updated_at);
    });

    it("returns undefined for unknown id", () => {
      expect(updateProduct("nonexistent", { name: "X" })).toBeUndefined();
    });
  });

  describe("deleteProduct", () => {
    it("deletes product and returns true", () => {
      const p = createProduct({ name: "Delete Me" });
      expect(deleteProduct(p.id)).toBe(true);
      expect(getProduct(p.id)).toBeUndefined();
    });

    it("returns false for unknown id", () => {
      expect(deleteProduct("nonexistent")).toBe(false);
    });

    it("cascades delete to plans", () => {
      const p = createProduct({ name: "Cascade Test" });
      createPlan({ product_id: p.id, name: "Plan 1" });
      createPlan({ product_id: p.id, name: "Plan 2" });
      expect(listPlans(p.id)).toHaveLength(2);

      deleteProduct(p.id);
      expect(listPlans(p.id)).toHaveLength(0);
    });
  });
});
