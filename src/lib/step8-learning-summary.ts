import type { BuildDeliveryMode } from "@/lib/build-delivery";
import { getCursorTaskCode, summarizeCursorProgressEvidence } from "@/lib/external-progress-import";
import {
  buildImplementationDependencyStatuses,
  buildImplementationTaskProgressStats,
  getImplementationTaskReadinessQueues,
  getBlockedImplementationTaskHint,
  getImplementationEvidenceChecklist,
  getImplementationTaskEvidence,
  getOpenImplementationTasksForAction,
  implementationTaskStatusLabels,
  implementationTaskStatusTone,
  type ImplementationDependencyStatus,
  type ImplementationTaskProgressStats,
} from "@/lib/implementation-task-metadata";
import type { ImplementationTask } from "@/lib/venture-data";

export type Step8OutcomeCard = {
  label: string;
  value: string;
  detail: string;
};

export type Step8ReviewRow = readonly [label: string, value: string, detail: string];

export type Step8LearningDecisionLabel = "다음 작업 완료" | "첫 버전 배포" | "리스크 보완" | "다음 빌드 범위 결정";

export type Step8LearningValueDetail = {
  detail: string;
  value: string;
};

export type Step8LearningPrimaryActionSummary = {
  detail: string;
  label: string;
  text: string;
};

export type Step8LearningNavigationHint = {
  detail: string;
  title: string;
};

export type Step8LearningSummary = {
  learningDecisionCards: Step8OutcomeCard[];
  learningDecisionDetail: string;
  learningDecisionLabel: Step8LearningDecisionLabel;
  learningDecisionOptions: string[];
  learningCompletedDetail: string;
  learningCompletedValue: string;
  learningJudgmentQuestion: string;
  learningNextJudgmentBrief: string;
  learningOneSentenceOutcome: string;
  learningPrimaryActionDetail: string;
  learningPrimaryActionLabel: string;
  learningPrimaryActionText: string;
  learningPrimaryCtaLabel: string;
  learningPrimaryNavigationHintDetail: string;
  learningPrimaryNavigationHintTitle: string;
  learningRemainingDetail: string;
  learningRemainingValue: string;
  learningSimpleReviewRows: Step8ReviewRow[];
  externalSyncCheckedText: string;
  externalSyncCompletedText: string;
  externalSyncNextTaskText: string;
  externalSyncOutcomeSentence: string;
  externalSyncReviewRows: Step8ReviewRow[];
};

export type Step8ProgressDisplayItem = {
  code: string;
  id: string;
  isDone: boolean;
  isNext: boolean;
  missingLabels: string[];
  passedCount: number;
  showMissingEvidence: boolean;
  statusDetail: string;
  statusLabel: string;
  statusTone: string;
  title: string;
  totalCount: number;
};

export type Step8ProgressSummary = {
  progressDetail: string;
  progressItems: Step8ProgressDisplayItem[];
  progressTitle: string;
};

export type Step8LearningDisplayState = Step8LearningSummary &
  Step8ProgressSummary & {
    canCopyLearningReport: boolean;
  };

export type Step8ImplementationTaskContext = {
  completedTasks: ImplementationTask[];
  nextDependencyStatus: ImplementationDependencyStatus | null;
  nextTask: ImplementationTask | null;
  nextTaskCode: string | null;
  nextTaskId: string | null;
  readyStatuses: ImplementationDependencyStatus[];
  totalCount: number;
  waitingStatuses: ImplementationDependencyStatus[];
};

export type Step8ImplementationDerivedState = {
  completedImplementationTasks: ImplementationTask[];
  implementationDependencyStatuses: ImplementationDependencyStatus[];
  implementationTaskProgressStats: ImplementationTaskProgressStats;
  nextImplementationDependencyStatus: ImplementationDependencyStatus | null;
  nextImplementationTask: ImplementationTask | null;
  nextImplementationTaskCode: string | null;
  nextImplementationTaskId: string | null;
  readyImplementationDependencyStatuses: ImplementationDependencyStatus[];
  selectedOpenImplementationTasks: ImplementationTask[];
  step8ImplementationTaskContext: Step8ImplementationTaskContext;
  totalImplementationTaskCount: number;
  waitingImplementationDependencyStatuses: ImplementationDependencyStatus[];
};

export function buildStep8ImplementationDerivedState(tasks: ImplementationTask[]): Step8ImplementationDerivedState {
  const selectedOpenImplementationTasks = getOpenImplementationTasksForAction(tasks);
  const implementationDependencyStatuses = buildImplementationDependencyStatuses(tasks);
  const implementationTaskProgressStats = buildImplementationTaskProgressStats(tasks);
  const step8ImplementationTaskContext = buildStep8ImplementationTaskContext({
    dependencyStatuses: implementationDependencyStatuses,
    openTasks: selectedOpenImplementationTasks,
    progressStats: implementationTaskProgressStats,
    tasks,
  });

  return {
    completedImplementationTasks: step8ImplementationTaskContext.completedTasks,
    implementationDependencyStatuses,
    implementationTaskProgressStats,
    nextImplementationDependencyStatus: step8ImplementationTaskContext.nextDependencyStatus,
    nextImplementationTask: step8ImplementationTaskContext.nextTask,
    nextImplementationTaskCode: step8ImplementationTaskContext.nextTaskCode,
    nextImplementationTaskId: step8ImplementationTaskContext.nextTaskId,
    readyImplementationDependencyStatuses: step8ImplementationTaskContext.readyStatuses,
    selectedOpenImplementationTasks,
    step8ImplementationTaskContext,
    totalImplementationTaskCount: step8ImplementationTaskContext.totalCount,
    waitingImplementationDependencyStatuses: step8ImplementationTaskContext.waitingStatuses,
  };
}

export function buildStep8ImplementationTaskContext({
  dependencyStatuses,
  openTasks,
  progressStats,
  tasks,
}: {
  dependencyStatuses: ImplementationDependencyStatus[];
  openTasks: ImplementationTask[];
  progressStats: Pick<ImplementationTaskProgressStats, "completedTasks" | "totalCount">;
  tasks: ImplementationTask[];
}): Step8ImplementationTaskContext {
  const readinessQueues = getImplementationTaskReadinessQueues({
    dependencyStatuses,
    openTasks,
  });
  const nextTask = readinessQueues.nextTask;

  return {
    completedTasks: progressStats.completedTasks,
    nextDependencyStatus: readinessQueues.nextDependencyStatus,
    nextTask,
    nextTaskCode: getStep8ImplementationTaskCode({ task: nextTask, tasks }),
    nextTaskId: nextTask?.id ?? null,
    readyStatuses: readinessQueues.readyStatuses,
    totalCount: progressStats.totalCount,
    waitingStatuses: readinessQueues.waitingStatuses,
  };
}

export function getStep8ImplementationTaskCode({
  task,
  tasks,
}: {
  task: Pick<ImplementationTask, "id"> | null;
  tasks: Pick<ImplementationTask, "id">[];
}) {
  const taskIndex = task ? tasks.findIndex((item) => item.id === task.id) : -1;

  return taskIndex >= 0 ? getCursorTaskCode(taskIndex) : null;
}

export function buildStep8LearningSummary({
  buildDeliveryMode,
  completedImplementationTaskCount,
  externalToolLabel,
  nextImplementationTask,
  nextImplementationTaskCode,
  openRiskCount,
  productSignalCount,
  recentSignalCount,
  taskSyncUpdatedAt,
  totalImplementationTaskCount,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  completedImplementationTaskCount: number;
  externalToolLabel: string;
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  nextImplementationTaskCode: string | null;
  openRiskCount: number;
  productSignalCount: number;
  recentSignalCount: number;
  taskSyncUpdatedAt: string | null;
  totalImplementationTaskCount: number;
}): Step8LearningSummary {
  const taskPrefix = formatStep8TaskCodePrefix(nextImplementationTaskCode);
  const learningDecisionLabel = buildStep8LearningDecisionLabel({
    completedImplementationTaskCount,
    openRiskCount,
    productSignalCount,
    totalImplementationTaskCount,
  });
  const learningDecisionDetail = buildStep8LearningDecisionDetail(learningDecisionLabel);
  const learningPrimaryActionSummary = buildStep8LearningPrimaryActionSummary({
    buildDeliveryMode,
    externalToolLabel,
    nextImplementationTask,
    productSignalCount,
    recentSignalCount,
    taskPrefix,
  });
  const learningPrimaryActionLabel = learningPrimaryActionSummary.label;
  const learningPrimaryActionText = learningPrimaryActionSummary.text;
  const learningPrimaryActionDetail = learningPrimaryActionSummary.detail;
  const learningOneSentenceOutcome = buildStep8LearningOneSentenceOutcome({
    nextImplementationTask,
    openRiskCount,
    productSignalCount,
    taskPrefix,
  });
  const learningPrimaryCtaLabel = "리포트 복사";
  const learningPrimaryNavigationHint = buildStep8LearningNavigationHint({
    hasNextImplementationTask: Boolean(nextImplementationTask),
  });
  const learningPrimaryNavigationHintTitle = learningPrimaryNavigationHint.title;
  const learningPrimaryNavigationHintDetail = learningPrimaryNavigationHint.detail;
  const learningDecisionOptions = buildStep8LearningDecisionOptions({
    hasNextImplementationTask: Boolean(nextImplementationTask),
    openRiskCount,
    productSignalCount,
  });
  const learningCompletedSummary = buildStep8LearningCompletedSummary({
    completedImplementationTaskCount,
    productSignalCount,
    totalImplementationTaskCount,
  });
  const learningRemainingSummary = buildStep8LearningRemainingSummary({
    nextImplementationTask,
    nextImplementationTaskCode,
    openRiskCount,
    productSignalCount,
  });
  const learningCompletedValue = learningCompletedSummary.value;
  const learningCompletedDetail = learningCompletedSummary.detail;
  const learningRemainingValue = learningRemainingSummary.value;
  const learningRemainingDetail = learningRemainingSummary.detail;
  const learningDecisionCards = buildStep8LearningDecisionCards({
    learningCompletedDetail,
    learningCompletedValue,
    learningDecisionDetail,
    learningDecisionLabel,
    learningRemainingDetail,
    learningRemainingValue,
  });
  const learningSimpleReviewRows = buildStep8LearningSimpleReviewRows({
    learningCompletedDetail,
    learningCompletedValue,
    learningDecisionDetail,
    learningDecisionLabel,
    learningRemainingDetail,
    learningRemainingValue,
  });
  const learningJudgmentQuestion = buildStep8LearningJudgmentQuestion({
    hasNextImplementationTask: Boolean(nextImplementationTask),
    openRiskCount,
    productSignalCount,
  });
  const learningNextJudgmentBrief = buildStep8LearningNextJudgmentBrief({
    hasNextImplementationTask: Boolean(nextImplementationTask),
    openRiskCount,
    productSignalCount,
  });
  const externalSyncCompletedText = buildStep8ExternalSyncCompletedText({
    completedImplementationTaskCount,
    totalImplementationTaskCount,
  });
  const externalSyncNextTaskText = buildStep8ExternalSyncNextTaskText({
    nextImplementationTask,
    taskPrefix,
    totalImplementationTaskCount,
  });
  const externalSyncCheckedText = taskSyncUpdatedAt ?? "화면을 열면 자동 확인";
  const externalSyncOutcomeSentence = buildStep8ExternalSyncOutcomeSentence({
    externalSyncCompletedText,
    externalSyncNextTaskText,
    totalImplementationTaskCount,
  });
  const externalSyncReviewRows = buildStep8ExternalSyncReviewRows({
    externalSyncCheckedText,
    externalSyncCompletedText,
    externalSyncNextTaskText,
  });

  return {
    learningDecisionCards,
    learningDecisionDetail,
    learningDecisionLabel,
    learningDecisionOptions,
    learningCompletedDetail,
    learningCompletedValue,
    learningJudgmentQuestion,
    learningNextJudgmentBrief,
    learningOneSentenceOutcome,
    learningPrimaryActionDetail,
    learningPrimaryActionLabel,
    learningPrimaryActionText,
    learningPrimaryCtaLabel,
    learningPrimaryNavigationHintDetail,
    learningPrimaryNavigationHintTitle,
    learningRemainingDetail,
    learningRemainingValue,
    learningSimpleReviewRows,
    externalSyncCheckedText,
    externalSyncCompletedText,
    externalSyncNextTaskText,
    externalSyncOutcomeSentence,
    externalSyncReviewRows,
  };
}

export function buildStep8LearningOneSentenceOutcome({
  nextImplementationTask,
  openRiskCount,
  productSignalCount,
  taskPrefix,
}: {
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  openRiskCount: number;
  productSignalCount: number;
  taskPrefix: string;
}) {
  if (nextImplementationTask) {
    return `${taskPrefix}${nextImplementationTask.title} 완료 보고가 반영되면 다음 판단으로 넘어갈 수 있습니다.`;
  }

  if (productSignalCount === 0) {
    return "지금은 성과 분석보다 첫 버전 배포와 이벤트 연결이 먼저입니다.";
  }

  return openRiskCount > 0
    ? "사용 신호는 들어왔고, 다음 결정은 열린 리스크를 하나 줄이는 것입니다."
    : "사용 신호가 들어왔으니 다음 빌드 범위를 작게 승인할 차례입니다.";
}

export function buildStep8LearningNavigationHint({
  hasNextImplementationTask,
}: {
  hasNextImplementationTask: boolean;
}): Step8LearningNavigationHint {
  return hasNextImplementationTask
    ? {
        title: "다음 작업은 STEP 7에서 이어갑니다",
        detail: "이 화면은 완료와 다음 판단만 보여줍니다. 단계 이동은 왼쪽 단계 메뉴나 하단 단계 버튼에서 진행하세요.",
      }
    : {
        title: "최종 실행은 STEP 7에서 확인합니다",
        detail: "성과 확인 화면 안에서는 단계를 자동 이동하지 않습니다. 최종 실행 자료는 STEP 7에서 확인하세요.",
      };
}

export function buildStep8LearningDecisionCards({
  learningCompletedDetail,
  learningCompletedValue,
  learningDecisionDetail,
  learningDecisionLabel,
  learningRemainingDetail,
  learningRemainingValue,
}: {
  learningCompletedDetail: string;
  learningCompletedValue: string;
  learningDecisionDetail: string;
  learningDecisionLabel: Step8LearningDecisionLabel;
  learningRemainingDetail: string;
  learningRemainingValue: string;
}): Step8OutcomeCard[] {
  return [
    {
      label: "완료된 것",
      value: learningCompletedValue,
      detail: learningCompletedDetail,
    },
    {
      label: "이어 할 것",
      value: learningRemainingValue,
      detail: learningRemainingDetail,
    },
    {
      label: "지금 판단",
      value: learningDecisionLabel,
      detail: learningDecisionDetail,
    },
  ];
}

export function buildStep8LearningSimpleReviewRows({
  learningCompletedDetail,
  learningCompletedValue,
  learningDecisionDetail,
  learningDecisionLabel,
  learningRemainingDetail,
  learningRemainingValue,
}: {
  learningCompletedDetail: string;
  learningCompletedValue: string;
  learningDecisionDetail: string;
  learningDecisionLabel: Step8LearningDecisionLabel;
  learningRemainingDetail: string;
  learningRemainingValue: string;
}): Step8ReviewRow[] {
  return [
    ["완료", learningCompletedValue, learningCompletedDetail],
    ["이어 할 것", learningRemainingValue, learningRemainingDetail],
    ["판단", learningDecisionLabel, learningDecisionDetail],
  ];
}

export function buildStep8LearningPrimaryActionSummary({
  buildDeliveryMode,
  externalToolLabel,
  nextImplementationTask,
  productSignalCount,
  recentSignalCount,
  taskPrefix,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  externalToolLabel: string;
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  productSignalCount: number;
  recentSignalCount: number;
  taskPrefix: string;
}): Step8LearningPrimaryActionSummary {
  if (nextImplementationTask) {
    return {
      label: "이어 할 것",
      text: `${taskPrefix}${nextImplementationTask.title}만 이어갑니다. 실행은 STEP 7/외부 도구에서 계속합니다.`,
      detail:
        buildDeliveryMode === "external_tool"
          ? `${externalToolLabel}에서 완료 보고가 들어오면 여기 요약이 갱신됩니다.`
          : "내부 제작 흐름에서 완료 증거가 저장되면 여기 요약이 갱신됩니다.",
    };
  }

  if (productSignalCount === 0) {
    return {
      label: "출시 전 확인",
      text: "첫 버전을 배포하거나 내부 제작 흐름으로 넘긴 뒤, 방문과 핵심 행동 이벤트가 들어오는지 확인하세요.",
      detail: "실제 사용 신호가 없을 때는 리포트보다 제작 완료와 이벤트 연결 여부를 먼저 봅니다.",
    };
  }

  return {
    label: "다음 빌드 판단",
    text: `최근 14일 신호 ${recentSignalCount}개를 기준으로 다음 빌드 범위를 작게 정하세요.`,
    detail: "이제 상세 이벤트는 필요할 때만 열고, 다음 개선 또는 보류 판단을 남기면 됩니다.",
  };
}

export function buildStep8LearningJudgmentQuestion({
  hasNextImplementationTask,
  openRiskCount,
  productSignalCount,
}: {
  hasNextImplementationTask: boolean;
  openRiskCount: number;
  productSignalCount: number;
}) {
  if (hasNextImplementationTask) {
    return "이 작업을 완료로 볼 근거가 있나요?";
  }

  if (productSignalCount === 0) {
    return "첫 버전 배포와 성과 신호 연결이 끝났나요?";
  }

  return openRiskCount > 0
    ? "다음 빌드에서 어떤 리스크 하나를 먼저 줄일까요?"
    : "다음 빌드를 작게 승인할까요, 아니면 보류할까요?";
}

export function buildStep8LearningNextJudgmentBrief({
  hasNextImplementationTask,
  openRiskCount,
  productSignalCount,
}: {
  hasNextImplementationTask: boolean;
  openRiskCount: number;
  productSignalCount: number;
}) {
  if (hasNextImplementationTask) {
    return "이어 할 작업의 완료 여부만 확인하면 됩니다. 상세 리포트는 아직 열지 않아도 됩니다.";
  }

  if (productSignalCount === 0) {
    return "첫 버전 배포와 성과 신호 연결만 확인하면 됩니다. 숫자 리포트는 아직 이릅니다.";
  }

  return openRiskCount > 0
    ? "다음 빌드에서 줄일 리스크 하나만 고르면 됩니다. 상세 리포트는 필요할 때만 엽니다."
    : "다음 빌드 범위를 승인할지 보류할지만 정하면 됩니다. 상세 리포트는 필요할 때만 엽니다.";
}

export function buildStep8LearningCompletedSummary({
  completedImplementationTaskCount,
  productSignalCount,
  totalImplementationTaskCount,
}: {
  completedImplementationTaskCount: number;
  productSignalCount: number;
  totalImplementationTaskCount: number;
}): Step8LearningValueDetail {
  if (totalImplementationTaskCount > 0) {
    return {
      value: `${completedImplementationTaskCount}/${totalImplementationTaskCount} 작업`,
      detail:
        completedImplementationTaskCount > 0
          ? "완료 보고가 저장된 제작 작업입니다."
          : "아직 완료 보고가 들어온 제작 작업은 없습니다.",
    };
  }

  if (productSignalCount > 0) {
    return {
      value: `${productSignalCount}개 신호`,
      detail: "첫 버전에서 들어온 실제 사용 신호입니다.",
    };
  }

  return {
    value: "없음",
    detail: "아직 완료 보고나 제품 신호가 없습니다.",
  };
}

export function buildStep8LearningRemainingSummary({
  nextImplementationTask,
  nextImplementationTaskCode,
  openRiskCount,
  productSignalCount,
}: {
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  nextImplementationTaskCode: string | null;
  openRiskCount: number;
  productSignalCount: number;
}): Step8LearningValueDetail {
  if (nextImplementationTask) {
    return {
      value: nextImplementationTaskCode ? `${nextImplementationTaskCode} 남음` : "작업 남음",
      detail: `${nextImplementationTask.title}만 이어서 처리하면 됩니다.`,
    };
  }

  if (productSignalCount === 0) {
    return {
      value: "신호 연결",
      detail: "첫 버전을 배포한 뒤 방문과 핵심 행동 이벤트를 연결하세요.",
    };
  }

  if (openRiskCount > 0) {
    return {
      value: `${openRiskCount}개 리스크`,
      detail: "열린 리스크 중 다음 빌드에서 줄일 항목을 하나 고르세요.",
    };
  }

  return {
    value: "없음",
    detail: "남은 차단 항목이 없으면 다음 빌드 범위를 작게 정하면 됩니다.",
  };
}

export function buildStep8ExternalSyncCompletedText({
  completedImplementationTaskCount,
  totalImplementationTaskCount,
}: {
  completedImplementationTaskCount: number;
  totalImplementationTaskCount: number;
}) {
  return totalImplementationTaskCount > 0
    ? `${completedImplementationTaskCount}/${totalImplementationTaskCount} 작업`
    : "작업 생성 전";
}

export function buildStep8ExternalSyncNextTaskText({
  nextImplementationTask,
  taskPrefix,
  totalImplementationTaskCount,
}: {
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  taskPrefix: string;
  totalImplementationTaskCount: number;
}) {
  if (nextImplementationTask) {
    return `${taskPrefix}${nextImplementationTask.title}`;
  }

  return totalImplementationTaskCount > 0 ? "모든 작업 완료" : "STEP 6 작업 순서 생성";
}

export function buildStep8ExternalSyncOutcomeSentence({
  externalSyncCompletedText,
  externalSyncNextTaskText,
  totalImplementationTaskCount,
}: {
  externalSyncCompletedText: string;
  externalSyncNextTaskText: string;
  totalImplementationTaskCount: number;
}) {
  return totalImplementationTaskCount > 0
    ? `자동 반영 기준으로 완료 ${externalSyncCompletedText}, 다음은 ${externalSyncNextTaskText}입니다.`
    : "아직 반영할 제작 작업이 없습니다. STEP 6에서 작업 순서를 만든 뒤 최종 실행으로 넘기세요.";
}

export function buildStep8ExternalSyncReviewRows({
  externalSyncCheckedText,
  externalSyncCompletedText,
  externalSyncNextTaskText,
}: {
  externalSyncCheckedText: string;
  externalSyncCompletedText: string;
  externalSyncNextTaskText: string;
}): Step8ReviewRow[] {
  return [
    ["반영 결과", externalSyncCompletedText, "외부 도구 완료 보고가 반영된 작업 수입니다."],
    ["다음 작업", externalSyncNextTaskText, "이 작업만 이어서 처리하면 됩니다."],
    ["최근 확인", externalSyncCheckedText, "최종 실행과 성과 확인 화면에서 자동으로 다시 읽습니다."],
  ];
}

export function buildStep8LearningDecisionLabel({
  completedImplementationTaskCount,
  openRiskCount,
  productSignalCount,
  totalImplementationTaskCount,
}: {
  completedImplementationTaskCount: number;
  openRiskCount: number;
  productSignalCount: number;
  totalImplementationTaskCount: number;
}): Step8LearningDecisionLabel {
  if (totalImplementationTaskCount > 0 && completedImplementationTaskCount < totalImplementationTaskCount) {
    return "다음 작업 완료";
  }

  if (productSignalCount === 0) {
    return "첫 버전 배포";
  }

  return openRiskCount > 0 ? "리스크 보완" : "다음 빌드 범위 결정";
}

export function buildStep8LearningDecisionDetail(learningDecisionLabel: Step8LearningDecisionLabel) {
  if (learningDecisionLabel === "다음 작업 완료") {
    return "아직 완료되지 않은 제작 작업이 있습니다. 선택한 외부 개발 도구나 내부 제작 흐름에서 다음 작업을 끝내고 결과를 다시 반영하세요.";
  }

  if (learningDecisionLabel === "첫 버전 배포") {
    return "아직 실제 제품 이벤트가 없습니다. 먼저 첫 사용자에게 보여줄 버전을 만들고 핵심 행동 신호를 연결하세요.";
  }

  if (learningDecisionLabel === "리스크 보완") {
    return "사용 신호와 열린 리스크를 같이 보고 다음 빌드에서 제거할 차단 요인을 정하세요.";
  }

  return "최근 사용 신호를 보며 다음 빌드 범위를 작게 승인할지 판단하세요.";
}

export function buildStep8LearningDecisionOptions({
  hasNextImplementationTask,
  openRiskCount,
  productSignalCount,
}: {
  hasNextImplementationTask: boolean;
  openRiskCount: number;
  productSignalCount: number;
}) {
  if (hasNextImplementationTask) {
    return ["작업 계속", "막힘 해결", "완료 보고 반영"];
  }

  if (productSignalCount === 0) {
    return ["첫 버전 배포", "성과 신호 연결", "최종 실행 확인"];
  }

  return openRiskCount > 0 ? ["리스크 보완", "범위 축소", "보류"] : ["다음 빌드 승인", "작게 개선", "보류"];
}

export function formatStep8TaskCodePrefix(taskCode: string | null) {
  return taskCode ? `${taskCode} ` : "";
}

export function buildStep8LearningDisplayState({
  buildDeliveryMode,
  completedImplementationTaskCount,
  evidenceByTaskId,
  externalToolLabel,
  nextImplementationTask,
  nextImplementationTaskCode,
  nextImplementationTaskId,
  openRiskCount,
  productSignalCount,
  recentSignalCount,
  taskSyncUpdatedAt,
  tasks,
  totalImplementationTaskCount,
}: {
  buildDeliveryMode: BuildDeliveryMode;
  completedImplementationTaskCount: number;
  evidenceByTaskId: Record<string, string>;
  externalToolLabel: string;
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  nextImplementationTaskCode: string | null;
  nextImplementationTaskId: string | null;
  openRiskCount: number;
  productSignalCount: number;
  recentSignalCount: number;
  taskSyncUpdatedAt: string | null;
  tasks: ReadonlyArray<ImplementationTask>;
  totalImplementationTaskCount: number;
}): Step8LearningDisplayState {
  const learningSummary = buildStep8LearningSummary({
    buildDeliveryMode,
    completedImplementationTaskCount,
    externalToolLabel,
    nextImplementationTask,
    nextImplementationTaskCode,
    openRiskCount,
    productSignalCount,
    recentSignalCount,
    taskSyncUpdatedAt,
    totalImplementationTaskCount,
  });
  const progressSummary = buildStep8ProgressSummary({
    evidenceByTaskId,
    nextImplementationTaskId,
    tasks,
  });

  return {
    ...learningSummary,
    ...progressSummary,
    canCopyLearningReport: canCopyStep8LearningReport({ nextImplementationTask, productSignalCount }),
  };
}

export function canCopyStep8LearningReport({
  nextImplementationTask,
  productSignalCount,
}: {
  nextImplementationTask: Pick<ImplementationTask, "title"> | null;
  productSignalCount: number;
}) {
  return productSignalCount > 0 && !nextImplementationTask;
}

export function buildStep8ProgressSummary({
  evidenceByTaskId,
  nextImplementationTaskId,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  nextImplementationTaskId: string | null;
  tasks: ReadonlyArray<ImplementationTask>;
}): Step8ProgressSummary {
  const progressItems = sortStep8ProgressTasks(tasks).map((task, index) =>
    buildStep8ProgressDisplayItem({
      evidenceByTaskId,
      index,
      nextImplementationTaskId,
      task,
    }),
  );
  const hasNextTask = Boolean(nextImplementationTaskId);

  return {
    progressDetail: buildStep8ProgressDetail({ hasNextTask, progressItems }),
    progressItems,
    progressTitle: buildStep8ProgressTitle({ hasNextTask, progressItems }),
  };
}

export function buildStep8ProgressDisplayItem({
  evidenceByTaskId,
  index,
  nextImplementationTaskId,
  task,
}: {
  evidenceByTaskId: Record<string, string>;
  index: number;
  nextImplementationTaskId: string | null;
  task: ImplementationTask;
}): Step8ProgressDisplayItem {
  const evidence = getImplementationTaskEvidence(task, evidenceByTaskId);
  const checklist = getImplementationEvidenceChecklist(task, evidence);
  const passedCount = checklist.filter((item) => item.passed).length;
  const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);
  const isNext = nextImplementationTaskId === task.id;

  return {
    id: task.id,
    code: getCursorTaskCode(index),
    title: task.title,
    statusDetail: buildStep8ProgressStatusDetail({ evidence, isNext, task }),
    statusLabel: implementationTaskStatusLabels[task.status],
    statusTone: implementationTaskStatusTone[task.status],
    passedCount,
    totalCount: checklist.length,
    missingLabels,
    isNext,
    isDone: task.status === "done",
    showMissingEvidence: missingLabels.length > 0 && task.status !== "done",
  };
}

export function buildStep8ProgressStatusDetail({
  evidence,
  isNext,
  task,
}: {
  evidence: string;
  isNext: boolean;
  task: ImplementationTask;
}) {
  if (task.status === "done") {
    return evidence ? summarizeCursorProgressEvidence(evidence) : "완료 상태입니다.";
  }

  if (task.status === "blocked") {
    return getBlockedImplementationTaskHint(task).nextAction;
  }

  return isNext ? "다음으로 이어서 처리할 작업입니다." : "앞선 작업이 끝나면 이어서 처리합니다.";
}

export function buildStep8ProgressTitle({
  hasNextTask,
  progressItems,
}: {
  hasNextTask: boolean;
  progressItems: Step8ProgressDisplayItem[];
}) {
  return hasNextTask
    ? "다음 작업 하나만 확인"
    : areAllStep8ProgressItemsDone(progressItems)
      ? "제작 작업 완료"
      : progressItems.length > 0
        ? "상태 확인만 하기"
        : "진행표 대기";
}

export function buildStep8ProgressDetail({
  hasNextTask,
  progressItems,
}: {
  hasNextTask: boolean;
  progressItems: Step8ProgressDisplayItem[];
}) {
  return hasNextTask
    ? "오늘은 표시된 다음 작업 하나만 봅니다. 전체 목록은 필요할 때만 엽니다."
    : areAllStep8ProgressItemsDone(progressItems)
      ? "남은 제작 작업은 없습니다. 완료 근거와 오늘 판단만 확인합니다."
      : progressItems.length > 0
        ? "막힘, 건너뜀, 상태 누락만 확인합니다."
        : "최종 실행에서 첫 제작 작업을 넘기면 완료된 것, 이어 할 것, 지금 판단이 여기에 표시됩니다.";
}

export function areAllStep8ProgressItemsDone(progressItems: Step8ProgressDisplayItem[]) {
  return progressItems.length > 0 && progressItems.every((item) => item.isDone);
}

export function sortStep8ProgressTasks(tasks: ReadonlyArray<ImplementationTask>) {
  return [...tasks].sort(compareStep8ProgressTasks);
}

export function compareStep8ProgressTasks(a: Pick<ImplementationTask, "sort_order">, b: Pick<ImplementationTask, "sort_order">) {
  return a.sort_order - b.sort_order;
}
