import type { BuildDeliveryMode } from "@/lib/build-delivery";
import { implementationTaskTypeLabels } from "@/lib/implementation-task-metadata";
import type { ImplementationTask, OrchestrationRun } from "@/lib/venture-data";

export type Step6ExecutionBridgeDisplayState = {
  finalExecutionDetail: string;
  firstTaskAcceptanceCriteria: string | null;
  firstTaskTitle: string | null;
  firstTaskTypeLabel: string | null;
  hasGeneratedWorkOrder: boolean;
};

export function buildStep6ExecutionBridgeDisplayState({
  buildDeliveryMode,
  externalToolLabel,
  implementationTasks,
  runs,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
  implementationTasks: ReadonlyArray<ImplementationTask>;
  runs: ReadonlyArray<OrchestrationRun>;
}): Step6ExecutionBridgeDisplayState {
  const firstImplementationTask = implementationTasks[0] ?? null;

  return {
    finalExecutionDetail:
      buildDeliveryMode === "external_tool"
        ? `${externalToolLabel} 연결 파일과 START 파일`
        : "내부 개발 시작 자료와 완료 기준",
    firstTaskAcceptanceCriteria: firstImplementationTask?.acceptance_criteria ?? null,
    firstTaskTitle: firstImplementationTask?.title ?? null,
    firstTaskTypeLabel: firstImplementationTask
      ? implementationTaskTypeLabels[firstImplementationTask.task_type]
      : null,
    hasGeneratedWorkOrder: runs.length > 0 || implementationTasks.length > 0,
  };
}
