import type { Idea } from "@/lib/venture-data";
import type { ProductSurfaceProfile } from "@/lib/product-surface";
import type { IdeaStage, OrganizationRole } from "@/lib/supabase/types";
import type { WorkbenchIdeaProgress, WorkbenchTask } from "@/lib/workbench-tasks";

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
export type WorkbenchIdeaDisplayState = {
  accessDisplay: WorkbenchRecordAccessDisplay;
  productSurface: ProductSurfaceProfile;
  progress: WorkbenchIdeaProgress;
};

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
export const workbenchIdeaFilterModes: WorkbenchIdeaFilterMode[] = ["all", "mine", "read_only"];
export const workbenchIdeaCreatedSelectedMessage = "새 아이디어를 실행 보드에 바로 추가하고 선택했습니다.";
export const workbenchIdeaDeleteLoginRequiredMessage = "아이디어를 삭제하려면 먼저 로그인해 주세요.";
export const workbenchIdeaDeletePermissionDeniedMessage = "이 아이디어를 삭제할 권한이 없습니다.";
export const workbenchIdeaSelectionRequiredMessage = "먼저 아이디어를 선택하세요.";
export const workbenchIdeaReadOnlyMessage = "현재 운영자에게는 이 아이디어가 읽기 전용입니다.";
export const workbenchIdeaRestoreLoginRequiredMessage = "아이디어를 되살리려면 먼저 로그인해 주세요.";
export const workbenchIdeaRestorePermissionDeniedMessage = "이 아이디어를 되살릴 권한이 없습니다.";
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

export function buildWorkbenchIdeaDiscardFailedMessage({
  errorMessage,
  ideaName,
}: {
  errorMessage?: string | null;
  ideaName: string;
}) {
  return `${ideaName} 아이디어를 삭제 목록으로 옮기지 못했습니다: ${errorMessage ?? "응답 없음"}`;
}

export function buildWorkbenchIdeaDiscardConfirmMessage(ideaName: string) {
  return `"${ideaName}" 아이디어를 삭제 목록으로 옮길까요?\n나중에 다시 되살릴 수 있습니다.`;
}

export function buildWorkbenchIdeaDiscardedMessage(ideaName: string) {
  return `"${ideaName}" 아이디어를 삭제 목록으로 옮겼습니다.`;
}

export function buildWorkbenchIdeaRestoreFailedMessage({
  errorMessage,
  ideaName,
}: {
  errorMessage?: string | null;
  ideaName: string;
}) {
  return `${ideaName} 아이디어를 되살리지 못했습니다: ${errorMessage ?? "응답 없음"}`;
}

export function buildWorkbenchIdeaRestoredMessage(ideaName: string) {
  return `"${ideaName}" 아이디어를 다시 진행 목록으로 옮겼습니다.`;
}

export function buildWorkbenchIdeaPermanentDeleteConfirmMessage(ideaName: string) {
  return `"${ideaName}" 아이디어와 연결된 리스크, 판단, 실험, 제작 자료, 실행 기록까지 영구 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`;
}

export function buildWorkbenchIdeasBulkDiscardConfirmMessage(count: number) {
  return `선택한 ${count}개 아이디어를 삭제 목록으로 옮길까요?\n나중에 삭제한 아이디어 화면에서 다시 되살릴 수 있습니다.`;
}

export function buildWorkbenchIdeasBulkRestoreConfirmMessage(count: number) {
  return `선택한 ${count}개 아이디어를 검토 아이디어로 되살릴까요?`;
}

export function buildWorkbenchIdeasBulkPermanentDeleteConfirmMessage(count: number) {
  return `선택한 ${count}개 아이디어와 연결된 리스크, 판단, 실험, 제작 자료, 실행 기록까지 영구 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`;
}

export function buildWorkbenchIdeasBulkDiscardFailedMessage(errorMessage?: string | null) {
  return `선택한 아이디어를 삭제 목록으로 옮기지 못했습니다: ${errorMessage ?? "응답 없음"}`;
}

export function buildWorkbenchIdeasBulkRestoreFailedMessage(errorMessage?: string | null) {
  return `선택한 아이디어를 되살리지 못했습니다: ${errorMessage ?? "응답 없음"}`;
}

export function buildWorkbenchIdeasBulkRelatedTableDeleteFailedMessage({
  errorMessage,
  table,
}: {
  errorMessage: string;
  table: IdeaDeletionRelatedTable;
}) {
  return `선택한 아이디어 삭제 중 ${table} 정리에서 막혔습니다: ${errorMessage}`;
}

export function buildWorkbenchIdeasBulkPermanentDeleteFailedMessage(errorMessage: string) {
  return `선택한 아이디어를 삭제하지 못했습니다: ${errorMessage}`;
}

export function buildWorkbenchIdeaRelatedTableDeleteFailedMessage({
  errorMessage,
  ideaName,
  table,
}: {
  errorMessage: string;
  ideaName: string;
  table: IdeaDeletionRelatedTable;
}) {
  return `${ideaName} 삭제 중 ${table} 정리에서 막혔습니다: ${errorMessage}`;
}

export function buildWorkbenchIdeaPermanentDeleteFailedMessage({
  errorMessage,
  ideaName,
}: {
  errorMessage: string;
  ideaName: string;
}) {
  return `${ideaName} 아이디어를 삭제하지 못했습니다: ${errorMessage}`;
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
  return [...nextIdeas].sort(compareWorkbenchIdeas);
}

export function compareWorkbenchIdeas(a: Idea, b: Idea) {
  return (
    getIdeaStageRank(a.stage) - getIdeaStageRank(b.stage) ||
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime() ||
    a.name.localeCompare(b.name, "ko-KR")
  );
}

export function getInitialSelectedWorkbenchIdeaId(nextIdeas: Idea[], requestedIdeaId?: string) {
  const activeIdeas = sortWorkbenchIdeas(getActiveIdeas(nextIdeas));
  const requestedIdea = requestedIdeaId ? activeIdeas.find((idea) => idea.id === requestedIdeaId) : null;

  return requestedIdea?.id ?? activeIdeas[0]?.id ?? "";
}

export function getInitialWorkbenchTask(nextIdeas: Idea[]): WorkbenchTask {
  return sortWorkbenchIdeas(getActiveIdeas(nextIdeas))[0] ? "score" : "select";
}

export function getWorkbenchIdeaDiscardSelectionState(nextIdeas: Idea[]) {
  const nextSelectedIdea = sortWorkbenchIdeas(getActiveIdeas(nextIdeas))[0] ?? null;

  return {
    nextSelectedIdea,
    nextTask: nextSelectedIdea ? ("select" as const) : ("archive" as const),
  };
}

export function getSelectedWorkbenchIdea(nextIdeas: Idea[], selectedIdeaId: string) {
  return (
    nextIdeas.find((idea) => idea.id === selectedIdeaId && !isDiscardedIdea(idea)) ??
    getActiveIdeas(nextIdeas)[0] ??
    nextIdeas.find((idea) => isDiscardedIdea(idea)) ??
    null
  );
}

export function isRemovedWorkbenchIdeaSelected({
  currentSelectedIdeaId,
  removedIdeaId,
  selectedIdeaId,
}: {
  currentSelectedIdeaId?: string | null;
  removedIdeaId: string;
  selectedIdeaId: string;
}) {
  return selectedIdeaId === removedIdeaId || currentSelectedIdeaId === removedIdeaId;
}

export function getNextSelectedWorkbenchIdeaAfterRemoval({
  currentSelectedIdeaId,
  nextIdeas,
  removedIdeaId,
  selectedIdeaId,
}: {
  currentSelectedIdeaId?: string | null;
  nextIdeas: Idea[];
  removedIdeaId: string;
  selectedIdeaId: string;
}) {
  return getWorkbenchIdeaRemovalSelectionState({
    currentSelectedIdeaId,
    nextIdeas,
    removedIdeaId,
    selectedIdeaId,
  }).nextSelectedIdea;
}

export function getWorkbenchIdeaRemovalSelectionState({
  currentSelectedIdeaId,
  nextIdeas,
  removedIdeaId,
  selectedIdeaId,
}: {
  currentSelectedIdeaId?: string | null;
  nextIdeas: Idea[];
  removedIdeaId: string;
  selectedIdeaId: string;
}) {
  const activeIdeas = sortWorkbenchIdeas(getActiveIdeas(nextIdeas));
  const isRemovingSelectedIdea = isRemovedWorkbenchIdeaSelected({
    currentSelectedIdeaId,
    removedIdeaId,
    selectedIdeaId,
  });
  const nextSelectedIdea = isRemovingSelectedIdea
    ? (activeIdeas[0] ?? null)
    : (activeIdeas.find((idea) => idea.id === selectedIdeaId) ?? activeIdeas[0] ?? null);

  return { isRemovingSelectedIdea, nextSelectedIdea };
}

export function buildWorkbenchIdeaRemovalCompletionState({
  ideaName,
  isRemovingSelectedIdea,
  nextSelectedIdea,
  remainingIdeaCount,
}: {
  ideaName: string;
  isRemovingSelectedIdea: boolean;
  nextSelectedIdea: Idea | null;
  remainingIdeaCount: number;
}): { message: string; nextTask: WorkbenchTask | null } {
  if (nextSelectedIdea) {
    return {
      message: `"${ideaName}" 아이디어를 완전히 삭제했고, 다음 아이디어로 이동했습니다.`,
      nextTask: isRemovingSelectedIdea ? "score" : null,
    };
  }

  return {
    message: `"${ideaName}" 아이디어를 완전히 삭제했습니다.`,
    nextTask: remainingIdeaCount > 0 ? "archive" : "select",
  };
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

export function buildWorkbenchIdeaVisibilityState(
  nextIdeas: Idea[],
  filterMode: WorkbenchIdeaFilterMode,
  getRecordAccessState: (idea: Idea) => WorkbenchRecordAccessState,
) {
  const discardedIdeas = getVisibleDiscardedIdeas(nextIdeas, getRecordAccessState);

  return {
    activeVisibleIdeaCount: getVisibleActiveIdeaCount(nextIdeas, getRecordAccessState),
    discardedIdeas,
    discardedVisibleIdeaCount: discardedIdeas.length,
    visibleIdeas: filterVisibleWorkbenchIdeas(nextIdeas, filterMode, getRecordAccessState),
  };
}

export function buildWorkbenchIdeaDisplayState({
  getRecordAccessState,
  getProductSurface,
  getProgress,
  idea,
}: {
  getRecordAccessState: (idea: Idea) => WorkbenchRecordAccessState;
  getProductSurface: (idea: Idea) => ProductSurfaceProfile;
  getProgress: (idea: Idea) => WorkbenchIdeaProgress;
  idea: Idea;
}): WorkbenchIdeaDisplayState {
  return {
    accessDisplay: getWorkbenchRecordAccessDisplay(getRecordAccessState(idea)),
    productSurface: getProductSurface(idea),
    progress: getProgress(idea),
  };
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

export function replaceRecordsByIdeaId<T extends { idea_id: string | null }>(
  records: T[],
  ideaId: string,
  nextRecords: readonly T[],
) {
  return [...removeRecordsByIdeaId(records, ideaId), ...nextRecords];
}

export function omitRecordKey<T>(record: Record<string, T>, key: string) {
  const next = { ...record };
  delete next[key];
  return next;
}

export function setRecordKey<T>(record: Record<string, T>, key: string, value: T) {
  return { ...record, [key]: value };
}

export function setRecordField<T extends object, K extends keyof T>(record: T, key: K, value: T[K]) {
  return { ...record, [key]: value };
}

export function setRecordFields<T extends object>(record: T, fields: Partial<T>) {
  return { ...record, ...fields };
}
