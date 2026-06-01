import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/validation-package-save-jobs.ts")).href;
const { buildValidationPackageSaveJobs } = await import(moduleUrl);

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
  jobs.filter((job) => !job.done).map((job) => job.source),
  ["workbench", "validation_sprint"],
);

console.log("Validation package save jobs smoke passed.");
