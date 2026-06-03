import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const recordUtilsUrl = pathToFileURL(path.join(process.cwd(), "src/lib/record-utils.ts")).href;
const externalProgressPath = path.join(process.cwd(), "src/lib/external-progress-import.ts");
const externalProgressSource = readFileSync(externalProgressPath, "utf8").replace(
  'from "@/lib/record-utils";',
  `from ${JSON.stringify(recordUtilsUrl)};`,
);
const { outputText: externalProgressOutput } = ts.transpileModule(externalProgressSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: externalProgressPath,
});
const externalProgressUrl = `data:text/javascript;base64,${Buffer.from(externalProgressOutput).toString("base64")}`;
const implementationMetadataUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const {
  buildImplementationTaskProgressStats,
  buildImplementationTaskTypeStats,
  countBlockedImplementationTasks,
  createInitialImplementationTaskTypeStats,
  getDoneImplementationTasks,
  isBlockedImplementationTask,
  isDoneImplementationTask,
} = await import(implementationMetadataUrl);
const modulePath = path.join(process.cwd(), "src/lib/step8-learning-summary.ts");
const source = readFileSync(modulePath, "utf8")
  .replace('from "@/lib/external-progress-import";', `from ${JSON.stringify(externalProgressUrl)};`)
  .replace('from "@/lib/implementation-task-metadata";', `from ${JSON.stringify(implementationMetadataUrl)};`);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  fileName: modulePath,
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  areAllStep8ProgressItemsDone,
  buildStep8ExternalSyncCompletedText,
  buildStep8ExternalSyncNextTaskText,
  buildStep8ExternalSyncOutcomeSentence,
  buildStep8ExternalSyncReviewRows,
  buildStep8ImplementationDerivedState,
  buildStep8ImplementationTaskContext,
  buildStep8LearningDecisionCards,
  buildStep8LearningDecisionDetail,
  buildStep8LearningDecisionLabel,
  buildStep8LearningDecisionOptions,
  buildStep8LearningCompletedSummary,
  buildStep8LearningDisplayState,
  buildStep8LearningJudgmentQuestion,
  buildStep8LearningNavigationHint,
  buildStep8LearningNextJudgmentBrief,
  buildStep8LearningOneSentenceOutcome,
  buildStep8LearningPrimaryActionSummary,
  buildStep8LearningRemainingSummary,
  buildStep8LearningSimpleReviewRows,
  buildStep8LearningSummary,
  buildStep8ProgressDetail,
  buildStep8ProgressDisplayItem,
  buildStep8ProgressSummary,
  buildStep8ProgressStatusDetail,
  buildStep8ProgressTitle,
  canCopyStep8LearningReport,
  compareStep8ProgressTasks,
  formatStep8TaskCodePrefix,
  sortStep8ProgressTasks,
} = await import(moduleUrl);

function task({ evidence = "", id, sortOrder, status, taskType, title }) {
  return {
    acceptance_criteria: null,
    artifact_id: null,
    completed_at: null,
    created_at: "2026-06-01T00:00:00.000Z",
    created_by: null,
    dependencies: [],
    description: title,
    evidence,
    id,
    idea_id: "idea-1",
    organization_id: null,
    owner_role: "",
    priority: "medium",
    sort_order: sortOrder,
    status,
    task_type: taskType,
    title,
    updated_at: "2026-06-01T00:00:00.000Z",
  };
}

const tasks = [
  task({
    evidence: "commit abc pnpm smoke passed",
    id: "task-planning",
    sortOrder: 1,
    status: "done",
    taskType: "planning",
    title: "검증 범위 확정",
  }),
  task({
    id: "task-frontend",
    sortOrder: 2,
    status: "doing",
    taskType: "frontend",
    title: "첫 화면 제작",
  }),
  task({
    id: "task-qa",
    sortOrder: 3,
    status: "todo",
    taskType: "qa",
    title: "스모크 점검",
  }),
];
const initialTypeStats = createInitialImplementationTaskTypeStats();
assert.equal(initialTypeStats.planning.total, 0);
assert.equal(initialTypeStats.frontend.done, 0);
assert.equal(isDoneImplementationTask(tasks[0]), true);
assert.equal(isDoneImplementationTask(tasks[1]), false);
assert.equal(isBlockedImplementationTask(tasks[2]), false);
assert.equal(getDoneImplementationTasks(tasks).length, 1);
assert.equal(countBlockedImplementationTasks(tasks), 0);

const progressStats = buildImplementationTaskProgressStats(tasks);
assert.equal(progressStats.completedCount, 1);
assert.equal(progressStats.blockedCount, 0);
assert.equal(progressStats.totalCount, 3);
assert.deepEqual(progressStats.completedTasks.map((item) => item.id), ["task-planning"]);
assert.equal(progressStats.byType.planning.done, 1);
assert.equal(progressStats.byType.planning.total, 1);
assert.equal(progressStats.byType.frontend.done, 0);
assert.equal(progressStats.byType.frontend.total, 1);

const blockedTasks = [
  ...tasks,
  task({
    id: "task-blocked",
    sortOrder: 4,
    status: "blocked",
    taskType: "security",
    title: "권한 점검",
  }),
];
assert.equal(isBlockedImplementationTask(blockedTasks[3]), true);
assert.equal(countBlockedImplementationTasks(blockedTasks), 1);
assert.equal(buildImplementationTaskProgressStats(blockedTasks).blockedCount, 1);
assert.equal(buildImplementationTaskTypeStats(blockedTasks).security.total, 1);

const dependencyStatuses = [
  {
    blockers: [],
    completedPrerequisites: ["planning"],
    gate: "시작 가능",
    missingPrerequisites: [],
    nextAction: "첫 화면 제작",
    ready: true,
    task: tasks[1],
  },
  {
    blockers: ["frontend"],
    completedPrerequisites: ["planning"],
    gate: "앞 작업 대기",
    missingPrerequisites: ["frontend"],
    nextAction: "프론트 완료 후 점검",
    ready: false,
    task: tasks[2],
  },
];
const context = buildStep8ImplementationTaskContext({
  dependencyStatuses,
  openTasks: [tasks[1], tasks[2]],
  progressStats: {
    completedTasks: [tasks[0]],
    totalCount: tasks.length,
  },
  tasks,
});
assert.equal(context.nextTask.id, "task-frontend");
assert.equal(context.nextTaskCode, "T-002");
assert.equal(context.nextTaskId, "task-frontend");
assert.equal(context.readyStatuses.length, 1);
assert.equal(context.waitingStatuses.length, 1);
assert.equal(context.completedTasks.length, 1);
assert.equal(context.totalCount, 3);

const derivedState = buildStep8ImplementationDerivedState(tasks);
assert.deepEqual(
  derivedState.selectedOpenImplementationTasks.map((item) => item.id),
  ["task-frontend", "task-qa"],
);
assert.equal(derivedState.implementationDependencyStatuses.length, 3);
assert.equal(derivedState.implementationTaskProgressStats.completedCount, 1);
assert.equal(derivedState.completedImplementationTasks.length, 1);
assert.equal(derivedState.step8ImplementationTaskContext.nextTask?.id, "task-frontend");
assert.equal(derivedState.step8ImplementationTaskContext.nextTaskCode, "T-002");
assert.equal(derivedState.nextImplementationDependencyStatus?.task.id, "task-frontend");
assert.equal(derivedState.nextImplementationTask?.id, "task-frontend");
assert.equal(derivedState.nextImplementationTaskCode, "T-002");
assert.equal(derivedState.nextImplementationTaskId, "task-frontend");
assert.equal(derivedState.readyImplementationDependencyStatuses.length, 0);
assert.equal(derivedState.totalImplementationTaskCount, 3);
assert.equal(derivedState.waitingImplementationDependencyStatuses.length, 2);

const learningSummary = buildStep8LearningSummary({
  buildDeliveryMode: "external_tool",
  completedImplementationTaskCount: context.completedTasks.length,
  externalToolLabel: "Codex",
  nextImplementationTask: context.nextTask,
  nextImplementationTaskCode: context.nextTaskCode,
  openRiskCount: 0,
  productSignalCount: 0,
  recentSignalCount: 0,
  taskSyncUpdatedAt: "2026-06-01 09:00",
  totalImplementationTaskCount: context.totalCount,
});
assert.equal(
  buildStep8LearningDecisionLabel({
    completedImplementationTaskCount: 1,
    openRiskCount: 0,
    productSignalCount: 0,
    totalImplementationTaskCount: 3,
  }),
  "다음 작업 완료",
);
assert.match(buildStep8LearningDecisionDetail("다음 작업 완료"), /완료되지 않은 제작 작업/);
assert.deepEqual(
  buildStep8LearningDecisionOptions({
    hasNextImplementationTask: true,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  ["작업 계속", "막힘 해결", "완료 보고 반영"],
);
assert.equal(learningSummary.learningDecisionCards[0].label, "완료된 것");
assert.equal(learningSummary.learningDecisionCards[1].value, "T-002 남음");
assert.equal(learningSummary.learningDecisionLabel, "다음 작업 완료");
assert.deepEqual(
  buildStep8LearningDecisionCards({
    learningCompletedValue: "1/3 작업",
    learningCompletedDetail: "완료 보고가 저장된 제작 작업입니다.",
    learningRemainingValue: "T-002 남음",
    learningRemainingDetail: "첫 화면 제작만 이어서 처리하면 됩니다.",
    learningDecisionLabel: "다음 작업 완료",
    learningDecisionDetail: buildStep8LearningDecisionDetail("다음 작업 완료"),
  }),
  [
    {
      label: "완료된 것",
      value: "1/3 작업",
      detail: "완료 보고가 저장된 제작 작업입니다.",
    },
    {
      label: "이어 할 것",
      value: "T-002 남음",
      detail: "첫 화면 제작만 이어서 처리하면 됩니다.",
    },
    {
      label: "지금 판단",
      value: "다음 작업 완료",
      detail: buildStep8LearningDecisionDetail("다음 작업 완료"),
    },
  ],
);
assert.deepEqual(
  buildStep8LearningSimpleReviewRows({
    learningCompletedValue: "1/3 작업",
    learningCompletedDetail: "완료 보고가 저장된 제작 작업입니다.",
    learningRemainingValue: "T-002 남음",
    learningRemainingDetail: "첫 화면 제작만 이어서 처리하면 됩니다.",
    learningDecisionLabel: "다음 작업 완료",
    learningDecisionDetail: buildStep8LearningDecisionDetail("다음 작업 완료"),
  }),
  [
    ["완료", "1/3 작업", "완료 보고가 저장된 제작 작업입니다."],
    ["이어 할 것", "T-002 남음", "첫 화면 제작만 이어서 처리하면 됩니다."],
    ["판단", "다음 작업 완료", buildStep8LearningDecisionDetail("다음 작업 완료")],
  ],
);
assert.deepEqual(
  buildStep8LearningCompletedSummary({
    completedImplementationTaskCount: 1,
    productSignalCount: 0,
    totalImplementationTaskCount: 3,
  }),
  {
    value: "1/3 작업",
    detail: "완료 보고가 저장된 제작 작업입니다.",
  },
);
assert.deepEqual(
  buildStep8LearningRemainingSummary({
    nextImplementationTask: context.nextTask,
    nextImplementationTaskCode: context.nextTaskCode,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  {
    value: "T-002 남음",
    detail: "첫 화면 제작만 이어서 처리하면 됩니다.",
  },
);
assert.equal(learningSummary.learningCompletedValue, "1/3 작업");
assert.equal(learningSummary.learningRemainingValue, "T-002 남음");
assert.equal(
  buildStep8LearningJudgmentQuestion({
    hasNextImplementationTask: true,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  "이 작업을 완료로 볼 근거가 있나요?",
);
assert.match(
  buildStep8LearningNextJudgmentBrief({
    hasNextImplementationTask: true,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  /완료 여부만 확인/,
);
assert.equal(learningSummary.learningJudgmentQuestion, "이 작업을 완료로 볼 근거가 있나요?");
assert.deepEqual(
  buildStep8LearningPrimaryActionSummary({
    buildDeliveryMode: "external_tool",
    externalToolLabel: "Codex",
    nextImplementationTask: context.nextTask,
    productSignalCount: 0,
    recentSignalCount: 0,
    taskPrefix: "T-002 ",
  }),
  {
    label: "다음 제작 작업",
    text: "다음 제작 작업은 T-002 첫 화면 제작입니다. 실제 실행은 STEP 7/외부 도구에서 이어가고, 여기서는 완료 보고 반영 여부만 확인하세요.",
    detail: "Codex에서 완료 보고가 들어오면 이 화면의 작업 목록이 자동으로 갱신됩니다.",
  },
);
assert.match(
  buildStep8LearningPrimaryActionSummary({
    buildDeliveryMode: "venture_lab",
    externalToolLabel: "Codex",
    nextImplementationTask: context.nextTask,
    productSignalCount: 0,
    recentSignalCount: 0,
    taskPrefix: "T-002 ",
  }).detail,
  /내부 제작 흐름/,
);
assert.equal(
  buildStep8LearningOneSentenceOutcome({
    nextImplementationTask: context.nextTask,
    openRiskCount: 0,
    productSignalCount: 0,
    taskPrefix: "T-002 ",
  }),
  "T-002 첫 화면 제작 완료 보고가 반영되면 다음 판단으로 넘어갈 수 있습니다.",
);
assert.deepEqual(buildStep8LearningNavigationHint({ hasNextImplementationTask: true }), {
  title: "다음 작업은 STEP 7에서 이어갑니다",
  detail: "이 화면은 완료와 다음 판단만 보여줍니다. 단계 이동은 왼쪽 단계 메뉴나 하단 단계 버튼에서 진행하세요.",
});
assert.equal(
  buildStep8ExternalSyncCompletedText({
    completedImplementationTaskCount: 1,
    totalImplementationTaskCount: 3,
  }),
  "1/3 작업",
);
assert.equal(
  buildStep8ExternalSyncNextTaskText({
    nextImplementationTask: context.nextTask,
    taskPrefix: context.nextTaskCode ? `${context.nextTaskCode} ` : "",
    totalImplementationTaskCount: 3,
  }),
  "T-002 첫 화면 제작",
);
assert.equal(
  buildStep8ExternalSyncOutcomeSentence({
    externalSyncCompletedText: "1/3 작업",
    externalSyncNextTaskText: "T-002 첫 화면 제작",
    totalImplementationTaskCount: 3,
  }),
  "자동 반영 기준으로 완료 1/3 작업, 다음은 T-002 첫 화면 제작입니다.",
);
assert.deepEqual(
  buildStep8ExternalSyncReviewRows({
    externalSyncCheckedText: "2026-06-01 09:00",
    externalSyncCompletedText: "1/3 작업",
    externalSyncNextTaskText: "T-002 첫 화면 제작",
  })[0],
  ["반영 결과", "1/3 작업", "외부 도구 완료 보고가 반영된 작업 수입니다."],
);
assert.equal(learningSummary.externalSyncCompletedText, "1/3 작업");
assert.equal(learningSummary.externalSyncNextTaskText, "T-002 첫 화면 제작");
assert.match(learningSummary.learningPrimaryActionText, /T-002 첫 화면 제작/);
assert.equal(formatStep8TaskCodePrefix("T-002"), "T-002 ");
assert.equal(formatStep8TaskCodePrefix(null), "");

const progressSummary = buildStep8ProgressSummary({
  evidenceByTaskId: {},
  nextImplementationTaskId: context.nextTaskId,
  tasks: [tasks[2], tasks[0], tasks[1]],
});
assert.equal(progressSummary.progressTitle, "다음 작업 하나만 확인");
assert.deepEqual(sortStep8ProgressTasks([tasks[2], tasks[0], tasks[1]]).map((item) => item.id), [
  "task-planning",
  "task-frontend",
  "task-qa",
]);
assert.equal(compareStep8ProgressTasks(tasks[0], tasks[1]), -1);
assert.equal(compareStep8ProgressTasks(tasks[2], tasks[1]), 1);
assert.equal(compareStep8ProgressTasks(tasks[1], { sort_order: 2 }), 0);
const nextProgressItem = buildStep8ProgressDisplayItem({
  evidenceByTaskId: {},
  index: 1,
  nextImplementationTaskId: context.nextTaskId,
  task: tasks[1],
});
assert.equal(nextProgressItem.code, "T-002");
assert.equal(nextProgressItem.isNext, true);
assert.equal(nextProgressItem.statusDetail, "다음으로 이어서 처리할 작업입니다.");
assert.equal(nextProgressItem.showMissingEvidence, true);
assert.equal(
  buildStep8ProgressStatusDetail({
    evidence: "",
    isNext: false,
    task: tasks[2],
  }),
  "앞선 작업이 끝나면 이어서 처리합니다.",
);
assert.equal(
  buildStep8ProgressStatusDetail({
    evidence: "",
    isNext: false,
    task: { ...tasks[2], status: "blocked" },
  }).includes("재현"),
  true,
);
assert.equal(areAllStep8ProgressItemsDone(progressSummary.progressItems), false);
assert.equal(buildStep8ProgressTitle({ hasNextTask: true, progressItems: progressSummary.progressItems }), "다음 작업 하나만 확인");
assert.match(
  buildStep8ProgressDetail({ hasNextTask: true, progressItems: progressSummary.progressItems }),
  /다음 작업 하나/,
);
assert.deepEqual(
  progressSummary.progressItems.filter((item) => item.isNext).map((item) => item.code),
  ["T-002"],
);
assert.deepEqual(
  progressSummary.progressItems.map((item) => item.id),
  ["task-planning", "task-frontend", "task-qa"],
);
assert.equal(progressSummary.progressItems[0].isDone, true);

const displayState = buildStep8LearningDisplayState({
  buildDeliveryMode: "external_tool",
  completedImplementationTaskCount: 3,
  evidenceByTaskId: {},
  externalToolLabel: "Codex",
  nextImplementationTask: null,
  nextImplementationTaskCode: null,
  nextImplementationTaskId: null,
  openRiskCount: 0,
  productSignalCount: 4,
  recentSignalCount: 2,
  taskSyncUpdatedAt: "2026-06-01 10:00",
  tasks: tasks.map((item) => ({ ...item, status: "done" })),
  totalImplementationTaskCount: 3,
});
assert.equal(displayState.canCopyLearningReport, true);
assert.equal(displayState.learningDecisionCards[0].label, "완료된 것");
assert.equal(displayState.learningPrimaryCtaLabel, "리포트 복사");
assert.equal(displayState.learningDecisionLabel, "다음 빌드 범위 결정");
assert.deepEqual(
  buildStep8LearningCompletedSummary({
    completedImplementationTaskCount: 0,
    productSignalCount: 4,
    totalImplementationTaskCount: 0,
  }),
  {
    value: "4개 신호",
    detail: "첫 버전에서 들어온 실제 사용 신호입니다.",
  },
);
assert.deepEqual(
  buildStep8LearningCompletedSummary({
    completedImplementationTaskCount: 0,
    productSignalCount: 0,
    totalImplementationTaskCount: 0,
  }),
  {
    value: "없음",
    detail: "아직 완료 보고나 제품 신호가 없습니다.",
  },
);
assert.deepEqual(
  buildStep8LearningRemainingSummary({
    nextImplementationTask: null,
    nextImplementationTaskCode: null,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  {
    value: "신호 연결",
    detail: "첫 버전을 배포한 뒤 방문과 핵심 행동 이벤트를 연결하세요.",
  },
);
assert.deepEqual(
  buildStep8LearningRemainingSummary({
    nextImplementationTask: null,
    nextImplementationTaskCode: null,
    openRiskCount: 2,
    productSignalCount: 4,
  }),
  {
    value: "2개 리스크",
    detail: "열린 리스크 중 다음 빌드에서 줄일 항목을 하나 고르세요.",
  },
);
assert.deepEqual(
  buildStep8LearningRemainingSummary({
    nextImplementationTask: null,
    nextImplementationTaskCode: null,
    openRiskCount: 0,
    productSignalCount: 4,
  }),
  {
    value: "없음",
    detail: "남은 차단 항목이 없으면 다음 빌드 범위를 작게 정하면 됩니다.",
  },
);
assert.deepEqual(
  buildStep8LearningPrimaryActionSummary({
    buildDeliveryMode: "external_tool",
    externalToolLabel: "Codex",
    nextImplementationTask: null,
    productSignalCount: 0,
    recentSignalCount: 0,
    taskPrefix: "",
  }),
  {
    label: "출시 전 확인",
    text: "첫 버전을 배포하거나 내부 제작 흐름으로 넘긴 뒤, 방문과 핵심 행동 이벤트가 들어오는지 확인하세요.",
    detail: "실제 사용 신호가 없을 때는 리포트보다 제작 완료와 이벤트 연결 여부를 먼저 봅니다.",
  },
);
assert.deepEqual(
  buildStep8LearningPrimaryActionSummary({
    buildDeliveryMode: "external_tool",
    externalToolLabel: "Codex",
    nextImplementationTask: null,
    productSignalCount: 4,
    recentSignalCount: 2,
    taskPrefix: "",
  }),
  {
    label: "다음 빌드 판단",
    text: "최근 14일 신호 2개를 기준으로 다음 빌드 범위를 작게 정하세요.",
    detail: "이제 상세 이벤트는 필요할 때만 열고, 다음 개선 또는 보류 판단을 남기면 됩니다.",
  },
);
assert.equal(
  buildStep8LearningOneSentenceOutcome({
    nextImplementationTask: null,
    openRiskCount: 0,
    productSignalCount: 0,
    taskPrefix: "",
  }),
  "지금은 성과 분석보다 첫 버전 배포와 이벤트 연결이 먼저입니다.",
);
assert.equal(
  buildStep8LearningOneSentenceOutcome({
    nextImplementationTask: null,
    openRiskCount: 2,
    productSignalCount: 4,
    taskPrefix: "",
  }),
  "사용 신호는 들어왔고, 다음 결정은 열린 리스크를 하나 줄이는 것입니다.",
);
assert.equal(
  buildStep8LearningOneSentenceOutcome({
    nextImplementationTask: null,
    openRiskCount: 0,
    productSignalCount: 4,
    taskPrefix: "",
  }),
  "사용 신호가 들어왔으니 다음 빌드 범위를 작게 승인할 차례입니다.",
);
assert.deepEqual(buildStep8LearningNavigationHint({ hasNextImplementationTask: false }), {
  title: "최종 실행은 STEP 7에서 확인합니다",
  detail: "성과 확인 화면 안에서는 단계를 자동 이동하지 않습니다. 최종 실행 자료는 STEP 7에서 확인하세요.",
});
assert.equal(
  buildStep8LearningJudgmentQuestion({
    hasNextImplementationTask: false,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  "첫 버전 배포와 성과 신호 연결이 끝났나요?",
);
assert.equal(
  buildStep8LearningJudgmentQuestion({
    hasNextImplementationTask: false,
    openRiskCount: 2,
    productSignalCount: 4,
  }),
  "다음 빌드에서 어떤 리스크 하나를 먼저 줄일까요?",
);
assert.equal(
  buildStep8LearningJudgmentQuestion({
    hasNextImplementationTask: false,
    openRiskCount: 0,
    productSignalCount: 4,
  }),
  "다음 빌드를 작게 승인할까요, 아니면 보류할까요?",
);
assert.match(
  buildStep8LearningNextJudgmentBrief({
    hasNextImplementationTask: false,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  /숫자 리포트는 아직 이릅니다/,
);
assert.match(
  buildStep8LearningNextJudgmentBrief({
    hasNextImplementationTask: false,
    openRiskCount: 2,
    productSignalCount: 4,
  }),
  /리스크 하나만/,
);
assert.match(
  buildStep8LearningNextJudgmentBrief({
    hasNextImplementationTask: false,
    openRiskCount: 0,
    productSignalCount: 4,
  }),
  /승인할지 보류/,
);
assert.match(buildStep8LearningDecisionDetail("첫 버전 배포"), /핵심 행동 신호/);
assert.match(buildStep8LearningDecisionDetail("리스크 보완"), /열린 리스크/);
assert.match(buildStep8LearningDecisionDetail("다음 빌드 범위 결정"), /다음 빌드 범위/);
assert.equal(
  buildStep8LearningDecisionLabel({
    completedImplementationTaskCount: 0,
    openRiskCount: 0,
    productSignalCount: 0,
    totalImplementationTaskCount: 0,
  }),
  "첫 버전 배포",
);
assert.equal(
  buildStep8LearningDecisionLabel({
    completedImplementationTaskCount: 0,
    openRiskCount: 1,
    productSignalCount: 2,
    totalImplementationTaskCount: 0,
  }),
  "리스크 보완",
);
assert.deepEqual(
  buildStep8LearningDecisionOptions({
    hasNextImplementationTask: false,
    openRiskCount: 0,
    productSignalCount: 0,
  }),
  ["첫 버전 배포", "성과 신호 연결", "최종 실행 확인"],
);
assert.deepEqual(
  buildStep8LearningDecisionOptions({
    hasNextImplementationTask: false,
    openRiskCount: 1,
    productSignalCount: 2,
  }),
  ["리스크 보완", "범위 축소", "보류"],
);
assert.deepEqual(
  buildStep8LearningDecisionOptions({
    hasNextImplementationTask: false,
    openRiskCount: 0,
    productSignalCount: 2,
  }),
  ["다음 빌드 승인", "작게 개선", "보류"],
);
assert.equal(
  buildStep8ExternalSyncCompletedText({
    completedImplementationTaskCount: 0,
    totalImplementationTaskCount: 0,
  }),
  "작업 생성 전",
);
assert.equal(
  buildStep8ExternalSyncNextTaskText({
    nextImplementationTask: null,
    taskPrefix: "",
    totalImplementationTaskCount: 0,
  }),
  "STEP 6 작업 순서 생성",
);
assert.equal(
  buildStep8ExternalSyncNextTaskText({
    nextImplementationTask: null,
    taskPrefix: "",
    totalImplementationTaskCount: 3,
  }),
  "모든 작업 완료",
);
assert.match(
  buildStep8ExternalSyncOutcomeSentence({
    externalSyncCompletedText: "작업 생성 전",
    externalSyncNextTaskText: "STEP 6 작업 순서 생성",
    totalImplementationTaskCount: 0,
  }),
  /아직 반영할 제작 작업/,
);
assert.equal(displayState.progressTitle, "제작 작업 완료");
assert.equal(areAllStep8ProgressItemsDone(displayState.progressItems), true);
assert.equal(buildStep8ProgressTitle({ hasNextTask: false, progressItems: displayState.progressItems }), "제작 작업 완료");
assert.match(
  buildStep8ProgressDetail({ hasNextTask: false, progressItems: displayState.progressItems }),
  /남은 제작 작업은 없습니다/,
);
assert.equal(buildStep8ProgressTitle({ hasNextTask: false, progressItems: [] }), "진행표 대기");
assert.equal(displayState.progressItems.length, 3);
assert.equal(canCopyStep8LearningReport({ nextImplementationTask: null, productSignalCount: 1 }), true);
assert.equal(canCopyStep8LearningReport({ nextImplementationTask: tasks[1], productSignalCount: 1 }), false);
assert.equal(canCopyStep8LearningReport({ nextImplementationTask: null, productSignalCount: 0 }), false);

console.log("Step 8 learning summary smoke passed.");
