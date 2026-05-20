"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  Code,
  FloppyDisk,
  FlagPennant,
  Flask,
  LockKey,
  Pulse,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
  Stack,
  Trash,
  User,
  Users,
} from "@phosphor-icons/react";

import { IdeaWorkbench, type WorkbenchStepReadiness, type WorkbenchTask } from "@/components/idea-workbench";
import {
  VentureConsoleActions,
  type ConsoleActionTask,
  type ConsoleWorkflowStatus,
} from "@/components/venture-console-actions";
import type { Database } from "@/lib/supabase/types";
import type {
  Decision,
  Experiment,
  Idea,
  ImplementationTask,
  OrchestrationRun,
  Risk,
  TelemetryEvent,
  VentureArtifact,
} from "@/lib/venture-data";

type IdeaCreatedEventDetail = Idea & { autoOpenWorkbench?: boolean };

type ShellTask = `console:${ConsoleActionTask}` | `workbench:${WorkbenchTask}`;
type ShellTaskGroup = "시작" | "검증" | "제작" | "출시 후";

const shellTasks: Array<{
  id: ShellTask;
  label: string;
  description: string;
  group: ShellTaskGroup;
  icon: typeof User;
  optional?: boolean;
}> = [
  {
    id: "console:auth",
    label: "로그인",
    description: "계정 확인",
    group: "시작",
    icon: User,
  },
  {
    id: "console:workspace",
    label: "협업 설정",
    description: "팀과 함께 볼 때",
    group: "시작",
    icon: Users,
    optional: true,
  },
  {
    id: "console:extract",
    label: "아이디어 도출",
    description: "",
    group: "시작",
    icon: Sparkle,
  },
  {
    id: "console:idea",
    label: "후보 저장",
    description: "수정이 필요할 때",
    group: "시작",
    icon: FloppyDisk,
    optional: true,
  },
  {
    id: "workbench:select",
    label: "검토 아이디어",
    description: "진행 중인 아이디어",
    group: "검증",
    icon: ClipboardText,
    optional: true,
  },
  {
    id: "workbench:score",
    label: "사업성 평가",
    description: "수요와 속도",
    group: "검증",
    icon: Flask,
  },
  {
    id: "workbench:risk",
    label: "위험 확인",
    description: "막히는 리스크",
    group: "검증",
    icon: FlagPennant,
    optional: true,
  },
  {
    id: "workbench:experiment",
    label: "검증 계획",
    description: "7일 확인",
    group: "검증",
    icon: Flask,
  },
  {
    id: "workbench:decision",
    label: "진행 판단",
    description: "진행 결론",
    group: "검증",
    icon: ShieldCheck,
    optional: true,
  },
  {
    id: "workbench:archive",
    label: "삭제한 아이디어",
    description: "복구 또는 완전 삭제",
    group: "검증",
    icon: Trash,
    optional: true,
  },
  {
    id: "workbench:artifacts",
    label: "실행 문서 만들기",
    description: "실행 문서",
    group: "제작",
    icon: ClipboardText,
  },
  {
    id: "workbench:development",
    label: "제작 준비",
    description: "하네스 패키지",
    group: "제작",
    icon: Code,
  },
  {
    id: "workbench:orchestration",
    label: "실행 관리",
    description: "실행 큐",
    group: "제작",
    icon: Stack,
  },
  {
    id: "workbench:launch",
    label: "출시 판단",
    description: "출시 조건",
    group: "제작",
    icon: RocketLaunch,
  },
  {
    id: "workbench:learning",
    label: "성과 확인",
    description: "행동 신호",
    group: "출시 후",
    icon: Pulse,
  },
];

const taskGuidance: Record<ShellTask, { summary: string; checklist: string[] }> = {
  "console:auth": {
    summary: "관리자 계정으로 바로 로그인합니다. 별도 인증키나 메일 링크는 다루지 않아도 됩니다.",
    checklist: ["이메일과 비밀번호 입력", "로그인 상태 확인", "다음 단계로 이동"],
  },
  "console:workspace": {
    summary: "기본은 혼자 진행하고, 팀과 함께 봐야 할 때만 협업 공간을 연결합니다.",
    checklist: ["혼자 진행할 때는 건너뛰기", "팀 공간 생성 또는 선택", "필요한 멤버만 추가"],
  },
  "console:extract": {
    summary: "아이디어 입력 후 AI가 내용을 구체화합니다.",
    checklist: [
      "아이디어 입력",
      "AI로 아이디어 구체화",
      "도출된 아이디어 저장",
    ],
  },
  "console:idea": {
    summary: "AI가 정리한 초안을 확인하고 필요한 의견만 더한 뒤 저장합니다.",
    checklist: ["이름과 한 줄 설명 확인", "필요할 때만 추가 항목 보완", "후보 저장"],
  },
  "workbench:select": {
    summary: "진행 중인 아이디어를 보고 마지막 단계에서 이어갑니다.",
    checklist: ["아이디어 목록 확인", "진행 단계 확인", "이어서 볼 아이디어 선택"],
  },
  "workbench:score": {
    summary: "수요, 속도, 지불 의향, 위험 감점을 숫자로 빠르게 맞춥니다.",
    checklist: ["이 아이디어를 계속 검증할지 정하기", "부족한 근거 확인", "평가 저장"],
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
    summary: "이 아이디어의 가능성을 판단하기 위해 가장 먼저 확인할 내용을 정합니다.",
    checklist: ["확인할 내용 정하기", "직접 할 수 있는 작은 검증 쓰기", "성공/중단 기준 저장"],
  },
  "workbench:orchestration": {
    summary: "역할과 진행 상태만 간단히 관리합니다.",
    checklist: ["실행 계획 만들기", "역할별 결과 작성", "완료된 단계 상태 변경"],
  },
  "workbench:artifacts": {
    summary: "아이디어 브리프, 기획서, 첫 제작 범위를 저장하고 승인 상태를 관리합니다.",
    checklist: ["필요 자료 저장", "기획서와 제작 범위 확인", "상태 메모 작성"],
  },
  "workbench:development": {
    summary: "검증 결과를 바탕으로 PRD, 디자인 프롬프트, 기술 방향, 첫 제작 범위를 한 패키지로 묶습니다.",
    checklist: ["결과물 형태 확인", "AI가 만든 하네스 요약 검토", "최종 하네스 패키지 저장"],
  },
  "workbench:launch": {
    summary: "출시 전 막히는 항목을 확인하고 최종 출시 판단을 기록합니다.",
    checklist: ["남은 항목 확인", "높은 위험 종료 또는 수용", "최종 판단 기록"],
  },
  "workbench:learning": {
    summary: "출시 후 행동 신호를 보고 다음 투자 또는 보완 여부를 정합니다.",
    checklist: ["최근 사용 신호 확인", "출시 후 7/14/30일 판단 신호 점검", "학습 리포트 저장"],
  },
};

const taskCanvasDetails: Record<
  ShellTask,
  {
    question: string;
    aiLead: string;
    deliverable: string;
    checkpoint: string;
  }
> = {
  "console:auth": {
    question: "이 보드를 계속 운영할 계정이 준비됐나요?",
    aiLead: "로그인 상태를 확인하고, 이후 단계가 열리는 최소 조건만 안내합니다.",
    deliverable: "로그인된 운영자 세션",
    checkpoint: "이후 단계는 한 명이 끝까지 처리할 수 있게 이어집니다.",
  },
  "console:workspace": {
    question: "이 후보를 혼자 다룰지, 팀과 함께 볼지 결정했나요?",
    aiLead: "혼자 진행하는 흐름을 기본으로 두고, 팀 검토가 필요할 때만 협업 공간을 연결합니다.",
    deliverable: "선택형 팀 공간 연결 상태",
    checkpoint: "협업이 필요하지 않다면 이 단계는 건너뛰어도 괜찮습니다.",
  },
  "console:extract": {
    question: "회의 내용, 아이디어, 자동화하고 싶은 업무 내용을 입력칸에 붙여넣으세요.",
    aiLead: "AI가 원문에서 먼저 검토할 아이디어, 결과물 형태, 검증 질문을 함께 정리합니다.",
    deliverable: "먼저 볼 아이디어와 이후 하네스 패키지에 쓰일 결과물 형태",
    checkpoint: "처음에는 입력칸 하나만 쓰면 됩니다. 결과물 형태는 저장 후 STEP 2에서 바꿀 수 있습니다.",
  },
  "console:idea": {
    question: "이 후보를 실제 검증 대상으로 올릴 준비가 되었나요?",
    aiLead: "이름, 한 줄 설명, 신호, 다음 증거를 초안으로 채웁니다.",
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
    question: "이 아이디어는 시간과 자원을 써서 검증할만한가?",
    aiLead: "수요, 돈, 속도, 차별성, 위험을 묶어 점수를 정리합니다.",
    deliverable: "사업성 점수와 권장 판단",
    checkpoint: "숫자는 AI가 초안으로 제시하고, 사용자는 최종 감각만 조정합니다.",
  },
  "workbench:risk": {
    question: "출시를 막을 만한 법무·운영·보안 이슈가 있나요?",
    aiLead: "리스크 영역을 묶고, 심각도와 대응 방향을 먼저 정리합니다.",
    deliverable: "핵심 리스크 목록",
    checkpoint: "막는 리스크인지, 관리 가능한 리스크인지 구분하는 단계입니다.",
  },
  "workbench:experiment": {
    question: "이 아이디어의 가능성을 검토하기 위해 무엇을 확인해야 할까요?",
    aiLead: "AI가 인터뷰, 랜딩, 수동 결과물 테스트 중 가장 작은 검증 행동을 제안합니다.",
    deliverable: "7일 동안 할 행동과 성공/중단 기준",
    checkpoint: "좋은 계획보다 바로 해볼 수 있는 행동 하나가 더 중요합니다.",
  },
  "workbench:decision": {
    question: "지금은 진행, 보완, 전환, 중단 중 무엇이 맞을까요?",
    aiLead: "점수, 리스크, 실험 조건을 묶어 의사결정용 근거를 정리합니다.",
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
    question: "이 후보를 팀이나 개발 도구에 넘길 자료가 준비됐나요?",
    aiLead: "아이디어 브리프, 기획서, 첫 제작 범위, 디자인 참고 자료를 실행 문서로 묶습니다.",
    deliverable: "실행 문서 초안",
    checkpoint: "사용자는 문서를 처음부터 쓰기보다 승인 여부만 확인하면 됩니다.",
  },
  "workbench:development": {
    question: "이제 제작에 넘길 하네스 패키지를 정리할 차례입니다.",
    aiLead: "PRD, 디자인 프롬프트, 기술 방향, 첫 제작 범위를 한 번에 묶습니다.",
    deliverable: "하네스 패키지",
    checkpoint: "사용자는 최종 요약만 확인하고, 필요한 메모만 더하면 됩니다.",
  },
  "workbench:orchestration": {
    question: "누가 무엇을 언제 처리할지 명확한가요?",
    aiLead: "전략, 디자인, 개발, 품질 점검, 보안의 순서를 정리하고 막히는 요인을 표시합니다.",
    deliverable: "실행 순서와 진행 상태",
    checkpoint: "혼자 쓰더라도 다음 작업 순서가 분명히 보여야 합니다.",
  },
  "workbench:launch": {
    question: "지금 이 첫 버전을 밖으로 내보내도 괜찮을까요?",
    aiLead: "출시 전 남은 리스크, 문서, 품질 점검, 보안 상태를 하나로 모아 점검합니다.",
    deliverable: "출시 전 최종 판단",
    checkpoint: "막히는 항목이 없으면 바로 성과 확인으로 이동합니다.",
  },
  "workbench:learning": {
    question: "출시 후 행동 신호를 보고 다음 결정을 어떻게 바꿀까요?",
    aiLead: "출시 후 7일, 14일, 30일 신호, 퍼널, 리텐션, 지불 의향 데이터를 다시 요약합니다.",
    deliverable: "성과 확인 리포트",
    checkpoint: "다음 반복은 여기서 얻은 학습으로 다시 시작합니다.",
  },
};

type TaskTransitionOption = {
  id: ShellTask;
  cta: string;
  hint: string;
  variant: "primary" | "optional";
  disabled?: boolean;
};

type ExecutiveFocus = {
  eyebrow: string;
  title: string;
  detail: string;
  evidence: string;
  risk: string;
  targetTask?: ShellTask;
  cta?: string;
  metrics: Array<{ label: string; value: string }>;
};

function createTransition(
  id: ShellTask,
  cta: string,
  hint: string,
  variant: TaskTransitionOption["variant"] = "primary",
  disabled = false,
): TaskTransitionOption {
  return { id, cta, hint, variant, disabled };
}

function getNextTaskOptions({
  activeTask,
  ideaCount,
  artifactCount,
  runCount,
  openRisks,
  canEnterExperiment,
  canEnterArtifacts,
  canEnterDevelopment,
  canEnterOrchestration,
}: {
  activeTask: ShellTask;
  ideaCount: number;
  artifactCount: number;
  runCount: number;
  openRisks: number;
  canEnterExperiment: boolean;
  canEnterArtifacts: boolean;
  canEnterDevelopment: boolean;
  canEnterOrchestration: boolean;
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
          "다음: 검증 계획",
          canEnterExperiment
            ? "사업성 평가를 저장했습니다. 이제 7일 안에 확인할 작은 검증을 정합니다."
            : "사업성 평가를 저장하면 활성화됩니다.",
          "primary",
          !canEnterExperiment,
        ),
        createTransition(
          "workbench:risk",
          "선택: 위험 먼저 보기",
          "법무, 개인정보, 운영 이슈가 먼저 보이면 여기서 보완합니다.",
          "optional",
        ),
      ];
    case "workbench:risk":
      return [
        createTransition("workbench:experiment", "다음: 검증 계획", "리스크를 적었다면 이제 실제로 확인할 계획을 정합니다."),
        createTransition(
          "workbench:decision",
          "건너뛰고 진행 판단",
          "리스크 점검이 충분하면 바로 진행 여부를 판단합니다.",
          "optional",
        ),
      ];
    case "workbench:experiment":
      return [
        createTransition(
          "workbench:artifacts",
          "다음: 실행 문서 만들기",
          canEnterArtifacts
            ? "검증 계획을 저장했습니다. 이제 아이디어 브리프와 제작 범위를 문서로 남깁니다."
            : "검증 계획을 하나 이상 저장하면 활성화됩니다.",
          "primary",
          !canEnterArtifacts,
        ),
        ...(openRisks === 0
          ? [
              createTransition(
                "workbench:risk",
                "선택: 위험 확인",
                "아직 리스크를 적지 않았다면 여기서 먼저 보완합니다.",
                "optional",
              ),
            ]
          : []),
      ];
    case "workbench:decision":
      return [
        createTransition("workbench:artifacts", "다음: 실행 문서 만들기", "아이디어 브리프, 기획서, 첫 제작 범위를 문서로 남깁니다."),
        ...(artifactCount > 0
          ? [
              createTransition(
                "workbench:development",
                "건너뛰고 제작 준비",
                canEnterDevelopment
                  ? "검증 완료 요약까지 저장되어 제작 준비로 이동할 수 있습니다."
                  : "검증 완료 요약까지 저장하면 제작 준비로 이동할 수 있습니다.",
                "optional",
                !canEnterDevelopment,
              ),
            ]
          : []),
      ];
    case "workbench:artifacts":
      return [
        createTransition(
          "workbench:development",
          "다음: 제작 준비",
          canEnterDevelopment
            ? "검증 완료 요약까지 저장했습니다. 이제 디자인, 개발, 배포 준비를 구체화합니다."
            : "아이디어 브리프, 리서치 브리프, 7일 검증 계획, 검증 완료 요약을 모두 저장하면 활성화됩니다.",
          "primary",
          !canEnterDevelopment,
        ),
      ];
    case "workbench:development":
      return [
        createTransition(
          "workbench:orchestration",
          "다음: 실행 관리",
          canEnterOrchestration
            ? "하네스 패키지를 저장했습니다. 이제 실행 역할을 배정합니다."
            : "최종 하네스 패키지를 저장하면 활성화됩니다.",
          "primary",
          !canEnterOrchestration,
        ),
        ...(runCount > 0 && canEnterOrchestration
          ? [
              createTransition(
                "workbench:launch",
                "건너뛰고 출시 판단",
                "이미 실행 관리 기록이 있으면 출시 판단으로 바로 갈 수 있습니다.",
                "optional",
              ),
            ]
          : []),
      ];
    case "workbench:orchestration":
      return [createTransition("workbench:launch", "다음: 출시 판단", "막히는 항목을 확인하고 출시 여부를 정합니다.")];
    case "workbench:launch":
      return [createTransition("workbench:learning", "다음: 성과 확인", "출시 후 행동 신호를 보고 다음 사이클을 정합니다.")];
    case "workbench:learning":
      return [createTransition("console:idea", "다음: 새 후보 저장", "이제 다음 후보를 다시 검토합니다.")];
    default:
      return [];
  }
}

function getCurrentStepBlocker({
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
      return "로그인 후 바로 아이디어 도출 단계로 이동합니다. 협업 설정은 나중에 선택할 수 있습니다.";
    case "console:workspace":
      return consoleStatus.hasWorkspace
        ? "협업 공간을 연결했습니다. 다시 아이디어 도출로 돌아가 계속 진행하면 됩니다."
        : "이 단계는 선택 기능입니다. 팀으로 같이 볼 때만 워크스페이스를 만들거나 선택하세요.";
    case "console:extract":
      return consoleStatus.hasExtractedIdeas
        ? "추천 후보를 저장 양식으로 보내면 후보 저장 단계로 자동 이동합니다."
        : "아이디어가 선정되면 STEP 2 단계로 이동됩니다.";
    case "console:idea":
      return ideaCount > 0
        ? "후보를 저장하면 검증 단계로 이동합니다."
        : "후보를 최소 한 건 저장해야 검증 단계로 넘어갈 수 있습니다.";
    default:
      return null;
  }
}

function getExecutiveFocus({
  activeTask,
  consoleStatus,
  source,
  ideaCount,
  openRisks,
  highRisks,
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
  highRisks: number;
  experimentCount: number;
  decisionCount: number;
  artifactCount: number;
  implementationTaskCount: number;
  runCount: number;
  telemetryEventCount: number;
}): ExecutiveFocus {
  const metrics = [
    { label: "검토 아이디어", value: `${ideaCount}` },
  ];
  const dataNote = source === "supabase" ? "실제 데이터 기준" : "샘플 데이터 기준";

  if (!consoleStatus.isAuthLoaded || !consoleStatus.isAuthenticated) {
    return {
      eyebrow: "다음에 할 일",
      title: "먼저 로그인해 주세요.",
      detail: "로그인 후 대시보드에서 후보 검토, 검증 계획, 실행 문서를 이어서 진행합니다.",
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
      title: "검토할 아이디어를 먼저 저장해 주세요.",
      detail: "대화 메모나 브리프를 넣으면 AI가 아이디어를 정리합니다. 마음에 드는 한 건을 저장해 검증으로 넘어가세요.",
      evidence: `${dataNote} · 후보 없음`,
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
      detail: "점수와 판단을 저장하면 바로 검증 계획으로 넘어갈 수 있습니다.",
      evidence: `${dataNote} · 후보 ${ideaCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      metrics,
    };
  }

  if (highRisks > 0) {
    return {
      eyebrow: "다음에 할 일",
      title: "높은 리스크부터 닫아야 합니다.",
      detail: "진행 전에 법무, 보안, 운영상 막히는 지점을 먼저 정리하세요.",
      evidence: `${dataNote} · 높은 리스크 ${highRisks}건`,
      risk: `열려 있는 리스크 ${openRisks}건`,
      targetTask: "workbench:risk",
      cta: "리스크 확인",
      metrics,
    };
  }

  if (experimentCount === 0) {
    return {
      eyebrow: "다음에 할 일",
      title: "검증 계획이 아직 없습니다.",
      detail: "좋아 보이는 후보라도 7일 안에 확인할 행동 기준이 있어야 다음 판단이 빨라집니다.",
      evidence: `${dataNote} · 후보 ${ideaCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:experiment",
      cta: "검증 계획 만들기",
      metrics,
    };
  }

  if (artifactCount === 0) {
    return {
      eyebrow: "다음에 할 일",
      title: "이제 판단을 실행 문서로 묶을 차례입니다.",
      detail: "아이디어 브리프, 기획서, 첫 제작 범위를 준비해야 다음 제작 도구로 넘길 수 있습니다.",
      evidence: `${dataNote} · 판단 ${decisionCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:artifacts",
      cta: "문서 만들기",
      metrics,
    };
  }

  if (implementationTaskCount === 0) {
    return {
      eyebrow: "다음에 할 일",
      title: "이제 하네스 패키지를 저장하세요.",
      detail: "검증 결과를 PRD, 디자인 프롬프트, 기술 방향, 첫 제작 범위로 묶으면 바로 개발에 넘길 수 있습니다.",
      evidence: `${dataNote} · 실행 문서 ${artifactCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:development",
      cta: "하네스 정리",
      metrics,
    };
  }

  if (runCount === 0) {
    return {
      eyebrow: "다음에 할 일",
      title: "실행 순서와 막히는 지점을 정리하세요.",
      detail: "혼자 진행하더라도 전략, 디자인, 개발, 품질 점검 순서를 나누면 다음 작업이 선명해집니다.",
      evidence: `${dataNote} · 제작 작업 ${implementationTaskCount}건`,
      risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
      targetTask: "workbench:orchestration",
      cta: "실행 관리",
      metrics,
    };
  }

  return {
    eyebrow: "다음에 할 일",
    title: telemetryEventCount > 0 ? "성과 신호를 보고 다음 반복을 정하세요." : "출시 전 마지막 확인이 남았습니다.",
    detail:
      telemetryEventCount > 0
        ? "실제 행동 신호를 보고 계속 투자할지, 보완할지, 새 후보로 돌아갈지 결정하세요."
        : "막히는 항목이 없다면 출시 판단을 남기고 성과 확인으로 넘어갈 수 있습니다.",
    evidence: `${dataNote} · 실행 기록 ${runCount}건`,
    risk: openRisks > 0 ? `열려 있는 리스크 ${openRisks}건` : "막히는 리스크 없음",
    targetTask: telemetryEventCount > 0 ? "workbench:learning" : "workbench:launch",
    cta: telemetryEventCount > 0 ? "성과 확인" : "출시 판단",
    metrics,
  };
}

function upsertById<T extends { id: string }>(records: T[], nextRecord: T) {
  return records.some((record) => record.id === nextRecord.id)
    ? records.map((record) => (record.id === nextRecord.id ? nextRecord : record))
    : [nextRecord, ...records];
}

function upsertManyById<T extends { id: string }>(records: T[], nextRecords: T[]) {
  return nextRecords.reduce((current, record) => upsertById(current, record), records);
}

function subscribeClientReady() {
  return () => {};
}

function getClientReadySnapshot() {
  return true;
}

function getServerReadySnapshot() {
  return false;
}

export function VentureConsoleShell({
  initialIdeas,
  initialRisks,
  initialDecisions,
  initialExperiments,
  initialOrchestrationRuns,
  initialArtifacts,
  initialImplementationTasks,
  initialTelemetryEvents,
  initialViewerUserId,
  initialViewerMemberships,
  source,
  initialView,
  initialTask,
  initialIdeaId,
}: {
  initialIdeas: Idea[];
  initialRisks: Risk[];
  initialDecisions: Decision[];
  initialExperiments: Experiment[];
  initialOrchestrationRuns: OrchestrationRun[];
  initialArtifacts: VentureArtifact[];
  initialImplementationTasks: ImplementationTask[];
  initialTelemetryEvents: TelemetryEvent[];
  initialViewerUserId: string | null;
  initialViewerMemberships: Database["public"]["Tables"]["organization_members"]["Row"][];
  source: "supabase" | "seed";
  initialView?: "ideas" | "deleted";
  initialTask?: WorkbenchTask;
  initialIdeaId?: string;
}) {
  const isClientReady = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);
  const initialShellTask: ShellTask =
    initialTask ? `workbench:${initialTask}` : initialView === "ideas" ? "workbench:select" : initialView === "deleted" ? "workbench:archive" : "console:auth";
  const [activeTask, setActiveTask] = useState<ShellTask>(
    initialShellTask,
  );
  const [consoleStatus, setConsoleStatus] = useState<ConsoleWorkflowStatus>({
    isAuthLoaded: false,
    isAuthenticated: false,
    hasWorkspace: false,
    hasExtractedIdeas: false,
    hasIdeaSource: false,
  });
  const [ideas, setIdeas] = useState(initialIdeas);
  const [decisions, setDecisions] = useState(initialDecisions);
  const [risks, setRisks] = useState(initialRisks);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [orchestrationRuns, setOrchestrationRuns] = useState(initialOrchestrationRuns);
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [implementationTasks, setImplementationTasks] = useState(initialImplementationTasks);
  const [telemetryEvents, setTelemetryEvents] = useState(initialTelemetryEvents);
  const [validationDocumentReadiness, setValidationDocumentReadiness] = useState<WorkbenchStepReadiness>({
    selectedIdeaId: initialIdeaId ?? null,
    canEnterExperiment: false,
    canEnterArtifacts: false,
    canEnterDevelopment: false,
    canEnterOrchestration: false,
    hasIdeaBriefArtifact: false,
    hasResearchBriefArtifact: false,
    hasValidationSprintArtifact: false,
    hasValidationSummaryArtifact: false,
    hasDesignGenerationPromptArtifact: false,
    hasDevelopmentPlanArtifact: false,
    hasAgentRunPackageArtifact: false,
  });
  const [visitedTaskIds, setVisitedTaskIds] = useState<ShellTask[]>([
    "console:auth",
    ...(initialShellTask !== "console:auth" ? [initialShellTask] : []),
  ]);
  const goToTask = useCallback((task: ShellTask) => {
    setVisitedTaskIds((current) => (current.includes(task) ? current : [...current, task]));
    setActiveTask(task);
  }, []);
  const handleConsoleTaskChange = useCallback((task: ConsoleActionTask) => {
    if (activeTask.startsWith("workbench:") && (task === "auth" || task === "extract")) {
      return;
    }

    goToTask(`console:${task}`);
  }, [activeTask, goToTask]);
  const handleWorkbenchTaskChange = useCallback((task: WorkbenchTask) => {
    goToTask(`workbench:${task}`);
  }, [goToTask]);
  useEffect(() => {
    function handleRecordEvent<T extends { id: string }>(event: Event, setter: Dispatch<SetStateAction<T[]>>) {
      const record = (event as CustomEvent<T>).detail;

      if (!record?.id) {
        return;
      }

      setter((current) => upsertById(current, record));
    }

    function handleRecordListEvent<T extends { id: string }>(event: Event, setter: Dispatch<SetStateAction<T[]>>) {
      const records = (event as CustomEvent<T[]>).detail;

      if (!Array.isArray(records) || records.length === 0) {
        return;
      }

      setter((current) => upsertManyById(current, records));
    }

    function handleIdeaCreated(event: Event) {
      const { autoOpenWorkbench = true, ...record } = (event as CustomEvent<IdeaCreatedEventDetail>).detail ?? {};

      if (!record?.id) {
        return;
      }

      setIdeas((current) => upsertById(current, record as Idea));

      if (autoOpenWorkbench) {
        setVisitedTaskIds((current) => {
          const next = [...current];
          const autoCompletedTasks: ShellTask[] = ["console:extract", "workbench:score"];

          for (const task of autoCompletedTasks) {
            if (!next.includes(task)) {
              next.push(task);
            }
          }

          return next;
        });
        setActiveTask("workbench:score");
      }
    }
    const handleIdeaUpdated = (event: Event) => handleRecordEvent<Idea>(event, setIdeas);
    const handleRiskCreated = (event: Event) => handleRecordEvent<Risk>(event, setRisks);
    const handleRiskUpdated = (event: Event) => handleRecordEvent<Risk>(event, setRisks);
    const handleExperimentCreated = (event: Event) => handleRecordEvent<Experiment>(event, setExperiments);
    const handleExperimentUpdated = (event: Event) => handleRecordEvent<Experiment>(event, setExperiments);
    const handleDecisionCreated = (event: Event) => handleRecordEvent<Decision>(event, setDecisions);
    const handleRunCreated = (event: Event) => handleRecordEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleRunsCreated = (event: Event) => handleRecordListEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleRunUpdated = (event: Event) => handleRecordEvent<OrchestrationRun>(event, setOrchestrationRuns);
    const handleArtifactCreated = (event: Event) => handleRecordEvent<VentureArtifact>(event, setArtifacts);
    const handleArtifactUpdated = (event: Event) => handleRecordEvent<VentureArtifact>(event, setArtifacts);
    const handleTaskCreated = (event: Event) => handleRecordEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTasksCreated = (event: Event) => handleRecordListEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTaskUpdated = (event: Event) => handleRecordEvent<ImplementationTask>(event, setImplementationTasks);
    const handleTelemetryCreated = (event: Event) => handleRecordEvent<TelemetryEvent>(event, setTelemetryEvents);

    window.addEventListener("venture:idea-created", handleIdeaCreated);
    window.addEventListener("venture:idea-updated", handleIdeaUpdated);
    window.addEventListener("venture:risk-created", handleRiskCreated);
    window.addEventListener("venture:risk-updated", handleRiskUpdated);
    window.addEventListener("venture:experiment-created", handleExperimentCreated);
    window.addEventListener("venture:experiment-updated", handleExperimentUpdated);
    window.addEventListener("venture:decision-created", handleDecisionCreated);
    window.addEventListener("venture:run-created", handleRunCreated);
    window.addEventListener("venture:runs-created", handleRunsCreated);
    window.addEventListener("venture:run-updated", handleRunUpdated);
    window.addEventListener("venture:artifact-created", handleArtifactCreated);
    window.addEventListener("venture:artifact-updated", handleArtifactUpdated);
    window.addEventListener("venture:task-created", handleTaskCreated);
    window.addEventListener("venture:tasks-created", handleTasksCreated);
    window.addEventListener("venture:task-updated", handleTaskUpdated);
    window.addEventListener("venture:telemetry-created", handleTelemetryCreated);

    return () => {
      window.removeEventListener("venture:idea-created", handleIdeaCreated);
      window.removeEventListener("venture:idea-updated", handleIdeaUpdated);
      window.removeEventListener("venture:risk-created", handleRiskCreated);
      window.removeEventListener("venture:risk-updated", handleRiskUpdated);
      window.removeEventListener("venture:experiment-created", handleExperimentCreated);
      window.removeEventListener("venture:experiment-updated", handleExperimentUpdated);
      window.removeEventListener("venture:decision-created", handleDecisionCreated);
      window.removeEventListener("venture:run-created", handleRunCreated);
      window.removeEventListener("venture:runs-created", handleRunsCreated);
      window.removeEventListener("venture:run-updated", handleRunUpdated);
      window.removeEventListener("venture:artifact-created", handleArtifactCreated);
      window.removeEventListener("venture:artifact-updated", handleArtifactUpdated);
      window.removeEventListener("venture:task-created", handleTaskCreated);
      window.removeEventListener("venture:tasks-created", handleTasksCreated);
      window.removeEventListener("venture:task-updated", handleTaskUpdated);
      window.removeEventListener("venture:telemetry-created", handleTelemetryCreated);
    };
  }, [goToTask]);

  if (!isClientReady) {
    return (
      <section className="grid gap-4 xl:grid-cols-[192px_minmax(0,1fr)]">
        <aside className="order-2 border-r border-slate-200 pr-3 xl:order-none">
          <div className="border-b border-slate-200 pb-3">
            <div className="avl-kicker text-slate-500">Venture Console</div>
            <div className="mt-2 h-2 w-24 bg-slate-200" />
          </div>
        </aside>
        <section className="border border-slate-200 bg-white p-5 text-sm text-slate-600">
          실행 보드를 준비하고 있습니다.
        </section>
      </section>
    );
  }

  const activeIdeas = ideas.filter((idea) => idea.decision !== "kill");
  const discardedIdeas = ideas.filter((idea) => idea.decision === "kill");
  const ideaCount = activeIdeas.length;
  const discardedIdeaCount = discardedIdeas.length;
  const visibleTask: ShellTask = (() => {
    if (!consoleStatus.isAuthLoaded || !consoleStatus.isAuthenticated) {
      return "console:auth";
    }

    if (activeTask === "console:auth") {
      return ideaCount > 0 ? "workbench:score" : "console:extract";
    }

    return activeTask;
  })();
  const activeConsoleTask = visibleTask.startsWith("console:")
    ? (visibleTask.replace("console:", "") as ConsoleActionTask)
    : "idea";
  const activeWorkbenchTask = visibleTask.startsWith("workbench:")
    ? (visibleTask.replace("workbench:", "") as WorkbenchTask)
    : "select";
  const openRisks = risks.filter((risk) => risk.status.toLowerCase() === "open").length;
  const highRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;
  const experimentCount = experiments.length;
  const decisionCount = decisions.length;
  const runCount = orchestrationRuns.length;
  const artifactCount = artifacts.length;
  const implementationTaskCount = implementationTasks.length;
  const telemetryEventCount = telemetryEvents.length;
  const activeTaskIndex = shellTasks.findIndex((task) => task.id === visibleTask);
  const activeTaskConfig = shellTasks[activeTaskIndex] ?? shellTasks[0];
  const ActiveIcon = activeTaskConfig.icon;
  const nextTaskOptions = getNextTaskOptions({
    activeTask: visibleTask,
    ideaCount,
    artifactCount,
    runCount,
    openRisks,
    canEnterExperiment: validationDocumentReadiness.canEnterExperiment,
    canEnterArtifacts: validationDocumentReadiness.canEnterArtifacts,
    canEnterDevelopment: validationDocumentReadiness.canEnterDevelopment,
    canEnterOrchestration: validationDocumentReadiness.canEnterOrchestration,
  });
  const enabledNextTaskOptions = nextTaskOptions.filter((option) => !option.disabled);
  const primaryNextTask = nextTaskOptions.find((option) => option.variant === "primary") ?? null;
  const activeGuidance = taskGuidance[visibleTask];
  const currentStepBlocker = getCurrentStepBlocker({
    activeTask: visibleTask,
    consoleStatus,
    ideaCount,
  });
  const taskStatuses: Record<ShellTask, string> = {
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
    "workbench:launch": highRisks > 0 ? "점검" : "확인",
    "workbench:learning": telemetryEventCount > 0 ? `${telemetryEventCount}개` : "대기",
  };
  const requiredShellTasks = shellTasks.filter((task) => !task.optional);
  const executionStepTasks = requiredShellTasks.filter((task) => task.id !== "console:auth");
  const executionStepTotal = executionStepTasks.length;
  const activeExecutionStepIndex =
    activeTaskConfig.optional || activeTaskConfig.id === "console:auth"
      ? -1
      : executionStepTasks.findIndex((task) => task.id === activeTaskConfig.id);
  const previousFlowTask = activeExecutionStepIndex > 0 ? executionStepTasks[activeExecutionStepIndex - 1] : null;
  const supportTasks = consoleStatus.isAuthenticated
    ? shellTasks.filter(
        (task) =>
          task.optional &&
          task.id !== visibleTask &&
          !enabledNextTaskOptions.some((option) => option.id === task.id) &&
          !visitedTaskIds.includes(task.id),
      )
    : [];
  const completedTasks = shellTasks.filter((task) => visitedTaskIds.includes(task.id) && task.id !== visibleTask);
  const completedRequiredTasks = completedTasks.filter((task) => !task.optional && task.id !== "console:auth");
  const availableTaskIds = new Set<ShellTask>([
    ...completedTasks.map((task) => task.id),
    activeTaskConfig.id,
    ...enabledNextTaskOptions.map((task) => task.id),
    ...supportTasks.map((task) => task.id),
  ]);
  const lockedTasks = shellTasks.filter((task) => !availableTaskIds.has(task.id));
  const stepNumber = activeTaskConfig.optional || activeTaskConfig.id === "console:auth"
    ? null
    : executionStepTasks.findIndex((task) => task.id === activeTaskConfig.id) + 1;
  const completedRequiredCount = completedTasks.filter((task) => !task.optional && task.id !== "console:auth").length;
  const currentProgressCount = activeExecutionStepIndex >= 0 ? activeExecutionStepIndex + 1 : completedRequiredCount;
  const workflowProgress = Math.min(
    100,
    Math.round((currentProgressCount / Math.max(1, executionStepTotal)) * 100),
  );
  const activeCanvas = taskCanvasDetails[visibleTask];
  const railPrimaryTasks = executionStepTasks.filter(
    (task) => task.id === visibleTask || enabledNextTaskOptions.some((option) => option.id === task.id),
  );
  const executiveFocus = getExecutiveFocus({
    activeTask: visibleTask,
    consoleStatus,
    source,
    ideaCount,
    openRisks,
    highRisks,
    experimentCount,
    decisionCount,
    artifactCount,
    implementationTaskCount,
    runCount,
    telemetryEventCount,
  });

  function getTaskOrderLabel(task: (typeof shellTasks)[number]) {
    if (task.optional) {
      return "선택";
    }

    if (task.id === "console:auth") {
      return "0";
    }

    return String(executionStepTasks.findIndex((item) => item.id === task.id) + 1);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[216px_minmax(0,1fr)]">
      <aside className="order-2 self-start overflow-y-auto border-r border-slate-200 pr-3 xl:sticky xl:top-4 xl:order-none xl:max-h-[calc(100vh-2rem)]">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-950">진행 순서</h2>
            </div>
            <div className="avl-pill avl-pill-soft whitespace-nowrap text-[10px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${source === "supabase" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              {source === "supabase" ? "연결됨" : "제한됨"}
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1 overflow-hidden bg-slate-100">
              <div className="h-full bg-slate-950 transition-all" style={{ width: `${workflowProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>진행 {currentProgressCount}/{executionStepTotal}</span>
              <span>{workflowProgress}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {railPrimaryTasks.map((task, index) => {
            const Icon = task.icon;
            const isCurrent = task.id === visibleTask;
            const isCompleted = completedTasks.some((item) => item.id === task.id);
            const isAvailable = enabledNextTaskOptions.some((item) => item.id === task.id);
            const previous = railPrimaryTasks[index - 1];
            const showGroupLabel = index === 0 || previous.group !== task.group;

            return (
              <div key={task.id}>
                {showGroupLabel ? (
                  <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Step {getTaskOrderLabel(task)}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => goToTask(task.id)}
                  className={`grid w-full grid-cols-[1.35rem_minmax(0,1fr)] items-start gap-2 border-l-2 px-2.5 py-2 text-left transition ${
                    isCurrent
                      ? "border-l-slate-950 border-y-slate-200 border-r-slate-200 bg-slate-50"
                      : isCompleted
                      ? "border-l-emerald-600 border-y-slate-200 border-r-slate-200 bg-emerald-50/40"
                      : isAvailable
                          ? "border-l-slate-200 border-y-slate-200 border-r-slate-200 bg-white hover:bg-slate-50"
                          : "border-l-slate-200 border-y-slate-200 border-r-slate-200 bg-transparent opacity-60"
                  }`}
                >
                  <span
                    className={`avl-step-dot ${
                      isCurrent
                        ? "bg-slate-950 text-white"
                        : isCompleted
                          ? "bg-emerald-600 text-white"
                          : ""
                    }`}
                  >
                    {isCompleted ? <CheckCircle size={13} weight="fill" /> : getTaskOrderLabel(task)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-950">
                      <Icon size={13} />
                      {task.label}
                    </span>
                    {task.description && (isCurrent || isAvailable) ? (
                      <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{task.description}</span>
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {completedRequiredTasks.length > 0 ? (
          <details className="mt-4 border-t border-slate-200 pt-3">
            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              완료한 단계
            </summary>
            <div className="mt-3 space-y-1.5">
              {completedRequiredTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => goToTask(task.id)}
                    className="grid w-full grid-cols-[1.35rem_minmax(0,1fr)_auto] items-start gap-2 border-l-2 border-l-emerald-600 border-y border-r border-slate-200 bg-emerald-50/40 px-2.5 py-2 text-left transition hover:bg-emerald-50"
                  >
                    <span className="avl-step-dot bg-emerald-600 text-white">
                      <CheckCircle size={13} weight="fill" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-950">
                        <Icon size={13} />
                        {task.label}
                      </span>
                      {task.description ? <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{task.description}</span> : null}
                    </span>
                    <span className="avl-pill avl-pill-soft mt-0.5 px-1.5 py-0.5 text-[10px]">{taskStatuses[task.id]}</span>
                  </button>
                );
              })}
            </div>
          </details>
        ) : null}

        {supportTasks.length > 0 ? (
          <details className="mt-4 border-t border-slate-200 pt-3">
            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              선택 기능
            </summary>
            <div className="mt-3 space-y-2">
              {supportTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => goToTask(task.id)}
                    className="grid w-full grid-cols-[1.35rem_minmax(0,1fr)] gap-2.5 border-l-2 border-l-slate-200 border-y border-r border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-l-slate-400 hover:bg-slate-50"
                  >
                    <span className="avl-icon-frame avl-icon-frame-sm">
                      <Icon size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-slate-950">{task.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </details>
        ) : null}
      </aside>

      <div className="order-1 min-w-0 space-y-3 xl:order-none">
        <section className="border border-slate-900 bg-slate-950 text-white">
          <div className="bg-slate-950 p-4 sm:p-5">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">{executiveFocus.eyebrow}</div>
            <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div className="min-w-0">
                <h2 className="max-w-3xl text-[20px] font-semibold tracking-tight sm:text-[28px] sm:leading-[36px]">
                  {executiveFocus.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{executiveFocus.detail}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_276px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="text-slate-500">
                  {stepNumber ? `Step ${stepNumber}` : activeTaskConfig.group}
                </span>
                {!activeTaskConfig.optional && stepNumber ? <span>진행 {currentProgressCount}/{executionStepTotal}</span> : null}
              </div>

              <div className="mt-3 flex items-start gap-3">
                <span className="avl-icon-frame">
                  <ActiveIcon size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="max-w-4xl text-[18px] font-semibold tracking-tight text-slate-950 sm:text-[26px] sm:leading-[34px]">
                    {activeCanvas.question}
                  </h2>
                </div>
              </div>

              {currentStepBlocker ? (
                <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
                  {currentStepBlocker}
                </div>
              ) : null}
            </div>

            <aside className="border-t border-slate-200 pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">지금 할 일</div>
              <ol className="mt-2 grid gap-2.5">
                {activeGuidance.checklist.slice(0, 3).map((item, index) => (
                  <li key={item} className="grid grid-cols-[1.2rem_minmax(0,1fr)] gap-2 text-[12px] leading-5 text-slate-700">
                    <span className="avl-step-dot mt-0.5 bg-slate-950 text-white">{index + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => previousFlowTask && goToTask(previousFlowTask.id)}
                  disabled={!previousFlowTask}
                  className="avl-btn avl-btn-secondary w-full px-4"
                >
                  이전 단계
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="space-y-5">
          <div className={visibleTask.startsWith("console:") ? "" : "hidden"}>
            <VentureConsoleActions
              activeTask={activeConsoleTask}
              onActiveTaskChange={handleConsoleTaskChange}
              onWorkflowStatusChange={setConsoleStatus}
              showSidebar={false}
              embedded
              existingIdeas={activeIdeas}
            />
          </div>
          <div className={visibleTask.startsWith("workbench:") ? "" : "hidden"}>
            <IdeaWorkbench
              initialIdeas={ideas}
              initialRisks={risks}
              initialDecisions={decisions}
              initialExperiments={experiments}
              initialOrchestrationRuns={orchestrationRuns}
              initialArtifacts={artifacts}
              initialImplementationTasks={implementationTasks}
              initialTelemetryEvents={telemetryEvents}
              initialViewerUserId={initialViewerUserId}
              initialViewerMemberships={initialViewerMemberships}
              initialSelectedIdeaId={initialIdeaId}
              activeTask={activeWorkbenchTask}
              onActiveTaskChange={handleWorkbenchTaskChange}
              onStepReadinessChange={setValidationDocumentReadiness}
              showSidebar={false}
              embedded
            />
          </div>
        </section>

        {primaryNextTask ? (
          <section className="border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">다음 단계</div>
                <p className="mt-1 text-sm leading-5 text-slate-600">{primaryNextTask.hint}</p>
              </div>
              <button
                type="button"
                onClick={() => goToTask(primaryNextTask.id)}
                disabled={primaryNextTask.disabled}
                className="avl-btn avl-btn-primary h-11 px-4 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {primaryNextTask.cta}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        ) : null}

        {lockedTasks.length > 0 ? (
          <details className="border-t border-slate-200 px-4 py-3.5">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <LockKey size={13} />
              잠긴 단계
            </summary>
            <div className="mt-4 grid gap-2">
              {lockedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="border border-slate-200 bg-white flex items-center gap-3 px-3 py-3">
                  <span className="avl-icon-frame avl-icon-frame-sm text-xs">
                    {getTaskOrderLabel(task)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-950">{task.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}
