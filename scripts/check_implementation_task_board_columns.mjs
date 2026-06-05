import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const { buildImplementationTaskBoardColumns, getImplementationTasksByStatus, getVisibleImplementationTaskStatuses } =
  await import(moduleUrl);

const ideaWorkbenchSource = fs.readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

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
assert.equal(columns.find((column) => column.status === "doing").taskCount, 0);
assert.equal(columns.find((column) => column.status === "doing").taskCountLabel, "0개");
assert.equal(columns.find((column) => column.status === "doing").statusLabel, "진행 중");
assert.equal(columns.find((column) => column.status === "doing").statusToneClass, "avl-pill avl-pill-info");
assert.equal(columns.find((column) => column.status === "doing").showTaskCards, false);
assert.equal(columns.find((column) => column.status === "doing").emptyMessage, "아직 진행 중 상태의 태스크가 없습니다.");

const todoSummary = columns.find((column) => column.status === "todo").taskSummaries[0];
assert.equal(todoSummary.task.id, "task-frontend");
assert.equal(todoSummary.evidence, "commit abc pnpm smoke 저장 로딩");
assert.equal(todoSummary.passedEvidenceCount, todoSummary.evidenceChecklist.length);
assert.deepEqual(todoSummary.missingEvidenceLabels, []);
assert.equal(todoSummary.blockedHint, null);
assert.equal(todoSummary.blockedActionText, "");
assert.equal(todoSummary.showBlockedHint, false);
assert.equal(todoSummary.evidenceQualityLabel, "증거 품질 4/4");
assert.equal(todoSummary.evidenceQualityMessage, "필수 증거 힌트가 모두 포함되어 있습니다.");
assert.equal(todoSummary.evidenceQualityToneClass, "border-emerald-100 bg-emerald-50 text-emerald-900");
assert.equal(todoSummary.ownerRoleLabel, "frontend");
assert.equal(todoSummary.priorityLabel, "보통");
assert.equal(todoSummary.priorityToneClass, "avl-pill avl-pill-warning");
assert.equal(todoSummary.taskTypeLabel, "프론트");

const blockedSummary = columns.find((column) => column.status === "blocked").taskSummaries[0];
assert.equal(blockedSummary.task.id, "task-deploy");
assert.equal(blockedSummary.blockedHint.ownerRole, "release-manager");
assert.equal(blockedSummary.showBlockedHint, true);
assert.equal(blockedSummary.blockedActionText, "Preview/Production 배포 상태, 환경변수, Vercel 로그를 먼저 확인하세요.");
assert.deepEqual(blockedSummary.missingEvidenceLabels, ["Vercel 로그", "롤백 기준"]);
assert.equal(blockedSummary.evidenceQualityLabel, "증거 품질 3/5");
assert.equal(blockedSummary.evidenceQualityMessage, "보완 필요: Vercel 로그, 롤백 기준");
assert.equal(blockedSummary.evidenceQualityToneClass, "border-amber-100 bg-amber-50 text-amber-900");
assert.equal(blockedSummary.ownerRoleLabel, "owner 미정");
assert.equal(blockedSummary.priorityLabel, "높음");
assert.equal(blockedSummary.priorityToneClass, "avl-pill avl-pill-danger");
assert.equal(blockedSummary.taskTypeLabel, "배포");

assert.ok(
  ideaWorkbenchSource.includes("showTaskCards ?"),
  "IdeaWorkbench should render implementation board cards from shared column display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("taskCountLabel"),
  "IdeaWorkbench should render implementation board counts from shared column display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("evidenceQualityMessage"),
  "IdeaWorkbench should render evidence quality copy from shared card summary state.",
);
assert.ok(
  ideaWorkbenchSource.includes("taskTypeLabel"),
  "IdeaWorkbench should render implementation task type labels from shared card summary state.",
);
assert.ok(
  ideaWorkbenchSource.includes("ownerRoleLabel"),
  "IdeaWorkbench should render implementation task owner labels from shared card summary state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("taskSummaries.length > 0"),
  "IdeaWorkbench should not decide implementation board column visibility with inline task summary counts.",
);
assert.ok(
  !ideaWorkbenchSource.includes("implementationTaskStatusTone[status]"),
  "IdeaWorkbench should not resolve implementation board status tone inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes("{taskCount}개"),
  "IdeaWorkbench should not build implementation board count labels inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes("missingEvidenceLabels.length === 0"),
  "IdeaWorkbench should not decide implementation evidence quality copy with inline missing-label counts.",
);
assert.ok(
  !ideaWorkbenchSource.includes("implementationTaskTypeLabels[task.task_type]"),
  "IdeaWorkbench should not resolve implementation board task type labels inline.",
);

console.log("Implementation task board columns smoke passed.");
