import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-tasks.ts")).href;
const {
  WORKBENCH_TASK_IDS,
  buildWorkbenchShellDisplayState,
  buildWorkbenchTaskNavigationItemStates,
  buildWorkbenchTaskNavigationState,
  buildWorkbenchTaskPanelClassName,
  buildWorkbenchTaskPanelClassNames,
  buildWorkbenchTaskSummaries,
  getVisibleWorkbenchTaskSummaries,
  getWorkbenchIdeaProgress,
  isWorkbenchTask,
} = await import(moduleUrl);

const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

assert.equal(WORKBENCH_TASK_IDS.length, 11);
assert.equal(isWorkbenchTask("development"), true);
assert.equal(isWorkbenchTask("unknown"), false);
assert.ok(
  !ideaWorkbenchSource.includes('const isTaskLocked = task.id === "launch"'),
  "IdeaWorkbench should use the shared task navigation item helper.",
);
assert.ok(
  !ideaWorkbenchSource.includes("nextImplementationTaskStartControlState?."),
  "IdeaWorkbench should always get a concrete next-task start control state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("disabled={isLocked}"),
  "IdeaWorkbench should render task navigation disabled state from the shared item state.",
);
assert.ok(
  !/activeTask === "(?:select|archive|score|development|launch|learning|orchestration|risk|decision|experiment)"\s*\?\s*""\s*:\s*"hidden"/.test(
    ideaWorkbenchSource,
  ),
  "IdeaWorkbench should use the shared task panel class helper for direct active-task visibility.",
);
assert.ok(
  !ideaWorkbenchSource.includes('activeTask === "artifacts" ? "avl-card p-4" : "hidden"'),
  "IdeaWorkbench should use the shared task panel class helper for the artifacts panel.",
);
assert.ok(
  !ideaWorkbenchSource.includes("buildWorkbenchTaskPanelClassName({"),
  "IdeaWorkbench should receive the task panel class map from the shared task helper.",
);
assert.ok(
  ideaWorkbenchSource.includes("workbenchShellDisplayState.sectionClassName"),
  "IdeaWorkbench should render the shell grid class from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("workbenchShellDisplayState.showSidebarPanel"),
  "IdeaWorkbench should render the sidebar panel from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes('showSidebar ? "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]" : "grid gap-6"'),
  "IdeaWorkbench should not keep the old inline shell grid class branch.",
);
assert.ok(
  !ideaWorkbenchSource.includes("{showSidebar ? ("),
  "IdeaWorkbench should not keep the old inline sidebar visibility branch.",
);

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

const lockedTaskItems = buildWorkbenchTaskNavigationItemStates({
  activeTask: "score",
  canEnterLaunch: false,
  tasks,
});
const lockedLaunchItem = lockedTaskItems.find((item) => item.task.id === "launch");
assert.deepEqual(
  {
    descriptionLabel: lockedLaunchItem?.descriptionLabel,
    isActive: lockedLaunchItem?.isActive,
    isDisabled: lockedLaunchItem?.isDisabled,
    isLocked: lockedLaunchItem?.isLocked,
    statusLabel: lockedLaunchItem?.statusLabel,
    statusPillTone: lockedLaunchItem?.statusPillTone,
  },
  {
    descriptionLabel: "준비 완료 후 열립니다",
    isActive: false,
    isDisabled: true,
    isLocked: true,
    statusLabel: "잠김",
    statusPillTone: "avl-pill-warning",
  },
);
const activeLaunchItem = buildWorkbenchTaskNavigationItemStates({
  activeTask: "launch",
  canEnterLaunch: false,
  tasks,
}).find((item) => item.task.id === "launch");
assert.deepEqual(
  {
    isActive: activeLaunchItem?.isActive,
    isDisabled: activeLaunchItem?.isDisabled,
    isLocked: activeLaunchItem?.isLocked,
    statusLabel: activeLaunchItem?.statusLabel,
    statusPillTone: activeLaunchItem?.statusPillTone,
  },
  {
    isActive: true,
    isDisabled: false,
    isLocked: false,
    statusLabel: "64%",
    statusPillTone: "avl-pill-info",
  },
);
const readyLaunchItem = buildWorkbenchTaskNavigationItemStates({
  activeTask: "score",
  canEnterLaunch: true,
  tasks: inProgressTasks,
}).find((item) => item.task.id === "launch");
assert.deepEqual(
  {
    isDisabled: readyLaunchItem?.isDisabled,
    isLocked: readyLaunchItem?.isLocked,
    statusLabel: readyLaunchItem?.statusLabel,
    statusPillTone: readyLaunchItem?.statusPillTone,
  },
  {
    isDisabled: false,
    isLocked: false,
    statusLabel: "준비 완료",
    statusPillTone: "avl-pill-neutral",
  },
);
assert.equal(lockedTaskItems[0].stepNumber, 1);

assert.deepEqual(buildWorkbenchShellDisplayState({ showSidebar: true }), {
  sectionClassName: "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]",
  showSidebarPanel: true,
});
assert.deepEqual(buildWorkbenchShellDisplayState({ showSidebar: false }), {
  sectionClassName: "grid gap-6",
  showSidebarPanel: false,
});

assert.equal(
  buildWorkbenchTaskPanelClassName({
    activeTask: "development",
    targetTasks: ["development"],
    visibleClassName: "avl-card p-5",
  }),
  "avl-card p-5",
);
assert.equal(
  buildWorkbenchTaskPanelClassName({
    activeTask: "development",
    targetTasks: ["launch"],
    visibleClassName: "avl-card p-4",
  }),
  "hidden",
);
assert.equal(
  buildWorkbenchTaskPanelClassName({
    activeTask: "decision",
    targetTasks: ["risk", "decision"],
    visibleClassName: "grid gap-5",
  }),
  "grid gap-5",
);
assert.equal(
  buildWorkbenchTaskPanelClassName({
    activeTask: "select",
    hiddenClassName: "sr-only",
    targetTasks: ["archive"],
    visibleClassName: "grid gap-5",
  }),
  "sr-only",
);
const developmentPanelClassNames = buildWorkbenchTaskPanelClassNames({
  activeTask: "development",
});
assert.equal(developmentPanelClassNames.development, "avl-card p-5");
assert.equal(developmentPanelClassNames.select, "hidden");
assert.equal(developmentPanelClassNames.riskDecision, "hidden");

const decisionPanelClassNames = buildWorkbenchTaskPanelClassNames({
  activeTask: "decision",
});
assert.equal(decisionPanelClassNames.decision, "grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]");
assert.equal(decisionPanelClassNames.riskDecision, "grid gap-5");
assert.equal(decisionPanelClassNames.risk, "hidden");

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
