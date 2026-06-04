import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import type {
  ImplementationTaskStatus,
  OrchestrationPhase,
  OrchestrationStatus,
  VentureArtifactStatus,
  VentureArtifactType,
} from "@/lib/supabase/types";

export type DevelopmentAutopilotRunConfig = {
  phase: OrchestrationPhase;
  ownerRole: string;
  objective: string;
};

export type DevelopmentAutopilotArtifactDraft = {
  artifactType: VentureArtifactType;
  body: string;
  source: string;
  title: string;
};

export type DevelopmentAutopilotRunRow = {
  idea_id: string;
  organization_id: string | null;
  phase: OrchestrationPhase;
  owner_role: string;
  objective: string;
  status: OrchestrationStatus;
};

export type DevelopmentAutopilotArtifactRow = {
  idea_id: string;
  organization_id: string | null;
  artifact_type: VentureArtifactType;
  status: VentureArtifactStatus;
  version: number;
  title: string;
  body: string;
  source: string;
  status_note: string;
};

export type DevelopmentAutopilotTaskRow = {
  idea_id: string;
  organization_id: string | null;
  source_artifact_id: string | null;
  title: string;
  task_type: ImplementationTaskDraft["task_type"];
  priority: ImplementationTaskDraft["priority"];
  status: ImplementationTaskStatus;
  owner_role: string;
  acceptance_criteria: string;
  evidence: string;
  sort_order: number;
};

export type DevelopmentAutopilotRows = {
  artifactRows: DevelopmentAutopilotArtifactRow[];
  missingRuns: DevelopmentAutopilotRunRow[];
  taskRows: DevelopmentAutopilotTaskRow[];
};

export type DevelopmentAutopilotRowGroups = {
  artifactRows: ReadonlyArray<unknown>;
  runRows: ReadonlyArray<unknown>;
  taskRows: ReadonlyArray<unknown>;
};

export type DevelopmentAutopilotActionControlState = {
  disabled: boolean;
  label: string;
};

export function buildDevelopmentAutopilotActionControlState({
  canUseFullProductionPackage,
  hasUser,
  isBusy,
}: {
  canUseFullProductionPackage: boolean;
  hasUser: boolean;
  isBusy: boolean;
}): DevelopmentAutopilotActionControlState {
  return {
    disabled: isBusy || !hasUser || !canUseFullProductionPackage,
    label: "제작 패키지 정리",
  };
}

export function buildDevelopmentAutopilotRowCounts({
  artifactRows,
  runRows,
  taskRows,
}: DevelopmentAutopilotRowGroups) {
  const artifactCount = artifactRows.length;
  const runCount = runRows.length;
  const taskCount = taskRows.length;

  return {
    artifactCount,
    hasRows: artifactCount > 0 || runCount > 0 || taskCount > 0,
    runCount,
    taskCount,
  };
}

export function getDevelopmentAutopilotNextPanel({
  existingTaskCount,
  insertedTaskCount,
}: {
  existingTaskCount: number;
  insertedTaskCount: number;
}) {
  return insertedTaskCount > 0 || existingTaskCount > 0 ? "tasks" : "setup";
}

export function buildDevelopmentAutopilotRows({
  artifactDrafts,
  existingArtifacts,
  existingRuns,
  existingTasks,
  ideaId,
  implementationTaskDrafts,
  organizationId,
  runConfigs,
  sourceArtifactId,
}: {
  artifactDrafts: ReadonlyArray<DevelopmentAutopilotArtifactDraft>;
  existingArtifacts: ReadonlyArray<{ artifact_type: VentureArtifactType; title: string; version: number | null }>;
  existingRuns: ReadonlyArray<{ phase: OrchestrationPhase }>;
  existingTasks: ReadonlyArray<{ title: string }>;
  ideaId: string;
  implementationTaskDrafts: ReadonlyArray<ImplementationTaskDraft>;
  organizationId: string | null;
  runConfigs: ReadonlyArray<DevelopmentAutopilotRunConfig>;
  sourceArtifactId: string | null;
}): DevelopmentAutopilotRows {
  const existingPhases = new Set(existingRuns.map((run) => run.phase));
  const missingRuns = runConfigs
    .filter((config) => !existingPhases.has(config.phase))
    .map((config) => ({
      idea_id: ideaId,
      organization_id: organizationId,
      phase: config.phase,
      owner_role: config.ownerRole,
      objective: config.objective,
      status: "planned" as OrchestrationStatus,
    }));

  const existingArtifactTitles = new Set(existingArtifacts.map((artifact) => artifact.title.trim().toLowerCase()));
  const packageDrafts = artifactDrafts.filter(
    (draft) => draft.body.trim() && !existingArtifactTitles.has(draft.title.trim().toLowerCase()),
  );
  const versionOffsets = new Map<VentureArtifactType, number>();
  const artifactRows = packageDrafts.map((draft) => {
    const previousVersion =
      Math.max(
        0,
        ...existingArtifacts
          .filter((artifact) => artifact.artifact_type === draft.artifactType)
          .map((artifact) => artifact.version ?? 1),
      ) + (versionOffsets.get(draft.artifactType) ?? 0);

    versionOffsets.set(draft.artifactType, (versionOffsets.get(draft.artifactType) ?? 0) + 1);

    return {
      idea_id: ideaId,
      organization_id: organizationId,
      artifact_type: draft.artifactType,
      status: "draft" as VentureArtifactStatus,
      version: previousVersion + 1,
      title: draft.title,
      body: draft.body,
      source: draft.source,
      status_note: "제작 전달 묶음에서 자동 생성한 초안입니다.",
    };
  });

  const existingTaskTitles = new Set(existingTasks.map((task) => task.title.trim().toLowerCase()));
  const taskRows = implementationTaskDrafts
    .filter((task) => !existingTaskTitles.has(task.title.trim().toLowerCase()))
    .map((task, index) => ({
      idea_id: ideaId,
      organization_id: organizationId,
      source_artifact_id: sourceArtifactId,
      title: task.title,
      task_type: task.task_type,
      priority: task.priority,
      status: "todo" as ImplementationTaskStatus,
      owner_role: task.owner_role,
      acceptance_criteria: task.acceptance_criteria,
      evidence: "",
      sort_order: existingTasks.length + index,
    }));

  return {
    artifactRows,
    missingRuns,
    taskRows,
  };
}

export function buildDevelopmentAutopilotRunbookTelemetryProperties(runCount: number) {
  return {
    run_count: runCount,
    missing_phase_count: runCount,
  };
}

export function buildDevelopmentAutopilotArtifactTelemetryProperties(artifactCount: number) {
  return {
    artifact_count: artifactCount,
    source: "ai_execution_package",
  };
}

export function buildDevelopmentAutopilotTaskTelemetryProperties({
  hasSourceArtifact,
  taskCount,
}: {
  hasSourceArtifact: boolean;
  taskCount: number;
}) {
  return {
    task_count: taskCount,
    source_artifact: hasSourceArtifact ? "yes" : "no",
  };
}
