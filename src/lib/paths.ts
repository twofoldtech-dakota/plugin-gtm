import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

function getDataDir(): string {
  return process.env.GTM_DATA_DIR || join(homedir(), ".plugin-gtm");
}

export function ensureDataDir(): string {
  const dir = getDataDir();
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getDbPath(): string {
  return join(ensureDataDir(), "gtm.db");
}

export function getLogPath(): string {
  return join(ensureDataDir(), "gtm.log");
}

export function getProjectDir(): string {
  return process.env.PROJECT_DIR || process.cwd();
}
