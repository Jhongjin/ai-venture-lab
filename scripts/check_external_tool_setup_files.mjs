import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-setup-files.ts")).href;
const {
  buildAntigravityExternalToolSetupFiles,
  buildClaudeExternalToolSetupFiles,
  buildCodexExternalToolSetupFiles,
  buildCursorExternalToolSetupFiles,
} = await import(moduleUrl);

const cursorFiles = buildCursorExternalToolSetupFiles({
  finalAgentRunPackageDraft: "package",
  guideDraft: "guide",
  mcpConfigDraft: "mcp",
  mcpServerDraft: "server",
  ruleDraft: "rules",
  startPromptDraft: "start",
  syncConfigDraft: "sync",
  taskPackageDraft: "tasks",
});
assert.deepEqual(
  cursorFiles.map((file) => file.path),
  [
    "AI_VENTURE_PACKAGE.md",
    "AI_VENTURE_TASKS.md",
    "AI_VENTURE_CURSOR_START.md",
    "README_VENTURE_LAB_CURSOR.md",
    ".cursor/rules/ai-venture-lab.mdc",
    ".cursor/mcp.json",
    ".cursor/venture-lab-cli.mjs",
    ".cursor/venture-lab-mcp-server.mjs",
    ".cursor/venture-lab-sync.json",
    ".cursor/venture-lab-progress.json",
  ],
);
assert.equal(cursorFiles.at(-1).body, "[]\n");

const codexFiles = buildCodexExternalToolSetupFiles({
  agentInstructionsDraft: "agents",
  cliScriptDraft: "cli",
  finalAgentRunPackageDraft: "package",
  guideDraft: "guide",
  startPromptDraft: "start",
  syncConfigDraft: "sync",
  taskPackageDraft: "tasks",
});
assert.deepEqual(codexFiles.slice(-3).map((file) => file.path), [
  ".codex/venture-lab-cli.mjs",
  ".codex/venture-lab-sync.json",
  ".codex/venture-lab-progress.json",
]);

const claudeFiles = buildClaudeExternalToolSetupFiles({
  cliScriptDraft: "cli",
  finalAgentRunPackageDraft: "package",
  guideDraft: "guide",
  instructionsDraft: "instructions",
  mcpConfigDraft: "mcp",
  startPromptDraft: "start",
  syncConfigDraft: "sync",
  taskPackageDraft: "tasks",
});
assert.deepEqual(claudeFiles.map((file) => file.path).filter((filePath) => filePath.startsWith(".")), [
  ".mcp.json",
  ".claude/venture-lab-cli.mjs",
  ".claude/venture-lab-sync.json",
  ".claude/venture-lab-progress.json",
]);

const antigravityFiles = buildAntigravityExternalToolSetupFiles({
  acceptanceDraft: "acceptance",
  agentInstructionsDraft: "agents",
  cliScriptDraft: "cli",
  finalAgentRunPackageDraft: "package",
  guideDraft: "guide",
  mcpConfigDraft: "mcp",
  startPromptDraft: "start",
  syncConfigDraft: "sync",
  taskPackageDraft: "tasks",
});
assert.deepEqual(antigravityFiles.slice(2, 5).map((file) => file.path), [
  "AI_VENTURE_ANTIGRAVITY_START.md",
  "AI_VENTURE_ACCEPTANCE.md",
  "AGENTS.ai-venture-lab.md",
]);

console.log("External tool setup files smoke passed.");
