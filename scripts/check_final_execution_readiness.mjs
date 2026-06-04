import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/final-execution-readiness.ts");
const downloadFileNameUrl = pathToFileURL(path.join(process.cwd(), "src/lib/download-file-name.ts")).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const telemetryFormatUrl = pathToFileURL(path.join(process.cwd(), "src/lib/telemetry-format.ts")).href;
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/download-file-name";', `from ${JSON.stringify(downloadFileNameUrl)};`)
  .replace('from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`)
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
  buildFinalExecutionConnectionHealthDetail,
  buildFinalExecutionConnectionHealthTitle,
  buildFinalExecutionDecisionSentence,
  buildFinalExecutionLaunchDisplayState,
  buildFinalExecutionLiveDeliveryFlags,
  buildFinalExecutionLiveToolCommandContext,
  buildFinalExecutionLiveToolContext,
  buildFinalExecutionLiveToolDraftMaps,
  buildFinalExecutionPackageReadinessState,
  buildFinalExecutionPrimaryPackageAction,
  buildFinalExecutionPackageState,
  buildFinalExecutionReadiness,
  buildFinalExecutionTaskListDescription,
  buildFinalExecutionTaskPreviewLists,
  buildFinalExecutionTaskPreview,
  compareFinalExecutionConnectionUsedAtValues,
  formatFinalExecutionProjectKey,
  getFinalExecutionConnectionUsedAtTime,
  getFinalExecutionActiveConnections,
  getLatestFinalExecutionConnectionUsedAt,
  getFinalExecutionVisibleConnections,
  hasFinalExecutionPackage,
  hasFinalExecutionWorkOrder,
  selectFinalExecutionLiveToolKey,
  selectFinalExecutionLiveSetupDownload,
  selectFinalExecutionMcpConfigDraft,
  summarizeFinalExecutionReadinessChecks,
} = await import(moduleUrl);

const { productSurfaceProfiles } = await import(productSurfaceUrl);

assert.equal(
  buildFinalExecutionDecisionSentence({
    buildDeliveryPhrase: "Cursor로 넘깁니다",
    productSurface: productSurfaceProfiles.operator_console,
  }),
  "운영 콘솔로 만들고, Cursor로 넘깁니다.",
);
const cursorLiveFlags = buildFinalExecutionLiveDeliveryFlags({
  buildDeliveryMode: "external_tool",
  externalToolKey: "cursor",
});
assert.equal(cursorLiveFlags.isCursorExternalDelivery, true);
assert.equal(cursorLiveFlags.isLiveExternalDelivery, true);
assert.equal(
  buildFinalExecutionLiveDeliveryFlags({
    buildDeliveryMode: "external_tool",
    externalToolKey: "generic_mcp",
  }).isLiveExternalDelivery,
  false,
);
assert.equal(
  selectFinalExecutionLiveToolKey({
    isAntigravityExternalDelivery: true,
    isClaudeCodeExternalDelivery: false,
    isCodexExternalDelivery: false,
  }),
  "antigravity",
);
assert.equal(
  selectFinalExecutionLiveToolKey({
    isAntigravityExternalDelivery: false,
    isClaudeCodeExternalDelivery: false,
    isCodexExternalDelivery: true,
  }),
  "codex",
);

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
assert.deepEqual(summarizeFinalExecutionReadinessChecks(readiness.checks), {
  passedCount: 3,
  score: 100,
  nextBlocker: null,
  canEnterLaunch: true,
});
const blockedReadinessSummary = summarizeFinalExecutionReadinessChecks([
  { label: "제작 패키지 저장", passed: true, detail: "ready" },
  { label: "작업 순서 준비", passed: false, detail: "missing" },
]);
assert.equal(blockedReadinessSummary.passedCount, 1);
assert.equal(blockedReadinessSummary.score, 50);
assert.equal(blockedReadinessSummary.nextBlocker.label, "작업 순서 준비");
assert.equal(blockedReadinessSummary.canEnterLaunch, false);
assert.deepEqual(summarizeFinalExecutionReadinessChecks([]), {
  passedCount: 0,
  score: 0,
  nextBlocker: null,
  canEnterLaunch: false,
});

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
assert.equal(getFinalExecutionConnectionUsedAtTime("2026-06-01T03:00:00.000Z"), 1780282800000);
assert.equal(
  compareFinalExecutionConnectionUsedAtValues("2026-06-01T01:00:00.000Z", "2026-06-01T03:00:00.000Z") > 0,
  true,
);
assert.equal(
  compareFinalExecutionConnectionUsedAtValues("2026-06-01T03:00:00.000Z", "2026-06-01T01:00:00.000Z") < 0,
  true,
);
assert.equal(getLatestFinalExecutionConnectionUsedAt(connections), "2026-06-01T04:00:00.000Z");
assert.equal(getLatestFinalExecutionConnectionUsedAt([{ lastUsedAt: null }, { lastUsedAt: "" }]), null);
assert.deepEqual(
  getFinalExecutionVisibleConnections({ connections, externalToolKey: "cursor" }).map((connection) => connection.id),
  ["older-active", "newer-active"],
);
assert.deepEqual(
  getFinalExecutionActiveConnections([
    ...connections,
    {
      ...connections[0],
      id: "revoked-cursor",
      status: "revoked",
    },
  ]).map((connection) => connection.id),
  ["older-active", "newer-active", "codex-active"],
);

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
assert.equal(
  buildFinalExecutionConnectionHealthTitle({
    activeConnectionCount: 0,
    latestUsedAt: null,
  }),
  "연결 파일을 받으면 자동 반영이 준비됩니다",
);
assert.match(
  buildFinalExecutionConnectionHealthTitle({
    activeConnectionCount: 1,
    latestUsedAt: "2026-06-01T03:00:00.000Z",
  }),
  /^최근 자동 반영 /,
);
assert.equal(
  buildFinalExecutionConnectionHealthDetail({
    activeConnectionCount: 0,
    externalToolLabel: "Codex",
  }),
  "Codex 연결 파일을 받은 뒤 설치 명령과 확인 명령을 실행하세요.",
);
assert.equal(
  buildFinalExecutionConnectionHealthDetail({
    activeConnectionCount: 1,
    externalToolLabel: "Codex",
  }),
  "외부 도구가 진행 기록 명령을 실행하면 Venture Lab 작업표와 STEP 8에 자동 반영됩니다.",
);

const emptyHealth = buildFinalExecutionConnectionHealth({
  connections: [],
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
});
assert.equal(emptyHealth.title, "연결 파일을 받으면 자동 반영이 준비됩니다");
assert.match(emptyHealth.detail, /Cursor 연결 파일/);

const implementationTasks = Array.from({ length: 7 }, (_, index) => ({ id: `task-${index + 1}` }));
const fallbackTasks = Array.from({ length: 7 }, (_, index) => ({ title: `fallback-${index + 1}` }));
const implementationPreviewLists = buildFinalExecutionTaskPreviewLists({
  fallbackTasks,
  implementationTasks,
  limit: 2,
});
assert.deepEqual(
  implementationPreviewLists.taskPreview.map((task) => task.id),
  ["task-1", "task-2"],
);
assert.deepEqual(implementationPreviewLists.fallbackTaskPreview, []);
assert.equal(implementationPreviewLists.visibleTaskCount, 2);
const fallbackPreviewLists = buildFinalExecutionTaskPreviewLists({
  fallbackTasks,
  implementationTasks: [],
  limit: 2,
});
assert.deepEqual(fallbackPreviewLists.taskPreview, []);
assert.deepEqual(
  fallbackPreviewLists.fallbackTaskPreview.map((task) => task.title),
  ["fallback-1", "fallback-2"],
);
assert.equal(fallbackPreviewLists.visibleTaskCount, 2);
assert.match(
  buildFinalExecutionTaskListDescription({
    buildDeliveryMode: "external_tool",
    externalToolLabel: "Cursor",
    isLiveExternalDelivery: true,
  }),
  /Cursor 연결 파일/,
);
assert.match(
  buildFinalExecutionTaskListDescription({
    buildDeliveryMode: "external_tool",
    externalToolLabel: "Codex",
    isLiveExternalDelivery: false,
  }),
  /Codex 시작 패키지/,
);
assert.match(
  buildFinalExecutionTaskListDescription({
    buildDeliveryMode: "venture_lab",
    externalToolLabel: "Cursor",
    isLiveExternalDelivery: false,
  }),
  /내부 개발 패키지/,
);
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

const launchDisplayState = buildFinalExecutionLaunchDisplayState({
  buildDeliveryMode: "external_tool",
  connections,
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
  fallbackTasks,
  implementationTasks,
  isLiveExternalDelivery: true,
});
assert.deepEqual(
  launchDisplayState.visibleCursorSyncConnections.map((connection) => connection.id),
  ["older-active", "newer-active"],
);
assert.equal(launchDisplayState.activeCursorSyncConnections.length, 2);
assert.match(launchDisplayState.finalExecutionConnectionHealthTitle, /^최근 자동 반영 /);
assert.equal(launchDisplayState.finalExecutionTaskPreview.length, 6);
assert.equal(launchDisplayState.finalExecutionFallbackTaskPreview.length, 0);
assert.equal(launchDisplayState.finalExecutionVisibleTaskCount, 6);
assert.match(launchDisplayState.finalExecutionTaskListDescription, /Cursor 연결 파일/);

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
assert.equal(
  hasFinalExecutionPackage({
    canEnterOrchestrationFromDevelopmentDocs: false,
    hasAgentRunPackageArtifact: false,
    hasDevelopmentHandoffPackageArtifact: true,
    hasManualDevelopmentPackageFallback: false,
  }),
  true,
);
assert.equal(
  hasFinalExecutionPackage({
    canEnterOrchestrationFromDevelopmentDocs: false,
    hasAgentRunPackageArtifact: false,
    hasDevelopmentHandoffPackageArtifact: false,
    hasManualDevelopmentPackageFallback: false,
  }),
  false,
);
assert.equal(
  hasFinalExecutionWorkOrder({
    hasDevelopmentPlanArtifact: false,
    implementationTaskCount: 0,
    runCount: 1,
  }),
  true,
);
assert.equal(
  hasFinalExecutionWorkOrder({
    hasDevelopmentPlanArtifact: false,
    implementationTaskCount: 0,
    runCount: 0,
  }),
  false,
);
assert.equal(formatFinalExecutionProjectKey("abcdef123456"), "ABCDEF12");
assert.equal(formatFinalExecutionProjectKey(null), "PROJECT");

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

const liveToolDraftMaps = buildFinalExecutionLiveToolDraftMaps({
  antigravityGuideDraft: "antigravity guide",
  antigravityMcpConfigDraft: "antigravity mcp",
  antigravityStartPromptDraft: "antigravity start",
  claudeGuideDraft: "claude guide",
  claudeMcpConfigDraft: "claude mcp",
  claudeStartPromptDraft: "claude start",
  codexGuideDraft: "codex guide",
  codexStartPromptDraft: "codex start",
  cursorGuideDraft: "cursor guide",
  cursorMcpConfigDraft: "cursor mcp",
  cursorStartPromptDraft: "cursor start",
});
assert.deepEqual(liveToolDraftMaps.guideDrafts, {
  antigravity: "antigravity guide",
  claude_code: "claude guide",
  codex: "codex guide",
  cursor: "cursor guide",
});
assert.equal(liveToolDraftMaps.mcpConfigDrafts.codex, "");
assert.equal(liveToolDraftMaps.startPromptDrafts.antigravity, "antigravity start");
assert.deepEqual(
  buildFinalExecutionLiveToolCommandContext({
    folder: ".cursor",
    handoffFileSuffix: "cursor-setup",
    ideaName: "Great App",
  }),
  {
    folder: ".cursor",
    nextTaskCommand: "node .cursor/venture-lab-cli.mjs next-task",
    progressPath: ".cursor/venture-lab-progress.json",
    setupCommand: "powershell -ExecutionPolicy Bypass -File .\\great-app-cursor-setup.ps1",
    setupFileName: "great-app-cursor-setup.ps1",
  },
);
assert.equal(
  selectFinalExecutionMcpConfigDraft({
    isAntigravityExternalDelivery: true,
    isClaudeCodeExternalDelivery: false,
    isCursorExternalDelivery: false,
    mcpConfigDrafts: liveToolDraftMaps.mcpConfigDrafts,
  }),
  "antigravity mcp",
);
assert.equal(
  selectFinalExecutionMcpConfigDraft({
    isAntigravityExternalDelivery: false,
    isClaudeCodeExternalDelivery: false,
    isCursorExternalDelivery: false,
    mcpConfigDrafts: liveToolDraftMaps.mcpConfigDrafts,
  }),
  "",
);

const cursorLiveContext = buildFinalExecutionLiveToolContext({
  buildDeliveryMode: "external_tool",
  externalToolKey: "cursor",
  ...liveToolDraftMaps,
  handoffFileSuffix: "cursor-setup",
  ideaName: "Great App",
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
  ...liveToolDraftMaps,
  handoffFileSuffix: "codex-setup",
  ideaName: null,
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
  ...liveToolDraftMaps,
  handoffFileSuffix: "mcp-package",
  ideaName: "Generic",
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

const livePrimaryAction = buildFinalExecutionPrimaryPackageAction({
  externalToolKey: "cursor",
  externalToolLabel: "Cursor",
  externalToolRunPackageDraft: "# Cursor package",
  handoffFileSuffix: "cursor-setup",
  ideaName: "AI Venture Lab",
  isLiveExternalDelivery: true,
  liveSetupDownloads: liveDownloads,
});
assert.equal(livePrimaryAction.kind, "live_setup");
assert.equal(livePrimaryAction.download, "cursor-download");

const fallbackPrimaryAction = buildFinalExecutionPrimaryPackageAction({
  externalToolKey: "generic_mcp",
  externalToolLabel: "범용 MCP 전달",
  externalToolRunPackageDraft: "# Generic package",
  handoffFileSuffix: "mcp-handoff-package",
  ideaName: "AI Venture Lab",
  isLiveExternalDelivery: false,
  liveSetupDownloads: liveDownloads,
});
assert.equal(fallbackPrimaryAction.kind, "package_download");
assert.equal(fallbackPrimaryAction.body, "# Generic package");
assert.equal(fallbackPrimaryAction.label, "범용 MCP 전달 시작 패키지");
assert.equal(fallbackPrimaryAction.fileName, "ai-venture-lab-mcp-handoff-package.md");

console.log("Final execution readiness smoke passed.");
