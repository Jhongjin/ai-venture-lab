export type RiskDraftInput<Severity extends string> = {
  area: string;
  mitigation: string;
  severity: Severity;
  title: string;
};

export type ExperimentDraftInput = {
  name: string;
  success_metric: string;
};

export type ExperimentStatusSource<Status extends string> = {
  ended_at: string | null;
  started_at: string | null;
  status: Status;
};

export type ExperimentTelemetrySource<Status extends string> = {
  name: string;
  status: Status;
  success_metric: string;
};

export type RiskStatusUpdatePatch<Status extends string> = {
  status: Status;
};

export type IdeaDecisionUpdatePatch<Decision extends string> = {
  decision: Decision;
};

export type DecisionTelemetrySource<Decision extends string> = {
  decision: Decision;
  reason: string;
};

export type RiskTelemetrySource<Severity extends string, Status extends string> = {
  area: string | null;
  severity: Severity;
  status: Status;
};

export const validationExperimentGuideRows = [
  {
    title: "무엇을 확인할지",
    detail: "가장 불확실한 한 가지를 고릅니다. 예: 실제로 자주 겪는 문제인지, 돈을 낼 만큼 불편한지.",
  },
  {
    title: "어떻게 확인할지",
    detail: "7일 안에 직접 할 수 있는 행동 하나만 정합니다. 예: 5명 인터뷰, 랜딩/대기자, 직접 테스트.",
  },
  {
    title: "어디까지 보면 될지",
    detail: "몇 명이 어떤 행동을 하면 계속할지, 어떤 반응이면 멈출지 숫자로 정합니다.",
  },
] as const;

export const validationEvidenceCoachGuideRows = [
  { title: "근거 충분도", detail: "현재 확인한 내용이 다음 단계로 넘어가기에 충분한지 참고로 보여줍니다." },
  { title: "질문 복사", detail: "외부 AI, 인터뷰 준비, 조사 메모에 붙여넣을 질문을 복사합니다." },
  { title: "아래 입력칸에 넣기", detail: "부족한 근거를 아래 결과 기록의 다음 행동 입력칸에 넣습니다." },
] as const;

export const experimentResultGuideRows = [
  { title: "어떤 검증인가요", detail: "결과를 남길 검증 계획을 고릅니다." },
  { title: "검증 후 판단", detail: "결과를 보고 계속 진행할지, 더 조사할지, 전환/중단할지 고릅니다." },
  { title: "결과", detail: "숫자, 사람 수, 반응처럼 실제 확인한 사실을 적습니다." },
  { title: "배운 점", detail: "그 결과가 아이디어에 어떤 의미인지 정리합니다." },
  { title: "다음 행동", detail: "바로 이어서 할 한 가지 행동을 적습니다." },
] as const;

export function buildRiskCreatedMessage() {
  return "리스크를 추가했습니다.";
}

export function buildRiskCreateLoginRequiredMessage() {
  return "리스크를 추가하려면 먼저 로그인하세요.";
}

export function buildRiskTitleRequiredMessage() {
  return "리스크 제목은 필수입니다.";
}

export function buildDecisionRecordedMessage() {
  return "판단을 기록했습니다.";
}

export function buildDecisionRecordPermissionDeniedMessage() {
  return "아이디어 작성자 또는 워크스페이스 관리자만 판단을 기록할 수 있습니다.";
}

export function buildDecisionRecordFailedMessage() {
  return "판단을 기록하지 못했습니다.";
}

export function buildValidationExperimentSavedMessage() {
  return "검증 계획을 저장했습니다.";
}

export function buildValidationExperimentSaveLoginRequiredMessage() {
  return "검증 계획을 저장하려면 먼저 로그인하세요.";
}

export function buildValidationExperimentNameRequiredMessage() {
  return "검증 계획 이름은 필수입니다.";
}

export function buildRecommendedValidationExperimentSavedMessage() {
  return "AI 추천 검증 계획을 저장했습니다. 시장·경쟁 점검은 자동으로 정리되고, 이동은 하단 다음 단계 버튼에서만 진행됩니다.";
}

export function buildExperimentUpdatePermissionDeniedMessage() {
  return "실험 작성자 또는 워크스페이스 관리자만 이 실험을 수정할 수 있습니다.";
}

export function buildExperimentDeletePermissionDeniedMessage() {
  return "실험 작성자 또는 워크스페이스 관리자만 이 실험을 삭제할 수 있습니다.";
}

export function buildExperimentDeleteConfirmMessage(experimentName: string) {
  return `"${experimentName}" 검증 계획을 삭제할까요?`;
}

export function buildExperimentStatusChangedMessage({ statusLabel }: { statusLabel: string }) {
  return `실험 상태를 ${statusLabel}(으)로 변경했습니다.`;
}

export function buildExperimentDeletedMessage() {
  return "검증 계획을 삭제했습니다.";
}

export function buildRiskStatusChangedMessage({ statusLabel }: { statusLabel: string }) {
  return `리스크 상태를 ${statusLabel}(으)로 변경했습니다.`;
}

export function buildRiskStatusUpdatePermissionDeniedMessage() {
  return "리스크 작성자 또는 협업 공간 관리자만 이 리스크를 수정할 수 있습니다.";
}

export function buildRiskSuggestionLoadedMessage() {
  return "추천 리스크를 리스크 입력란에 채웠습니다. 완화 방안을 검토한 뒤 저장하세요.";
}

export function buildDecisionTemplateLoadedMessage() {
  return "검증 상태 기반 판단 근거 초안을 채웠습니다. 최종 판단을 확인한 뒤 기록하세요.";
}

export function buildEvidenceCoachPromptLoadedMessage() {
  return "보완할 질문을 아래 결과 기록의 다음 행동 입력칸에 넣었습니다. 단계 이동은 하단 다음 단계 버튼에서만 진행됩니다.";
}

export function buildEvidenceNoteTitleRequiredMessage() {
  return "근거 제목은 필수입니다.";
}

export function buildEvidenceNoteEvidenceRequiredMessage() {
  return "관찰한 근거를 입력하세요.";
}

export function buildEvidenceNoteEmptySaveDraftMessage() {
  return "저장할 근거 내용이 비어 있습니다.";
}

export function buildExperimentResultExperimentRequiredMessage() {
  return "결과를 기록할 검증 계획을 먼저 추가하세요.";
}

export function buildExperimentResultRequiredMessage() {
  return "검증 결과를 입력하세요.";
}

export function buildExperimentResultLearningRequiredMessage() {
  return "검증에서 배운 점을 입력하세요.";
}

export function buildExperimentResultEmptySaveDraftMessage() {
  return "저장할 검증 결과 내용이 비어 있습니다.";
}

export function buildRiskInsertRow<Severity extends string>({
  draft,
  ideaId,
  organizationId,
}: {
  draft: RiskDraftInput<Severity>;
  ideaId: string;
  organizationId: string | null;
}) {
  return {
    area: draft.area.trim(),
    idea_id: ideaId,
    mitigation: draft.mitigation.trim(),
    organization_id: organizationId,
    severity: draft.severity,
    status: "open" as const,
    title: draft.title.trim(),
  };
}

export function buildRiskCreatedTelemetryProperties<Severity extends string, Status extends string>(
  risk: RiskTelemetrySource<Severity, Status>,
) {
  return {
    severity: risk.severity,
    status: risk.status,
    area: risk.area || "미정",
  };
}

export function buildDecisionInsertRow<Decision extends string>({
  decision,
  ideaId,
  organizationId,
  reason,
}: {
  decision: Decision;
  ideaId: string;
  organizationId: string | null;
  reason: string;
}) {
  return {
    decision,
    idea_id: ideaId,
    organization_id: organizationId,
    reason: reason.trim(),
  };
}

export function buildDecisionRecordedTelemetryProperties<Decision extends string>(
  decision: DecisionTelemetrySource<Decision>,
) {
  return {
    decision: decision.decision,
    reason_length: decision.reason.length,
  };
}

export function buildIdeaDecisionUpdatePatch<Decision extends string>(
  decision: Decision,
): IdeaDecisionUpdatePatch<Decision> {
  return { decision };
}

export function buildExperimentInsertRow({
  draft,
  ideaId,
  organizationId,
}: {
  draft: ExperimentDraftInput;
  ideaId: string;
  organizationId: string | null;
}) {
  return {
    idea_id: ideaId,
    name: draft.name.trim(),
    organization_id: organizationId,
    status: "planned" as const,
    success_metric: draft.success_metric.trim(),
  };
}

export function buildExperimentCreatedTelemetryProperties<Status extends string>({
  experiment,
  source,
}: {
  experiment: ExperimentTelemetrySource<Status>;
  source: string | null | undefined;
}) {
  return {
    status: experiment.status,
    name_length: experiment.name.length,
    success_metric_length: experiment.success_metric.length,
    source: source || "manual",
  };
}

export function buildExperimentStatusUpdatePatch<Status extends string>({
  experiment,
  now,
  status,
}: {
  experiment: ExperimentStatusSource<Status>;
  now: string;
  status: Status;
}) {
  return {
    ended_at: status === "done" ? now : experiment.ended_at,
    started_at: status === "running" ? now : experiment.started_at,
    status,
  };
}

export function buildRiskStatusUpdatePatch<Status extends string>(status: Status): RiskStatusUpdatePatch<Status> {
  return { status };
}

export function buildExperimentStatusTelemetryProperties<Status extends string>({
  experiment,
  previousStatus,
}: {
  experiment: Pick<ExperimentStatusSource<Status>, "status">;
  previousStatus: Status;
}) {
  return {
    status: experiment.status,
    previous_status: previousStatus,
  };
}

export function buildExperimentDeletedTelemetryProperties<Status extends string>(previousStatus: Status) {
  return {
    previous_status: previousStatus,
  };
}

export function buildRiskStatusTelemetryProperties<Severity extends string, Status extends string>({
  previousStatus,
  risk,
}: {
  previousStatus: Status;
  risk: Pick<RiskTelemetrySource<Severity, Status>, "severity" | "status">;
}) {
  return {
    severity: risk.severity,
    status: risk.status,
    previous_status: previousStatus,
  };
}
