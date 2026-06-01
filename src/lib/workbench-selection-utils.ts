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
  return runs
    .filter((run) => run.idea_id === ideaId)
    .sort((a, b) => (phaseOrder.get(a.phase) ?? 99) - (phaseOrder.get(b.phase) ?? 99));
}

export function getSelectedArtifactRecords(artifacts: VentureArtifact[], ideaId: string | null | undefined) {
  return artifacts
    .filter((artifact) => artifact.idea_id === ideaId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getSelectedImplementationTasks(tasks: ImplementationTask[], ideaId: string | null | undefined) {
  return tasks
    .filter((task) => task.idea_id === ideaId)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
        a.title.localeCompare(b.title, "ko-KR"),
    );
}

export function getSelectedTelemetryEvents(events: TelemetryEvent[], ideaId: string | null | undefined) {
  return events
    .filter((event) => event.idea_id === ideaId)
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
}
