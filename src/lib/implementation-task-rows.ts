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

export type ImplementationTaskTableError = {
  code?: string | null;
  message: string;
};

const missingImplementationTasksTableMessage =
  "implementation_tasks 테이블이 아직 없습니다. 이번 배포의 Supabase SQL을 먼저 실행하세요.";

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

export function getImplementationTaskTableErrorMessage(error: ImplementationTaskTableError) {
  return error.code === "42P01" ? missingImplementationTasksTableMessage : error.message;
}
