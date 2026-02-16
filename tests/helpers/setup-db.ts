import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { beforeEach, afterAll } from "vitest";
import { vi } from "vitest";
import { closeDb } from "../../src/db.js";

export function useTestDb() {
  const dir = mkdtempSync(join(tmpdir(), "gtm-test-"));

  vi.stubEnv("GTM_DATA_DIR", dir);

  beforeEach(() => {
    closeDb();
  });

  afterAll(() => {
    closeDb();
    vi.unstubAllEnvs();
  });

  return { dir };
}
