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

export type ValidationPackageArtifactSaveDraft = {
  artifactType: "idea_brief" | "research_note";
  body: string;
  source: "evidence_capture" | "experiment_result" | "validation_sprint" | "validation_summary" | "workbench";
  title: string;
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

function buildValidationPackageArtifactSaveDraft({
  artifactType,
  body,
  source,
  title,
}: {
  artifactType: ValidationPackageArtifactSaveDraft["artifactType"];
  body: string;
  source: ValidationPackageArtifactSaveDraft["source"];
  title: string;
}): ValidationPackageArtifactSaveDraft | null {
  const normalizedTitle = title.trim();

  if (!normalizedTitle || !body.trim()) {
    return null;
  }

  return {
    artifactType,
    body,
    source,
    title: normalizedTitle,
  };
}

export function buildValidationPackageArtifactSaveDrafts({
  ideaBrief,
  ideaName,
  researchBriefDraft,
  validationSprintDraft,
  validationSummaryDraft,
}: {
  ideaBrief: string;
  ideaName: string | null;
  researchBriefDraft: string;
  validationSprintDraft: string;
  validationSummaryDraft: string;
}) {
  const normalizedIdeaName = ideaName?.trim() ?? "";

  return {
    ideaBriefSaveDraft: buildValidationPackageArtifactSaveDraft({
      artifactType: "idea_brief",
      body: ideaBrief,
      source: "workbench",
      title: normalizedIdeaName ? `${normalizedIdeaName} 아이디어 요약` : "",
    }),
    researchBriefSaveDraft: buildValidationPackageArtifactSaveDraft({
      artifactType: "research_note",
      body: researchBriefDraft,
      source: "workbench",
      title: normalizedIdeaName ? `${normalizedIdeaName} 조사 요약` : "",
    }),
    validationSprintSaveDraft: buildValidationPackageArtifactSaveDraft({
      artifactType: "research_note",
      body: validationSprintDraft,
      source: "validation_sprint",
      title: normalizedIdeaName ? `${normalizedIdeaName} 7일 검증 계획` : "",
    }),
    validationSummarySaveDraft: buildValidationPackageArtifactSaveDraft({
      artifactType: "research_note",
      body: validationSummaryDraft,
      source: "validation_summary",
      title: normalizedIdeaName ? `${normalizedIdeaName} 검증 완료 요약` : "",
    }),
  };
}

export function buildValidationEvidenceArtifactSaveDraft({
  evidenceNoteDraft,
  evidenceTitle,
  ideaName,
}: {
  evidenceNoteDraft: string;
  evidenceTitle: string;
  ideaName: string | null;
}) {
  const normalizedEvidenceTitle = evidenceTitle.trim();
  const normalizedIdeaName = ideaName?.trim() ?? "";

  return buildValidationPackageArtifactSaveDraft({
    artifactType: "research_note",
    body: evidenceNoteDraft,
    source: "evidence_capture",
    title:
      normalizedIdeaName && normalizedEvidenceTitle
        ? `${normalizedIdeaName} 근거 - ${normalizedEvidenceTitle}`
        : "",
  });
}

export function buildExperimentResultArtifactSaveDraft({
  experimentName,
  experimentResultNoteDraft,
}: {
  experimentName: string | null;
  experimentResultNoteDraft: string;
}) {
  const normalizedExperimentName = experimentName?.trim() ?? "";

  return buildValidationPackageArtifactSaveDraft({
    artifactType: "research_note",
    body: experimentResultNoteDraft,
    source: "experiment_result",
    title: normalizedExperimentName ? `${normalizedExperimentName} 실험 결과` : "",
  });
}

export function buildValidationPackageSavedMessage(savedCount: number) {
  return savedCount > 0
    ? "검증 자료를 한 번에 저장했습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다."
    : "이미 필요한 검증 자료가 모두 저장되어 있습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다.";
}

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
