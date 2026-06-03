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

const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const backendExecutionPlanRowsUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/backend-execution-plan-rows.ts"),
).href;
const firstBuildBridgeUrl = pathToFileURL(path.join(process.cwd(), "src/lib/first-build-bridge.ts")).href;

const backendDecisionMarkdownUrl = transpileModuleUrl("src/lib/backend-decision-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
]);
const backendPlanningUrl = transpileModuleUrl("src/lib/backend-planning.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
]);
const { compareBackendCandidateScores, sortBackendCandidateScores } = await import(backendPlanningUrl);
const moduleUrl = transpileModuleUrl("src/lib/backend-planning-drafts.ts", [
  ['from "@/lib/backend-decision-markdown";', `from ${JSON.stringify(backendDecisionMarkdownUrl)};`],
  ['from "@/lib/backend-execution-plan-rows";', `from ${JSON.stringify(backendExecutionPlanRowsUrl)};`],
  ['from "@/lib/backend-planning";', `from ${JSON.stringify(backendPlanningUrl)};`],
  ['from "@/lib/first-build-bridge";', `from ${JSON.stringify(firstBuildBridgeUrl)};`],
]);

const { buildBackendPlanningArtifactSaveDrafts, buildBackendPlanningDraftState } = await import(moduleUrl);

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
  one_liner: "운영 콘솔에서 검증과 제작 패키지를 관리합니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "조직 권한과 개인정보 경계 필요",
  signal: "운영 승인, 권한, 감사 로그가 중요함",
  stage: "build",
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
    name: "운영자 콘솔 테스트",
    organization_id: "org-1",
    started_at: "2026-06-02",
    ended_at: null,
    status: "running",
    success_metric: "저장과 권한 확인을 1회 완료",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const risks = [
  {
    area: "privacy",
    created_at: "2026-06-01T00:00:00.000Z",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "RLS 허용/차단 smoke로 확인",
    organization_id: "org-1",
    severity: "high",
    status: "mitigating",
    title: "조직 데이터 경계",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];

const draftState = buildBackendPlanningDraftState({
  experiments,
  idea,
  risks,
  state,
});

assert.equal(draftState.backendCandidateScores[0].label, "Supabase");
assert.deepEqual(
  sortBackendCandidateScores([
    { label: "Low", score: 25 },
    { label: "High", score: 82 },
    { label: "Mid", score: 61 },
  ]).map((item) => item.label),
  ["High", "Mid", "Low"],
);
assert.equal(compareBackendCandidateScores({ score: 82 }, { score: 25 }) < 0, true);
assert.match(draftState.backendDecisionDraft, /# 백엔드 결정: AI Venture Lab/);
assert.equal(draftState.backendExecutionPlan?.backend.label, "Supabase");
assert.match(draftState.backendExecutionPlanDraft, /# 백엔드 실행 체크리스트: AI Venture Lab/);
assert.deepEqual(
  draftState.backendExecutionPlanSummaryRows.map((row) => row.label),
  ["로컬 검증", "프로덕션 점검", "롤백 기준"],
);
assert.equal(draftState.firstBuildBridge?.stackTitle, "Next.js + Supabase");
assert.match(draftState.firstBuildBridge?.decisionAnchor ?? "", /외부 제작 도구/);

const saveDrafts = buildBackendPlanningArtifactSaveDrafts({
  backendDecisionDraft: draftState.backendDecisionDraft,
  backendExecutionPlanDraft: draftState.backendExecutionPlanDraft,
  ideaName: idea.name,
});
assert.equal(saveDrafts.backendDecisionSaveDraft.artifactType, "backend_decision");
assert.equal(saveDrafts.backendDecisionSaveDraft.title, "AI Venture Lab 백엔드 결정");
assert.equal(saveDrafts.backendDecisionSaveDraft.source, "development_process");
assert.match(saveDrafts.backendDecisionSaveDraft.body, /# 백엔드 결정: AI Venture Lab/);
assert.equal(saveDrafts.backendExecutionPlanSaveDraft.artifactType, "backend_decision");
assert.equal(saveDrafts.backendExecutionPlanSaveDraft.title, "AI Venture Lab 백엔드 실행 체크리스트");
assert.equal(saveDrafts.backendExecutionPlanSaveDraft.source, "backend_execution_checklist");
assert.match(saveDrafts.backendExecutionPlanSaveDraft.body, /# 백엔드 실행 체크리스트: AI Venture Lab/);

assert.deepEqual(
  buildBackendPlanningArtifactSaveDrafts({
    backendDecisionDraft: "",
    backendExecutionPlanDraft: "",
    ideaName: null,
  }),
  {
    backendDecisionSaveDraft: null,
    backendExecutionPlanSaveDraft: null,
  },
);

const emptyDraftState = buildBackendPlanningDraftState({
  experiments: [],
  idea: null,
  risks: [],
  state: null,
});
assert.deepEqual(emptyDraftState, {
  backendCandidateScores: [],
  backendDecisionDraft: "",
  backendExecutionPlan: null,
  backendExecutionPlanDraft: "",
  backendExecutionPlanSummaryRows: [],
  firstBuildBridge: null,
});

console.log("Backend planning drafts smoke passed.");
