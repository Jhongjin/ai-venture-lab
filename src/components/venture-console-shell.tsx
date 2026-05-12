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
import { VentureConsoleActions, type ConsoleActionTask } from "@/components/venture-console-actions";
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
const shellTaskGroups = ["시작", "검증", "제작", "출시 후"] as const;

const shellTasks: Array<{
  id: ShellTask;
  label: string;
  description: string;
  group: (typeof shellTaskGroups)[number];
  icon: typeof UserRound;
}> = [
  {
    id: "console:auth",
    label: "로그인",
    description: "이메일로 접속",
    group: "시작",
    icon: UserRound,
  },
  {
    id: "console:workspace",
    label: "팀 공간",
    description: "함께 보는 범위",
    group: "시작",
    icon: Users,
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
    summary: "이메일 주소로 접속 링크를 받아 안전하게 들어옵니다. 별도 인증키를 다루지 않아도 됩니다.",
    checklist: ["이메일 입력", "받은 메일의 로그인 링크 열기", "이 화면에 로그인 상태가 표시되는지 확인"],
  },
  "console:workspace": {
    summary: "개인 기록을 팀 단위 공간에 묶어 함께 볼 수 있는 범위를 정합니다.",
    checklist: ["팀 공간 생성 또는 선택", "내 기록 연결 여부 확인", "함께 볼 사람만 추가"],
  },
  "console:extract": {
    summary: "회의록, 대화, 메모에서 앱 후보와 검증 계획을 자동으로 뽑아냅니다.",
    checklist: [
      "대화 원문 붙여넣기",
      "후보 발굴 실행",
      "후보 비교 매트릭스와 게이트 확인",
      "발굴 리포트 저장",
      "좋은 후보를 아이디어로 등록",
    ],
  },
  "console:idea": {
    summary: "바로 제작으로 들어가지 말고 문제, 구매자, 증거, 리스크를 먼저 짧게 남깁니다.",
    checklist: ["이름과 한 줄 설명 입력", "구매자와 대상 사용자 구분", "다음에 확인할 증거 기록"],
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

function recommendNextTask({
  activeTask,
  ideaCount,
  runCount,
  artifactCount,
}: {
  activeTask: ShellTask;
  ideaCount: number;
  runCount: number;
  artifactCount: number;
}) {
  if (ideaCount === 0 && activeTask.startsWith("workbench:")) {
    return shellTasks.find((task) => task.id === "console:idea") ?? null;
  }

  const nextByTask: Partial<Record<ShellTask, ShellTask>> = {
    "console:auth": "console:workspace",
    "console:workspace": "console:extract",
    "console:extract": "console:idea",
    "console:idea": ideaCount > 0 ? "workbench:select" : "console:idea",
    "workbench:select": "workbench:score",
    "workbench:score": "workbench:risk",
    "workbench:risk": "workbench:experiment",
    "workbench:experiment": "workbench:decision",
    "workbench:decision": artifactCount > 0 ? "workbench:development" : "workbench:artifacts",
    "workbench:artifacts": "workbench:development",
    "workbench:development": runCount > 0 ? "workbench:launch" : "workbench:orchestration",
    "workbench:orchestration": "workbench:launch",
    "workbench:launch": "workbench:learning",
    "workbench:learning": "console:idea",
  };
  const nextId = nextByTask[activeTask];

  return shellTasks.find((task) => task.id === nextId) ?? null;
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
  const [activeTask, setActiveTask] = useState<ShellTask>("console:idea");
  const [ideas, setIdeas] = useState(initialIdeas);
  const [risks, setRisks] = useState(initialRisks);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [orchestrationRuns, setOrchestrationRuns] = useState(initialOrchestrationRuns);
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [implementationTasks, setImplementationTasks] = useState(initialImplementationTasks);
  const [telemetryEvents, setTelemetryEvents] = useState(initialTelemetryEvents);
  const handleConsoleTaskChange = useCallback((task: ConsoleActionTask) => {
    setActiveTask(`console:${task}`);
  }, []);
  const handleWorkbenchTaskChange = useCallback((task: WorkbenchTask) => {
    setActiveTask(`workbench:${task}`);
  }, []);
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
      setActiveTask("workbench:select");
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
  }, []);
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
  const recommendedTask = recommendNextTask({
    activeTask,
    ideaCount,
    runCount,
    artifactCount,
  });
  const activeGuidance = taskGuidance[activeTask];
  const taskStatuses: Record<ShellTask, string> = {
    "console:auth": "접근",
    "console:workspace": "팀",
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

  return (
    <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:self-start">
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">AI Venture Lab</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">의사결정 흐름</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            아이디어를 접수하고, 검증하고, 제작과 출시 판단까지 한 단계씩 진행합니다.
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
                  onClick={() => setActiveTask("workbench:select")}
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

        {shellTaskGroups.map((group) => (
          <div key={group} className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{group}</div>
            <div className="grid gap-2">
              {shellTasks
                .filter((task) => task.group === group)
                .map((task) => {
                  const Icon = task.icon;
                  const isActive = activeTask === task.id;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setActiveTask(task.id)}
                      aria-current={isActive ? "step" : undefined}
                      className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3 text-left transition ${
                        isActive
                          ? "border-blue-300 bg-blue-50 text-blue-950"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isActive ? "bg-blue-600 text-white" : "bg-white text-slate-700 shadow-sm"
                        }`}
                      >
                        {shellTasks.findIndex((item) => item.id === task.id) + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <Icon size={15} />
                          {task.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
                      </span>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-semibold ${
                          isActive ? "bg-white text-blue-700" : "bg-white text-slate-600"
                        }`}
                      >
                        {taskStatuses[task.id]}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
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
                    {activeTaskConfig.group}
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
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => previousTask && setActiveTask(previousTask.id)}
                disabled={!previousTask}
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => recommendedTask && setActiveTask(recommendedTask.id)}
                disabled={!recommendedTask}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {recommendedTask ? `추천 다음: ${recommendedTask.label}` : "다음 작업"}
              </button>
            </div>
          </div>
        </div>

        <div className={activeTask.startsWith("console:") ? "" : "hidden"}>
          <VentureConsoleActions
            activeTask={activeConsoleTask}
            onActiveTaskChange={handleConsoleTaskChange}
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
