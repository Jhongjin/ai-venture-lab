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
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;

const validationEvidenceUrl = transpileModuleUrl("src/lib/validation-evidence-markdown.ts", [
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const validationPackageUrl = transpileModuleUrl("src/lib/validation-package-markdown.ts", [
  ['from "@/lib/artifact-labels";', `from ${JSON.stringify(artifactLabelsUrl)};`],
  ['from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const moduleUrl = transpileModuleUrl("src/lib/validation-package-drafts.ts", [
  ['from "@/lib/validation-evidence-markdown";', `from ${JSON.stringify(validationEvidenceUrl)};`],
  ['from "@/lib/validation-package-markdown";', `from ${JSON.stringify(validationPackageUrl)};`],
]);

const {
  buildExperimentResultArtifactSaveDraft,
  buildExperimentResultSavedMessage,
  buildValidationEvidenceArtifactSaveDraft,
  buildValidationPackageArtifactSaveDrafts,
  buildValidationPackageDraftState,
  buildValidationPackageSaveLoginRequiredMessage,
  buildValidationPackageSavedMessage,
} = await import(moduleUrl);

const idea = {
  buyer: "운영팀",
  created_at: "2026-06-01T00:00:00.000Z",
  created_by: "user-1",
  decision: "pending",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "인터뷰 3명",
  one_liner: "메모를 검증 패키지로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "automation",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "개인정보 가림 필요",
  signal: "반복 정리 업무",
  stage: "score",
  target_user: "1인 창업자",
  updated_at: "2026-06-01T00:00:00.000Z",
  willingness_to_pay: 4,
};
const state = {
  buyer: idea.buyer,
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  mvp_speed: 5,
  next_evidence: idea.next_evidence,
  product_surface: "automation",
  problem_intensity: 5,
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: idea.risk_summary,
  signal: idea.signal,
  stage: "score",
  willingness_to_pay: 4,
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
    status: "running",
    success_metric: "반복 정리 업무를 유료로 맡길 의향 3명",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "exp-2",
    idea_id: idea.id,
    name: "랜딩 수요 확인",
    organization_id: "org-1",
    started_at: null,
    ended_at: null,
    status: "planned",
    success_metric: "대기 등록 10명",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const risks = [
  {
    area: "privacy",
    created_at: "2026-06-01T00:00:00.000Z",
    id: "risk-1",
    idea_id: idea.id,
    mitigation: "출처에서 연락처와 식별자를 저장 전 제거",
    organization_id: "org-1",
    severity: "high",
    status: "open",
    title: "붙여넣은 대화의 개인정보",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const runs = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    id: "run-1",
    idea_id: idea.id,
    objective: "검증 패키지 저장",
    organization_id: "org-1",
    owner_role: "product",
    phase: "product",
    status: "done",
    updated_at: "2026-06-01T00:00:00.000Z",
  },
];
const artifacts = [
  {
    artifact_type: "research_note",
    body: "# 조사 요약",
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: "user-1",
    id: "artifact-1",
    idea_id: idea.id,
    organization_id: "org-1",
    source: "workbench",
    status: "approved",
    status_note: null,
    title: "AI Venture Lab 조사 요약",
    updated_at: "2026-06-01T00:00:00.000Z",
    version: 1,
  },
];
const decisions = [
  {
    created_at: "2026-06-01T00:00:00.000Z",
    decision: "ship",
    decided_at: "2026-06-01T00:00:00.000Z",
    id: "decision-1",
    idea_id: idea.id,
    organization_id: "org-1",
    reason: "반복 업무 고통이 명확함",
    score: 25,
  },
];

const draftState = buildValidationPackageDraftState({
  artifacts,
  decisions,
  evidenceDraft: {
    confidence: "high",
    evidence: "반복 업무를 정리해 달라는 요청이 3건 확인됨",
    implication: "자동 정리 OS의 초기 수요가 있음",
    source: "사용자 인터뷰",
    title: "수요 인터뷰",
  },
  experiments,
  experimentResultDraft: {
    experiment_id: "exp-2",
    learning: "랜딩보다 인터뷰 반응이 빠름",
    next_action: "인터뷰 문항을 제품 패키지 검증으로 좁힘",
    next_decision: "ship",
    result: "대기 등록 12명",
  },
  idea,
  recommendation: "ship",
  risks,
  runs,
  score: 25,
  state,
});

assert.match(draftState.ideaBrief, /# 아이디어 요약: AI Venture Lab/);
assert.match(draftState.researchBriefDraft, /# 조사 요약: AI Venture Lab/);
assert.match(draftState.validationSprintDraft, /# 7일 검증 계획: AI Venture Lab/);
assert.match(draftState.evidenceNoteDraft, /# 근거 기록: 수요 인터뷰/);
assert.equal(draftState.selectedExperimentForResult?.id, "exp-2");
assert.match(draftState.experimentResultNoteDraft, /# 실험 결과: 랜딩 수요 확인/);
assert.match(draftState.validationSummaryDraft, /# 검증 완료 요약: AI Venture Lab/);

const saveDrafts = buildValidationPackageArtifactSaveDrafts({
  ideaBrief: draftState.ideaBrief,
  ideaName: idea.name,
  researchBriefDraft: draftState.researchBriefDraft,
  validationSprintDraft: draftState.validationSprintDraft,
  validationSummaryDraft: draftState.validationSummaryDraft,
});
assert.deepEqual(
  {
    artifactType: saveDrafts.ideaBriefSaveDraft?.artifactType,
    source: saveDrafts.ideaBriefSaveDraft?.source,
    title: saveDrafts.ideaBriefSaveDraft?.title,
  },
  {
    artifactType: "idea_brief",
    source: "workbench",
    title: "AI Venture Lab 아이디어 요약",
  },
);
assert.deepEqual(
  {
    artifactType: saveDrafts.researchBriefSaveDraft?.artifactType,
    source: saveDrafts.researchBriefSaveDraft?.source,
    title: saveDrafts.researchBriefSaveDraft?.title,
  },
  {
    artifactType: "research_note",
    source: "workbench",
    title: "AI Venture Lab 조사 요약",
  },
);
assert.deepEqual(
  {
    artifactType: saveDrafts.validationSprintSaveDraft?.artifactType,
    source: saveDrafts.validationSprintSaveDraft?.source,
    title: saveDrafts.validationSprintSaveDraft?.title,
  },
  {
    artifactType: "research_note",
    source: "validation_sprint",
    title: "AI Venture Lab 7일 검증 계획",
  },
);
assert.deepEqual(
  {
    artifactType: saveDrafts.validationSummarySaveDraft?.artifactType,
    source: saveDrafts.validationSummarySaveDraft?.source,
    title: saveDrafts.validationSummarySaveDraft?.title,
  },
  {
    artifactType: "research_note",
    source: "validation_summary",
    title: "AI Venture Lab 검증 완료 요약",
  },
);
assert.equal(saveDrafts.validationSummarySaveDraft?.body, draftState.validationSummaryDraft);

const evidenceSaveDraft = buildValidationEvidenceArtifactSaveDraft({
  evidenceNoteDraft: draftState.evidenceNoteDraft,
  evidenceTitle: " 수요 인터뷰 ",
  ideaName: " AI Venture Lab ",
});
assert.deepEqual(
  {
    artifactType: evidenceSaveDraft?.artifactType,
    source: evidenceSaveDraft?.source,
    title: evidenceSaveDraft?.title,
  },
  {
    artifactType: "research_note",
    source: "evidence_capture",
    title: "AI Venture Lab 근거 - 수요 인터뷰",
  },
);
assert.equal(evidenceSaveDraft?.body, draftState.evidenceNoteDraft);

const experimentResultSaveDraft = buildExperimentResultArtifactSaveDraft({
  experimentName: draftState.selectedExperimentForResult?.name ?? null,
  experimentResultNoteDraft: draftState.experimentResultNoteDraft,
});
assert.deepEqual(
  {
    artifactType: experimentResultSaveDraft?.artifactType,
    source: experimentResultSaveDraft?.source,
    title: experimentResultSaveDraft?.title,
  },
  {
    artifactType: "research_note",
    source: "experiment_result",
    title: "랜딩 수요 확인 실험 결과",
  },
);
assert.equal(experimentResultSaveDraft?.body, draftState.experimentResultNoteDraft);

const emptySaveDrafts = buildValidationPackageArtifactSaveDrafts({
  ideaBrief: " ",
  ideaName: null,
  researchBriefDraft: " ",
  validationSprintDraft: " ",
  validationSummaryDraft: " ",
});
assert.deepEqual(emptySaveDrafts, {
  ideaBriefSaveDraft: null,
  researchBriefSaveDraft: null,
  validationSprintSaveDraft: null,
  validationSummarySaveDraft: null,
});
assert.equal(
  buildValidationEvidenceArtifactSaveDraft({
    evidenceNoteDraft: draftState.evidenceNoteDraft,
    evidenceTitle: "",
    ideaName: idea.name,
  }),
  null,
);
assert.equal(
  buildExperimentResultArtifactSaveDraft({
    experimentName: "운영자 인터뷰",
    experimentResultNoteDraft: " ",
  }),
  null,
);

const fallbackDraftState = buildValidationPackageDraftState({
  artifacts: [],
  decisions: [],
  evidenceDraft: {
    confidence: "medium",
    evidence: "",
    implication: "",
    source: "",
    title: "",
  },
  experiments,
  experimentResultDraft: {
    experiment_id: "missing",
    learning: "",
    next_action: "",
    next_decision: "research_more",
    result: "",
  },
  idea,
  recommendation: "research_more",
  risks: [],
  runs: [],
  score: 12,
  state,
});
assert.equal(fallbackDraftState.selectedExperimentForResult?.id, "exp-1");
assert.match(fallbackDraftState.experimentResultNoteDraft, /# 실험 결과: 운영자 인터뷰/);

const emptyDraftState = buildValidationPackageDraftState({
  artifacts: [],
  decisions: [],
  evidenceDraft: {
    confidence: "medium",
    evidence: "",
    implication: "",
    source: "",
    title: "",
  },
  experiments: [],
  experimentResultDraft: {
    experiment_id: "",
    learning: "",
    next_action: "",
    next_decision: "research_more",
    result: "",
  },
  idea: null,
  recommendation: "research_more",
  risks: [],
  runs: [],
  score: 0,
  state: null,
});
assert.deepEqual(emptyDraftState, {
  evidenceNoteDraft: "",
  experimentResultNoteDraft: "",
  ideaBrief: "",
  researchBriefDraft: "",
  selectedExperimentForResult: null,
  validationSprintDraft: "",
  validationSummaryDraft: "",
});
assert.equal(
  buildValidationPackageSavedMessage(2),
  "검증 자료를 한 번에 저장했습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다.",
);
assert.equal(
  buildValidationPackageSavedMessage(0),
  "이미 필요한 검증 자료가 모두 저장되어 있습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다.",
);
assert.equal(buildValidationPackageSaveLoginRequiredMessage(), "검증 자료를 저장하려면 먼저 로그인하세요.");
assert.equal(
  buildExperimentResultSavedMessage(),
  "검증 결과를 저장했습니다. 다음 단계 이동은 하단 다음 단계 버튼에서 진행하세요.",
);

console.log("Validation package drafts smoke passed.");
