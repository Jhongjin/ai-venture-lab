import { buildAppBlueprintMarkdown } from "@/lib/app-blueprint-markdown";
import { buildDesignBriefMarkdown } from "@/lib/design-brief-markdown";
import { buildDesignGenerationPromptMarkdown } from "@/lib/design-generation-prompt-markdown";
import { buildMvpScaffoldManifestMarkdown } from "@/lib/mvp-scaffold-manifest-markdown";
import { buildTechSpecMarkdown } from "@/lib/tech-spec-markdown";
import type { BackendCandidateScore } from "@/lib/backend-planning";
import type { Experiment, Idea, ImplementationTask, OrchestrationRun, Risk } from "@/lib/venture-data";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";

export type DesignArchitectureDraftState = {
  appBlueprintDraft: string;
  designBriefDraft: string;
  designGenerationPromptDraft: string;
  scaffoldManifestDraft: string;
  techSpecDraft: string;
};

export type DesignArchitectureArtifactSaveDraft = {
  artifactType: "dev_runbook" | "tech_spec";
  body: string;
  source: "app_blueprint" | "scaffold_manifest";
  title: string;
};

const emptyDesignArchitectureDraftState: DesignArchitectureDraftState = {
  appBlueprintDraft: "",
  designBriefDraft: "",
  designGenerationPromptDraft: "",
  scaffoldManifestDraft: "",
  techSpecDraft: "",
};

export function buildDesignArchitectureArtifactSaveDrafts({
  appBlueprintDraft,
  ideaName,
  scaffoldManifestDraft,
}: {
  appBlueprintDraft: string;
  ideaName: string | null;
  scaffoldManifestDraft: string;
}) {
  return {
    appBlueprintSaveDraft:
      ideaName && appBlueprintDraft
        ? {
            artifactType: "tech_spec" as const,
            body: appBlueprintDraft,
            source: "app_blueprint" as const,
            title: `${ideaName} 앱 구조 청사진`,
          }
        : null,
    scaffoldManifestSaveDraft:
      ideaName && scaffoldManifestDraft
        ? {
            artifactType: "dev_runbook" as const,
            body: scaffoldManifestDraft,
            source: "scaffold_manifest" as const,
            title: `${ideaName} 첫 제작 시작 구조`,
          }
        : null,
  };
}

export function buildDesignArchitectureDraftState({
  backendCandidateScores,
  experiments,
  idea,
  implementationTasks,
  risks,
  runs,
  state,
}: {
  backendCandidateScores: BackendCandidateScore[];
  experiments: Experiment[];
  idea: Idea | null;
  implementationTasks: ImplementationTask[];
  risks: Risk[];
  runs: OrchestrationRun[];
  state: WorkbenchEditState | null;
}): DesignArchitectureDraftState {
  if (!idea || !state) {
    return emptyDesignArchitectureDraftState;
  }

  return {
    appBlueprintDraft: buildAppBlueprintMarkdown({
      idea,
      state,
      risks,
      experiments,
      implementationTasks,
      backendCandidateScores,
    }),
    designBriefDraft: buildDesignBriefMarkdown({
      idea,
      state,
      runs,
    }),
    designGenerationPromptDraft: buildDesignGenerationPromptMarkdown({
      idea,
      state,
      risks,
      experiments,
      backendCandidateScores,
    }),
    scaffoldManifestDraft: buildMvpScaffoldManifestMarkdown({
      idea,
      state,
      experiments,
      backendCandidateScores,
    }),
    techSpecDraft: buildTechSpecMarkdown({
      idea,
      state,
      experiments,
      runs,
    }),
  };
}
