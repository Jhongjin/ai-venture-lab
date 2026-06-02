import { buildAgentRunPackageMarkdown } from "@/lib/agent-run-package-markdown";
import type { BuildDeliveryMode, ExternalBuildToolProfile } from "@/lib/build-delivery";
import { buildDevelopmentKickoffMarkdown } from "@/lib/development-kickoff-markdown";
import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import { selectAgentRunPackageTasks } from "@/lib/implementation-task-metadata";
import { buildLaunchChecklistMarkdown } from "@/lib/launch-checklist-report";
import { buildPrdHandoffMarkdown } from "@/lib/prd-markdown";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { ValidationEvidenceCoach } from "@/lib/validation-planning";
import type {
  Decision,
  Experiment,
  Idea,
  ImplementationTask,
  OrchestrationRun,
  Risk,
  VentureArtifact,
} from "@/lib/venture-data";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";

type ExecutionPackageGateCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type ExecutionPackageDraftState = {
  agentRunPackageDraft: string;
  agentRunPackageTasks: ImplementationTask[];
  developmentKickoffDraft: string;
  launchChecklistDraft: string;
  prdHandoffDraft: string;
};

export function buildExecutionPackageDraftState({
  artifacts,
  buildDeliveryMode,
  buildReadinessChecks,
  decisions,
  experiments,
  externalBuildTool,
  filteredImplementationTasks,
  filterSummary,
  idea,
  implementationTasks,
  implementationTaskDrafts,
  nextImplementationTask,
  nextPrdBlocker,
  openImplementationTasks,
  prdReadinessChecks,
  prdReadinessScore,
  risks,
  runs,
  score,
  scoreRecommendation,
  state,
  validationEvidenceCoach,
}: {
  artifacts: VentureArtifact[];
  buildDeliveryMode: BuildDeliveryMode;
  buildReadinessChecks: ExecutionPackageGateCheck[];
  decisions: Decision[];
  experiments: Experiment[];
  externalBuildTool: ExternalBuildToolProfile;
  filteredImplementationTasks: ImplementationTask[];
  filterSummary: string;
  idea: Idea | null;
  implementationTasks: ImplementationTask[];
  implementationTaskDrafts: ImplementationTaskDraft[];
  nextImplementationTask: ImplementationTask | null;
  nextPrdBlocker: ExecutionPackageGateCheck | null;
  openImplementationTasks: ImplementationTask[];
  prdReadinessChecks: ExecutionPackageGateCheck[];
  prdReadinessScore: number;
  risks: Risk[];
  runs: OrchestrationRun[];
  score: number;
  scoreRecommendation: DecisionStatus;
  state: WorkbenchEditState | null;
  validationEvidenceCoach: ValidationEvidenceCoach | null;
}): ExecutionPackageDraftState {
  const agentRunPackageTasks = selectAgentRunPackageTasks(filteredImplementationTasks, openImplementationTasks);

  if (!idea || !state) {
    return {
      agentRunPackageDraft: "",
      agentRunPackageTasks,
      developmentKickoffDraft: "",
      launchChecklistDraft: "",
      prdHandoffDraft: "",
    };
  }

  return {
    agentRunPackageTasks,
    prdHandoffDraft: buildPrdHandoffMarkdown({
      idea,
      state,
      score,
      recommendation: scoreRecommendation,
      prdReadinessScore,
      prdReadinessChecks,
      validationEvidenceCoach,
      risks,
      experiments,
      decisions,
      nextPrdBlocker,
    }),
    developmentKickoffDraft: buildDevelopmentKickoffMarkdown({
      idea,
      state,
      readinessChecks: buildReadinessChecks,
      taskDrafts: implementationTaskDrafts,
      risks,
      experiments,
      artifacts,
    }),
    agentRunPackageDraft: buildAgentRunPackageMarkdown({
      idea,
      state,
      artifacts,
      tasks: agentRunPackageTasks,
      nextTask: nextImplementationTask,
      risks,
      experiments,
      readinessChecks: buildReadinessChecks,
      filterSummary,
      buildDeliveryMode,
      externalBuildTool,
    }),
    launchChecklistDraft: buildLaunchChecklistMarkdown({
      idea,
      state,
      risks,
      experiments,
      runs,
      artifacts,
      implementationTasks,
    }),
  };
}
