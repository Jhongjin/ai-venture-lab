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
  buildStep8ImplementationDerivedState,
  buildStep8ImplementationTaskContext,
  buildStep8LearningSummary,
  buildStep8ProgressSummary,
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
assert.equal(derivedState.step8ImplementationTaskContext.nextTask?.id, "task-frontend");
assert.equal(derivedState.step8ImplementationTaskContext.nextTaskCode, "T-002");

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
assert.equal(learningSummary.learningDecisionCards[0].label, "완료된 것");
assert.equal(learningSummary.learningDecisionCards[1].value, "T-002 남음");
assert.match(learningSummary.learningPrimaryActionText, /T-002 첫 화면 제작/);

const progressSummary = buildStep8ProgressSummary({
  evidenceByTaskId: {},
  nextImplementationTaskId: context.nextTaskId,
  tasks,
});
assert.equal(progressSummary.progressTitle, "다음 작업 하나만 확인");
assert.deepEqual(
  progressSummary.progressItems.filter((item) => item.isNext).map((item) => item.code),
  ["T-002"],
);
assert.equal(progressSummary.progressItems[0].isDone, true);

console.log("Step 8 learning summary smoke passed.");
