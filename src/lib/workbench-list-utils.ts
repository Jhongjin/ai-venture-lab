import type { Idea } from "@/lib/venture-data";
import type { IdeaStage, OrganizationRole } from "@/lib/supabase/types";

export type WorkbenchIdeaFilterMode = "all" | "mine" | "read_only";
export type WorkbenchRecordAccessState = "owned" | "workspace_admin" | "workspace_member" | "hidden";
export type WorkbenchRecordAccessDisplay = {
  accessState: WorkbenchRecordAccessState;
  isManageable: boolean;
  isOwned: boolean;
  isWorkspaceAdmin: boolean;
  label: string;
  pillTone: "avl-pill-success" | "avl-pill-neutral";
};
export type WorkbenchAccessRecord = { created_by: string | null; organization_id: string | null };
export type WorkbenchAccessMembership = {
  organization_id: string;
  role: OrganizationRole;
  user_id: string;
};
export type WorkbenchAccessViewer = { id: string } | null;

const ideaStageOrder: IdeaStage[] = ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"];
const ideaStageRank = new Map(ideaStageOrder.map((stage, index) => [stage, index]));
const ideaDeletionRelatedTables = [
  "telemetry_events",
  "implementation_tasks",
  "venture_artifacts",
  "orchestration_runs",
  "experiments",
  "decisions",
  "risks",
] as const;

export const workbenchAdminRoles = new Set<OrganizationRole>(["owner", "admin"]);
export const workbenchIdeaSelectionRequiredMessage = "먼저 아이디어를 선택하세요.";
export const workbenchStorageConnectionRequiredMessage = "저장 연결을 먼저 확인해 주세요.";
export const workbenchStorageNotConfiguredMessage = "저장 연결이 설정되어 있지 않습니다.";
export type IdeaDeletionRelatedTable = (typeof ideaDeletionRelatedTables)[number];

export function getIdeaStageRank(stage: IdeaStage) {
  return ideaStageRank.get(stage) ?? 99;
}

export function getIdeaDeletionRelatedTables(): readonly IdeaDeletionRelatedTable[] {
  return ideaDeletionRelatedTables;
}

export function isIdeaStageAtOrAfter(stage: IdeaStage, targetStage: IdeaStage) {
  return getIdeaStageRank(stage) >= getIdeaStageRank(targetStage);
}

export function isDiscardedIdea(idea: Idea) {
  return idea.decision === "kill";
}

export function isWorkbenchAdminRole(role: OrganizationRole) {
  return workbenchAdminRoles.has(role);
}

export function buildDiscardIdeaPatch(now = new Date().toISOString()) {
  return {
    decision: "kill" as const,
    stage: "paused" as const,
    updated_at: now,
  };
}

export function buildRestoreIdeaPatch(now = new Date().toISOString()) {
  return {
    decision: "research_more" as const,
    stage: "score" as const,
    updated_at: now,
  };
}

export function getWorkbenchRecordAccessState({
  memberships,
  record,
  user,
}: {
  memberships: WorkbenchAccessMembership[];
  record: WorkbenchAccessRecord;
  user: WorkbenchAccessViewer;
}): WorkbenchRecordAccessState {
  if (!user) {
    return "hidden";
  }

  if (record.created_by === user.id) {
    return "owned";
  }

  if (!record.organization_id) {
    return "hidden";
  }

  const membership = memberships.find(
    (entry) => entry.user_id === user.id && entry.organization_id === record.organization_id,
  );

  if (!membership) {
    return "hidden";
  }

  return isWorkbenchAdminRole(membership.role) ? "workspace_admin" : "workspace_member";
}

export function canManageWorkbenchRecord(args: {
  memberships: WorkbenchAccessMembership[];
  record: WorkbenchAccessRecord;
  user: WorkbenchAccessViewer;
}) {
  const accessState = getWorkbenchRecordAccessState(args);
  return accessState === "owned" || accessState === "workspace_admin";
}

export function getWorkbenchRecordAccessDisplay(accessState: WorkbenchRecordAccessState): WorkbenchRecordAccessDisplay {
  const isOwned = accessState === "owned";
  const isWorkspaceAdmin = accessState === "workspace_admin";
  const isManageable = isOwned || isWorkspaceAdmin;
  const labels: Record<WorkbenchRecordAccessState, string> = {
    hidden: "숨김",
    owned: "내 기록",
    workspace_admin: "팀 관리자",
    workspace_member: "팀 기록",
  };

  return {
    accessState,
    isManageable,
    isOwned,
    isWorkspaceAdmin,
    label: labels[accessState],
    pillTone: isManageable ? "avl-pill-success" : "avl-pill-neutral",
  };
}

export function getActiveIdeas(nextIdeas: Idea[]) {
  return nextIdeas.filter((idea) => !isDiscardedIdea(idea));
}

export function sortWorkbenchIdeas(nextIdeas: Idea[]) {
  return [...nextIdeas].sort(
    (a, b) =>
      getIdeaStageRank(a.stage) - getIdeaStageRank(b.stage) ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime() ||
      a.name.localeCompare(b.name, "ko-KR"),
  );
}

export function filterVisibleWorkbenchIdeas(
  nextIdeas: Idea[],
  filterMode: WorkbenchIdeaFilterMode,
  getRecordAccessState: (idea: Idea) => WorkbenchRecordAccessState,
) {
  const activeRecords = getActiveIdeas(nextIdeas);

  if (filterMode === "mine") {
    return sortWorkbenchIdeas(activeRecords.filter((idea) => getRecordAccessState(idea) === "owned"));
  }

  if (filterMode === "read_only") {
    return sortWorkbenchIdeas(
      activeRecords.filter((idea) => {
        const accessState = getRecordAccessState(idea);
        return accessState === "workspace_admin" || accessState === "workspace_member";
      }),
    );
  }

  return sortWorkbenchIdeas(activeRecords.filter((idea) => getRecordAccessState(idea) !== "hidden"));
}

export function getVisibleActiveIdeaCount(
  nextIdeas: Idea[],
  getRecordAccessState: (idea: Idea) => WorkbenchRecordAccessState,
) {
  return getActiveIdeas(nextIdeas).filter((idea) => getRecordAccessState(idea) !== "hidden").length;
}

export function getVisibleDiscardedIdeas(
  nextIdeas: Idea[],
  getRecordAccessState: (idea: Idea) => WorkbenchRecordAccessState,
) {
  return sortWorkbenchIdeas(nextIdeas.filter((idea) => isDiscardedIdea(idea) && getRecordAccessState(idea) !== "hidden"));
}

export function upsertWorkbenchIdea(current: Idea[], nextIdea: Idea) {
  const exists = current.some((idea) => idea.id === nextIdea.id);
  const nextIdeas = exists
    ? current.map((idea) => (idea.id === nextIdea.id ? nextIdea : idea))
    : [nextIdea, ...current];

  return sortWorkbenchIdeas(nextIdeas);
}

export function upsertRecordById<T extends { id: string }>(records: T[], nextRecord: T) {
  return records.some((record) => record.id === nextRecord.id)
    ? records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
    : [nextRecord, ...records];
}

export function upsertRecordsById<T extends { id: string }>(records: T[], nextRecords: T[]) {
  return nextRecords.reduce((current, record) => upsertRecordById(current, record), records);
}

export function replaceRecordById<T extends { id: string }>(records: T[], nextRecord: T) {
  return records.map((record) => (record.id === nextRecord.id ? nextRecord : record));
}

export function replaceRecordsById<T extends { id: string }>(records: T[], nextRecords: T[]) {
  const recordsById = new Map(nextRecords.map((record) => [record.id, record]));
  return records.map((record) => recordsById.get(record.id) ?? record);
}

export function prependRecord<T>(records: T[], nextRecord: T) {
  return [nextRecord, ...records];
}

export function prependRecords<T>(records: T[], nextRecords: readonly T[]) {
  return [...nextRecords, ...records];
}

export function appendRecord<T>(records: T[], nextRecord: T) {
  return [...records, nextRecord];
}

export function appendRecords<T>(records: T[], nextRecords: readonly T[]) {
  return [...records, ...nextRecords];
}

export function mergeRecordMap<T>(record: Record<string, T>, nextRecord: Record<string, T>) {
  return { ...record, ...nextRecord };
}

export function removeRecordById<T extends { id: string }>(records: T[], recordId: string) {
  return records.filter((record) => record.id !== recordId);
}

export function removeRecordsByIdeaId<T extends { idea_id: string | null }>(records: T[], ideaId: string) {
  return records.filter((record) => record.idea_id !== ideaId);
}

export function omitRecordKey<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

export function setRecordKey<T>(record: Record<string, T>, key: string, value: T) {
  return { ...record, [key]: value };
}
