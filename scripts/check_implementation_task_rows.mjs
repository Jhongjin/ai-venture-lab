import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-rows.ts")).href;
const { buildImplementationTaskInsertRows, getMissingImplementationTaskDrafts } = await import(moduleUrl);

const drafts = [
  {
    acceptance_criteria: "Lock scope",
    owner_role: "product-builder",
    priority: "high",
    task_type: "planning",
    title: "기획서와 첫 제작 범위 잠금",
  },
  {
    acceptance_criteria: "Build first screen",
    owner_role: "frontend-builder",
    priority: "high",
    task_type: "frontend",
    title: "핵심 입력/저장/조회 화면 구현",
  },
  {
    acceptance_criteria: "Smoke production",
    owner_role: "release-manager",
    priority: "medium",
    task_type: "deploy",
    title: "Vercel Preview/Production 스모크와 롤백 기록",
  },
];

const missingDrafts = getMissingImplementationTaskDrafts({
  drafts,
  existingTasks: [
    { title: " 기획서와 첫 제작 범위 잠금 " },
    { title: "이미 저장된 별도 작업" },
  ],
});

assert.deepEqual(
  missingDrafts.map((draft) => draft.title),
  ["핵심 입력/저장/조회 화면 구현", "Vercel Preview/Production 스모크와 롤백 기록"],
);

const rows = buildImplementationTaskInsertRows({
  drafts: missingDrafts,
  existingTaskCount: 3,
  ideaId: "idea-1",
  organizationId: "org-1",
  sourceArtifactId: "artifact-1",
});

assert.deepEqual(
  rows.map((row) => [row.title, row.status, row.sort_order, row.idea_id, row.organization_id, row.source_artifact_id]),
  [
    ["핵심 입력/저장/조회 화면 구현", "todo", 3, "idea-1", "org-1", "artifact-1"],
    ["Vercel Preview/Production 스모크와 롤백 기록", "todo", 4, "idea-1", "org-1", "artifact-1"],
  ],
);
assert.equal(rows[0].evidence, "");
assert.equal(rows[0].owner_role, "frontend-builder");
assert.equal(rows[1].priority, "medium");

console.log("Implementation task rows smoke passed.");
