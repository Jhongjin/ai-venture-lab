"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Activity,
  Beaker,
  ClipboardList,
  Code2,
  Flag,
  Layers3,
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

  function getTaskOrderLabel(task: (typeof shellTasks)[number]) {
    if (task.optional) {
      return "선택";
    }

    return String(requiredShellTasks.findIndex((item) => item.id === task.id) + 1);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:self-start">
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">AI Venture Lab</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">AI 실행 흐름</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            AI가 초안을 만들고, 필요한 순간에만 사람이 의견을 보완하는 방식으로 한 단계씩 진행합니다.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {[
            ["아이디어", String(ideaCount)],
            ["리스크", String(openRisks)],
            ["고위험", String(highRisks)],
            ["진행 중", String(activeWork)],
            ["자료", String(artifacts.length)],
            ["저장소", source === "supabase" ? "DB" : "예시"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
            </div>
          ))}
        </div>

        {prioritizedIdeas.length > 0 ? (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">오늘 먼저 볼 후보</div>
            <div className="grid gap-2">
              {prioritizedIdeas.map((item, index) => (
                <button
                  key={item.idea.id}
                  type="button"
                  onClick={() => goToTask("workbench:select")}
                  className="grid grid-cols-[1.6rem_minmax(0,1fr)_auto] items-center gap-2 rounded-md bg-white p-2 text-left shadow-sm transition hover:bg-blue-50"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-950">{item.idea.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      점수 {item.ventureScore} · {item.openHighRiskCount > 0 ? `고위험 ${item.openHighRiskCount}` : "고위험 없음"}
                    </span>
                  </span>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{item.nextAction}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">현재 단계</div>
          <button
            type="button"
            onClick={() => goToTask(activeTaskConfig.id)}
            aria-current="step"
            className="mt-2 grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-blue-300 bg-white p-3 text-left shadow-sm"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {stepNumber ?? "선택"}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ActiveIcon size={15} />
                {activeTaskConfig.label}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{activeTaskConfig.description}</span>
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
              {taskStatuses[activeTaskConfig.id]}
            </span>
          </button>
        </div>

        {supportTasks.length > 0 ? (
          <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">선택 기능</div>
            <div className="mt-2 grid gap-2">
              {supportTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => goToTask(task.id)}
                    className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-violet-200 bg-white p-3 text-left transition hover:bg-violet-50"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                      선택
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <Icon size={15} />
                        {task.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
                    </span>
                    <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">옵션</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {nextTaskOptions.length > 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">다음에 할 수 있는 단계</div>
            <div className="mt-2 grid gap-2">
              {nextTaskOptions.map((option) => {
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
                    className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3 text-left transition ${
                      option.variant === "primary"
                        ? "border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                        : "border-amber-200 bg-white hover:border-amber-300 hover:bg-amber-50"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        option.variant === "primary" ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
                      }`}
                    >
                      {getTaskOrderLabel(task)}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <Icon size={15} />
                        {task.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{option.hint}</span>
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        option.variant === "primary"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {option.variant === "primary" ? "다음" : "선택"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : currentStepBlocker ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">다음 단계는 아직 잠겨 있습니다</div>
            <p className="mt-2 text-sm leading-6 text-amber-900">{currentStepBlocker}</p>
          </div>
        ) : null}

        {completedTasks.length > 0 ? (
          <details className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              완료한 단계 다시 보기
            </summary>
            <div className="mt-3 grid gap-2">
              {completedTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => goToTask(task.id)}
                    className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300 hover:bg-white"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-sm">
                      {getTaskOrderLabel(task)}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Icon size={15} />
                        {task.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">완료</span>
                  </button>
                );
              })}
            </div>
          </details>
        ) : null}

        {lockedTasks.length > 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">뒤 단계는 잠겨 있습니다</div>
            <div className="mt-2 grid gap-2">
              {lockedTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-left opacity-80"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                    {getTaskOrderLabel(task)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-700">{task.label}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">잠김</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="min-w-0">
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(280px,0.65fr)]">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <ActiveIcon size={20} />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {activeTaskConfig.optional
                      ? "선택 기능 · 협업"
                      : `${activeTaskConfig.group} · ${stepNumber}/${requiredShellTasks.length}`}
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">{activeTaskConfig.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{activeTaskConfig.description}</p>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">이번 단계에서 할 일</div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{activeGuidance.summary}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeGuidance.checklist.map((item) => (
                    <span key={item} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  지금 단계가 끝나면 아래의 다음 단계만 열립니다. 선택 단계는 필요할 때만 건너뛸 수 있습니다.
                </p>
                {currentStepBlocker ? (
                  <p className="mt-2 text-xs leading-5 text-amber-700">{currentStepBlocker}</p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-2">
              <button
                type="button"
                onClick={() => previousTask && goToTask(previousTask.id)}
                disabled={!previousTask}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                이전
              </button>
              {primaryNextTask ? (
                <button
                  type="button"
                  onClick={() => goToTask(primaryNextTask.id)}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {primaryNextTask.cta}
                </button>
              ) : null}
              {optionalNextTasks.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => goToTask(option.id)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  {option.cta}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={activeTask.startsWith("console:") ? "" : "hidden"}>
          <VentureConsoleActions
            activeTask={activeConsoleTask}
            onActiveTaskChange={handleConsoleTaskChange}
            onWorkflowStatusChange={setConsoleStatus}
            showSidebar={false}
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
            activeTask={activeWorkbenchTask}
            onActiveTaskChange={handleWorkbenchTaskChange}
            showSidebar={false}
          />
        </div>
      </div>
    </section>
  );
}
