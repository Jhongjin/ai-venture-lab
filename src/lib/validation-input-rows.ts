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
