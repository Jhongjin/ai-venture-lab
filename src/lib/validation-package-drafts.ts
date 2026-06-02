import { buildEvidenceNoteMarkdown, buildExperimentResultMarkdown } from "@/lib/validation-evidence-markdown";
import {
  buildIdeaBriefMarkdown,
  buildResearchBriefMarkdown,
  buildValidationSprintMarkdown,
  buildValidationSummaryMarkdown,
} from "@/lib/validation-package-markdown";
import type { DecisionStatus } from "@/lib/supabase/types";
import type { Decision, Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import type { EvidenceDraft, ExperimentResultDraft } from "@/lib/workbench-draft-defaults";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";

export type ValidationPackageDraftState = {
  evidenceNoteDraft: string;
  experimentResultNoteDraft: string;
  ideaBrief: string;
  researchBriefDraft: string;
  selectedExperimentForResult: Experiment | null;
  validationSprintDraft: string;
  validationSummaryDraft: string;
};

const emptyValidationPackageDraftState: ValidationPackageDraftState = {
  evidenceNoteDraft: "",
  experimentResultNoteDraft: "",
  ideaBrief: "",
  researchBriefDraft: "",
  selectedExperimentForResult: null,
  validationSprintDraft: "",
  validationSummaryDraft: "",
};

export function buildValidationPackageDraftState({
  artifacts,
  decisions,
  evidenceDraft,
  experiments,
  experimentResultDraft,
  idea,
  recommendation,
  risks,
  runs,
  score,
  state,
}: {
  artifacts: VentureArtifact[];
  decisions: Decision[];
  evidenceDraft: EvidenceDraft;
  experiments: Experiment[];
  experimentResultDraft: ExperimentResultDraft;
  idea: Idea | null;
  recommendation: DecisionStatus;
  risks: Risk[];
  runs: OrchestrationRun[];
  score: number;
  state: WorkbenchEditState | null;
}): ValidationPackageDraftState {
  if (!idea || !state) {
    return emptyValidationPackageDraftState;
  }

  const selectedExperimentForResult =
    experiments.find((experiment) => experiment.id === experimentResultDraft.experiment_id) ?? experiments[0] ?? null;

  return {
    evidenceNoteDraft: buildEvidenceNoteMarkdown({
      idea,
      state,
      draft: evidenceDraft,
    }),
    experimentResultNoteDraft: selectedExperimentForResult
      ? buildExperimentResultMarkdown({
          idea,
          state,
          experiment: selectedExperimentForResult,
          draft: {
            ...experimentResultDraft,
            experiment_id: selectedExperimentForResult.id,
          },
        })
      : "",
    ideaBrief: buildIdeaBriefMarkdown({
      idea,
      state,
      score,
      recommendation,
      risks,
    }),
    researchBriefDraft: buildResearchBriefMarkdown({
      idea,
      state,
      score,
      recommendation,
      risks,
      experiments,
      runs,
    }),
    selectedExperimentForResult,
    validationSprintDraft: buildValidationSprintMarkdown({
      idea,
      state,
      score,
      recommendation,
      risks,
      experiments,
    }),
    validationSummaryDraft: buildValidationSummaryMarkdown({
      idea,
      state,
      score,
      recommendation,
      risks,
      experiments,
      artifacts,
      decisions,
    }),
  };
}
