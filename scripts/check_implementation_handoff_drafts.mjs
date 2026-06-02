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
const productSurfaceImplementationUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/product-surface-implementation.ts"),
).href;
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;

const implementationHandoffUrl = transpileModuleUrl("src/lib/implementation-handoff-markdown.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const implementationTaskDraftsUrl = transpileModuleUrl("src/lib/implementation-task-drafts.ts", [
  ['from "@/lib/product-surface-implementation";', `from ${JSON.stringify(productSurfaceImplementationUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const implementationTaskMarkdownUrl = transpileModuleUrl("src/lib/implementation-task-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/product-surface-implementation";', `from ${JSON.stringify(productSurfaceImplementationUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const rolePromptPackUrl = transpileModuleUrl("src/lib/role-prompt-pack-markdown.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const moduleUrl = transpileModuleUrl("src/lib/implementation-handoff-drafts.ts", [
  ['from "@/lib/implementation-handoff-markdown";', `from ${JSON.stringify(implementationHandoffUrl)};`],
  ['from "@/lib/implementation-task-drafts";', `from ${JSON.stringify(implementationTaskDraftsUrl)};`],
  ['from "@/lib/implementation-task-markdown";', `from ${JSON.stringify(implementationTaskMarkdownUrl)};`],
  ['from "@/lib/role-prompt-pack-markdown";', `from ${JSON.stringify(rolePromptPackUrl)};`],
]);

const { buildImplementationHandoffArtifactSaveDrafts, buildImplementationHandoffDraftState } = await import(moduleUrl);

const idea = {
  buyer: "운영팀",
  created_at: "2026-06-01T00:00:00.000Z",
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "외부 제작 도구에 전달 가능한 첫 패키지",
  one_liner: "메모를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "조직 권한과 개인정보 경계 필요",
  signal: "운영 승인과 감사 로그가 중요함",
  stage: "prototype",
  target_user: "1인 창업자",
  updated_at: "2026-06-01T00:00:00.000Z",
  willingness_to_pay: 4,
};
const state = {
  buyer: idea.buyer,
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
const experiments = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "exp-1",
    idea_id: idea.id,
    name: "제작 패키지 전달 테스트",
    organization_id: "org-1",
    started_at: "2026-06-02",
    ended_at: null,
    status: "running",
    success_metric: "첫 작업을 외부 도구가 바로 이해",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const risks = [
  {
    area: "privacy",
    created_at: "2026-06-01T00:00:00.000Z",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "민감 데이터 입력 전 목적과 삭제 경로 표시",
    organization_id: "org-1",
    severity: "high",
    status: "mitigating",
    title: "민감 데이터 노출",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const runs = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "run-1",
    idea_id: idea.id,
    objective: "제작 자료 전달",
    organization_id: "org-1",
    owner_role: "build",
    phase: "build",
    status: "planned",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const artifacts = [
  {
    artifact_type: "prd",
    body: "# 제품 기획서",
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: "user-1",
    id: "artifact-1",
    idea_id: idea.id,
    organization_id: "org-1",
    source: "workbench",
    status: "approved",
    status_note: null,
    title: "AI Venture Lab 제품 기획서",
    updated_at: "2026-06-01T00:00:00.000Z",
    version: 1,
  },
];
const tasks = [
  {
    acceptance_criteria: "사용자가 다음 행동을 보고 저장 완료 상태를 확인한다.",
    artifact_id: null,
    blocked_reason: null,
    completed_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    done_evidence: "",
    evidence: "",
    id: "task-1",
    idea_id: idea.id,
    organization_id: "org-1",
    owner_role: "prototype-builder",
    priority: "high",
    status: "todo",
    task_type: "frontend",
    title: "T-001 워크벤치 첫 화면",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

const draftState = buildImplementationHandoffDraftState({
  artifacts,
  evidenceByTaskId: { "task-1": "commit abc123 / preview ok" },
  experiments,
  filteredTasks: tasks,
  filterSummary: "상태: 할 일 / 담당: prototype-builder / 증거: 전체",
  idea,
  nextTask: tasks[0],
  openTasks: tasks,
  risks,
  runs,
  state,
  tasks,
});

assert.match(draftState.implementationHandoffDraft, /# 제작 도구 전달 자료: AI Venture Lab/);
assert.match(draftState.rolePromptPackDraft, /# 역할별 작업 안내 묶음: AI Venture Lab/);
assert.match(draftState.implementationTaskTicketDraft, /# T-001 워크벤치 첫 화면/);
assert.match(draftState.implementationBacklogDraft, /# 개발 백로그: AI Venture Lab - 열린 제작 할 일/);
assert.match(draftState.filteredImplementationBacklogDraft, /필터된 제작 할 일/);
assert.match(draftState.filteredImplementationRunPromptDraft, /# 제작 도구 작업 안내: AI Venture Lab/);
assert.equal(draftState.implementationTaskDrafts.length, 9);
assert.equal(draftState.cursorHandoffTaskDrafts, draftState.implementationTaskDrafts);

const saveDrafts = buildImplementationHandoffArtifactSaveDrafts({
  filteredImplementationRunPromptDraft: draftState.filteredImplementationRunPromptDraft,
  ideaName: idea.name,
  implementationHandoffDraft: draftState.implementationHandoffDraft,
  rolePromptPackDraft: draftState.rolePromptPackDraft,
});
assert.equal(saveDrafts.filteredImplementationRunPromptSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.filteredImplementationRunPromptSaveDraft.title, "AI Venture Lab 필터된 제작 지시");
assert.equal(saveDrafts.filteredImplementationRunPromptSaveDraft.source, "filtered_implementation_run");
assert.match(saveDrafts.filteredImplementationRunPromptSaveDraft.body, /# 제작 도구 작업 안내: AI Venture Lab/);
assert.equal(saveDrafts.implementationHandoffSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.implementationHandoffSaveDraft.title, "AI Venture Lab 제작 도구 전달 자료");
assert.equal(saveDrafts.implementationHandoffSaveDraft.source, "development_process");
assert.match(saveDrafts.implementationHandoffSaveDraft.body, /# 제작 도구 전달 자료: AI Venture Lab/);
assert.equal(saveDrafts.rolePromptPackSaveDraft.artifactType, "dev_runbook");
assert.equal(saveDrafts.rolePromptPackSaveDraft.title, "AI Venture Lab 역할별 작업 안내 묶음");
assert.equal(saveDrafts.rolePromptPackSaveDraft.source, "development_process");
assert.match(saveDrafts.rolePromptPackSaveDraft.body, /# 역할별 작업 안내 묶음: AI Venture Lab/);

assert.deepEqual(
  buildImplementationHandoffArtifactSaveDrafts({
    filteredImplementationRunPromptDraft: "",
    ideaName: null,
    implementationHandoffDraft: "",
    rolePromptPackDraft: "",
  }),
  {
    filteredImplementationRunPromptSaveDraft: null,
    implementationHandoffSaveDraft: null,
    rolePromptPackSaveDraft: null,
  },
);

const emptyDraftState = buildImplementationHandoffDraftState({
  artifacts: [],
  evidenceByTaskId: {},
  experiments: [],
  filteredTasks: [],
  filterSummary: "",
  idea: null,
  nextTask: null,
  openTasks: [],
  risks: [],
  runs: [],
  state: null,
  tasks: [],
});
assert.deepEqual(emptyDraftState, {
  cursorHandoffTaskDrafts: [],
  filteredImplementationBacklogDraft: "",
  filteredImplementationRunPromptDraft: "",
  implementationBacklogDraft: "",
  implementationHandoffDraft: "",
  implementationTaskDrafts: [],
  implementationTaskTicketDraft: "",
  rolePromptPackDraft: "",
});

console.log("Implementation handoff drafts smoke passed.");
