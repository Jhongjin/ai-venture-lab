import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/artifact-library-utils.ts");
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
  buildArtifactDraftInsertRow,
  buildArtifactReadinessFlags,
  buildArtifactSourceFilterLabels,
  buildArtifactSourceOptions,
  buildArtifactStatusUpdatePatch,
  filterArtifactLibrary,
  getNextArtifactVersion,
  getRecentDevelopmentHandoffArtifacts,
  resolveArtifactSourceFilter,
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

const sourceOptions = buildArtifactSourceOptions(artifacts);
assert.equal(sourceOptions[0], "all");
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

console.log("Artifact library utils smoke passed.");
