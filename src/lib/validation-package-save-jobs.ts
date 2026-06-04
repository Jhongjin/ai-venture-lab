import type { ArtifactPanel } from "./artifact-review-queue";

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
export type ValidationPackageStatusDisplayRow = ValidationPackageStatusRow & {
  statusClassName: string;
  statusLabel: string;
};
export type ValidationPackageSaveButtonState = {
  disabled: boolean;
  label: string;
};
export type ValidationPackageDraftSaveControlState = {
  disabled: boolean;
  disabledNote?: string;
  label: string;
};
export type ValidationPackageHeaderState = {
  description: string;
  title: string;
};
export type ValidationPackagePanelTabState = {
  disabled: boolean;
  isActive: boolean;
  label: string;
  panel: "validation" | "product";
  stepLabel: string;
};
export type ValidationPackagePanelClassNameInput = {
  activePanel: ArtifactPanel;
  hasValidationSummaryArtifact?: boolean;
  isArtifactsTask: boolean;
  isGuided: boolean;
  panel: ArtifactPanel;
  requiresValidationSummary?: boolean;
  visibleClassName?: string;
};
export type ValidationPackageProductReadinessBlocker = {
  detail: string;
  label: string;
} | null;
export type ValidationPackageProductReadinessNotice = {
  detail: string;
  toneClassName: string;
  title: string;
};
export type ValidationPackageReadinessCheck = {
  detail: string;
  label: string;
  passed: boolean;
};
export type ValidationPackageReadinessCheckDisplayRow = ValidationPackageReadinessCheck & {
  iconClassName: string;
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

export function buildValidationPackageStatusDisplayRows(
  rows: ReadonlyArray<ValidationPackageStatusRow>,
): ValidationPackageStatusDisplayRow[] {
  return rows.map((row) => ({
    ...row,
    statusClassName: row.passed ? "text-emerald-700" : "text-slate-700",
    statusLabel: row.passed ? "저장 완료" : "저장 필요",
  }));
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

export function buildValidationPackageDraftSaveControlState({
  defaultLabel,
  draftBody,
  extraDisabled = false,
  hasArtifact,
  hasUser,
  isBusy,
  savedDisabledNote,
}: {
  defaultLabel: string;
  draftBody: unknown;
  extraDisabled?: boolean;
  hasArtifact: boolean;
  hasUser: boolean;
  isBusy: boolean;
  savedDisabledNote?: string;
}): ValidationPackageDraftSaveControlState {
  return {
    disabled: isBusy || !hasUser || extraDisabled || hasArtifact || !draftBody,
    disabledNote: hasArtifact ? savedDisabledNote : undefined,
    label: hasArtifact ? "저장 완료" : defaultLabel,
  };
}

export function buildValidationPackageHeaderState({
  isGuided,
  panelDescription,
}: {
  isGuided: boolean;
  panelDescription: string;
}): ValidationPackageHeaderState {
  return {
    description: isGuided
      ? "AI가 아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 한 번에 저장합니다."
      : panelDescription,
    title: "검증 자료 저장",
  };
}

export function buildValidationPackagePanelTabStates({
  activePanel,
  hasValidationSummaryArtifact,
}: {
  activePanel: ValidationPackagePanelTabState["panel"] | "library";
  hasValidationSummaryArtifact: boolean;
}): ValidationPackagePanelTabState[] {
  return [
    {
      disabled: false,
      isActive: activePanel === "validation",
      label: "검증 자료 저장",
      panel: "validation",
      stepLabel: "STEP 4-1",
    },
    {
      disabled: !hasValidationSummaryArtifact,
      isActive: activePanel === "product",
      label: hasValidationSummaryArtifact ? "기획서 만들기" : "검증 요약 저장 후 열림",
      panel: "product",
      stepLabel: "STEP 4-2",
    },
  ];
}

export function buildValidationPackagePanelClassName({
  activePanel,
  hasValidationSummaryArtifact = true,
  isArtifactsTask,
  isGuided,
  panel,
  requiresValidationSummary = false,
  visibleClassName = "",
}: ValidationPackagePanelClassNameInput): string {
  const isVisiblePanel =
    panel === "validation" ? isGuided || activePanel === "validation" : !isGuided && activePanel === panel;
  const hasRequiredSummary = !requiresValidationSummary || hasValidationSummaryArtifact;

  return isArtifactsTask && isVisiblePanel && hasRequiredSummary ? visibleClassName : "hidden";
}

export function buildValidationPackageProductReadinessNotice(
  nextPrdBlocker: ValidationPackageProductReadinessBlocker,
): ValidationPackageProductReadinessNotice {
  if (nextPrdBlocker) {
    return {
      detail: nextPrdBlocker.detail,
      title: `다음 보완 항목: ${nextPrdBlocker.label}`,
      toneClassName: "border-amber-200 bg-amber-50 text-amber-950",
    };
  }

  return {
    detail: "검증 완료 요약을 기준으로 제품 범위를 좁혀 저장하세요.",
    title: "기획서로 넘어갈 준비가 되었습니다.",
    toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };
}

export function buildValidationPackageReadinessCheckDisplayRows(
  checks: ReadonlyArray<ValidationPackageReadinessCheck>,
): ValidationPackageReadinessCheckDisplayRow[] {
  return checks.map((check) => ({
    ...check,
    iconClassName: check.passed ? "mt-0.5 shrink-0 text-emerald-600" : "mt-0.5 shrink-0 text-slate-400",
  }));
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
