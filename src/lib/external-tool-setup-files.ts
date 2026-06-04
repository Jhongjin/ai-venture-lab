import {
  buildCursorMcpServerFilePath,
  buildExternalToolCliFilePath,
  buildExternalToolProgressFilePath,
  buildExternalToolSyncFilePath,
} from "@/lib/external-tool-file-paths";

export type ExternalToolSetupFileDraft = {
  body: string;
  path: string;
};
export type ExternalToolCoreSetupFilesInput = {
  finalAgentRunPackageDraft: string;
  startPromptDraft: string;
  startPromptPath: string;
  taskPackageDraft: string;
};

const externalToolProgressFileBody = "[]\n";

export function buildExternalToolProgressFile(path: string): ExternalToolSetupFileDraft {
  return { path, body: externalToolProgressFileBody };
}

export function buildExternalToolCoreSetupFiles({
  finalAgentRunPackageDraft,
  startPromptDraft,
  startPromptPath,
  taskPackageDraft,
}: ExternalToolCoreSetupFilesInput): ExternalToolSetupFileDraft[] {
  return [
    { path: "AI_VENTURE_PACKAGE.md", body: finalAgentRunPackageDraft },
    { path: "AI_VENTURE_TASKS.md", body: taskPackageDraft },
    { path: startPromptPath, body: startPromptDraft },
  ];
}

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
    ...buildExternalToolCoreSetupFiles({
      finalAgentRunPackageDraft,
      startPromptDraft,
      startPromptPath: "AI_VENTURE_CURSOR_START.md",
      taskPackageDraft,
    }),
    { path: "README_VENTURE_LAB_CURSOR.md", body: guideDraft },
    { path: ".cursor/rules/ai-venture-lab.mdc", body: ruleDraft },
    { path: ".cursor/mcp.json", body: mcpConfigDraft },
    { path: buildExternalToolCliFilePath(".cursor"), body: mcpServerDraft },
    { path: buildCursorMcpServerFilePath(), body: mcpServerDraft },
    { path: buildExternalToolSyncFilePath(".cursor"), body: syncConfigDraft },
    buildExternalToolProgressFile(buildExternalToolProgressFilePath(".cursor")),
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
    ...buildExternalToolCoreSetupFiles({
      finalAgentRunPackageDraft,
      startPromptDraft,
      startPromptPath: "AI_VENTURE_CODEX_START.md",
      taskPackageDraft,
    }),
    { path: "AGENTS.ai-venture-lab.md", body: agentInstructionsDraft },
    { path: "README_VENTURE_LAB_CODEX.md", body: guideDraft },
    { path: buildExternalToolCliFilePath(".codex"), body: cliScriptDraft },
    { path: buildExternalToolSyncFilePath(".codex"), body: syncConfigDraft },
    buildExternalToolProgressFile(buildExternalToolProgressFilePath(".codex")),
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
    ...buildExternalToolCoreSetupFiles({
      finalAgentRunPackageDraft,
      startPromptDraft,
      startPromptPath: "AI_VENTURE_CLAUDE_START.md",
      taskPackageDraft,
    }),
    { path: "CLAUDE.md", body: instructionsDraft },
    { path: "README_VENTURE_LAB_CLAUDE.md", body: guideDraft },
    { path: ".mcp.json", body: mcpConfigDraft },
    { path: buildExternalToolCliFilePath(".claude"), body: cliScriptDraft },
    { path: buildExternalToolSyncFilePath(".claude"), body: syncConfigDraft },
    buildExternalToolProgressFile(buildExternalToolProgressFilePath(".claude")),
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
    ...buildExternalToolCoreSetupFiles({
      finalAgentRunPackageDraft,
      startPromptDraft,
      startPromptPath: "AI_VENTURE_ANTIGRAVITY_START.md",
      taskPackageDraft,
    }),
    { path: "AI_VENTURE_ACCEPTANCE.md", body: acceptanceDraft },
    { path: "AGENTS.ai-venture-lab.md", body: agentInstructionsDraft },
    { path: "README_VENTURE_LAB_ANTIGRAVITY.md", body: guideDraft },
    { path: ".antigravity/mcp_config.json", body: mcpConfigDraft },
    { path: buildExternalToolCliFilePath(".antigravity"), body: cliScriptDraft },
    { path: buildExternalToolSyncFilePath(".antigravity"), body: syncConfigDraft },
    buildExternalToolProgressFile(buildExternalToolProgressFilePath(".antigravity")),
  ];
}
