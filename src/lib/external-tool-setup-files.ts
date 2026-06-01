export type ExternalToolSetupFileDraft = {
  body: string;
  path: string;
};

export function buildCursorExternalToolSetupFiles({
  finalAgentRunPackageDraft,
  guideDraft,
  mcpConfigDraft,
  mcpServerDraft,
  ruleDraft,
  startPromptDraft,
  syncConfigDraft,
  taskPackageDraft,
}: {
  finalAgentRunPackageDraft: string;
  guideDraft: string;
  mcpConfigDraft: string;
  mcpServerDraft: string;
  ruleDraft: string;
  startPromptDraft: string;
  syncConfigDraft: string;
  taskPackageDraft: string;
}): ExternalToolSetupFileDraft[] {
  return [
    { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
    { path: "AI_VENTURE_TASKS.md", body: taskPackageDraft },
    { path: "AI_VENTURE_CURSOR_START.md", body: startPromptDraft },
    { path: "README_VENTURE_LAB_CURSOR.md", body: guideDraft },
    { path: ".cursor/rules/ai-venture-lab.mdc", body: ruleDraft },
    { path: ".cursor/mcp.json", body: mcpConfigDraft },
    { path: ".cursor/venture-lab-cli.mjs", body: mcpServerDraft },
    { path: ".cursor/venture-lab-mcp-server.mjs", body: mcpServerDraft },
    { path: ".cursor/venture-lab-sync.json", body: syncConfigDraft },
    { path: ".cursor/venture-lab-progress.json", body: "[]\n" },
  ];
}

export function buildCodexExternalToolSetupFiles({
  agentInstructionsDraft,
  cliScriptDraft,
  finalAgentRunPackageDraft,
  guideDraft,
  startPromptDraft,
  syncConfigDraft,
  taskPackageDraft,
}: {
  agentInstructionsDraft: string;
  cliScriptDraft: string;
  finalAgentRunPackageDraft: string;
  guideDraft: string;
  startPromptDraft: string;
  syncConfigDraft: string;
  taskPackageDraft: string;
}): ExternalToolSetupFileDraft[] {
  return [
    { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
    { path: "AI_VENTURE_TASKS.md", body: taskPackageDraft },
    { path: "AI_VENTURE_CODEX_START.md", body: startPromptDraft },
    { path: "AGENTS.ai-venture-lab.md", body: agentInstructionsDraft },
    { path: "README_VENTURE_LAB_CODEX.md", body: guideDraft },
    { path: ".codex/venture-lab-cli.mjs", body: cliScriptDraft },
    { path: ".codex/venture-lab-sync.json", body: syncConfigDraft },
    { path: ".codex/venture-lab-progress.json", body: "[]\n" },
  ];
}

export function buildClaudeExternalToolSetupFiles({
  cliScriptDraft,
  finalAgentRunPackageDraft,
  guideDraft,
  instructionsDraft,
  mcpConfigDraft,
  startPromptDraft,
  syncConfigDraft,
  taskPackageDraft,
}: {
  cliScriptDraft: string;
  finalAgentRunPackageDraft: string;
  guideDraft: string;
  instructionsDraft: string;
  mcpConfigDraft: string;
  startPromptDraft: string;
  syncConfigDraft: string;
  taskPackageDraft: string;
}): ExternalToolSetupFileDraft[] {
  return [
    { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
    { path: "AI_VENTURE_TASKS.md", body: taskPackageDraft },
    { path: "AI_VENTURE_CLAUDE_START.md", body: startPromptDraft },
    { path: "CLAUDE.md", body: instructionsDraft },
    { path: "README_VENTURE_LAB_CLAUDE.md", body: guideDraft },
    { path: ".mcp.json", body: mcpConfigDraft },
    { path: ".claude/venture-lab-cli.mjs", body: cliScriptDraft },
    { path: ".claude/venture-lab-sync.json", body: syncConfigDraft },
    { path: ".claude/venture-lab-progress.json", body: "[]\n" },
  ];
}

export function buildAntigravityExternalToolSetupFiles({
  acceptanceDraft,
  agentInstructionsDraft,
  cliScriptDraft,
  finalAgentRunPackageDraft,
  guideDraft,
  mcpConfigDraft,
  startPromptDraft,
  syncConfigDraft,
  taskPackageDraft,
}: {
  acceptanceDraft: string;
  agentInstructionsDraft: string;
  cliScriptDraft: string;
  finalAgentRunPackageDraft: string;
  guideDraft: string;
  mcpConfigDraft: string;
  startPromptDraft: string;
  syncConfigDraft: string;
  taskPackageDraft: string;
}): ExternalToolSetupFileDraft[] {
  return [
    { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
    { path: "AI_VENTURE_TASKS.md", body: taskPackageDraft },
    { path: "AI_VENTURE_ANTIGRAVITY_START.md", body: startPromptDraft },
    { path: "AI_VENTURE_ACCEPTANCE.md", body: acceptanceDraft },
    { path: "AGENTS.ai-venture-lab.md", body: agentInstructionsDraft },
    { path: "README_VENTURE_LAB_ANTIGRAVITY.md", body: guideDraft },
    { path: ".antigravity/mcp_config.json", body: mcpConfigDraft },
    { path: ".antigravity/venture-lab-cli.mjs", body: cliScriptDraft },
    { path: ".antigravity/venture-lab-sync.json", body: syncConfigDraft },
    { path: ".antigravity/venture-lab-progress.json", body: "[]\n" },
  ];
}
