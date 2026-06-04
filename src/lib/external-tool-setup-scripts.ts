import type { ExternalBuildToolKey } from "@/lib/build-delivery";
import { toDownloadFileName } from "@/lib/download-file-name";
import {
  buildExternalToolCliFilePath,
  buildExternalToolProgressFilePath,
  buildExternalToolSyncFilePath,
} from "@/lib/external-tool-file-paths";
import {
  buildAntigravityExternalToolSetupFiles,
  buildClaudeExternalToolSetupFiles,
  buildCodexExternalToolSetupFiles,
  buildCursorExternalToolSetupFiles,
  type ExternalToolSetupFileDraft,
} from "@/lib/external-tool-setup-files";
import {
  buildAntigravityGuideMarkdown,
  buildClaudeGuideMarkdown,
  buildCodexGuideMarkdown,
  buildCursorGuideMarkdown,
} from "@/lib/external-tool-handoff-markdown";
import type { ProductSurfaceProfile } from "@/lib/product-surface";
import type { Idea } from "@/lib/venture-data";

export type LiveExternalToolSetupKey = Exclude<ExternalBuildToolKey, "generic_mcp">;

export type ExternalToolEncodedSetupFile = {
  base64: string;
  path: string;
};

type SetupFile = ExternalToolEncodedSetupFile;

export type ExternalToolSetupGuideArgs = {
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  syncExpiresAt: string;
};

export type ExternalToolSetupDownloadConfig = {
  tool: LiveExternalToolSetupKey;
  toolLabel: string;
  loginMessage: string;
  fileLabel: string;
  fileSuffix: string;
  successMessage: string;
  errorMessage: string;
  buildGuideDraft: (args: ExternalToolSetupGuideArgs) => string;
  buildFiles: (args: { guideDraft: string; syncConfigDraft: string }) => ExternalToolSetupFileDraft[];
  buildSetupScript: (args: { idea: Idea; projectKey: string; files: ExternalToolEncodedSetupFile[] }) => string;
};

export type LiveExternalToolSetupDownloadDraft = {
  body: string;
  fileName: string;
  label: string;
  mimeType: "text/plain;charset=utf-8";
};

export type CursorSetupDownloadConfigDrafts = {
  cursorMcpConfigDraft: string;
  cursorMcpServerDraft: string;
  cursorRuleDraft: string;
  cursorStartPromptDraft: string;
  cursorTaskPackageDraft: string;
  finalAgentRunPackageDraft: string;
};

export type CodexSetupDownloadConfigDrafts = {
  codexAgentInstructionsDraft: string;
  codexCliScriptDraft: string;
  codexStartPromptDraft: string;
  codexTaskPackageDraft: string;
  finalAgentRunPackageDraft: string;
};

export type ClaudeSetupDownloadConfigDrafts = {
  claudeCliScriptDraft: string;
  claudeInstructionsDraft: string;
  claudeMcpConfigDraft: string;
  claudeStartPromptDraft: string;
  claudeTaskPackageDraft: string;
  finalAgentRunPackageDraft: string;
};

export type AntigravitySetupDownloadConfigDrafts = {
  antigravityAcceptanceDraft: string;
  antigravityAgentInstructionsDraft: string;
  antigravityCliScriptDraft: string;
  antigravityMcpConfigDraft: string;
  antigravityStartPromptDraft: string;
  antigravityTaskPackageDraft: string;
  finalAgentRunPackageDraft: string;
};

export function escapePowerShellSingleQuoted(value: string) {
  return value.replace(/'/g, "''");
}

export function buildSetupFileRows(files: ExternalToolEncodedSetupFile[]) {
  return files.map((file) => `  @{ Path = '${escapePowerShellSingleQuoted(file.path)}'; Base64 = '${file.base64}' }`).join("\n");
}

export function buildExternalToolSetupIgnoreEntries(folder: string) {
  return [buildExternalToolSyncFilePath(folder), buildExternalToolProgressFilePath(folder)];
}

export function buildPowerShellStringArray(values: string[]) {
  return `@(${values.map((value) => `"${value}"`).join(", ")})`;
}

export function buildSetupPowerShellFileWriteBlock(files: SetupFile[]) {
  const fileRows = buildSetupFileRows(files);

  return `$ErrorActionPreference = 'Stop'
$root = Get-Location
$files = @(
${fileRows}
)

foreach ($file in $files) {
  $target = Join-Path $root $file.Path
  $directory = Split-Path -Parent $target

  if ($directory -and -not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $bytes = [Convert]::FromBase64String($file.Base64)
  $text = [System.Text.Encoding]::UTF8.GetString($bytes)
  [System.IO.File]::WriteAllText($target, $text, [System.Text.UTF8Encoding]::new($false))
  Write-Host "created $($file.Path)"
}`;
}

export function buildLiveExternalToolSetupDownloadDraft({
  config,
  encodeSetupFiles,
  idea,
  productSurface,
  projectKey,
  syncConfigDraft,
  syncExpiresAt,
}: {
  config: ExternalToolSetupDownloadConfig;
  encodeSetupFiles: (files: ExternalToolSetupFileDraft[]) => ExternalToolEncodedSetupFile[];
  idea: Idea;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  syncConfigDraft: string;
  syncExpiresAt: string;
}): LiveExternalToolSetupDownloadDraft {
  const guideDraft = config.buildGuideDraft({
    idea,
    productSurface,
    projectKey,
    syncExpiresAt,
  });
  const files = encodeSetupFiles(config.buildFiles({ guideDraft, syncConfigDraft }));
  const script = config.buildSetupScript({
    files,
    idea,
    projectKey,
  });

  return {
    body: script,
    fileName: toDownloadFileName(idea.name, config.fileSuffix, "ps1"),
    label: config.fileLabel,
    mimeType: "text/plain;charset=utf-8",
  };
}

export function buildCursorSetupDownloadConfig({
  cursorMcpConfigDraft,
  cursorMcpServerDraft,
  cursorRuleDraft,
  cursorStartPromptDraft,
  cursorTaskPackageDraft,
  finalAgentRunPackageDraft,
}: CursorSetupDownloadConfigDrafts): ExternalToolSetupDownloadConfig {
  return {
    tool: "cursor",
    toolLabel: "Cursor",
    loginMessage: "Cursor 자동 연결 파일을 받으려면 먼저 로그인하세요.",
    fileLabel: "Cursor 연결 스크립트",
    fileSuffix: "cursor-setup",
    successMessage: "Cursor 연결 파일을 준비했습니다. venture_record_progress가 로컬 기록과 서버 반영을 함께 처리합니다.",
    errorMessage: "Cursor 연결 파일을 만들지 못했습니다.",
    buildGuideDraft: buildCursorGuideMarkdown,
    buildFiles: ({ guideDraft, syncConfigDraft }) =>
      buildCursorExternalToolSetupFiles({
        finalAgentRunPackageDraft,
        guideDraft,
        mcpConfigDraft: cursorMcpConfigDraft,
        mcpServerDraft: cursorMcpServerDraft,
        ruleDraft: cursorRuleDraft,
        startPromptDraft: cursorStartPromptDraft,
        syncConfigDraft,
        taskPackageDraft: cursorTaskPackageDraft,
      }),
    buildSetupScript: buildCursorSetupPowerShell,
  };
}

export function buildCodexSetupDownloadConfig({
  codexAgentInstructionsDraft,
  codexCliScriptDraft,
  codexStartPromptDraft,
  codexTaskPackageDraft,
  finalAgentRunPackageDraft,
}: CodexSetupDownloadConfigDrafts): ExternalToolSetupDownloadConfig {
  return {
    tool: "codex",
    toolLabel: "Codex",
    loginMessage: "Codex 자동 연결 파일을 받으려면 먼저 로그인하세요.",
    fileLabel: "Codex 연결 스크립트",
    fileSuffix: "codex-setup",
    successMessage: "Codex 연결 파일을 준비했습니다. record-progress 명령이 로컬 기록과 서버 반영을 함께 처리합니다.",
    errorMessage: "Codex 연결 파일을 만들지 못했습니다.",
    buildGuideDraft: buildCodexGuideMarkdown,
    buildFiles: ({ guideDraft, syncConfigDraft }) =>
      buildCodexExternalToolSetupFiles({
        agentInstructionsDraft: codexAgentInstructionsDraft,
        cliScriptDraft: codexCliScriptDraft,
        finalAgentRunPackageDraft,
        guideDraft,
        startPromptDraft: codexStartPromptDraft,
        syncConfigDraft,
        taskPackageDraft: codexTaskPackageDraft,
      }),
    buildSetupScript: buildCodexSetupPowerShell,
  };
}

export function buildClaudeSetupDownloadConfig({
  claudeCliScriptDraft,
  claudeInstructionsDraft,
  claudeMcpConfigDraft,
  claudeStartPromptDraft,
  claudeTaskPackageDraft,
  finalAgentRunPackageDraft,
}: ClaudeSetupDownloadConfigDrafts): ExternalToolSetupDownloadConfig {
  return {
    tool: "claude_code",
    toolLabel: "Claude Code",
    loginMessage: "Claude Code 자동 연결 파일을 받으려면 먼저 로그인하세요.",
    fileLabel: "Claude Code 연결 스크립트",
    fileSuffix: "claude-code-setup",
    successMessage: "Claude Code 연결 파일을 준비했습니다. 연결 도구 또는 record-progress 명령이 로컬 기록과 서버 반영을 함께 처리합니다.",
    errorMessage: "Claude Code 연결 파일을 만들지 못했습니다.",
    buildGuideDraft: buildClaudeGuideMarkdown,
    buildFiles: ({ guideDraft, syncConfigDraft }) =>
      buildClaudeExternalToolSetupFiles({
        cliScriptDraft: claudeCliScriptDraft,
        finalAgentRunPackageDraft,
        guideDraft,
        instructionsDraft: claudeInstructionsDraft,
        mcpConfigDraft: claudeMcpConfigDraft,
        startPromptDraft: claudeStartPromptDraft,
        syncConfigDraft,
        taskPackageDraft: claudeTaskPackageDraft,
      }),
    buildSetupScript: ({ idea, projectKey, files }) => buildLiveToolSetupPowerShell({
      idea,
      projectKey,
      files,
      toolLabel: "Claude Code",
      folder: ".claude",
      startFileName: "AI_VENTURE_CLAUDE_START.md",
    }),
  };
}

export function buildAntigravitySetupDownloadConfig({
  antigravityAcceptanceDraft,
  antigravityAgentInstructionsDraft,
  antigravityCliScriptDraft,
  antigravityMcpConfigDraft,
  antigravityStartPromptDraft,
  antigravityTaskPackageDraft,
  finalAgentRunPackageDraft,
}: AntigravitySetupDownloadConfigDrafts): ExternalToolSetupDownloadConfig {
  return {
    tool: "antigravity",
    toolLabel: "Google Antigravity",
    loginMessage: "Google Antigravity 자동 연결 파일을 받으려면 먼저 로그인하세요.",
    fileLabel: "Google Antigravity 연결 스크립트",
    fileSuffix: "antigravity-setup",
    successMessage: "Google Antigravity 연결 파일을 준비했습니다. record-progress 명령이 로컬 기록과 서버 반영을 함께 처리합니다.",
    errorMessage: "Google Antigravity 연결 파일을 만들지 못했습니다.",
    buildGuideDraft: buildAntigravityGuideMarkdown,
    buildFiles: ({ guideDraft, syncConfigDraft }) =>
      buildAntigravityExternalToolSetupFiles({
        acceptanceDraft: antigravityAcceptanceDraft,
        agentInstructionsDraft: antigravityAgentInstructionsDraft,
        cliScriptDraft: antigravityCliScriptDraft,
        finalAgentRunPackageDraft,
        guideDraft,
        mcpConfigDraft: antigravityMcpConfigDraft,
        startPromptDraft: antigravityStartPromptDraft,
        syncConfigDraft,
        taskPackageDraft: antigravityTaskPackageDraft,
      }),
    buildSetupScript: ({ idea, projectKey, files }) => buildLiveToolSetupPowerShell({
      idea,
      projectKey,
      files,
      toolLabel: "Google Antigravity",
      folder: ".antigravity",
      startFileName: "AI_VENTURE_ANTIGRAVITY_START.md",
    }),
  };
}

export function buildCursorSetupPowerShell({
  idea,
  projectKey,
  files,
}: {
  idea: Idea;
  projectKey: string;
  files: SetupFile[];
}) {
  return `# AI Venture Lab Cursor connection setup
# Project: ${idea.name}
# Key: ${projectKey}

${buildSetupPowerShellFileWriteBlock(files)}

$gitignorePath = Join-Path $root ".gitignore"
$ignoreEntries = ${buildPowerShellStringArray(buildExternalToolSetupIgnoreEntries(".cursor"))}

if (-not (Test-Path -LiteralPath $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}

$existingIgnore = Get-Content -LiteralPath $gitignorePath -Raw -ErrorAction SilentlyContinue

foreach ($entry in $ignoreEntries) {
  if (-not $existingIgnore -or $existingIgnore -notmatch [regex]::Escape($entry)) {
    Add-Content -LiteralPath $gitignorePath -Value $entry
    Write-Host "gitignored $entry"
  }
}

Write-Host ""
Write-Host "AI Venture Lab Cursor connection files are ready."
Write-Host "Next check command: node ${buildExternalToolCliFilePath(".cursor")} next-task"
Write-Host "Only after that command shows T-001, reopen Cursor and enable ai-venture-lab in Settings > MCP > Workspace MCP Servers."
Write-Host "After Cursor MCP shows Enabled, paste AI_VENTURE_CURSOR_START.md into Composer."
Write-Host "When Cursor calls venture_record_progress, Venture Lab task status will be updated automatically."
`;
}

export function buildCodexSetupPowerShell({
  idea,
  projectKey,
  files,
}: {
  idea: Idea;
  projectKey: string;
  files: SetupFile[];
}) {
  return `# AI Venture Lab Codex connection setup
# Project: ${idea.name}
# Key: ${projectKey}

${buildSetupPowerShellFileWriteBlock(files)}

$gitignorePath = Join-Path $root ".gitignore"
$ignoreEntries = ${buildPowerShellStringArray(buildExternalToolSetupIgnoreEntries(".codex"))}

if (-not (Test-Path -LiteralPath $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}

$existingIgnore = Get-Content -LiteralPath $gitignorePath -Raw -ErrorAction SilentlyContinue

foreach ($entry in $ignoreEntries) {
  if (-not $existingIgnore -or $existingIgnore -notmatch [regex]::Escape($entry)) {
    Add-Content -LiteralPath $gitignorePath -Value $entry
    Write-Host "gitignored $entry"
  }
}

Write-Host ""
Write-Host "AI Venture Lab Codex connection files are ready."
Write-Host "Check: node ${buildExternalToolCliFilePath(".codex")} next-task"
Write-Host "After it shows T-001, open this project in Codex and paste AI_VENTURE_CODEX_START.md as the first message."
Write-Host "When Codex runs record-progress, Venture Lab task status will be updated automatically."
`;
}

export function buildLiveToolSetupPowerShell({
  idea,
  projectKey,
  files,
  toolLabel,
  folder,
  startFileName,
}: {
  idea: Idea;
  projectKey: string;
  files: SetupFile[];
  toolLabel: string;
  folder: string;
  startFileName: string;
}) {
  return `# AI Venture Lab ${toolLabel} connection setup
# Project: ${idea.name}
# Key: ${projectKey}

${buildSetupPowerShellFileWriteBlock(files)}

$gitignorePath = Join-Path $root ".gitignore"
$ignoreEntries = ${buildPowerShellStringArray(buildExternalToolSetupIgnoreEntries(folder))}

if (-not (Test-Path -LiteralPath $gitignorePath)) {
  New-Item -ItemType File -Path $gitignorePath -Force | Out-Null
}

$existingIgnore = Get-Content -LiteralPath $gitignorePath -Raw -ErrorAction SilentlyContinue

foreach ($entry in $ignoreEntries) {
  if (-not $existingIgnore -or $existingIgnore -notmatch [regex]::Escape($entry)) {
    Add-Content -LiteralPath $gitignorePath -Value $entry
    Write-Host "gitignored $entry"
  }
}

Write-Host ""
Write-Host "AI Venture Lab ${toolLabel} connection files are ready."
Write-Host "Check: node ${buildExternalToolCliFilePath(folder)} next-task"
Write-Host "After it shows T-001, open this project in ${toolLabel} and paste ${startFileName} as the first message."
Write-Host "When ${toolLabel} records progress, Venture Lab task status will be updated automatically."
`;
}
