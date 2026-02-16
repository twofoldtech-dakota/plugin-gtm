import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterAll } from "vitest";
import { vi } from "vitest";

export function useTestProjectDir() {
  const dir = mkdtempSync(join(tmpdir(), "gtm-project-"));

  vi.stubEnv("PROJECT_DIR", dir);

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  return { dir };
}
