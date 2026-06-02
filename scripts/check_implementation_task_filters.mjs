import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const {
  buildImplementationFilterSummary,
  buildImplementationOwnerFilterLabels,
  buildImplementationOwnerOptions,
  buildImplementationTaskAutoRefreshMessage,
  buildImplementationTaskManualRefreshMessage,
  buildImplementationTaskRefreshLoginRequiredMessage,
  buildImplementationTaskReviewState,
  buildImplementationTaskRefreshSummary,
  filterImplementationTasks,
  formatImplementationTaskRefreshTime,
  getOpenImplementationTasksForAction,
  resolveImplementationOwnerFilter,
  selectAgentRunPackageTasks,
} = await import(moduleUrl);

assert.equal(buildImplementationTaskRefreshLoginRequiredMessage(), "작업 상태를 새로고침하려면 먼저 로그인하세요.");
assert.equal(buildImplementationTaskAutoRefreshMessage(), "Venture Lab에 저장된 작업 상태를 자동 확인 중입니다...");
assert.equal(buildImplementationTaskManualRefreshMessage(), "Venture Lab에 저장된 작업 상태를 불러오는 중입니다...");
const refreshDate = new Date("2026-06-01T09:08:07+09:00");
assert.equal(
  formatImplementationTaskRefreshTime(refreshDate),
  new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(refreshDate),
);

function task({ evidence = "", id, ownerRole, status, taskType }) {
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
    priority: "medium",
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
    evidence: "commit abc pnpm typecheck 허용 차단 RLS with check",
    id: "task-backend",
    ownerRole: "backend",
    status: "doing",
    taskType: "backend",
  }),
  task({
    evidence: "commit abc pnpm smoke 실패 재현",
    id: "task-qa",
    ownerRole: "",
    status: "blocked",
    taskType: "qa",
  }),
  task({
    evidence: "commit abc pnpm 화면 모바일",
    id: "task-design",
    ownerRole: "frontend",
    status: "done",
    taskType: "design",
  }),
];

const ownerOptions = buildImplementationOwnerOptions(tasks);
assert.deepEqual(ownerOptions, ["all", "backend", "frontend", "owner 미정"]);
assert.deepEqual(buildImplementationOwnerFilterLabels(ownerOptions), {
  all: "전체 담당",
  backend: "backend",
  frontend: "frontend",
  "owner 미정": "owner 미정",
});
assert.equal(resolveImplementationOwnerFilter(ownerOptions, "backend"), "backend");
assert.equal(resolveImplementationOwnerFilter(ownerOptions, "stale-owner"), "all");
assert.equal(
  buildImplementationFilterSummary({
    activeOwnerFilter: "frontend",
    evidenceFilter: "complete",
    ownerFilterLabels: buildImplementationOwnerFilterLabels(ownerOptions),
    statusFilter: "doing",
  }),
  "상태: 진행 중 / 담당: frontend / 증거: 근거 채워짐",
);

assert.deepEqual(
  filterImplementationTasks({
    evidenceByTaskId: {},
    evidenceFilter: "all",
    ownerFilter: "all",
    statusFilter: "doing",
    tasks,
  }).map((item) => item.id),
  ["task-backend"],
);

assert.deepEqual(
  filterImplementationTasks({
    evidenceByTaskId: {},
    evidenceFilter: "all",
    ownerFilter: "owner 미정",
    statusFilter: "all",
    tasks,
  }).map((item) => item.id),
  ["task-qa"],
);

assert.deepEqual(
  filterImplementationTasks({
    evidenceByTaskId: {},
    evidenceFilter: "missing",
    ownerFilter: "all",
    statusFilter: "all",
    tasks,
  }).map((item) => item.id),
  ["task-frontend"],
);

assert.deepEqual(
  filterImplementationTasks({
    evidenceByTaskId: {
      "task-frontend": "commit abc pnpm smoke 저장 로딩",
    },
    evidenceFilter: "complete",
    ownerFilter: "frontend",
    statusFilter: "all",
    tasks,
  }).map((item) => item.id),
  ["task-frontend", "task-design"],
);

assert.deepEqual(
  getOpenImplementationTasksForAction(tasks).map((item) => item.id),
  ["task-qa", "task-backend", "task-frontend"],
);
assert.deepEqual(
  selectAgentRunPackageTasks([tasks[1], tasks[3]], getOpenImplementationTasksForAction(tasks)).map((item) => item.id),
  ["task-backend"],
);
assert.deepEqual(
  selectAgentRunPackageTasks([tasks[3]], getOpenImplementationTasksForAction(tasks)).map((item) => item.id),
  ["task-qa", "task-backend", "task-frontend"],
);

const refreshSummary = buildImplementationTaskRefreshSummary(tasks);
assert.equal(refreshSummary.totalCount, 4);
assert.equal(refreshSummary.doneCount, 1);
assert.equal(refreshSummary.nextTask?.id, "task-qa");
assert.equal(
  refreshSummary.message,
  "작업 상태 4개를 확인했습니다. 완료 1/4. 다음 작업은 qa task입니다.",
);

const allDoneSummary = buildImplementationTaskRefreshSummary([
  task({ id: "task-done", ownerRole: "qa", status: "done", taskType: "qa" }),
]);
assert.equal(allDoneSummary.doneCount, 1);
assert.equal(allDoneSummary.nextTask, null);
assert.equal(allDoneSummary.message, "작업 상태 1개를 확인했습니다. 완료 1/1. 모든 작업이 완료 상태입니다.");

const emptySummary = buildImplementationTaskRefreshSummary([]);
assert.equal(emptySummary.doneCount, 0);
assert.equal(emptySummary.nextTask, null);
assert.equal(emptySummary.message, "작업 상태 0개를 확인했습니다. 완료 0/0.");

const reviewState = buildImplementationTaskReviewState({
  evidenceByTaskId: {
    "task-frontend": "commit abc pnpm smoke 저장 로딩",
  },
  evidenceFilter: "complete",
  ownerFilter: "frontend",
  statusFilter: "all",
  tasks,
});
assert.deepEqual(reviewState.implementationOwnerOptions, ["all", "backend", "frontend", "owner 미정"]);
assert.equal(reviewState.activeImplementationOwnerFilter, "frontend");
assert.equal(reviewState.implementationFilterSummary, "상태: 전체 상태 / 담당: frontend / 증거: 근거 채워짐");
assert.deepEqual(reviewState.filteredImplementationTasks.map((item) => item.id), ["task-frontend", "task-design"]);
assert.deepEqual(reviewState.visibleImplementationStatuses, ["todo", "doing", "blocked", "done"]);
assert.deepEqual(
  reviewState.implementationTaskBoardColumns.map((column) => [column.status, column.taskSummaries.length]),
  [
    ["todo", 1],
    ["doing", 0],
    ["blocked", 0],
    ["done", 1],
  ],
);
assert.equal(reviewState.implementationEvidenceIssues.some((summary) => summary.task.id === "task-frontend"), false);
assert.deepEqual(reviewState.blockedImplementationSummaries.map((summary) => summary.task.id), ["task-qa"]);

console.log("Implementation task filters smoke passed.");
