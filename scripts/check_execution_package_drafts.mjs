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
const agentRunPackageArtifactsUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/agent-run-package-artifacts.ts"),
).href;
const buildDeliveryUrl = pathToFileURL(path.join(process.cwd(), "src/lib/build-delivery.ts")).href;
const implementationTaskMetadataUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/implementation-task-metadata.ts"),
).href;
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const productSurfaceImplementationUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/product-surface-implementation.ts"),
).href;
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;

const externalGuideUrl = transpileModuleUrl("src/lib/external-production-package-guide.ts", [
  ['from "@/lib/build-delivery";', `from ${JSON.stringify(buildDeliveryUrl)};`],
]);
const agentRunPackageUrl = transpileModuleUrl("src/lib/agent-run-package-markdown.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/agent-run-package-artifacts";', `from ${JSON.stringify(agentRunPackageArtifactsUrl)};`],
  ['from "@/lib/build-delivery";', `from ${JSON.stringify(buildDeliveryUrl)};`],
  ['from "@/lib/external-production-package-guide";', `from ${JSON.stringify(externalGuideUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/product-surface-implementation";', `from ${JSON.stringify(productSurfaceImplementationUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const developmentKickoffUrl = transpileModuleUrl("src/lib/development-kickoff-markdown.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const launchChecklistUrl = transpileModuleUrl("src/lib/launch-checklist-report.ts", [
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const prdHandoffUrl = transpileModuleUrl("src/lib/prd-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const moduleUrl = transpileModuleUrl("src/lib/execution-package-drafts.ts", [
  ['from "@/lib/agent-run-package-markdown";', `from ${JSON.stringify(agentRunPackageUrl)};`],
  ['from "@/lib/development-kickoff-markdown";', `from ${JSON.stringify(developmentKickoffUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/launch-checklist-report";', `from ${JSON.stringify(launchChecklistUrl)};`],
  ['from "@/lib/prd-markdown";', `from ${JSON.stringify(prdHandoffUrl)};`],
]);

const { buildExecutionPackageArtifactSaveDrafts, buildExecutionPackageDraftState } = await import(moduleUrl);
const {
  compareApprovedAgentRunPackageArtifactsByCreatedAt,
  getAgentRunPackageArtifactCreatedAtTime,
  getApprovedAgentRunPackageArtifacts,
} = await import(agentRunPackageArtifactsUrl);
const {
  countDoneLaunchChecklistImplementationTasks,
  getDoneLaunchChecklistPhases,
  getLaunchChecklistHighRisks,
  hasApprovedLaunchChecklistArtifactType,
  hasLaunchChecklistArtifactType,
} = await import(launchChecklistUrl);
const {
  countPassedDevelopmentKickoffChecks,
  getApprovedDevelopmentKickoffProductArtifacts,
  getFailedDevelopmentKickoffChecks,
  getMvpSliceDevelopmentKickoffArtifact,
  getOpenHighDevelopmentKickoffRisks,
} = await import(developmentKickoffUrl);
const {
  getFailedAgentRunPackageChecks,
  getMissingAgentRunEvidenceLabels,
  getOpenHighAgentRunPackageRisks,
} = await import(agentRunPackageUrl);

const timestamp = "2026-06-02T00:00:00.000Z";
const idea = {
  buyer: "운영팀",
  created_at: timestamp,
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "외부 제작 도구가 첫 태스크를 바로 시작",
  one_liner: "메모와 대화를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "원본 대화와 권한 경계 확인 필요",
  signal: "반복 검증과 제작 전달을 자동화하려는 운영 수요",
  stage: "prototype",
  target_user: "앱 아이디어를 반복 검증하는 창업자",
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
const artifacts = [
  {
    approved_at: timestamp,
    approved_by: "user-1",
    artifact_type: "prd",
    body: "# 제품 기획서",
    created_at: timestamp,
    created_by: "user-1",
    id: "artifact-prd",
    idea_id: idea.id,
    organization_id: "org-1",
    source: "workbench",
    status: "approved",
    status_note: "승인",
    title: "AI Venture Lab 제품 기획서",
    updated_at: timestamp,
    version: 1,
  },
  {
    approved_at: timestamp,
    approved_by: "user-1",
    artifact_type: "mvp_spec",
    body: "# 첫 제작 범위",
    created_at: timestamp,
    created_by: "user-1",
    id: "artifact-mvp",
    idea_id: idea.id,
    organization_id: "org-1",
    source: "mvp_slice_plan",
    status: "approved",
    status_note: "승인",
    title: "AI Venture Lab 첫 제작 범위",
    updated_at: timestamp,
    version: 1,
  },
];
assert.deepEqual(
  getApprovedAgentRunPackageArtifacts([
    { id: "older-approved", status: "approved", created_at: "2026-06-01T00:00:00.000Z" },
    { id: "draft-newer", status: "draft", created_at: "2026-06-03T00:00:00.000Z" },
    { id: "newer-approved", status: "approved", created_at: "2026-06-02T00:00:00.000Z" },
  ]).map((artifact) => artifact.id),
  ["newer-approved", "older-approved"],
);
assert.equal(
  getAgentRunPackageArtifactCreatedAtTime({ created_at: "2026-06-02T00:00:00.000Z" }),
  Date.parse("2026-06-02T00:00:00.000Z"),
);
assert.equal(getAgentRunPackageArtifactCreatedAtTime({ created_at: "not-a-date" }), 0);
assert.equal(
  compareApprovedAgentRunPackageArtifactsByCreatedAt(
    { created_at: "2026-06-01T00:00:00.000Z" },
    { created_at: "2026-06-02T00:00:00.000Z" },
  ) > 0,
  true,
);
assert.equal(
  compareApprovedAgentRunPackageArtifactsByCreatedAt(
    { created_at: "2026-06-02T00:00:00.000Z" },
    { created_at: "2026-06-01T00:00:00.000Z" },
  ) < 0,
  true,
);
assert.equal(
  compareApprovedAgentRunPackageArtifactsByCreatedAt(
    { created_at: "not-a-date" },
    { created_at: "not-a-date" },
  ),
  0,
);

const agentRunPackageSource = readFileSync(
  path.join(process.cwd(), "src/lib/agent-run-package-markdown.ts"),
  "utf8",
);
assert.equal(
  agentRunPackageSource.includes(".sort("),
  false,
  "agent run package markdown should delegate artifact ordering to agent-run-package-artifacts",
);
assert.equal(
  agentRunPackageSource.includes("new Date("),
  false,
  "agent run package markdown should not parse artifact dates inline",
);
const experiments = [
  {
    created_at: timestamp,
    created_by: "user-1",
    ended_at: null,
    id: "experiment-1",
    idea_id: idea.id,
    name: "외부 제작 도구 전달 테스트",
    organization_id: "org-1",
    started_at: "2026-06-02",
    status: "running",
    success_metric: "첫 태스크 이해와 실행",
    updated_at: timestamp,
  },
];
const risks = [
  {
    area: "privacy",
    created_at: timestamp,
    created_by: "user-1",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "원본 저장 전 식별자 제거",
    organization_id: "org-1",
    severity: "high",
    status: "closed",
    title: "원본 대화 식별 정보",
    updated_at: timestamp,
  },
];
const runs = [
  {
    created_at: timestamp,
    created_by: "user-1",
    id: "run-1",
    idea_id: idea.id,
    objective: "제작 자료 정리",
    organization_id: "org-1",
    output: "핸드오프 완료",
    owner_role: "build",
    phase: "build",
    status: "done",
    updated_at: timestamp,
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
    reason: "검증 자료와 제작 자료가 준비됨",
  },
];
const tasks = [
  {
    acceptance_criteria: "첫 화면에서 다음 제작 행동을 확인하고 저장한다.",
    artifact_id: null,
    blocked_reason: null,
    completed_at: null,
    created_at: timestamp,
    created_by: "user-1",
    evidence: "",
    id: "task-1",
    idea_id: idea.id,
    organization_id: "org-1",
    owner_role: "prototype-builder",
    priority: "high",
    sort_order: 1,
    status: "todo",
    task_type: "frontend",
    title: "T-001 제작 패키지 리뷰 화면",
    updated_at: timestamp,
  },
  {
    acceptance_criteria: "권한 경계와 롤백 기준을 문서에 남긴다.",
    artifact_id: null,
    blocked_reason: null,
    completed_at: timestamp,
    created_at: timestamp,
    created_by: "user-1",
    evidence: "commit abc123 / pnpm typecheck passed",
    id: "task-2",
    idea_id: idea.id,
    organization_id: "org-1",
    owner_role: "qa-debug",
    priority: "high",
    sort_order: 2,
    status: "done",
    task_type: "security",
    title: "권한 경계 점검",
    updated_at: timestamp,
  },
];
assert.equal(hasLaunchChecklistArtifactType(artifacts, "prd"), true);
assert.equal(hasLaunchChecklistArtifactType(artifacts, "idea_brief"), false);
assert.equal(hasApprovedLaunchChecklistArtifactType(artifacts, "prd"), true);
assert.equal(hasApprovedLaunchChecklistArtifactType(artifacts, "mvp_spec"), true);
assert.equal(countDoneLaunchChecklistImplementationTasks(tasks), 1);
assert.deepEqual([...getDoneLaunchChecklistPhases(runs)], ["build"]);
assert.deepEqual(
  getLaunchChecklistHighRisks(risks).map((risk) => risk.id),
  ["risk-1"],
);
const taskDrafts = [
  {
    acceptance_criteria: "첫 제작 범위를 잠그고 제외 범위를 확인한다.",
    owner_role: "product",
    priority: "high",
    task_type: "planning",
    title: "범위 잠금",
  },
];
const gateChecks = [
  { label: "승인 제작 자료", passed: true, detail: "필수 자료 승인 완료" },
  { label: "리스크 경계", passed: true, detail: "고위험 리스크 종료" },
];
assert.deepEqual(getMissingAgentRunEvidenceLabels([{ label: "커밋", passed: false }, { label: "스모크", passed: true }]), [
  "커밋",
]);
assert.deepEqual(
  getFailedAgentRunPackageChecks([{ ...gateChecks[0], label: "승인 자료", passed: false }]).map((check) => check.label),
  ["승인 자료"],
);
assert.deepEqual(
  getOpenHighAgentRunPackageRisks([{ ...risks[0], id: "risk-open", status: "open" }]).map((risk) => risk.id),
  ["risk-open"],
);
assert.equal(countPassedDevelopmentKickoffChecks(gateChecks), 2);
assert.deepEqual(
  getFailedDevelopmentKickoffChecks([{ ...gateChecks[0], label: "범위 잠금", passed: false }]).map((check) => check.label),
  ["범위 잠금"],
);
assert.equal(getMvpSliceDevelopmentKickoffArtifact(artifacts)?.id, "artifact-mvp");
assert.deepEqual(
  getApprovedDevelopmentKickoffProductArtifacts(artifacts).map((artifact) => artifact.id),
  ["artifact-prd", "artifact-mvp"],
);
assert.deepEqual(
  getOpenHighDevelopmentKickoffRisks([{ ...risks[0], id: "risk-open", status: "open" }]).map((risk) => risk.id),
  ["risk-open"],
);
const externalBuildTool = {
  automationLabel: "자동 동기화 지원",
  description: "테스트용 외부 제작 도구",
  handoffFileSuffix: "cursor-setup",
  handoffNote: "작업 완료 보고를 Venture Lab에 반영합니다.",
  handoffSteps: ["설치 파일을 프로젝트 루트에 둡니다.", "START 파일을 첫 메시지로 넣습니다."],
  key: "cursor",
  label: "Cursor",
  packageFiles: ["AI_VENTURE_PACKAGE.md", "AI_VENTURE_TASKS.md"],
  packageFocus: "작업 범위와 검증 명령을 먼저 확인합니다.",
  startFileName: "AI_VENTURE_CURSOR_START.md",
  startMethod: "START 파일을 첫 메시지로 넣습니다.",
};

const draftState = buildExecutionPackageDraftState({
  artifacts,
  buildDeliveryMode: "external_tool",
  buildReadinessChecks: gateChecks,
  decisions,
  experiments,
  externalBuildTool,
  filteredImplementationTasks: tasks,
  filterSummary: "상태: 전체 / 담당: 전체",
  idea,
  implementationTasks: tasks,
  implementationTaskDrafts: taskDrafts,
  nextImplementationTask: tasks[0],
  nextPrdBlocker: null,
  openImplementationTasks: [tasks[0]],
  prdReadinessChecks: gateChecks,
  prdReadinessScore: 100,
  risks,
  runs,
  score: 25,
  scoreRecommendation: "ship",
  state,
  validationEvidenceCoach: {
    checks: [],
    label: "개발 전환 근거 양호",
    nextFocus: null,
    prompt: "",
    score: 100,
  },
});

assert.deepEqual(draftState.agentRunPackageTasks.map((task) => task.id), ["task-1"]);
assert.match(draftState.prdHandoffDraft, /# 제품 기획서 전환 요약: AI Venture Lab/);
assert.match(draftState.developmentKickoffDraft, /# 제작 시작 요약: AI Venture Lab/);
assert.match(draftState.agentRunPackageDraft, /# 제작 패키지: AI Venture Lab/);
assert.match(draftState.agentRunPackageDraft, /T-001 제작 패키지 리뷰 화면/);
assert.match(draftState.launchChecklistDraft, /# 출시 체크리스트: AI Venture Lab/);

const saveDrafts = buildExecutionPackageArtifactSaveDrafts({
  agentRunPackageDraft: draftState.agentRunPackageDraft,
  developmentKickoffDraft: draftState.developmentKickoffDraft,
  ideaName: idea.name,
  launchChecklistDraft: draftState.launchChecklistDraft,
  prdHandoffDraft: draftState.prdHandoffDraft,
});
assert.equal(saveDrafts.developmentKickoffSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.developmentKickoffSaveDraft.title, "AI Venture Lab 제작 시작 요약");
assert.equal(saveDrafts.developmentKickoffSaveDraft.source, "development_kickoff");
assert.match(saveDrafts.developmentKickoffSaveDraft.body, /# 제작 시작 요약: AI Venture Lab/);
assert.equal(saveDrafts.agentRunPackageSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.agentRunPackageSaveDraft.title, "AI Venture Lab 제작 패키지");
assert.equal(saveDrafts.agentRunPackageSaveDraft.source, "agent_run_package");
assert.match(saveDrafts.agentRunPackageSaveDraft.body, /# 제작 패키지: AI Venture Lab/);
assert.equal(saveDrafts.prdHandoffSaveDraft.artifactType, "research_note");
assert.equal(saveDrafts.prdHandoffSaveDraft.title, "AI Venture Lab 기획서 전환 전달 내용");
assert.equal(saveDrafts.prdHandoffSaveDraft.source, "prd_readiness_handoff");
assert.match(saveDrafts.prdHandoffSaveDraft.body, /# 제품 기획서 전환 요약: AI Venture Lab/);
assert.equal(saveDrafts.launchChecklistSaveDraft.artifactType, "launch_checklist");
assert.equal(saveDrafts.launchChecklistSaveDraft.title, "AI Venture Lab 출시 체크리스트");
assert.equal(saveDrafts.launchChecklistSaveDraft.source, "workbench");
assert.match(saveDrafts.launchChecklistSaveDraft.body, /# 출시 체크리스트: AI Venture Lab/);

assert.deepEqual(
  buildExecutionPackageArtifactSaveDrafts({
    agentRunPackageDraft: "",
    developmentKickoffDraft: "",
    ideaName: null,
    launchChecklistDraft: "",
    prdHandoffDraft: "",
  }),
  {
    agentRunPackageSaveDraft: null,
    developmentKickoffSaveDraft: null,
    launchChecklistSaveDraft: null,
    prdHandoffSaveDraft: null,
  },
);

const emptyDraftState = buildExecutionPackageDraftState({
  artifacts: [],
  buildDeliveryMode: "external_tool",
  buildReadinessChecks: [],
  decisions: [],
  experiments: [],
  externalBuildTool,
  filteredImplementationTasks: tasks,
  filterSummary: "",
  idea: null,
  implementationTasks: [],
  implementationTaskDrafts: [],
  nextImplementationTask: null,
  nextPrdBlocker: null,
  openImplementationTasks: [tasks[0]],
  prdReadinessChecks: [],
  prdReadinessScore: 0,
  risks: [],
  runs: [],
  score: 0,
  scoreRecommendation: "research_more",
  state: null,
  validationEvidenceCoach: null,
});

assert.deepEqual(emptyDraftState, {
  agentRunPackageDraft: "",
  agentRunPackageTasks: [tasks[0]],
  developmentKickoffDraft: "",
  launchChecklistDraft: "",
  prdHandoffDraft: "",
});

console.log("Execution package drafts smoke passed.");
