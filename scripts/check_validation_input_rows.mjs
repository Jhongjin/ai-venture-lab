import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/validation-input-rows.ts")).href;
const {
  buildDecisionInsertRow,
  buildDecisionRecordedMessage,
  buildDecisionRecordFailedMessage,
  buildDecisionRecordPermissionDeniedMessage,
  buildDecisionTemplateLoadedMessage,
  buildEvidenceCoachPromptLoadedMessage,
  buildEvidenceNoteEmptySaveDraftMessage,
  buildEvidenceNoteEvidenceRequiredMessage,
  buildEvidenceNoteTitleRequiredMessage,
  buildExperimentCreatedTelemetryProperties,
  buildExperimentDeleteConfirmMessage,
  buildExperimentDeletedTelemetryProperties,
  buildExperimentDeletedMessage,
  buildExperimentDeletePermissionDeniedMessage,
  buildExperimentInsertRow,
  buildExperimentResultEmptySaveDraftMessage,
  buildExperimentResultExperimentRequiredMessage,
  buildExperimentResultLearningRequiredMessage,
  buildExperimentResultRequiredMessage,
  buildExperimentStatusChangedMessage,
  buildExperimentStatusTelemetryProperties,
  buildExperimentStatusUpdatePatch,
  buildExperimentUpdatePermissionDeniedMessage,
  buildIdeaDecisionUpdatePatch,
  buildRecommendedValidationExperimentSavedMessage,
  buildRiskCreatedMessage,
  buildRiskCreatedTelemetryProperties,
  buildRiskCreateLoginRequiredMessage,
  buildRiskInsertRow,
  buildRiskSuggestionLoadedMessage,
  buildRiskStatusChangedMessage,
  buildRiskStatusTelemetryProperties,
  buildRiskStatusUpdatePermissionDeniedMessage,
  buildRiskStatusUpdatePatch,
  buildRiskTitleRequiredMessage,
  buildValidationExperimentNameRequiredMessage,
  buildValidationExperimentSavedMessage,
  buildValidationExperimentSaveLoginRequiredMessage,
  experimentResultGuideRows,
  validationEvidenceCoachGuideRows,
  validationExperimentGuideRows,
} = await import(moduleUrl);

assert.deepEqual(
  validationExperimentGuideRows.map((row) => row.title),
  ["무엇을 확인할지", "어떻게 확인할지", "어디까지 보면 될지"],
);
assert.equal(
  validationExperimentGuideRows[0].detail,
  "가장 불확실한 한 가지를 고릅니다. 예: 실제로 자주 겪는 문제인지, 돈을 낼 만큼 불편한지.",
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
assert.equal(buildEvidenceNoteTitleRequiredMessage(), "근거 제목은 필수입니다.");
assert.equal(buildEvidenceNoteEvidenceRequiredMessage(), "관찰한 근거를 입력하세요.");
assert.equal(buildEvidenceNoteEmptySaveDraftMessage(), "저장할 근거 내용이 비어 있습니다.");
assert.equal(buildExperimentResultExperimentRequiredMessage(), "결과를 기록할 검증 계획을 먼저 추가하세요.");
assert.equal(buildExperimentResultRequiredMessage(), "검증 결과를 입력하세요.");
assert.equal(buildExperimentResultLearningRequiredMessage(), "검증에서 배운 점을 입력하세요.");
assert.equal(buildExperimentResultEmptySaveDraftMessage(), "저장할 검증 결과 내용이 비어 있습니다.");

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

console.log("Validation input rows smoke passed.");
