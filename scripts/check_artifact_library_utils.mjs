import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/artifact-library-utils.ts");
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");
const artifactLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/artifact-labels.ts")).href;
const source = readFileSync(modulePath, "utf8").replace(
  'from "@/lib/artifact-labels";',
  `from ${JSON.stringify(artifactLabelsUrl)};`,
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { artifactStatusOptions, artifactTypeOptions } = await import(artifactLabelsUrl);
const {
  buildArtifactDraftCardDisplayState,
  buildArtifactDraftInsertRow,
  buildArtifactDraftSavePlan,
  buildArtifactDraftSaveControlState,
  buildArtifactLibraryEmptyMessage,
  buildArtifactLibraryItemDisplayState,
  buildArtifactLibraryItemSourceDateSummary,
  buildArtifactLibraryItemSupplementDisplayState,
  buildArtifactLibraryViewDisplayState,
  buildArtifactLibraryViewState,
  buildArtifactLibraryFocusMessage,
  buildArtifactReadinessFlags,
  buildArtifactSaveEmptyBodyMessage,
  buildArtifactSaveLoginRequiredMessage,
  buildArtifactSavedTelemetryPayload,
  buildArtifactSavedMessage,
  buildArtifactSourceDisplayLabel,
  buildArtifactSourceFilterLabels,
  buildArtifactSourceFilterOptions,
  buildArtifactSourceOptions,
  buildArtifactStatusFilterOptions,
  buildArtifactStatusChangedMessage,
  buildArtifactStatusTelemetryProperties,
  buildArtifactStatusUpdatePermissionDeniedMessage,
  buildArtifactStatusUpdatePatch,
  buildArtifactTypeFilterOptions,
  buildRecentDevelopmentHandoffArtifactDisplayState,
  countApprovedArtifacts,
  compareArtifactSources,
  filterArtifactLibrary,
  getNextArtifactVersion,
  getRecentDevelopmentHandoffArtifacts,
  resolveArtifactSourceFilter,
  sortArtifactSources,
} = await import(moduleUrl);

assert.deepEqual(artifactStatusOptions, ["draft", "approved", "archived"]);
assert.deepEqual(artifactTypeOptions, [
  "idea_brief",
  "research_note",
  "prd",
  "mvp_spec",
  "backend_decision",
  "design_brief",
  "tech_spec",
  "dev_runbook",
  "launch_checklist",
]);
assert.equal(buildArtifactSavedMessage({ artifactLabel: "제품 기획서", version: 2 }), "제품 기획서 v2을 저장했습니다.");
assert.equal(buildArtifactSaveLoginRequiredMessage(), "제작 자료를 저장하려면 먼저 로그인하세요.");
assert.equal(buildArtifactSaveEmptyBodyMessage(), "저장할 제작 자료 본문이 비어 있습니다.");
assert.equal(buildArtifactLibraryFocusMessage("제품 기획서"), "제품 기획서 제작 자료를 보관함에서 확인하세요.");
assert.equal(
  buildArtifactLibraryEmptyMessage({ hasArtifacts: true }),
  "현재 필터에 맞는 제작 자료가 없습니다.",
);
assert.equal(
  buildArtifactLibraryEmptyMessage({ hasArtifacts: false }),
  "아직 저장된 제작 자료가 없습니다.",
);
assert.deepEqual(buildArtifactTypeFilterOptions().slice(0, 3), [
  { label: "전체 유형", value: "all" },
  { label: "아이디어 요약", value: "idea_brief" },
  { label: "리서치 노트", value: "research_note" },
]);
assert.deepEqual(buildArtifactStatusFilterOptions(), [
  { label: "전체 상태", value: "all" },
  { label: "초안", value: "draft" },
  { label: "승인됨", value: "approved" },
  { label: "보관됨", value: "archived" },
]);
assert.deepEqual(buildArtifactDraftSaveControlState({
  hasUser: true,
  isBusy: false,
}), {
  disabled: false,
  label: "저장",
});
assert.deepEqual(buildArtifactDraftSaveControlState({
  hasUser: false,
  isBusy: true,
  label: "요약 저장",
}), {
  disabled: true,
  label: "요약 저장",
});
assert.deepEqual(
  buildArtifactDraftCardDisplayState({
    artifactType: "backend_decision",
    description: "백엔드 선택 기준",
  }),
  {
    copyLabel: "백엔드 결정",
    description: "백엔드 선택 기준",
    label: "백엔드 결정",
  },
);
assert.ok(
  ideaWorkbenchSource.includes("artifactDraftSaveControlState.disabled"),
  "IdeaWorkbench should render development artifact draft save disabled state from shared helper.",
);
assert.equal(
  buildArtifactStatusChangedMessage({ artifactLabel: "제품 기획서", statusLabel: "승인" }),
  "제품 기획서 상태를 승인(으)로 변경했습니다.",
);
assert.equal(
  buildArtifactStatusUpdatePermissionDeniedMessage(),
  "문서 작성자 또는 협업 공간 관리자만 이 제작 자료를 수정할 수 있습니다.",
);

function artifact({ body, createdAt, id, source = "manual", status = "draft", title, type = "prd", version = 1 }) {
  return {
    artifact_type: type,
    body: body ?? `# Artifact ${id}`,
    created_at: createdAt,
    created_by: null,
    id,
    idea_id: "idea-1",
    organization_id: null,
    source,
    status,
    status_note: null,
    title: title ?? `Artifact ${id}`,
    updated_at: createdAt,
    version,
  };
}

const artifacts = [
  artifact({
    createdAt: "2026-06-01T04:00:00.000Z",
    id: "handoff-filtered",
    source: "filtered_implementation_run",
    type: "dev_runbook",
  }),
  artifact({
    createdAt: "2026-06-01T03:00:00.000Z",
    id: "approved-prd",
    source: "workbench",
    status: "approved",
    type: "prd",
  }),
  artifact({
    createdAt: "2026-06-01T02:00:00.000Z",
    id: "manual-prd",
    source: "",
    type: "prd",
  }),
  artifact({
    createdAt: "2026-06-01T01:00:00.000Z",
    id: "handoff-process",
    source: "development_process",
    type: "dev_runbook",
  }),
  artifact({
    createdAt: "2026-06-01T00:00:00.000Z",
    id: "evidence",
    source: "evidence_capture",
    type: "research_note",
  }),
  artifact({
    body: "# 리서치 브리프\n조사 요약",
    createdAt: "2026-05-31T23:00:00.000Z",
    id: "research-brief",
    source: "extracted_research_brief",
    type: "research_note",
  }),
  artifact({
    createdAt: "2026-05-31T22:00:00.000Z",
    id: "idea-brief",
    source: "workbench",
    title: "아이디어 브리프",
    type: "idea_brief",
  }),
  artifact({
    createdAt: "2026-05-31T21:00:00.000Z",
    id: "validation-sprint",
    source: "validation_sprint",
    title: "7일 검증 계획",
    type: "research_note",
  }),
  artifact({
    createdAt: "2026-05-31T20:00:00.000Z",
    id: "validation-summary",
    source: "validation_summary",
    title: "검증 완료 요약",
    type: "research_note",
  }),
  artifact({
    createdAt: "2026-05-31T19:00:00.000Z",
    id: "experiment-result",
    source: "experiment_result",
    type: "research_note",
  }),
  artifact({
    body: "환경변수 Vercel 서버 전용 비밀값 RLS 허용 차단 롤백 Production Vercel 로그",
    createdAt: "2026-05-31T18:00:00.000Z",
    id: "tech-spec",
    status: "approved",
    type: "tech_spec",
  }),
  artifact({
    body: "빈 상태 로딩 오류 권한 모바일 접근성",
    createdAt: "2026-05-31T17:00:00.000Z",
    id: "design-brief",
    source: "design_generation_prompt",
    status: "approved",
    title: "디자인 기준 자료",
    type: "design_brief",
  }),
  artifact({
    body: "# 제작 패키지\n제작 도구 전달 자료\n## 상세 실행 계획",
    createdAt: "2026-05-31T16:00:00.000Z",
    id: "agent-package",
    source: "agent_run_package",
    title: "제작 패키지",
    type: "dev_runbook",
  }),
  artifact({
    createdAt: "2026-05-31T15:00:00.000Z",
    id: "backend-decision",
    type: "backend_decision",
  }),
];
assert.equal(countApprovedArtifacts(artifacts), 3);

assert.deepEqual(
  buildArtifactDraftInsertRow({
    artifactType: "prd",
    body: "# PRD",
    idea: { id: "idea-1", organization_id: "org-1" },
    source: "workbench",
    title: "AI Venture Lab PRD",
    version: 3,
  }),
  {
    artifact_type: "prd",
    body: "# PRD",
    idea_id: "idea-1",
    organization_id: "org-1",
    source: "workbench",
    status: "draft",
    status_note: "실행 보드에서 생성한 초기 초안입니다.",
    title: "AI Venture Lab PRD",
    version: 3,
  },
);
assert.equal(
  buildArtifactDraftInsertRow({
    artifactType: "research_note",
    body: "evidence",
    idea: { id: "idea-2", organization_id: null },
    source: "validation_sprint",
    statusNote: "검증 자료 자동 저장에서 생성한 초안입니다.",
    title: "7일 검증 계획",
    version: 1,
  }).status_note,
  "검증 자료 자동 저장에서 생성한 초안입니다.",
);
const savePlan = buildArtifactDraftSavePlan({
  artifacts: [
    { artifact_type: "prd", version: 1 },
    { artifact_type: "prd", version: 3 },
    { artifact_type: "tech_spec", version: 9 },
  ],
  artifactType: "prd",
  body: "# PRD v4",
  idea: { id: "idea-3", organization_id: "org-1" },
  source: "workbench",
  statusNote: "사용자가 저장한 초안입니다.",
  title: "AI Venture Lab PRD",
});
assert.equal(savePlan.version, 4);
assert.deepEqual(savePlan.row, {
  artifact_type: "prd",
  body: "# PRD v4",
  idea_id: "idea-3",
  organization_id: "org-1",
  source: "workbench",
  status: "draft",
  status_note: "사용자가 저장한 초안입니다.",
  title: "AI Venture Lab PRD",
  version: 4,
});
assert.equal(
  buildArtifactDraftSavePlan({
    artifacts: [],
    artifactType: "tech_spec",
    body: "# Tech",
    idea: { id: "idea-4", organization_id: null },
    source: "app_blueprint",
    title: "Tech",
    version: 7,
  }).version,
  7,
);

assert.deepEqual(
  buildArtifactSavedTelemetryPayload({
    artifact: artifact({
      body: "# 학습 리포트",
      createdAt: "2026-06-01T06:00:00.000Z",
      id: "learning-report",
      source: "post_launch_learning",
      title: "학습 리포트",
      type: "research_note",
      version: 2,
    }),
    source: "post_launch_learning",
  }),
  {
    eventCategory: "learning",
    properties: {
      artifact_type: "research_note",
      source: "post_launch_learning",
      version: 2,
      title_length: 6,
      body_length: 8,
    },
  },
);
assert.equal(
  buildArtifactSavedTelemetryPayload({
    artifact: artifact({
      createdAt: "2026-06-01T06:30:00.000Z",
      id: "launch-checklist",
      source: "",
      title: "출시 점검",
      type: "launch_checklist",
    }),
    source: "launch_checklist",
  }).eventCategory,
  "launch",
);
assert.equal(
  buildArtifactSavedTelemetryPayload({
    artifact: artifact({
      createdAt: "2026-06-01T07:00:00.000Z",
      id: "manual-doc",
      source: "",
      title: "수동 문서",
      type: "prd",
    }),
    source: "workbench",
  }).properties.source,
  "manual",
);

assert.deepEqual(
  buildArtifactStatusUpdatePatch({
    approvedAt: "2026-06-01T00:00:00.000Z",
    defaultStatusNotes: {
      approved: "승인됨",
      archived: "보관됨",
      draft: "초안",
      superseded: "대체됨",
    },
    status: "approved",
    statusNote: "  범위 확인 완료  ",
    userId: "user-1",
  }),
  {
    approved_at: "2026-06-01T00:00:00.000Z",
    approved_by: "user-1",
    status: "approved",
    status_note: "범위 확인 완료",
  },
);
assert.deepEqual(
  buildArtifactStatusUpdatePatch({
    approvedAt: "2026-06-01T00:00:00.000Z",
    defaultStatusNotes: {
      approved: "승인됨",
      archived: "보관됨",
      draft: "초안",
      superseded: "대체됨",
    },
    status: "superseded",
    statusNote: "",
    userId: "user-1",
  }),
  {
    approved_at: null,
    approved_by: null,
    status: "superseded",
    status_note: "대체됨",
  },
);
assert.deepEqual(
  buildArtifactStatusTelemetryProperties({
    artifact_type: "tech_spec",
    status: "approved",
    version: null,
  }),
  {
    artifact_type: "tech_spec",
    status: "approved",
    version: 1,
  },
);

const sourceOptions = buildArtifactSourceOptions(artifacts);
assert.equal(sourceOptions[0], "all");
assert.deepEqual(sortArtifactSources(["workbench", "manual", "evidence_capture", "manual"]), [
  "evidence_capture",
  "manual",
  "workbench",
]);
assert.equal(compareArtifactSources("evidence_capture", "manual"), -1);
assert.equal(compareArtifactSources("workbench", "manual"), 1);
assert.equal(compareArtifactSources("manual", "manual"), 0);
assert.deepEqual(sourceOptions.slice(1), [
  "agent_run_package",
  "design_generation_prompt",
  "development_process",
  "evidence_capture",
  "experiment_result",
  "extracted_research_brief",
  "filtered_implementation_run",
  "manual",
  "validation_sprint",
  "validation_summary",
  "workbench",
]);

const labels = buildArtifactSourceFilterLabels(sourceOptions);
assert.equal(labels.all, "전체 출처");
assert.equal(labels.filtered_implementation_run, "선별 제작 자료");
assert.equal(labels.manual, "수동");
assert.equal(buildArtifactSourceDisplayLabel("agent_run_package"), "제작 도구 전달 자료");
assert.equal(buildArtifactSourceDisplayLabel("unknown_source"), "unknown_source");
assert.equal(buildArtifactSourceDisplayLabel(""), "수동");
assert.equal(buildArtifactSourceDisplayLabel(null), "수동");
assert.equal(
  buildArtifactLibraryItemSourceDateSummary({
    approvedDateLabel: "2026. 06. 02.",
    createdDateLabel: "2026. 06. 01.",
    sourceLabel: "실행 보드",
  }),
  "실행 보드 / 2026. 06. 01. / 승인 2026. 06. 02.",
);
assert.equal(
  buildArtifactLibraryItemSourceDateSummary({
    approvedDateLabel: null,
    createdDateLabel: "2026. 06. 01.",
    sourceLabel: "수동",
  }),
  "수동 / 2026. 06. 01.",
);
assert.deepEqual(
  buildArtifactLibraryItemDisplayState({
    approvedDateLabel: "2026. 06. 02.",
    artifact: {
      ...artifacts[0],
      status: "approved",
      status_note: "범위 확인 완료",
    },
    createdDateLabel: "2026. 06. 01.",
  }),
  {
    showFilteredImplementationRunBadge: true,
    sourceDateSummary: "선별 제작 자료 / 2026. 06. 01. / 승인 2026. 06. 02.",
    status: "approved",
    statusLabel: "승인됨",
    statusNoteText: "점검 메모: 범위 확인 완료",
    statusTone: "avl-pill avl-pill-success",
    title: "Artifact handoff-filtered",
    typeLabel: "제작 실행 계획",
    versionLabel: "v1",
  },
);
assert.deepEqual(
  buildArtifactLibraryItemDisplayState({
    artifact: {
      ...artifacts[2],
      source: "",
      status: null,
      title: "",
      version: null,
    },
    createdDateLabel: "2026. 06. 01.",
  }),
  {
    showFilteredImplementationRunBadge: false,
    sourceDateSummary: "수동 / 2026. 06. 01.",
    status: "draft",
    statusLabel: "초안",
    statusNoteText: null,
    statusTone: "avl-pill avl-pill-neutral",
    title: "제목 없음",
    typeLabel: "제품 기획서",
    versionLabel: "v1",
  },
);
assert.deepEqual(
  buildArtifactLibraryItemSupplementDisplayState({
    reviewSummary: {
      previous: { version: 2 },
      recommendation: "변경 범위를 확인하세요.",
    },
    statusNoteText: "점검 메모: 범위 확인 완료",
    versionSummary: {
      added: 4,
      previous: { version: 2 },
      removed: 1,
    },
  }),
  {
    reviewSummaryCardState: {
      comparisonLabel: "v2",
      reviewSummary: {
        previous: { version: 2 },
        recommendation: "변경 범위를 확인하세요.",
      },
      showCard: true,
      showMemoButton: true,
    },
    showStatusNoteText: true,
    versionSummaryState: {
      showText: true,
      text: "v2 대비 변경: +4 / -1줄",
      versionSummary: {
        added: 4,
        previous: { version: 2 },
        removed: 1,
      },
    },
  },
);
assert.deepEqual(
  buildArtifactLibraryItemSupplementDisplayState({
    reviewSummary: { previous: null },
    statusNoteText: "",
    versionSummary: {
      added: 0,
      previous: { version: null },
      removed: 0,
    },
  }),
  {
    reviewSummaryCardState: {
      comparisonLabel: "최초 버전",
      reviewSummary: { previous: null },
      showCard: true,
      showMemoButton: true,
    },
    showStatusNoteText: false,
    versionSummaryState: {
      showText: true,
      text: "v1 대비 변경: +0 / -0줄",
      versionSummary: {
        added: 0,
        previous: { version: null },
        removed: 0,
      },
    },
  },
);
assert.deepEqual(
  buildArtifactLibraryItemSupplementDisplayState({
    reviewSummary: null,
    statusNoteText: null,
    versionSummary: null,
  }),
  {
    reviewSummaryCardState: {
      comparisonLabel: "",
      reviewSummary: null,
      showCard: false,
      showMemoButton: false,
    },
    showStatusNoteText: false,
    versionSummaryState: {
      showText: false,
      text: "",
      versionSummary: null,
    },
  },
);
assert.deepEqual(buildArtifactSourceFilterOptions(["all", "manual", "unknown_source"]), [
  { label: "전체 출처", value: "all" },
  { label: "수동", value: "manual" },
  { label: "unknown_source", value: "unknown_source" },
]);

assert.equal(resolveArtifactSourceFilter(sourceOptions, "workbench"), "workbench");
assert.equal(resolveArtifactSourceFilter(sourceOptions, "stale-source"), "all");

assert.deepEqual(
  filterArtifactLibrary({
    artifacts,
    sourceFilter: "all",
    statusFilter: "draft",
    typeFilter: "prd",
  }).map((item) => item.id),
  ["manual-prd"],
);

assert.deepEqual(
  filterArtifactLibrary({
    artifacts,
    limit: 1,
    sourceFilter: "all",
    statusFilter: "all",
    typeFilter: "dev_runbook",
  }).map((item) => item.id),
  ["handoff-filtered"],
);

assert.deepEqual(
  getRecentDevelopmentHandoffArtifacts(artifacts).map((item) => item.id),
  ["handoff-filtered", "handoff-process"],
);
assert.deepEqual(
  buildRecentDevelopmentHandoffArtifactDisplayState({
    artifact: {
      ...artifacts[0],
      title: "",
      version: null,
    },
    createdDateLabel: "2026. 06. 01.",
  }),
  {
    sourceDateSummary: "선별 제작 자료 / 2026. 06. 01.",
    title: "제목 없음",
    versionLabel: "v1",
  },
);
assert.deepEqual(
  buildArtifactLibraryViewDisplayState({
    recentDevelopmentHandoffArtifactCount: 2,
    selectedArtifactCount: 1,
  }),
  {
    recentDevelopmentHandoffCountLabel: "2개",
    showRecentDevelopmentHandoffArtifacts: true,
    showSelectedArtifacts: true,
  },
);
assert.deepEqual(
  buildArtifactLibraryViewDisplayState({
    recentDevelopmentHandoffArtifactCount: 0,
    selectedArtifactCount: 0,
  }),
  {
    recentDevelopmentHandoffCountLabel: "0개",
    showRecentDevelopmentHandoffArtifacts: false,
    showSelectedArtifacts: false,
  },
);

const libraryViewState = buildArtifactLibraryViewState({
  artifacts,
  sourceFilter: "stale-source",
  statusFilter: "draft",
  typeFilter: "prd",
});
assert.equal(libraryViewState.activeArtifactSourceFilter, "all");
assert.equal(libraryViewState.artifactLibraryEmptyMessage, "현재 필터에 맞는 제작 자료가 없습니다.");
assert.deepEqual(libraryViewState.artifactSourceOptions, sourceOptions);
assert.equal(libraryViewState.artifactSourceFilterLabels.manual, "수동");
assert.deepEqual(libraryViewState.artifactSourceFilterOptions.slice(0, 2), [
  { label: "전체 출처", value: "all" },
  { label: "제작 도구 전달 자료", value: "agent_run_package" },
]);
assert.deepEqual(libraryViewState.artifactTypeFilterOptions[0], { label: "전체 유형", value: "all" });
assert.deepEqual(libraryViewState.artifactStatusFilterOptions[0], { label: "전체 상태", value: "all" });
assert.deepEqual(libraryViewState.selectedArtifacts.map((item) => item.id), ["manual-prd"]);
assert.deepEqual(libraryViewState.artifactLibraryViewDisplayState, {
  recentDevelopmentHandoffCountLabel: "2개",
  showRecentDevelopmentHandoffArtifacts: true,
  showSelectedArtifacts: true,
});
assert.deepEqual(
  libraryViewState.recentDevelopmentHandoffArtifacts.map((item) => item.id),
  ["handoff-filtered", "handoff-process"],
);
assert.equal(getNextArtifactVersion(artifacts, "prd"), 2);
assert.equal(
  getNextArtifactVersion(
    [
      ...artifacts,
      artifact({
        createdAt: "2026-06-01T05:00:00.000Z",
        id: "tech-spec-v3",
        type: "tech_spec",
        version: 3,
      }),
    ],
    "tech_spec",
  ),
  4,
);
assert.equal(getNextArtifactVersion([], "mvp_spec"), 1);

const flags = buildArtifactReadinessFlags(artifacts);
assert.equal(flags.implementationTaskSourceArtifact.id, "approved-prd");
assert.equal(flags.hasIdeaBriefArtifact, true);
assert.equal(flags.hasResearchBriefArtifact, true);
assert.equal(flags.canSaveValidationSummary, true);
assert.equal(flags.isValidationBundleSaved, true);
assert.equal(flags.hasApprovedPrdArtifact, true);
assert.equal(flags.hasApprovedTechSpecArtifact, true);
assert.equal(flags.hasDesignStateCoverage, true);
assert.equal(flags.hasEnvironmentChecklist, true);
assert.equal(flags.hasBackendRulesChecklist, true);
assert.equal(flags.hasReleaseOpsChecklist, true);
assert.equal(flags.hasDevelopmentDesignPackageArtifact, true);
assert.equal(flags.hasDevelopmentExecutionPackageArtifact, true);
assert.equal(flags.hasDevelopmentHandoffPackageArtifact, true);
assert.equal(flags.canEnterOrchestrationFromDevelopmentDocs, true);
assert.ok(
  !ideaWorkbenchSource.includes("artifactTypeOptions.map((value)"),
  "IdeaWorkbench should render artifact type filter options from shared library view state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("artifactSourceOptions.map((source)"),
  "IdeaWorkbench should render artifact source filter options from shared library view state.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactTypeFilterOptions.map"),
  "IdeaWorkbench should use shared artifact type filter options.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactStatusFilterOptions.map"),
  "IdeaWorkbench should use shared artifact status filter options.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactSourceFilterOptions.map"),
  "IdeaWorkbench should use shared artifact source filter options.",
);
assert.ok(
  !ideaWorkbenchSource.includes("artifactSourceLabels[artifact.source"),
  "IdeaWorkbench should render artifact source display labels from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("buildRecentDevelopmentHandoffArtifactDisplayState"),
  "IdeaWorkbench should render recent handoff artifact cards from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("recentDevelopmentHandoffArtifacts.length > 0"),
  "IdeaWorkbench should not keep recent handoff visibility branching inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes("selectedArtifacts.length > 0"),
  "IdeaWorkbench should not keep artifact list visibility branching inline.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactLibraryViewDisplayState.showRecentDevelopmentHandoffArtifacts"),
  "IdeaWorkbench should render recent handoff visibility from shared view display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactLibraryViewDisplayState.recentDevelopmentHandoffCountLabel"),
  "IdeaWorkbench should render recent handoff count label from shared view display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactLibraryViewDisplayState.showSelectedArtifacts"),
  "IdeaWorkbench should render selected artifact visibility from shared view display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("buildArtifactSourceDisplayLabel(artifact.source)"),
  "IdeaWorkbench should not keep artifact source/date display calculations inline.",
);
assert.ok(
  ideaWorkbenchSource.includes("buildArtifactLibraryItemDisplayState"),
  "IdeaWorkbench should render selected artifact cards from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes('const status = artifact.status ?? "draft";'),
  "IdeaWorkbench should not keep selected artifact status fallback calculations inline.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactDisplayState.statusLabel"),
  "IdeaWorkbench should render selected artifact status label from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("artifactDisplayState.statusNoteText ?"),
  "IdeaWorkbench should render artifact status-note visibility from shared supplement display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("versionSummary ?"),
  "IdeaWorkbench should render artifact version-summary visibility from shared supplement display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("reviewSummary ?"),
  "IdeaWorkbench should render artifact review-summary visibility from shared supplement display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("reviewSummary.previous ?"),
  "IdeaWorkbench should render artifact review comparison label from shared supplement display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("buildArtifactLibraryItemSupplementDisplayState"),
  "IdeaWorkbench should build artifact supplement display state from the shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactSupplementDisplayState.showStatusNoteText"),
  "IdeaWorkbench should use artifact status-note visibility from shared supplement display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("versionSummaryState.showText"),
  "IdeaWorkbench should use artifact version-summary visibility from shared supplement display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("reviewSummaryCardState.showCard"),
  "IdeaWorkbench should use artifact review-summary card visibility from shared supplement display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("reviewSummaryCardState.comparisonLabel"),
  "IdeaWorkbench should use artifact review comparison label from shared supplement display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes('artifact.title || "제목 없음"'),
  "IdeaWorkbench should not keep artifact title fallback calculations inline.",
);
assert.ok(
  ideaWorkbenchSource.includes("artifactLibraryEmptyMessage"),
  "IdeaWorkbench should render artifact library empty copy from shared view state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("현재 필터에 맞는 제작 자료가 없습니다."),
  "IdeaWorkbench should not keep artifact library empty copy inline.",
);
assert.ok(
  ideaWorkbenchSource.includes("buildArtifactDraftCardDisplayState"),
  "IdeaWorkbench should render development artifact draft cards from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("artifactLabels[draft.artifactType]"),
  "IdeaWorkbench should not keep development artifact draft label lookups inline.",
);
assert.ok(
  ideaWorkbenchSource.includes("key={draft.title}"),
  "Development artifact draft cards should use unique title-based keys because backend decision drafts share a type.",
);

console.log("Artifact library utils smoke passed.");
