export type ValidationPackageSaveJob = {
  artifactType: "idea_brief" | "research_note";
  body: string;
  done: boolean;
  source: "workbench" | "validation_sprint" | "validation_summary";
  title: string;
};

export function buildValidationPackageSaveJobs({
  hasIdeaBriefArtifact,
  hasResearchBriefArtifact,
  hasValidationSprintArtifact,
  hasValidationSummaryArtifact,
  ideaBrief,
  ideaName,
  researchBriefDraft,
  validationSprintDraft,
  validationSummaryDraft,
}: {
  hasIdeaBriefArtifact: boolean;
  hasResearchBriefArtifact: boolean;
  hasValidationSprintArtifact: boolean;
  hasValidationSummaryArtifact: boolean;
  ideaBrief: string;
  ideaName: string;
  researchBriefDraft: string;
  validationSprintDraft: string;
  validationSummaryDraft: string;
}): ValidationPackageSaveJob[] {
  return [
    {
      artifactType: "idea_brief",
      body: ideaBrief,
      done: hasIdeaBriefArtifact,
      source: "workbench",
      title: `${ideaName} 아이디어 요약`,
    },
    {
      artifactType: "research_note",
      body: researchBriefDraft,
      done: hasResearchBriefArtifact,
      source: "workbench",
      title: `${ideaName} 조사 요약`,
    },
    {
      artifactType: "research_note",
      body: validationSprintDraft,
      done: hasValidationSprintArtifact,
      source: "validation_sprint",
      title: `${ideaName} 7일 검증 계획`,
    },
    {
      artifactType: "research_note",
      body: validationSummaryDraft,
      done: hasValidationSummaryArtifact,
      source: "validation_summary",
      title: `${ideaName} 검증 완료 요약`,
    },
  ];
}
