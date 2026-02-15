export interface GtmTemplate {
  category: string;
  description: string;
  positioning: Record<string, unknown>;
  messaging: Record<string, unknown>;
  icp: Record<string, unknown>;
  channels: string[];
  pricing: Record<string, unknown>;
  timeline: Record<string, unknown>[];
  contentHints: Record<string, string>;
  launchChecklist: Array<{ category: string; title: string; priority: string }>;
}

import { developerToolTemplate } from "./developer-tool.js";
import { saasTemplate } from "./saas.js";
import { openSourceTemplate } from "./open-source.js";
import { cliToolTemplate } from "./cli-tool.js";
import { apiServiceTemplate } from "./api-service.js";

const templates: Map<string, GtmTemplate> = new Map([
  ["developer-tool", developerToolTemplate],
  ["saas", saasTemplate],
  ["open-source", openSourceTemplate],
  ["cli-tool", cliToolTemplate],
  ["api-service", apiServiceTemplate],
]);

export function listTemplates(): Array<{ category: string; description: string }> {
  return Array.from(templates.values()).map((t) => ({
    category: t.category,
    description: t.description,
  }));
}

export function getTemplate(category: string): GtmTemplate | undefined {
  return templates.get(category);
}
