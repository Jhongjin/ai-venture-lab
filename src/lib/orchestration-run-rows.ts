export type OrchestrationRunDraft<Phase extends string> = {
  objective: string;
  owner_role: string;
  phase: Phase;
};

export type OrchestrationRunPhaseConfig<Phase extends string> = {
  objective: string;
  ownerRole: string;
  phase: Phase;
};

export type ExistingOrchestrationRun<Phase extends string> = {
  phase: Phase;
};

export type OrchestrationRunOutputSummary = {
  id: string;
  output: string;
};

export type OrchestrationRunOutputPatch = {
  output: string;
};

export type OrchestrationRunStatusPatch<Status extends string> = {
  status: Status;
};

export type PlannedOrchestrationRunRow<Phase extends string> = {
  idea_id: string;
  objective: string;
  organization_id: string | null;
  owner_role: string;
  phase: Phase;
  status: "planned";
};

export function buildManualOrchestrationRunCreatedMessage() {
  return "실행 단계를 추가했습니다.";
}

export function buildOrchestrationRunbookCreatedMessage() {
  return "전체 실행 순서 묶음을 만들었습니다.";
}

export function buildOrchestrationRunStatusChangedMessage({
  phaseLabel,
  statusLabel,
}: {
  phaseLabel: string;
  statusLabel: string;
}) {
  return `${phaseLabel} 상태를 ${statusLabel}(으)로 변경했습니다.`;
}

export function buildOrchestrationRunDeletedMessage() {
  return "실행 단계를 삭제했습니다.";
}

export function buildOrchestrationRunOutputSavedMessage({ phaseLabel }: { phaseLabel: string }) {
  return `${phaseLabel} 결과를 저장했습니다.`;
}

export function buildManualOrchestrationRunRow<Phase extends string>({
  ideaId,
  organizationId,
  runDraft,
}: {
  ideaId: string;
  organizationId: string | null;
  runDraft: OrchestrationRunDraft<Phase>;
}): PlannedOrchestrationRunRow<Phase> {
  return {
    idea_id: ideaId,
    objective: runDraft.objective.trim(),
    organization_id: organizationId,
    owner_role: runDraft.owner_role.trim(),
    phase: runDraft.phase,
    status: "planned",
  };
}

export function buildMissingOrchestrationRunRows<Phase extends string>({
  existingRuns,
  ideaId,
  organizationId,
  runConfigs,
}: {
  existingRuns: ExistingOrchestrationRun<Phase>[];
  ideaId: string;
  organizationId: string | null;
  runConfigs: OrchestrationRunPhaseConfig<Phase>[];
}): PlannedOrchestrationRunRow<Phase>[] {
  const existingPhases = new Set(existingRuns.map((run) => run.phase));

  return runConfigs
    .filter((config) => !existingPhases.has(config.phase))
    .map((config) => ({
      idea_id: ideaId,
      objective: config.objective,
      organization_id: organizationId,
      owner_role: config.ownerRole,
      phase: config.phase,
      status: "planned",
    }));
}

export function buildOrchestrationRunOutputMap(runs: OrchestrationRunOutputSummary[]) {
  return Object.fromEntries(runs.map((run) => [run.id, run.output])) as Record<string, string>;
}

export function buildOrchestrationRunOutputPatch(output: string | null | undefined): OrchestrationRunOutputPatch {
  return { output: output ?? "" };
}

export function buildOrchestrationRunStatusPatch<Status extends string>(
  status: Status,
): OrchestrationRunStatusPatch<Status> {
  return { status };
}
