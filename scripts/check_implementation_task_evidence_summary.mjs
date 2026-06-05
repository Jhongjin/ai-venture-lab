import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src/lib/implementation-task-metadata.ts")).href;
const {
  buildBlockedImplementationPanelDisplayState,
  buildBlockedImplementationSummaries,
  buildImplementationEvidencePanelDisplayState,
  buildImplementationEvidenceSummaries,
  buildImplementationTaskEvidenceState,
  compareBlockedImplementationSummaries,
  compareImplementationEvidenceSummaries,
  getBlockedImplementationSummaryPreview,
  getCompletedImplementationTasksWithEvidence,
  getImplementationEvidenceIssuePreview,
  getImplementationEvidenceIssues,
  getImplementationTaskEvidence,
  getMissingImplementationEvidenceChecklistLabels,
} = await import(moduleUrl);
const ideaWorkbenchSource = readFileSync(path.join(process.cwd(), "src/components/idea-workbench.tsx"), "utf8");

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
  getMissingImplementationEvidenceChecklistLabels([
    { label: "커밋/PR", passed: false, terms: ["commit"] },
    { label: "검증 결과", passed: true, terms: ["pnpm"] },
  ]),
  ["커밋/PR"],
);

const frontendEvidenceState = buildImplementationTaskEvidenceState(tasks[0], {
  "task-frontend": "commit abc pnpm smoke 저장 로딩",
});
assert.equal(frontendEvidenceState.evidence, "commit abc pnpm smoke 저장 로딩");
assert.deepEqual(frontendEvidenceState.missingLabels, []);
assert.equal(frontendEvidenceState.passedCount, frontendEvidenceState.totalCount);
const emptyEvidenceState = buildImplementationTaskEvidenceState(tasks[0], {});
assert.deepEqual(emptyEvidenceState.missingLabels, ["커밋/PR", "검증 결과", "사용자 여정", "상태 UX"]);
assert.equal(
  getImplementationTaskEvidence(tasks[1], {
    "task-backend": "draft evidence wins",
  }),
  "draft evidence wins",
);
assert.equal(getImplementationTaskEvidence(tasks[1], {}), "commit abc pnpm typecheck 허용 차단 RLS with check");
assert.equal(getImplementationTaskEvidence({ ...tasks[0], evidence: null }, {}), "");

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
const evidencePanelDisplayState = buildImplementationEvidencePanelDisplayState({
  issueSummaries: getImplementationEvidenceIssues(evidenceSummaries),
  totalSummaryCount: evidenceSummaries.length,
});
assert.equal(evidencePanelDisplayState.countLabel, "보완 필요 3/4");
assert.equal(evidencePanelDisplayState.showIssuePreview, true);
assert.equal(evidencePanelDisplayState.emptyMessage, "현재 모든 태스크의 근거가 채워져 있습니다.");
assert.deepEqual(evidencePanelDisplayState.items.slice(0, 2), [
  {
    evidenceScoreLabel: "0/4",
    id: "task-frontend",
    missingEvidenceText: "보완 필요: 커밋/PR, 검증 결과, 사용자 여정, 상태 UX",
    taskTypeLabel: "프론트",
    title: "frontend task",
  },
  {
    evidenceScoreLabel: "3/5",
    id: "task-deploy",
    missingEvidenceText: "보완 필요: Vercel 로그, 롤백 기준",
    taskTypeLabel: "배포",
    title: "deploy task",
  },
]);

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
assert.deepEqual(buildBlockedImplementationPanelDisplayState(blockedSummaries), {
  countLabel: "차단 2개",
  itemCount: 2,
  items: [
    {
      escalation: "운영 장애 가능성이 있으면 직전 정상 배포로 되돌리는 기준을 우선 기록합니다.",
      id: "task-deploy",
      missingEvidenceText: "추가 증거 필요: Vercel 로그, 롤백 기준",
      nextAction: "Preview/Production 배포 상태, 환경변수, Vercel 로그를 먼저 확인하세요.",
      ownerRoleLabel: "담당 release-manager",
      priorityLabel: "높음",
      showMissingEvidence: true,
      title: "deploy task",
      unblockEvidence: "배포 URL, Vercel inspect 또는 로그, production smoke, 롤백 기준을 남깁니다.",
    },
    {
      escalation: "반복 실패면 해당 구현 담당자에게 재배정합니다.",
      id: "task-qa",
      missingEvidenceText: "추가 증거 필요: 스모크 경로, 실패/회귀",
      nextAction: "실패한 경로를 재현 가능한 한 줄 시나리오로 줄이세요.",
      ownerRoleLabel: "담당 qa-runner",
      priorityLabel: "낮음",
      showMissingEvidence: true,
      title: "qa task",
      unblockEvidence: "실패 재현, 수정 커밋, 재실행 결과, 남은 회귀 리스크를 남깁니다.",
    },
  ],
});
assert.ok(
  ideaWorkbenchSource.includes("blockedImplementationPanelDisplayState.countLabel"),
  "IdeaWorkbench should render blocked queue count from shared display state.",
);
assert.ok(
  ideaWorkbenchSource.includes("implementationEvidencePanelDisplayState.countLabel"),
  "IdeaWorkbench should render evidence queue count from shared display state.",
);
assert.ok(
  !ideaWorkbenchSource.includes("getBlockedImplementationSummaryPreview(blockedImplementationSummaries)"),
  "IdeaWorkbench should not build blocked summary preview items inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes("getImplementationEvidenceIssuePreview(implementationEvidenceIssues)"),
  "IdeaWorkbench should not build evidence issue preview items inline.",
);
assert.ok(
  !ideaWorkbenchSource.includes("summary.missing.join"),
  "IdeaWorkbench should not join evidence issue labels inline.",
);

console.log("Implementation task evidence summary smoke passed.");
