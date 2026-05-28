export const WORKBENCH_TASK_IDS = [
  "select",
  "archive",
  "score",
  "risk",
  "decision",
  "experiment",
  "orchestration",
  "artifacts",
  "development",
  "launch",
  "learning",
] as const;

export type WorkbenchTask = (typeof WORKBENCH_TASK_IDS)[number];

const workbenchTaskIdSet = new Set<string>(WORKBENCH_TASK_IDS);

export function isWorkbenchTask(value: string | undefined): value is WorkbenchTask {
  return Boolean(value && workbenchTaskIdSet.has(value));
}
