import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-tasks.ts")).href;
const {
  WORKBENCH_TASK_IDS,
  buildWorkbenchTaskNavigationState,
  buildWorkbenchTaskSummaries,
  getVisibleWorkbenchTaskSummaries,
  getWorkbenchIdeaProgress,
  isWorkbenchTask,
} = await import(moduleUrl);

assert.equal(WORKBENCH_TASK_IDS.length, 11);
assert.equal(isWorkbenchTask("development"), true);
assert.equal(isWorkbenchTask("unknown"), false);

assert.deepEqual(getWorkbenchIdeaProgress({ decision: "kill", stage: "launch" }), {
  label: "삭제됨",
  task: "archive",
});
assert.deepEqual(getWorkbenchIdeaProgress({ decision: "ship", stage: "prd" }), {
  label: "STEP 4 검증 자료 저장",
  task: "artifacts",
});
assert.deepEqual(getWorkbenchIdeaProgress({ decision: "ship", stage: "qa" }), {
  label: "STEP 5 제작 패키지",
  task: "development",
});
assert.deepEqual(getWorkbenchIdeaProgress({ decision: "ship", stage: "launch" }), {
  label: "STEP 7 최종 실행",
  task: "launch",
});
assert.deepEqual(getWorkbenchIdeaProgress({ decision: "pending", stage: "intake" }), {
  label: "STEP 2 사업성 평가",
  task: "score",
});

const tasks = buildWorkbenchTaskSummaries({
  activeVisibleIdeaCount: 3,
  artifactCount: 5,
  canEnterLaunch: false,
  currentScore: 77,
  decisionCount: 2,
  discardedVisibleIdeaCount: 1,
  doneRunCount: 4,
  experimentCount: 1,
  hasDevelopmentProcessArtifact: true,
  implementationCompletedCount: 0,
  implementationTotalCount: 0,
  launchReadinessScore: 64,
  riskCount: 2,
  runCount: 5,
  telemetryEventCount: 0,
});

assert.equal(tasks.find((task) => task.id === "select")?.status, "3개");
assert.equal(tasks.find((task) => task.id === "archive")?.status, "1개");
assert.equal(tasks.find((task) => task.id === "score")?.status, "77점");
assert.equal(tasks.find((task) => task.id === "orchestration")?.status, "4/5");
assert.equal(tasks.find((task) => task.id === "development")?.status, "계획됨");
assert.equal(tasks.find((task) => task.id === "launch")?.status, "64%");
assert.equal(tasks.find((task) => task.id === "learning")?.status, "대기");

const inProgressTasks = buildWorkbenchTaskSummaries({
  activeVisibleIdeaCount: 1,
  artifactCount: 0,
  canEnterLaunch: true,
  currentScore: 0,
  decisionCount: 0,
  discardedVisibleIdeaCount: 0,
  doneRunCount: 0,
  experimentCount: 0,
  hasDevelopmentProcessArtifact: false,
  implementationCompletedCount: 2,
  implementationTotalCount: 3,
  launchReadinessScore: 90,
  riskCount: 0,
  runCount: 0,
  telemetryEventCount: 6,
});

assert.equal(inProgressTasks.find((task) => task.id === "development")?.status, "2/3");
assert.equal(inProgressTasks.find((task) => task.id === "launch")?.status, "준비 완료");
assert.equal(inProgressTasks.find((task) => task.id === "learning")?.status, "6개");

const guidedTasks = getVisibleWorkbenchTaskSummaries(tasks, "guided");
assert.deepEqual(
  guidedTasks.map((task) => task.id),
  ["select", "score", "experiment", "orchestration", "artifacts", "development", "launch", "learning"],
);
assert.equal(getVisibleWorkbenchTaskSummaries(tasks, "full").length, tasks.length);

const navigationState = buildWorkbenchTaskNavigationState({
  activeVisibleIdeaCount: 3,
  artifactCount: 5,
  canEnterLaunch: false,
  currentScore: 77,
  decisionCount: 2,
  discardedVisibleIdeaCount: 1,
  doneRunCount: 4,
  experienceMode: "guided",
  experimentCount: 1,
  hasDevelopmentProcessArtifact: true,
  implementationCompletedCount: 0,
  implementationTotalCount: 0,
  launchReadinessScore: 64,
  riskCount: 2,
  runCount: 5,
  telemetryEventCount: 0,
});
assert.equal(navigationState.workbenchTasks.length, WORKBENCH_TASK_IDS.length);
assert.deepEqual(
  navigationState.visibleWorkbenchTasks.map((task) => task.id),
  ["select", "score", "experiment", "orchestration", "artifacts", "development", "launch", "learning"],
);

console.log("Workbench tasks smoke passed.");
