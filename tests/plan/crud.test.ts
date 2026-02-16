import { describe, it, expect, beforeEach } from "vitest";
import { createProduct, deleteProduct } from "../../src/product/crud.js";
import {
  createPlan,
  getPlan,
  listPlans,
  updatePlan,
  updatePlanStatus,
  deletePlan,
} from "../../src/plan/crud.js";
import { createContent, listContent } from "../../src/content/crud.js";
import { createLaunchItem, listLaunchItems } from "../../src/launch/crud.js";
import { useTestDb } from "../helpers/setup-db.js";

describe("plan CRUD", () => {
  useTestDb();

  let productId: string;

  beforeEach(() => {
    const p = createProduct({ name: "Plan Test Product" });
    productId = p.id;
  });

  describe("createPlan", () => {
    it("creates with minimal input", () => {
      const plan = createPlan({ product_id: productId, name: "Basic Plan" });
      expect(plan.id).toBeTruthy();
      expect(plan.product_id).toBe(productId);
      expect(plan.name).toBe("Basic Plan");
      expect(plan.status).toBe("draft");
      expect(plan.positioning).toBe("{}");
      expect(plan.messaging).toBe("{}");
      expect(plan.icp).toBe("{}");
      expect(plan.channels).toBe("[]");
      expect(plan.pricing).toBe("{}");
      expect(plan.timeline).toBe("[]");
      expect(plan.notes).toBe("");
    });

    it("creates with full input and serializes JSON fields", () => {
      const plan = createPlan({
        product_id: productId,
        name: "Full Plan",
        positioning: { headline: "Best tool" },
        messaging: { tone: "professional" },
        icp: { role: "CTO" },
        channels: ["twitter", "linkedin"],
        pricing: { model: "freemium" },
        timeline: [{ phase: "pre-launch", weeks: 2 }],
        notes: "Important notes",
      });
      expect(JSON.parse(plan.positioning)).toEqual({ headline: "Best tool" });
      expect(JSON.parse(plan.messaging)).toEqual({ tone: "professional" });
      expect(JSON.parse(plan.icp)).toEqual({ role: "CTO" });
      expect(JSON.parse(plan.channels)).toEqual(["twitter", "linkedin"]);
      expect(JSON.parse(plan.pricing)).toEqual({ model: "freemium" });
      expect(JSON.parse(plan.timeline)).toEqual([{ phase: "pre-launch", weeks: 2 }]);
      expect(plan.notes).toBe("Important notes");
    });
  });

  describe("getPlan", () => {
    it("returns plan by id", () => {
      const plan = createPlan({ product_id: productId, name: "Find Me" });
      const found = getPlan(plan.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe("Find Me");
    });

    it("returns undefined for unknown id", () => {
      expect(getPlan("nonexistent")).toBeUndefined();
    });
  });

  describe("listPlans", () => {
    it("filters by product_id", () => {
      createPlan({ product_id: productId, name: "Plan A" });
      createPlan({ product_id: productId, name: "Plan B" });

      const plans = listPlans(productId);
      expect(plans).toHaveLength(2);
    });

    it("returns all plans without filter", () => {
      createPlan({ product_id: productId, name: "Plan C" });
      const all = listPlans();
      expect(all.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("updatePlan", () => {
    it("updates specified fields", () => {
      const plan = createPlan({ product_id: productId, name: "Original" });
      const updated = updatePlan(plan.id, { name: "Updated", notes: "Changed" });
      expect(updated).toBeDefined();
      expect(updated!.name).toBe("Updated");
      expect(updated!.notes).toBe("Changed");
    });

    it("serializes JSON objects on update", () => {
      const plan = createPlan({ product_id: productId, name: "JSON Test" });
      const updated = updatePlan(plan.id, {
        positioning: '{"new": true}',
        channels: '["github"]',
      });
      expect(updated!.positioning).toBe('{"new": true}');
      expect(updated!.channels).toBe('["github"]');
    });

    it("returns undefined for unknown id", () => {
      expect(updatePlan("nonexistent", { name: "X" })).toBeUndefined();
    });
  });

  describe("updatePlanStatus", () => {
    it("updates status field", () => {
      const plan = createPlan({ product_id: productId, name: "Status Test" });
      const updated = updatePlanStatus(plan.id, "active");
      expect(updated).toBeDefined();
      expect(updated!.status).toBe("active");
    });
  });

  describe("deletePlan", () => {
    it("deletes plan and returns true", () => {
      const plan = createPlan({ product_id: productId, name: "Delete Me" });
      expect(deletePlan(plan.id)).toBe(true);
      expect(getPlan(plan.id)).toBeUndefined();
    });

    it("returns false for unknown id", () => {
      expect(deletePlan("nonexistent")).toBe(false);
    });

    it("cascades delete to launch items", () => {
      const plan = createPlan({ product_id: productId, name: "Cascade Plan" });
      createLaunchItem({ plan_id: plan.id, category: "marketing", title: "Item 1" });
      expect(listLaunchItems(plan.id)).toHaveLength(1);

      deletePlan(plan.id);
      expect(listLaunchItems(plan.id)).toHaveLength(0);
    });

    it("SET NULL on content plan_id", () => {
      const plan = createPlan({ product_id: productId, name: "FK Plan" });
      const content = createContent({
        product_id: productId,
        plan_id: plan.id,
        content_type: "blog_post",
        title: "Test Content",
      });
      expect(content.plan_id).toBe(plan.id);

      deletePlan(plan.id);
      const updated = listContent({ product_id: productId });
      const found = updated.find((c) => c.id === content.id);
      expect(found).toBeDefined();
      expect(found!.plan_id).toBeNull();
    });
  });

  describe("FK constraint", () => {
    it("throws on invalid product_id", () => {
      expect(() => createPlan({ product_id: "fake-id", name: "Bad Plan" })).toThrow();
    });
  });
});
