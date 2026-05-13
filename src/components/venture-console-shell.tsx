"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Activity,
  ArrowRight,
  Beaker,
  CheckCircle2,
  ClipboardList,
  Code2,
  Flag,
  Layers3,
  LockKeyhole,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

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
  icon: typeof UserRound;
  optional?: boolean;
}> = [
  {
    id: "console:auth",
    label: "로그인",
    description: "계정으로 접속",
    group: "시작",
    icon: UserRound,
  },
  {
    id: "console:workspace",
    label: "협업 설정",
    description: "팀 공간 연결은 선택",
    group: "시작",
    icon: Users,
    optional: true,
  },
  {
    id: "console:extract",
    label: "아이디어 찾기",
    description: "대화와 메모에서 후보 추출",
    group: "시작",
    icon: Sparkles,
  },
  {
    id: "console:idea",
    label: "아이디어 접수",
    description: "한 줄로 먼저 기록",
    group: "시작",
    icon: Save,
  },
  {
    id: "workbench:select",
    label: "후보 선택",
    description: "검토할 아이디어 고르기",
    group: "검증",
    icon: ClipboardList,
  },
  {
    id: "workbench:score",
    label: "사업성 평가",
    description: "수요, 돈, 속도 점검",
    group: "검증",
    icon: Beaker,
  },
  {
    id: "workbench:risk",
    label: "위험 확인",
    description: "법무, 운영, 보안 리스크",
    group: "검증",
    icon: Flag,
  },
  {
    id: "workbench:experiment",
    label: "검증 실험",
    description: "7일 안에 확인할 증거",
    group: "검증",
    icon: Beaker,
  },
  {
    id: "workbench:decision",
    label: "진행 판단",
    description: "진행, 보류, 중단 결정",
    group: "검증",
    icon: ShieldCheck,
  },
  {
    id: "workbench:artifacts",
    label: "기획서 만들기",
    description: "보고서, PRD, MVP 자료",
    group: "제작",
    icon: ClipboardList,
  },
  {
    id: "workbench:development",
    label: "제작 준비",
    description: "디자인, 개발, 배포 준비",
    group: "제작",
    icon: Code2,
  },
  {
    id: "workbench:orchestration",
    label: "실행 관리",
    description: "담당 역할과 상태 확인",
    group: "제작",
    icon: Layers3,
  },
  {
    id: "workbench:launch",
    label: "출시 판단",
    description: "출시 전 남은 조건",
    group: "제작",
    icon: Rocket,
  },
  {
    id: "workbench:learning",
    label: "성과 확인",
    description: "출시 후 행동 신호",
    group: "출시 후",
    icon: Activity,
  },
];

const taskGuidance: Record<ShellTask, { summary: string; checklist: string[] }> = {
  "console:auth": {
    summary: "관리자가 만든 계정의 이메일과 비밀번호로 접속합니다. 별도 인증키나 메일 링크를 다루지 않아도 됩니다.",
    checklist: ["관리자 계정 준비", "이메일과 비밀번호 입력", "로그인 상태 확인"],
  },
  "console:workspace": {
    summary: "기본은 혼자 진행합니다. 팀 초대나 기록 공유가 필요할 때만 협업 공간을 연결합니다.",
    checklist: ["혼자 쓸 때는 건너뛰기", "팀 공간 생성 또는 선택", "필요할 때만 멤버 추가"],
  },
  "console:extract": {
    summary: "회의록, 대화, 메모에서 AI가 앱 후보와 검증 계획 초안을 자동으로 뽑아냅니다.",
    checklist: [
      "대화 원문 붙여넣기",
      "후보 발굴 실행",
      "추천 후보 1개 먼저 확인",
      "필요하면 비교 결과 펼쳐 보기",
      "좋은 후보를 아이디어 초안으로 반영",
    ],
  },
  "console:idea": {
    summary: "AI가 채운 초안을 검토하고, 꼭 필요한 의견만 보완한 뒤 저장합니다.",
    checklist: ["이름과 한 줄 설명 확인", "필요할 때만 추가 항목 보완", "아이디어 저장"],
  },
  "workbench:select": {
    summary: "오늘 검토할 아이디어를 하나 고른 뒤 평가와 검증을 진행합니다.",
    checklist: ["전체 또는 내 기록 확인", "편집 가능 여부 확인", "평가할 후보 선택"],
  },
  "workbench:score": {
    summary: "수요 강도, 빈도, 도달성, 지불 의향, 제작 속도, 차별성, 위험 감점을 숫자로 맞춥니다.",
    checklist: ["현재 단계와 판단 선택", "증거 공백 확인", "평가 저장"],
  },
  "workbench:risk": {
    summary: "법무, 개인정보, 운영 책임, 보안처럼 출시를 막을 수 있는 위험을 먼저 꺼냅니다.",
    checklist: ["리스크 제목과 영역 입력", "심각도 선택", "완화 방안 또는 수용 조건 기록"],
  },
  "workbench:decision": {
    summary: "점수만 보지 않고 왜 진행, 보류, 전환, 중단하는지 회의용 근거를 남깁니다.",
    checklist: ["현재 판단 확인", "판단 근거 작성", "최종 기록 저장"],
  },
  "workbench:experiment": {
    summary: "7일 안에 확인할 가장 작은 실험을 만들고 성공 기준을 숫자나 관찰 조건으로 정합니다.",
    checklist: ["실험 이름 입력", "성공 기준 작성", "진행 상태 업데이트"],
  },
  "workbench:orchestration": {
    summary: "전략, 리서치, 제품, 디자인, 개발, QA, 보안, 출시 담당 역할과 진행 상태를 관리합니다.",
    checklist: ["실행 계획 만들기", "역할별 결과 작성", "완료된 단계 상태 변경"],
  },
  "workbench:artifacts": {
    summary: "회의 보고용 브리프, PRD, MVP 범위, 출시 체크리스트를 저장하고 승인 상태를 관리합니다.",
    checklist: ["필요 자료 저장", "PRD와 MVP 범위 승인", "상태 메모 작성"],
  },
  "workbench:development": {
    summary: "검증된 아이디어를 실제 앱으로 만들기 위해 기획, 디자인, 개발, QA, 보안, 배포 준비를 정리합니다.",
    checklist: ["제작 준비 자료 만들기", "개발 실행 계획 저장", "배포 전 확인 조건 점검"],
  },
  "workbench:launch": {
    summary: "출시 전 남은 차단 항목을 확인하고 최종 출시 판단을 기록합니다.",
    checklist: ["남은 항목 확인", "높은 위험 종료 또는 수용", "최종 판단 기록"],
  },
  "workbench:learning": {
    summary: "출시 이후 실제 사용 행동을 모아 다음 투자, 보강, 전환, 중단 판단으로 연결합니다.",
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
    aiLead: "원문을 읽고 후보, 수요 신호, 검증 방향을 먼저 구조화합니다.",
    deliverable: "AI 후보 비교와 추천 1순위",
    checkpoint: "추천 1개만 보고 다음 단계로 넘길 수 있게 정리합니다.",
  },
  "console:idea": {
    question: "이 아이디어를 실제 검증 대상으로 올릴 준비가 되었나요?",
    aiLead: "후보 내용을 바탕으로 이름, 한 줄 설명, 신호, 다음 증거를 초안으로 채웁니다.",
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
    aiLead: "수요, 돈, 도달성, MVP 속도, 차별성, 위험 감점을 종합해 점수를 정리합니다.",
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
    aiLead: "가장 작은 실험, 성공 기준, 실패 기준을 초안으로 만듭니다.",
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
    aiLead: "기획, 디자인, 개발, QA, 배포까지 실행 순서를 묶어 제안합니다.",
    deliverable: "AI 실행 패키지",
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

function scoreIdea(idea: Idea) {
  return Math.max(
    0,
    idea.problem_intensity +
      idea.frequency +
      idea.reachability +
      idea.willingness_to_pay +
      idea.mvp_speed +
      idea.differentiation -
      idea.regulatory_risk,
  );
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
  const activeConsoleTask = activeTask.startsWith("console:")
    ? (activeTask.replace("console:", "") as ConsoleActionTask)
    : "idea";
  const activeWorkbenchTask = activeTask.startsWith("workbench:")
    ? (activeTask.replace("workbench:", "") as WorkbenchTask)
    : "select";
  const ideaCount = ideas.length;
  const openRisks = risks.filter((risk) => risk.status.toLowerCase() === "open").length;
  const highRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;
  const experimentCount = experiments.length;
  const runCount = orchestrationRuns.length;
  const artifactCount = artifacts.length;
  const implementationTaskCount = implementationTasks.length;
  const telemetryEventCount = telemetryEvents.length;
  const prioritizedIdeas = useMemo(
    () =>
      ideas
        .map((idea) => {
          const ideaRisks = risks.filter((risk) => risk.idea_id === idea.id);
          const openHighRiskCount = ideaRisks.filter(
            (risk) => risk.status !== "closed" && ["high", "critical"].includes(risk.severity),
          ).length;
          const ideaExperiments = experiments.filter((experiment) => experiment.idea_id === idea.id);
          const ideaArtifacts = artifacts.filter((artifact) => artifact.idea_id === idea.id);
          const approvedProductArtifactCount = ideaArtifacts.filter(
            (artifact) =>
              artifact.status === "approved" && ["prd", "mvp_spec", "design_brief", "tech_spec"].includes(artifact.artifact_type),
          ).length;
          const ventureScore = scoreIdea(idea);
          const priorityScore =
            ventureScore +
            Math.min(6, ideaExperiments.length * 2) +
            Math.min(8, approvedProductArtifactCount * 2) -
            openHighRiskCount * 5 -
            (idea.decision === "kill" ? 12 : 0);
          const nextAction =
            openHighRiskCount > 0
              ? "리스크 먼저"
              : ideaExperiments.length === 0
                ? "실험 먼저"
                : approvedProductArtifactCount > 0
                  ? "개발 후보"
                  : "검증 후보";

          return {
            idea,
            ventureScore,
            priorityScore,
            nextAction,
            openHighRiskCount,
          };
        })
        .sort(
          (left, right) =>
            right.priorityScore - left.priorityScore ||
            new Date(right.idea.created_at).getTime() - new Date(left.idea.created_at).getTime(),
        )
        .slice(0, 3),
    [artifacts, experiments, ideas, risks],
  );
  const activeWork = experiments.filter((experiment) => experiment.status !== "done").length +
    orchestrationRuns.filter((run) => ["planned", "running", "blocked"].includes(run.status)).length +
    implementationTasks.filter((task) => task.status !== "done").length;
  const activeTaskIndex = shellTasks.findIndex((task) => task.id === activeTask);
  const activeTaskConfig = shellTasks[activeTaskIndex] ?? shellTasks[0];
  const ActiveIcon = activeTaskConfig.icon;
  const previousTask = activeTaskIndex > 0 ? shellTasks[activeTaskIndex - 1] : null;
  const nextTaskOptions = getNextTaskOptions({
    activeTask,
    ideaCount,
    artifactCount,
    runCount,
    openRisks,
  });
  const primaryNextTask = nextTaskOptions.find((option) => option.variant === "primary") ?? null;
  const optionalNextTasks = nextTaskOptions.filter((option) => option.variant === "optional");
  const activeGuidance = taskGuidance[activeTask];
  const currentStepBlocker = getCurrentStepBlocker({
    activeTask,
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
          task.id !== activeTask &&
          !nextTaskOptions.some((option) => option.id === task.id) &&
          !visitedTaskIds.includes(task.id),
      )
    : [];
  const completedTasks = shellTasks.filter((task) => visitedTaskIds.includes(task.id) && task.id !== activeTask);
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
  const activeCanvas = taskCanvasDetails[activeTask];
  const groupedRequiredTasks = (["시작", "검증", "제작", "출시 후"] as ShellTaskGroup[]).map((group) => ({
    group,
    tasks: requiredShellTasks.filter((task) => task.group === group),
  }));
  const overviewStats = [
    { label: "아이디어", value: String(ideaCount), tone: "text-violet-50" },
    { label: "열린 리스크", value: String(openRisks), tone: "text-amber-100" },
    { label: "실행 중", value: String(activeWork), tone: "text-emerald-100" },
    { label: "산출물", value: String(artifactCount), tone: "text-cyan-100" },
  ];
  const operatorSummary =
    currentStepBlocker ??
    primaryNextTask?.hint ??
    "현재 단계 입력이 정리되면 AI가 바로 다음 실행 단계까지 이어서 제안합니다.";
  const collaborationTask = shellTasks.find((task) => task.id === "console:workspace") ?? null;

  function getTaskOrderLabel(task: (typeof shellTasks)[number]) {
    if (task.optional) {
      return "선택";
    }

    return String(requiredShellTasks.findIndex((item) => item.id === task.id) + 1);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[296px_minmax(0,1fr)_320px]">
      <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,10,16,0.98),rgba(15,17,26,0.98))] p-4 text-white shadow-[0_35px_120px_rgba(0,0,0,0.42)] backdrop-blur lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:self-start">
        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-200">AI Venture Lab</div>
              <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-white">Workflow Rail</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              {source === "supabase" ? "Live" : "Fallback"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            한 번에 한 단계만 보고, 끝나면 다음 단계가 열리는 단일 실행 흐름입니다.
          </p>
          <div className="mt-4 rounded-[20px] border border-violet-300/20 bg-[radial-gradient(circle_at_top_left,rgba(187,166,255,0.18),transparent_50%),linear-gradient(135deg,rgba(30,22,51,0.82),rgba(18,22,35,0.88))] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100">진행률</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold text-white">{workflowProgress}%</div>
              <div className="text-right text-xs leading-5 text-slate-200">
                {completedRequiredCount}/{requiredShellTasks.length} 완료
                <div className="text-slate-400">{activeTaskConfig.label} 진행 중</div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#BBA6FF] via-[#A855F7] to-[#FAB0FF]"
                style={{ width: `${workflowProgress}%` }}
              />
            </div>
          </div>
        </div>

        {collaborationTask ? (
          <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">선택 기능</div>
            <button
              type="button"
              onClick={() => goToTask(collaborationTask.id)}
              className="mt-3 grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/15 text-xs font-semibold text-cyan-100">
                선택
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Users size={15} />
                  {collaborationTask.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-slate-300">{collaborationTask.description}</span>
              </span>
              <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-xs font-semibold text-cyan-100">옵션</span>
            </button>
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {groupedRequiredTasks.map(({ group, tasks }) => (
            <div key={group} className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">{group}</div>
              <div className="mt-3 grid gap-2">
                {tasks.map((task) => {
                  const Icon = task.icon;
                  const isCurrent = task.id === activeTask;
                  const isCompleted = completedTasks.some((item) => item.id === task.id);
                  const isAvailable = nextTaskOptions.some((item) => item.id === task.id);
                  const isLocked = !isCurrent && !isCompleted && !isAvailable;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => !isLocked && goToTask(task.id)}
                      disabled={isLocked}
                      className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 py-3 text-left transition ${
                        isCurrent
                          ? "border-violet-300/35 bg-violet-300/12"
                          : isCompleted
                            ? "border-emerald-300/20 bg-emerald-400/10"
                            : isAvailable
                              ? "border-white/10 bg-white/6 hover:bg-white/10"
                              : "border-white/8 bg-white/[0.03] opacity-65"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isCurrent
                            ? "bg-violet-200/15 text-violet-50"
                            : isCompleted
                              ? "bg-emerald-300/15 text-emerald-100"
                              : "bg-white/10 text-slate-200"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={14} /> : getTaskOrderLabel(task)}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Icon size={15} />
                          {task.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-300">{task.description}</span>
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                          isCurrent
                            ? "bg-violet-200/15 text-violet-50"
                            : isCompleted
                              ? "bg-emerald-300/15 text-emerald-100"
                              : isAvailable
                                ? "bg-white/10 text-slate-200"
                                : "bg-white/8 text-slate-400"
                        }`}
                      >
                        {isCurrent ? "현재" : isCompleted ? "완료" : isAvailable ? "열림" : "잠김"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,10,16,0.98),rgba(16,18,28,0.98))] shadow-[0_35px_120px_rgba(0,0,0,0.42)]">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(187,166,255,0.2),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_24%),linear-gradient(135deg,rgba(14,14,20,0.98),rgba(18,18,28,0.98))] px-6 py-6 sm:px-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                  <span>{activeTaskConfig.group}</span>
                  {!activeTaskConfig.optional ? <span>Step {stepNumber}/{requiredShellTasks.length}</span> : null}
                  <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-slate-200">
                    {taskStatuses[activeTaskConfig.id]}
                  </span>
                </div>
                <div className="mt-4 flex items-start gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-violet-200/20 bg-violet-300/10 text-violet-100 shadow-[0_10px_30px_rgba(168,85,247,0.18)]">
                    <ActiveIcon size={24} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-4xl font-semibold tracking-tight text-white">{activeTaskConfig.label}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{activeTaskConfig.description}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">AI가 먼저 하는 일</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{activeCanvas.aiLead}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">이번 단계 산출물</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{activeCanvas.deliverable}</p>
                  </div>
                  <div className="rounded-[20px] border border-violet-300/20 bg-violet-300/10 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-100">사람이 확인할 포인트</div>
                    <p className="mt-2 text-sm leading-6 text-violet-50">{activeCanvas.checkpoint}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">이번 단계에서 할 일</div>
                <p className="mt-3 text-sm leading-7 text-slate-200">{activeGuidance.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeGuidance.checklist.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
                  {operatorSummary}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => previousTask && goToTask(previousTask.id)}
                    disabled={!previousTask}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    이전
                  </button>
                  {primaryNextTask ? (
                    <button
                      type="button"
                      onClick={() => goToTask(primaryNextTask.id)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      {primaryNextTask.cta}
                      <ArrowRight size={16} />
                    </button>
                  ) : null}
                  {optionalNextTasks.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => goToTask(option.id)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      {option.cta}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={activeTask.startsWith("console:") ? "" : "hidden"}>
          <VentureConsoleActions
            activeTask={activeConsoleTask}
            onActiveTaskChange={handleConsoleTaskChange}
            onWorkflowStatusChange={setConsoleStatus}
            showSidebar={false}
            embedded
            existingIdeas={ideas}
          />
        </div>
        <div className={activeTask.startsWith("workbench:") ? "" : "hidden"}>
          <IdeaWorkbench
            initialIdeas={ideas}
            initialRisks={risks}
            initialDecisions={initialDecisions}
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
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-4 lg:self-start">
        <div className="grid grid-cols-2 gap-3">
          {overviewStats.map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
              <div className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">AI Operator</div>
          <div className="mt-3 text-xl font-semibold text-white">{activeTaskConfig.label}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{activeGuidance.summary}</p>
          <div className="mt-4 rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
            {currentStepBlocker ? currentStepBlocker : "현재 단계가 정리되면 다음 행동과 산출물을 AI가 자동으로 이어서 제안합니다."}
          </div>
        </div>

        {prioritizedIdeas.length > 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,17,26,0.98),rgba(19,22,34,0.98))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">우선 검토 후보</div>
                <div className="mt-2 text-xl font-semibold text-white">오늘 먼저 볼 아이디어</div>
              </div>
              <span className="rounded-full bg-violet-300/15 px-2.5 py-1 text-[11px] font-semibold text-violet-100">
                상위 {prioritizedIdeas.length}개
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {prioritizedIdeas.map((item, index) => (
                <button
                  key={item.idea.id}
                  type="button"
                  onClick={() => goToTask("workbench:select")}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 text-left transition hover:border-violet-300/35 hover:bg-white/10"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-semibold text-white">{item.idea.name}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-300">
                      점수 {item.ventureScore} · {item.nextAction}
                    </span>
                    <span className="mt-2 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                      {item.openHighRiskCount > 0 ? `고위험 ${item.openHighRiskCount}` : "고위험 없음"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">다음 흐름</div>
          <div className="mt-3 grid gap-3">
            {nextTaskOptions.length > 0 ? (
              nextTaskOptions.map((option) => {
                const task = shellTasks.find((item) => item.id === option.id);

                if (!task) {
                  return null;
                }

                const Icon = task.icon;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => goToTask(task.id)}
                    className={`grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-[18px] border p-4 text-left transition ${
                      option.variant === "primary"
                        ? "border-emerald-300/20 bg-emerald-400/10 hover:bg-emerald-400/15"
                        : "border-amber-300/20 bg-amber-400/10 hover:bg-amber-400/15"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                        option.variant === "primary" ? "bg-emerald-300/15 text-emerald-100" : "bg-amber-300/15 text-amber-100"
                      }`}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{option.cta}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-200">{option.hint}</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                현재 열린 단계를 마치면 다음 흐름이 이곳에 표시됩니다.
              </div>
            )}
          </div>
        </div>

        {lockedTasks.length > 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <LockKeyhole size={13} />
              잠긴 뒤 단계 미리보기
            </div>
            <div className="mt-3 grid gap-2">
              {lockedTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-[18px] border border-white/8 bg-white/[0.04] p-3 opacity-80"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-slate-300">
                    {getTaskOrderLabel(task)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{task.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-400">{task.description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </section>
  );
}
