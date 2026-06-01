import type { Idea } from "@/lib/venture-data";
import type { IdeaStage } from "@/lib/supabase/types";

export type WorkbenchIdeaFilterMode = "all" | "mine" | "read_only";
export type WorkbenchRecordAccessState = "owned" | "workspace_admin" | "workspace_member" | "hidden";

const ideaStageOrder: IdeaStage[] = ["intake", "research", "score", "prd", "prototype", "qa", "launch", "paused"];
const ideaStageRank = new Map(ideaStageOrder.map((stage, index) => [stage, index]));

export function getIdeaStageRank(stage: IdeaStage) {
  return ideaStageRank.get(stage) ?? 99;
}

export function isIdeaStageAtOrAfter(stage: IdeaStage, targetStage: IdeaStage) {
  return getIdeaStageRank(stage) >= getIdeaStageRank(targetStage);
}

export function isDiscardedIdea(idea: Idea) {
  return idea.decision === "kill";
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
