import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const {
  buildBlockedImplementationSummaries,
  buildImplementationEvidenceSummaries,
  compareBlockedImplementationSummaries,
  compareImplementationEvidenceSummaries,
  getBlockedImplementationSummaryPreview,
  getCompletedImplementationTasksWithEvidence,
  getImplementationEvidenceIssuePreview,
  getImplementationEvidenceIssues,
} = await import(moduleUrl);

function task({ evidence = "", id, ownerRole = "", priority = "medium", sortOrder = 1, status, taskType }) {
  return {
    acceptance_criteria: null,
    artifact_id: null,
    completed_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: null,
    dependencies: [],
    description: `${taskType} task`,
    evidence,
    id,
    idea_id: "idea-1",
    organization_id: null,
    owner_role: ownerRole,
    priority,
    sort_order: sortOrder,
    status,
    task_type: taskType,
    title: `${taskType} task`,
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

const tasks = [
  task({ id: "task-frontend", priority: "high", status: "todo", taskType: "frontend" }),
  task({
    evidence: "commit abc pnpm typecheck 허용 차단 RLS with check",
    id: "task-backend",
    status: "doing",
    taskType: "backend",
  }),
  task({
    evidence: "commit abc pnpm",
    id: "task-qa",
    priority: "low",
    sortOrder: 2,
    status: "blocked",
    taskType: "qa",
  }),
  task({
    evidence: "commit abc pnpm Preview Production",
    id: "task-deploy",
    priority: "high",
    status: "blocked",
    taskType: "deploy",
  }),
];

assert.deepEqual(
  getCompletedImplementationTasksWithEvidence([
    task({
      evidence: "commit abc pnpm smoke 저장 로딩",
      id: "task-done-with-evidence",
      status: "done",
      taskType: "frontend",
    }),
    task({ evidence: "commit abc pnpm", id: "task-todo-with-evidence", status: "todo", taskType: "qa" }),
    task({ evidence: "   ", id: "task-done-empty-evidence", status: "done", taskType: "design" }),
  ]).map((item) => item.id),
  ["task-done-with-evidence"],
);

const evidenceSummaries = buildImplementationEvidenceSummaries({ evidenceByTaskId: {}, tasks });
assert.deepEqual(
  evidenceSummaries.map((summary) => summary.task.id),
  ["task-frontend", "task-deploy", "task-qa", "task-backend"],
);
assert.deepEqual(evidenceSummaries[0].missing, ["커밋/PR", "검증 결과", "사용자 여정", "상태 UX"]);
assert.equal(evidenceSummaries[0].passedCount, 0);
assert.equal(evidenceSummaries[0].totalCount, 4);
assert.equal(evidenceSummaries.at(-1).passedCount, evidenceSummaries.at(-1).totalCount);
assert.equal(compareImplementationEvidenceSummaries(evidenceSummaries[0], evidenceSummaries[1]) < 0, true);
assert.equal(compareImplementationEvidenceSummaries(evidenceSummaries[1], evidenceSummaries[2]) < 0, true);

assert.deepEqual(
  getImplementationEvidenceIssues(evidenceSummaries).map((summary) => summary.task.id),
  ["task-frontend", "task-deploy", "task-qa"],
);
assert.deepEqual(
  getImplementationEvidenceIssuePreview(getImplementationEvidenceIssues(evidenceSummaries), 2).map(
    (summary) => summary.task.id,
  ),
  ["task-frontend", "task-deploy"],
);

const overriddenEvidenceSummaries = buildImplementationEvidenceSummaries({
  evidenceByTaskId: {
    "task-frontend": "commit abc pnpm smoke 저장 로딩",
  },
  tasks,
});
assert.equal(overriddenEvidenceSummaries.find((summary) => summary.task.id === "task-frontend").missing.length, 0);

const blockedSummaries = buildBlockedImplementationSummaries({ evidenceByTaskId: {}, tasks });
assert.deepEqual(
  blockedSummaries.map((summary) => summary.task.id),
  ["task-deploy", "task-qa"],
);
assert.equal(blockedSummaries[0].hint.ownerRole, "release-manager");
assert.deepEqual(blockedSummaries[0].missing, ["Vercel 로그", "롤백 기준"]);
assert.equal(blockedSummaries[1].hint.ownerRole, "qa-runner");
assert.deepEqual(blockedSummaries[1].missing, ["스모크 경로", "실패/회귀"]);
assert.equal(compareBlockedImplementationSummaries(blockedSummaries[0], blockedSummaries[1]) < 0, true);
assert.deepEqual(getBlockedImplementationSummaryPreview(blockedSummaries, 1).map((summary) => summary.task.id), [
  "task-deploy",
]);

console.log("Implementation task evidence summary smoke passed.");
