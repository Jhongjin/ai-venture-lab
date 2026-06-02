import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/final-execution-readiness.ts");
const downloadFileNameUrl = pathToFileURL(path.join(process.cwd(), "src/lib/download-file-name.ts")).href;
const telemetryFormatUrl = pathToFileURL(path.join(process.cwd(), "src/lib/telemetry-format.ts")).href;
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/download-file-name";', `from ${JSON.stringify(downloadFileNameUrl)};`)
  .replace('from "@/lib/telemetry-format";', `from ${JSON.stringify(telemetryFormatUrl)};`);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildFinalExecutionConnectionHealth,
  buildFinalExecutionLiveToolContext,
  buildFinalExecutionPackageReadinessState,
  buildFinalExecutionPackageState,
  buildFinalExecutionReadiness,
  buildFinalExecutionTaskPreview,
  selectFinalExecutionLiveSetupDownload,
} = await import(moduleUrl);

const readiness = buildFinalExecutionReadiness({
  activeBuildDeliveryLabel: "Cursor",
  buildDeliveryMode: "external_tool",
  externalToolLabel: "Cursor",
  hasFinalExecutionPackage: true,
  hasFinalExecutionWorkOrder: true,
  hasIdeaContext: true,
  implementationTaskCount: 4,
  runCount: 3,
});
assert.equal(readiness.canEnterLaunch, true);
assert.equal(readiness.score, 100);

const connections = [
  {
    createdAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-06-02T00:00:00.000Z",
    id: "older-active",
    lastUsedAt: "2026-06-01T01:00:00.000Z",
    revokedAt: null,
    status: "active",
    tool: "cursor",
  },
  {
    createdAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-06-02T00:00:00.000Z",
    id: "newer-active",
    lastUsedAt: "2026-06-01T03:00:00.000Z",
    revokedAt: null,
    status: "active",
    tool: "cursor",
  },
  {
    createdAt: "2026-06-01T00:00:00.000Z",
    expiresAt: "2026-06-02T00:00:00.000Z",
    id: "codex-active",
    lastUsedAt: "2026-06-01T04:00:00.000Z",
    revokedAt: null,
    status: "active",
    tool: "codex",
  },
];
const health = buildFinalExecutionConnectionHealth({
  connections,
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
});
assert.deepEqual(
  health.visibleConnections.map((connection) => connection.id),
  ["older-active", "newer-active"],
);
assert.equal(health.activeConnections.length, 2);
assert.equal(health.latestUsedAt, "2026-06-01T03:00:00.000Z");
assert.match(health.title, /^최근 자동 반영 /);
assert.match(health.detail, /자동 반영됩니다/);

const emptyHealth = buildFinalExecutionConnectionHealth({
  connections: [],
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
});
assert.equal(emptyHealth.title, "연결 파일을 받으면 자동 반영이 준비됩니다");
assert.match(emptyHealth.detail, /Cursor 연결 파일/);

const implementationTasks = Array.from({ length: 7 }, (_, index) => ({ id: `task-${index + 1}` }));
const fallbackTasks = Array.from({ length: 7 }, (_, index) => ({ title: `fallback-${index + 1}` }));
const livePreview = buildFinalExecutionTaskPreview({
  buildDeliveryMode: "external_tool",
  externalToolLabel: "Cursor",
  fallbackTasks,
  implementationTasks,
  isLiveExternalDelivery: true,
});
assert.equal(livePreview.taskPreview.length, 6);
assert.equal(livePreview.fallbackTaskPreview.length, 0);
assert.equal(livePreview.visibleTaskCount, 6);
assert.match(livePreview.taskListDescription, /Cursor 연결 파일/);

const fallbackPreview = buildFinalExecutionTaskPreview({
  buildDeliveryMode: "venture_lab",
  externalToolLabel: "Cursor",
  fallbackTasks,
  implementationTasks: [],
  isLiveExternalDelivery: false,
});
assert.equal(fallbackPreview.taskPreview.length, 0);
assert.equal(fallbackPreview.fallbackTaskPreview.length, 6);
assert.equal(fallbackPreview.visibleTaskCount, 6);
assert.match(fallbackPreview.taskListDescription, /내부 개발 패키지/);

const packageState = buildFinalExecutionPackageState({
  canEnterOrchestrationFromDevelopmentDocs: false,
  hasAgentRunPackageArtifact: true,
  hasDevelopmentHandoffPackageArtifact: false,
  hasDevelopmentPlanArtifact: true,
  hasManualDevelopmentPackageFallback: false,
  ideaId: "abcdef123456",
  implementationTaskCount: 0,
  runCount: 0,
});
assert.equal(packageState.hasPackage, true);
assert.equal(packageState.hasWorkOrder, true);
assert.equal(packageState.projectKey, "ABCDEF12");

const emptyPackageState = buildFinalExecutionPackageState({
  canEnterOrchestrationFromDevelopmentDocs: false,
  hasAgentRunPackageArtifact: false,
  hasDevelopmentHandoffPackageArtifact: false,
  hasDevelopmentPlanArtifact: false,
  hasManualDevelopmentPackageFallback: false,
  ideaId: null,
  implementationTaskCount: 0,
  runCount: 0,
});
assert.equal(emptyPackageState.hasPackage, false);
assert.equal(emptyPackageState.hasWorkOrder, false);
assert.equal(emptyPackageState.projectKey, "PROJECT");
const packageReadinessState = buildFinalExecutionPackageReadinessState({
  activeBuildDeliveryLabel: "Cursor",
  buildDeliveryMode: "external_tool",
  canEnterOrchestrationFromDevelopmentDocs: false,
  externalToolLabel: "Cursor",
  hasAgentRunPackageArtifact: true,
  hasDevelopmentHandoffPackageArtifact: false,
  hasDevelopmentPlanArtifact: true,
  hasIdeaContext: true,
  hasManualDevelopmentPackageFallback: false,
  ideaId: "abcdef123456",
  implementationTaskCount: 0,
  runCount: 0,
});
assert.equal(packageReadinessState.hasFinalExecutionPackage, true);
assert.equal(packageReadinessState.hasFinalExecutionWorkOrder, true);
assert.equal(packageReadinessState.finalExecutionPackageState.projectKey, "ABCDEF12");
assert.equal(packageReadinessState.canEnterLaunch, true);
assert.equal(packageReadinessState.launchReadinessScore, 100);
assert.equal(packageReadinessState.passedLaunchReadinessCount, 3);
assert.equal(packageReadinessState.nextLaunchBlocker, null);

const cursorLiveContext = buildFinalExecutionLiveToolContext({
  buildDeliveryMode: "external_tool",
  externalToolKey: "cursor",
  guideDrafts: {
    antigravity: "antigravity guide",
    claude_code: "claude guide",
    codex: "codex guide",
    cursor: "cursor guide",
  },
  handoffFileSuffix: "cursor-setup",
  ideaName: "Great App",
  mcpConfigDrafts: {
    antigravity: "antigravity mcp",
    claude_code: "claude mcp",
    codex: "",
    cursor: "cursor mcp",
  },
  startPromptDrafts: {
    antigravity: "antigravity start",
    claude_code: "claude start",
    codex: "codex start",
    cursor: "cursor start",
  },
});
assert.equal(cursorLiveContext.isLiveExternalDelivery, true);
assert.equal(cursorLiveContext.isCursorExternalDelivery, true);
assert.equal(cursorLiveContext.folder, ".cursor");
assert.equal(cursorLiveContext.progressPath, ".cursor/venture-lab-progress.json");
assert.equal(cursorLiveContext.setupFileName, "great-app-cursor-setup.ps1");
assert.equal(cursorLiveContext.setupCommand, "powershell -ExecutionPolicy Bypass -File .\\great-app-cursor-setup.ps1");
assert.equal(cursorLiveContext.nextTaskCommand, "node .cursor/venture-lab-cli.mjs next-task");
assert.equal(cursorLiveContext.startPromptDraft, "cursor start");
assert.equal(cursorLiveContext.guideDraft, "cursor guide");
assert.equal(cursorLiveContext.mcpConfigDraft, "cursor mcp");

const codexLiveContext = buildFinalExecutionLiveToolContext({
  ...cursorLiveContext,
  buildDeliveryMode: "external_tool",
  externalToolKey: "codex",
  guideDrafts: {
    antigravity: "antigravity guide",
    claude_code: "claude guide",
    codex: "codex guide",
    cursor: "cursor guide",
  },
  handoffFileSuffix: "codex-setup",
  ideaName: null,
  mcpConfigDrafts: {
    antigravity: "antigravity mcp",
    claude_code: "claude mcp",
    codex: "",
    cursor: "cursor mcp",
  },
  startPromptDrafts: {
    antigravity: "antigravity start",
    claude_code: "claude start",
    codex: "codex start",
    cursor: "cursor start",
  },
});
assert.equal(codexLiveContext.isLiveExternalDelivery, true);
assert.equal(codexLiveContext.isCodexExternalDelivery, true);
assert.equal(codexLiveContext.folder, ".codex");
assert.equal(codexLiveContext.setupFileName, "codex-setup.ps1");
assert.equal(codexLiveContext.startPromptDraft, "codex start");
assert.equal(codexLiveContext.mcpConfigDraft, "");

const genericContext = buildFinalExecutionLiveToolContext({
  ...codexLiveContext,
  buildDeliveryMode: "external_tool",
  externalToolKey: "generic_mcp",
  guideDrafts: {
    antigravity: "antigravity guide",
    claude_code: "claude guide",
    codex: "codex guide",
    cursor: "cursor guide",
  },
  handoffFileSuffix: "mcp-package",
  ideaName: "Generic",
  mcpConfigDrafts: {
    antigravity: "antigravity mcp",
    claude_code: "claude mcp",
    codex: "",
    cursor: "cursor mcp",
  },
  startPromptDrafts: {
    antigravity: "antigravity start",
    claude_code: "claude start",
    codex: "codex start",
    cursor: "cursor start",
  },
});
assert.equal(genericContext.isLiveExternalDelivery, false);
assert.equal(genericContext.folder, ".cursor");
assert.equal(genericContext.startPromptDraft, "cursor start");
assert.equal(genericContext.mcpConfigDraft, "");

const liveDownloads = {
  codex: "codex-download",
  cursor: "cursor-download",
};
assert.equal(
  selectFinalExecutionLiveSetupDownload({
    externalToolKey: "cursor",
    isLiveExternalDelivery: true,
    liveSetupDownloads: liveDownloads,
  }),
  "cursor-download",
);
assert.equal(
  selectFinalExecutionLiveSetupDownload({
    externalToolKey: "antigravity",
    isLiveExternalDelivery: true,
    liveSetupDownloads: liveDownloads,
  }),
  null,
);
assert.equal(
  selectFinalExecutionLiveSetupDownload({
    externalToolKey: "generic_mcp",
    isLiveExternalDelivery: false,
    liveSetupDownloads: liveDownloads,
  }),
  null,
);

console.log("Final execution readiness smoke passed.");
