export type ValidationPackageSaveJob = {
  artifactType: "idea_brief" | "research_note";
  body: string;
  done: boolean;
  source: "workbench" | "validation_sprint" | "validation_summary";
  title: string;
};

export type ValidationPackageStatusRow = {
  label: string;
  passed: boolean;
};
export type ValidationPackageSaveButtonState = {
  disabled: boolean;
  label: string;
};

export function buildValidationPackageStatusRows({
  hasIdeaBriefArtifact,
  hasResearchBriefArtifact,
  hasValidationSprintArtifact,
  hasValidationSummaryArtifact,
}: {
  hasIdeaBriefArtifact: boolean;
  hasResearchBriefArtifact: boolean;
  hasValidationSprintArtifact: boolean;
  hasValidationSummaryArtifact: boolean;
}): ValidationPackageStatusRow[] {
  return [
    { label: "아이디어 요약", passed: hasIdeaBriefArtifact },
    { label: "조사 요약", passed: hasResearchBriefArtifact },
    { label: "7일 검증 계획", passed: hasValidationSprintArtifact },
    { label: "검증 완료 요약", passed: hasValidationSummaryArtifact },
  ];
}

export function buildValidationPackageSaveJob({
  artifactType,
  body,
  done,
  ideaName,
  source,
  titleSuffix,
}: {
  artifactType: ValidationPackageSaveJob["artifactType"];
  body: string;
  done: boolean;
  ideaName: string;
  source: ValidationPackageSaveJob["source"];
  titleSuffix: string;
}): ValidationPackageSaveJob {
  return {
    artifactType,
    body,
    done,
    source,
    title: `${ideaName} ${titleSuffix}`,
  };
}

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
    buildValidationPackageSaveJob({
      artifactType: "idea_brief",
      body: ideaBrief,
      done: hasIdeaBriefArtifact,
      ideaName,
      source: "workbench",
      titleSuffix: "아이디어 요약",
    }),
    buildValidationPackageSaveJob({
      artifactType: "research_note",
      body: researchBriefDraft,
      done: hasResearchBriefArtifact,
      ideaName,
      source: "workbench",
      titleSuffix: "조사 요약",
    }),
    buildValidationPackageSaveJob({
      artifactType: "research_note",
      body: validationSprintDraft,
      done: hasValidationSprintArtifact,
      ideaName,
      source: "validation_sprint",
      titleSuffix: "7일 검증 계획",
    }),
    buildValidationPackageSaveJob({
      artifactType: "research_note",
      body: validationSummaryDraft,
      done: hasValidationSummaryArtifact,
      ideaName,
      source: "validation_summary",
      titleSuffix: "검증 완료 요약",
    }),
  ];
}

export function getPendingValidationPackageSaveJobs(jobs: ReadonlyArray<ValidationPackageSaveJob>) {
  return jobs.filter((job) => !job.done);
}

export function buildValidationPackageSaveButtonState({
  hasUser,
  isBusy,
  isSavingValidationBundle,
  isValidationBundleSaved,
}: {
  hasUser: boolean;
  isBusy: boolean;
  isSavingValidationBundle: boolean;
  isValidationBundleSaved: boolean;
}): ValidationPackageSaveButtonState {
  return {
    disabled: isBusy || isSavingValidationBundle || !hasUser || isValidationBundleSaved,
    label: isSavingValidationBundle
      ? "저장 중"
      : isValidationBundleSaved
        ? "검증 자료 저장 완료"
        : "검증 자료 한 번에 저장",
  };
}

export function buildValidationSummaryDisabledNote({
  canSaveValidationSummary,
  hasValidationSummaryArtifact,
  requirements,
}: {
  canSaveValidationSummary: boolean;
  hasValidationSummaryArtifact: boolean;
  requirements: ValidationPackageStatusRow[];
}) {
  if (hasValidationSummaryArtifact) {
    return "검증 완료 요약이 저장되었습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다.";
  }

  if (canSaveValidationSummary) {
    return undefined;
  }

  const missingLabels = requirements.filter((requirement) => !requirement.passed).map((requirement) => requirement.label);

  return `검증 완료 요약은 ${missingLabels.join(", ")} 저장 후 활성화됩니다.`;
}
