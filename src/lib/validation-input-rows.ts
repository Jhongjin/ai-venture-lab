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

export type RiskStatusUpdatePatch<Status extends string> = {
  status: Status;
};

export type IdeaDecisionUpdatePatch<Decision extends string> = {
  decision: Decision;
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
