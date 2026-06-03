import type {
  Decision,
  Experiment,
  ImplementationTask,
  OrchestrationRun,
  Risk,
  TelemetryEvent,
  VentureArtifact,
} from "@/lib/venture-data";
import { phaseOrder } from "@/lib/workbench-labels";

export function getSelectedRisks(risks: Risk[], ideaId: string | null | undefined) {
  return risks.filter((risk) => risk.idea_id === ideaId || risk.idea_id === null);
}

export function getSelectedIdeaRisks(risks: Risk[], ideaId: string | null | undefined) {
  return risks.filter((risk) => risk.idea_id === ideaId);
}

export function getOpenIdeaRisks(risks: Risk[]) {
  return risks.filter((risk) => risk.status !== "closed");
}

export function getSelectedDecisions(decisions: Decision[], ideaId: string | null | undefined, limit = 4) {
  return decisions.filter((entry) => entry.idea_id === ideaId).slice(0, limit);
}

export function getSelectedExperiments(experiments: Experiment[], ideaId: string | null | undefined, limit = 5) {
  return experiments.filter((experiment) => experiment.idea_id === ideaId).slice(0, limit);
}

export function getSelectedRuns(runs: OrchestrationRun[], ideaId: string | null | undefined) {
  return runs.filter((run) => run.idea_id === ideaId).sort(compareWorkbenchRunsByPhaseOrder);
}

export function compareWorkbenchRunsByPhaseOrder(a: OrchestrationRun, b: OrchestrationRun) {
  return (phaseOrder.get(a.phase) ?? 99) - (phaseOrder.get(b.phase) ?? 99);
}

export function getSelectedArtifactRecords(artifacts: VentureArtifact[], ideaId: string | null | undefined) {
  return artifacts.filter((artifact) => artifact.idea_id === ideaId).sort(compareWorkbenchArtifactsByCreatedAtDesc);
}

export function getWorkbenchArtifactCreatedAtTime(artifact: Pick<VentureArtifact, "created_at">) {
  return new Date(artifact.created_at).getTime();
}

export function compareWorkbenchArtifactsByCreatedAtDesc(a: VentureArtifact, b: VentureArtifact) {
  return getWorkbenchArtifactCreatedAtTime(b) - getWorkbenchArtifactCreatedAtTime(a);
}

export function getSelectedImplementationTasks(tasks: ImplementationTask[], ideaId: string | null | undefined) {
  return tasks.filter((task) => task.idea_id === ideaId).sort(compareWorkbenchImplementationTasksByOrder);
}

export function getWorkbenchImplementationTaskCreatedAtTime(task: Pick<ImplementationTask, "created_at">) {
  return new Date(task.created_at).getTime();
}

export function compareWorkbenchImplementationTasksByCreatedAtAsc(a: ImplementationTask, b: ImplementationTask) {
  return getWorkbenchImplementationTaskCreatedAtTime(a) - getWorkbenchImplementationTaskCreatedAtTime(b);
}

export function compareWorkbenchImplementationTasksByOrder(a: ImplementationTask, b: ImplementationTask) {
  return (
    a.sort_order - b.sort_order ||
    compareWorkbenchImplementationTasksByCreatedAtAsc(a, b) ||
    a.title.localeCompare(b.title, "ko-KR")
  );
}

export function getSelectedTelemetryEvents(events: TelemetryEvent[], ideaId: string | null | undefined) {
  return events.filter((event) => event.idea_id === ideaId).sort(compareWorkbenchTelemetryEventsByOccurredAtDesc);
}

export function getWorkbenchTelemetryEventOccurredAtTime(event: Pick<TelemetryEvent, "occurred_at">) {
  return new Date(event.occurred_at).getTime();
}

export function compareWorkbenchTelemetryEventsByOccurredAtDesc(a: TelemetryEvent, b: TelemetryEvent) {
  return getWorkbenchTelemetryEventOccurredAtTime(b) - getWorkbenchTelemetryEventOccurredAtTime(a);
}

export function getSelectedWorkbenchCollections({
  artifacts,
  decisions,
  experiments,
  implementationTasks,
  ideaId,
  risks,
  runs,
  telemetryEvents,
}: {
  artifacts: VentureArtifact[];
  decisions: Decision[];
  experiments: Experiment[];
  implementationTasks: ImplementationTask[];
  ideaId: string | null | undefined;
  risks: Risk[];
  runs: OrchestrationRun[];
  telemetryEvents: TelemetryEvent[];
}) {
  const selectedIdeaRisks = getSelectedIdeaRisks(risks, ideaId);

  return {
    selectedRisks: getSelectedRisks(risks, ideaId),
    selectedIdeaRisks,
    openSelectedIdeaRisks: getOpenIdeaRisks(selectedIdeaRisks),
    selectedDecisions: getSelectedDecisions(decisions, ideaId),
    selectedExperiments: getSelectedExperiments(experiments, ideaId),
    selectedRuns: getSelectedRuns(runs, ideaId),
    selectedArtifactRecords: getSelectedArtifactRecords(artifacts, ideaId),
    selectedImplementationTasks: getSelectedImplementationTasks(implementationTasks, ideaId),
    selectedTelemetryEvents: getSelectedTelemetryEvents(telemetryEvents, ideaId),
  };
}
