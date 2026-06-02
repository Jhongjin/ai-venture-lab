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

export type ExecutionPackageArtifactSaveDraft = {
  artifactType: "dev_runbook" | "launch_checklist" | "research_note";
  body: string;
  source: "agent_run_package" | "development_kickoff" | "prd_readiness_handoff" | "workbench";
  title: string;
};

export function buildExecutionPackageArtifactSaveDrafts({
  agentRunPackageDraft,
  developmentKickoffDraft,
  ideaName,
  launchChecklistDraft,
  prdHandoffDraft,
}: {
  agentRunPackageDraft: string;
  developmentKickoffDraft: string;
  ideaName: string | null;
  launchChecklistDraft: string;
  prdHandoffDraft: string;
}) {
  return {
    agentRunPackageSaveDraft:
      ideaName && agentRunPackageDraft
        ? {
            artifactType: "dev_runbook" as const,
            body: agentRunPackageDraft,
            source: "agent_run_package" as const,
            title: `${ideaName} 제작 패키지`,
          }
        : null,
    developmentKickoffSaveDraft:
      ideaName && developmentKickoffDraft
        ? {
            artifactType: "dev_runbook" as const,
            body: developmentKickoffDraft,
            source: "development_kickoff" as const,
            title: `${ideaName} 제작 시작 요약`,
          }
        : null,
    launchChecklistSaveDraft:
      ideaName && launchChecklistDraft
        ? {
            artifactType: "launch_checklist" as const,
            body: launchChecklistDraft,
            source: "workbench" as const,
            title: `${ideaName} 출시 체크리스트`,
          }
        : null,
    prdHandoffSaveDraft:
      ideaName && prdHandoffDraft
        ? {
            artifactType: "research_note" as const,
            body: prdHandoffDraft,
            source: "prd_readiness_handoff" as const,
            title: `${ideaName} 기획서 전환 전달 내용`,
          }
        : null,
  };
}

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
