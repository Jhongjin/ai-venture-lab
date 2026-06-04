import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/validation-package-save-jobs.ts")).href;
const {
  buildValidationPackageHeaderState,
  buildValidationPackagePanelTabStates,
  buildValidationPackageSaveJob,
  buildValidationPackageSaveJobs,
  buildValidationPackageSaveButtonState,
  buildValidationPackageStatusRows,
  buildValidationSummaryDisabledNote,
  getPendingValidationPackageSaveJobs,
} = await import(moduleUrl);
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

const statusRows = buildValidationPackageStatusRows({
  hasIdeaBriefArtifact: true,
  hasResearchBriefArtifact: false,
  hasValidationSprintArtifact: false,
  hasValidationSummaryArtifact: true,
});

assert.deepEqual(
  statusRows.map((row) => [row.label, row.passed]),
  [
    ["아이디어 요약", true],
    ["조사 요약", false],
    ["7일 검증 계획", false],
    ["검증 완료 요약", true],
  ],
);
assert.equal(
  buildValidationSummaryDisabledNote({
    canSaveValidationSummary: false,
    hasValidationSummaryArtifact: false,
    requirements: statusRows,
  }),
  "검증 완료 요약은 조사 요약, 7일 검증 계획 저장 후 활성화됩니다.",
);
assert.equal(
  buildValidationSummaryDisabledNote({
    canSaveValidationSummary: true,
    hasValidationSummaryArtifact: false,
    requirements: statusRows,
  }),
  undefined,
);
assert.equal(
  buildValidationSummaryDisabledNote({
    canSaveValidationSummary: true,
    hasValidationSummaryArtifact: true,
    requirements: statusRows,
  }),
  "검증 완료 요약이 저장되었습니다. 하단 다음 단계 버튼으로 제작 패키지에 들어갈 수 있습니다.",
);
assert.deepEqual(
  buildValidationPackageSaveJob({
    artifactType: "research_note",
    body: "# sprint",
    done: false,
    ideaName: "AI Venture Lab",
    source: "validation_sprint",
    titleSuffix: "7일 검증 계획",
  }),
  {
    artifactType: "research_note",
    body: "# sprint",
    done: false,
    source: "validation_sprint",
    title: "AI Venture Lab 7일 검증 계획",
  },
);

const jobs = buildValidationPackageSaveJobs({
  hasIdeaBriefArtifact: true,
  hasResearchBriefArtifact: false,
  hasValidationSprintArtifact: false,
  hasValidationSummaryArtifact: true,
  ideaBrief: "# idea",
  ideaName: "AI Venture Lab",
  researchBriefDraft: "# research",
  validationSprintDraft: "# sprint",
  validationSummaryDraft: "# summary",
});

assert.deepEqual(
  jobs.map((job) => [job.artifactType, job.title, job.source, job.body, job.done]),
  [
    ["idea_brief", "AI Venture Lab 아이디어 요약", "workbench", "# idea", true],
    ["research_note", "AI Venture Lab 조사 요약", "workbench", "# research", false],
    ["research_note", "AI Venture Lab 7일 검증 계획", "validation_sprint", "# sprint", false],
    ["research_note", "AI Venture Lab 검증 완료 요약", "validation_summary", "# summary", true],
  ],
);

assert.deepEqual(
  getPendingValidationPackageSaveJobs(jobs).map((job) => job.source),
  ["workbench", "validation_sprint"],
);
assert.deepEqual(getPendingValidationPackageSaveJobs(jobs).map((job) => job.done), [false, false]);
assert.deepEqual(
  buildValidationPackageSaveButtonState({
    hasUser: true,
    isBusy: false,
    isSavingValidationBundle: false,
    isValidationBundleSaved: false,
  }),
  { disabled: false, label: "검증 자료 한 번에 저장" },
);
assert.deepEqual(
  buildValidationPackageSaveButtonState({
    hasUser: true,
    isBusy: false,
    isSavingValidationBundle: true,
    isValidationBundleSaved: false,
  }),
  { disabled: true, label: "저장 중" },
);
assert.deepEqual(
  buildValidationPackageSaveButtonState({
    hasUser: true,
    isBusy: false,
    isSavingValidationBundle: false,
    isValidationBundleSaved: true,
  }),
  { disabled: true, label: "검증 자료 저장 완료" },
);
assert.equal(
  buildValidationPackageSaveButtonState({
    hasUser: false,
    isBusy: false,
    isSavingValidationBundle: false,
    isValidationBundleSaved: false,
  }).disabled,
  true,
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isBusy || isSavingValidationBundle || !user || isValidationBundleSaved}"),
  "IdeaWorkbench should use the shared validation package save button state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("검증 자료 한 번에 저장"),
  "IdeaWorkbench should keep validation package save button labels in the shared helper.",
);
assert.deepEqual(
  buildValidationPackageHeaderState({
    isGuided: true,
    panelDescription: "개별 패널 설명",
  }),
  {
    description: "AI가 아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 한 번에 저장합니다.",
    title: "검증 자료 저장",
  },
);
assert.deepEqual(
  buildValidationPackageHeaderState({
    isGuided: false,
    panelDescription: "개별 패널 설명",
  }),
  {
    description: "개별 패널 설명",
    title: "검증 자료 저장",
  },
);
assert.ok(
  !ideaWorkbenchSource.includes("AI가 아이디어 요약, 조사 요약"),
  "IdeaWorkbench should keep validation package guided header copy in the shared helper.",
);
assert.deepEqual(buildValidationPackagePanelTabStates({ activePanel: "validation", hasValidationSummaryArtifact: false }), [
  {
    disabled: false,
    isActive: true,
    label: "검증 자료 저장",
    panel: "validation",
    stepLabel: "STEP 4-1",
  },
  {
    disabled: true,
    isActive: false,
    label: "검증 요약 저장 후 열림",
    panel: "product",
    stepLabel: "STEP 4-2",
  },
]);
assert.deepEqual(buildValidationPackagePanelTabStates({ activePanel: "product", hasValidationSummaryArtifact: true }), [
  {
    disabled: false,
    isActive: false,
    label: "검증 자료 저장",
    panel: "validation",
    stepLabel: "STEP 4-1",
  },
  {
    disabled: false,
    isActive: true,
    label: "기획서 만들기",
    panel: "product",
    stepLabel: "STEP 4-2",
  },
]);
assert.ok(
  !ideaWorkbenchSource.includes("STEP 4-1"),
  "IdeaWorkbench should render validation package tabs from shared state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("검증 요약 저장 후 열림"),
  "IdeaWorkbench should keep validation package tab labels in the shared helper.",
);

console.log("Validation package save jobs smoke passed.");
