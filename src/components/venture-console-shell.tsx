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
import type { CreditSummary } from "@/lib/billing";
import {
  buildVentureConsoleTaskStatuses,
  firstRunGuideSteps,
  buildVentureConsoleProgressState,
  getActiveConsoleTask,
  getActiveWorkbenchTask,
  getCurrentStepBlocker,
  getExecutiveFocus,
  getInitialShellTask,
  getNextTaskOptions,
  getShellTaskOrderLabel,
  primaryShellTaskSet,
  resolveVisibleShellTask,
  taskCanvasDetails,
  taskGuidance,
  type ShellTask,
  type ShellTaskGroup,
} from "@/lib/venture-console-shell-metadata";
import { upsertRecordById, upsertRecordsById } from "@/lib/workbench-list-utils";
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
    label: "아이디어 저장",
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
    label: "검증 자료 저장",
    description: "검증 자료",
    group: "제작",
    icon: ClipboardText,
  },
  {
    id: "workbench:development",
    label: "제작 패키지",
    description: "제작 패키지",
    group: "제작",
    icon: Code,
  },
  {
    id: "workbench:orchestration",
    label: "작업 순서 확인",
    description: "작업 순서",
    group: "제작",
    icon: Stack,
  },
  {
    id: "workbench:launch",
    label: "최종 실행",
    description: "연동/실행",
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
  initialCreditSummary,
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
  initialCreditSummary?: CreditSummary | null;
  source: "supabase" | "seed";
  initialView?: "ideas" | "deleted";
  initialTask?: WorkbenchTask;
  initialIdeaId?: string;
}) {
  const isClientReady = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);
  const initialShellTask = getInitialShellTask({ initialTask, initialView });
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
    canEnterLaunch: false,
    launchReadinessScore: 0,
    nextLaunchBlockerLabel: null,
    nextLaunchBlockerDetail: null,
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

      setter((current) => upsertRecordById(current, record));
    }

    function handleRecordListEvent<T extends { id: string }>(event: Event, setter: Dispatch<SetStateAction<T[]>>) {
      const records = (event as CustomEvent<T[]>).detail;

      if (!Array.isArray(records) || records.length === 0) {
        return;
      }

      setter((current) => upsertRecordsById(current, records));
    }

    function handleIdeaCreated(event: Event) {
      const { autoOpenWorkbench = true, ...record } = (event as CustomEvent<IdeaCreatedEventDetail>).detail ?? {};

      if (!record?.id) {
        return;
      }

      setIdeas((current) => upsertRecordById(current, record as Idea));

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
  const visibleTask = resolveVisibleShellTask({ activeTask, consoleStatus, ideaCount });
  const activeConsoleTask = getActiveConsoleTask(visibleTask);
  const activeWorkbenchTask = getActiveWorkbenchTask(visibleTask);
  const openRisks = risks.filter((risk) => risk.status.toLowerCase() === "open").length;
  const experimentCount = experiments.length;
  const decisionCount = decisions.length;
  const runCount = orchestrationRuns.length;
  const artifactCount = artifacts.length;
  const implementationTaskCount = implementationTasks.length;
  const completedImplementationTaskCount = implementationTasks.filter((task) => task.status === "done").length;
  const telemetryEventCount = telemetryEvents.length;
  const activeTaskIndex = shellTasks.findIndex((task) => task.id === visibleTask);
  const activeTaskConfig = shellTasks[activeTaskIndex] ?? shellTasks[0];
  const ActiveIcon = activeTaskConfig.icon;
  const nextTaskOptions = getNextTaskOptions({
    activeTask: visibleTask,
    ideaCount,
    canEnterExperiment: validationDocumentReadiness.canEnterExperiment,
    canEnterArtifacts: validationDocumentReadiness.canEnterArtifacts,
    canEnterDevelopment: validationDocumentReadiness.canEnterDevelopment,
    canEnterOrchestration: validationDocumentReadiness.canEnterOrchestration,
    canEnterLaunch: validationDocumentReadiness.canEnterLaunch,
  });
  const enabledNextTaskOptions = nextTaskOptions.filter((option) => !option.disabled);
  const primaryNextTask = nextTaskOptions.find((option) => option.variant === "primary") ?? null;
  const activeGuidance = taskGuidance[visibleTask];
  const currentStepBlocker = getCurrentStepBlocker({
    activeTask: visibleTask,
    consoleStatus,
    ideaCount,
  });
  const taskStatuses = buildVentureConsoleTaskStatuses({
    artifactCount,
    completedImplementationTaskCount,
    discardedIdeaCount,
    experimentCount,
    ideaCount,
    implementationTaskCount,
    launchReadiness: {
      canEnterLaunch: validationDocumentReadiness.canEnterLaunch,
      launchReadinessScore: validationDocumentReadiness.launchReadinessScore,
      nextLaunchBlockerLabel: validationDocumentReadiness.nextLaunchBlockerLabel,
    },
    openRisks,
    runCount,
    telemetryEventCount,
  });
  const executionStepTasks = shellTasks.filter((task) => primaryShellTaskSet.has(task.id));
  const executionStepIds = executionStepTasks.map((task) => task.id);
  const executionStepTotal = executionStepTasks.length;
  const completedTasks = shellTasks.filter((task) => visitedTaskIds.includes(task.id) && task.id !== visibleTask);
  const completedTaskIds = completedTasks.map((task) => task.id);
  const {
    activeExecutionStepIndex,
    completedRequiredTaskIds,
    progressCompletedCount,
    stepNumber,
    workflowProgress,
  } = buildVentureConsoleProgressState({
    activeTaskId: activeTaskConfig.id,
    completedTaskIds,
    executionStepIds,
  });
  const previousFlowTask = activeExecutionStepIndex > 0 ? executionStepTasks[activeExecutionStepIndex - 1] : null;
  const completedRequiredTasks = completedTasks.filter((task) => completedRequiredTaskIds.includes(task.id));
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
    experimentCount,
    decisionCount,
    artifactCount,
    implementationTaskCount,
    runCount,
    telemetryEventCount,
  });
  const showFirstRunGuide = visibleTask === "console:extract" && ideaCount === 0;

  function getTaskOrderLabel(task: (typeof shellTasks)[number]) {
    return getShellTaskOrderLabel({ executionStepIds, isOptional: task.optional, taskId: task.id });
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
              <span>완료 {progressCompletedCount}/{executionStepTotal}</span>
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
                {!activeTaskConfig.optional && stepNumber ? <span>완료 {progressCompletedCount}/{executionStepTotal}</span> : null}
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

              {showFirstRunGuide ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {firstRunGuideSteps.map((step) => (
                    <div key={step.title} className="border-l border-slate-200 pl-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {step.label}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-950">{step.title}</div>
                      <p className="mt-1 text-[12px] leading-5 text-slate-600">{step.detail}</p>
                    </div>
                  ))}
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
              initialCreditSummary={initialCreditSummary}
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
      </div>
    </section>
  );
}
