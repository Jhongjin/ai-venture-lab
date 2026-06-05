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
  buildWorkbenchScoringCurrentScoreCard,
  buildWorkbenchScoringEditGuidanceMessage,
  buildWorkbenchScoringHelpSectionDisplayState,
  buildWorkbenchScoringHelpSections,
  buildWorkbenchScoringInputControlState,
  buildWorkbenchScoringNextActionCard,
  buildWorkbenchScoringNoteFieldConfigs,
  buildWorkbenchScoringNotePanelState,
  buildWorkbenchScoringRecommendationPanelState,
  buildWorkbenchScoringReviewCards,
  buildWorkbenchScoringReviewPanelState,
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
assert.deepEqual(buildWorkbenchScoringReviewCards({ scoreDecisionLabel: "추가 조사" }), [
  {
    description: "지금 화면에서는 사용자가 고르지 않습니다. 저장하면 이 아이디어는 사업성 평가 단계로 기록됩니다.",
    label: "저장되는 단계",
    value: "STEP 2 사업성 평가",
  },
  {
    description: "아래 평가값으로 계산한 추천입니다. 평가가 낮아도 자동 삭제하지 않고, 삭제는 사용자가 직접 선택합니다.",
    label: "AI 추천 판단",
    value: "추가 조사",
  },
]);
assert.ok(
  !ideaWorkbenchSource.includes("STEP 2 사업성 평가"),
  "IdeaWorkbench should render scoring review cards from shared state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("아래 평가값으로 계산한 추천입니다"),
  "IdeaWorkbench should keep scoring review-card copy in the shared helper.",
);
assert.deepEqual(buildWorkbenchScoringCurrentScoreCard({ currentScore: 25 }), {
  description: "위 6개 항목에서 리스크를 반영한 참고값입니다. 저장하면 AI가 다음 검증 계획의 기준으로 사용합니다.",
  label: "현재 평가",
  value: "25",
});
assert.ok(
  !ideaWorkbenchSource.includes("위 6개 항목에서 리스크"),
  "IdeaWorkbench should keep current-score card copy in the shared helper.",
);
assert.deepEqual(buildWorkbenchScoringNextActionCard(), {
  description:
    "AI가 채운 값을 그대로 쓰거나 필요한 부분만 수정한 뒤 저장하세요. 다음 단계의 실험과 리스크 초안은 AI가 이어서 준비합니다.",
  label: "다음 행동",
  value: "사업성 평가를 저장하면 됩니다",
});
assert.ok(
  !ideaWorkbenchSource.includes("사업성 평가를 저장하면 됩니다"),
  "IdeaWorkbench should keep scoring next-action card copy in the shared helper.",
);
assert.deepEqual(buildWorkbenchScoringNotePanelState(), {
  description: "AI가 만든 초안을 직접 보완하고 싶을 때만 여기를 수정하세요.",
  summaryLabel: "추가 메모 열기",
});
assert.ok(
  !ideaWorkbenchSource.includes("추가 메모 열기"),
  "IdeaWorkbench should keep scoring note-panel summary copy in the shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("AI가 만든 초안을 직접 보완하고 싶을 때만"),
  "IdeaWorkbench should keep scoring note-panel description in the shared helper.",
);
assert.deepEqual(buildWorkbenchScoringHelpSections(), [
  {
    body: null,
    containerClassName: "border border-slate-200 p-5 bg-slate-50 text-slate-900",
    items: [
      "처음 값은 AI가 원문을 보고 채운 추천값입니다. 그대로 써도 되고 직접 바꿔도 됩니다.",
      "작게 만들기 쉽지만 차별성이 낮다면 범위를 줄이거나 대상을 좁히는 쪽이 좋습니다.",
      "리스크 감점이 높다면 검증 계획보다 개인정보, 법무, 운영 리스크를 먼저 확인하세요.",
    ],
    titleClassName: "text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase",
    title: "평가값 읽는 법",
    variant: "muted",
  },
  {
    body: "사업성 평가를 저장하면 AI가 다음 검증 계획에서 첫 확인 방법과 성공 기준을 이어서 준비합니다. 여기서는 현재 평가값만 확인하면 충분합니다.",
    containerClassName: "border border-slate-200 p-5 bg-white",
    items: [],
    titleClassName: "text-xs font-semibold tracking-[0.14em] text-slate-500",
    title: "다음 판단",
    variant: "plain",
  },
]);
assert.deepEqual(buildWorkbenchScoringHelpSectionDisplayState({ variant: "muted" }), {
  containerClassName: "border border-slate-200 p-5 bg-slate-50 text-slate-900",
  titleClassName: "text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase",
});
assert.deepEqual(buildWorkbenchScoringHelpSectionDisplayState({ variant: "plain" }), {
  containerClassName: "border border-slate-200 p-5 bg-white",
  titleClassName: "text-xs font-semibold tracking-[0.14em] text-slate-500",
});
assert.ok(
  !ideaWorkbenchSource.includes("평가값 읽는 법"),
  "IdeaWorkbench should render scoring help sections from shared state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("처음 값은 AI가 원문"),
  "IdeaWorkbench should keep scoring help bullets in the shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("사업성 평가를 저장하면 AI가 다음 검증"),
  "IdeaWorkbench should keep scoring next-judgment copy in the shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("section.containerClassName"),
  "IdeaWorkbench should render scoring help section container classes from shared state.",
);
assert.ok(
  ideaWorkbenchSource.includes("section.titleClassName"),
  "IdeaWorkbench should render scoring help section title classes from shared state.",
);
assert.ok(
  !ideaWorkbenchSource.includes('section.variant === "muted"'),
  "IdeaWorkbench should not keep JSX-local scoring help variant branches.",
);
assert.deepEqual(buildWorkbenchScoringReviewPanelState(), {
  description: "AI가 먼저 채운 값을 확인하세요. 다르게 보이는 항목만 조정하면 되고, 단계와 판단은 저장할 때 자동으로 정리됩니다.",
  eyebrow: "사업성 평가 확인",
});
assert.ok(
  !ideaWorkbenchSource.includes("사업성 평가 확인"),
  "IdeaWorkbench should keep scoring review-panel eyebrow in the shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("AI가 먼저 채운 값을 확인하세요"),
  "IdeaWorkbench should keep scoring review-panel description in the shared helper.",
);
assert.deepEqual(buildWorkbenchScoringInputControlState({ canEdit: true }), {
  fieldsDisabled: false,
});
assert.deepEqual(buildWorkbenchScoringInputControlState({ canEdit: false }), {
  fieldsDisabled: true,
});
assert.ok(
  ideaWorkbenchSource.includes("scoringInputControlState.fieldsDisabled"),
  "IdeaWorkbench should render scoring input disabled state from shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={!canEdit}"),
  "IdeaWorkbench should not render scoring input disabled state inline.",
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
    showLoadingIcon: false,
    showSavedIcon: false,
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
    showLoadingIcon: false,
    showSavedIcon: true,
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
    showLoadingIcon: true,
    showSavedIcon: false,
    toneClassName: "avl-btn-primary",
  },
);
assert.ok(
  !ideaWorkbenchSource.includes('scoringSaveButtonState.icon === "loading"'),
  "IdeaWorkbench should render score save loading icon from shared save button state.",
);
assert.ok(
  !ideaWorkbenchSource.includes('scoringSaveButtonState.icon === "saved"'),
  "IdeaWorkbench should render score save completed icon from shared save button state.",
);
assert.ok(
  ideaWorkbenchSource.includes("scoringSaveButtonState.showLoadingIcon"),
  "IdeaWorkbench should use the score save loading icon flag.",
);
assert.ok(
  ideaWorkbenchSource.includes("scoringSaveButtonState.showSavedIcon"),
  "IdeaWorkbench should use the score save completed icon flag.",
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
    description: "현재 평가값으로 계산한 추천입니다. 저장하면 AI가 이 판단을 기준으로 다음 단계를 준비합니다.",
    eyebrow: "AI 추천 판단",
    killWarningMessage: null,
    readinessPills: [
      { label: "수요 신호", toneClassName: "avl-pill-warning" },
      { label: "연결된 리스크", toneClassName: "avl-pill-warning" },
    ],
    scoreDecisionLabel: "추가 조사",
  },
);
assert.deepEqual(
  buildWorkbenchScoringRecommendationPanelState({
    missing: [],
    scoreDecisionLabel: "중단",
    scoreRecommendation: "kill",
  }),
  {
    description: "현재 평가값으로 계산한 추천입니다. 저장하면 AI가 이 판단을 기준으로 다음 단계를 준비합니다.",
    eyebrow: "AI 추천 판단",
    killWarningMessage:
      "현재 평가만 보면 중단에 가깝지만, 아이디어를 바로 삭제하지는 않습니다. 삭제는 상단 삭제 버튼을 눌렀을 때만 진행됩니다.",
    readinessPills: [{ label: "기획 전환 준비 완료", toneClassName: "avl-pill-success" }],
    scoreDecisionLabel: "중단",
  },
);
assert.ok(
  !ideaWorkbenchSource.includes('scoreRecommendation === "kill"'),
  "IdeaWorkbench should use the shared scoring recommendation panel helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("현재 평가값으로 계산한 추천입니다"),
  "IdeaWorkbench should keep scoring recommendation description in the shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("현재 평가만 보면 중단에 가깝지만"),
  "IdeaWorkbench should keep scoring recommendation warning copy in the shared helper.",
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
