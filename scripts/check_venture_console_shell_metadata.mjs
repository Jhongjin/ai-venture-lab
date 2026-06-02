import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/venture-console-shell-metadata.ts")).href;
const {
  buildVentureConsoleTaskStatuses,
  firstRunGuideSteps,
  getActiveConsoleTask,
  getActiveWorkbenchTask,
  getCurrentStepBlocker,
  getExecutiveFocus,
  getInitialShellTask,
  getNextTaskOptions,
  primaryShellTaskIds,
  primaryShellTaskSet,
  resolveVisibleShellTask,
  taskCanvasDetails,
  taskGuidance,
} = await import(moduleUrl);

const authenticatedStatus = {
  hasExtractedIdeas: false,
  hasIdeaSource: true,
  hasWorkspace: false,
  isAuthLoaded: true,
  isAuthenticated: true,
};

assert.deepEqual(primaryShellTaskIds, [
  "console:extract",
  "workbench:score",
  "workbench:experiment",
  "workbench:artifacts",
  "workbench:development",
  "workbench:orchestration",
  "workbench:launch",
  "workbench:learning",
]);
assert.equal(primaryShellTaskSet.has("workbench:launch"), true);
assert.equal(primaryShellTaskSet.has("console:idea"), false);

assert.deepEqual(
  firstRunGuideSteps.map((step) => step.title),
  ["메모만 넣기", "AI 정리 확인", "저장 후 다음 단계"],
);
assert.equal(taskGuidance["console:extract"].checklist.at(-1), "마음에 드는 한 건 저장");
assert.equal(taskGuidance["workbench:development"].checklist.includes("제작 패키지 저장"), true);
assert.match(taskCanvasDetails["console:extract"].checkpoint, /STEP 2/);
assert.match(taskCanvasDetails["workbench:learning"].deliverable, /작업 진행표/);

assert.equal(getInitialShellTask({}), "console:auth");
assert.equal(getInitialShellTask({ initialView: "ideas" }), "workbench:select");
assert.equal(getInitialShellTask({ initialView: "deleted" }), "workbench:archive");
assert.equal(getInitialShellTask({ initialTask: "launch", initialView: "ideas" }), "workbench:launch");

assert.equal(
  resolveVisibleShellTask({
    activeTask: "workbench:launch",
    consoleStatus: { ...authenticatedStatus, isAuthLoaded: false },
    ideaCount: 4,
  }),
  "console:auth",
);
assert.equal(
  resolveVisibleShellTask({
    activeTask: "console:auth",
    consoleStatus: authenticatedStatus,
    ideaCount: 0,
  }),
  "console:extract",
);
assert.equal(
  resolveVisibleShellTask({
    activeTask: "console:auth",
    consoleStatus: authenticatedStatus,
    ideaCount: 2,
  }),
  "workbench:score",
);
assert.equal(
  resolveVisibleShellTask({
    activeTask: "workbench:launch",
    consoleStatus: authenticatedStatus,
    ideaCount: 0,
  }),
  "console:extract",
);
assert.equal(getActiveConsoleTask("console:extract"), "extract");
assert.equal(getActiveConsoleTask("workbench:score"), "idea");
assert.equal(getActiveWorkbenchTask("workbench:launch"), "launch");
assert.equal(getActiveWorkbenchTask("console:extract"), "select");

assert.deepEqual(
  getNextTaskOptions({
    activeTask: "console:extract",
    canEnterArtifacts: false,
    canEnterDevelopment: false,
    canEnterExperiment: false,
    canEnterLaunch: false,
    canEnterOrchestration: false,
    ideaCount: 0,
  }),
  [],
);

const extractionNextTask = getNextTaskOptions({
  activeTask: "console:extract",
  canEnterArtifacts: false,
  canEnterDevelopment: false,
  canEnterExperiment: false,
  canEnterLaunch: false,
  canEnterOrchestration: false,
  ideaCount: 1,
});
assert.equal(extractionNextTask[0].id, "workbench:score");
assert.equal(extractionNextTask[0].disabled, false);

const scoreLockedNextTask = getNextTaskOptions({
  activeTask: "workbench:score",
  canEnterArtifacts: false,
  canEnterDevelopment: false,
  canEnterExperiment: false,
  canEnterLaunch: false,
  canEnterOrchestration: false,
  ideaCount: 1,
});
assert.equal(scoreLockedNextTask[0].id, "workbench:experiment");
assert.equal(scoreLockedNextTask[0].disabled, true);
assert.match(scoreLockedNextTask[0].hint, /저장하면 활성화/);

const launchNextTask = getNextTaskOptions({
  activeTask: "workbench:orchestration",
  canEnterArtifacts: true,
  canEnterDevelopment: true,
  canEnterExperiment: true,
  canEnterLaunch: true,
  canEnterOrchestration: true,
  ideaCount: 1,
});
assert.equal(launchNextTask[0].id, "workbench:launch");
assert.equal(launchNextTask[0].disabled, false);

assert.equal(
  getCurrentStepBlocker({
    activeTask: "console:idea",
    consoleStatus: authenticatedStatus,
    ideaCount: 0,
  }),
  "아이디어를 최소 한 건 저장해야 하단 다음 단계 버튼이 열립니다.",
);
assert.equal(
  getCurrentStepBlocker({
    activeTask: "console:workspace",
    consoleStatus: { ...authenticatedStatus, hasWorkspace: true },
    ideaCount: 1,
  }),
  "협업 공간을 연결했습니다. 다시 아이디어 도출로 돌아가 계속 진행하면 됩니다.",
);

const loginFocus = getExecutiveFocus({
  activeTask: "console:auth",
  artifactCount: 0,
  consoleStatus: { ...authenticatedStatus, isAuthenticated: false },
  decisionCount: 0,
  experimentCount: 0,
  ideaCount: 0,
  implementationTaskCount: 0,
  openRisks: 0,
  runCount: 0,
  source: "supabase",
  telemetryEventCount: 0,
});
assert.equal(loginFocus.targetTask, "console:auth");
assert.match(loginFocus.title, /로그인/);

const learningFocus = getExecutiveFocus({
  activeTask: "workbench:learning",
  artifactCount: 3,
  consoleStatus: authenticatedStatus,
  decisionCount: 1,
  experimentCount: 1,
  ideaCount: 1,
  implementationTaskCount: 4,
  openRisks: 0,
  runCount: 2,
  source: "seed",
  telemetryEventCount: 1,
});
assert.equal(learningFocus.targetTask, "workbench:learning");
assert.match(learningFocus.title, /성과 신호/);
assert.match(learningFocus.evidence, /샘플 데이터 기준/);

const blockedStatusContext = {
  artifactCount: 3,
  completedImplementationTaskCount: 0,
  discardedIdeaCount: 2,
  experimentCount: 1,
  ideaCount: 5,
  implementationTaskCount: 0,
  launchReadiness: {
    canEnterLaunch: false,
    launchReadinessScore: 65,
    nextLaunchBlockerLabel: "제작 패키지 저장",
  },
  openRisks: 4,
  runCount: 0,
  telemetryEventCount: 2,
};
const blockedStatuses = buildVentureConsoleTaskStatuses(blockedStatusContext);
assert.equal(blockedStatuses["workbench:select"], "5개");
assert.equal(blockedStatuses["workbench:risk"], "4개");
assert.equal(blockedStatuses["workbench:development"], "준비");
assert.equal(blockedStatuses["workbench:launch"], "제작 패키지 저장");
assert.equal(blockedStatuses["workbench:learning"], "2개");

const readyStatuses = buildVentureConsoleTaskStatuses({
  ...blockedStatusContext,
  artifactCount: 4,
  completedImplementationTaskCount: 3,
  discardedIdeaCount: 1,
  experimentCount: 2,
  ideaCount: 6,
  implementationTaskCount: 4,
  launchReadiness: {
    canEnterLaunch: true,
    launchReadinessScore: 100,
    nextLaunchBlockerLabel: null,
  },
  openRisks: 0,
  runCount: 2,
  telemetryEventCount: 0,
});
assert.equal(readyStatuses["workbench:archive"], "1개");
assert.equal(readyStatuses["workbench:development"], "4개");
assert.equal(readyStatuses["workbench:launch"], "준비 완료");
assert.equal(readyStatuses["workbench:learning"], "3/4");

console.log("Venture console shell metadata smoke passed.");
