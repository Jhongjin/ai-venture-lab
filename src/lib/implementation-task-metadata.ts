import type {
  ImplementationTaskPriority,
  ImplementationTaskStatus,
  ImplementationTaskType,
} from "@/lib/supabase/types";
import type { ImplementationTask } from "@/lib/venture-data";

export type EvidenceRequirement = {
  label: string;
  terms: string[];
};

export type ImplementationStatusFilter = ImplementationTaskStatus | "all";
export type ImplementationEvidenceFilter = "all" | "missing" | "complete";

export type BlockerPlaybook = {
  fallbackOwner: string;
  nextAction: string;
  unblockEvidence: string;
  escalation: string;
};

export type ImplementationDependencyRule = {
  prerequisites: ImplementationTaskType[];
  gate: string;
  nextAction: string;
};

export type ImplementationDependencyStatus = {
  task: ImplementationTask;
  ready: boolean;
  blockers: string[];
  completedPrerequisites: ImplementationTaskType[];
  missingPrerequisites: ImplementationTaskType[];
  gate: string;
  nextAction: string;
};

export type ImplementationTaskProgressStats = {
  blockedCount: number;
  completedCount: number;
  completedTasks: ImplementationTask[];
  totalCount: number;
  byType: Record<ImplementationTaskType, { done: number; total: number }>;
};

export type ImplementationTaskRefreshSummary = {
  doneCount: number;
  message: string;
  nextTask: ImplementationTask | null;
  totalCount: number;
};

export type ImplementationTaskReadinessQueues = {
  readyStatuses: ImplementationDependencyStatus[];
  waitingStatuses: ImplementationDependencyStatus[];
  nextTask: ImplementationTask | null;
  nextDependencyStatus: ImplementationDependencyStatus | null;
};

export type ImplementationEvidenceSummary = {
  task: ImplementationTask;
  missing: string[];
  passedCount: number;
  totalCount: number;
};

export type BlockedImplementationSummary = {
  task: ImplementationTask;
  hint: ReturnType<typeof getBlockedImplementationTaskHint>;
  missing: string[];
};

export type ImplementationTaskCardSummary = {
  task: ImplementationTask;
  evidence: string;
  evidenceChecklist: ReturnType<typeof getImplementationEvidenceChecklist>;
  passedEvidenceCount: number;
  missingEvidenceLabels: string[];
  blockedHint: ReturnType<typeof getBlockedImplementationTaskHint> | null;
};

export type ImplementationTaskBoardColumn = {
  status: ImplementationTaskStatus;
  taskSummaries: ImplementationTaskCardSummary[];
};

export const implementationTaskStatuses: ImplementationTaskStatus[] = ["todo", "doing", "blocked", "done"];

export const implementationTaskTypes: ImplementationTaskType[] = [
  "planning",
  "design",
  "frontend",
  "backend",
  "data",
  "qa",
  "security",
  "deploy",
];

export const implementationTaskPriorities: ImplementationTaskPriority[] = ["low", "medium", "high"];

export const implementationTaskStatusLabels: Record<ImplementationTaskStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  blocked: "막힘",
  done: "완료",
};

export const implementationStatusFilterOptions: ImplementationStatusFilter[] = ["all", ...implementationTaskStatuses];

export const implementationStatusFilterLabels: Record<ImplementationStatusFilter, string> = {
  all: "전체 상태",
  ...implementationTaskStatusLabels,
};

export const implementationEvidenceFilterOptions: ImplementationEvidenceFilter[] = ["all", "missing", "complete"];

export const implementationEvidenceFilterLabels: Record<ImplementationEvidenceFilter, string> = {
  all: "전체 증거",
  missing: "근거 비어 있음",
  complete: "근거 채워짐",
};

export const implementationTaskStatusTone: Record<ImplementationTaskStatus, string> = {
  todo: "avl-pill avl-pill-neutral",
  doing: "avl-pill avl-pill-info",
  blocked: "avl-pill avl-pill-danger",
  done: "avl-pill avl-pill-success",
};

export const implementationTaskPriorityLabels: Record<ImplementationTaskPriority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};

export const implementationTaskPriorityTone: Record<ImplementationTaskPriority, string> = {
  low: "avl-pill avl-pill-neutral",
  medium: "avl-pill avl-pill-warning",
  high: "avl-pill avl-pill-danger",
};

export const implementationTaskActionRank: Record<ImplementationTaskStatus, number> = {
  blocked: 0,
  doing: 1,
  todo: 2,
  done: 3,
};

export const implementationTaskPriorityRank: Record<ImplementationTaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const implementationTaskExecutionOrder: ImplementationTaskType[] = [
  "planning",
  "design",
  "data",
  "backend",
  "frontend",
  "qa",
  "security",
  "deploy",
];

export const implementationTaskExecutionRank = new Map<ImplementationTaskType, number>(
  implementationTaskExecutionOrder.map((taskType, index) => [taskType, index]),
);

export function getImplementationTaskCreatedAtTime(task: Pick<ImplementationTask, "created_at">) {
  return new Date(task.created_at).getTime();
}

export function compareImplementationTasksByCreatedAt(a: ImplementationTask, b: ImplementationTask) {
  return getImplementationTaskCreatedAtTime(a) - getImplementationTaskCreatedAtTime(b);
}

export function compareImplementationTasksByActionOrder(a: ImplementationTask, b: ImplementationTask) {
  return (
    implementationTaskActionRank[a.status] - implementationTaskActionRank[b.status] ||
    implementationTaskPriorityRank[a.priority] - implementationTaskPriorityRank[b.priority] ||
    a.sort_order - b.sort_order ||
    compareImplementationTasksByCreatedAt(a, b) ||
    a.title.localeCompare(b.title, "ko-KR")
  );
}

export function sortImplementationTasksForAction(tasks: ImplementationTask[]) {
  return [...tasks].sort(compareImplementationTasksByActionOrder);
}

export function getOpenImplementationTasksForAction(tasks: ImplementationTask[]) {
  return sortImplementationTasksForAction(tasks.filter((task) => task.status !== "done"));
}

export function selectAgentRunPackageTasks(filteredTasks: ImplementationTask[], openTasks: ImplementationTask[]) {
  const filteredOpenTasks = filteredTasks.filter((task) => task.status !== "done");

  return filteredOpenTasks.length > 0 ? filteredOpenTasks : openTasks;
}

export function sortImplementationTasksForExecution(tasks: ImplementationTask[]) {
  return [...tasks].sort(compareImplementationTasksByExecutionOrder);
}

export function compareImplementationTasksByExecutionOrder(a: ImplementationTask, b: ImplementationTask) {
  return (
    (implementationTaskExecutionRank.get(a.task_type) ?? 99) -
      (implementationTaskExecutionRank.get(b.task_type) ?? 99) ||
    compareImplementationTasksByActionOrder(a, b)
  );
}

export function buildImplementationTaskProgressStats(tasks: ImplementationTask[]): ImplementationTaskProgressStats {
  const completedTasks = getDoneImplementationTasks(tasks);

  return {
    blockedCount: countBlockedImplementationTasks(tasks),
    completedCount: completedTasks.length,
    completedTasks,
    totalCount: tasks.length,
    byType: buildImplementationTaskTypeStats(tasks),
  };
}

export function buildImplementationTaskTypeStats(tasks: ImplementationTask[]): ImplementationTaskProgressStats["byType"] {
  const byType = createInitialImplementationTaskTypeStats();

  for (const task of tasks) {
    byType[task.task_type].total += 1;

    if (isDoneImplementationTask(task)) {
      byType[task.task_type].done += 1;
    }
  }

  return byType;
}

export function createInitialImplementationTaskTypeStats(): ImplementationTaskProgressStats["byType"] {
  return Object.fromEntries(
    implementationTaskTypes.map((taskType) => [taskType, { done: 0, total: 0 }]),
  ) as ImplementationTaskProgressStats["byType"];
}

export function getDoneImplementationTasks(tasks: ImplementationTask[]) {
  return tasks.filter(isDoneImplementationTask);
}

export function countBlockedImplementationTasks(tasks: ImplementationTask[]) {
  return tasks.filter(isBlockedImplementationTask).length;
}

export function isDoneImplementationTask(task: Pick<ImplementationTask, "status">) {
  return task.status === "done";
}

export function isBlockedImplementationTask(task: Pick<ImplementationTask, "status">) {
  return task.status === "blocked";
}

export function getCompletedImplementationTasksWithEvidence(tasks: ImplementationTask[]) {
  return tasks.filter((task) => isDoneImplementationTask(task) && Boolean(task.evidence.trim()));
}

export function buildImplementationTaskRefreshLoginRequiredMessage() {
  return "작업 상태를 새로고침하려면 먼저 로그인하세요.";
}

export function buildImplementationTaskAutoRefreshMessage() {
  return "Venture Lab에 저장된 작업 상태를 자동 확인 중입니다...";
}

export function buildImplementationTaskManualRefreshMessage() {
  return "Venture Lab에 저장된 작업 상태를 불러오는 중입니다...";
}

export function formatImplementationTaskRefreshTime(refreshedAt = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(refreshedAt);
}

export function buildImplementationTaskRefreshSummary(tasks: ImplementationTask[]): ImplementationTaskRefreshSummary {
  const doneCount = countDoneImplementationTasks(tasks);
  const nextTask = getNextImplementationTaskForRefresh(tasks);

  return {
    doneCount,
    message: buildImplementationTaskRefreshSummaryMessage({
      doneCount,
      nextTask,
      totalCount: tasks.length,
    }),
    nextTask,
    totalCount: tasks.length,
  };
}

export function countDoneImplementationTasks(tasks: ImplementationTask[]) {
  return tasks.filter(isDoneImplementationTask).length;
}

export function getNextImplementationTaskForRefresh(tasks: ImplementationTask[]) {
  return sortImplementationTasksForAction(tasks).find((task) => task.status !== "done") ?? null;
}

export function buildImplementationTaskRefreshSummaryMessage({
  doneCount,
  nextTask,
  totalCount,
}: {
  doneCount: number;
  nextTask: Pick<ImplementationTask, "title"> | null;
  totalCount: number;
}) {
  const nextTaskText = nextTask ? ` 다음 작업은 ${nextTask.title}입니다.` : totalCount > 0 ? " 모든 작업이 완료 상태입니다." : "";

  return `작업 상태 ${totalCount}개를 확인했습니다. 완료 ${doneCount}/${totalCount}.${nextTaskText}`;
}

export function getImplementationTaskReadinessQueues({
  dependencyStatuses,
  openTasks,
}: {
  dependencyStatuses: ImplementationDependencyStatus[];
  openTasks: ImplementationTask[];
}): ImplementationTaskReadinessQueues {
  const readyStatuses = dependencyStatuses.filter((status) => status.ready);
  const waitingStatuses = dependencyStatuses.filter((status) => status.task.status !== "done" && !status.ready);
  const nextTask = readyStatuses[0]?.task ?? openTasks[0] ?? null;
  const nextDependencyStatus = dependencyStatuses.find((status) => status.task.id === nextTask?.id) ?? null;

  return {
    readyStatuses,
    waitingStatuses,
    nextTask,
    nextDependencyStatus,
  };
}

export function getImplementationEvidenceChecklist(task: ImplementationTask, evidence: string) {
  const normalizedEvidence = evidence.toLowerCase();
  const requirements = [...sharedImplementationEvidenceRequirements, ...implementationEvidenceRequirements[task.task_type]];

  return requirements.map((requirement) => ({
    ...requirement,
    passed: requirement.terms.some((term) => normalizedEvidence.includes(term.toLowerCase())),
  }));
}

export function getImplementationTaskOwnerRole(task: ImplementationTask) {
  return task.owner_role.trim() || "owner 미정";
}

export function compareImplementationOwnerRoles(a: string, b: string) {
  return a.localeCompare(b, "ko-KR");
}

export function sortImplementationOwnerRoles(ownerRoles: Iterable<string>) {
  return Array.from(new Set(ownerRoles)).sort(compareImplementationOwnerRoles);
}

export function buildImplementationOwnerOptions(tasks: ImplementationTask[]) {
  return ["all", ...sortImplementationOwnerRoles(tasks.map((task) => getImplementationTaskOwnerRole(task)))];
}

export function buildImplementationOwnerFilterLabels(ownerOptions: string[]) {
  return Object.fromEntries(ownerOptions.map((option) => [option, option === "all" ? "전체 담당" : option])) as Record<
    string,
    string
  >;
}

export function buildImplementationFilterSummary({
  activeOwnerFilter,
  evidenceFilter,
  ownerFilterLabels,
  statusFilter,
}: {
  activeOwnerFilter: string;
  evidenceFilter: ImplementationEvidenceFilter;
  ownerFilterLabels: Record<string, string>;
  statusFilter: ImplementationStatusFilter;
}) {
  return `상태: ${implementationStatusFilterLabels[statusFilter]} / 담당: ${
    ownerFilterLabels[activeOwnerFilter] ?? activeOwnerFilter
  } / 증거: ${implementationEvidenceFilterLabels[evidenceFilter]}`;
}

export function resolveImplementationOwnerFilter(ownerOptions: string[], ownerFilter: string) {
  return ownerOptions.includes(ownerFilter) ? ownerFilter : "all";
}

export function filterImplementationTasks({
  evidenceByTaskId,
  evidenceFilter,
  ownerFilter,
  statusFilter,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  evidenceFilter: ImplementationEvidenceFilter;
  ownerFilter: string;
  statusFilter: ImplementationStatusFilter;
  tasks: ImplementationTask[];
}) {
  return tasks.filter((task) => {
    return matchesImplementationTaskFilters({
      evidenceByTaskId,
      evidenceFilter,
      ownerFilter,
      statusFilter,
      task,
    });
  });
}

export function matchesImplementationTaskFilters({
  evidenceByTaskId,
  evidenceFilter,
  ownerFilter,
  statusFilter,
  task,
}: {
  evidenceByTaskId: Record<string, string>;
  evidenceFilter: ImplementationEvidenceFilter;
  ownerFilter: string;
  statusFilter: ImplementationStatusFilter;
  task: ImplementationTask;
}) {
  return (
    matchesImplementationTaskStatusFilter(task, statusFilter) &&
    matchesImplementationTaskOwnerFilter(task, ownerFilter) &&
    matchesImplementationTaskEvidenceFilter({
      evidenceByTaskId,
      evidenceFilter,
      task,
    })
  );
}

export function matchesImplementationTaskStatusFilter(
  task: ImplementationTask,
  statusFilter: ImplementationStatusFilter,
) {
  return statusFilter === "all" || task.status === statusFilter;
}

export function matchesImplementationTaskOwnerFilter(task: ImplementationTask, ownerFilter: string) {
  return ownerFilter === "all" || getImplementationTaskOwnerRole(task) === ownerFilter;
}

export function matchesImplementationTaskEvidenceFilter({
  evidenceByTaskId,
  evidenceFilter,
  task,
}: {
  evidenceByTaskId: Record<string, string>;
  evidenceFilter: ImplementationEvidenceFilter;
  task: ImplementationTask;
}) {
  if (evidenceFilter === "all") {
    return true;
  }

  const hasEvidenceGap = hasImplementationTaskEvidenceGap(task, evidenceByTaskId);

  return evidenceFilter === "missing" ? hasEvidenceGap : !hasEvidenceGap;
}

export function hasImplementationTaskEvidenceGap(
  task: ImplementationTask,
  evidenceByTaskId: Record<string, string>,
) {
  const currentEvidence = getImplementationTaskEvidence(task, evidenceByTaskId);

  return getImplementationEvidenceChecklist(task, currentEvidence).some((item) => !item.passed);
}

function getImplementationTaskEvidence(task: ImplementationTask, evidenceByTaskId: Record<string, string>) {
  return evidenceByTaskId[task.id] ?? task.evidence ?? "";
}

function getMissingImplementationEvidenceLabels(task: ImplementationTask, evidenceByTaskId: Record<string, string>) {
  const evidence = getImplementationTaskEvidence(task, evidenceByTaskId);
  const checklist = getImplementationEvidenceChecklist(task, evidence);

  return {
    checklist,
    missing: checklist.filter((item) => !item.passed).map((item) => item.label),
  };
}

export function getBlockedImplementationTaskHint(task: ImplementationTask) {
  const playbook = implementationBlockerPlaybooks[task.task_type];

  return {
    ownerRole: task.owner_role.trim() || playbook.fallbackOwner,
    nextAction: playbook.nextAction,
    unblockEvidence: playbook.unblockEvidence,
    escalation: playbook.escalation,
  };
}

export function compareImplementationEvidenceSummaries(
  a: ImplementationEvidenceSummary,
  b: ImplementationEvidenceSummary,
) {
  return (
    b.missing.length - a.missing.length ||
    implementationTaskPriorityRank[a.task.priority] - implementationTaskPriorityRank[b.task.priority] ||
    implementationTaskActionRank[a.task.status] - implementationTaskActionRank[b.task.status] ||
    a.task.sort_order - b.task.sort_order
  );
}

export function buildImplementationEvidenceSummaries({
  evidenceByTaskId,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  tasks: ImplementationTask[];
}): ImplementationEvidenceSummary[] {
  return tasks
    .map((task) => {
      const { checklist, missing } = getMissingImplementationEvidenceLabels(task, evidenceByTaskId);

      return {
        task,
        missing,
        passedCount: checklist.length - missing.length,
        totalCount: checklist.length,
      };
    })
    .sort(compareImplementationEvidenceSummaries);
}

export function getImplementationEvidenceIssues(summaries: ImplementationEvidenceSummary[]) {
  return summaries.filter((summary) => summary.missing.length > 0);
}

export function compareBlockedImplementationSummaries(
  a: BlockedImplementationSummary,
  b: BlockedImplementationSummary,
) {
  return (
    implementationTaskPriorityRank[a.task.priority] - implementationTaskPriorityRank[b.task.priority] ||
    b.missing.length - a.missing.length ||
    a.task.sort_order - b.task.sort_order
  );
}

export function buildBlockedImplementationSummaries({
  evidenceByTaskId,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  tasks: ImplementationTask[];
}): BlockedImplementationSummary[] {
  return tasks
    .filter((task) => task.status === "blocked")
    .map((task) => ({
      task,
      hint: getBlockedImplementationTaskHint(task),
      missing: getMissingImplementationEvidenceLabels(task, evidenceByTaskId).missing,
    }))
    .sort(compareBlockedImplementationSummaries);
}

export function getVisibleImplementationTaskStatuses(statusFilter: ImplementationStatusFilter): ImplementationTaskStatus[] {
  return statusFilter === "all" ? implementationTaskStatuses : [statusFilter];
}

export function buildImplementationTaskCardSummary(
  task: ImplementationTask,
  evidenceByTaskId: Record<string, string>,
): ImplementationTaskCardSummary {
  const evidence = getImplementationTaskEvidence(task, evidenceByTaskId);
  const evidenceChecklist = getImplementationEvidenceChecklist(task, evidence);
  const missingEvidenceLabels = evidenceChecklist.filter((item) => !item.passed).map((item) => item.label);

  return {
    task,
    evidence,
    evidenceChecklist,
    passedEvidenceCount: evidenceChecklist.length - missingEvidenceLabels.length,
    missingEvidenceLabels,
    blockedHint: task.status === "blocked" ? getBlockedImplementationTaskHint(task) : null,
  };
}

export function buildImplementationTaskBoardColumns({
  evidenceByTaskId,
  statuses,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  statuses: ImplementationTaskStatus[];
  tasks: ImplementationTask[];
}): ImplementationTaskBoardColumn[] {
  return statuses.map((status) => ({
    status,
    taskSummaries: tasks
      .filter((task) => task.status === status)
      .map((task) => buildImplementationTaskCardSummary(task, evidenceByTaskId)),
  }));
}

export type ImplementationTaskReviewState = {
  activeImplementationOwnerFilter: string;
  blockedImplementationSummaries: BlockedImplementationSummary[];
  filteredImplementationTasks: ImplementationTask[];
  implementationEvidenceIssues: ImplementationEvidenceSummary[];
  implementationEvidenceSummaries: ImplementationEvidenceSummary[];
  implementationFilterSummary: string;
  implementationOwnerFilterLabels: Record<string, string>;
  implementationOwnerOptions: string[];
  implementationTaskBoardColumns: ImplementationTaskBoardColumn[];
  visibleImplementationStatuses: ImplementationTaskStatus[];
};

export function buildImplementationTaskReviewState({
  evidenceByTaskId,
  evidenceFilter,
  ownerFilter,
  statusFilter,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  evidenceFilter: ImplementationEvidenceFilter;
  ownerFilter: string;
  statusFilter: ImplementationStatusFilter;
  tasks: ImplementationTask[];
}): ImplementationTaskReviewState {
  const implementationEvidenceSummaries = buildImplementationEvidenceSummaries({
    evidenceByTaskId,
    tasks,
  });
  const implementationOwnerOptions = buildImplementationOwnerOptions(tasks);
  const activeImplementationOwnerFilter = resolveImplementationOwnerFilter(implementationOwnerOptions, ownerFilter);
  const implementationOwnerFilterLabels = buildImplementationOwnerFilterLabels(implementationOwnerOptions);
  const filteredImplementationTasks = filterImplementationTasks({
    evidenceByTaskId,
    evidenceFilter,
    ownerFilter: activeImplementationOwnerFilter,
    statusFilter,
    tasks,
  });
  const visibleImplementationStatuses = getVisibleImplementationTaskStatuses(statusFilter);

  return {
    activeImplementationOwnerFilter,
    blockedImplementationSummaries: buildBlockedImplementationSummaries({
      evidenceByTaskId,
      tasks,
    }),
    filteredImplementationTasks,
    implementationEvidenceIssues: getImplementationEvidenceIssues(implementationEvidenceSummaries),
    implementationEvidenceSummaries,
    implementationFilterSummary: buildImplementationFilterSummary({
      activeOwnerFilter: activeImplementationOwnerFilter,
      evidenceFilter,
      ownerFilterLabels: implementationOwnerFilterLabels,
      statusFilter,
    }),
    implementationOwnerFilterLabels,
    implementationOwnerOptions,
    implementationTaskBoardColumns: buildImplementationTaskBoardColumns({
      evidenceByTaskId,
      statuses: visibleImplementationStatuses,
      tasks: filteredImplementationTasks,
    }),
    visibleImplementationStatuses,
  };
}

export const implementationTaskTypeLabels: Record<ImplementationTaskType, string> = {
  planning: "기획",
  design: "디자인",
  frontend: "프론트",
  backend: "백엔드",
  data: "데이터",
  qa: "품질 점검",
  security: "보안",
  deploy: "배포",
};

export const sharedImplementationEvidenceRequirements: EvidenceRequirement[] = [
  { label: "커밋/PR", terms: ["commit", "커밋", "PR", "pull request"] },
  { label: "검증 결과", terms: ["pnpm", "lint", "typecheck", "build", "quality", "검증"] },
];

export const implementationEvidenceRequirements: Record<ImplementationTaskType, EvidenceRequirement[]> = {
  planning: [
    { label: "기획/첫 제작 범위", terms: ["PRD", "MVP", "범위", "scope"] },
    { label: "중단 기준", terms: ["중단", "kill", "no-go", "No-go"] },
  ],
  design: [
    { label: "핵심 화면", terms: ["화면", "screen", "flow", "여정"] },
    { label: "상태/모바일", terms: ["빈 상태", "오류", "모바일", "accessibility", "접근성"] },
  ],
  frontend: [
    { label: "사용자 여정", terms: ["스모크", "smoke", "저장", "조회", "journey"] },
    { label: "상태 UX", terms: ["로딩", "오류", "성공", "권한", "read-only"] },
  ],
  backend: [
    { label: "허용/차단", terms: ["허용", "차단", "allowed", "denied"] },
    { label: "RLS/Rules", terms: ["RLS", "Security Rules", "IAM", "with check"] },
  ],
  data: [
    { label: "마이그레이션", terms: ["migration", "마이그레이션", "SQL", "schema"] },
    { label: "되돌림/보정", terms: ["rollback", "롤백", "보정", "revert"] },
  ],
  qa: [
    { label: "스모크 경로", terms: ["smoke", "스모크", "수동", "browser"] },
    { label: "실패/회귀", terms: ["실패", "회귀", "regression", "재현"] },
  ],
  security: [
    { label: "비밀값/PII", terms: ["secret", "비밀값", "PII", "개인정보", "NEXT_PUBLIC"] },
    { label: "권한 차단", terms: ["권한", "차단", "RLS", "Security Rules", "abuse"] },
  ],
  deploy: [
    { label: "Preview/Production", terms: ["Preview", "Production", "프로덕션"] },
    { label: "Vercel 로그", terms: ["Vercel inspect", "deploy log", "배포 로그", "빌드 로그"] },
    { label: "롤백 기준", terms: ["rollback", "롤백", "last known good", "직전"] },
  ],
};

export const implementationBlockerPlaybooks: Record<ImplementationTaskType, BlockerPlaybook> = {
  planning: {
    fallbackOwner: "prd-writer",
    nextAction: "제품 기획 범위, 중단 기준, 의사결정권자를 먼저 확정하세요.",
    unblockEvidence: "승인된 기획 범위와 no-go 기준을 근거에 남기면 해소로 봅니다.",
    escalation: "범위 충돌이 남으면 최종 결정권자에게 판단을 올립니다.",
  },
  design: {
    fallbackOwner: "design-reviewer",
    nextAction: "핵심 화면, 빈 상태, 오류 상태, 모바일 흐름 중 빠진 화면을 지정하세요.",
    unblockEvidence: "화면 목록, 주요 여정, 접근성/모바일 확인 결과를 증거에 남깁니다.",
    escalation: "사용자 흐름이 갈리면 기획 담당자와 범위를 다시 정합니다.",
  },
  frontend: {
    fallbackOwner: "prototype-builder",
    nextAction: "막힌 사용자 여정과 재현 경로를 하나로 좁히고 상태 UX를 확인하세요.",
    unblockEvidence: "수정 커밋, 스모크 경로, 성공/오류/권한 상태 확인 결과를 남깁니다.",
    escalation: "API나 권한 문제라면 백엔드 담당자에게 넘깁니다.",
  },
  backend: {
    fallbackOwner: "backend-builder",
    nextAction: "RLS 또는 Security Rules의 허용/차단 조건을 먼저 재현하세요.",
    unblockEvidence: "허용 케이스와 차단 케이스, SQL/Rules 변경, 검증 명령을 남깁니다.",
    escalation: "운영 데이터 접근 범위가 불명확하면 보안/데이터 담당자와 함께 봅니다.",
  },
  data: {
    fallbackOwner: "data-modeler",
    nextAction: "스키마, 마이그레이션, 롤백/보정 계획 중 막힌 지점을 분리하세요.",
    unblockEvidence: "SQL 또는 migration, 샘플 데이터 확인, 되돌림 계획을 남깁니다.",
    escalation: "기존 데이터 손상 가능성이 있으면 수동 백업 확인 후 진행합니다.",
  },
  qa: {
    fallbackOwner: "qa-runner",
    nextAction: "실패한 경로를 재현 가능한 한 줄 시나리오로 줄이세요.",
    unblockEvidence: "실패 재현, 수정 커밋, 재실행 결과, 남은 회귀 리스크를 남깁니다.",
    escalation: "반복 실패면 해당 구현 담당자에게 재배정합니다.",
  },
  security: {
    fallbackOwner: "security-reviewer",
    nextAction: "비밀값, PII, 권한 우회, abuse case 중 차단 원인을 분류하세요.",
    unblockEvidence: "노출 범위, 차단 규칙, allowed/denied 검증, 남은 리스크를 남깁니다.",
    escalation: "개인정보나 비밀값 노출 가능성이 있으면 출시 판단을 중지합니다.",
  },
  deploy: {
    fallbackOwner: "release-manager",
    nextAction: "Preview/Production 배포 상태, 환경변수, Vercel 로그를 먼저 확인하세요.",
    unblockEvidence: "배포 URL, Vercel inspect 또는 로그, production smoke, 롤백 기준을 남깁니다.",
    escalation: "운영 장애 가능성이 있으면 직전 정상 배포로 되돌리는 기준을 우선 기록합니다.",
  },
};

export const implementationRunFocus: Record<ImplementationTaskType, string> = {
  planning: "기획 범위, 첫 제작 범위, 제외 범위, 중단 기준, 승인 근거를 정합니다.",
  design: "핵심 화면, 상태 UX, 모바일/접근성, 첫 가치 도달 흐름을 구체화합니다.",
  frontend: "입력, 저장, 조회, 상태 메시지, 모바일 레이아웃을 실제 사용자 여정 기준으로 구현합니다.",
  backend: "데이터 모델, API/Server Action 경계, RLS 또는 Security Rules 허용/차단을 검증합니다.",
  data: "스키마, 마이그레이션, 샘플 데이터, 롤백/보정 계획을 안전하게 다룹니다.",
  qa: "핵심 경로, 인증 전/후, 읽기 전용, 빈/오류/로딩 상태와 회귀를 검증합니다.",
  security: "PII, 비밀값, 권한 우회, abuse, 보관/삭제 경로를 출시 차단 관점으로 봅니다.",
  deploy: "Preview/Production, Vercel 로그, 환경변수, production smoke, 롤백 기준을 확인합니다.",
};

export const implementationDependencyRules: Record<ImplementationTaskType, ImplementationDependencyRule> = {
  planning: {
    prerequisites: [],
    gate: "제품 범위 잠금",
    nextAction: "기획서, 첫 제작 범위, 제외 범위, 성공 지표, 중단 기준을 먼저 고정합니다.",
  },
  design: {
    prerequisites: ["planning"],
    gate: "기획 범위 승인",
    nextAction: "첫 제작 범위의 사용자 여정, 빈 상태, 오류, 모바일, 접근성 상태를 확정합니다.",
  },
  data: {
    prerequisites: ["planning"],
    gate: "데이터 경계 확정",
    nextAction: "엔티티, 소유권, 조직 경계, 마이그레이션, 샘플 데이터를 먼저 정의합니다.",
  },
  backend: {
    prerequisites: ["data"],
    gate: "데이터 모델 준비",
    nextAction: "API/Server Action, RLS 또는 Security Rules 허용/차단 조건을 구현합니다.",
  },
  frontend: {
    prerequisites: ["design", "backend"],
    gate: "화면 흐름과 저장 경계 준비",
    nextAction: "핵심 입력, 저장, 조회, 상태 메시지를 첫 수직 슬라이스로 구현합니다.",
  },
  qa: {
    prerequisites: ["frontend", "backend"],
    gate: "핵심 여정 구현",
    nextAction: "핵심 여정, 오류 상태, 모바일, 회귀 스모크를 검증합니다.",
  },
  security: {
    prerequisites: ["backend", "data"],
    gate: "권한/데이터 경계 구현",
    nextAction: "개인정보, 비밀값, 권한 우회, 로그 민감정보, 고위험 리스크를 검토합니다.",
  },
  deploy: {
    prerequisites: ["qa", "security"],
    gate: "품질 점검/보안 완료",
    nextAction: "Preview/Production 배포, smoke, inspect URL, 롤백 기준을 기록합니다.",
  },
};

export function buildImplementationDependencyStatuses(tasks: ImplementationTask[]): ImplementationDependencyStatus[] {
  const taskTypes = new Set(tasks.map((task) => task.task_type));
  const completedTypes = new Set(tasks.filter((task) => task.status === "done").map((task) => task.task_type));

  return sortImplementationTasksForExecution(tasks).map((task) => {
    const rule = implementationDependencyRules[task.task_type];
    const completedPrerequisites: ImplementationTaskType[] = [];
    const missingPrerequisites: ImplementationTaskType[] = [];
    const blockers = rule.prerequisites.flatMap((prerequisite) => {
      if (completedTypes.has(prerequisite)) {
        completedPrerequisites.push(prerequisite);
        return [];
      }

      missingPrerequisites.push(prerequisite);

      return [
        taskTypes.has(prerequisite)
          ? `${implementationTaskTypeLabels[prerequisite]} 태스크 완료 필요`
          : `${implementationTaskTypeLabels[prerequisite]} 태스크 생성 필요`,
      ];
    });

    if (task.status === "blocked") {
      blockers.unshift("현재 차단 상태입니다. 차단 해소 큐의 다음 액션과 해소 증거를 먼저 남기세요.");
    }

    return {
      task,
      ready: task.status !== "done" && blockers.length === 0,
      blockers,
      completedPrerequisites,
      missingPrerequisites,
      gate: rule.gate,
      nextAction: rule.nextAction,
    };
  });
}
