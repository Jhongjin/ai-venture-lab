import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import type { ImplementationTaskStatus } from "@/lib/supabase/types";
import type { ImplementationTask } from "@/lib/venture-data";

export type ImplementationTaskInsertRow = {
  idea_id: string;
  organization_id: string | null;
  source_artifact_id: string | null;
  title: string;
  task_type: ImplementationTaskDraft["task_type"];
  priority: ImplementationTaskDraft["priority"];
  status: ImplementationTaskStatus;
  owner_role: string;
  acceptance_criteria: string;
  evidence: string;
  sort_order: number;
};

export type ImplementationTaskEvidencePatch = {
  evidence: string;
};

export type ImplementationTaskStatusPatch<Status extends string> = {
  status: Status;
};

export type ImplementationTaskCreateControlState = {
  disabled: boolean;
  label: string;
};

export type ImplementationTaskCreateControlStates = {
  defaultTasks: ImplementationTaskCreateControlState;
  manualTask: ImplementationTaskCreateControlState;
};

export type ImplementationTaskActionControlState = {
  disabled: boolean;
  label: string;
};

export type ImplementationTaskEvidenceEditControlState = {
  disabled: boolean;
  placeholder: string;
};

export type ImplementationTaskStatusActionControlState = ImplementationTaskActionControlState & {
  status: ImplementationTaskStatus;
};

export type ImplementationTaskCardControlStates = {
  evidenceEdit: ImplementationTaskEvidenceEditControlState;
  evidenceSave: ImplementationTaskActionControlState;
  statusActions: ImplementationTaskStatusActionControlState[];
};

export type ImplementationTaskExperienceMode = "guided" | "full";

export type ImplementationTaskVisibilityState = {
  hasAnyTasks: boolean;
  showBlockedPanel: boolean;
  showDependencyPanel: boolean;
  showEvidenceIssuePreview: boolean;
  showEvidencePanel: boolean;
  showFilteredTaskBoard: boolean;
  showFilteredTaskEmptyState: boolean;
  showFullTaskOverview: boolean;
  showGuidedTaskPreview: boolean;
  showNoTasksMessage: boolean;
  showNextActionPanel: boolean;
};

export type ImplementationTaskTableError = {
  code?: string | null;
  message: string;
};

const missingImplementationTasksTableMessage =
  "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요.";

export function buildImplementationTasksCreatedMessage(taskCount: number) {
  return `${taskCount}개의 제작 할 일을 만들었습니다.`;
}

export function buildImplementationTasksCreateLoginRequiredMessage() {
  return "제작 할 일을 만들려면 먼저 로그인하세요.";
}

export function buildImplementationTasksAlreadyExistMessage() {
  return "이 아이디어에는 이미 기본 제작 할 일이 있습니다.";
}

export function buildImplementationTaskCreateControlStates({
  hasUser,
  isBusy,
}: {
  hasUser: boolean;
  isBusy: boolean;
}): ImplementationTaskCreateControlStates {
  const disabled = isBusy || !hasUser;

  return {
    defaultTasks: {
      disabled,
      label: "기본 태스크 생성",
    },
    manualTask: {
      disabled,
      label: "태스크 추가",
    },
  };
}

export function buildImplementationTaskVisibilityState({
  blockedSummaryCount,
  dependencyStatusCount,
  evidenceIssueCount,
  evidenceSummaryCount,
  experienceMode,
  filteredTaskCount,
  selectedTaskCount,
}: {
  blockedSummaryCount: number;
  dependencyStatusCount: number;
  evidenceIssueCount: number;
  evidenceSummaryCount: number;
  experienceMode: ImplementationTaskExperienceMode;
  filteredTaskCount: number;
  selectedTaskCount: number;
}): ImplementationTaskVisibilityState {
  const hasAnyTasks = selectedTaskCount > 0;
  const isFullMode = experienceMode === "full";

  return {
    hasAnyTasks,
    showBlockedPanel: isFullMode && blockedSummaryCount > 0,
    showDependencyPanel: isFullMode && dependencyStatusCount > 0,
    showEvidenceIssuePreview: isFullMode && evidenceSummaryCount > 0 && evidenceIssueCount > 0,
    showEvidencePanel: isFullMode && evidenceSummaryCount > 0,
    showFilteredTaskBoard: isFullMode && filteredTaskCount > 0,
    showFilteredTaskEmptyState: isFullMode && hasAnyTasks && filteredTaskCount === 0,
    showFullTaskOverview: isFullMode && hasAnyTasks,
    showGuidedTaskPreview: experienceMode === "guided" && hasAnyTasks,
    showNoTasksMessage: !hasAnyTasks,
    showNextActionPanel: hasAnyTasks,
  };
}

export function buildImplementationTaskStartControlState({
  canManage,
  isBusy,
}: {
  canManage: boolean;
  isBusy: boolean;
}): ImplementationTaskActionControlState {
  return {
    disabled: isBusy || !canManage,
    label: "진행 시작",
  };
}

export function buildImplementationTaskEvidenceEditControlState({
  canManage,
  isBusy,
}: {
  canManage: boolean;
  isBusy: boolean;
}): ImplementationTaskEvidenceEditControlState {
  return {
    disabled: isBusy || !canManage,
    placeholder: "완료 증거, PR/커밋, 스모크 결과, 남은 리스크",
  };
}

export function buildImplementationTaskEvidenceSaveControlState({
  canManage,
  currentEvidence,
  draftEvidence,
  isBusy,
}: {
  canManage: boolean;
  currentEvidence: string | null | undefined;
  draftEvidence: string;
  isBusy: boolean;
}): ImplementationTaskActionControlState {
  return {
    disabled: isBusy || !canManage || draftEvidence === (currentEvidence ?? ""),
    label: "증거 저장",
  };
}

export function buildImplementationTaskStatusControlState({
  canManage,
  currentStatus,
  isBusy,
  nextStatus,
  statusLabel,
}: {
  canManage: boolean;
  currentStatus: ImplementationTaskStatus;
  isBusy: boolean;
  nextStatus: ImplementationTaskStatus;
  statusLabel: string;
}): ImplementationTaskActionControlState {
  return {
    disabled: isBusy || !canManage || currentStatus === nextStatus,
    label: statusLabel,
  };
}

export function buildImplementationTaskCardControlStates({
  canManage,
  currentEvidence,
  currentStatus,
  draftEvidence,
  isBusy,
  statusLabels,
  statuses,
}: {
  canManage: boolean;
  currentEvidence: string | null | undefined;
  currentStatus: ImplementationTaskStatus;
  draftEvidence: string;
  isBusy: boolean;
  statusLabels: Record<ImplementationTaskStatus, string>;
  statuses: ImplementationTaskStatus[];
}): ImplementationTaskCardControlStates {
  return {
    evidenceEdit: buildImplementationTaskEvidenceEditControlState({
      canManage,
      isBusy,
    }),
    evidenceSave: buildImplementationTaskEvidenceSaveControlState({
      canManage,
      currentEvidence,
      draftEvidence,
      isBusy,
    }),
    statusActions: statuses.map((nextStatus) => ({
      status: nextStatus,
      ...buildImplementationTaskStatusControlState({
        canManage,
        currentStatus,
        isBusy,
        nextStatus,
        statusLabel: statusLabels[nextStatus],
      }),
    })),
  };
}

export function buildManualImplementationTaskCreatedMessage() {
  return "제작 할 일을 추가했습니다.";
}

export function buildManualImplementationTaskLoginRequiredMessage() {
  return "제작 할 일을 추가하려면 먼저 로그인하세요.";
}

export function buildManualImplementationTaskTitleRequiredMessage() {
  return "제작 할 일 제목은 필수입니다.";
}

export function buildImplementationTaskStatusChangedMessage({
  statusLabel,
  taskTitle,
}: {
  statusLabel: string;
  taskTitle: string;
}) {
  return `${taskTitle} 상태를 ${statusLabel}(으)로 변경했습니다.`;
}

export function buildImplementationTaskStatusUpdatePermissionDeniedMessage() {
  return "제작 할 일 작성자 또는 협업 공간 관리자만 이 할 일을 수정할 수 있습니다.";
}

export function buildImplementationTaskEvidenceSavedMessage() {
  return "제작 할 일 근거를 저장했습니다.";
}

export function buildImplementationTaskEvidenceSavePermissionDeniedMessage() {
  return "제작 할 일 작성자 또는 협업 공간 관리자만 이 근거를 저장할 수 있습니다.";
}

function normalizeImplementationTaskTitle(value: string) {
  return value.trim().toLowerCase();
}

export function getMissingImplementationTaskDrafts({
  drafts,
  existingTasks,
}: {
  drafts: ImplementationTaskDraft[];
  existingTasks: Pick<ImplementationTask, "title">[];
}) {
  const existingTitles = new Set(existingTasks.map((task) => normalizeImplementationTaskTitle(task.title)));

  return drafts.filter((task) => !existingTitles.has(normalizeImplementationTaskTitle(task.title)));
}

export function buildImplementationTaskInsertRows({
  drafts,
  existingTaskCount,
  ideaId,
  organizationId,
  sourceArtifactId,
}: {
  drafts: ImplementationTaskDraft[];
  existingTaskCount: number;
  ideaId: string;
  organizationId: string | null;
  sourceArtifactId: string | null;
}): ImplementationTaskInsertRow[] {
  return drafts.map((task, index) => ({
    idea_id: ideaId,
    organization_id: organizationId,
    source_artifact_id: sourceArtifactId,
    title: task.title,
    task_type: task.task_type,
    priority: task.priority,
    status: "todo",
    owner_role: task.owner_role,
    acceptance_criteria: task.acceptance_criteria,
    evidence: "",
    sort_order: existingTaskCount + index,
  }));
}

export function buildManualImplementationTaskInsertRow({
  draft,
  existingTaskCount,
  ideaId,
  organizationId,
  sourceArtifactId,
}: {
  draft: ImplementationTaskDraft;
  existingTaskCount: number;
  ideaId: string;
  organizationId: string | null;
  sourceArtifactId: string | null;
}): ImplementationTaskInsertRow {
  return {
    idea_id: ideaId,
    organization_id: organizationId,
    source_artifact_id: sourceArtifactId,
    title: draft.title.trim(),
    task_type: draft.task_type,
    priority: draft.priority,
    status: "todo",
    owner_role: draft.owner_role.trim(),
    acceptance_criteria: draft.acceptance_criteria.trim(),
    evidence: "",
    sort_order: existingTaskCount,
  };
}

export function buildImplementationTaskEvidencePatch(
  evidence: string | null | undefined,
  fallbackEvidence: string | null | undefined = "",
): ImplementationTaskEvidencePatch {
  return { evidence: evidence ?? fallbackEvidence ?? "" };
}

export function buildImplementationTaskStatusPatch<Status extends string>(
  status: Status,
): ImplementationTaskStatusPatch<Status> {
  return { status };
}

export function buildImplementationTaskCreatedTelemetryProperties(
  task: Pick<ImplementationTask, "owner_role" | "priority" | "task_type">,
) {
  return {
    task_type: task.task_type,
    priority: task.priority,
    owner_role: task.owner_role || "미정",
  };
}

export function buildImplementationTasksCreatedTelemetryProperties({
  hasSourceArtifact,
  taskCount,
}: {
  hasSourceArtifact: boolean;
  taskCount: number;
}) {
  return {
    task_count: taskCount,
    source_artifact: hasSourceArtifact ? "yes" : "no",
  };
}

export function buildImplementationTaskStatusTelemetryProperties({
  previousStatus,
  task,
}: {
  previousStatus: ImplementationTaskStatus;
  task: Pick<ImplementationTask, "status" | "task_type">;
}) {
  return {
    task_type: task.task_type,
    status: task.status,
    previous_status: previousStatus,
  };
}

export function buildImplementationTaskEvidenceTelemetryProperties(
  task: Pick<ImplementationTask, "evidence" | "status" | "task_type">,
) {
  return {
    task_type: task.task_type,
    evidence_length: task.evidence.length,
    status: task.status,
  };
}

export function getImplementationTaskTableErrorMessage(error: ImplementationTaskTableError) {
  return error.code === "42P01" ? missingImplementationTasksTableMessage : error.message;
}
