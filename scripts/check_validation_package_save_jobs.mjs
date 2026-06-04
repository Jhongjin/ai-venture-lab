import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/validation-package-save-jobs.ts")).href;
const {
  buildValidationPackageSaveJob,
  buildValidationPackageSaveJobs,
  buildValidationPackageStatusRows,
  buildValidationSummaryDisabledNote,
  getPendingValidationPackageSaveJobs,
} = await import(moduleUrl);

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

console.log("Validation package save jobs smoke passed.");
