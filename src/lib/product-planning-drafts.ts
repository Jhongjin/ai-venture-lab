import { buildAppDevelopmentPlanMarkdown } from "@/lib/app-development-plan-markdown";
import { buildMvpSlicePlanMarkdown, buildMvpSpecMarkdown } from "@/lib/mvp-scope-markdown";
import { buildPrdMarkdown } from "@/lib/prd-markdown";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";

export type ProductPlanningDraftState = {
  developmentPlanDraft: string;
  mvpSlicePlanDraft: string;
  mvpSpecDraft: string;
  prdDraft: string;
};

const emptyProductPlanningDraftState: ProductPlanningDraftState = {
  developmentPlanDraft: "",
  mvpSlicePlanDraft: "",
  mvpSpecDraft: "",
  prdDraft: "",
};

export function buildProductPlanningDraftState({
  artifacts,
  experiments,
  idea,
  recommendation,
  risks,
  runs,
  score,
  state,
}: {
  artifacts: VentureArtifact[];
  experiments: Experiment[];
  idea: Idea | null;
  recommendation: DecisionStatus;
  risks: Risk[];
  runs: OrchestrationRun[];
  score: number;
  state: WorkbenchEditState | null;
}): ProductPlanningDraftState {
  if (!idea || !state) {
    return emptyProductPlanningDraftState;
  }

  return {
    developmentPlanDraft: buildAppDevelopmentPlanMarkdown({
      idea,
      state,
      experiments,
      runs,
      artifacts,
    }),
    mvpSlicePlanDraft: buildMvpSlicePlanMarkdown({
      idea,
      state,
      experiments,
      risks,
      artifacts,
    }),
    mvpSpecDraft: buildMvpSpecMarkdown({
      idea,
      state,
      experiments,
      runs,
    }),
    prdDraft: buildPrdMarkdown({
      idea,
      state,
      score,
      recommendation,
      risks,
      experiments,
      runs,
    }),
  };
}
