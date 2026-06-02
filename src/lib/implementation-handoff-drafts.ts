import { buildImplementationHandoffMarkdown } from "@/lib/implementation-handoff-markdown";
import { buildImplementationTaskDrafts } from "@/lib/implementation-task-drafts";
import {
  buildFilteredImplementationRunPromptMarkdown,
  buildImplementationBacklogMarkdown,
  buildImplementationTaskTicketMarkdown,
} from "@/lib/implementation-task-markdown";
import { buildRolePromptPackMarkdown } from "@/lib/role-prompt-pack-markdown";
import type { Experiment, Idea, ImplementationTask, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";
import type { ImplementationTaskDraft } from "@/lib/workbench-draft-defaults";
import type { WorkbenchEditState } from "@/lib/workbench-scoring";

export type ImplementationHandoffDraftState = {
  cursorHandoffTaskDrafts: ImplementationTaskDraft[];
  filteredImplementationBacklogDraft: string;
  filteredImplementationRunPromptDraft: string;
  implementationBacklogDraft: string;
  implementationHandoffDraft: string;
  implementationTaskDrafts: ImplementationTaskDraft[];
  implementationTaskTicketDraft: string;
  rolePromptPackDraft: string;
};

const emptyImplementationHandoffDraftState: ImplementationHandoffDraftState = {
  cursorHandoffTaskDrafts: [],
  filteredImplementationBacklogDraft: "",
  filteredImplementationRunPromptDraft: "",
  implementationBacklogDraft: "",
  implementationHandoffDraft: "",
  implementationTaskDrafts: [],
  implementationTaskTicketDraft: "",
  rolePromptPackDraft: "",
};

export function buildImplementationHandoffDraftState({
  artifacts,
  evidenceByTaskId,
  experiments,
  filteredTasks,
  filterSummary,
  idea,
  nextTask,
  openTasks,
  risks,
  runs,
  state,
  tasks,
}: {
  artifacts: VentureArtifact[];
  evidenceByTaskId: Record<string, string>;
  experiments: Experiment[];
  filteredTasks: ImplementationTask[];
  filterSummary: string;
  idea: Idea | null;
  nextTask: ImplementationTask | null;
  openTasks: ImplementationTask[];
  risks: Risk[];
  runs: OrchestrationRun[];
  state: WorkbenchEditState | null;
  tasks: ImplementationTask[];
}): ImplementationHandoffDraftState {
  if (!idea || !state) {
    return emptyImplementationHandoffDraftState;
  }

  const implementationTaskDrafts = buildImplementationTaskDrafts({
    idea,
    state,
    risks,
    experiments,
    artifacts,
  });

  return {
    cursorHandoffTaskDrafts: implementationTaskDrafts,
    filteredImplementationBacklogDraft: buildImplementationBacklogMarkdown({
      idea,
      state,
      tasks: filteredTasks,
      viewName: "필터된 제작 할 일",
      filterSummary,
      evidenceByTaskId,
      emptyMessage: "현재 필터 조건에 맞는 제작 할 일이 없습니다.",
    }),
    filteredImplementationRunPromptDraft: buildFilteredImplementationRunPromptMarkdown({
      idea,
      state,
      tasks: filteredTasks,
      filterSummary,
      evidenceByTaskId,
    }),
    implementationBacklogDraft: buildImplementationBacklogMarkdown({
      idea,
      state,
      tasks: openTasks,
      viewName: "열린 제작 할 일",
      filterSummary: "상태: 완료 제외 / 담당: 전체 / 증거: 전체",
      evidenceByTaskId,
      emptyMessage: "열린 제작 할 일이 없습니다.",
    }),
    implementationHandoffDraft: buildImplementationHandoffMarkdown({
      idea,
      state,
      risks,
      experiments,
      runs,
      artifacts,
    }),
    implementationTaskDrafts,
    implementationTaskTicketDraft: nextTask
      ? buildImplementationTaskTicketMarkdown({
          idea,
          state,
          task: nextTask,
        })
      : "",
    rolePromptPackDraft: buildRolePromptPackMarkdown({
      idea,
      state,
      risks,
      experiments,
      runs,
      artifacts,
      implementationTasks: tasks,
    }),
  };
}
