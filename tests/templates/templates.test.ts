import { describe, it, expect } from "vitest";
import { listTemplates, getTemplate } from "../../src/templates/index.js";

describe("templates", () => {
  describe("listTemplates", () => {
    it("returns all 5 templates", () => {
      const templates = listTemplates();
      expect(templates).toHaveLength(5);
    });

    it("each entry has category and description", () => {
      for (const t of listTemplates()) {
        expect(t.category).toBeTruthy();
        expect(t.description).toBeTruthy();
      }
    });

    it("includes expected categories", () => {
      const categories = listTemplates().map((t) => t.category);
      expect(categories).toContain("developer-tool");
      expect(categories).toContain("saas");
      expect(categories).toContain("open-source");
      expect(categories).toContain("cli-tool");
      expect(categories).toContain("api-service");
    });
  });

  describe("getTemplate", () => {
    it("returns a full template for a known category", () => {
      const t = getTemplate("saas");
      expect(t).toBeDefined();
      expect(t!.category).toBe("saas");
      expect(t!.description).toBeTruthy();
      expect(t!.positioning).toBeDefined();
      expect(t!.messaging).toBeDefined();
      expect(t!.icp).toBeDefined();
      expect(Array.isArray(t!.channels)).toBe(true);
      expect(t!.channels.length).toBeGreaterThan(0);
      expect(t!.pricing).toBeDefined();
      expect(Array.isArray(t!.timeline)).toBe(true);
      expect(t!.contentHints).toBeDefined();
      expect(Array.isArray(t!.launchChecklist)).toBe(true);
      expect(t!.launchChecklist.length).toBeGreaterThan(0);
    });

    it("returns undefined for unknown category", () => {
      expect(getTemplate("nonexistent")).toBeUndefined();
    });
  });
});
