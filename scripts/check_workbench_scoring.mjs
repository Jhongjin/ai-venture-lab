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
  buildWorkbenchScoringEditGuidanceMessage,
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
