import type { BuildSyncTool } from "@/lib/build-sync-token";

const buildSyncToolLabels: Record<BuildSyncTool, string> = {
  antigravity: "Google Antigravity",
  claude_code: "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
};

export function isBuildSyncTool(value: unknown): value is BuildSyncTool {
  return value === "cursor" || value === "codex" || value === "claude_code" || value === "antigravity";
}

export function getBuildSyncToolLabel(tool: BuildSyncTool) {
  return buildSyncToolLabels[tool];
}
