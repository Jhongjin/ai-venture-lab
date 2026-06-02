import type { WorkbenchTask } from "@/components/idea-workbench";
import type { ConsoleActionTask, ConsoleWorkflowStatus } from "@/components/venture-console-actions";

export type ShellTask = `console:${ConsoleActionTask}` | `workbench:${WorkbenchTask}`;
export type ShellTaskGroup = "시작" | "검증" | "제작" | "출시 후";

export type ShellTaskGuidance = {
  summary: string;
  checklist: string[];
};

export type ShellTaskCanvasDetails = {
  question: string;
  aiLead: string;
  deliverable: string;
  checkpoint: string;
};

export type TaskTransitionOption = {
  id: ShellTask;
  cta: string;
  hint: string;
  variant: "primary" | "optional";
  disabled?: boolean;
};

export type ExecutiveFocus = {
  eyebrow: string;
  title: string;
  detail: string;
  evidence: string;
  risk: string;
  targetTask?: ShellTask;
  cta?: string;
  metrics: Array<{ label: string; value: string }>;
};

export type ShellTaskStatusContext = {
  artifactCount: number;
  completedImplementationTaskCount: number;
  discardedIdeaCount: number;
  experimentCount: number;
  ideaCount: number;
  implementationTaskCount: number;
  launchReadiness: {
    canEnterLaunch: boolean;
    launchReadinessScore: number;
    nextLaunchBlockerLabel: string | null;
  };
  openRisks: number;
  runCount: number;
  telemetryEventCount: number;
};

export const primaryShellTaskIds: ShellTask[] = [
  "console:extract",
  "workbench:score",
  "workbench:experiment",
  "workbench:artifacts",
  "workbench:development",
  "workbench:orchestration",
  "workbench:launch",
  "workbench:learning",
];

export const primaryShellTaskSet = new Set<ShellTask>(primaryShellTaskIds);

export const firstRunGuideSteps = [
  {
    label: "1",
    title: "메모만 넣기",
    detail: "정리된 기획서가 없어도 됩니다. 회의 내용, 아이디어, GPT 대화를 그대로 넣습니다.",
  },
  {
    label: "2",
    title: "AI 정리 확인",
    detail: "후보 아이디어, 결과물 형태, 개발 방식이 맞는지만 봅니다.",
  },
  {
    label: "3",
    title: "저장 후 다음 단계",
    detail: "저장 완료 후에는 화면 하단의 다음 단계 버튼만 따라가면 됩니다.",
  },
] as const;

export const taskGuidance: Record<ShellTask, ShellTaskGuidance> = {
  "console:auth": {
    summary: "관리자 계정으로 바로 로그인합니다. 별도 인증키나 메일 링크는 다루지 않아도 됩니다.",
    checklist: ["이메일과 비밀번호 입력", "로그인 상태 확인", "하단 다음 단계 버튼 확인"],
  },
  "console:workspace": {
    summary: "기본은 1인 작업 기준으로 진행하고, 팀과 함께 봐야 할 때만 협업 공간을 연결합니다.",
    checklist: ["1인 작업으로 진행할 때는 건너뛰기", "팀 공간 생성 또는 선택", "필요한 멤버만 추가"],
  },
  "console:extract": {
    summary: "아이디어 입력 후 AI가 내용을 구체화합니다.",
    checklist: ["아이디어 입력", "AI 정리 결과 확인", "마음에 드는 한 건 저장"],
  },
  "console:idea": {
    summary: "AI가 정리한 초안을 확인하고 필요한 의견만 더한 뒤 저장합니다.",
    checklist: ["이름과 한 줄 설명 확인", "필요할 때만 추가 항목 보완", "아이디어 저장"],
  },
  "workbench:select": {
    summary: "진행 중인 아이디어를 보고 마지막 단계에서 이어갑니다.",
    checklist: ["아이디어 목록 확인", "진행 단계 확인", "이어서 볼 아이디어 선택"],
  },
  "workbench:score": {
    summary: "AI가 수요, 구매 의향, 제작 난이도, 위험도를 먼저 정리합니다.",
    checklist: ["결과물 형태 확인", "평가값이 맞는지 확인", "사업성 평가 저장"],
  },
  "workbench:risk": {
    summary: "출시를 막을 수 있는 위험만 먼저 꺼냅니다.",
    checklist: ["리스크 제목과 영역 입력", "심각도 선택", "완화 방안 또는 수용 조건 기록"],
  },
  "workbench:decision": {
    summary: "왜 진행, 보완, 전환, 중단할지 한 문단 근거를 남깁니다.",
    checklist: ["현재 판단 확인", "판단 근거 작성", "최종 기록 저장"],
  },
  "workbench:archive": {
    summary: "삭제한 아이디어를 확인하고 되살리거나 완전히 지웁니다.",
    checklist: ["삭제한 아이디어 확인", "되살릴지 결정", "필요할 때만 완전 삭제"],
  },
  "workbench:experiment": {
    summary: "AI가 추천한 가장 작은 검증 계획을 확인하고 저장합니다.",
    checklist: ["AI 추천 검증 계획 확인", "검증 계획 저장", "시장·경쟁 자동 점검 확인"],
  },
  "workbench:orchestration": {
    summary: "AI가 만든 작업 순서를 확인하고 필요한 결과만 보완합니다.",
    checklist: ["작업 순서 자동 만들기", "필요한 단계 결과 확인", "하단 다음 단계 버튼 확인"],
  },
  "workbench:artifacts": {
    summary: "AI가 만든 아이디어 요약, 기획서, 첫 제작 범위를 확인하고 저장합니다.",
    checklist: ["AI 초안 확인", "필요할 때만 메모 보완", "검증 자료 한 번에 저장"],
  },
  "workbench:development": {
    summary: "검증 결과와 결과물 형태를 바탕으로 제작에 넘길 패키지를 만듭니다.",
    checklist: ["AI 제작 패키지 만들기", "최종 요약 확인", "제작 패키지 저장"],
  },
  "workbench:launch": {
    summary: "검증과 제작 패키지가 모두 끝난 뒤 외부 제작 도구 연결 또는 내부 개발 이동을 실행합니다.",
    checklist: ["준비 완료 상태 확인", "제작 패키지 받기", "선택한 개발 방식으로 실행"],
  },
  "workbench:learning": {
    summary: "외부 제작 도구가 반영한 작업 상태와 실제 행동 신호를 보고 다음 결정을 정합니다.",
    checklist: ["제작 작업 완료 상태 확인", "다음 작업이나 보완 지점 확인", "필요할 때 사용 신호 펼쳐보기"],
  },
};

export const taskCanvasDetails: Record<ShellTask, ShellTaskCanvasDetails> = {
  "console:auth": {
    question: "이 보드를 계속 운영할 계정이 준비됐나요?",
    aiLead: "로그인 상태를 확인하고, 이후 단계가 열리는 최소 조건만 안내합니다.",
    deliverable: "로그인된 운영자 세션",
    checkpoint: "이후 단계는 한 명이 끝까지 처리할 수 있게 이어집니다.",
  },
  "console:workspace": {
    question: "이 아이디어를 1인 작업으로 다룰지, 팀과 함께 볼지 결정했나요?",
    aiLead: "1인 작업 흐름을 기본으로 두고, 팀 검토가 필요할 때만 협업 공간을 연결합니다.",
    deliverable: "선택형 팀 공간 연결 상태",
    checkpoint: "협업이 필요하지 않다면 이 단계는 건너뛰어도 괜찮습니다.",
  },
  "console:extract": {
    question: "회의 내용, 아이디어, 자동화하고 싶은 업무 내용을 입력칸에 붙여넣으세요.",
    aiLead: "AI가 원문에서 먼저 검토할 아이디어, 결과물 형태, 검증 질문을 함께 정리합니다.",
    deliverable: "먼저 볼 아이디어와 이후 제작 패키지에 쓰일 결과물 형태",
    checkpoint: "처음에는 입력칸 하나만 쓰면 됩니다. 결과물 형태는 저장 전에 웹/앱/자동화 기준으로 확인하고 STEP 2에서도 다시 바꿀 수 있습니다.",
  },
  "console:idea": {
    question: "이 아이디어를 실제 검증 대상으로 올릴 준비가 되었나요?",
    aiLead: "이름, 한 줄 설명, 신호, 추가로 확인할 내용을 초안으로 채웁니다.",
    deliverable: "검증 가능한 아이디어 한 건",
    checkpoint: "사용자는 꼭 필요한 의견만 더하면 됩니다.",
  },
  "workbench:select": {
    question: "어떤 아이디어를 이어서 볼까요?",
    aiLead: "진행 중인 아이디어와 마지막 단계를 한눈에 보여줍니다.",
    deliverable: "이어서 볼 아이디어 한 건",
    checkpoint: "아이디어를 고르면 저장된 단계 화면으로 이동합니다.",
  },
  "workbench:score": {
    question: "이 아이디어는 시간과 자원을 써서 검증할 만한가?",
    aiLead: "AI가 수요, 구매 의향, 제작 난이도, 위험도를 묶어 평가 초안을 채웁니다.",
    deliverable: "사업성 평가와 권장 판단",
    checkpoint: "기준값은 AI가 먼저 채우고, 사용자는 맞지 않는 부분만 조정합니다.",
  },
  "workbench:risk": {
    question: "출시를 막을 만한 법무·운영·보안 이슈가 있나요?",
    aiLead: "리스크 영역을 묶고, 심각도와 대응 방향을 먼저 정리합니다.",
    deliverable: "핵심 리스크 목록",
    checkpoint: "막는 리스크인지, 관리 가능한 리스크인지 구분하는 단계입니다.",
  },
  "workbench:experiment": {
    question: "AI가 추천한 검증 계획을 저장할까요?",
    aiLead: "AI가 인터뷰, 랜딩, 수동 결과물 테스트 중 가장 작은 검증 행동과 성공/중단 기준을 정리합니다.",
    deliverable: "7일 검증 계획",
    checkpoint: "사용자는 추천안을 확인하고, 필요한 메모만 보완하면 됩니다.",
  },
  "workbench:decision": {
    question: "지금은 진행, 보완, 전환, 중단 중 무엇이 맞을까요?",
    aiLead: "사업성 평가, 리스크, 실험 조건을 묶어 의사결정용 근거를 정리합니다.",
    deliverable: "진행 판단 메모",
    checkpoint: "회의 공유가 가능한 한 문단 결론이 가장 중요합니다.",
  },
  "workbench:archive": {
    question: "삭제한 아이디어를 다시 볼까요?",
    aiLead: "삭제한 아이디어를 따로 모아 보여주고, 복구와 완전 삭제를 분리합니다.",
    deliverable: "삭제한 아이디어 목록",
    checkpoint: "되살리면 사업성 평가 단계에서 다시 이어갈 수 있습니다.",
  },
  "workbench:artifacts": {
    question: "검증 자료와 기획 초안을 저장할까요?",
    aiLead: "AI가 아이디어 요약, 조사 요약, 검증 완료 요약, 기획서와 첫 제작 범위를 정리합니다.",
    deliverable: "검증 자료와 기획 초안",
    checkpoint: "사용자는 처음부터 작성하지 않고, 저장할 내용만 확인하면 됩니다.",
  },
  "workbench:development": {
    question: "이제 제작에 넘길 패키지를 정리할 차례입니다.",
    aiLead: "AI가 제품 기획서, 디자인 기준, 기술 방향, 첫 제작 범위를 한 번에 묶습니다.",
    deliverable: "제작 패키지",
    checkpoint: "사용자는 최종 요약만 확인하고, 필요한 메모만 더하면 됩니다.",
  },
  "workbench:orchestration": {
    question: "작업 순서가 충분히 명확한가요?",
    aiLead: "전략, 디자인, 제작, 품질 점검, 보안의 순서를 먼저 만들고 막히는 요인을 표시합니다.",
    deliverable: "작업 순서와 다음 행동",
    checkpoint: "상태 변경은 실제 실행 추적이 필요할 때만 쓰면 됩니다.",
  },
  "workbench:launch": {
    question: "이제 어떤 제작 환경으로 넘길까요?",
    aiLead: "저장된 개발 방식에 맞춰 외부 제작 도구 패키지 또는 내부 개발 이동 자료를 보여줍니다.",
    deliverable: "최종 제작 패키지와 실행 시작점",
    checkpoint: "준비가 부족하면 이 단계는 열리지 않습니다.",
  },
  "workbench:learning": {
    question: "제작 작업이 어디까지 끝났고, 다음에 무엇을 해야 하나요?",
    aiLead: "외부 제작 도구의 완료 보고를 작업별 상태로 정리하고, 실제 사용 신호는 필요할 때만 펼쳐 보여줍니다.",
    deliverable: "작업 진행표와 다음 판단",
    checkpoint: "사용자는 작업표를 보고 이어서 제작할지, 보완할지, 새 검증으로 돌아갈지만 정하면 됩니다.",
  },
};

export function createTransition(
  id: ShellTask,
  cta: string,
  hint: string,
  variant: TaskTransitionOption["variant"] = "primary",
  disabled = false,
): TaskTransitionOption {
  return { id, cta, hint, variant, disabled };
}

export function getNextTaskOptions({
  activeTask,
  ideaCount,
  canEnterExperiment,
  canEnterArtifacts,
  canEnterDevelopment,
  canEnterOrchestration,
  canEnterLaunch,
}: {
  activeTask: ShellTask;
  ideaCount: number;
  canEnterExperiment: boolean;
  canEnterArtifacts: boolean;
  canEnterDevelopment: boolean;
  canEnterOrchestration: boolean;
  canEnterLaunch: boolean;
}) {
  switch (activeTask) {
    case "console:auth":
      return [];
    case "console:workspace":
      return [];
    case "console:extract":
      return ideaCount > 0
        ? [createTransition("workbench:score", "다음: 사업성 평가", "저장된 아이디어의 수요와 실행 가능성을 점검합니다.")]
        : [];
    case "console:idea":
      return [];
    case "workbench:select":
      return ideaCount > 0
        ? [createTransition("workbench:score", "다음: 사업성 평가", "한 아이디어를 골라 수요와 속도를 점검합니다.")]
        : [];
    case "workbench:score":
      return [
        createTransition(
          "workbench:experiment",
          "다음: AI 검증안 확인",
          canEnterExperiment
            ? "사업성 평가를 저장했습니다. 이제 7일 안에 확인할 작은 검증을 정합니다."
            : "사업성 평가를 저장하면 활성화됩니다.",
          "primary",
          !canEnterExperiment,
        ),
      ];
    case "workbench:risk":
      return [
        createTransition("workbench:experiment", "다음: AI 검증안 확인", "리스크를 적었다면 이제 실제로 확인할 계획을 정합니다."),
      ];
    case "workbench:experiment":
      return [
        createTransition(
          "workbench:artifacts",
          "다음: 검증 자료 저장",
          canEnterArtifacts
            ? "검증 계획과 시장·경쟁 점검이 저장됐습니다. 이제 아이디어 요약과 제작 범위를 문서로 남깁니다."
            : "검증 계획과 시장·경쟁 점검이 모두 저장되면 활성화됩니다.",
          "primary",
          !canEnterArtifacts,
        ),
      ];
    case "workbench:decision":
      return [
        createTransition("workbench:artifacts", "다음: 검증 자료 저장", "아이디어 요약, 기획서, 첫 제작 범위를 제작 자료로 남깁니다."),
      ];
    case "workbench:artifacts":
      return [
        createTransition(
          "workbench:development",
          "다음: 제작 패키지",
          canEnterDevelopment
            ? "검증 완료 요약까지 저장했습니다. 이제 디자인, 제작, 배포 준비를 구체화합니다."
            : "아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약을 모두 저장하면 활성화됩니다.",
          "primary",
          !canEnterDevelopment,
        ),
      ];
    case "workbench:development":
      return [
        createTransition(
          "workbench:orchestration",
          "다음: 작업 순서 확인",
          canEnterOrchestration
            ? "제작 패키지를 저장했습니다. 이제 작업 순서를 확인합니다."
            : "최종 제작 패키지를 저장하면 활성화됩니다.",
          "primary",
          !canEnterOrchestration,
        ),
      ];
    case "workbench:orchestration":
      return [
        createTransition(
          "workbench:launch",
          "다음: 최종 실행",
          canEnterLaunch
            ? "작업 순서와 제작 패키지가 준비되었습니다. 이제 선택한 개발 방식으로 넘깁니다."
            : "제작 패키지를 저장하고 작업 순서를 만들면 활성화됩니다.",
          "primary",
          !canEnterLaunch,
        ),
      ];
    case "workbench:launch":
      return [
        createTransition(
          "workbench:learning",
          "성과 확인 화면 보기",
          "출시 완료 여부와 별개로 저장된 판단을 바탕으로 행동 신호 기준을 확인합니다.",
        ),
      ];
    case "workbench:learning":
      return [createTransition("console:idea", "다음: 새 아이디어 저장", "이제 다음 아이디어를 다시 검토합니다.")];
    default:
      return [];
  }
}

export function getCurrentStepBlocker({
  activeTask,
  consoleStatus,
  ideaCount,
}: {
  activeTask: ShellTask;
  consoleStatus: ConsoleWorkflowStatus;
  ideaCount: number;
}) {
  switch (activeTask) {
    case "console:auth":
      return "로그인하면 아이디어 도출을 시작할 준비가 됩니다. 협업 설정은 나중에 선택할 수 있습니다.";
    case "console:workspace":
      return consoleStatus.hasWorkspace
        ? "협업 공간을 연결했습니다. 다시 아이디어 도출로 돌아가 계속 진행하면 됩니다."
        : "이 단계는 선택 기능입니다. 팀으로 같이 볼 때만 워크스페이스를 만들거나 선택하세요.";
    case "console:extract":
      return consoleStatus.hasExtractedIdeas
        ? "추천 아이디어를 저장 양식에 불러온 뒤 저장하면, 하단 다음 단계 버튼이 열립니다."
        : "아이디어를 고른 뒤 저장하면, 하단 다음 단계 버튼으로 STEP 2에 갈 수 있습니다.";
    case "console:idea":
      return ideaCount > 0
        ? "아이디어를 저장하면 하단 다음 단계 버튼으로 검증 단계에 갈 수 있습니다."
        : "아이디어를 최소 한 건 저장해야 하단 다음 단계 버튼이 열립니다.";
    default:
      return null;
  }
}

export function buildVentureConsoleTaskStatuses({
  artifactCount,
  completedImplementationTaskCount,
  discardedIdeaCount,
  experimentCount,
  ideaCount,
  implementationTaskCount,
  launchReadiness,
  openRisks,
  runCount,
  telemetryEventCount,
}: ShellTaskStatusContext): Record<ShellTask, string> {
  return {
    "console:auth": "접근",
    "console:workspace": "선택",
    "console:extract": "도출",
    "console:idea": "저장",
    "workbench:select": `${ideaCount}개`,
    "workbench:score": "평가",
    "workbench:risk": `${openRisks}개`,
    "workbench:experiment": `${experimentCount}개`,
    "workbench:decision": "판단",
    "workbench:archive": `${discardedIdeaCount}개`,
    "workbench:artifacts": `${artifactCount}개`,
    "workbench:development": implementationTaskCount > 0 ? `${implementationTaskCount}개` : "준비",
    "workbench:orchestration": `${runCount}개`,
    "workbench:launch": launchReadiness.canEnterLaunch
      ? "준비 완료"
      : launchReadiness.nextLaunchBlockerLabel ?? `${launchReadiness.launchReadinessScore}%`,
    "workbench:learning":
      implementationTaskCount > 0
        ? `${completedImplementationTaskCount}/${implementationTaskCount}`
        : telemetryEventCount > 0
          ? `${telemetryEventCount}개`
          : "대기",
  };
}

export function getExecutiveFocus({
  activeTask,
  consoleStatus,
  source,
  ideaCount,
  openRisks,
  experimentCount,
  decisionCount,
  artifactCount,
  implementationTaskCount,
  runCount,
  telemetryEventCount,
}: {
  activeTask: ShellTask;
  consoleStatus: ConsoleWorkflowStatus;
  source: "supabase" | "seed";
  ideaCount: number;
  openRisks: number;
  experimentCount: number;
  decisionCount: number;
  artifactCount: number;
  implementationTaskCount: number;
  runCount: number;
  telemetryEventCount: number;
}): ExecutiveFocus {
  const metrics = [{ label: "검토 아이디어", value: `${ideaCount}` }];
  const dataNote = source === "supabase" ? "실제 데이터 기준" : "샘플 데이터 기준";

  if (!consoleStatus.isAuthLoaded || !consoleStatus.isAuthenticated) {
    return {
      eyebrow: "지금 할 일",
      title: "먼저 로그인해 주세요.",
      detail: "로그인 후 대시보드에서 아이디어 검토, 검증 계획, 제작 자료를 이어서 진행합니다.",
      evidence: "로그인 필요",
      risk: "데이터는 로그인 후 확인",
      targetTask: "console:auth",
      cta: "로그인하기",
      metrics,
    };
  }

  if (ideaCount === 0) {
    return {
      eyebrow: "지금 할 일",
      title: "메모를 넣으면 AI가 검토할 아이디어를 정리합니다.",
      detail: "회의 내용, GPT 대화, 자동화하고 싶은 업무를 그대로 붙여넣으세요. 마음에 드는 한 건을 저장하면 하단 다음 단계 버튼으로 사업성 평가를 시작할 수 있습니다.",
      evidence: `${dataNote} · 아이디어 없음`,
      risk: "리스크는 저장 뒤 확인",
      metrics,
    };
  }

  if (activeTask === "console:extract") {
    return {
      eyebrow: "지금 할 일",
      title: "진행 중인 아이디어가 있습니다.",
      detail: "상단의 검토 아이디어 목록에서 이어갈 항목을 선택하거나, 새 아이디어를 입력하세요.",
      evidence: `${dataNote} · 아이디어 ${ideaCount}건`,
      risk: "목록에서 이어갈 단계를 선택",
      metrics,
    };
  }

  if (activeTask === "workbench:score") {
    return {
      eyebrow: "지금 할 일",
      title: "이 아이디어를 검증할지 먼저 판단합니다.",
      detail: "사업성 평가를 저장하면 하단 다음 단계 버튼으로 검증 계획을 열 수 있습니다.",
      evidence: `${dataNote} · 아이디어 ${ideaCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      metrics,
    };
  }

  if (experimentCount === 0) {
    return {
      eyebrow: "지금 할 일",
      title: "검증 계획이 아직 없습니다.",
      detail: "좋아 보이는 아이디어라도 7일 안에 확인할 행동 기준이 있어야 다음 판단이 빨라집니다.",
      evidence: `${dataNote} · 아이디어 ${ideaCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:experiment",
      cta: "검증 계획 만들기",
      metrics,
    };
  }

  if (artifactCount === 0) {
    return {
      eyebrow: "지금 할 일",
      title: "이제 검증 자료를 저장할 차례입니다.",
      detail: "AI가 만든 아이디어 요약, 기획서, 첫 제작 범위를 확인하고 저장하면 제작 패키지로 이어갈 수 있습니다.",
      evidence: `${dataNote} · 판단 ${decisionCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:artifacts",
      cta: "문서 만들기",
      metrics,
    };
  }

  if (implementationTaskCount === 0) {
    return {
      eyebrow: "지금 할 일",
      title: "이제 제작 패키지를 저장하세요.",
      detail: "검증 결과와 결과물 형태를 묶어 제작 단계에서 쓸 패키지를 만듭니다.",
      evidence: `${dataNote} · 제작 자료 ${artifactCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:development",
      cta: "제작 패키지 정리",
      metrics,
    };
  }

  if (runCount === 0) {
    return {
      eyebrow: "지금 할 일",
      title: "작업 순서와 막히는 지점을 정리하세요.",
      detail: "1인 작업으로 진행하더라도 전략, 디자인, 제작, 품질 점검 순서를 나누면 다음 작업이 선명해집니다.",
      evidence: `${dataNote} · 제작 작업 ${implementationTaskCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:orchestration",
      cta: "작업 순서 확인",
      metrics,
    };
  }

  if (activeTask === "workbench:orchestration") {
    return {
      eyebrow: "지금 할 일",
      title: "작업 순서를 확인하고 최종 실행 준비를 마치세요.",
      detail: "작업 순서와 제작 패키지가 준비되어 있으면 하단 다음 단계 버튼으로 외부 제작 도구 연결 또는 내부 개발 시작 화면을 열 수 있습니다.",
      evidence: `${dataNote} · 실행 기록 ${runCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:launch",
      cta: "최종 실행",
      metrics,
    };
  }

  if (activeTask === "workbench:launch") {
    return {
      eyebrow: "지금 할 일",
      title: "선택한 개발 방식으로 넘길 차례입니다.",
      detail: "외부 제작 도구를 선택했다면 패키지와 지시문을 받고, 내부 진행을 선택했다면 내부 개발 시작점으로 넘깁니다.",
      evidence: `${dataNote} · 실행 기록 ${runCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:launch",
      cta: "최종 실행",
      metrics,
    };
  }

  return {
    eyebrow: "지금 할 일",
    title:
      telemetryEventCount > 0
        ? "성과 신호를 보고 다음 반복을 정하세요."
        : "제작 작업 상태를 보고 다음 행동을 정하세요.",
    detail:
      telemetryEventCount > 0
        ? "실제 행동 신호를 보고 계속 투자할지, 보완할지, 새 아이디어로 돌아갈지 결정하세요."
        : "외부 제작 도구나 내부 작업에서 반영된 완료, 진행, 차단 상태를 먼저 확인하고 다음 작업을 정합니다.",
    evidence: `${dataNote} · 제작 작업 ${implementationTaskCount}건 · 실행 기록 ${runCount}건`,
    risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
    targetTask: "workbench:learning",
    cta: "성과 확인",
    metrics,
  };
}
