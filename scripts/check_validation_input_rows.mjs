import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/validation-input-rows.ts")).href;
const validationPlanningUrl = pathToFileURL(path.join(process.cwd(), "src/lib/validation-planning.ts")).href;
const {
  buildDecisionInsertRow,
  buildDecisionRecordedMessage,
  buildDecisionRecordedTelemetryProperties,
  buildDecisionRecordControlState,
  buildDecisionRecordFailedMessage,
  buildDecisionRecordPermissionDeniedMessage,
  buildDecisionTemplateReason,
  buildDecisionTemplateLoadedMessage,
  buildEvidenceCoachExperimentResultPatch,
  buildEvidenceCoachPromptLoadedMessage,
  buildEvidenceNoteEmptySaveDraftMessage,
  buildEvidenceNoteEvidenceRequiredMessage,
  buildEvidenceNoteSaveControlState,
  buildEvidenceNoteTitleRequiredMessage,
  buildExperimentCreatedTelemetryProperties,
  buildExperimentDeleteControlState,
  buildExperimentDeleteConfirmMessage,
  buildExperimentDeletedTelemetryProperties,
  buildExperimentDeletedMessage,
  buildExperimentDeletePermissionDeniedMessage,
  buildExperimentInsertRow,
  buildExperimentResultInputControlState,
  buildExperimentResultEmptySaveDraftMessage,
  buildExperimentResultExperimentRequiredMessage,
  buildExperimentResultLearningRequiredMessage,
  buildExperimentResultRequiredMessage,
  buildExperimentResultSavedTelemetryProperties,
  buildExperimentStatusChangedMessage,
  buildExperimentStatusControlState,
  buildExperimentStatusTelemetryProperties,
  buildExperimentStatusUpdatePatch,
  buildExperimentUpdatePermissionDeniedMessage,
  buildIdeaDecisionUpdatePatch,
  buildRecommendedValidationExperimentSavedMessage,
  buildRiskCreateControlState,
  buildRiskCreatedMessage,
  buildRiskCreatedTelemetryProperties,
  buildRiskCreateLoginRequiredMessage,
  buildRiskDraftInputControlState,
  buildRiskInsertRow,
  buildRiskSuggestionLoadedMessage,
  buildRiskStatusChangedMessage,
  buildRiskStatusControlState,
  buildRiskStatusTelemetryProperties,
  buildRiskStatusUpdatePermissionDeniedMessage,
  buildRiskStatusUpdatePatch,
  buildRiskTitleRequiredMessage,
  buildValidationExperimentListItemStates,
  buildValidationExperimentManualSaveControlState,
  buildValidationExperimentNameRequiredMessage,
  buildValidationRecordListVisibilityState,
  buildValidationExperimentSavedMessage,
  buildValidationExperimentSaveLoginRequiredMessage,
  experimentResultGuideRows,
  getNextExperimentResultSelectionId,
  validationEvidenceCoachGuideRows,
  validationExperimentGuideRows,
} = await import(moduleUrl);
const {
  buildRecommendedValidationExperimentSaveControl,
  buildIdeaDomainText,
  buildValidationEvidenceCoachNextFocusMessage,
  buildValidationEvidenceCoachScoreLabel,
  buildValidationEvidenceCoachSearchText,
  buildValidationPlanningDisplayState,
  buildValidationPlanningReviewState,
  getOpenHighValidationRisks,
  getValidationEvidenceArtifacts,
  getValidationExperimentsByStatus,
  getValidationPlanExperimentPreview,
  includesAnyNormalized,
} = await import(validationPlanningUrl);

const ideaWorkbenchSource = fs.readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

assert.equal(includesAnyNormalized("반복 검증 자동화 수요", ["반복"]), true);
assert.equal(includesAnyNormalized("Weekly validation demand", ["weekly"]), true);
assert.equal(includesAnyNormalized("Weekly validation demand", ["WEEKLY"]), true);
assert.equal(includesAnyNormalized("검증 자동화 수요", ["결제", "구독"]), false);
assert.equal(includesAnyNormalized("검증 자동화 수요", []), false);
assert.deepEqual(
  getOpenHighValidationRisks([
    { id: "risk-1", severity: "high", status: "open" },
    { id: "risk-2", severity: "critical", status: "mitigated" },
    { id: "risk-3", severity: "critical", status: "closed" },
    { id: "risk-4", severity: "medium", status: "open" },
  ]).map((risk) => risk.id),
  ["risk-1", "risk-2"],
);
assert.deepEqual(
  getValidationEvidenceArtifacts([
    { id: "artifact-1", source: "evidence_capture" },
    { id: "artifact-2", source: "experiment_result" },
    { id: "artifact-3", source: "validation_summary" },
    { id: "artifact-4", source: "market_scan" },
    { id: "artifact-5", source: "workbench" },
    { id: "artifact-6", source: null },
  ]).map((artifact) => artifact.id),
  ["artifact-1", "artifact-2", "artifact-3", "artifact-4"],
);
assert.deepEqual(
  getValidationExperimentsByStatus(
    [
      { id: "experiment-1", status: "planned" },
      { id: "experiment-2", status: "running" },
      { id: "experiment-3", status: "done" },
      { id: "experiment-4", status: "running" },
    ],
    "running",
  ).map((experiment) => experiment.id),
  ["experiment-2", "experiment-4"],
);

assert.deepEqual(
  getValidationPlanExperimentPreview([
    { name: "문제 인터뷰", success_metric: "5명 중 3명 반복 문제 확인" },
    { name: "랜딩 테스트", success_metric: "30명 중 5명 등록" },
    { name: "가격 테스트", success_metric: "2명 이상 지불 의향" },
  ]).map((experiment) => experiment.name),
  ["문제 인터뷰", "랜딩 테스트"],
);
assert.deepEqual(
  getValidationPlanExperimentPreview(
    [
      { name: "문제 인터뷰", success_metric: "5명 중 3명 반복 문제 확인" },
      { name: "랜딩 테스트", success_metric: "30명 중 5명 등록" },
    ],
    1,
  ).map((experiment) => experiment.name),
  ["문제 인터뷰"],
);
assert.deepEqual(buildRecommendedValidationExperimentSaveControl({
  hasSavedExperiment: false,
  hasUser: true,
  isBusy: false,
}), {
  disabled: false,
  label: "AI 추천 검증 계획 저장",
});
assert.deepEqual(buildRecommendedValidationExperimentSaveControl({
  hasSavedExperiment: true,
  hasUser: true,
  isBusy: false,
}), {
  disabled: true,
  label: "검증 계획 저장 완료",
});
assert.deepEqual(buildRecommendedValidationExperimentSaveControl({
  hasSavedExperiment: false,
  hasUser: false,
  isBusy: true,
}), {
  disabled: true,
  label: "AI 추천 검증 계획 저장",
});
assert.deepEqual(buildValidationPlanningDisplayState({
  hasValidationPlan: true,
}), {
  manualExperimentDetailsClassName: "border border-slate-200 border-t-0 bg-white p-4",
  showDecisionTemplateCallout: true,
  showRecommendedPlanCard: true,
});
assert.deepEqual(buildValidationPlanningDisplayState({
  hasValidationPlan: false,
}), {
  manualExperimentDetailsClassName: "border border-slate-200 bg-white p-4",
  showDecisionTemplateCallout: false,
  showRecommendedPlanCard: false,
});
assert.equal(
  buildValidationEvidenceCoachNextFocusMessage({
    action: "최근 30일 발생 횟수를 물어보세요.",
    detail: "문제가 반복되는지 확인합니다.",
    label: "문제 빈도",
    passed: false,
  }),
  "문제 빈도: 최근 30일 발생 횟수를 물어보세요.",
);
assert.equal(
  buildValidationEvidenceCoachNextFocusMessage(null),
  "핵심 근거가 충분합니다. 실행한 검증 결과를 기록한 뒤 하단 다음 단계 버튼으로 이동하세요.",
);
assert.equal(buildValidationEvidenceCoachScoreLabel(83), "83%");
assert.deepEqual(buildExperimentResultInputControlState({
  hasExperiments: true,
  hasUser: true,
  isBusy: false,
}), {
  fieldsDisabled: false,
  saveDisabled: false,
});
assert.deepEqual(buildExperimentResultInputControlState({
  hasExperiments: false,
  hasUser: true,
  isBusy: false,
}), {
  fieldsDisabled: true,
  saveDisabled: true,
});
assert.deepEqual(buildExperimentResultInputControlState({
  hasExperiments: true,
  hasUser: false,
  isBusy: true,
}), {
  fieldsDisabled: false,
  saveDisabled: true,
});
assert.deepEqual(
  buildValidationRecordListVisibilityState({
    decisionCount: 1,
    experimentCount: 2,
    riskCount: 3,
  }),
  {
    hasExperiments: true,
    showDecisionList: true,
    showExperimentList: true,
    showRiskList: true,
  },
);
assert.deepEqual(
  buildValidationRecordListVisibilityState({
    decisionCount: 0,
    experimentCount: 0,
    riskCount: 0,
  }),
  {
    hasExperiments: false,
    showDecisionList: false,
    showExperimentList: false,
    showRiskList: false,
  },
);
assert.deepEqual(
  buildValidationExperimentListItemStates([
    { id: "experiment-1", name: "문제 인터뷰" },
    { id: "experiment-2", name: "랜딩 테스트" },
  ]),
  [
    { experiment: { id: "experiment-1", name: "문제 인터뷰" }, stepLabel: "1" },
    { experiment: { id: "experiment-2", name: "랜딩 테스트" }, stepLabel: "2" },
  ],
);
assert.deepEqual(buildValidationExperimentListItemStates([]), []);
assert.deepEqual(buildExperimentStatusControlState({
  canManage: true,
  currentStatus: "planned",
  isBusy: false,
  nextStatus: "running",
  statusGuide: "검증을 진행 중입니다.",
  statusLabel: "진행 중",
}), {
  buttonClassName: "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
  detail: "검증을 진행 중입니다.",
  detailClassName: "text-slate-500",
  disabled: false,
  isSelected: false,
  label: "진행 중",
  title: "검증을 진행 중입니다.",
});
assert.deepEqual(buildExperimentStatusControlState({
  canManage: true,
  currentStatus: "planned",
  isBusy: false,
  nextStatus: "planned",
  statusGuide: "아직 시작 전입니다.",
  statusLabel: "예정",
}), {
  buttonClassName: "border-slate-950 bg-slate-950 text-white",
  detail: "아직 시작 전입니다.",
  detailClassName: "text-slate-200",
  disabled: true,
  isSelected: true,
  label: "예정",
  title: "아직 시작 전입니다.",
});
assert.deepEqual(buildExperimentStatusControlState({
  canManage: false,
  currentStatus: "planned",
  isBusy: true,
  nextStatus: "done",
  statusGuide: "결과가 충분합니다.",
  statusLabel: "완료",
}), {
  buttonClassName: "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
  detail: "결과가 충분합니다.",
  detailClassName: "text-slate-500",
  disabled: true,
  isSelected: false,
  label: "완료",
  title: "결과가 충분합니다.",
});
assert.deepEqual(buildExperimentDeleteControlState({
  canManage: true,
  isBusy: false,
}), {
  disabled: false,
  label: "삭제",
});
assert.deepEqual(buildExperimentDeleteControlState({
  canManage: false,
  isBusy: true,
}), {
  disabled: true,
  label: "삭제",
});
assert.deepEqual(buildEvidenceNoteSaveControlState({
  hasUser: true,
  isBusy: false,
}), {
  disabled: false,
  label: "근거 저장",
});
assert.deepEqual(buildEvidenceNoteSaveControlState({
  hasUser: false,
  isBusy: true,
}), {
  disabled: true,
  label: "근거 저장",
});
assert.deepEqual(buildRiskCreateControlState({
  hasUser: true,
  isBusy: false,
}), {
  disabled: false,
  label: "리스크 추가",
});
assert.deepEqual(buildRiskCreateControlState({
  hasUser: false,
  isBusy: true,
}), {
  disabled: true,
  label: "리스크 추가",
});
assert.deepEqual(buildRiskDraftInputControlState({
  hasUser: true,
}), {
  fieldsDisabled: false,
});
assert.deepEqual(buildRiskDraftInputControlState({
  hasUser: false,
}), {
  fieldsDisabled: true,
});
assert.deepEqual(buildDecisionRecordControlState({
  canEdit: true,
  decisionLabel: "진행",
  isBusy: false,
}), {
  reasonDisabled: false,
  saveDisabled: false,
  saveLabel: "진행 기록",
});
assert.deepEqual(buildDecisionRecordControlState({
  canEdit: false,
  decisionLabel: "추가 조사",
  isBusy: true,
}), {
  reasonDisabled: true,
  saveDisabled: true,
  saveLabel: "추가 조사 기록",
});
assert.deepEqual(buildRiskStatusControlState({
  canManage: true,
  currentStatus: "open",
  isBusy: false,
  nextStatus: "mitigating",
  statusLabel: "완화 중",
}), {
  disabled: false,
  label: "완화 중",
});
assert.deepEqual(buildRiskStatusControlState({
  canManage: true,
  currentStatus: "open",
  isBusy: false,
  nextStatus: "open",
  statusLabel: "열려 있음",
}), {
  disabled: true,
  label: "열려 있음",
});
assert.deepEqual(buildRiskStatusControlState({
  canManage: false,
  currentStatus: "open",
  isBusy: true,
  nextStatus: "closed",
  statusLabel: "종료",
}), {
  disabled: true,
  label: "종료",
});
assert.deepEqual(buildValidationExperimentManualSaveControlState({
  hasUser: true,
  isBusy: false,
}), {
  disabled: false,
  label: "수정한 계획 저장",
});
assert.deepEqual(buildValidationExperimentManualSaveControlState({
  hasUser: false,
  isBusy: true,
}), {
  disabled: true,
  label: "수정한 계획 저장",
});
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !user || selectedExperiments.length > 0}"),
  "IdeaWorkbench should render recommended validation experiment save disabled state from shared control.",
);
assert.ok(
  !ideaWorkbenchSource.includes('selectedExperiments.length > 0 ? "검증 계획 저장 완료" : "AI 추천 검증 계획 저장"'),
  "IdeaWorkbench should render recommended validation experiment save label from shared control.",
);
assert.ok(
  ideaWorkbenchSource.includes("recommendedValidationExperimentSaveControl.disabled"),
  "IdeaWorkbench should render recommended validation experiment save disabled state from shared control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("validationEvidenceCoach.nextFocus ?"),
  "IdeaWorkbench should render validation evidence coach next-focus message from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationEvidenceCoachNextFocusMessage"),
  "IdeaWorkbench should render validation evidence coach next-focus message from shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("{validationEvidenceCoach.score}%"),
  "IdeaWorkbench should render validation evidence coach score label from shared helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationEvidenceCoachScoreLabel"),
  "IdeaWorkbench should render validation evidence coach score label from shared helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !user || selectedExperiments.length === 0}"),
  "IdeaWorkbench should render experiment result save disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("experimentResultInputControlState.fieldsDisabled"),
  "IdeaWorkbench should render experiment result field disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("experimentResultInputControlState.saveDisabled"),
  "IdeaWorkbench should render experiment result save disabled state from shared input control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !canManageRecord(experiment) || isSelected}"),
  "IdeaWorkbench should render experiment status disabled state from shared input control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !canManageRecord(experiment)}"),
  "IdeaWorkbench should render experiment delete disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("experimentStatusControlState.disabled"),
  "IdeaWorkbench should render experiment status button disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("experimentDeleteControlState.disabled"),
  "IdeaWorkbench should render experiment delete disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("evidenceNoteSaveControlState.disabled"),
  "IdeaWorkbench should render evidence note save disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("riskCreateControlState.disabled"),
  "IdeaWorkbench should render risk create disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("riskDraftInputControlState.fieldsDisabled"),
  "IdeaWorkbench should render risk draft field disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("riskStatusControlState.disabled"),
  "IdeaWorkbench should render risk status button disabled state from shared input control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || !canEdit}"),
  "IdeaWorkbench should render decision record disabled state from shared input control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("{decisionLabels[editState.decision]} 기록"),
  "IdeaWorkbench should render decision record label from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("decisionRecordControlState.saveDisabled"),
  "IdeaWorkbench should render decision record save disabled state from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("decisionRecordControlState.saveLabel"),
  "IdeaWorkbench should render decision record save label from shared input control.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationExperimentManualSaveControlState.disabled"),
  "IdeaWorkbench should render manual validation experiment save disabled state from shared input control.",
);
assert.ok(
  !ideaWorkbenchSource.includes("selectedExperiments.map((experiment, index)"),
  "IdeaWorkbench should render saved validation experiments from shared list item state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("index + 1"),
  "IdeaWorkbench should render saved validation experiment step labels from shared list item state.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationExperimentListItemStates.map"),
  "IdeaWorkbench should map saved validation experiment item state.",
);
assert.ok(
  !ideaWorkbenchSource.includes('validationPlan ? "border-t-0" : ""'),
  "IdeaWorkbench should render validation plan manual details class from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationPlanningDisplayState.showDecisionTemplateCallout"),
  "IdeaWorkbench should render decision template callout visibility from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationPlanningDisplayState.showRecommendedPlanCard"),
  "IdeaWorkbench should render recommended validation plan visibility from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("validationPlanningDisplayState.manualExperimentDetailsClassName"),
  "IdeaWorkbench should render manual validation details class from shared display state.",
);
const validationIdea = {
  buyer: "운영팀",
  frequency: 4,
  id: "idea-1",
  name: "AI Venture Lab",
  next_evidence: "5명 인터뷰",
  one_liner: "아이디어를 검증 패키지로 바꿉니다.",
  problem_intensity: 4,
  reachability: 4,
  risk_summary: "범위 확장 주의",
  signal: "반복 검증 자동화 수요",
  target_user: "창업자",
  willingness_to_pay: 3,
};
const validationState = {
  frequency: validationIdea.frequency,
  next_evidence: validationIdea.next_evidence,
  problem_intensity: validationIdea.problem_intensity,
  reachability: validationIdea.reachability,
  risk_summary: validationIdea.risk_summary,
  signal: validationIdea.signal,
  willingness_to_pay: validationIdea.willingness_to_pay,
};
const ideaDomainText = buildIdeaDomainText(validationIdea, validationState);
assert.match(ideaDomainText, /AI Venture Lab/);
assert.match(ideaDomainText, /아이디어를 검증 패키지로 바꿉니다/);
assert.match(ideaDomainText, /창업자/);
assert.match(ideaDomainText, /운영팀/);
assert.match(ideaDomainText, /반복 검증 자동화 수요/);
assert.match(ideaDomainText, /범위 확장 주의/);
assert.match(ideaDomainText, /5명 인터뷰/);
const evidenceCoachSearchText = buildValidationEvidenceCoachSearchText({
  artifacts: [{ title: "수요 인터뷰", body: "사용자 5명 중 3명이 반복 문제를 말함" }],
  idea: validationIdea,
  state: validationState,
});
assert.match(evidenceCoachSearchText, /AI Venture Lab/);
assert.match(evidenceCoachSearchText, /수요 인터뷰/);
assert.match(evidenceCoachSearchText, /사용자 5명 중 3명/);
const validationReviewState = buildValidationPlanningReviewState({
  artifacts: [],
  decisions: [],
  experiments: [],
  idea: validationIdea,
  missing: [],
  risks: [],
  score: 20,
  state: validationState,
});
assert.equal(validationReviewState.validationPlan.status, "추가 조사");
assert.equal(validationReviewState.recommendedValidationExperiment.name, "구독 감사 리포트 수동 검증");
assert.equal(validationReviewState.validationEvidenceCoach.nextFocus.label, "구매자와 지불");
assert.deepEqual(
  buildValidationPlanningReviewState({
    artifacts: [],
    decisions: [],
    experiments: [],
    idea: null,
    missing: [],
    risks: [],
    score: 20,
    state: validationState,
  }),
  {
    recommendedValidationExperiment: null,
    validationEvidenceCoach: null,
    validationPlan: null,
  },
);

assert.deepEqual(
  validationExperimentGuideRows.map((row) => row.title),
  ["무엇을 확인할지", "어떻게 확인할지", "어디까지 보면 될지"],
);
assert.deepEqual(
  validationExperimentGuideRows.map((row) => row.stepLabel),
  ["01", "02", "03"],
);
assert.equal(
  validationExperimentGuideRows[0].detail,
  "가장 불확실한 한 가지를 고릅니다. 예: 실제로 자주 겪는 문제인지, 돈을 낼 만큼 불편한지.",
);
assert.ok(
  !ideaWorkbenchSource.includes("validationExperimentGuideRows.map((row, index)"),
  "IdeaWorkbench should render validation guide step labels from shared row data.",
);
assert.ok(
  ideaWorkbenchSource.includes("{row.stepLabel}"),
  "IdeaWorkbench should use validation guide step labels from shared row data.",
);

assert.deepEqual(
  validationEvidenceCoachGuideRows.map((row) => row.title),
  ["근거 충분도", "질문 복사", "아래 입력칸에 넣기"],
);
assert.equal(
  validationEvidenceCoachGuideRows[2].detail,
  "부족한 근거를 아래 결과 기록의 다음 행동 입력칸에 넣습니다.",
);

assert.deepEqual(
  experimentResultGuideRows.map((row) => row.title),
  ["어떤 검증인가요", "검증 후 판단", "결과", "배운 점", "다음 행동"],
);
assert.equal(experimentResultGuideRows[1].detail, "결과를 보고 계속 진행할지, 더 조사할지, 전환/중단할지 고릅니다.");
assert.equal(buildRiskCreatedMessage(), "리스크를 추가했습니다.");
assert.equal(buildRiskCreateLoginRequiredMessage(), "리스크를 추가하려면 먼저 로그인하세요.");
assert.equal(buildRiskTitleRequiredMessage(), "리스크 제목은 필수입니다.");
assert.equal(buildDecisionRecordedMessage(), "판단을 기록했습니다.");
assert.equal(
  buildDecisionRecordPermissionDeniedMessage(),
  "아이디어 작성자 또는 워크스페이스 관리자만 판단을 기록할 수 있습니다.",
);
assert.equal(buildDecisionRecordFailedMessage(), "판단을 기록하지 못했습니다.");
assert.equal(buildValidationExperimentSavedMessage(), "검증 계획을 저장했습니다.");
assert.equal(buildValidationExperimentSaveLoginRequiredMessage(), "검증 계획을 저장하려면 먼저 로그인하세요.");
assert.equal(buildValidationExperimentNameRequiredMessage(), "검증 계획 이름은 필수입니다.");
assert.equal(
  buildRecommendedValidationExperimentSavedMessage(),
  "AI 추천 검증 계획을 저장했습니다. 시장·경쟁 점검은 자동으로 정리되고, 이동은 하단 다음 단계 버튼에서만 진행됩니다.",
);
assert.equal(
  buildExperimentUpdatePermissionDeniedMessage(),
  "실험 작성자 또는 워크스페이스 관리자만 이 실험을 수정할 수 있습니다.",
);
assert.equal(
  buildExperimentDeletePermissionDeniedMessage(),
  "실험 작성자 또는 워크스페이스 관리자만 이 실험을 삭제할 수 있습니다.",
);
assert.equal(buildExperimentDeleteConfirmMessage("5명 인터뷰"), "\"5명 인터뷰\" 검증 계획을 삭제할까요?");
assert.equal(
  getNextExperimentResultSelectionId([{ id: "experiment-1" }, { id: "experiment-2" }], "experiment-1"),
  "experiment-2",
);
assert.equal(getNextExperimentResultSelectionId([{ id: "experiment-1" }], "experiment-1"), "");
assert.equal(
  buildExperimentStatusChangedMessage({ statusLabel: "진행 중" }),
  "실험 상태를 진행 중(으)로 변경했습니다.",
);
assert.equal(buildExperimentDeletedMessage(), "검증 계획을 삭제했습니다.");
assert.equal(buildRiskStatusChangedMessage({ statusLabel: "완화 완료" }), "리스크 상태를 완화 완료(으)로 변경했습니다.");
assert.equal(
  buildRiskStatusUpdatePermissionDeniedMessage(),
  "리스크 작성자 또는 협업 공간 관리자만 이 리스크를 수정할 수 있습니다.",
);
assert.equal(buildRiskSuggestionLoadedMessage(), "추천 리스크를 리스크 입력란에 채웠습니다. 완화 방안을 검토한 뒤 저장하세요.");
assert.equal(buildDecisionTemplateLoadedMessage(), "검증 상태 기반 판단 근거 초안을 채웠습니다. 최종 판단을 확인한 뒤 기록하세요.");
assert.equal(
  buildEvidenceCoachPromptLoadedMessage(),
  "보완할 질문을 아래 결과 기록의 다음 행동 입력칸에 넣었습니다. 단계 이동은 하단 다음 단계 버튼에서만 진행됩니다.",
);
assert.equal(
  buildDecisionTemplateReason({
    hypotheses: ["5명 중 3명이 반복 문제를 말한다", "월 1만원 지불 의사가 있다"],
    nextAction: "5명 인터뷰",
    status: "증거 공백 해소",
    statusDetail: "반복 문제를 직접 확인해야 합니다.",
  }),
  "증거 공백 해소: 반복 문제를 직접 확인해야 합니다.\n\n다음 행동: 5명 인터뷰\n\n확인할 핵심 가설\n- 5명 중 3명이 반복 문제를 말한다\n- 월 1만원 지불 의사가 있다",
);
assert.deepEqual(
  buildEvidenceCoachExperimentResultPatch({
    currentExperimentId: "",
    nextFocusAction: "인터뷰 질문을 먼저 확정합니다.",
    selectedExperimentId: "experiment-1",
  }),
  {
    experiment_id: "experiment-1",
    next_action: "인터뷰 질문을 먼저 확정합니다.",
  },
);
assert.deepEqual(
  buildEvidenceCoachExperimentResultPatch({
    currentExperimentId: "experiment-2",
    nextFocusAction: null,
    selectedExperimentId: "experiment-1",
  }),
  {
    experiment_id: "experiment-2",
    next_action: "완료한 검증 결과를 바탕으로 계속 진행, 추가 조사, 전환, 중단 중 다음 행동을 정합니다.",
  },
);
assert.equal(buildEvidenceNoteTitleRequiredMessage(), "근거 제목은 필수입니다.");
assert.equal(buildEvidenceNoteEvidenceRequiredMessage(), "관찰한 근거를 입력하세요.");
assert.equal(buildEvidenceNoteEmptySaveDraftMessage(), "저장할 근거 내용이 비어 있습니다.");
assert.equal(buildExperimentResultExperimentRequiredMessage(), "결과를 기록할 검증 계획을 먼저 추가하세요.");
assert.equal(buildExperimentResultRequiredMessage(), "검증 결과를 입력하세요.");
assert.equal(buildExperimentResultLearningRequiredMessage(), "검증에서 배운 점을 입력하세요.");
assert.equal(buildExperimentResultEmptySaveDraftMessage(), "저장할 검증 결과 내용이 비어 있습니다.");
assert.deepEqual(
  buildExperimentResultSavedTelemetryProperties({
    experimentId: "experiment-1",
    learning: "반복 문제 확인",
    nextDecision: "ship",
    result: "5명 중 4명 긍정",
  }),
  {
    experiment_id: "experiment-1",
    result_length: 10,
    learning_length: 8,
    next_decision: "ship",
  },
);

assert.deepEqual(
  buildRiskInsertRow({
    draft: {
      area: " 개인정보 ",
      mitigation: "  보관하지 않기  ",
      severity: "high",
      title: "  민감정보 입력 위험  ",
    },
    ideaId: "idea-1",
    organizationId: "org-1",
  }),
  {
    area: "개인정보",
    idea_id: "idea-1",
    mitigation: "보관하지 않기",
    organization_id: "org-1",
    severity: "high",
    status: "open",
    title: "민감정보 입력 위험",
  },
);
assert.deepEqual(
  buildRiskCreatedTelemetryProperties({
    area: "",
    severity: "high",
    status: "open",
  }),
  {
    severity: "high",
    status: "open",
    area: "미정",
  },
);

assert.deepEqual(
  buildDecisionInsertRow({
    decision: "research_more",
    ideaId: "idea-2",
    organizationId: null,
    reason: "  인터뷰 증거가 더 필요함  ",
  }),
  {
    decision: "research_more",
    idea_id: "idea-2",
    organization_id: null,
    reason: "인터뷰 증거가 더 필요함",
  },
);
assert.deepEqual(buildIdeaDecisionUpdatePatch("ship"), { decision: "ship" });
assert.deepEqual(
  buildDecisionRecordedTelemetryProperties({
    decision: "research_more",
    reason: "인터뷰 증거가 더 필요함",
  }),
  {
    decision: "research_more",
    reason_length: 13,
  },
);

assert.deepEqual(
  buildExperimentInsertRow({
    draft: {
      name: "  10명 인터뷰  ",
      success_metric: "  5명 이상 반복 문제 인정  ",
    },
    ideaId: "idea-3",
    organizationId: "org-3",
  }),
  {
    idea_id: "idea-3",
    name: "10명 인터뷰",
    organization_id: "org-3",
    status: "planned",
    success_metric: "5명 이상 반복 문제 인정",
  },
);
assert.deepEqual(
  buildExperimentCreatedTelemetryProperties({
    experiment: {
      name: "10명 인터뷰",
      status: "planned",
      success_metric: "5명 이상 반복 문제 인정",
    },
    source: "",
  }),
  {
    status: "planned",
    name_length: 7,
    success_metric_length: 14,
    source: "manual",
  },
);

assert.deepEqual(
  buildExperimentStatusUpdatePatch({
    experiment: {
      ended_at: null,
      started_at: null,
      status: "planned",
    },
    now: "2026-06-01T00:00:00.000Z",
    status: "running",
  }),
  {
    ended_at: null,
    started_at: "2026-06-01T00:00:00.000Z",
    status: "running",
  },
);
assert.deepEqual(
  buildExperimentStatusUpdatePatch({
    experiment: {
      ended_at: null,
      started_at: "2026-05-31T00:00:00.000Z",
      status: "running",
    },
    now: "2026-06-01T00:00:00.000Z",
    status: "done",
  }),
  {
    ended_at: "2026-06-01T00:00:00.000Z",
    started_at: "2026-05-31T00:00:00.000Z",
    status: "done",
  },
);
assert.match(
  buildExperimentStatusUpdatePatch({
    experiment: {
      ended_at: null,
      started_at: null,
      status: "planned",
    },
    status: "running",
  }).started_at,
  /^\d{4}-\d{2}-\d{2}T/,
);
assert.deepEqual(
  buildExperimentStatusTelemetryProperties({
    experiment: { status: "done" },
    previousStatus: "running",
  }),
  {
    status: "done",
    previous_status: "running",
  },
);
assert.deepEqual(buildExperimentDeletedTelemetryProperties("done"), { previous_status: "done" });

assert.deepEqual(buildRiskStatusUpdatePatch("closed"), { status: "closed" });
assert.deepEqual(
  buildRiskStatusTelemetryProperties({
    previousStatus: "open",
    risk: {
      severity: "medium",
      status: "mitigated",
    },
  }),
  {
    severity: "medium",
    status: "mitigated",
    previous_status: "open",
  },
);

const componentDirectory = path.join(process.cwd(), "src/components");
for (const entry of fs.readdirSync(componentDirectory, { withFileTypes: true })) {
  if (entry.isDirectory() || !/\.(ts|tsx)$/.test(entry.name)) {
    continue;
  }

  const filePath = path.join(componentDirectory, entry.name);
  assert.equal(
    fs.readFileSync(filePath, "utf8").includes("new Date("),
    false,
    `${path.relative(process.cwd(), filePath)} should delegate date generation to helper modules`,
  );
}

console.log("Validation input rows smoke passed.");
