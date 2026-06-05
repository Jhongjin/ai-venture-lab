import type { VentureArtifactStatus, VentureArtifactType } from "@/lib/supabase/types";
import type { VentureArtifact } from "@/lib/venture-data";
import {
  artifactLabels,
  artifactSourceLabels,
  artifactStatusLabels,
  artifactStatusOptions,
  artifactStatusTone,
  artifactTypeOptions,
} from "@/lib/artifact-labels";

export type ArtifactTypeFilter = VentureArtifactType | "all";
export type ArtifactStatusFilter = VentureArtifactStatus | "all";

export type ArtifactLibraryFilterOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

export type ArtifactDraftIdeaSummary = {
  id: string;
  organization_id: string | null;
};

export type ArtifactDraftSaveControlState = {
  disabled: boolean;
  label: string;
};

export type ArtifactDraftCardDisplayState = {
  copyLabel: string;
  description: string;
  label: string;
};

export type ArtifactLibraryItemDisplayState = {
  showFilteredImplementationRunBadge: boolean;
  sourceDateSummary: string;
  status: VentureArtifactStatus;
  statusLabel: string;
  statusNoteText: string | null;
  statusTone: string;
  title: string;
  typeLabel: string;
  versionLabel: string;
};

export type ArtifactLibraryVersionSummaryState<TVersionSummary> =
  | {
      showText: true;
      text: string;
      versionSummary: TVersionSummary;
    }
  | {
      showText: false;
      text: "";
      versionSummary: null;
    };

export type ArtifactLibraryReviewSummaryCardState<TReviewSummary> =
  | {
      comparisonLabel: string;
      reviewSummary: TReviewSummary;
      showCard: true;
      showMemoButton: true;
    }
  | {
      comparisonLabel: "";
      reviewSummary: null;
      showCard: false;
      showMemoButton: false;
    };

export type ArtifactLibraryItemSupplementDisplayState<TVersionSummary, TReviewSummary> = {
  reviewSummaryCardState: ArtifactLibraryReviewSummaryCardState<TReviewSummary>;
  showStatusNoteText: boolean;
  versionSummaryState: ArtifactLibraryVersionSummaryState<TVersionSummary>;
};

export type RecentDevelopmentHandoffArtifactDisplayState = {
  sourceDateSummary: string;
  title: string;
  versionLabel: string;
};

export type ArtifactLibraryViewDisplayState = {
  recentDevelopmentHandoffCountLabel: string;
  showRecentDevelopmentHandoffArtifacts: boolean;
  showSelectedArtifacts: boolean;
};

export function buildArtifactSavedMessage({ artifactLabel, version }: { artifactLabel: string; version: number }) {
  return `${artifactLabel} v${version}을 저장했습니다.`;
}

export function buildArtifactSaveLoginRequiredMessage() {
  return "제작 자료를 저장하려면 먼저 로그인하세요.";
}

export function buildArtifactSaveEmptyBodyMessage() {
  return "저장할 제작 자료 본문이 비어 있습니다.";
}

export function buildArtifactLibraryFocusMessage(itemLabel: string) {
  return `${itemLabel} 제작 자료를 보관함에서 확인하세요.`;
}

export function buildArtifactDraftSaveControlState({
  hasUser,
  isBusy,
  label = "저장",
}: {
  hasUser: boolean;
  isBusy: boolean;
  label?: string;
}): ArtifactDraftSaveControlState {
  return {
    disabled: isBusy || !hasUser,
    label,
  };
}

export function buildArtifactDraftCardDisplayState({
  artifactType,
  description,
}: {
  artifactType: VentureArtifactType;
  description: string;
}): ArtifactDraftCardDisplayState {
  const label = artifactLabels[artifactType];

  return {
    copyLabel: label,
    description,
    label,
  };
}

export function buildArtifactStatusChangedMessage({
  artifactLabel,
  statusLabel,
}: {
  artifactLabel: string;
  statusLabel: string;
}) {
  return `${artifactLabel} 상태를 ${statusLabel}(으)로 변경했습니다.`;
}

export function buildArtifactStatusUpdatePermissionDeniedMessage() {
  return "문서 작성자 또는 협업 공간 관리자만 이 제작 자료를 수정할 수 있습니다.";
}

export function buildArtifactLibraryVersionSummaryText({
  added,
  previous,
  removed,
}: {
  added: number;
  previous: { version?: number | null };
  removed: number;
}) {
  return `v${previous.version ?? 1} 대비 변경: +${added} / -${removed}줄`;
}

export function buildArtifactLibraryReviewComparisonLabel(previous: { version?: number | null } | null | undefined) {
  return previous ? `v${previous.version ?? 1}` : "최초 버전";
}

export function buildArtifactLibraryItemSupplementDisplayState<
  TVersionSummary extends { added: number; previous: { version?: number | null }; removed: number },
  TReviewSummary extends { previous?: { version?: number | null } | null },
>({
  reviewSummary,
  statusNoteText,
  versionSummary,
}: {
  reviewSummary: TReviewSummary | null | undefined;
  statusNoteText: string | null;
  versionSummary: TVersionSummary | null | undefined;
}): ArtifactLibraryItemSupplementDisplayState<TVersionSummary, TReviewSummary> {
  return {
    reviewSummaryCardState: reviewSummary
      ? {
          comparisonLabel: buildArtifactLibraryReviewComparisonLabel(reviewSummary.previous),
          reviewSummary,
          showCard: true,
          showMemoButton: true,
        }
      : {
          comparisonLabel: "",
          reviewSummary: null,
          showCard: false,
          showMemoButton: false,
        },
    showStatusNoteText: Boolean(statusNoteText),
    versionSummaryState: versionSummary
      ? {
          showText: true,
          text: buildArtifactLibraryVersionSummaryText(versionSummary),
          versionSummary,
        }
      : {
          showText: false,
          text: "",
          versionSummary: null,
        },
  };
}

export function buildArtifactDraftInsertRow({
  artifactType,
  body,
  idea,
  source,
  statusNote = "실행 보드에서 생성한 초기 초안입니다.",
  title,
  version,
}: {
  artifactType: VentureArtifactType;
  body: string;
  idea: ArtifactDraftIdeaSummary;
  source: string;
  statusNote?: string;
  title: string;
  version: number;
}) {
  return {
    artifact_type: artifactType,
    body,
    idea_id: idea.id,
    organization_id: idea.organization_id,
    source,
    status: "draft" as const,
    status_note: statusNote,
    title,
    version,
  };
}

export function buildArtifactDraftSavePlan({
  artifacts,
  artifactType,
  body,
  idea,
  source,
  statusNote,
  title,
  version,
}: {
  artifacts: ReadonlyArray<Pick<VentureArtifact, "artifact_type" | "version">>;
  artifactType: VentureArtifactType;
  body: string;
  idea: ArtifactDraftIdeaSummary;
  source: string;
  statusNote?: string;
  title: string;
  version?: number;
}) {
  const nextVersion = version ?? getNextArtifactVersion(artifacts, artifactType);

  return {
    row: buildArtifactDraftInsertRow({
      artifactType,
      body,
      idea,
      source,
      statusNote,
      title,
      version: nextVersion,
    }),
    version: nextVersion,
  };
}

export function buildArtifactSavedTelemetryPayload({
  artifact,
  source,
}: {
  artifact: Pick<VentureArtifact, "artifact_type" | "body" | "source" | "title" | "version">;
  source: string;
}) {
  return {
    eventCategory: source === "post_launch_learning" ? "learning" : source.includes("launch") ? "launch" : "artifact",
    properties: {
      artifact_type: artifact.artifact_type,
      source: artifact.source || "manual",
      version: artifact.version ?? 1,
      title_length: artifact.title.length,
      body_length: artifact.body.length,
    },
  };
}

export function buildArtifactStatusUpdatePatch({
  approvedAt = new Date().toISOString(),
  defaultStatusNotes,
  status,
  statusNote,
  userId,
}: {
  approvedAt?: string;
  defaultStatusNotes: Record<VentureArtifactStatus, string>;
  status: VentureArtifactStatus;
  statusNote: string;
  userId: string | null;
}) {
  return {
    approved_at: status === "approved" ? approvedAt : null,
    approved_by: status === "approved" ? userId : null,
    status,
    status_note: statusNote.trim() || defaultStatusNotes[status],
  };
}

export function buildArtifactStatusTelemetryProperties(
  artifact: Pick<VentureArtifact, "artifact_type" | "status" | "version">,
) {
  return {
    artifact_type: artifact.artifact_type,
    status: artifact.status,
    version: artifact.version ?? 1,
  };
}

export function countApprovedArtifacts(artifacts: Array<Pick<VentureArtifact, "status">>) {
  return artifacts.filter((artifact) => artifact.status === "approved").length;
}

export type ArtifactReadinessFlags = {
  implementationTaskSourceArtifact: VentureArtifact | undefined;
  hasIdeaBriefArtifact: boolean;
  hasResearchNoteArtifact: boolean;
  hasResearchBriefArtifact: boolean;
  hasValidationSprintArtifact: boolean;
  hasValidationSummaryArtifact: boolean;
  hasEvidenceCaptureArtifact: boolean;
  hasExperimentResultArtifact: boolean;
  validationSummaryRequirements: Array<{ label: string; passed: boolean }>;
  canSaveValidationSummary: boolean;
  isValidationBundleSaved: boolean;
  canEnterDevelopmentFromValidationDocs: boolean;
  hasPrdArtifact: boolean;
  hasApprovedPrdArtifact: boolean;
  hasMvpSpecArtifact: boolean;
  hasApprovedMvpSpecArtifact: boolean;
  hasMvpSlicePlanArtifact: boolean;
  hasMvpScopeArtifact: boolean;
  hasLaunchChecklistArtifact: boolean;
  hasBackendDecisionArtifact: boolean;
  hasDesignBriefArtifact: boolean;
  hasApprovedDesignBriefArtifact: boolean;
  hasDesignGenerationPromptArtifact: boolean;
  hasTechSpecArtifact: boolean;
  hasApprovedTechSpecArtifact: boolean;
  hasDevRunbookArtifact: boolean;
  hasDevelopmentPlanArtifact: boolean;
  hasAgentRunPackageArtifact: boolean;
  hasDevelopmentDesignPackageArtifact: boolean;
  hasDevelopmentExecutionPackageArtifact: boolean;
  hasDevelopmentHandoffPackageArtifact: boolean;
  manualDevelopmentDraftCount: number;
  hasManualDevelopmentPackageFallback: boolean;
  canEnterOrchestrationFromDevelopmentDocs: boolean;
  developmentOpsArtifacts: VentureArtifact[];
  hasEnvironmentChecklist: boolean;
  hasBackendRulesChecklist: boolean;
  hasReleaseOpsChecklist: boolean;
  hasDesignStateCoverage: boolean;
};

export function buildArtifactSourceOptions(artifacts: VentureArtifact[]) {
  return ["all", ...sortArtifactSources(artifacts.map((artifact) => artifact.source || "manual"))];
}

export function compareArtifactSources(a: string, b: string) {
  return a.localeCompare(b, "ko-KR");
}

export function sortArtifactSources(sources: Iterable<string>) {
  return Array.from(new Set(sources)).sort(compareArtifactSources);
}

export function buildArtifactSourceFilterLabels(sourceOptions: string[]) {
  return Object.fromEntries(
    sourceOptions.map((source) => [
      source,
      source === "all" ? "전체 출처" : (artifactSourceLabels[source] ?? source),
    ]),
  ) as Record<string, string>;
}

export function buildArtifactSourceDisplayLabel(source: string | null | undefined) {
  return artifactSourceLabels[source || "manual"] ?? source ?? "수동";
}

export function buildArtifactLibraryItemDisplayState({
  approvedDateLabel = null,
  artifact,
  createdDateLabel,
}: {
  approvedDateLabel?: string | null;
  artifact: Pick<VentureArtifact, "artifact_type" | "source" | "status" | "status_note" | "title" | "version">;
  createdDateLabel: string;
}): ArtifactLibraryItemDisplayState {
  const status = artifact.status ?? "draft";

  return {
    showFilteredImplementationRunBadge: artifact.source === "filtered_implementation_run",
    sourceDateSummary: buildArtifactLibraryItemSourceDateSummary({
      approvedDateLabel,
      createdDateLabel,
      sourceLabel: buildArtifactSourceDisplayLabel(artifact.source),
    }),
    status,
    statusLabel: artifactStatusLabels[status],
    statusNoteText: artifact.status_note ? `점검 메모: ${artifact.status_note}` : null,
    statusTone: artifactStatusTone[status],
    title: artifact.title || "제목 없음",
    typeLabel: artifactLabels[artifact.artifact_type],
    versionLabel: `v${artifact.version ?? 1}`,
  };
}

export function buildArtifactLibraryItemSourceDateSummary({
  approvedDateLabel,
  createdDateLabel,
  sourceLabel,
}: {
  approvedDateLabel?: string | null;
  createdDateLabel: string;
  sourceLabel: string;
}) {
  return approvedDateLabel
    ? `${sourceLabel} / ${createdDateLabel} / 승인 ${approvedDateLabel}`
    : `${sourceLabel} / ${createdDateLabel}`;
}

export function buildArtifactTypeFilterOptions(): Array<ArtifactLibraryFilterOption<ArtifactTypeFilter>> {
  return [
    { label: "전체 유형", value: "all" },
    ...artifactTypeOptions.map((value) => ({ label: artifactLabels[value], value })),
  ];
}

export function buildArtifactStatusFilterOptions(): Array<ArtifactLibraryFilterOption<ArtifactStatusFilter>> {
  return [
    { label: "전체 상태", value: "all" },
    ...artifactStatusOptions.map((value) => ({ label: artifactStatusLabels[value], value })),
  ];
}

export function buildArtifactSourceFilterOptions(
  sourceOptions: string[],
  sourceLabels = buildArtifactSourceFilterLabels(sourceOptions),
): ArtifactLibraryFilterOption[] {
  return sourceOptions.map((value) => ({ label: sourceLabels[value] ?? value, value }));
}

export function buildArtifactLibraryEmptyMessage({ hasArtifacts }: { hasArtifacts: boolean }) {
  return hasArtifacts ? "현재 필터에 맞는 제작 자료가 없습니다." : "아직 저장된 제작 자료가 없습니다.";
}

export function resolveArtifactSourceFilter(sourceOptions: string[], sourceFilter: string) {
  return sourceOptions.includes(sourceFilter) ? sourceFilter : "all";
}

export function filterArtifactLibrary({
  artifacts,
  limit = 8,
  sourceFilter,
  statusFilter,
  typeFilter,
}: {
  artifacts: VentureArtifact[];
  limit?: number;
  sourceFilter: string;
  statusFilter: ArtifactStatusFilter;
  typeFilter: ArtifactTypeFilter;
}) {
  return artifacts
    .filter((artifact) => typeFilter === "all" || artifact.artifact_type === typeFilter)
    .filter((artifact) => statusFilter === "all" || (artifact.status ?? "draft") === statusFilter)
    .filter((artifact) => sourceFilter === "all" || (artifact.source || "manual") === sourceFilter)
    .slice(0, limit);
}

export function getRecentDevelopmentHandoffArtifacts(artifacts: VentureArtifact[], limit = 3) {
  return artifacts
    .filter(
      (artifact) =>
        artifact.artifact_type === "dev_runbook" &&
        ["filtered_implementation_run", "development_process"].includes(artifact.source || ""),
    )
    .slice(0, limit);
}

export function buildRecentDevelopmentHandoffArtifactDisplayState({
  artifact,
  createdDateLabel,
}: {
  artifact: Pick<VentureArtifact, "source" | "title" | "version">;
  createdDateLabel: string;
}): RecentDevelopmentHandoffArtifactDisplayState {
  return {
    sourceDateSummary: buildArtifactLibraryItemSourceDateSummary({
      createdDateLabel,
      sourceLabel: buildArtifactSourceDisplayLabel(artifact.source),
    }),
    title: artifact.title || "제목 없음",
    versionLabel: `v${artifact.version ?? 1}`,
  };
}

export function buildArtifactLibraryViewDisplayState({
  recentDevelopmentHandoffArtifactCount,
  selectedArtifactCount,
}: {
  recentDevelopmentHandoffArtifactCount: number;
  selectedArtifactCount: number;
}): ArtifactLibraryViewDisplayState {
  return {
    recentDevelopmentHandoffCountLabel: `${recentDevelopmentHandoffArtifactCount}개`,
    showRecentDevelopmentHandoffArtifacts: recentDevelopmentHandoffArtifactCount > 0,
    showSelectedArtifacts: selectedArtifactCount > 0,
  };
}

export function buildArtifactLibraryViewState({
  artifacts,
  sourceFilter,
  statusFilter,
  typeFilter,
}: {
  artifacts: VentureArtifact[];
  sourceFilter: string;
  statusFilter: ArtifactStatusFilter;
  typeFilter: ArtifactTypeFilter;
}) {
  const artifactSourceOptions = buildArtifactSourceOptions(artifacts);
  const artifactSourceFilterLabels = buildArtifactSourceFilterLabels(artifactSourceOptions);
  const activeArtifactSourceFilter = resolveArtifactSourceFilter(artifactSourceOptions, sourceFilter);
  const recentDevelopmentHandoffArtifacts = getRecentDevelopmentHandoffArtifacts(artifacts);
  const selectedArtifacts = filterArtifactLibrary({
    artifacts,
    sourceFilter: activeArtifactSourceFilter,
    statusFilter,
    typeFilter,
  });

  return {
    activeArtifactSourceFilter,
    artifactLibraryEmptyMessage: buildArtifactLibraryEmptyMessage({ hasArtifacts: artifacts.length > 0 }),
    artifactLibraryViewDisplayState: buildArtifactLibraryViewDisplayState({
      recentDevelopmentHandoffArtifactCount: recentDevelopmentHandoffArtifacts.length,
      selectedArtifactCount: selectedArtifacts.length,
    }),
    artifactSourceFilterLabels,
    artifactSourceFilterOptions: buildArtifactSourceFilterOptions(artifactSourceOptions, artifactSourceFilterLabels),
    artifactSourceOptions,
    artifactStatusFilterOptions: buildArtifactStatusFilterOptions(),
    artifactTypeFilterOptions: buildArtifactTypeFilterOptions(),
    recentDevelopmentHandoffArtifacts,
    selectedArtifacts,
  };
}

export function getNextArtifactVersion(
  artifacts: ReadonlyArray<Pick<VentureArtifact, "artifact_type" | "version">>,
  artifactType: VentureArtifactType,
) {
  return (
    Math.max(
      0,
      ...artifacts
        .filter((artifact) => artifact.artifact_type === artifactType)
        .map((artifact) => artifact.version ?? 1),
    ) + 1
  );
}

function isImplementationTaskSourceArtifact(artifact: VentureArtifact) {
  return ["tech_spec", "dev_runbook", "mvp_spec", "prd"].includes(artifact.artifact_type);
}

export function buildArtifactReadinessFlags(artifacts: VentureArtifact[]): ArtifactReadinessFlags {
  const implementationTaskSourceArtifact =
    artifacts.find((artifact) => artifact.status === "approved" && isImplementationTaskSourceArtifact(artifact)) ??
    artifacts.find(isImplementationTaskSourceArtifact);
  const hasIdeaBriefArtifact = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "idea_brief" ||
      (artifact.title || "").includes("아이디어 브리프") ||
      (artifact.title || "").includes("아이디어 요약"),
  );
  const hasResearchNoteArtifact = artifacts.some((artifact) => artifact.artifact_type === "research_note");
  const hasResearchBriefArtifact = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "research_note" &&
      (artifact.source === "extracted_research_brief" ||
        ((artifact.source || "workbench") === "workbench" && (artifact.title || "").includes("리서치 브리프")) ||
        ((artifact.source || "workbench") === "workbench" && (artifact.title || "").includes("조사 요약")) ||
        (artifact.body || "").startsWith("# 리서치 브리프")),
  );
  const hasValidationSprintArtifact = artifacts.some(
    (artifact) => artifact.source === "validation_sprint" || (artifact.title || "").includes("7일 검증 계획"),
  );
  const hasValidationSummaryArtifact = artifacts.some(
    (artifact) => artifact.source === "validation_summary" || (artifact.title || "").includes("검증 완료 요약"),
  );
  const hasEvidenceCaptureArtifact = artifacts.some((artifact) => artifact.source === "evidence_capture");
  const hasExperimentResultArtifact = artifacts.some((artifact) => artifact.source === "experiment_result");
  const validationSummaryRequirements = [
    { label: "아이디어 요약", passed: hasIdeaBriefArtifact },
    { label: "조사 요약", passed: hasResearchBriefArtifact },
    { label: "7일 검증 계획", passed: hasValidationSprintArtifact },
  ];
  const canSaveValidationSummary = validationSummaryRequirements.every((requirement) => requirement.passed);
  const isValidationBundleSaved = canSaveValidationSummary && hasValidationSummaryArtifact;
  const canEnterDevelopmentFromValidationDocs = canSaveValidationSummary && hasValidationSummaryArtifact;
  const hasPrdArtifact = artifacts.some((artifact) => artifact.artifact_type === "prd");
  const hasApprovedPrdArtifact = artifacts.some(
    (artifact) => artifact.artifact_type === "prd" && artifact.status === "approved",
  );
  const hasMvpSpecArtifact = artifacts.some((artifact) => artifact.artifact_type === "mvp_spec");
  const hasApprovedMvpSpecArtifact = artifacts.some(
    (artifact) => artifact.artifact_type === "mvp_spec" && artifact.status === "approved",
  );
  const hasMvpSlicePlanArtifact = artifacts.some((artifact) => artifact.source === "mvp_slice_plan");
  const hasMvpScopeArtifact = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "mvp_spec" &&
      (artifact.source || "workbench") === "workbench" &&
      (artifact.title || "").includes("첫 제작 범위") &&
      !(artifact.title || "").includes("플랜"),
  );
  const hasLaunchChecklistArtifact = artifacts.some((artifact) => artifact.artifact_type === "launch_checklist");
  const hasBackendDecisionArtifact = artifacts.some((artifact) => artifact.artifact_type === "backend_decision");
  const hasDesignBriefArtifact = artifacts.some((artifact) => artifact.artifact_type === "design_brief");
  const hasApprovedDesignBriefArtifact = artifacts.some(
    (artifact) => artifact.artifact_type === "design_brief" && artifact.status === "approved",
  );
  const hasDesignGenerationPromptArtifact = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "design_brief" &&
      (artifact.source === "design_generation_prompt" ||
        (artifact.title || "").includes("디자인 기준 자료") ||
        (artifact.title || "").includes("디자인 생성 프롬프트")),
  );
  const hasTechSpecArtifact = artifacts.some((artifact) => artifact.artifact_type === "tech_spec");
  const hasApprovedTechSpecArtifact = artifacts.some(
    (artifact) => artifact.artifact_type === "tech_spec" && artifact.status === "approved",
  );
  const hasDevRunbookArtifact = artifacts.some((artifact) => artifact.artifact_type === "dev_runbook");
  const hasDevelopmentPlanArtifact = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "dev_runbook" &&
      artifact.source === "development_process" &&
      (artifact.title || "").includes("제작 실행 계획"),
  );
  const hasAgentRunPackageArtifact = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "dev_runbook" &&
      (artifact.source === "agent_run_package" ||
        (artifact.title || "").includes("제작 패키지") ||
        (artifact.title || "").includes("하네스 패키지")),
  );
  const hasDevelopmentDesignPackageArtifact = hasDesignGenerationPromptArtifact || hasDesignBriefArtifact;
  const hasDevelopmentExecutionPackageArtifact =
    hasDevelopmentPlanArtifact ||
    artifacts.some(
      (artifact) =>
        artifact.artifact_type === "dev_runbook" &&
        (artifact.source === "development_process" ||
          (artifact.title || "").includes("제작 실행 계획") ||
          (artifact.body || "").includes("## 상세 실행 계획")),
    );
  const hasDevelopmentHandoffPackageArtifact =
    hasAgentRunPackageArtifact ||
    artifacts.some(
      (artifact) =>
        artifact.artifact_type === "dev_runbook" &&
        ((artifact.body || "").includes("# 제작 패키지") ||
          (artifact.body || "").includes("제작 도구 전달 자료") ||
          (artifact.body || "").includes("외부 제작 패키지 구성")),
    );
  const manualDevelopmentDraftCount = [
    hasBackendDecisionArtifact,
    hasDevelopmentDesignPackageArtifact,
    hasTechSpecArtifact,
    hasDevRunbookArtifact,
  ].filter(Boolean).length;
  const hasManualDevelopmentPackageFallback = hasDevRunbookArtifact && manualDevelopmentDraftCount >= 3;
  const canEnterOrchestrationFromDevelopmentDocs =
    (hasDevelopmentDesignPackageArtifact &&
      hasDevelopmentExecutionPackageArtifact &&
      hasDevelopmentHandoffPackageArtifact) ||
    hasManualDevelopmentPackageFallback;
  const developmentOpsArtifacts = artifacts.filter((artifact) =>
    ["backend_decision", "tech_spec", "dev_runbook"].includes(artifact.artifact_type),
  );
  const hasEnvironmentChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      ["환경변수", "Vercel"].every((term) => artifact.body.includes(term)) &&
      ["서버 전용", "클라이언트", "비밀값"].some((term) => artifact.body.includes(term)),
  );
  const hasBackendRulesChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      (artifact.body.includes("RLS") || artifact.body.includes("Security Rules")) &&
      ["허용", "차단"].every((term) => artifact.body.includes(term)),
  );
  const hasReleaseOpsChecklist = developmentOpsArtifacts.some(
    (artifact) =>
      ["롤백", "Production"].every((term) => artifact.body.includes(term)) &&
      (artifact.body.includes("배포 로그") || artifact.body.includes("빌드 로그") || artifact.body.includes("Vercel 로그")),
  );
  const hasDesignStateCoverage = artifacts.some(
    (artifact) =>
      artifact.artifact_type === "design_brief" &&
      ["빈 상태", "로딩", "오류", "권한", "모바일", "접근성"].every((term) => artifact.body.includes(term)),
  );

  return {
    implementationTaskSourceArtifact,
    hasIdeaBriefArtifact,
    hasResearchNoteArtifact,
    hasResearchBriefArtifact,
    hasValidationSprintArtifact,
    hasValidationSummaryArtifact,
    hasEvidenceCaptureArtifact,
    hasExperimentResultArtifact,
    validationSummaryRequirements,
    canSaveValidationSummary,
    isValidationBundleSaved,
    canEnterDevelopmentFromValidationDocs,
    hasPrdArtifact,
    hasApprovedPrdArtifact,
    hasMvpSpecArtifact,
    hasApprovedMvpSpecArtifact,
    hasMvpSlicePlanArtifact,
    hasMvpScopeArtifact,
    hasLaunchChecklistArtifact,
    hasBackendDecisionArtifact,
    hasDesignBriefArtifact,
    hasApprovedDesignBriefArtifact,
    hasDesignGenerationPromptArtifact,
    hasTechSpecArtifact,
    hasApprovedTechSpecArtifact,
    hasDevRunbookArtifact,
    hasDevelopmentPlanArtifact,
    hasAgentRunPackageArtifact,
    hasDevelopmentDesignPackageArtifact,
    hasDevelopmentExecutionPackageArtifact,
    hasDevelopmentHandoffPackageArtifact,
    manualDevelopmentDraftCount,
    hasManualDevelopmentPackageFallback,
    canEnterOrchestrationFromDevelopmentDocs,
    developmentOpsArtifacts,
    hasEnvironmentChecklist,
    hasBackendRulesChecklist,
    hasReleaseOpsChecklist,
    hasDesignStateCoverage,
  };
}
