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
