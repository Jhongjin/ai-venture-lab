import type { BuildDeliveryMode, ExternalBuildToolKey } from "@/lib/build-delivery";
import { toDownloadFileName } from "@/lib/download-file-name";
import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import type { CursorSyncConnection } from "@/lib/external-tool-sync-connection";
import { withKoreanInstrumental, type ProductSurfaceProfile } from "@/lib/product-surface";
import { formatTelemetryTime } from "@/lib/telemetry-format";
import type { ImplementationTask } from "@/lib/venture-data";

export type LiveExternalToolKey = Exclude<ExternalBuildToolKey, "generic_mcp">;

export type FinalExecutionReadinessCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type FinalExecutionReadiness = {
  checks: FinalExecutionReadinessCheck[];
  passedCount: number;
  score: number;
  nextBlocker: FinalExecutionReadinessCheck | null;
  canEnterLaunch: boolean;
};

export type FinalExecutionPackageState = {
  hasPackage: boolean;
  hasWorkOrder: boolean;
  projectKey: string;
};

export type FinalExecutionConnectionHealth = {
  visibleConnections: CursorSyncConnection[];
  activeConnections: CursorSyncConnection[];
  latestUsedAt: string | null;
  title: string;
  detail: string;
};

export type FinalExecutionTaskPreview = {
  taskPreview: ImplementationTask[];
  fallbackTaskPreview: ImplementationTaskDraft[];
  visibleTaskCount: number;
  taskListDescription: string;
};

export type FinalExecutionLaunchDisplayState = {
  activeCursorSyncConnections: CursorSyncConnection[];
  finalExecutionConnectionHealthDetail: string;
  finalExecutionConnectionHealthTitle: string;
  finalExecutionFallbackTaskPreview: ImplementationTaskDraft[];
  finalExecutionTaskListDescription: string;
  finalExecutionTaskPreview: ImplementationTask[];
  finalExecutionVisibleTaskCount: number;
  visibleCursorSyncConnections: CursorSyncConnection[];
};

export type FinalExecutionPrimaryPackageAction<Download> =
  | {
      download: Download;
      kind: "live_setup";
    }
  | {
      body: string;
      fileName: string;
      kind: "package_download";
      label: string;
    };

export type FinalExecutionLiveToolContext = {
  folder: string;
  guideDraft: string;
  isAntigravityExternalDelivery: boolean;
  isClaudeCodeExternalDelivery: boolean;
  isCodexExternalDelivery: boolean;
  isCursorExternalDelivery: boolean;
  isLiveExternalDelivery: boolean;
  mcpConfigDraft: string;
  nextTaskCommand: string;
  progressPath: string;
  setupCommand: string;
  setupFileName: string;
  startPromptDraft: string;
};

export function buildFinalExecutionDecisionSentence({
  buildDeliveryPhrase,
  productSurface,
}: {
  buildDeliveryPhrase: string;
  productSurface: ProductSurfaceProfile;
}) {
  return `${withKoreanInstrumental(productSurface.label)} 만들고, ${buildDeliveryPhrase}.`;
}

const liveExternalToolFolders: Record<LiveExternalToolKey, string> = {
  antigravity: ".antigravity",
  claude_code: ".claude",
  codex: ".codex",
  cursor: ".cursor",
};

export function buildFinalExecutionReadiness({
  activeBuildDeliveryLabel,
  buildDeliveryMode,
  externalToolLabel,
  hasFinalExecutionPackage,
  hasFinalExecutionWorkOrder,
  hasIdeaContext,
  implementationTaskCount,
  runCount,
}: {
  activeBuildDeliveryLabel: string;
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
  hasFinalExecutionPackage: boolean;
  hasFinalExecutionWorkOrder: boolean;
  hasIdeaContext: boolean;
  implementationTaskCount: number;
  runCount: number;
}): FinalExecutionReadiness {
  const checks: FinalExecutionReadinessCheck[] = hasIdeaContext
    ? [
        {
          label: "제작 패키지 저장",
          passed: hasFinalExecutionPackage,
          detail: hasFinalExecutionPackage
            ? "최종 실행에서 쓸 제작 패키지가 저장되어 있습니다."
            : "STEP 5에서 제작 패키지를 저장하세요.",
        },
        {
          label: "작업 순서 준비",
          passed: hasFinalExecutionWorkOrder,
          detail: hasFinalExecutionWorkOrder
            ? `작업 순서 ${runCount}개, 제작 할 일 ${implementationTaskCount}개가 준비되어 있습니다.`
            : "작업 순서 자동 만들기를 눌러 제작자가 볼 순서를 준비하세요.",
        },
        {
          label: "개발 방식 확정",
          passed: Boolean(buildDeliveryMode && activeBuildDeliveryLabel),
          detail:
            buildDeliveryMode === "external_tool"
              ? `${externalToolLabel}로 넘길 준비 자료를 보여줍니다.`
              : "Venture Lab 내부 개발로 이어질 준비 자료를 보여줍니다.",
        },
      ]
    : [];
  const passedCount = checks.filter((check) => check.passed).length;
  const score = checks.length === 0 ? 0 : Math.round((passedCount / checks.length) * 100);
  const nextBlocker = checks.find((check) => !check.passed) ?? null;
  const canEnterLaunch = checks.length > 0 && !nextBlocker;

  return {
    checks,
    passedCount,
    score,
    nextBlocker,
    canEnterLaunch,
  };
}

export function buildFinalExecutionPackageState({
  canEnterOrchestrationFromDevelopmentDocs,
  hasAgentRunPackageArtifact,
  hasDevelopmentHandoffPackageArtifact,
  hasDevelopmentPlanArtifact,
  hasManualDevelopmentPackageFallback,
  ideaId,
  implementationTaskCount,
  runCount,
}: {
  canEnterOrchestrationFromDevelopmentDocs: boolean;
  hasAgentRunPackageArtifact: boolean;
  hasDevelopmentHandoffPackageArtifact: boolean;
  hasDevelopmentPlanArtifact: boolean;
  hasManualDevelopmentPackageFallback: boolean;
  ideaId: string | null;
  implementationTaskCount: number;
  runCount: number;
}): FinalExecutionPackageState {
  return {
    hasPackage:
      canEnterOrchestrationFromDevelopmentDocs ||
      hasAgentRunPackageArtifact ||
      hasDevelopmentHandoffPackageArtifact ||
      hasManualDevelopmentPackageFallback,
    hasWorkOrder: runCount > 0 || implementationTaskCount > 0 || hasDevelopmentPlanArtifact,
    projectKey: ideaId ? ideaId.slice(0, 8).toUpperCase() : "PROJECT",
  };
}

export function buildFinalExecutionPackageReadinessState({
  activeBuildDeliveryLabel,
  buildDeliveryMode,
  canEnterOrchestrationFromDevelopmentDocs,
  externalToolLabel,
  hasAgentRunPackageArtifact,
  hasDevelopmentHandoffPackageArtifact,
  hasDevelopmentPlanArtifact,
  hasIdeaContext,
  hasManualDevelopmentPackageFallback,
  ideaId,
  implementationTaskCount,
  runCount,
}: {
  activeBuildDeliveryLabel: string;
  buildDeliveryMode: BuildDeliveryMode;
  canEnterOrchestrationFromDevelopmentDocs: boolean;
  externalToolLabel: string;
  hasAgentRunPackageArtifact: boolean;
  hasDevelopmentHandoffPackageArtifact: boolean;
  hasDevelopmentPlanArtifact: boolean;
  hasIdeaContext: boolean;
  hasManualDevelopmentPackageFallback: boolean;
  ideaId: string | null;
  implementationTaskCount: number;
  runCount: number;
}) {
  const finalExecutionPackageState = buildFinalExecutionPackageState({
    canEnterOrchestrationFromDevelopmentDocs,
    hasAgentRunPackageArtifact,
    hasDevelopmentHandoffPackageArtifact,
    hasDevelopmentPlanArtifact,
    hasManualDevelopmentPackageFallback,
    ideaId,
    implementationTaskCount,
    runCount,
  });
  const finalExecutionReadiness = buildFinalExecutionReadiness({
    activeBuildDeliveryLabel,
    buildDeliveryMode,
    externalToolLabel,
    hasFinalExecutionPackage: finalExecutionPackageState.hasPackage,
    hasFinalExecutionWorkOrder: finalExecutionPackageState.hasWorkOrder,
    hasIdeaContext,
    implementationTaskCount,
    runCount,
  });

  return {
    canEnterLaunch: finalExecutionReadiness.canEnterLaunch,
    finalExecutionPackageState,
    finalExecutionReadiness,
    hasFinalExecutionPackage: finalExecutionPackageState.hasPackage,
    hasFinalExecutionWorkOrder: finalExecutionPackageState.hasWorkOrder,
    launchReadiness: finalExecutionReadiness.checks,
    launchReadinessScore: finalExecutionReadiness.score,
    nextLaunchBlocker: finalExecutionReadiness.nextBlocker,
    passedLaunchReadinessCount: finalExecutionReadiness.passedCount,
  };
}

export function buildFinalExecutionLiveToolContext({
  buildDeliveryMode,
  externalToolKey,
  guideDrafts,
  handoffFileSuffix,
  ideaName,
  mcpConfigDrafts,
  startPromptDrafts,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalToolKey: ExternalBuildToolKey;
  guideDrafts: Record<LiveExternalToolKey, string>;
  handoffFileSuffix: string;
  ideaName: string | null;
  mcpConfigDrafts: Record<LiveExternalToolKey, string>;
  startPromptDrafts: Record<LiveExternalToolKey, string>;
}): FinalExecutionLiveToolContext {
  const isCursorExternalDelivery = buildDeliveryMode === "external_tool" && externalToolKey === "cursor";
  const isCodexExternalDelivery = buildDeliveryMode === "external_tool" && externalToolKey === "codex";
  const isClaudeCodeExternalDelivery = buildDeliveryMode === "external_tool" && externalToolKey === "claude_code";
  const isAntigravityExternalDelivery = buildDeliveryMode === "external_tool" && externalToolKey === "antigravity";
  const isLiveExternalDelivery =
    isCursorExternalDelivery || isCodexExternalDelivery || isClaudeCodeExternalDelivery || isAntigravityExternalDelivery;
  const selectedLiveToolKey: LiveExternalToolKey = isAntigravityExternalDelivery
    ? "antigravity"
    : isClaudeCodeExternalDelivery
      ? "claude_code"
      : isCodexExternalDelivery
        ? "codex"
        : "cursor";
  const folder = liveExternalToolFolders[selectedLiveToolKey];
  const setupFileName = ideaName
    ? toDownloadFileName(ideaName, handoffFileSuffix, "ps1")
    : `${handoffFileSuffix}.ps1`;

  return {
    folder,
    guideDraft: guideDrafts[selectedLiveToolKey],
    isAntigravityExternalDelivery,
    isClaudeCodeExternalDelivery,
    isCodexExternalDelivery,
    isCursorExternalDelivery,
    isLiveExternalDelivery,
    mcpConfigDraft: isAntigravityExternalDelivery
      ? mcpConfigDrafts.antigravity
      : isClaudeCodeExternalDelivery
        ? mcpConfigDrafts.claude_code
        : isCursorExternalDelivery
          ? mcpConfigDrafts.cursor
          : "",
    nextTaskCommand: `node ${folder}/venture-lab-cli.mjs next-task`,
    progressPath: `${folder}/venture-lab-progress.json`,
    setupCommand: `powershell -ExecutionPolicy Bypass -File .\\${setupFileName}`,
    setupFileName,
    startPromptDraft: startPromptDrafts[selectedLiveToolKey],
  };
}

export function selectFinalExecutionLiveSetupDownload<Download>({
  externalToolKey,
  isLiveExternalDelivery,
  liveSetupDownloads,
}: {
  externalToolKey: ExternalBuildToolKey;
  isLiveExternalDelivery: boolean;
  liveSetupDownloads: Partial<Record<LiveExternalToolKey, Download>>;
}): Download | null {
  if (!isLiveExternalDelivery || externalToolKey === "generic_mcp") {
    return null;
  }

  return liveSetupDownloads[externalToolKey] ?? null;
}

export function buildFinalExecutionPrimaryPackageAction<Download>({
  externalToolKey,
  externalToolLabel,
  externalToolRunPackageDraft,
  handoffFileSuffix,
  ideaName,
  isLiveExternalDelivery,
  liveSetupDownloads,
}: {
  externalToolKey: ExternalBuildToolKey;
  externalToolLabel: string;
  externalToolRunPackageDraft: string;
  handoffFileSuffix: string;
  ideaName: string;
  isLiveExternalDelivery: boolean;
  liveSetupDownloads: Partial<Record<LiveExternalToolKey, Download>>;
}): FinalExecutionPrimaryPackageAction<Download> {
  const liveSetupDownload = selectFinalExecutionLiveSetupDownload({
    externalToolKey,
    isLiveExternalDelivery,
    liveSetupDownloads,
  });

  if (liveSetupDownload) {
    return {
      download: liveSetupDownload,
      kind: "live_setup",
    };
  }

  return {
    body: externalToolRunPackageDraft,
    fileName: toDownloadFileName(ideaName, handoffFileSuffix),
    kind: "package_download",
    label: `${externalToolLabel} 시작 패키지`,
  };
}

export function buildFinalExecutionConnectionHealth({
  connections,
  externalToolKey,
  externalToolLabel,
}: {
  connections: CursorSyncConnection[];
  externalToolKey: string;
  externalToolLabel: string;
}): FinalExecutionConnectionHealth {
  const visibleConnections = connections.filter((connection) => connection.tool === externalToolKey);
  const activeConnections = visibleConnections.filter((connection) => connection.status === "active");
  const latestUsedAt =
    activeConnections
      .map((connection) => connection.lastUsedAt)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
  const title =
    activeConnections.length === 0
      ? "연결 파일을 받으면 자동 반영이 준비됩니다"
      : latestUsedAt
        ? `최근 자동 반영 ${formatTelemetryTime(latestUsedAt)}`
        : "연결됨, 아직 자동 반영 전";
  const detail =
    activeConnections.length === 0
      ? `${externalToolLabel} 연결 파일을 받은 뒤 설치 명령과 확인 명령을 실행하세요.`
      : "외부 도구가 진행 기록 명령을 실행하면 Venture Lab 작업표와 STEP 8에 자동 반영됩니다.";

  return {
    visibleConnections,
    activeConnections,
    latestUsedAt,
    title,
    detail,
  };
}

export function buildFinalExecutionTaskPreview({
  buildDeliveryMode,
  externalToolLabel,
  fallbackTasks,
  implementationTasks,
  isLiveExternalDelivery,
  limit = 6,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
  fallbackTasks: ImplementationTaskDraft[];
  implementationTasks: ImplementationTask[];
  isLiveExternalDelivery: boolean;
  limit?: number;
}): FinalExecutionTaskPreview {
  const taskPreview = implementationTasks.slice(0, limit);
  const fallbackTaskPreview = implementationTasks.length === 0 ? fallbackTasks.slice(0, limit) : [];
  const visibleTaskCount = implementationTasks.length > 0 ? taskPreview.length : fallbackTaskPreview.length;
  const taskListDescription =
    buildDeliveryMode === "external_tool"
      ? isLiveExternalDelivery
        ? `${externalToolLabel} 연결 파일에는 이 작업 목록이 포함됩니다. 진행 결과를 남기면 로컬 기록과 Venture Lab 작업 상태가 함께 업데이트됩니다.`
        : `${externalToolLabel} 시작 패키지에 이 작업 목록이 포함됩니다. 작업이 끝나면 완료 보고를 반영해 Venture Lab 작업 상태를 맞춥니다.`
      : "내부 개발 패키지에 이 작업 목록이 포함됩니다. 내부 제작 도구가 연결되면 이 순서를 기준으로 이어집니다.";

  return {
    taskPreview,
    fallbackTaskPreview,
    visibleTaskCount,
    taskListDescription,
  };
}

export function buildFinalExecutionLaunchDisplayState({
  buildDeliveryMode,
  connections,
  externalToolKey,
  externalToolLabel,
  fallbackTasks,
  implementationTasks,
  isLiveExternalDelivery,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  connections: CursorSyncConnection[];
  externalToolKey: string;
  externalToolLabel: string;
  fallbackTasks: ImplementationTaskDraft[];
  implementationTasks: ImplementationTask[];
  isLiveExternalDelivery: boolean;
}): FinalExecutionLaunchDisplayState {
  const connectionHealth = buildFinalExecutionConnectionHealth({
    connections,
    externalToolKey,
    externalToolLabel,
  });
  const taskPreview = buildFinalExecutionTaskPreview({
    buildDeliveryMode,
    externalToolLabel,
    fallbackTasks,
    implementationTasks,
    isLiveExternalDelivery,
  });

  return {
    activeCursorSyncConnections: connectionHealth.activeConnections,
    finalExecutionConnectionHealthDetail: connectionHealth.detail,
    finalExecutionConnectionHealthTitle: connectionHealth.title,
    finalExecutionFallbackTaskPreview: taskPreview.fallbackTaskPreview,
    finalExecutionTaskListDescription: taskPreview.taskListDescription,
    finalExecutionTaskPreview: taskPreview.taskPreview,
    finalExecutionVisibleTaskCount: taskPreview.visibleTaskCount,
    visibleCursorSyncConnections: connectionHealth.visibleConnections,
  };
}
