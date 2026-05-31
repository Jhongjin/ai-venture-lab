type ExternalToolCliScriptOptions = {
  folder: string;
  label: string;
  startFileName: string;
  guideFileName: string;
};

export function buildToolCliScript(cursorMcpServerScript: string, options: ExternalToolCliScriptOptions) {
  return cursorMcpServerScript
    .replaceAll(".cursor", options.folder)
    .replaceAll("Cursor", options.label)
    .replaceAll("AI_VENTURE_CURSOR_START.md", options.startFileName)
    .replaceAll("README_VENTURE_LAB_CURSOR.md", options.guideFileName);
}

export function buildCodexCliScript(cursorMcpServerScript: string) {
  return cursorMcpServerScript
    .replaceAll(".cursor", ".codex")
    .replaceAll("Cursor", "Codex")
    .replaceAll("AI_VENTURE_CURSOR_START.md", "AI_VENTURE_CODEX_START.md")
    .replaceAll("README_VENTURE_LAB_CURSOR.md", "README_VENTURE_LAB_CODEX.md");
}

export function buildClaudeCliScript(cursorMcpServerScript: string) {
  return buildToolCliScript(cursorMcpServerScript, {
    folder: ".claude",
    label: "Claude Code",
    startFileName: "AI_VENTURE_CLAUDE_START.md",
    guideFileName: "README_VENTURE_LAB_CLAUDE.md",
  });
}

export function buildAntigravityCliScript(cursorMcpServerScript: string) {
  return buildToolCliScript(cursorMcpServerScript, {
    folder: ".antigravity",
    label: "Google Antigravity",
    startFileName: "AI_VENTURE_ANTIGRAVITY_START.md",
    guideFileName: "README_VENTURE_LAB_ANTIGRAVITY.md",
  });
}
