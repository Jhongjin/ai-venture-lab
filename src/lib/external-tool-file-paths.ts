export function buildExternalToolCliFilePath(toolFolder: string) {
  return `${toolFolder}/venture-lab-cli.mjs`;
}

export function buildExternalToolSyncFilePath(toolFolder: string) {
  return `${toolFolder}/venture-lab-sync.json`;
}

export function buildExternalToolProgressFilePath(toolFolder: string) {
  return `${toolFolder}/venture-lab-progress.json`;
}

export function buildCursorMcpServerFilePath() {
  return ".cursor/venture-lab-mcp-server.mjs";
}
