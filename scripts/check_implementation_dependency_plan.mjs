import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

function transpileModuleUrl(modulePath, replacements = []) {
  const absolutePath = path.join(process.cwd(), modulePath);
  let source = readFileSync(absolutePath, "utf8");
  for (const [from, to] of replacements) {
    source = source.replaceAll(from, to);
  }
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const implementationTaskMetadataUrl = pathToFileURL(
  path.join(process.cwd(), "src/lib/implementation-task-metadata.ts"),
).href;
const {
  blockedImplementationTaskDependencyMessage,
  buildImplementationDependencyPrerequisiteStatus,
  buildImplementationDependencyStatuses,
  buildImplementationPrerequisiteBlocker,
  buildNextImplementationTaskActionDetail,
  buildNextImplementationTaskDisplayState,
  getBlockedImplementationTaskDependencyBlockers,
  getCompletedImplementationTaskTypes,
  getImplementationDependencyStatusForTask,
  getImplementationDependencyStatusPreview,
  getImplementationTaskReadinessQueues,
  getImplementationTaskTypes,
  getOpenImplementationTaskPreview,
  getReadyImplementationDependencyStatuses,
  getWaitingImplementationDependencyStatuses,
  isImplementationDependencyStatusReady,
} = await import(implementationTaskMetadataUrl);
const workbenchLabelsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/workbench-labels.ts")).href;
const moduleUrl = transpileModuleUrl("src/lib/implementation-dependency-plan.ts", [
  ['from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationTaskMetadataUrl)};`],
  ['from "@/lib/workbench-labels";', `from ${JSON.stringify(workbenchLabelsUrl)};`],
]);
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

const {
  buildImplementationDependencyPlanActionControlStates,
  buildImplementationDependencyPlanArtifactSaveDraft,
  buildImplementationDependencyPlanDraft,
  buildImplementationDependencyPlanMarkdown,
} = await import(moduleUrl);

const timestamp = "2026-06-02T00:00:00.000Z";
const idea = {
  buyer: "운영팀",
  created_at: timestamp,
  created_by: "user-1",
  decision: "ship",
  differentiation: 4,
  frequency: 4,
  id: "idea-1",
  mvp_speed: 5,
  name: "AI Venture Lab",
  next_evidence: "외부 제작 도구에서 첫 태스크 실행",
  one_liner: "메모와 대화를 검증 패키지와 제작 실행 자료로 바꿉니다.",
  organization_id: "org-1",
  problem_intensity: 5,
  product_surface: "operator_console",
  reachability: 4,
  regulatory_risk: 1,
  risk_summary: "권한 경계 확인 필요",
  signal: "반복 검증과 제작 전달 자동화",
  stage: "prototype",
  target_user: "앱 아이디어를 반복 검증하는 창업자",
  updated_at: timestamp,
  willingness_to_pay: 4,
};
const state = {
  decision: idea.decision,
  stage: idea.stage,
};
const readyTask = {
  acceptance_criteria: "첫 화면에서 다음 제작 행동을 확인한다.",
  artifact_id: null,
  blocked_reason: null,
  completed_at: null,
  created_at: timestamp,
  created_by: "user-1",
  evidence: "",
  id: "task-1",
  idea_id: idea.id,
  organization_id: "org-1",
  owner_role: "prototype-builder",
  priority: "high",
  sort_order: 1,
  status: "todo",
  task_type: "frontend",
  title: "T-001 제작 패키지 리뷰 화면",
  updated_at: timestamp,
};
const doneTask = {
  ...readyTask,
  completed_at: timestamp,
  evidence: "commit abc123 / pnpm typecheck passed",
  id: "task-2",
  status: "done",
  task_type: "planning",
  title: "범위 잠금",
};
const designTodoTask = {
  ...readyTask,
  id: "task-design",
  status: "todo",
  task_type: "design",
  title: "화면 흐름 확정",
};
const blockedFrontendTask = {
  ...readyTask,
  id: "task-blocked-frontend",
  status: "blocked",
};
const taskTypes = getImplementationTaskTypes([readyTask, doneTask, designTodoTask]);
const completedTypes = getCompletedImplementationTaskTypes([readyTask, doneTask, designTodoTask]);
assert.equal(taskTypes.has("frontend"), true);
assert.equal(completedTypes.has("planning"), true);
assert.equal(completedTypes.has("frontend"), false);
assert.deepEqual(getOpenImplementationTaskPreview([readyTask, designTodoTask, blockedFrontendTask], 2).map((task) => task.id), [
  "task-1",
  "task-design",
]);
assert.equal(
  buildImplementationPrerequisiteBlocker({
    prerequisite: "design",
    taskTypes,
  }),
  "디자인 태스크 완료 필요",
);
assert.equal(
  buildImplementationPrerequisiteBlocker({
    prerequisite: "backend",
    taskTypes,
  }),
  "백엔드 태스크 생성 필요",
);
const prerequisiteStatus = buildImplementationDependencyPrerequisiteStatus({
  completedTypes,
  prerequisites: ["planning", "design", "backend"],
  taskTypes,
});
assert.deepEqual(prerequisiteStatus.completedPrerequisites, ["planning"]);
assert.deepEqual(prerequisiteStatus.missingPrerequisites, ["design", "backend"]);
assert.deepEqual(prerequisiteStatus.blockers, ["디자인 태스크 완료 필요", "백엔드 태스크 생성 필요"]);
assert.deepEqual(getBlockedImplementationTaskDependencyBlockers(blockedFrontendTask), [
  blockedImplementationTaskDependencyMessage,
]);
assert.deepEqual(getBlockedImplementationTaskDependencyBlockers(readyTask), []);
assert.equal(isImplementationDependencyStatusReady({ blockers: [], task: readyTask }), true);
assert.equal(
  isImplementationDependencyStatusReady({
    blockers: ["디자인 태스크 완료 필요"],
    task: readyTask,
  }),
  false,
);
assert.equal(isImplementationDependencyStatusReady({ blockers: [], task: doneTask }), false);
assert.equal(
  buildNextImplementationTaskActionDetail({
    dependencyStatus: null,
    task: blockedFrontendTask,
  }),
  "막힌 상태입니다. 먼저 막힌 이유와 해소 증거를 기록하세요.",
);
assert.equal(
  buildNextImplementationTaskActionDetail({
    dependencyStatus: null,
    task: { ...readyTask, status: "doing" },
  }),
  "이미 진행 중입니다. 완료 증거를 붙이고 완료로 이동하세요.",
);

const dependencyMetadataStatuses = buildImplementationDependencyStatuses([doneTask, designTodoTask, blockedFrontendTask]);
const blockedFrontendStatus = dependencyMetadataStatuses.find((item) => item.task.id === blockedFrontendTask.id);
assert.equal(blockedFrontendStatus.ready, false);
assert.equal(blockedFrontendStatus.blockers[0], blockedImplementationTaskDependencyMessage);
assert.equal(blockedFrontendStatus.blockers.includes("백엔드 태스크 생성 필요"), true);
assert.equal(
  buildNextImplementationTaskActionDetail({
    dependencyStatus: blockedFrontendStatus,
    task: readyTask,
  }),
  "선행 조건에 막혀 있습니다. 아래 실행 순서 점검에서 먼저 완료할 태스크를 확인하세요.",
);
assert.equal(
  buildNextImplementationTaskActionDetail({
    dependencyStatus: { ready: true },
    task: readyTask,
  }),
  "바로 시작하기 좋은 다음 태스크입니다. 진행 시작 후 증거를 남기세요.",
);
assert.deepEqual(
  buildNextImplementationTaskDisplayState({
    dependencyStatus: {
      blockers: ["디자인 태스크 완료 필요", "백엔드 태스크 생성 필요"],
      ready: false,
    },
    task: readyTask,
  }),
  {
    actionDetail: "선행 조건에 막혀 있습니다. 아래 실행 순서 점검에서 먼저 완료할 태스크를 확인하세요.",
    blockerText: "디자인 태스크 완료 필요, 백엔드 태스크 생성 필요",
    ownerRoleLabel: "prototype-builder",
    priorityLabel: "높음",
    priorityToneClass: "avl-pill avl-pill-danger",
    showBlockers: true,
    showStartButton: true,
    statusLabel: "할 일",
    statusToneClass: "avl-pill avl-pill-neutral",
    title: "T-001 제작 패키지 리뷰 화면",
  },
);
assert.equal(
  buildNextImplementationTaskDisplayState({
    dependencyStatus: null,
    task: {
      ...readyTask,
      status: "doing",
    },
  }).showStartButton,
  false,
);
assert.deepEqual(
  buildNextImplementationTaskDisplayState({
    dependencyStatus: null,
    task: {
      ...readyTask,
      owner_role: "",
    },
  }).ownerRoleLabel,
  "owner 미정",
);
assert.ok(
  ideaWorkbenchSource.includes("nextImplementationTaskDisplayState.statusLabel"),
  "IdeaWorkbench should render next implementation task status from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("nextImplementationTaskDisplayState.blockerText"),
  "IdeaWorkbench should render next implementation dependency blockers from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("nextImplementationTaskDisplayState.showStartButton"),
  "IdeaWorkbench should render next implementation start button from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("buildNextImplementationTaskActionDetail({"),
  "IdeaWorkbench should not build next implementation task detail inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes("nextImplementationDependencyStatus?.blockers.length"),
  "IdeaWorkbench should not decide next implementation blockers inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes('nextImplementationTask.status === "todo"'),
  "IdeaWorkbench should not decide next implementation start visibility inline.",
);

const statuses = [
  {
    blockers: [],
    completedPrerequisites: ["planning"],
    gate: "선행 조건 통과",
    missingPrerequisites: [],
    nextAction: "첫 화면 구현을 시작합니다.",
    ready: true,
    task: readyTask,
  },
  {
    blockers: [],
    completedPrerequisites: [],
    gate: "완료",
    missingPrerequisites: [],
    nextAction: "다음 태스크로 이동합니다.",
    ready: false,
    task: doneTask,
  },
];
const queueStatuses = [statuses[0], statuses[1], blockedFrontendStatus];
assert.deepEqual(getReadyImplementationDependencyStatuses(queueStatuses).map((status) => status.task.id), ["task-1"]);
assert.deepEqual(getWaitingImplementationDependencyStatuses(queueStatuses).map((status) => status.task.id), [
  "task-blocked-frontend",
]);
assert.equal(getImplementationDependencyStatusForTask(queueStatuses, readyTask)?.task.id, "task-1");
assert.equal(getImplementationDependencyStatusForTask(queueStatuses, null), null);
const readinessQueues = getImplementationTaskReadinessQueues({
  dependencyStatuses: queueStatuses,
  openTasks: [blockedFrontendTask],
});
assert.deepEqual(readinessQueues.readyStatuses.map((status) => status.task.id), ["task-1"]);
assert.deepEqual(readinessQueues.waitingStatuses.map((status) => status.task.id), ["task-blocked-frontend"]);
assert.equal(readinessQueues.nextTask?.id, "task-1");
assert.equal(readinessQueues.nextDependencyStatus?.task.id, "task-1");
assert.deepEqual(getImplementationDependencyStatusPreview(statuses, 1).map((status) => status.task.id), ["task-1"]);
assert.deepEqual(getImplementationDependencyStatusPreview(statuses).map((status) => status.task.id), ["task-1", "task-2"]);

const markdown = buildImplementationDependencyPlanMarkdown({ idea, state, statuses });
const draft = buildImplementationDependencyPlanDraft({ idea, state, statuses });

assert.equal(draft, markdown);
assert.match(draft, /# 개발 실행 순서 점검: AI Venture Lab/);
assert.match(draft, /T-001 제작 패키지 리뷰 화면/);
assert.match(draft, /첫 화면 구현을 시작합니다/);
const saveDraft = buildImplementationDependencyPlanArtifactSaveDraft({
  body: draft,
  ideaName: idea.name,
});
assert.equal(saveDraft.artifactType, "dev_runbook");
assert.equal(saveDraft.title, "AI Venture Lab 개발 실행 순서 점검");
assert.equal(saveDraft.source, "implementation_dependency_plan");
assert.match(saveDraft.body, /# 개발 실행 순서 점검: AI Venture Lab/);
assert.deepEqual(
  buildImplementationDependencyPlanActionControlStates({
    draft,
    hasUser: true,
    isBusy: false,
    saveDraft,
  }),
  {
    copy: {
      disabled: false,
      label: "순서 복사",
    },
    save: {
      disabled: false,
      label: "순서 저장",
    },
  },
);
assert.deepEqual(
  buildImplementationDependencyPlanActionControlStates({
    draft: "",
    hasUser: true,
    isBusy: false,
    saveDraft: null,
  }),
  {
    copy: {
      disabled: true,
      label: "순서 복사",
    },
    save: {
      disabled: true,
      label: "순서 저장",
    },
  },
);
assert.equal(
  buildImplementationDependencyPlanActionControlStates({
    draft,
    hasUser: false,
    isBusy: false,
    saveDraft,
  }).save.disabled,
  true,
);
assert.equal(
  buildImplementationDependencyPlanActionControlStates({
    draft,
    hasUser: true,
    isBusy: true,
    saveDraft,
  }).save.disabled,
  true,
);
assert.equal(buildImplementationDependencyPlanArtifactSaveDraft({ body: "", ideaName: null }), null);
assert.equal(buildImplementationDependencyPlanDraft({ idea: null, state: null, statuses }), "");

assert.match(ideaWorkbenchSource, /implementationDependencyPlanActionControlStates\.copy\.disabled/);
assert.match(ideaWorkbenchSource, /implementationDependencyPlanActionControlStates\.save\.disabled/);

console.log("Implementation dependency plan smoke passed.");
