import type { BuildDeliveryMode } from "@/lib/build-delivery";
import { getCursorTaskCode, summarizeCursorProgressEvidence } from "@/lib/external-progress-import";
import {
  getBlockedImplementationTaskHint,
  getImplementationEvidenceChecklist,
  implementationTaskStatusLabels,
  implementationTaskStatusTone,
} from "@/lib/implementation-task-metadata";
import type { ImplementationTask } from "@/lib/venture-data";

export type Step8OutcomeCard = {
  label: string;
  value: string;
  detail: string;
};

export type Step8ReviewRow = readonly [label: string, value: string, detail: string];

export type Step8LearningSummary = {
  learningDecisionCards: Step8OutcomeCard[];
  learningDecisionDetail: string;
  learningDecisionLabel: string;
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
  const taskPrefix = nextImplementationTaskCode ? `${nextImplementationTaskCode} ` : "";
  const learningDecisionLabel =
    totalImplementationTaskCount > 0 && completedImplementationTaskCount < totalImplementationTaskCount
      ? "다음 작업 완료"
      : productSignalCount === 0
        ? "첫 버전 배포"
        : openRiskCount > 0
          ? "리스크 보완"
          : "다음 빌드 범위 결정";
  const learningDecisionDetail =
    learningDecisionLabel === "다음 작업 완료"
      ? "아직 완료되지 않은 제작 작업이 있습니다. 선택한 외부 개발 도구나 내부 제작 흐름에서 다음 작업을 끝내고 결과를 다시 반영하세요."
      : learningDecisionLabel === "첫 버전 배포"
        ? "아직 실제 제품 이벤트가 없습니다. 먼저 첫 사용자에게 보여줄 버전을 만들고 핵심 행동 신호를 연결하세요."
        : learningDecisionLabel === "리스크 보완"
          ? "사용 신호와 열린 리스크를 같이 보고 다음 빌드에서 제거할 차단 요인을 정하세요."
          : "최근 사용 신호를 보며 다음 빌드 범위를 작게 승인할지 판단하세요.";
  const learningPrimaryActionLabel = nextImplementationTask
    ? "다음 제작 작업"
    : productSignalCount === 0
      ? "출시 전 확인"
      : "다음 빌드 판단";
  const learningPrimaryActionText = nextImplementationTask
    ? `다음 제작 작업은 ${taskPrefix}${nextImplementationTask.title}입니다. 실제 실행은 STEP 7/외부 도구에서 이어가고, 여기서는 완료 보고 반영 여부만 확인하세요.`
    : productSignalCount === 0
      ? "첫 버전을 배포하거나 내부 제작 흐름으로 넘긴 뒤, 방문과 핵심 행동 이벤트가 들어오는지 확인하세요."
      : `최근 14일 신호 ${recentSignalCount}개를 기준으로 다음 빌드 범위를 작게 정하세요.`;
  const learningPrimaryActionDetail = nextImplementationTask
    ? buildDeliveryMode === "external_tool"
      ? `${externalToolLabel}에서 완료 보고가 들어오면 이 화면의 작업 목록이 자동으로 갱신됩니다.`
      : "내부 제작 흐름에서 완료 증거가 저장되면 이 화면의 작업 목록이 자동으로 갱신됩니다."
    : productSignalCount === 0
      ? "실제 사용 신호가 없을 때는 리포트보다 제작 완료와 이벤트 연결 여부를 먼저 봅니다."
      : "이제 상세 이벤트는 필요할 때만 열고, 다음 개선 또는 보류 판단을 남기면 됩니다.";
  const learningOneSentenceOutcome = nextImplementationTask
    ? `${taskPrefix}${nextImplementationTask.title} 완료 보고가 반영되면 다음 판단으로 넘어갈 수 있습니다.`
    : productSignalCount === 0
      ? "지금은 성과 분석보다 첫 버전 배포와 이벤트 연결이 먼저입니다."
      : openRiskCount > 0
        ? "사용 신호는 들어왔고, 다음 결정은 열린 리스크를 하나 줄이는 것입니다."
        : "사용 신호가 들어왔으니 다음 빌드 범위를 작게 승인할 차례입니다.";
  const learningPrimaryCtaLabel = "리포트 복사";
  const learningPrimaryNavigationHintTitle = nextImplementationTask
    ? "다음 작업은 STEP 7에서 이어갑니다"
    : "최종 실행은 STEP 7에서 확인합니다";
  const learningPrimaryNavigationHintDetail = nextImplementationTask
    ? "이 화면은 완료와 다음 판단만 보여줍니다. 단계 이동은 왼쪽 단계 메뉴나 하단 단계 버튼에서 진행하세요."
    : "성과 확인 화면 안에서는 단계를 자동 이동하지 않습니다. 최종 실행 자료는 STEP 7에서 확인하세요.";
  const learningDecisionOptions = nextImplementationTask
    ? ["작업 계속", "막힘 해결", "완료 보고 반영"]
    : productSignalCount === 0
      ? ["첫 버전 배포", "성과 신호 연결", "최종 실행 확인"]
      : openRiskCount > 0
        ? ["리스크 보완", "범위 축소", "보류"]
        : ["다음 빌드 승인", "작게 개선", "보류"];
  const learningCompletedValue =
    totalImplementationTaskCount > 0
      ? `${completedImplementationTaskCount}/${totalImplementationTaskCount} 작업`
      : productSignalCount > 0
        ? `${productSignalCount}개 신호`
        : "없음";
  const learningCompletedDetail =
    totalImplementationTaskCount > 0
      ? completedImplementationTaskCount > 0
        ? "완료 보고가 저장된 제작 작업입니다."
        : "아직 완료 보고가 들어온 제작 작업은 없습니다."
      : productSignalCount > 0
        ? "첫 버전에서 들어온 실제 사용 신호입니다."
        : "아직 완료 보고나 제품 신호가 없습니다.";
  const learningRemainingValue = nextImplementationTask
    ? nextImplementationTaskCode
      ? `${nextImplementationTaskCode} 남음`
      : "작업 남음"
    : productSignalCount === 0
      ? "신호 연결"
      : openRiskCount > 0
        ? `${openRiskCount}개 리스크`
        : "없음";
  const learningRemainingDetail = nextImplementationTask
    ? `${nextImplementationTask.title}만 이어서 처리하면 됩니다.`
    : productSignalCount === 0
      ? "첫 버전을 배포한 뒤 방문과 핵심 행동 이벤트를 연결하세요."
      : openRiskCount > 0
        ? "열린 리스크 중 다음 빌드에서 줄일 항목을 하나 고르세요."
        : "남은 차단 항목이 없으면 다음 빌드 범위를 작게 정하면 됩니다.";
  const learningDecisionCards = [
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
  const learningSimpleReviewRows: Step8ReviewRow[] = [
    ["완료", learningCompletedValue, learningCompletedDetail],
    ["이어 할 것", learningRemainingValue, learningRemainingDetail],
    ["판단", learningDecisionLabel, learningDecisionDetail],
  ];
  const learningJudgmentQuestion = nextImplementationTask
    ? "이 작업을 완료로 볼 근거가 있나요?"
    : productSignalCount === 0
      ? "첫 버전 배포와 성과 신호 연결이 끝났나요?"
      : openRiskCount > 0
        ? "다음 빌드에서 어떤 리스크 하나를 먼저 줄일까요?"
        : "다음 빌드를 작게 승인할까요, 아니면 보류할까요?";
  const learningNextJudgmentBrief = nextImplementationTask
    ? "다음 제작 작업의 완료 여부만 확인하면 됩니다. 상세 리포트는 아직 열지 않아도 됩니다."
    : productSignalCount === 0
      ? "첫 버전 배포와 성과 신호 연결만 확인하면 됩니다. 숫자 리포트는 아직 이릅니다."
      : openRiskCount > 0
        ? "다음 빌드에서 줄일 리스크 하나만 고르면 됩니다. 상세 리포트는 필요할 때만 엽니다."
        : "다음 빌드 범위를 승인할지 보류할지만 정하면 됩니다. 상세 리포트는 필요할 때만 엽니다.";
  const externalSyncCompletedText =
    totalImplementationTaskCount > 0 ? `${completedImplementationTaskCount}/${totalImplementationTaskCount} 작업` : "작업 생성 전";
  const externalSyncNextTaskText = nextImplementationTask
    ? `${taskPrefix}${nextImplementationTask.title}`
    : totalImplementationTaskCount > 0
      ? "모든 작업 완료"
      : "STEP 6 작업 순서 생성";
  const externalSyncCheckedText = taskSyncUpdatedAt ?? "화면을 열면 자동 확인";
  const externalSyncOutcomeSentence =
    totalImplementationTaskCount > 0
      ? `자동 반영 기준으로 완료 ${externalSyncCompletedText}, 다음은 ${externalSyncNextTaskText}입니다.`
      : "아직 반영할 제작 작업이 없습니다. STEP 6에서 작업 순서를 만든 뒤 최종 실행으로 넘기세요.";
  const externalSyncReviewRows: Step8ReviewRow[] = [
    ["반영 결과", externalSyncCompletedText, "외부 도구 완료 보고가 반영된 작업 수입니다."],
    ["다음 작업", externalSyncNextTaskText, "이 작업만 이어서 처리하면 됩니다."],
    ["최근 확인", externalSyncCheckedText, "최종 실행과 성과 확인 화면에서 자동으로 다시 읽습니다."],
  ];

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

export function buildStep8ProgressSummary({
  evidenceByTaskId,
  nextImplementationTaskId,
  tasks,
}: {
  evidenceByTaskId: Record<string, string>;
  nextImplementationTaskId: string | null;
  tasks: ReadonlyArray<ImplementationTask>;
}): Step8ProgressSummary {
  const progressItems = [...tasks]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((task, index) => {
      const evidence = evidenceByTaskId[task.id] ?? task.evidence ?? "";
      const checklist = getImplementationEvidenceChecklist(task, evidence);
      const passedCount = checklist.filter((item) => item.passed).length;
      const missingLabels = checklist.filter((item) => !item.passed).map((item) => item.label);
      const isNext = nextImplementationTaskId === task.id;
      const statusDetail =
        task.status === "done"
          ? evidence
            ? summarizeCursorProgressEvidence(evidence)
            : "완료 상태입니다."
          : task.status === "blocked"
            ? getBlockedImplementationTaskHint(task).nextAction
            : isNext
              ? "다음으로 이어서 처리할 작업입니다."
              : "앞선 작업이 끝나면 이어서 처리합니다.";

      return {
        id: task.id,
        code: getCursorTaskCode(index),
        title: task.title,
        statusDetail,
        statusLabel: implementationTaskStatusLabels[task.status],
        statusTone: implementationTaskStatusTone[task.status],
        passedCount,
        totalCount: checklist.length,
        missingLabels,
        isNext,
        isDone: task.status === "done",
        showMissingEvidence: missingLabels.length > 0 && task.status !== "done",
      };
    });
  const hasNextTask = Boolean(nextImplementationTaskId);
  const allTasksDone = progressItems.length > 0 && progressItems.every((item) => item.isDone);
  const progressTitle = hasNextTask
    ? "다음 작업 하나만 확인"
    : allTasksDone
      ? "제작 작업 완료"
      : progressItems.length > 0
        ? "상태 확인만 하기"
      : "진행표 대기";
  const progressDetail = hasNextTask
    ? "오늘은 표시된 다음 작업 하나만 끝내면 됩니다. 전체 목록은 진행 순서 확인용으로만 봅니다."
    : allTasksDone
      ? "남은 제작 작업은 없습니다. 완료 근거를 훑고 다음 판단은 위의 한눈 요약에서 정합니다."
      : progressItems.length > 0
        ? "다음 작업이 자동으로 잡히지 않았습니다. 막힘, 건너뜀, 상태 누락만 확인합니다."
      : "최종 실행에서 첫 제작 작업을 넘기면 완료된 것, 이어 할 것, 지금 판단이 여기에 표시됩니다.";

  return {
    progressDetail,
    progressItems,
    progressTitle,
  };
}
