"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
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
  User,
  Users,
} from "@phosphor-icons/react";

import { IdeaWorkbench, type WorkbenchTask } from "@/components/idea-workbench";
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
    description: "계정으로 접속",
    group: "시작",
    icon: User,
  },
  {
    id: "console:workspace",
    label: "팀 연결",
    description: "필요할 때만",
    group: "시작",
    icon: Users,
    optional: true,
  },
  {
    id: "console:extract",
    label: "아이디어 찾기",
    description: "원문에서 후보 추출",
    group: "시작",
    icon: Sparkle,
  },
  {
    id: "console:idea",
    label: "아이디어 접수",
    description: "초안 저장",
    group: "시작",
    icon: FloppyDisk,
  },
  {
    id: "workbench:select",
    label: "후보 선택",
    description: "오늘의 1건",
    group: "검증",
    icon: ClipboardText,
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
    description: "차단 리스크",
    group: "검증",
    icon: FlagPennant,
  },
  {
    id: "workbench:experiment",
    label: "검증 실험",
    description: "7일 검증",
    group: "검증",
    icon: Flask,
  },
  {
    id: "workbench:decision",
    label: "진행 판단",
    description: "진행 결론",
    group: "검증",
    icon: ShieldCheck,
  },
  {
    id: "workbench:artifacts",
    label: "기획서 만들기",
    description: "실행 문서",
    group: "제작",
    icon: ClipboardText,
  },
  {
    id: "workbench:development",
    label: "제작 준비",
    description: "빌드 준비",
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
    summary: "기본은 혼자 진행합니다. 협업이 필요할 때만 팀 공간을 연결합니다.",
    checklist: ["혼자 쓸 때는 건너뛰기", "팀 공간 생성 또는 선택", "필요할 때만 멤버 추가"],
  },
  "console:extract": {
    summary: "대화와 메모에서 후보와 검증 질문을 먼저 뽑아냅니다.",
    checklist: [
      "대화 원문 붙여넣기",
      "후보 발굴 실행",
      "추천 후보 1개 먼저 확인",
      "필요하면 비교 결과 펼쳐 보기",
      "좋은 후보를 아이디어 초안으로 반영",
    ],
  },
  "console:idea": {
    summary: "AI 초안을 확인하고 필요한 의견만 더한 뒤 저장합니다.",
    checklist: ["이름과 한 줄 설명 확인", "필요할 때만 추가 항목 보완", "아이디어 저장"],
  },
  "workbench:select": {
    summary: "오늘 밀어볼 아이디어 1건을 고른 뒤 평가와 검증을 이어갑니다.",
    checklist: ["전체 또는 내 기록 확인", "편집 가능 여부 확인", "평가할 후보 선택"],
  },
  "workbench:score": {
    summary: "수요, 속도, 지불 의향, 위험 감점을 숫자로 빠르게 맞춥니다.",
    checklist: ["현재 단계와 판단 선택", "증거 공백 확인", "평가 저장"],
  },
  "workbench:risk": {
    summary: "출시를 막을 수 있는 위험만 먼저 꺼냅니다.",
    checklist: ["리스크 제목과 영역 입력", "심각도 선택", "완화 방안 또는 수용 조건 기록"],
  },
  "workbench:decision": {
    summary: "왜 진행, 보류, 전환, 중단하는지 한 문단 근거를 남깁니다.",
    checklist: ["현재 판단 확인", "판단 근거 작성", "최종 기록 저장"],
  },
  "workbench:experiment": {
    summary: "7일 안에 확인할 가장 작은 실험과 성공 기준을 정합니다.",
    checklist: ["실험 이름 입력", "성공 기준 작성", "진행 상태 업데이트"],
  },
  "workbench:orchestration": {
    summary: "역할과 진행 상태만 간단히 관리합니다.",
    checklist: ["실행 계획 만들기", "역할별 결과 작성", "완료된 단계 상태 변경"],
  },
  "workbench:artifacts": {
    summary: "브리프, PRD, MVP 범위를 저장하고 승인 상태를 관리합니다.",
    checklist: ["필요 자료 저장", "PRD와 MVP 범위 승인", "상태 메모 작성"],
  },
  "workbench:development": {
    summary: "기획, 디자인, 구현, QA, 출시 준비를 한 묶음으로 정리합니다.",
    checklist: ["제작 준비 자료 만들기", "제작 실행 계획 저장", "출시 전 확인 조건 점검"],
  },
  "workbench:launch": {
    summary: "출시 전 남은 차단 항목을 확인하고 최종 출시 판단을 기록합니다.",
    checklist: ["남은 항목 확인", "높은 위험 종료 또는 수용", "최종 판단 기록"],
  },
  "workbench:learning": {
    summary: "출시 후 행동 신호를 다음 투자와 보강 판단으로 연결합니다.",
    checklist: ["최근 사용 신호 확인", "Day 7/14/30 판단 신호 점검", "학습 리포트 저장"],
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
    question: "누가 이 보드를 계속 운영할지 먼저 정해졌나요?",
    aiLead: "접속 상태를 확인하고, 이후 단계가 열리는 최소 조건만 안내합니다.",
    deliverable: "로그인된 운영자 세션",
    checkpoint: "이후부터는 한 명이 끝까지 실행할 수 있는 흐름으로 진행됩니다.",
  },
  "console:workspace": {
    question: "이 아이디어를 혼자 다룰지, 팀과 함께 볼지 결정했나요?",
    aiLead: "혼자 진행 가능한 기본 모드를 유지하고, 필요할 때만 협업 공간을 연결합니다.",
    deliverable: "선택형 팀 공간 연결 상태",
    checkpoint: "협업이 필요하지 않다면 이 단계는 건너뛰어도 괜찮습니다.",
  },
  "console:extract": {
    question: "대화나 메모에서 무엇을 제품 후보로 올릴지 정리되었나요?",
    aiLead: "원문을 읽고 후보와 검증 방향을 먼저 구조화합니다.",
    deliverable: "추천 후보 1개와 비교 후보 큐",
    checkpoint: "추천 1개만 확인해도 다음 단계로 넘길 수 있게 정리합니다.",
  },
  "console:idea": {
    question: "이 아이디어를 실제 검증 대상으로 올릴 준비가 되었나요?",
    aiLead: "이름, 한 줄 설명, 신호, 다음 증거를 초안으로 채웁니다.",
    deliverable: "검증 가능한 아이디어 1건",
    checkpoint: "사용자는 꼭 필요한 의견만 덧붙이면 됩니다.",
  },
  "workbench:select": {
    question: "오늘 어떤 아이디어 하나를 끝까지 밀어볼까요?",
    aiLead: "점수, 리스크, 준비도 신호를 바탕으로 오늘 먼저 볼 후보를 추립니다.",
    deliverable: "오늘의 검토 대상 1건",
    checkpoint: "여기서 고른 1건이 이후 평가와 실행의 기준점이 됩니다.",
  },
  "workbench:score": {
    question: "이 아이디어는 시간과 자원을 써서 검증할 만한가요?",
    aiLead: "수요, 돈, 속도, 차별성, 위험을 묶어 점수를 정리합니다.",
    deliverable: "사업성 점수와 권장 판단",
    checkpoint: "숫자는 AI가 초안으로 제시하고, 사용자는 최종 감각만 조정합니다.",
  },
  "workbench:risk": {
    question: "출시를 막을 만한 법무·운영·보안 이슈가 있나요?",
    aiLead: "위험 영역을 묶고, 심각도와 대응 방향을 먼저 정리합니다.",
    deliverable: "핵심 리스크 목록",
    checkpoint: "막는 리스크인지, 관리 가능한 리스크인지 구분하는 단계입니다.",
  },
  "workbench:experiment": {
    question: "7일 안에 무엇을 확인하면 이 아이디어의 운명이 갈릴까요?",
    aiLead: "가장 작은 실험과 성공 기준을 초안으로 만듭니다.",
    deliverable: "7일 검증 실험 계획",
    checkpoint: "실험은 길게 설명하기보다 바로 행동 가능한 수준으로 남깁니다.",
  },
  "workbench:decision": {
    question: "지금은 진행, 보강, 전환, 중단 중 무엇이 맞을까요?",
    aiLead: "점수, 리스크, 실험 조건을 묶어 의사결정용 근거를 정리합니다.",
    deliverable: "진행 판단 메모",
    checkpoint: "회의 공유가 가능한 한 문단 결론이 가장 중요합니다.",
  },
  "workbench:artifacts": {
    question: "이 아이디어를 팀이나 AI에게 전달할 문서가 준비되었나요?",
    aiLead: "브리프, PRD, MVP 명세, 디자인 브리프 같은 산출물을 자동으로 묶습니다.",
    deliverable: "실행 패키지 초안",
    checkpoint: "사용자는 산출물 완성보다 승인 여부만 확인하면 됩니다.",
  },
  "workbench:development": {
    question: "이제 실제 앱 제작으로 넘어갈 준비가 되었나요?",
    aiLead: "기획, 디자인, 구현, QA, 출시 순서를 묶어 제안합니다.",
    deliverable: "제작 전달 묶음",
    checkpoint: "한 명의 운영자가 끝까지 볼 수 있도록 복잡한 개발 정보를 압축합니다.",
  },
  "workbench:orchestration": {
    question: "누가 무엇을 언제 처리할지 명확한가요?",
    aiLead: "전략, 디자인, 개발, QA, 보안의 순서를 정리하고 차단 요인을 표시합니다.",
    deliverable: "실행 런북과 진행 상태",
    checkpoint: "혼자 쓰더라도 이 화면은 작업 큐처럼 보이는 것이 중요합니다.",
  },
  "workbench:launch": {
    question: "지금 이 MVP를 밖으로 내보내도 괜찮을까요?",
    aiLead: "출시 전 남은 리스크, 문서, QA, 보안 상태를 하나로 모아 점검합니다.",
    deliverable: "출시 전 최종 판단",
    checkpoint: "남은 차단 항목이 없으면 바로 성과 확인으로 이동합니다.",
  },
  "workbench:learning": {
    question: "출시 후 실제 행동 신호가 다음 결정을 어떻게 바꾸나요?",
    aiLead: "Day 7/14/30 신호, 퍼널, 리텐션, 지불 의향 데이터를 다시 요약합니다.",
    deliverable: "성과 확인 리포트",
    checkpoint: "다음 반복은 여기서 얻은 학습으로 다시 시작합니다.",
  },
};

type TaskTransitionOption = {
  id: ShellTask;
  cta: string;
  hint: string;
  variant: "primary" | "optional";
};

type ExecutiveFocus = {
  eyebrow: string;
  title: string;
  detail: string;
  evidence: string;
  risk: string;
  targetTask: ShellTask;
  cta: string;
  metrics: Array<{ label: string; value: string }>;
};

function createTransition(
  id: ShellTask,
  cta: string,
  hint: string,
  variant: TaskTransitionOption["variant"] = "primary",
): TaskTransitionOption {
  return { id, cta, hint, variant };
}

function getNextTaskOptions({
  activeTask,
  ideaCount,
  artifactCount,
  runCount,
  openRisks,
}: {
  activeTask: ShellTask;
  ideaCount: number;
  artifactCount: number;
  runCount: number;
  openRisks: number;
}) {
  switch (activeTask) {
    case "console:auth":
      return [];
    case "console:workspace":
      return [];
    case "console:extract":
      return [];
    case "console:idea":
      return [];
    case "workbench:select":
      return ideaCount > 0
        ? [createTransition("workbench:score", "다음: 사업성 평가", "한 아이디어를 골라 수요와 속도를 점검합니다.")]
        : [];
    case "workbench:score":
      return [
        createTransition("workbench:experiment", "다음: 검증 실험", "7일 안에 확인할 가장 작은 실험으로 옮깁니다."),
        createTransition(
          "workbench:risk",
          "선택: 위험 먼저 보기",
          "법무, 개인정보, 운영 이슈가 먼저 보이면 여기서 보강합니다.",
          "optional",
        ),
      ];
    case "workbench:risk":
      return [
        createTransition("workbench:experiment", "다음: 검증 실험", "리스크를 적었다면 이제 실제 검증 실험으로 갑니다."),
        createTransition(
          "workbench:decision",
          "건너뛰고 진행 판단",
          "리스크 점검이 충분하면 바로 진행/보류 판단으로 넘어갑니다.",
          "optional",
        ),
      ];
    case "workbench:experiment":
      return [
        createTransition("workbench:decision", "다음: 진행 판단", "실험 계획과 점수를 근거로 결정합니다."),
        ...(openRisks === 0
          ? [
              createTransition(
                "workbench:risk",
                "선택: 위험 확인",
                "아직 리스크를 적지 않았다면 여기서 한 번 보강합니다.",
                "optional",
              ),
            ]
          : []),
      ];
    case "workbench:decision":
      return [
        createTransition("workbench:artifacts", "다음: 기획서 만들기", "보고서, PRD, MVP 범위를 문서로 남깁니다."),
        ...(artifactCount > 0
          ? [
              createTransition(
                "workbench:development",
                "건너뛰고 제작 준비",
                "이미 필요한 문서가 있으면 바로 제작 준비로 이동합니다.",
                "optional",
              ),
            ]
          : []),
      ];
    case "workbench:artifacts":
      return [createTransition("workbench:development", "다음: 제작 준비", "디자인, 개발, 배포 준비를 구체화합니다.")];
    case "workbench:development":
      return [
        createTransition("workbench:orchestration", "다음: 실행 관리", "전략, 디자인, 개발, QA 역할을 배정합니다."),
        ...(runCount > 0
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
      return [createTransition("workbench:launch", "다음: 출시 판단", "남은 차단 항목을 확인하고 출시 여부를 정합니다.")];
    case "workbench:launch":
      return [createTransition("workbench:learning", "다음: 성과 확인", "출시 후 행동 신호를 보고 다음 사이클을 정합니다.")];
    case "workbench:learning":
      return [createTransition("console:idea", "다음: 새 아이디어 접수", "이제 다음 후보를 다시 검토합니다.")];
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
      return "이 화면 안에서 로그인하면 바로 아이디어 찾기 단계가 열립니다. 협업 설정은 나중에 선택할 수 있습니다.";
    case "console:workspace":
      return consoleStatus.hasWorkspace
        ? "협업 공간을 연결했습니다. 다시 AI 후보 발굴로 돌아가 계속 진행하면 됩니다."
        : "이 단계는 선택 기능입니다. 팀으로 같이 볼 때만 워크스페이스를 만들거나 선택하세요.";
    case "console:extract":
      return consoleStatus.hasExtractedIdeas
        ? "추천 후보를 입력 폼으로 보내면 아이디어 접수 단계로 자동 이동합니다."
        : "후보를 발굴하거나 샘플을 넣어 결과를 만든 뒤 다음 단계가 열립니다.";
    case "console:idea":
      return ideaCount > 0
        ? "아이디어를 저장하면 검증 단계가 자동으로 열립니다."
        : "아이디어를 최소 1개 저장해야 검증 단계가 열립니다.";
    default:
      return null;
  }
}

function getExecutiveFocus({
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
    { label: "후보", value: `${ideaCount}` },
    { label: "열린 리스크", value: `${openRisks}` },
    { label: "실험", value: `${experimentCount}` },
    { label: "산출물", value: `${artifactCount}` },
  ];
  const dataNote = source === "supabase" ? "실제 데이터 기준" : "샘플 데이터 기준";

  if (!consoleStatus.isAuthLoaded || !consoleStatus.isAuthenticated) {
    return {
      eyebrow: "오늘의 판단",
      title: "먼저 운영자 계정으로 접속하세요.",
      detail: "로그인 뒤 후보, 검증, 실행 패키지가 한 흐름으로 열립니다.",
      evidence: "접속 필요",
      risk: "데이터는 로그인 후 확인",
      targetTask: "console:auth",
      cta: "로그인하기",
      metrics,
    };
  }

  if (ideaCount === 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "후보 1건을 먼저 올리면 됩니다.",
      detail: "대화 메모나 브리프를 붙여 넣고, AI가 뽑은 후보 중 하나만 저장하세요.",
      evidence: `${dataNote} · 후보 없음`,
      risk: "위험은 저장 뒤 확인",
      targetTask: "console:extract",
      cta: "후보 찾기",
      metrics,
    };
  }

  if (highRisks > 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "높은 리스크부터 닫아야 합니다.",
      detail: "진행 전에 법무, 보안, 운영 차단 항목을 먼저 정리하세요.",
      evidence: `${dataNote} · 높은 리스크 ${highRisks}건`,
      risk: `열린 리스크 ${openRisks}건`,
      targetTask: "workbench:risk",
      cta: "리스크 확인",
      metrics,
    };
  }

  if (experimentCount === 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "검증 실험이 아직 없습니다.",
      detail: "좋아 보이는 후보라도 7일 안에 확인할 행동 기준이 있어야 다음 판단이 빨라집니다.",
      evidence: `${dataNote} · 후보 ${ideaCount}건`,
      risk: openRisks > 0 ? `열린 리스크 ${openRisks}건` : "차단 리스크 없음",
      targetTask: "workbench:experiment",
      cta: "실험 설계",
      metrics,
    };
  }

  if (decisionCount === 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "진행 여부를 한 번 정리할 차례입니다.",
      detail: "점수, 리스크, 실험 조건을 모아 진행, 보강, 전환, 중단 중 하나를 남기세요.",
      evidence: `${dataNote} · 실험 ${experimentCount}건`,
      risk: openRisks > 0 ? `열린 리스크 ${openRisks}건` : "차단 리스크 없음",
      targetTask: "workbench:decision",
      cta: "판단 남기기",
      metrics,
    };
  }

  if (artifactCount === 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "판단을 실행 패키지로 묶어야 합니다.",
      detail: "아이디어 브리프, PRD, MVP 범위를 남겨야 다음 제작 도구로 넘길 수 있습니다.",
      evidence: `${dataNote} · 판단 ${decisionCount}건`,
      risk: openRisks > 0 ? `열린 리스크 ${openRisks}건` : "차단 리스크 없음",
      targetTask: "workbench:artifacts",
      cta: "문서 만들기",
      metrics,
    };
  }

  if (implementationTaskCount === 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "이제 제작 준비 상태를 확인하세요.",
      detail: "기획, 디자인, 개발, QA, 배포 조건을 한 묶음으로 정리하면 빌드 단계가 흔들리지 않습니다.",
      evidence: `${dataNote} · 산출물 ${artifactCount}건`,
      risk: openRisks > 0 ? `열린 리스크 ${openRisks}건` : "차단 리스크 없음",
      targetTask: "workbench:development",
      cta: "제작 준비",
      metrics,
    };
  }

  if (runCount === 0) {
    return {
      eyebrow: "오늘의 판단",
      title: "실행 큐를 열어 역할과 차단 항목을 정리하세요.",
      detail: "혼자 진행하더라도 전략, 디자인, 개발, QA 순서를 큐로 나누면 다음 작업이 선명해집니다.",
      evidence: `${dataNote} · 제작 작업 ${implementationTaskCount}건`,
      risk: openRisks > 0 ? `열린 리스크 ${openRisks}건` : "차단 리스크 없음",
      targetTask: "workbench:orchestration",
      cta: "실행 관리",
      metrics,
    };
  }

  return {
    eyebrow: "오늘의 판단",
    title: telemetryEventCount > 0 ? "성과 신호로 다음 반복을 정하세요." : "출시 전 마지막 확인이 남았습니다.",
    detail:
      telemetryEventCount > 0
        ? "실제 행동 신호를 보고 계속 투자할지, 보강할지, 새 후보로 돌아갈지 결정하세요."
        : "남은 차단 항목이 없다면 출시 판단을 남기고 성과 확인으로 넘어갈 수 있습니다.",
    evidence: `${dataNote} · 실행 기록 ${runCount}건`,
    risk: openRisks > 0 ? `열린 리스크 ${openRisks}건` : "차단 리스크 없음",
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
}) {
  const [activeTask, setActiveTask] = useState<ShellTask>("console:auth");
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
  const [visitedTaskIds, setVisitedTaskIds] = useState<ShellTask[]>(["console:auth"]);
  const goToTask = useCallback((task: ShellTask) => {
    setVisitedTaskIds((current) => (current.includes(task) ? current : [...current, task]));
    setActiveTask(task);
  }, []);
  const handleConsoleTaskChange = useCallback((task: ConsoleActionTask) => {
    goToTask(`console:${task}`);
  }, [goToTask]);
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
      handleRecordEvent<Idea>(event, setIdeas);
      goToTask("workbench:select");
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
  const ideaCount = ideas.length;
  const visibleTask: ShellTask = (() => {
    if (!consoleStatus.isAuthLoaded || !consoleStatus.isAuthenticated) {
      return "console:auth";
    }

    if (activeTask === "console:auth") {
      return ideaCount > 0 ? "workbench:select" : "console:extract";
    }

    if (activeTask === "console:idea" && ideaCount > 0) {
      return "workbench:select";
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
  const previousTask = activeTaskIndex > 0 ? shellTasks[activeTaskIndex - 1] : null;
  const nextTaskOptions = getNextTaskOptions({
    activeTask: visibleTask,
    ideaCount,
    artifactCount,
    runCount,
    openRisks,
  });
  const primaryNextTask = nextTaskOptions.find((option) => option.variant === "primary") ?? null;
  const optionalNextTasks = nextTaskOptions.filter((option) => option.variant === "optional");
  const activeGuidance = taskGuidance[visibleTask];
  const currentStepBlocker = getCurrentStepBlocker({
    activeTask: visibleTask,
    consoleStatus,
    ideaCount,
  });
  const taskStatuses: Record<ShellTask, string> = {
    "console:auth": "접근",
    "console:workspace": "선택",
    "console:extract": "발굴",
    "console:idea": "접수",
    "workbench:select": `${ideaCount}개`,
    "workbench:score": "평가",
    "workbench:risk": `${openRisks}개`,
    "workbench:experiment": `${experimentCount}개`,
    "workbench:decision": "판단",
    "workbench:artifacts": `${artifactCount}개`,
    "workbench:development": implementationTaskCount > 0 ? `${implementationTaskCount}개` : "준비",
    "workbench:orchestration": `${runCount}개`,
    "workbench:launch": highRisks > 0 ? "점검" : "확인",
    "workbench:learning": telemetryEventCount > 0 ? `${telemetryEventCount}개` : "대기",
  };
  const requiredShellTasks = shellTasks.filter((task) => !task.optional);
  const supportTasks = consoleStatus.isAuthenticated
    ? shellTasks.filter(
        (task) =>
          task.optional &&
          task.id !== visibleTask &&
          !nextTaskOptions.some((option) => option.id === task.id) &&
          !visitedTaskIds.includes(task.id),
      )
    : [];
  const completedTasks = shellTasks.filter((task) => visitedTaskIds.includes(task.id) && task.id !== visibleTask);
  const completedRequiredTasks = completedTasks.filter((task) => !task.optional);
  const availableTaskIds = new Set<ShellTask>([
    ...completedTasks.map((task) => task.id),
    activeTaskConfig.id,
    ...nextTaskOptions.map((task) => task.id),
    ...supportTasks.map((task) => task.id),
  ]);
  const lockedTasks = shellTasks.filter((task) => !availableTaskIds.has(task.id));
  const stepNumber = activeTaskConfig.optional
    ? null
    : requiredShellTasks.findIndex((task) => task.id === activeTaskConfig.id) + 1;
  const completedRequiredCount = completedTasks.filter((task) => !task.optional).length;
  const workflowProgress = Math.min(
    100,
    Math.round(((completedRequiredCount + (activeTaskConfig.optional ? 0 : 0.5)) / Math.max(1, requiredShellTasks.length)) * 100),
  );
  const activeCanvas = taskCanvasDetails[visibleTask];
  const showFirstEntryStrip = consoleStatus.isAuthenticated && ideaCount === 0 && visibleTask === "console:extract";
  const compactIntroCanvas = visibleTask === "console:auth" || visibleTask === "console:workspace";
  const railPrimaryTasks = requiredShellTasks.filter(
    (task) => task.id === visibleTask || nextTaskOptions.some((option) => option.id === task.id),
  );
  const executiveFocus = getExecutiveFocus({
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

    return String(requiredShellTasks.findIndex((item) => item.id === task.id) + 1);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[192px_minmax(0,1fr)]">
      <aside className="order-2 self-start overflow-y-auto border-r border-slate-200 pr-3 xl:sticky xl:top-4 xl:order-none xl:max-h-[calc(100vh-2rem)]">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">AI Venture Lab</div>
              <h2 className="mt-1 text-sm font-semibold tracking-tight text-slate-950">진행 레일</h2>
            </div>
            <div className="avl-pill avl-pill-soft text-[10px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${source === "supabase" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              {source === "supabase" ? "연결됨" : "제한"}
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1 overflow-hidden bg-slate-100">
              <div className="h-full bg-slate-950 transition-all" style={{ width: `${workflowProgress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>진행 {completedRequiredCount}/{requiredShellTasks.length}</span>
              <span>{workflowProgress}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {railPrimaryTasks.map((task, index) => {
            const Icon = task.icon;
            const isCurrent = task.id === visibleTask;
            const isCompleted = completedTasks.some((item) => item.id === task.id);
            const isAvailable = nextTaskOptions.some((item) => item.id === task.id);
            const previous = railPrimaryTasks[index - 1];
            const showGroupLabel = index === 0 || previous.group !== task.group;

            return (
              <div key={task.id}>
                {showGroupLabel ? (
                  <div className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{task.group}</div>
                ) : null}
                <button
                  type="button"
                  onClick={() => goToTask(task.id)}
                  className={`grid w-full grid-cols-[1.35rem_minmax(0,1fr)_auto] items-start gap-2 border-l-2 px-2.5 py-2 text-left transition ${
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
                      {isCurrent || isAvailable ? (
                        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{task.description}</span>
                      ) : null}
                    </span>
                    {isCurrent || isCompleted ? (
                      <span className="avl-pill avl-pill-soft mt-0.5 px-1.5 py-0.5 text-[10px]">
                        {taskStatuses[task.id]}
                      </span>
                    ) : null}
                  </button>
              </div>
            );
          })}
        </div>

        {completedRequiredTasks.length > 0 ? (
          <details className="mt-4 border-t border-slate-200 pt-3">
            <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              완료한 단계 다시 보기
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
                      <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{task.description}</span>
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
          <div className="grid gap-px bg-slate-800 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="bg-slate-950 p-4 sm:p-5">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">{executiveFocus.eyebrow}</div>
              <div className="mt-3 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="min-w-0">
                  <h2 className="max-w-3xl text-[20px] font-semibold tracking-tight sm:text-[28px] sm:leading-[36px]">
                    {executiveFocus.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{executiveFocus.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => goToTask(executiveFocus.targetTask)}
                  className="avl-btn bg-white px-4 text-slate-950 hover:bg-slate-100"
                >
                  {executiveFocus.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid bg-slate-950 sm:grid-cols-2 lg:grid-cols-1">
              <div className="border-b border-slate-800 p-4 sm:border-b-0 sm:border-r lg:border-r-0 lg:border-b">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500">근거 상태</div>
                <p className="mt-2 text-sm font-semibold text-white">{executiveFocus.evidence}</p>
              </div>
              <div className="p-4">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500">위험 상태</div>
                <p className="mt-2 text-sm font-semibold text-white">{executiveFocus.risk}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4">
            {executiveFocus.metrics.map((metric) => (
              <div key={metric.label} className="bg-slate-900 px-4 py-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500">{metric.label}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-white">{metric.value}</div>
              </div>
            ))}
          </div>
        </section>

        {showFirstEntryStrip ? (
          <section className="border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">first three</span>
              <span className="text-[13px] font-semibold tracking-tight text-slate-950">여기까지만 먼저</span>
              <span className="hidden text-slate-300 lg:inline">/</span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  "원문 붙여넣기",
                  "추천 후보 1건 보기",
                  "아이디어 저장",
                ].map((step, index) => (
                  <span key={step} className="inline-flex items-center gap-2">
                    <span className="avl-step-dot h-6 w-6 bg-slate-100 text-slate-700">{index + 1}</span>
                    <span className="font-medium">{step}</span>
                    {index < 2 ? <span className="text-slate-300">/</span> : null}
                  </span>
                ))}
              </div>
              <span className="text-slate-400">검증 단계는 저장 직후 이어집니다.</span>
            </div>
          </section>
        ) : null}

        <section className="border border-slate-200 bg-white p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_276px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span className="text-slate-500">{activeTaskConfig.group}</span>
                {!activeTaskConfig.optional ? <span>단계 {stepNumber}/{requiredShellTasks.length}</span> : null}
                <span className="avl-pill avl-pill-soft px-2 py-1 text-[11px]">
                  {taskStatuses[activeTaskConfig.id]}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-3">
                <span className="avl-icon-frame">
                  <ActiveIcon size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">현재 질문</div>
                  <h2 className="mt-1 max-w-4xl text-[18px] font-semibold tracking-tight text-slate-950 sm:text-[26px] sm:leading-[34px]">
                    {activeCanvas.question}
                  </h2>
                  <p className="mt-1 max-w-3xl text-[12px] leading-5 text-slate-500">{activeGuidance.summary}</p>
                </div>
              </div>

              <div className={`mt-4 grid gap-4 border-t border-slate-200 pt-4 ${compactIntroCanvas ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">AI 준비</div>
                  <p className="mt-1 text-[13px] leading-6 text-slate-700">{activeCanvas.aiLead}</p>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">이번 결과</div>
                  <p className="mt-1 text-[13px] leading-6 text-slate-700">{activeCanvas.deliverable}</p>
                </div>
                {!compactIntroCanvas ? (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">확인 포인트</div>
                    <p className="mt-1 text-[13px] leading-6 text-slate-700">{activeCanvas.checkpoint}</p>
                  </div>
                ) : null}
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
                {primaryNextTask ? (
                  <button
                    type="button"
                    onClick={() => goToTask(primaryNextTask.id)}
                    className="avl-btn avl-btn-primary w-full px-4"
                  >
                    {primaryNextTask.cta}
                    <ArrowRight size={16} />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => previousTask && goToTask(previousTask.id)}
                  disabled={!previousTask}
                  className="avl-btn avl-btn-secondary w-full px-4"
                >
                  이전 단계
                </button>
              </div>

              {optionalNextTasks.length > 0 ? (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">건너뛸 수 있는 단계</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {optionalNextTasks.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => goToTask(option.id)}
                        className="avl-btn avl-btn-subtle h-8 px-3 text-xs"
                      >
                        {option.cta}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
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
              existingIdeas={ideas}
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
              activeTask={activeWorkbenchTask}
              onActiveTaskChange={handleWorkbenchTaskChange}
              showSidebar={false}
              embedded
            />
          </div>
        </section>

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
