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

export type ProductPlanningArtifactSaveDraft = {
  artifactType: "mvp_spec" | "prd";
  body: string;
  source: "mvp_slice_plan" | "workbench";
  title: string;
};

const emptyProductPlanningDraftState: ProductPlanningDraftState = {
  developmentPlanDraft: "",
  mvpSlicePlanDraft: "",
  mvpSpecDraft: "",
  prdDraft: "",
};

export function buildProductPlanningArtifactSaveDrafts({
  ideaName,
  mvpSlicePlanDraft,
  mvpSpecDraft,
  prdDraft,
}: {
  ideaName: string | null;
  mvpSlicePlanDraft: string;
  mvpSpecDraft: string;
  prdDraft: string;
}) {
  return {
    mvpSlicePlanSaveDraft:
      ideaName && mvpSlicePlanDraft
        ? {
            artifactType: "mvp_spec" as const,
            body: mvpSlicePlanDraft,
            source: "mvp_slice_plan" as const,
            title: `${ideaName} 첫 제작 범위 플랜`,
          }
        : null,
    mvpSpecSaveDraft:
      ideaName && mvpSpecDraft
        ? {
            artifactType: "mvp_spec" as const,
            body: mvpSpecDraft,
            source: "workbench" as const,
            title: `${ideaName} 첫 제작 범위`,
          }
        : null,
    prdSaveDraft:
      ideaName && prdDraft
        ? {
            artifactType: "prd" as const,
            body: prdDraft,
            source: "workbench" as const,
            title: `${ideaName} 제품 기획서`,
          }
        : null,
  };
}

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
