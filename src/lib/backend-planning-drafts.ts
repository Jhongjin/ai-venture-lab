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
