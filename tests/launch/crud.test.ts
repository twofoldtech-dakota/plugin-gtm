import { describe, it, expect, beforeEach } from "vitest";
import { createProduct } from "../../src/product/crud.js";
import { createPlan } from "../../src/plan/crud.js";
import {
  createLaunchItem,
  getLaunchItem,
  listLaunchItems,
  updateLaunchItem,
  deleteLaunchItem,
  getLaunchProgress,
} from "../../src/launch/crud.js";
import { useTestDb } from "../helpers/setup-db.js";

describe("launch item CRUD", () => {
  useTestDb();

  let planId: string;

  beforeEach(() => {
    const product = createProduct({ name: "Launch Test Product" });
    const plan = createPlan({ product_id: product.id, name: "Launch Plan" });
    planId = plan.id;
  });

  describe("createLaunchItem", () => {
    it("creates with minimal input", () => {
      const item = createLaunchItem({
        plan_id: planId,
        category: "marketing",
        title: "Write blog post",
      });
      expect(item.id).toBeTruthy();
      expect(item.plan_id).toBe(planId);
      expect(item.category).toBe("marketing");
      expect(item.title).toBe("Write blog post");
      expect(item.description).toBe("");
      expect(item.status).toBe("pending");
      expect(item.priority).toBe("medium");
      expect(item.due_date).toBeNull();
      expect(item.completed_at).toBeNull();
    });

    it("creates with full input", () => {
      const item = createLaunchItem({
        plan_id: planId,
        category: "engineering",
        title: "Deploy v1",
        description: "Push to production",
        priority: "critical",
        due_date: "2025-06-01",
      });
      expect(item.description).toBe("Push to production");
      expect(item.priority).toBe("critical");
      expect(item.due_date).toBe("2025-06-01");
    });
  });

  describe("getLaunchItem", () => {
    it("returns item by id", () => {
      const item = createLaunchItem({ plan_id: planId, category: "ops", title: "Find Me" });
      const found = getLaunchItem(item.id);
      expect(found).toBeDefined();
      expect(found!.title).toBe("Find Me");
    });

    it("returns undefined for unknown id", () => {
      expect(getLaunchItem("nonexistent")).toBeUndefined();
    });
  });

  describe("listLaunchItems", () => {
    it("returns items for plan", () => {
      createLaunchItem({ plan_id: planId, category: "a", title: "Item 1" });
      createLaunchItem({ plan_id: planId, category: "b", title: "Item 2" });
      expect(listLaunchItems(planId)).toHaveLength(2);
    });

    it("filters by status", () => {
      createLaunchItem({ plan_id: planId, category: "a", title: "Pending" });
      const done = createLaunchItem({ plan_id: planId, category: "b", title: "Done" });
      updateLaunchItem(done.id, { status: "done" });

      const doneItems = listLaunchItems(planId, "done");
      expect(doneItems).toHaveLength(1);
      expect(doneItems[0].title).toBe("Done");
    });
  });

  describe("updateLaunchItem", () => {
    it("updates specified fields", () => {
      const item = createLaunchItem({ plan_id: planId, category: "ops", title: "Original" });
      const updated = updateLaunchItem(item.id, { title: "Updated", priority: "high" });
      expect(updated).toBeDefined();
      expect(updated!.title).toBe("Updated");
      expect(updated!.priority).toBe("high");
    });

    it("auto-sets completed_at when status=done", () => {
      const item = createLaunchItem({ plan_id: planId, category: "ops", title: "Complete Me" });
      expect(item.completed_at).toBeNull();

      const updated = updateLaunchItem(item.id, { status: "done" });
      expect(updated!.completed_at).toBeTruthy();
    });

    it("does not override explicit completed_at", () => {
      const item = createLaunchItem({ plan_id: planId, category: "ops", title: "Manual" });
      const updated = updateLaunchItem(item.id, {
        status: "done",
        completed_at: "2025-01-01T00:00:00.000Z",
      });
      expect(updated!.completed_at).toBe("2025-01-01T00:00:00.000Z");
    });

    it("returns undefined for unknown id", () => {
      expect(updateLaunchItem("nonexistent", { title: "X" })).toBeUndefined();
    });
  });

  describe("deleteLaunchItem", () => {
    it("deletes item and returns true", () => {
      const item = createLaunchItem({ plan_id: planId, category: "ops", title: "Delete Me" });
      expect(deleteLaunchItem(item.id)).toBe(true);
      expect(getLaunchItem(item.id)).toBeUndefined();
    });

    it("returns false for unknown id", () => {
      expect(deleteLaunchItem("nonexistent")).toBe(false);
    });
  });

  describe("getLaunchProgress", () => {
    it("returns zero counts for empty plan", () => {
      const progress = getLaunchProgress(planId);
      expect(progress).toEqual({
        total: 0,
        done: 0,
        in_progress: 0,
        pending: 0,
        skipped: 0,
        percent_complete: 0,
      });
    });

    it("counts items by status", () => {
      const i1 = createLaunchItem({ plan_id: planId, category: "a", title: "A" });
      const i2 = createLaunchItem({ plan_id: planId, category: "b", title: "B" });
      const i3 = createLaunchItem({ plan_id: planId, category: "c", title: "C" });
      createLaunchItem({ plan_id: planId, category: "d", title: "D" });

      updateLaunchItem(i1.id, { status: "done" });
      updateLaunchItem(i2.id, { status: "done" });
      updateLaunchItem(i3.id, { status: "in_progress" });
      // i4 stays pending

      const progress = getLaunchProgress(planId);
      expect(progress.total).toBe(4);
      expect(progress.done).toBe(2);
      expect(progress.in_progress).toBe(1);
      expect(progress.pending).toBe(1);
      expect(progress.skipped).toBe(0);
      expect(progress.percent_complete).toBe(50);
    });
  });
});
