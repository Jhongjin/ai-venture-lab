import { buildBackendDecisionMarkdown, buildBackendExecutionPlanMarkdown } from "@/lib/backend-decision-markdown";
import { buildBackendExecutionPlanSummaryRows } from "@/lib/backend-execution-plan-rows";
import {
  buildBackendCandidateScores,
  buildBackendExecutionPlan,
  type BackendCandidateScore,
  type BackendExecutionPlan,
} from "@/lib/backend-planning";
import { buildFirstBuildBridge, type FirstBuildBridge } from "@/lib/first-build-bridge";
import type { Experiment, Idea, Risk } from "@/lib/venture-data";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";
import type { BackendExecutionPlanSummaryRow } from "@/lib/backend-execution-plan-rows";

export type BackendPlanningDraftState = {
  backendCandidateScores: BackendCandidateScore[];
  backendDecisionDraft: string;
  backendExecutionPlan: BackendExecutionPlan | null;
  backendExecutionPlanDraft: string;
  backendExecutionPlanSummaryRows: BackendExecutionPlanSummaryRow[];
  firstBuildBridge: FirstBuildBridge | null;
};

export type BackendPlanningArtifactSaveDraft = {
  artifactType: "backend_decision";
  body: string;
  source: "backend_execution_checklist" | "development_process";
  title: string;
};

export type BackendPlanningArtifactSaveControlState = {
  disabled: boolean;
  label: string;
};

export type BackendPlanningArtifactSaveControlStates = {
  backendDecision: BackendPlanningArtifactSaveControlState;
  backendExecutionPlan: BackendPlanningArtifactSaveControlState;
};

export function buildBackendPlanningArtifactSaveDrafts({
  backendDecisionDraft,
  backendExecutionPlanDraft,
  ideaName,
}: {
  backendDecisionDraft: string;
  backendExecutionPlanDraft: string;
  ideaName: string | null;
}) {
  return {
    backendDecisionSaveDraft: ideaName
      ? {
          artifactType: "backend_decision" as const,
          body: backendDecisionDraft,
          source: "development_process" as const,
          title: `${ideaName} 백엔드 결정`,
        }
      : null,
    backendExecutionPlanSaveDraft:
      ideaName && backendExecutionPlanDraft
        ? {
            artifactType: "backend_decision" as const,
            body: backendExecutionPlanDraft,
            source: "backend_execution_checklist" as const,
            title: `${ideaName} 백엔드 실행 체크리스트`,
          }
        : null,
  };
}

export function buildBackendPlanningArtifactSaveControlStates({
  backendDecisionSaveDraft,
  backendExecutionPlanSaveDraft,
  hasUser,
  isBusy,
}: {
  backendDecisionSaveDraft: BackendPlanningArtifactSaveDraft | null;
  backendExecutionPlanSaveDraft: BackendPlanningArtifactSaveDraft | null;
  hasUser: boolean;
  isBusy: boolean;
}): BackendPlanningArtifactSaveControlStates {
  return {
    backendDecision: {
      disabled: isBusy || !hasUser || !backendDecisionSaveDraft,
      label: "결정 저장",
    },
    backendExecutionPlan: {
      disabled: isBusy || !hasUser || !backendExecutionPlanSaveDraft,
      label: "체크리스트 저장",
    },
  };
}

export function buildBackendPlanningDraftState({
  experiments,
  idea,
  risks,
  state,
}: {
  experiments: Experiment[];
  idea: Idea | null;
  risks: Risk[];
  state: WorkbenchEditState | null;
}): BackendPlanningDraftState {
  if (!idea || !state) {
    return {
      backendCandidateScores: [],
      backendDecisionDraft: "",
      backendExecutionPlan: null,
      backendExecutionPlanDraft: "",
      backendExecutionPlanSummaryRows: [],
      firstBuildBridge: null,
    };
  }

  const backendCandidateScores = buildBackendCandidateScores({
    idea,
    state,
    experiments,
    risks,
  });
  const backendExecutionPlan = backendCandidateScores[0]
    ? buildBackendExecutionPlan(backendCandidateScores[0])
    : null;

  return {
    backendCandidateScores,
    backendDecisionDraft: buildBackendDecisionMarkdown({
      idea,
      state,
      candidates: backendCandidateScores,
    }),
    backendExecutionPlan,
    backendExecutionPlanDraft: backendExecutionPlan
      ? buildBackendExecutionPlanMarkdown({
          idea,
          plan: backendExecutionPlan,
        })
      : "",
    backendExecutionPlanSummaryRows: backendExecutionPlan
      ? buildBackendExecutionPlanSummaryRows(backendExecutionPlan)
      : [],
    firstBuildBridge: buildFirstBuildBridge({
      idea,
      state,
      backend: backendCandidateScores[0] ?? null,
      experiments,
      risks,
    }),
  };
}
