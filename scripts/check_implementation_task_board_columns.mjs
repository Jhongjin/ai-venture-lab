import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const { buildImplementationTaskBoardColumns, getImplementationTasksByStatus, getVisibleImplementationTaskStatuses } =
  await import(moduleUrl);

function task({ evidence = "", id, ownerRole = "", priority = "medium", status, taskType }) {
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
    sort_order: 1,
    status,
    task_type: taskType,
    title: `${taskType} task`,
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

const tasks = [
  task({ id: "task-frontend", ownerRole: "frontend", status: "todo", taskType: "frontend" }),
  task({
    evidence: "commit abc pnpm Preview Production",
    id: "task-deploy",
    priority: "high",
    status: "blocked",
    taskType: "deploy",
  }),
];

assert.deepEqual(getVisibleImplementationTaskStatuses("all"), ["todo", "doing", "blocked", "done"]);
assert.deepEqual(getVisibleImplementationTaskStatuses("blocked"), ["blocked"]);
assert.deepEqual(
  getImplementationTasksByStatus(tasks, "todo").map((item) => item.id),
  ["task-frontend"],
);
assert.deepEqual(getImplementationTasksByStatus(tasks, "doing"), []);

const columns = buildImplementationTaskBoardColumns({
  evidenceByTaskId: {
    "task-frontend": "commit abc pnpm smoke 저장 로딩",
  },
  statuses: getVisibleImplementationTaskStatuses("all"),
  tasks,
});

assert.deepEqual(
  columns.map((column) => column.status),
  ["todo", "doing", "blocked", "done"],
);
assert.equal(columns.find((column) => column.status === "doing").taskSummaries.length, 0);

const todoSummary = columns.find((column) => column.status === "todo").taskSummaries[0];
assert.equal(todoSummary.task.id, "task-frontend");
assert.equal(todoSummary.evidence, "commit abc pnpm smoke 저장 로딩");
assert.equal(todoSummary.passedEvidenceCount, todoSummary.evidenceChecklist.length);
assert.deepEqual(todoSummary.missingEvidenceLabels, []);
assert.equal(todoSummary.blockedHint, null);

const blockedSummary = columns.find((column) => column.status === "blocked").taskSummaries[0];
assert.equal(blockedSummary.task.id, "task-deploy");
assert.equal(blockedSummary.blockedHint.ownerRole, "release-manager");
assert.deepEqual(blockedSummary.missingEvidenceLabels, ["Vercel 로그", "롤백 기준"]);

console.log("Implementation task board columns smoke passed.");
