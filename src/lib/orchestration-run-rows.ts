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

export type OrchestrationRunTelemetrySource<Phase extends string, Status extends string> = {
  output: string;
  owner_role: string | null;
  phase: Phase;
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

export function buildManualOrchestrationRunLoginRequiredMessage() {
  return "실행 단계를 추가하려면 먼저 로그인하세요.";
}

export function buildOrchestrationRunbookCreatedMessage() {
  return "전체 실행 순서 묶음을 만들었습니다.";
}

export function buildOrchestrationRunbookLoginRequiredMessage() {
  return "실행 순서 묶음을 만들려면 먼저 로그인하세요.";
}

export function buildOrchestrationRunbookAlreadyExistsMessage() {
  return "이 아이디어에는 이미 전체 실행 순서 묶음이 있습니다.";
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

export function buildOrchestrationRunUpdatePermissionDeniedMessage() {
  return "단계 작성자 또는 워크스페이스 관리자만 이 실행 단계를 수정할 수 있습니다.";
}

export function buildOrchestrationRunDeletePermissionDeniedMessage() {
  return "단계 작성자 또는 워크스페이스 관리자만 이 실행 단계를 삭제할 수 있습니다.";
}

export function buildOrchestrationRunDeleteConfirmMessage(phaseLabel: string) {
  return `${phaseLabel} 실행 단계를 삭제할까요? 저장된 단계 결과도 함께 사라집니다.`;
}

export function buildOrchestrationRunOutputSavedMessage({ phaseLabel }: { phaseLabel: string }) {
  return `${phaseLabel} 결과를 저장했습니다.`;
}

export function buildOrchestrationRunOutputSavePermissionDeniedMessage() {
  return "단계 작성자 또는 협업 공간 관리자만 이 결과를 저장할 수 있습니다.";
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

export function buildOrchestrationRunCreatedTelemetryProperties<Phase extends string, Status extends string>(
  run: Pick<OrchestrationRunTelemetrySource<Phase, Status>, "owner_role" | "phase" | "status">,
) {
  return {
    phase: run.phase,
    status: run.status,
    owner_role: run.owner_role || "미정",
  };
}

export function buildOrchestrationRunbookTelemetryProperties({
  missingPhaseCount,
  runCount,
}: {
  missingPhaseCount: number;
  runCount: number;
}) {
  return {
    run_count: runCount,
    missing_phase_count: missingPhaseCount,
  };
}

export function buildOrchestrationRunStatusTelemetryProperties<Phase extends string, Status extends string>({
  previousStatus,
  run,
}: {
  previousStatus: Status;
  run: Pick<OrchestrationRunTelemetrySource<Phase, Status>, "phase" | "status">;
}) {
  return {
    phase: run.phase,
    status: run.status,
    previous_status: previousStatus,
  };
}

export function buildOrchestrationRunDeletedTelemetryProperties<Phase extends string, Status extends string>(
  run: Pick<OrchestrationRunTelemetrySource<Phase, Status>, "phase" | "status">,
) {
  return {
    phase: run.phase,
    previous_status: run.status,
  };
}

export function buildOrchestrationRunOutputTelemetryProperties<Phase extends string>(
  run: Pick<OrchestrationRunTelemetrySource<Phase, string>, "output" | "phase">,
) {
  return {
    phase: run.phase,
    output_length: run.output.length,
  };
}
