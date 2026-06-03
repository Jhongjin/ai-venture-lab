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
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const productSurfaceImplementationUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/product-surface-implementation.ts"),
).href;
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;

const appDevelopmentPlanUrl = transpileModuleUrl("src/lib/app-development-plan-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/product-surface-implementation";', `from ${JSON.stringify(productSurfaceImplementationUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const mvpScopeUrl = transpileModuleUrl("src/lib/mvp-scope-markdown.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const prdUrl = transpileModuleUrl("src/lib/prd-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const moduleUrl = transpileModuleUrl("src/lib/product-planning-drafts.ts", [
  ['from "@/lib/app-development-plan-markdown";', `from ${JSON.stringify(appDevelopmentPlanUrl)};`],
  ['from "@/lib/mvp-scope-markdown";', `from ${JSON.stringify(mvpScopeUrl)};`],
  ['from "@/lib/prd-markdown";', `from ${JSON.stringify(prdUrl)};`],
]);

const { buildProductPlanningArtifactSaveDrafts, buildProductPlanningDraftState } = await import(moduleUrl);
const {
  getDoneAppDevelopmentPlanPhases,
  getPrimaryAppDevelopmentPlanExperiment,
  hasAppDevelopmentPlanArtifactType,
} = await import(appDevelopmentPlanUrl);
const {
  getApprovedMvpScopeArtifacts,
  getFirstMetricMvpScopeExperiment,
  getHighMvpScopeRisks,
  getMvpScopeRunByPhase,
} = await import(mvpScopeUrl);
const { getHighPrdRisks } = await import(prdUrl);

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
  next_evidence: "제작 패키지를 실제 외부 도구에 전달",
  one_liner: "메모를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "automation",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "출처 개인정보 가림 필요",
  signal: "반복 정리 업무",
  stage: "prd",
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
    name: "운영자 인터뷰",
    organization_id: "org-1",
    started_at: "2026-06-02",
    ended_at: null,
    status: "done",
    success_metric: "외부 도구 전달 자료가 바로 실행 가능한지 확인",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const risks = [
  {
    area: "privacy",
    created_at: "2026-06-01T00:00:00.000Z",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "원문 저장 전 식별자 제거",
    organization_id: "org-1",
    severity: "high",
    status: "mitigating",
    title: "붙여넣은 대화 개인정보",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const runs = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "run-1",
    idea_id: idea.id,
    objective: "제품 기획서 작성",
    organization_id: "org-1",
    owner_role: "product",
    phase: "product",
    status: "done",
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
assert.equal(hasAppDevelopmentPlanArtifactType(artifacts, "prd"), true);
assert.equal(hasAppDevelopmentPlanArtifactType(artifacts, "mvp_spec"), false);
assert.deepEqual([...getDoneAppDevelopmentPlanPhases(runs)], ["product"]);
assert.equal(getPrimaryAppDevelopmentPlanExperiment(experiments)?.id, "exp-1");
assert.equal(getPrimaryAppDevelopmentPlanExperiment([]), null);
assert.equal(getMvpScopeRunByPhase(runs, "product")?.id, "run-1");
assert.equal(getMvpScopeRunByPhase(runs, "build"), null);
assert.deepEqual(
  getHighMvpScopeRisks(risks).map((risk) => risk.id),
  ["risk-1"],
);
assert.deepEqual(
  getHighPrdRisks(risks).map((risk) => risk.id),
  ["risk-1"],
);
assert.deepEqual(
  getApprovedMvpScopeArtifacts(artifacts).map((artifact) => artifact.id),
  ["artifact-1"],
);
assert.equal(
  getFirstMetricMvpScopeExperiment([
    { ...experiments[0], id: "exp-empty", success_metric: "" },
    { ...experiments[0], id: "exp-metric", success_metric: "핵심 행동 완료" },
  ])?.id,
  "exp-metric",
);

const draftState = buildProductPlanningDraftState({
  artifacts,
  experiments,
  idea,
  recommendation: "ship",
  risks,
  runs,
  score: 25,
  state,
});

assert.match(draftState.prdDraft, /# 제품 기획서: AI Venture Lab/);
assert.match(draftState.mvpSpecDraft, /# 첫 제작 범위: AI Venture Lab/);
assert.match(draftState.mvpSlicePlanDraft, /# 첫 제작 범위 플랜: AI Venture Lab/);
assert.match(draftState.developmentPlanDraft, /# 앱 개발 실행 계획: AI Venture Lab/);
assert.match(draftState.developmentPlanDraft, /자동화/);

const saveDrafts = buildProductPlanningArtifactSaveDrafts({
  ideaName: idea.name,
  mvpSlicePlanDraft: draftState.mvpSlicePlanDraft,
  mvpSpecDraft: draftState.mvpSpecDraft,
  prdDraft: draftState.prdDraft,
});
assert.equal(saveDrafts.prdSaveDraft.artifactType, "prd");
assert.equal(saveDrafts.prdSaveDraft.title, "AI Venture Lab 제품 기획서");
assert.equal(saveDrafts.prdSaveDraft.source, "workbench");
assert.match(saveDrafts.prdSaveDraft.body, /# 제품 기획서: AI Venture Lab/);
assert.equal(saveDrafts.mvpSlicePlanSaveDraft.artifactType, "mvp_spec");
assert.equal(saveDrafts.mvpSlicePlanSaveDraft.title, "AI Venture Lab 첫 제작 범위 플랜");
assert.equal(saveDrafts.mvpSlicePlanSaveDraft.source, "mvp_slice_plan");
assert.match(saveDrafts.mvpSlicePlanSaveDraft.body, /# 첫 제작 범위 플랜: AI Venture Lab/);
assert.equal(saveDrafts.mvpSpecSaveDraft.artifactType, "mvp_spec");
assert.equal(saveDrafts.mvpSpecSaveDraft.title, "AI Venture Lab 첫 제작 범위");
assert.equal(saveDrafts.mvpSpecSaveDraft.source, "workbench");
assert.match(saveDrafts.mvpSpecSaveDraft.body, /# 첫 제작 범위: AI Venture Lab/);

assert.deepEqual(
  buildProductPlanningArtifactSaveDrafts({
    ideaName: null,
    mvpSlicePlanDraft: "",
    mvpSpecDraft: "",
    prdDraft: "",
  }),
  {
    mvpSlicePlanSaveDraft: null,
    mvpSpecSaveDraft: null,
    prdSaveDraft: null,
  },
);

const emptyDraftState = buildProductPlanningDraftState({
  artifacts: [],
  experiments: [],
  idea: null,
  recommendation: "research_more",
  risks: [],
  runs: [],
  score: 0,
  state: null,
});
assert.deepEqual(emptyDraftState, {
  developmentPlanDraft: "",
  mvpSlicePlanDraft: "",
  mvpSpecDraft: "",
  prdDraft: "",
});

console.log("Product planning drafts smoke passed.");
