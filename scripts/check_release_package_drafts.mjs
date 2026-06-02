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

const artifactLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/artifact-labels.ts")).href;
const implementationTaskMetadataUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/implementation-task-metadata.ts"),
).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;

const releaseDecisionUrl = transpileModuleUrl("src/lib/release-decision-packet.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const mvpBuildCommandUrl = transpileModuleUrl("src/lib/mvp-build-command-packet-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const qaAcceptanceUrl = transpileModuleUrl("src/lib/qa-acceptance-matrix-markdown.ts", [
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const postLaunchUrl = transpileModuleUrl("src/lib/post-launch-learning-loop-markdown.ts", [
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const completionReportUrl = transpileModuleUrl("src/lib/development-completion-report.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const moduleUrl = transpileModuleUrl("src/lib/release-package-drafts.ts", [
  ['from "@/lib/development-completion-report";', `from ${JSON.stringify(completionReportUrl)};`],
  ['from "@/lib/mvp-build-command-packet-markdown";', `from ${JSON.stringify(mvpBuildCommandUrl)};`],
  ['from "@/lib/post-launch-learning-loop-markdown";', `from ${JSON.stringify(postLaunchUrl)};`],
  ['from "@/lib/qa-acceptance-matrix-markdown";', `from ${JSON.stringify(qaAcceptanceUrl)};`],
  ['from "@/lib/release-decision-packet";', `from ${JSON.stringify(releaseDecisionUrl)};`],
]);

const { buildReleasePackageArtifactSaveDrafts, buildReleasePackageDraftState } = await import(moduleUrl);

const timestamp = "2026-06-02T00:00:00.000Z";
const idea = {
  buyer: "1인 창업자",
  created_at: timestamp,
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "외부 제작 도구가 첫 작업을 바로 실행할 수 있는지 확인",
  one_liner: "메모와 대화를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "원본 대화와 권한 경계를 안전하게 다뤄야 합니다.",
  signal: "아이디어 검증과 제작 전달을 반복해서 자동화하려는 수요가 있습니다.",
  stage: "launch",
  target_user: "반복적으로 앱 아이디어를 검증하는 창업자",
  updated_at: timestamp,
  willingness_to_pay: 4,
};
const state = {
  decision: idea.decision,
  differentiation: idea.differentiation,
  frequency: idea.frequency,
  mvp_speed: idea.mvp_speed,
  next_evidence: idea.next_evidence,
  product_surface: idea.product_surface,
  problem_intensity: idea.problem_intensity,
  reachability: idea.reachability,
  regulatory_risk: idea.regulatory_risk,
  risk_summary: idea.risk_summary,
  signal: idea.signal,
  stage: idea.stage,
  willingness_to_pay: idea.willingness_to_pay,
};
const risks = [
  {
    area: "privacy",
    created_at: timestamp,
    created_by: "user-1",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "원본 저장 전 식별 패턴을 제거하고 제작 자료에는 요약만 남깁니다.",
    organization_id: "org-1",
    severity: "high",
    status: "closed",
    title: "원본 대화 식별 정보 노출",
    updated_at: timestamp,
  },
];
const experiments = [
  {
    created_at: timestamp,
    created_by: "user-1",
    ended_at: null,
    id: "experiment-1",
    idea_id: idea.id,
    name: "제작 패키지 전달 테스트",
    organization_id: "org-1",
    started_at: "2026-06-02",
    status: "running",
    success_metric: "외부 제작 도구가 10분 안에 첫 태스크를 이해",
    updated_at: timestamp,
  },
];
const runs = [
  {
    created_at: timestamp,
    created_by: "user-1",
    id: "run-1",
    idea_id: idea.id,
    objective: "첫 구현 패키지 완성",
    organization_id: "org-1",
    output: "제작 자료 승인 완료",
    owner_role: "prototype-builder",
    phase: "build",
    status: "done",
    updated_at: timestamp,
  },
];
const artifacts = [
  {
    approved_at: timestamp,
    approved_by: "user-1",
    artifact_type: "launch_checklist",
    body: "# 출시 체크리스트",
    created_at: timestamp,
    created_by: "user-1",
    id: "artifact-1",
    idea_id: idea.id,
    organization_id: "org-1",
    source: "workbench",
    status: "approved",
    status_note: "출시 전 확인 완료",
    title: "AI Venture Lab 출시 체크리스트",
    updated_at: timestamp,
    version: 1,
  },
];
const implementationTasks = [
  {
    acceptance_criteria: "사용자가 패키지를 저장하고 완료 상태를 확인한다.",
    artifact_id: null,
    blocked_reason: null,
    completed_at: timestamp,
    created_at: timestamp,
    created_by: "user-1",
    evidence: "commit abc123 / pnpm typecheck passed / pnpm smoke:browser passed / preview https://example.test",
    id: "task-1",
    idea_id: idea.id,
    organization_id: "org-1",
    owner_role: "prototype-builder",
    priority: "high",
    sort_order: 1,
    status: "done",
    task_type: "frontend",
    title: "제작 패키지 리뷰 화면",
    updated_at: timestamp,
  },
  {
    acceptance_criteria: "RLS 허용/차단 결과와 롤백 기준을 완료 보고서에 남긴다.",
    artifact_id: null,
    blocked_reason: null,
    completed_at: timestamp,
    created_at: timestamp,
    created_by: "user-1",
    evidence: "commit def456 / Supabase RLS allow deny checked / Vercel inspect URL / rollback 기준 기록",
    id: "task-2",
    idea_id: idea.id,
    organization_id: "org-1",
    owner_role: "qa-debug",
    priority: "high",
    sort_order: 2,
    status: "done",
    task_type: "security",
    title: "출시 권한 경계 점검",
    updated_at: timestamp,
  },
];
const dependencyStatuses = implementationTasks.map((task) => ({
  blockers: [],
  completedPrerequisites: [],
  gate: "선행 조건 통과",
  missingPrerequisites: [],
  nextAction: "완료 증거를 출시 보고서에 반영",
  ready: false,
  task,
}));
const gateChecks = [
  { label: "핵심 저장 흐름", passed: true, detail: "저장, 완료 상태, 다음 행동이 연결됨" },
  { label: "권한 경계", passed: true, detail: "허용/차단 시나리오 확인됨" },
];
const artifactReviewQueue = [
  { status: "approved", label: "출시 체크리스트", detail: "프로덕션 smoke와 롤백 기준 확인" },
  { status: "approved", label: "제작 도구 전달 자료", detail: "첫 지시문과 작업 목록 확인" },
];
const backendCandidateScores = [
  {
    cautions: [],
    key: "supabase",
    label: "Supabase",
    score: 96,
    strengths: ["RLS", "Postgres"],
    summary: "워크스페이스 기반 제품 OS에 적합",
  },
];
const decisions = [
  {
    created_by: "user-1",
    decided_at: timestamp,
    decision: "ship",
    id: "decision-1",
    idea_id: idea.id,
    organization_id: "org-1",
    reason: "출시 전 패키지와 권한 경계가 닫혔습니다.",
  },
];

const draftState = buildReleasePackageDraftState({
  appBlueprint: "# 앱 구조 요약\n\n운영 콘솔 중심",
  artifactReviewProgress: 100,
  artifactReviewQueue,
  artifacts,
  backendCandidateScores,
  decisions,
  dependencyStatuses,
  experiments,
  idea,
  implementationGateChecks: gateChecks,
  implementationGateScore: 100,
  implementationHandoff: "# 제작 전달 자료\n\n첫 작업부터 진행",
  implementationTasks,
  launchReadiness: gateChecks,
  launchReadinessScore: 100,
  nextLaunchBlocker: null,
  risks,
  runs,
  scaffoldManifest: "# 시작 구조\n\nNext.js App Router",
  score: 22,
  scoreRecommendation: "ship",
  state,
});

assert.equal(draftState.releaseDecisionPacket?.recommendation, "ship");
assert.match(draftState.releaseDecisionPacket?.markdown ?? "", /# 출시 판단 패킷: AI Venture Lab/);
assert.match(draftState.mvpBuildCommandPacketDraft, /# 제작 시작 안내 묶음: AI Venture Lab/);
assert.match(draftState.qaAcceptanceMatrixDraft, /# 품질 점검표: AI Venture Lab/);
assert.match(draftState.postLaunchLearningLoopDraft, /# 출시 후 학습 루프: AI Venture Lab/);
assert.match(draftState.developmentCompletionReportDraft, /# 개발 완료 보고서: AI Venture Lab/);
assert.match(draftState.developmentCompletionReportDraft, /출시 권한 경계 점검/);

const saveDrafts = buildReleasePackageArtifactSaveDrafts({
  developmentCompletionReportDraft: draftState.developmentCompletionReportDraft,
  ideaName: idea.name,
  mvpBuildCommandPacketDraft: draftState.mvpBuildCommandPacketDraft,
  postLaunchLearningLoopDraft: draftState.postLaunchLearningLoopDraft,
  qaAcceptanceMatrixDraft: draftState.qaAcceptanceMatrixDraft,
});
assert.equal(saveDrafts.developmentCompletionReportSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.developmentCompletionReportSaveDraft.title, "AI Venture Lab 제작 완료 보고서");
assert.equal(saveDrafts.developmentCompletionReportSaveDraft.source, "development_report");
assert.match(saveDrafts.developmentCompletionReportSaveDraft.body, /# 개발 완료 보고서: AI Venture Lab/);
assert.equal(saveDrafts.mvpBuildCommandPacketSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.mvpBuildCommandPacketSaveDraft.title, "AI Venture Lab 제작 시작 안내 묶음");
assert.equal(saveDrafts.mvpBuildCommandPacketSaveDraft.source, "mvp_build_command");
assert.match(saveDrafts.mvpBuildCommandPacketSaveDraft.body, /# 제작 시작 안내 묶음: AI Venture Lab/);
assert.equal(saveDrafts.qaAcceptanceMatrixSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.qaAcceptanceMatrixSaveDraft.title, "AI Venture Lab 품질 점검표");
assert.equal(saveDrafts.qaAcceptanceMatrixSaveDraft.source, "qa_acceptance_matrix");
assert.match(saveDrafts.qaAcceptanceMatrixSaveDraft.body, /# 품질 점검표: AI Venture Lab/);
assert.equal(saveDrafts.postLaunchLearningLoopSaveDraft.artifactType, "launch_checklist");
assert.equal(saveDrafts.postLaunchLearningLoopSaveDraft.title, "AI Venture Lab 출시 후 성과 확인");
assert.equal(saveDrafts.postLaunchLearningLoopSaveDraft.source, "post_launch_learning");
assert.match(saveDrafts.postLaunchLearningLoopSaveDraft.body, /# 출시 후 학습 루프: AI Venture Lab/);

assert.deepEqual(
  buildReleasePackageArtifactSaveDrafts({
    developmentCompletionReportDraft: "",
    ideaName: null,
    mvpBuildCommandPacketDraft: "",
    postLaunchLearningLoopDraft: "",
    qaAcceptanceMatrixDraft: "",
  }),
  {
    developmentCompletionReportSaveDraft: null,
    mvpBuildCommandPacketSaveDraft: null,
    postLaunchLearningLoopSaveDraft: null,
    qaAcceptanceMatrixSaveDraft: null,
  },
);

const emptyDraftState = buildReleasePackageDraftState({
  appBlueprint: "",
  artifactReviewProgress: 0,
  artifactReviewQueue: [],
  artifacts: [],
  backendCandidateScores: [],
  decisions: [],
  dependencyStatuses: [],
  experiments: [],
  idea: null,
  implementationGateChecks: [],
  implementationGateScore: 0,
  implementationHandoff: "",
  implementationTasks: [],
  launchReadiness: [],
  launchReadinessScore: 0,
  nextLaunchBlocker: null,
  risks: [],
  runs: [],
  scaffoldManifest: "",
  score: 0,
  scoreRecommendation: "research_more",
  state: null,
});

assert.deepEqual(emptyDraftState, {
  developmentCompletionReportDraft: "",
  mvpBuildCommandPacketDraft: "",
  postLaunchLearningLoopDraft: "",
  qaAcceptanceMatrixDraft: "",
  releaseDecisionPacket: null,
});

console.log("Release package drafts smoke passed.");
