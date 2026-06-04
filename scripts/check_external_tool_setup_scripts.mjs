import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function transpileModuleUrl(modulePath, replacements = []) {
  const absolutePath = path.join(process.cwd(), modulePath);
  let source = readFileSync(absolutePath, "utf8");
  for (const [from, to] of replacements) {
    source = source.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const downloadFileNameUrl = pathToFileURL(path.join(process.cwd(), "src/lib/download-file-name.ts")).href;
const externalToolFilePathsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/external-tool-file-paths.ts")).href;
const setupFilesUrl = transpileModuleUrl("src/lib/external-tool-setup-files.ts", [
  ['from "@/lib/external-tool-file-paths";', `from ${JSON.stringify(externalToolFilePathsUrl)};`],
]);
const handoffMarkdownStubUrl = `data:text/javascript;base64,${Buffer.from(`
function formatGuide(tool, args) {
  return tool + "-guide:" + args.idea.name + ":" + args.productSurface.label + ":" + args.projectKey + ":" + args.syncExpiresAt;
}
export function buildAntigravityGuideMarkdown(args) {
  return formatGuide("antigravity", args);
}
export function buildClaudeGuideMarkdown(args) {
  return formatGuide("claude", args);
}
export function buildCodexGuideMarkdown(args) {
  return formatGuide("codex", args);
}
export function buildCursorGuideMarkdown(args) {
  return formatGuide("cursor", args);
}
`).toString("base64")}`;
const moduleUrl = transpileModuleUrl("src/lib/external-tool-setup-scripts.ts", [
  ['from "@/lib/download-file-name";', `from ${JSON.stringify(downloadFileNameUrl)};`],
  ['from "@/lib/external-tool-file-paths";', `from ${JSON.stringify(externalToolFilePathsUrl)};`],
  ['from "@/lib/external-tool-setup-files";', `from ${JSON.stringify(setupFilesUrl)};`],
  ['from "@/lib/external-tool-handoff-markdown";', `from ${JSON.stringify(handoffMarkdownStubUrl)};`],
]);
const {
  buildExternalToolSetupIgnoreEntries,
  buildAntigravitySetupDownloadConfig,
  buildClaudeSetupDownloadConfig,
  buildCodexSetupDownloadConfig,
  buildCursorSetupPowerShell,
  buildCursorSetupDownloadConfig,
  buildLiveExternalToolSetupDownloadDraft,
  buildLiveToolSetupPowerShell,
  buildPowerShellStringArray,
  buildSetupFileRows,
  escapePowerShellSingleQuoted,
} = await import(moduleUrl);

const idea = {
  id: "idea-1",
  name: "AI Venture Lab",
};
const productSurface = {
  label: "운영 콘솔",
};

assert.equal(escapePowerShellSingleQuoted("a'b"), "a''b");
assert.deepEqual(buildExternalToolSetupIgnoreEntries(".cursor"), [
  ".cursor/venture-lab-sync.json",
  ".cursor/venture-lab-progress.json",
]);
assert.equal(buildPowerShellStringArray(["one", "two"]), '@("one", "two")');
assert.equal(
  buildSetupFileRows([{ base64: "abc", path: ".cursor/rules/owner's-rule.mdc" }]),
  "  @{ Path = '.cursor/rules/owner''s-rule.mdc'; Base64 = 'abc' }",
);

const cursorConfig = buildCursorSetupDownloadConfig({
  cursorMcpConfigDraft: "cursor mcp config",
  cursorMcpServerDraft: "cursor server",
  cursorRuleDraft: "cursor rule",
  cursorStartPromptDraft: "cursor start",
  cursorTaskPackageDraft: "cursor tasks",
  finalAgentRunPackageDraft: "agent package",
});
const codexConfig = buildCodexSetupDownloadConfig({
  codexAgentInstructionsDraft: "codex instructions",
  codexCliScriptDraft: "codex cli",
  codexStartPromptDraft: "codex start",
  codexTaskPackageDraft: "codex tasks",
  finalAgentRunPackageDraft: "agent package",
});
const claudeConfig = buildClaudeSetupDownloadConfig({
  claudeCliScriptDraft: "claude cli",
  claudeInstructionsDraft: "claude instructions",
  claudeMcpConfigDraft: "claude mcp",
  claudeStartPromptDraft: "claude start",
  claudeTaskPackageDraft: "claude tasks",
  finalAgentRunPackageDraft: "agent package",
});
const antigravityConfig = buildAntigravitySetupDownloadConfig({
  antigravityAcceptanceDraft: "antigravity acceptance",
  antigravityAgentInstructionsDraft: "antigravity instructions",
  antigravityCliScriptDraft: "antigravity cli",
  antigravityMcpConfigDraft: "antigravity mcp",
  antigravityStartPromptDraft: "antigravity start",
  antigravityTaskPackageDraft: "antigravity tasks",
  finalAgentRunPackageDraft: "agent package",
});

assert.deepEqual(
  [cursorConfig.tool, codexConfig.tool, claudeConfig.tool, antigravityConfig.tool],
  ["cursor", "codex", "claude_code", "antigravity"],
);
assert.deepEqual(
  [cursorConfig.fileSuffix, codexConfig.fileSuffix, claudeConfig.fileSuffix, antigravityConfig.fileSuffix],
  ["cursor-setup", "codex-setup", "claude-code-setup", "antigravity-setup"],
);
assert.match(cursorConfig.successMessage, /venture_record_progress/);
assert.match(claudeConfig.successMessage, /record-progress/);
assert.match(antigravityConfig.errorMessage, /Google Antigravity/);
assert.deepEqual(
  codexConfig.buildFiles({ guideDraft: "codex guide", syncConfigDraft: "sync" }).map((file) => file.path),
  [
    "AI_VENTURE_PACKAGE.md",
    "AI_VENTURE_TASKS.md",
    "AI_VENTURE_CODEX_START.md",
    "AGENTS.ai-venture-lab.md",
    "README_VENTURE_LAB_CODEX.md",
    ".codex/venture-lab-cli.mjs",
    ".codex/venture-lab-sync.json",
    ".codex/venture-lab-progress.json",
  ],
);

const downloadDraft = buildLiveExternalToolSetupDownloadDraft({
  config: cursorConfig,
  encodeSetupFiles: (files) => files.map((file) => ({ base64: `encoded:${file.body}`, path: file.path })),
  idea,
  productSurface,
  projectKey: "PROJECT-1",
  syncConfigDraft: "sync-config",
  syncExpiresAt: "2026-06-02T00:00:00.000Z",
});

assert.equal(downloadDraft.label, "Cursor 연결 스크립트");
assert.equal(downloadDraft.fileName, "ai-venture-lab-cursor-setup.ps1");
assert.equal(downloadDraft.mimeType, "text/plain;charset=utf-8");
assert.match(downloadDraft.body, /AI Venture Lab Cursor connection setup/);
assert.match(downloadDraft.body, /AI_VENTURE_PACKAGE.md/);
assert.match(downloadDraft.body, /README_VENTURE_LAB_CURSOR.md/);
assert.match(downloadDraft.body, /encoded:cursor-guide:AI Venture Lab:운영 콘솔:PROJECT-1:2026-06-02T00:00:00.000Z/);
assert.match(downloadDraft.body, /.cursor\/venture-lab-sync.json/);

const cursorScript = buildCursorSetupPowerShell({
  files: [{ base64: "abc", path: ".cursor/rules/ai-venture-lab.mdc" }],
  idea,
  projectKey: "PROJECT-1",
});
assert.match(cursorScript, /AI Venture Lab Cursor connection setup/);
assert.match(cursorScript, /\$ignoreEntries = @\(".cursor\/venture-lab-sync.json", ".cursor\/venture-lab-progress.json"\)/);
assert.match(cursorScript, /node .cursor\/venture-lab-cli.mjs next-task/);

const liveScript = buildLiveToolSetupPowerShell({
  files: [{ base64: "abc", path: ".claude/venture-lab-cli.mjs" }],
  folder: ".claude",
  idea,
  projectKey: "PROJECT-1",
  startFileName: "AI_VENTURE_CLAUDE_START.md",
  toolLabel: "Claude Code",
});
assert.match(liveScript, /AI Venture Lab Claude Code connection setup/);
assert.match(liveScript, /node .claude\/venture-lab-cli.mjs next-task/);
assert.match(liveScript, /AI_VENTURE_CLAUDE_START.md/);

const antigravityScript = antigravityConfig.buildSetupScript({
  files: [{ base64: "abc", path: ".antigravity/venture-lab-cli.mjs" }],
  idea,
  projectKey: "PROJECT-1",
});
assert.match(antigravityScript, /AI Venture Lab Google Antigravity connection setup/);
assert.match(antigravityScript, /AI_VENTURE_ANTIGRAVITY_START.md/);

console.log("External tool setup scripts smoke passed.");
