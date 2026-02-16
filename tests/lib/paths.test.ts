import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

// We import after env stubs are set up in each test, so use dynamic imports
// or rely on vi.stubEnv working before imports (vitest handles this).

describe("paths", () => {
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe("getDbPath", () => {
    it("uses GTM_DATA_DIR env var when set", async () => {
      const tmp = mkdtempSync(join(tmpdir(), "gtm-paths-"));
      vi.stubEnv("GTM_DATA_DIR", tmp);

      // Dynamic import to pick up env
      const { getDbPath } = await import("../../src/lib/paths.js");
      expect(getDbPath()).toBe(join(tmp, "gtm.db"));
    });

    it("falls back to ~/.plugin-gtm without env var", async () => {
      vi.stubEnv("GTM_DATA_DIR", "");

      const { getDbPath } = await import("../../src/lib/paths.js");
      // When GTM_DATA_DIR is empty string, it's falsy so falls back to homedir
      expect(getDbPath()).toBe(join(homedir(), ".plugin-gtm", "gtm.db"));
    });
  });

  describe("getLogPath", () => {
    it("uses GTM_DATA_DIR env var when set", async () => {
      const tmp = mkdtempSync(join(tmpdir(), "gtm-paths-"));
      vi.stubEnv("GTM_DATA_DIR", tmp);

      const { getLogPath } = await import("../../src/lib/paths.js");
      expect(getLogPath()).toBe(join(tmp, "gtm.log"));
    });
  });

  describe("getProjectDir", () => {
    it("uses PROJECT_DIR env var when set", async () => {
      vi.stubEnv("PROJECT_DIR", "/tmp/my-project");

      const { getProjectDir } = await import("../../src/lib/paths.js");
      expect(getProjectDir()).toBe("/tmp/my-project");
    });

    it("falls back to cwd without env var", async () => {
      vi.stubEnv("PROJECT_DIR", "");

      const { getProjectDir } = await import("../../src/lib/paths.js");
      expect(getProjectDir()).toBe(process.cwd());
    });
  });

  describe("ensureDataDir", () => {
    it("creates the data directory", async () => {
      const tmp = mkdtempSync(join(tmpdir(), "gtm-paths-"));
      const dataDir = join(tmp, "nested", "data");
      vi.stubEnv("GTM_DATA_DIR", dataDir);

      const { ensureDataDir } = await import("../../src/lib/paths.js");
      const result = ensureDataDir();

      expect(result).toBe(dataDir);
      expect(existsSync(dataDir)).toBe(true);
    });
  });
});
