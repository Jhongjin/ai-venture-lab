import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const modulePath = path.join(process.cwd(), "src/lib/workbench-scoring.ts");
const productSurfaceUrl = pathToFileURL(path.join(process.cwd(), "src/lib/product-surface.ts")).href;
const workbenchListUtilsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-list-utils.ts")).href;
const source = readFileSync(modulePath, "utf8")
  .replaceAll('from "@/lib/product-surface";', `from ${JSON.stringify(productSurfaceUrl)};`)
  .replaceAll('from "@/lib/workbench-list-utils";', `from ${JSON.stringify(workbenchListUtilsUrl)};`);
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  buildWorkbenchScoreEvaluationState,
  buildWorkbenchScoreInputFieldConfigs,
  buildWorkbenchScoringEditGuidanceMessage,
  buildWorkbenchScoringNoteFieldConfigs,
  buildWorkbenchScoringRecommendationPanelState,
  buildWorkbenchScoringSaveButtonState,
  buildWorkbenchScoringSavedMessage,
  buildWorkbenchScoringSavePatch,
  buildWorkbenchScoringTelemetryProperties,
  isWorkbenchScoreEvaluationSaved,
  missingEvidence,
  recommendationForScore,
  saveDecisionForScore,
  scoreWorkbenchState,
  toWorkbenchEditState,
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
  product_surface: null,
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "개인정보 가림 필요",
  signal: "반복 정리 업무",
  stage: "intake",
  target_user: "1인 창업자",
  updated_at: "2026-06-01T00:00:00.000Z",
  willingness_to_pay: 4,
};

const editState = toWorkbenchEditState(idea);
assert.equal(editState.product_surface, "automation");
assert.equal(scoreWorkbenchState(editState), 25);
assert.equal(recommendationForScore(25), "ship");
assert.equal(saveDecisionForScore("kill"), "research_more");
const scoreInputFieldConfigs = buildWorkbenchScoreInputFieldConfigs({
  descriptions: {
    problem_intensity: "문제 설명",
    frequency: "빈도 설명",
    reachability: "도달 설명",
    willingness_to_pay: "지불 설명",
    mvp_speed: "속도 설명",
    differentiation: "차별 설명",
    regulatory_risk: "리스크 설명",
  },
  state: editState,
});
assert.deepEqual(
  scoreInputFieldConfigs.map(({ description, field, label, value }) => ({ description, field, label, value })),
  [
    { description: "문제 설명", field: "problem_intensity", label: "문제 강도", value: 5 },
    { description: "빈도 설명", field: "frequency", label: "발생 빈도", value: 4 },
    { description: "도달 설명", field: "reachability", label: "도달 가능성", value: 4 },
    { description: "지불 설명", field: "willingness_to_pay", label: "지불 의향", value: 4 },
    { description: "속도 설명", field: "mvp_speed", label: "첫 제작 속도", value: 5 },
    { description: "차별 설명", field: "differentiation", label: "차별성", value: 4 },
    { description: "리스크 설명", field: "regulatory_risk", label: "리스크 감점", value: 1 },
  ],
);
assert.ok(
  !ideaWorkbenchSource.includes('label="문제 강도"'),
  "IdeaWorkbench should render score inputs from shared field configs.",
);
assert.ok(
  !ideaWorkbenchSource.includes("scoreFieldDescriptions.problem_intensity"),
  "IdeaWorkbench should not address score field descriptions inline.",
);
assert.deepEqual(
  buildWorkbenchScoringNoteFieldConfigs(editState).map(({ field, label, value }) => ({ field, label, value })),
  [
    { field: "signal", label: "수요 신호", value: "반복 정리 업무" },
    { field: "risk_summary", label: "리스크 요약", value: "개인정보 가림 필요" },
    { field: "next_evidence", label: "추가로 확인할 내용", value: "인터뷰 3명" },
  ],
);
assert.ok(
  !ideaWorkbenchSource.includes('label="수요 신호"'),
  "IdeaWorkbench should render scoring note inputs from shared field configs.",
);
assert.ok(
  !ideaWorkbenchSource.includes("value={editState.signal}"),
  "IdeaWorkbench should not bind scoring note field values inline.",
);

const savePatch = buildWorkbenchScoringSavePatch({
  decision: "ship",
  idea,
  state: {
    ...editState,
    product_surface: "automation",
  },
});
assert.equal(savePatch.stage, "score");
assert.equal(savePatch.decision, "ship");
assert.equal(savePatch.product_surface, "automation");
assert.equal(savePatch.problem_intensity, 5);
assert.equal(savePatch.regulatory_risk, 1);
assert.deepEqual(buildWorkbenchScoringTelemetryProperties({ ...idea, ...savePatch }), {
  stage: "score",
  decision: "ship",
  score: 25,
  regulatory_risk: 1,
});
assert.equal(
  buildWorkbenchScoringSavedMessage({ usedProductSurfaceFallback: false }),
  "사업성 평가를 저장했습니다.",
);
assert.equal(
  buildWorkbenchScoringSavedMessage({ usedProductSurfaceFallback: true }),
  "사업성 평가는 저장했습니다. 결과물 형태는 DB 마이그레이션 적용 후 저장됩니다.",
);
assert.equal(
  buildWorkbenchScoringEditGuidanceMessage({ canEdit: true }),
  "아래 값은 AI가 원문을 분석해 먼저 채운 추천값입니다. 그대로 저장해도 되고, 다르게 판단되면 직접 수정하세요.",
);
assert.equal(
  buildWorkbenchScoringEditGuidanceMessage({ canEdit: false }),
  "이 기록은 보기 전용입니다. 본인이 만든 아이디어나 팀 관리자 권한이 있는 기록만 편집할 수 있습니다.",
);
assert.ok(
  !ideaWorkbenchSource.includes("아래 값은 AI가 원문을 분석해 먼저 채운 추천값입니다."),
  "IdeaWorkbench should use the shared scoring guidance helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("이 기록은 보기 전용입니다. 본인이 만든 아이디어나 팀 관리자 권한이 있는 기록만 편집할 수 있습니다."),
  "IdeaWorkbench should use the shared read-only scoring guidance helper.",
);
assert.deepEqual(
  buildWorkbenchScoringSaveButtonState({
    canEdit: true,
    isBusy: false,
    isScoreEvaluationSaved: false,
  }),
  {
    disabled: false,
    icon: "save",
    label: "사업성 평가 저장",
    toneClassName: "avl-btn-primary",
  },
);
assert.deepEqual(
  buildWorkbenchScoringSaveButtonState({
    canEdit: true,
    isBusy: false,
    isScoreEvaluationSaved: true,
  }),
  {
    disabled: true,
    icon: "saved",
    label: "저장 완료",
    toneClassName: "avl-btn-secondary",
  },
);
assert.deepEqual(
  buildWorkbenchScoringSaveButtonState({
    canEdit: true,
    isBusy: true,
    isScoreEvaluationSaved: false,
  }),
  {
    disabled: true,
    icon: "loading",
    label: "사업성 평가 저장",
    toneClassName: "avl-btn-primary",
  },
);
assert.equal(
  buildWorkbenchScoringSaveButtonState({
    canEdit: false,
    isBusy: false,
    isScoreEvaluationSaved: false,
  }).disabled,
  true,
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !canEdit || isScoreEvaluationSaved}"),
  "IdeaWorkbench should use the shared scoring save button helper.",
);
assert.deepEqual(
  buildWorkbenchScoringRecommendationPanelState({
    missing: ["수요 신호", "연결된 리스크"],
    scoreDecisionLabel: "추가 조사",
    scoreRecommendation: "research_more",
  }),
  {
    readinessPills: [
      { label: "수요 신호", toneClassName: "avl-pill-warning" },
      { label: "연결된 리스크", toneClassName: "avl-pill-warning" },
    ],
    scoreDecisionLabel: "추가 조사",
    shouldShowKillWarning: false,
  },
);
assert.deepEqual(
  buildWorkbenchScoringRecommendationPanelState({
    missing: [],
    scoreDecisionLabel: "중단",
    scoreRecommendation: "kill",
  }),
  {
    readinessPills: [{ label: "기획 전환 준비 완료", toneClassName: "avl-pill-success" }],
    scoreDecisionLabel: "중단",
    shouldShowKillWarning: true,
  },
);
assert.ok(
  !ideaWorkbenchSource.includes('scoreRecommendation === "kill"'),
  "IdeaWorkbench should use the shared scoring recommendation panel helper.",
);
const savedIdea = { ...idea, ...savePatch };
assert.equal(
  isWorkbenchScoreEvaluationSaved({
    hasReachedScoreStage: true,
    idea: savedIdea,
    saveDecision: "ship",
    savedState: toWorkbenchEditState(savedIdea),
    state: savePatch,
  }),
  true,
);
assert.equal(
  isWorkbenchScoreEvaluationSaved({
    hasReachedScoreStage: false,
    idea: savedIdea,
    saveDecision: "ship",
    savedState: toWorkbenchEditState(savedIdea),
    state: savePatch,
  }),
  false,
);
assert.equal(
  isWorkbenchScoreEvaluationSaved({
    hasReachedScoreStage: true,
    idea: savedIdea,
    saveDecision: "ship",
    savedState: toWorkbenchEditState(savedIdea),
    state: { ...savePatch, signal: "새 신호" },
  }),
  false,
);

const scoreEvaluationState = buildWorkbenchScoreEvaluationState({
  idea: savedIdea,
  riskCount: 1,
  state: savePatch,
});
assert.equal(scoreEvaluationState.currentScore, 25);
assert.equal(scoreEvaluationState.scoreRecommendation, "ship");
assert.equal(scoreEvaluationState.scoreSaveDecision, "ship");
assert.equal(scoreEvaluationState.selectedProductSurface?.key, "automation");
assert.equal(scoreEvaluationState.activeProductSurface.key, "automation");
assert.equal(scoreEvaluationState.isScoreEvaluationSaved, true);
assert.deepEqual(scoreEvaluationState.missing, []);

const emptyScoreEvaluationState = buildWorkbenchScoreEvaluationState({
  idea: null,
  riskCount: 0,
  state: null,
});
assert.equal(emptyScoreEvaluationState.currentScore, 0);
assert.equal(emptyScoreEvaluationState.activeProductSurface.key, "web_app");
assert.equal(emptyScoreEvaluationState.isScoreEvaluationSaved, false);
assert.deepEqual(emptyScoreEvaluationState.missing, []);

assert.deepEqual(missingEvidence({ ...idea, one_liner: "", buyer: "" }, { ...editState, signal: "", next_evidence: "" }, 0), [
  "한 줄 설명",
  "구매자",
  "수요 신호",
  "추가로 확인할 내용",
  "연결된 리스크",
]);

console.log("Workbench scoring smoke passed.");
