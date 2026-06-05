import type { DecisionStatus, IdeaStage } from "@/lib/supabase/types";

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

export type WorkbenchTaskSummary = {
  id: WorkbenchTask;
  label: string;
  description: string;
  status: string;
};
export type WorkbenchTaskNavigationItemState = {
  descriptionLabel: string;
  isActive: boolean;
  isDisabled: boolean;
  isLocked: boolean;
  statusLabel: string;
  statusPillTone: "avl-pill-info" | "avl-pill-warning" | "avl-pill-neutral";
  stepNumber: number;
  task: WorkbenchTaskSummary;
};

export type WorkbenchExperienceMode = "guided" | "full";

export type WorkbenchTaskPanelClassNames = {
  archive: string;
  artifacts: string;
  decision: string;
  development: string;
  experiment: string;
  launch: string;
  learning: string;
  orchestration: string;
  risk: string;
  riskDecision: string;
  score: string;
  select: string;
};

export type WorkbenchShellDisplayState = {
  sectionClassName: string;
  showSidebarPanel: boolean;
};

export type WorkbenchIdeaProgress = {
  label: string;
  task: WorkbenchTask;
};

const workbenchTaskIdSet = new Set<string>(WORKBENCH_TASK_IDS);
const guidedWorkbenchTaskIdSet = new Set<WorkbenchTask>([
  "select",
  "score",
  "experiment",
  "artifacts",
  "development",
  "orchestration",
  "launch",
  "learning",
]);

export function isWorkbenchTask(value: string | undefined): value is WorkbenchTask {
  return Boolean(value && workbenchTaskIdSet.has(value));
}

export function getWorkbenchIdeaProgress(idea: {
  decision: DecisionStatus;
  stage: IdeaStage;
}): WorkbenchIdeaProgress {
  if (idea.decision === "kill") {
    return { label: "삭제됨", task: "archive" };
  }

  switch (idea.stage) {
    case "prd":
      return { label: "STEP 4 검증 자료 저장", task: "artifacts" };
    case "prototype":
    case "qa":
      return { label: "STEP 5 제작 패키지", task: "development" };
    case "launch":
      return { label: "STEP 7 최종 실행", task: "launch" };
    case "intake":
    case "research":
    case "score":
    case "paused":
    default:
      return { label: "STEP 2 사업성 평가", task: "score" };
  }
}

export function buildWorkbenchTaskSummaries({
  activeVisibleIdeaCount,
  artifactCount,
  canEnterLaunch,
  currentScore,
  decisionCount,
  discardedVisibleIdeaCount,
  doneRunCount,
  experimentCount,
  hasDevelopmentProcessArtifact,
  implementationCompletedCount,
  implementationTotalCount,
  launchReadinessScore,
  riskCount,
  runCount,
  telemetryEventCount,
}: {
  activeVisibleIdeaCount: number;
  artifactCount: number;
  canEnterLaunch: boolean;
  currentScore: number;
  decisionCount: number;
  discardedVisibleIdeaCount: number;
  doneRunCount: number;
  experimentCount: number;
  hasDevelopmentProcessArtifact: boolean;
  implementationCompletedCount: number;
  implementationTotalCount: number;
  launchReadinessScore: number;
  riskCount: number;
  runCount: number;
  telemetryEventCount: number;
}): WorkbenchTaskSummary[] {
  return [
    {
      id: "select",
      label: "아이디어 도출",
      description: "후보와 결과물 형태를 고릅니다.",
      status: `${activeVisibleIdeaCount}개`,
    },
    {
      id: "archive",
      label: "삭제한 아이디어",
      description: "복구하거나 완전히 삭제합니다.",
      status: `${discardedVisibleIdeaCount}개`,
    },
    {
      id: "score",
      label: "사업성 평가",
      description: "오늘 진행할지 보완할지 정합니다.",
      status: currentScore > 0 ? `${currentScore}점` : "대기",
    },
    {
      id: "risk",
      label: "위험 확인",
      description: "차단 요인과 완화 상태를 관리합니다.",
      status: riskCount > 0 ? `${riskCount}개` : "대기",
    },
    {
      id: "decision",
      label: "판단 기록",
      description: "진행, 전환, 중단 근거를 남깁니다.",
      status: decisionCount > 0 ? `${decisionCount}개` : "대기",
    },
    {
      id: "experiment",
      label: "검증 계획",
      description: "가장 작은 검증 계획을 정의합니다.",
      status: experimentCount > 0 ? `${experimentCount}개` : "대기",
    },
    {
      id: "orchestration",
      label: "작업 순서 확인",
      description: "전략부터 출시까지 처리 순서를 확인합니다.",
      status: runCount > 0 ? `${doneRunCount}/${runCount}` : "대기",
    },
    {
      id: "artifacts",
      label: "검증 자료 저장",
      description: "검증 자료를 한 번에 저장합니다.",
      status: artifactCount > 0 ? `${artifactCount}개` : "대기",
    },
    {
      id: "development",
      label: "제작 패키지",
      description: "제작 자료를 자동 정리합니다.",
      status:
        implementationTotalCount > 0
          ? `${implementationCompletedCount}/${implementationTotalCount}`
          : hasDevelopmentProcessArtifact
            ? "계획됨"
            : "대기",
    },
    {
      id: "launch",
      label: "최종 실행",
      description: "외부 연동 또는 내부 개발로 넘깁니다.",
      status: canEnterLaunch ? "준비 완료" : `${launchReadinessScore}%`,
    },
    {
      id: "learning",
      label: "성과 확인",
      description: "사용 신호로 다음 결정을 봅니다.",
      status: telemetryEventCount > 0 ? `${telemetryEventCount}개` : "대기",
    },
  ];
}

export function getVisibleWorkbenchTaskSummaries(
  tasks: WorkbenchTaskSummary[],
  experienceMode: WorkbenchExperienceMode,
) {
  return experienceMode === "guided" ? tasks.filter((task) => guidedWorkbenchTaskIdSet.has(task.id)) : tasks;
}

export function buildWorkbenchTaskNavigationItemStates({
  activeTask,
  canEnterLaunch,
  tasks,
}: {
  activeTask: WorkbenchTask;
  canEnterLaunch: boolean;
  tasks: WorkbenchTaskSummary[];
}): WorkbenchTaskNavigationItemState[] {
  return tasks.map((task, index) => {
    const isActive = activeTask === task.id;
    const isLocked = task.id === "launch" && !canEnterLaunch && !isActive;

    return {
      descriptionLabel: isLocked ? "준비 완료 후 열립니다" : task.description,
      isActive,
      isDisabled: isLocked,
      isLocked,
      statusLabel: isLocked ? "잠김" : task.status,
      statusPillTone: isActive ? "avl-pill-info" : isLocked ? "avl-pill-warning" : "avl-pill-neutral",
      stepNumber: index + 1,
      task,
    };
  });
}

export function buildWorkbenchTaskNavigationState({
  experienceMode,
  ...summaryInput
}: Parameters<typeof buildWorkbenchTaskSummaries>[0] & {
  experienceMode: WorkbenchExperienceMode;
}) {
  const workbenchTasks = buildWorkbenchTaskSummaries(summaryInput);
  const visibleWorkbenchTasks = getVisibleWorkbenchTaskSummaries(workbenchTasks, experienceMode);

  return {
    visibleWorkbenchTasks,
    workbenchTasks,
  };
}

export function buildWorkbenchShellDisplayState({
  showSidebar,
}: {
  showSidebar: boolean;
}): WorkbenchShellDisplayState {
  return {
    sectionClassName: showSidebar ? "grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]" : "grid gap-6",
    showSidebarPanel: showSidebar,
  };
}

export function buildWorkbenchTaskPanelClassName({
  activeTask,
  hiddenClassName = "hidden",
  targetTasks,
  visibleClassName,
}: {
  activeTask: WorkbenchTask;
  hiddenClassName?: string;
  targetTasks: ReadonlyArray<WorkbenchTask>;
  visibleClassName: string;
}) {
  return targetTasks.includes(activeTask) ? visibleClassName : hiddenClassName;
}

export function buildWorkbenchTaskPanelClassNames({
  activeTask,
}: {
  activeTask: WorkbenchTask;
}): WorkbenchTaskPanelClassNames {
  return {
    archive: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["archive"],
      visibleClassName: "grid gap-5",
    }),
    artifacts: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["artifacts"],
      visibleClassName: "avl-card p-4",
    }),
    decision: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["decision"],
      visibleClassName: "grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]",
    }),
    development: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["development"],
      visibleClassName: "avl-card p-5",
    }),
    experiment: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["experiment"],
      visibleClassName: "grid gap-4",
    }),
    launch: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["launch"],
      visibleClassName: "avl-card p-4",
    }),
    learning: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["learning"],
      visibleClassName: "avl-card p-4",
    }),
    orchestration: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["orchestration"],
      visibleClassName: "avl-card p-5",
    }),
    risk: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["risk"],
      visibleClassName: "grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]",
    }),
    riskDecision: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["risk", "decision"],
      visibleClassName: "grid gap-5",
    }),
    score: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["score"],
      visibleClassName: "grid gap-5",
    }),
    select: buildWorkbenchTaskPanelClassName({
      activeTask,
      targetTasks: ["select"],
      visibleClassName: "grid gap-5",
    }),
  };
}
