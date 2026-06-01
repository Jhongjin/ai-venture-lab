import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/extracted-idea-artifact-rows.ts")).href;
const { buildExtractedIdeaArtifactRows } = await import(moduleUrl);

const rows = buildExtractedIdeaArtifactRows({
  artifactBodies: {
    ideaBriefBody: "# idea",
    researchBriefBody: "# research",
    validationSprintBody: "# sprint",
  },
  candidateName: "AI Venture Lab",
  ideaId: "idea-1",
  organizationId: "org-1",
});

assert.deepEqual(
  rows.map((row) => [row.artifact_type, row.source, row.title, row.body, row.status, row.version]),
  [
    ["idea_brief", "extracted_idea_package", "AI Venture Lab 아이디어 요약", "# idea", "draft", 1],
    ["research_note", "extracted_research_brief", "AI Venture Lab 조사 요약", "# research", "draft", 1],
    ["research_note", "validation_sprint", "AI Venture Lab 7일 검증 계획", "# sprint", "draft", 1],
  ],
);
assert.deepEqual(
  rows.map((row) => [row.idea_id, row.organization_id, row.status_note]),
  [
    ["idea-1", "org-1", "메모에서 찾은 아이디어를 검증 자료로 정리함"],
    ["idea-1", "org-1", "메모에서 찾은 아이디어를 검증 자료로 정리함"],
    ["idea-1", "org-1", "메모에서 찾은 아이디어를 검증 자료로 정리함"],
  ],
);

console.log("Extracted idea artifact rows smoke passed.");
