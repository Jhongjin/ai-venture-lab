import type { DecisionStatus, IdeaStage } from "@/lib/supabase/types";
import {
  getWorkbenchIdeaProgress,
  type WorkbenchTask,
  type WorkbenchTaskSummary,
} from "@/lib/workbench-tasks";

type WorkbenchOperatorFocusInput = {
  activeTask: WorkbenchTask;
  isDiscardedIdea: boolean;
  isScoreEvaluationSaved: boolean;
  hasMarketScanArtifact: boolean;
  hasOutdatedMarketScanArtifact: boolean;
  isValidationBundleSaved: boolean;
  hasSavedDevelopmentAutoPackage: boolean;
  canEnterLaunch: boolean;
  nextLaunchBlocker: { label: string; detail: string } | null;
};

type WorkbenchOperatorFocusCopy = {
  title: string;
  detail: string;
};

export type WorkbenchCurrentActionDisplayState = {
  actionItems: string[];
  activeTaskLabel: string;
  detail: string;
  gateNote: string;
  progressLabel: string;
  title: string;
};

export function buildWorkbenchCurrentActionDisplayState({
  activeTask,
  canEnterLaunch,
  hasMarketScanArtifact,
  hasOutdatedMarketScanArtifact,
  hasSavedDevelopmentAutoPackage,
  isDiscardedIdea,
  isScoreEvaluationSaved,
  isValidationBundleSaved,
  nextLaunchBlocker,
  selectedIdea,
  workbenchTasks,
}: WorkbenchOperatorFocusInput & {
  selectedIdea: { decision: DecisionStatus; stage: IdeaStage };
  workbenchTasks: ReadonlyArray<WorkbenchTaskSummary>;
}): WorkbenchCurrentActionDisplayState {
  const activeTaskMeta = workbenchTasks.find((task) => task.id === activeTask) ?? workbenchTasks[0];
  const operatorFocus = getWorkbenchOperatorFocusCopy({
    activeTask,
    canEnterLaunch,
    hasMarketScanArtifact,
    hasOutdatedMarketScanArtifact,
    hasSavedDevelopmentAutoPackage,
    isDiscardedIdea,
    isScoreEvaluationSaved,
    isValidationBundleSaved,
    nextLaunchBlocker,
  });
  const selectedIdeaProgress = getWorkbenchIdeaProgress(selectedIdea);

  return {
    actionItems: getWorkbenchOperatorActionItems(activeTask),
    activeTaskLabel: activeTaskMeta?.label ?? "현재 단계",
    detail: operatorFocus.detail,
    gateNote: getWorkbenchOperatorGateNote(activeTask),
    progressLabel: selectedIdeaProgress.label,
    title: operatorFocus.title,
  };
}

export function getWorkbenchOperatorFocusCopy({
  activeTask,
  isDiscardedIdea,
  isScoreEvaluationSaved,
  hasMarketScanArtifact,
  hasOutdatedMarketScanArtifact,
  isValidationBundleSaved,
  hasSavedDevelopmentAutoPackage,
  canEnterLaunch,
  nextLaunchBlocker,
}: WorkbenchOperatorFocusInput): WorkbenchOperatorFocusCopy {
  if (isDiscardedIdea) {
    return {
      title: "삭제한 아이디어는 필요할 때만 복구하거나 완전히 삭제하세요.",
      detail: "진행 흐름으로 돌아가려면 검토 중인 아이디어를 다시 선택하면 됩니다.",
    };
  }

  switch (activeTask) {
    case "select":
      return {
        title: "오늘 이어갈 아이디어 한 건만 고르면 됩니다.",
        detail: "선택한 아이디어의 저장된 단계가 열리고, AI가 다음 판단 자료를 이어서 준비합니다.",
      };
    case "score":
      return {
        title: isScoreEvaluationSaved
          ? "사업성 평가가 저장됐습니다. 하단 다음 단계 버튼으로 검증 계획을 이어가세요."
          : "AI가 채운 사업성 평가와 결과물 형태만 확인한 뒤 저장하세요.",
        detail: "점수는 참고값입니다. 사용자는 맞는지 확인하고 저장하면 다음 단계가 열립니다.",
      };
    case "risk":
      return {
        title: "막힐 수 있는 위험 하나와 대응 방향만 확인하세요.",
        detail: "긴 위험 목록보다 높은 위험과 완화 조건이 다음 제작 판단에 더 중요합니다.",
      };
    case "decision":
      return {
        title: "진행, 추가 조사, 전환, 중단 중 지금 판단을 한 번만 남기세요.",
        detail: "보조 버튼은 근거를 채울 뿐이고, 단계 이동은 하단 다음 단계 버튼에서만 진행됩니다.",
      };
    case "experiment":
      return {
        title: hasMarketScanArtifact
          ? "검증 계획과 시장·경쟁 점검이 저장됐습니다. 하단 다음 단계 버튼으로 이어가세요."
          : hasOutdatedMarketScanArtifact
            ? "결과물 형태가 바뀌었습니다. AI가 현재 기준으로 시장·경쟁 점검을 다시 정리합니다."
            : "AI가 시장·경쟁 점검을 먼저 정리합니다. 사용자는 결과만 확인하세요.",
        detail:
          "다음 단계는 검증 계획과 AI 조사 노트가 저장된 뒤에만 열립니다. 수동 결과 기록은 실제 인터뷰나 테스트 결과가 있을 때만 열면 됩니다.",
      };
    case "artifacts":
      return {
        title: isValidationBundleSaved
          ? "검증 자료가 저장됐습니다. 하단 다음 단계 버튼으로 제작 패키지를 이어가세요."
          : "AI가 만든 검증 자료를 한 번에 저장하세요.",
        detail: "아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 같은 기준으로 묶습니다.",
      };
    case "development":
      return {
        title: hasSavedDevelopmentAutoPackage
          ? "제작 패키지가 저장됐습니다. 하단 다음 단계 버튼으로 작업 순서를 확인하세요."
          : "AI 제작 패키지 만들기를 누르고 최종 요약만 확인하세요.",
        detail: "디자인 기준, 제작 실행 계획, 외부 제작 도구 전달 자료가 한 번에 저장됩니다.",
      };
    case "orchestration":
      return {
        title: "저장된 제작 패키지를 기준으로 작업 순서를 확인하세요.",
        detail: "전략, 기획, 디자인, 제작, 품질, 출시 흐름이 같은 아이디어 기준으로 이어집니다.",
      };
    case "launch":
      return {
        title: canEnterLaunch
          ? "모든 준비가 끝났습니다. 이제 선택한 개발 방식으로 실행하면 됩니다."
          : "최종 실행 전 준비가 남아 있습니다. 이 단계는 준비가 끝나야 열립니다.",
        detail: canEnterLaunch
          ? "외부 제작 도구를 선택했다면 패키지와 지시문을 받고, 내부 진행을 선택했다면 내부 개발 도구로 이어갑니다."
          : nextLaunchBlocker
            ? `${nextLaunchBlocker.label}: ${nextLaunchBlocker.detail}`
            : "제작 패키지와 작업 순서를 먼저 준비해야 합니다.",
      };
    case "learning":
      return {
        title: "제작 작업 상태를 보고 다음 행동만 정하세요.",
        detail: "작업별 완료/진행/차단 상태를 먼저 확인하고, 실제 사용 신호와 리포트는 출시 후 필요할 때만 펼쳐 봅니다.",
      };
    case "archive":
    default:
      return {
        title: "삭제한 아이디어는 복구하거나 완전히 삭제할 때만 확인하세요.",
        detail: "현재 진행에는 영향을 주지 않으니 필요한 항목만 처리하면 됩니다.",
      };
  }
}

export function getWorkbenchOperatorActionItems(activeTask: WorkbenchTask) {
  switch (activeTask) {
    case "select":
      return ["아이디어 선택", "진행 단계 확인", "이어서 볼 단계 열기"];
    case "score":
      return ["결과물 형태 확인", "평가값 확인", "사업성 평가 저장"];
    case "experiment":
      return ["검증 계획 확인", "시장·경쟁 근거 확인", "검증 계획 저장"];
    case "artifacts":
      return ["자료 묶음 확인", "필요한 메모만 보완", "검증 자료 저장"];
    case "development":
      return ["AI 제작 패키지 만들기", "최종 요약 확인", "제작 패키지 저장"];
    case "orchestration":
      return ["작업 순서 자동 만들기", "T-001 확인", "하단 다음 단계"];
    case "launch":
      return ["준비 완료 확인", "연결 파일 받기", "선택한 개발 방식으로 실행"];
    case "learning":
      return ["완료 상태 확인", "다음 행동 확인", "오늘 판단 기록"];
    case "risk":
      return ["막는 위험 확인", "심각도 선택", "대응 방향 저장"];
    case "decision":
      return ["현재 판단 선택", "근거 한 문단 확인", "판단 기록 저장"];
    case "archive":
      return ["삭제 목록 확인", "복구 여부 결정", "필요할 때만 완전 삭제"];
    default:
      return ["현재 내용 확인", "필요한 부분만 수정", "하단 다음 단계"];
  }
}

export function getWorkbenchOperatorGateNote(activeTask: WorkbenchTask) {
  switch (activeTask) {
    case "score":
      return "사업성 평가를 저장하면 STEP 3 검증 계획으로 이어집니다.";
    case "experiment":
      return "검증 계획과 시장 근거가 저장되면 STEP 4 검증 자료가 열립니다.";
    case "artifacts":
      return "검증 자료를 저장하면 STEP 5 제작 패키지로 이어집니다.";
    case "development":
      return "제작 패키지를 저장하면 STEP 6 작업 순서 확인이 열립니다.";
    case "orchestration":
      return "작업 순서를 저장하면 STEP 7 최종 실행이 열립니다.";
    case "select":
      return "아이디어를 선택하면 저장된 단계부터 이어서 볼 수 있습니다.";
    case "launch":
      return "연결 파일을 받은 뒤 실제 외부 프로젝트에서 실행을 시작합니다.";
    case "learning":
      return "완료 상태와 다음 행동을 확인한 뒤 오늘 판단만 기록하면 됩니다.";
    case "risk":
      return "위험 대응을 저장하면 사업성 판단과 제작 범위에 반영됩니다.";
    case "decision":
      return "판단 기록을 저장하면 이후 검증 자료와 제작 패키지에 근거로 남습니다.";
    case "archive":
      return "복구하거나 완전 삭제할 때만 현재 목록이 바뀝니다.";
    default:
      return "저장 완료 후에는 하단 다음 단계 버튼으로만 이동합니다.";
  }
}
