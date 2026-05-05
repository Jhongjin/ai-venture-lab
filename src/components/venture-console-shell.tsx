"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Beaker, ClipboardList, Flag, Layers3, Rocket, Save, ShieldCheck, UserRound, Users } from "lucide-react";

import { IdeaWorkbench, type WorkbenchTask } from "@/components/idea-workbench";
import { VentureConsoleActions, type ConsoleActionTask } from "@/components/venture-console-actions";
import type { Decision, Experiment, Idea, OrchestrationRun, Risk, VentureArtifact } from "@/lib/venture-data";

type ShellTask = `console:${ConsoleActionTask}` | `workbench:${WorkbenchTask}`;

const shellTasks: Array<{
  id: ShellTask;
  label: string;
  description: string;
  group: string;
  icon: typeof UserRound;
}> = [
  {
    id: "console:auth",
    label: "운영자 로그인",
    description: "접근 상태 확인",
    group: "운영 준비",
    icon: UserRound,
  },
  {
    id: "console:workspace",
    label: "워크스페이스",
    description: "팀 경계와 멤버십",
    group: "운영 준비",
    icon: Users,
  },
  {
    id: "console:idea",
    label: "새 아이디어",
    description: "원시 아이디어 접수",
    group: "운영 준비",
    icon: Save,
  },
  {
    id: "workbench:select",
    label: "아이디어 선택",
    description: "평가 대상 고르기",
    group: "아이디어 실행",
    icon: ClipboardList,
  },
  {
    id: "workbench:score",
    label: "점수화",
    description: "판단, 점수, 증거",
    group: "아이디어 실행",
    icon: Beaker,
  },
  {
    id: "workbench:risk",
    label: "리스크",
    description: "차단 요인 관리",
    group: "아이디어 실행",
    icon: Flag,
  },
  {
    id: "workbench:decision",
    label: "판단 기록",
    description: "진행/전환/중단 근거",
    group: "아이디어 실행",
    icon: ShieldCheck,
  },
  {
    id: "workbench:experiment",
    label: "실험",
    description: "검증 계획",
    group: "아이디어 실행",
    icon: Beaker,
  },
  {
    id: "workbench:orchestration",
    label: "오케스트레이션",
    description: "전략부터 출시까지",
    group: "아이디어 실행",
    icon: Layers3,
  },
  {
    id: "workbench:artifacts",
    label: "산출물",
    description: "브리프, PRD, MVP",
    group: "아이디어 실행",
    icon: ClipboardList,
  },
  {
    id: "workbench:launch",
    label: "출시 준비도",
    description: "게이트 통과 상태",
    group: "아이디어 실행",
    icon: Rocket,
  },
];

export function VentureConsoleShell({
  initialIdeas,
  initialRisks,
  initialDecisions,
  initialExperiments,
  initialOrchestrationRuns,
  initialArtifacts,
  source,
}: {
  initialIdeas: Idea[];
  initialRisks: Risk[];
  initialDecisions: Decision[];
  initialExperiments: Experiment[];
  initialOrchestrationRuns: OrchestrationRun[];
  initialArtifacts: VentureArtifact[];
  source: "supabase" | "seed";
}) {
  const [activeTask, setActiveTask] = useState<ShellTask>("console:idea");
  const [createdIdeaIds, setCreatedIdeaIds] = useState<Set<string>>(() => new Set());
  const handleConsoleTaskChange = useCallback((task: ConsoleActionTask) => {
    setActiveTask(`console:${task}`);
  }, []);
  const handleWorkbenchTaskChange = useCallback((task: WorkbenchTask) => {
    setActiveTask(`workbench:${task}`);
  }, []);
  useEffect(() => {
    function handleIdeaCreated(event: Event) {
      const createdIdea = (event as CustomEvent<Idea>).detail;

      if (!createdIdea?.id) {
        return;
      }

      setCreatedIdeaIds((current) => {
        const next = new Set(current);
        next.add(createdIdea.id);
        return next;
      });
      setActiveTask("workbench:score");
    }

    window.addEventListener("venture:idea-created", handleIdeaCreated);

    return () => {
      window.removeEventListener("venture:idea-created", handleIdeaCreated);
    };
  }, []);
  const activeConsoleTask = activeTask.startsWith("console:")
    ? (activeTask.replace("console:", "") as ConsoleActionTask)
    : "idea";
  const activeWorkbenchTask = activeTask.startsWith("workbench:")
    ? (activeTask.replace("workbench:", "") as WorkbenchTask)
    : "select";
  const ideaCount = useMemo(() => {
    const ids = new Set(initialIdeas.map((idea) => idea.id));

    for (const id of createdIdeaIds) {
      ids.add(id);
    }

    return ids.size;
  }, [createdIdeaIds, initialIdeas]);
  const openRisks = initialRisks.filter((risk) => risk.status.toLowerCase() === "open").length;
  const highRisks = initialRisks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;
  const activeWork = initialExperiments.filter((experiment) => experiment.status !== "done").length +
    initialOrchestrationRuns.filter((run) => ["planned", "running", "blocked"].includes(run.status)).length;
  const activeTaskIndex = shellTasks.findIndex((task) => task.id === activeTask);
  const activeTaskConfig = shellTasks[activeTaskIndex] ?? shellTasks[0];
  const ActiveIcon = activeTaskConfig.icon;
  const previousTask = activeTaskIndex > 0 ? shellTasks[activeTaskIndex - 1] : null;
  const nextTask = activeTaskIndex >= 0 && activeTaskIndex < shellTasks.length - 1 ? shellTasks[activeTaskIndex + 1] : null;
  const taskStatuses: Record<ShellTask, string> = {
    "console:auth": "접근",
    "console:workspace": "팀",
    "console:idea": "입력",
    "workbench:select": `${ideaCount}개`,
    "workbench:score": "점수",
    "workbench:risk": `${openRisks}개`,
    "workbench:decision": "기록",
    "workbench:experiment": `${initialExperiments.length}개`,
    "workbench:orchestration": `${initialOrchestrationRuns.length}개`,
    "workbench:artifacts": `${initialArtifacts.length}개`,
    "workbench:launch": highRisks > 0 ? "점검" : "확인",
  };

  return (
    <section className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:self-start">
        <div className="mb-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">AI Venture Lab</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">실행 메뉴</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">왼쪽에서 작업을 고르고 오른쪽에서만 입력합니다.</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {[
            ["아이디어", String(ideaCount)],
            ["리스크", String(openRisks)],
            ["고위험", String(highRisks)],
            ["작업", String(activeWork)],
            ["산출물", String(initialArtifacts.length)],
            ["데이터", source === "supabase" ? "DB" : "시드"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
            </div>
          ))}
        </div>

        {["운영 준비", "아이디어 실행"].map((group) => (
          <div key={group} className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{group}</div>
            <div className="grid gap-2">
              {shellTasks
                .filter((task) => task.group === group)
                .map((task, index) => {
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
                        {group === "운영 준비" ? index + 1 : index + 4}
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
                onClick={() => nextTask && setActiveTask(nextTask.id)}
                disabled={!nextTask}
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                다음 작업
              </button>
            </div>
          </div>
        </div>

        <div className={activeTask.startsWith("console:") ? "" : "hidden"}>
          <VentureConsoleActions
            activeTask={activeConsoleTask}
            onActiveTaskChange={handleConsoleTaskChange}
            showSidebar={false}
          />
        </div>
        <div className={activeTask.startsWith("workbench:") ? "" : "hidden"}>
          <IdeaWorkbench
            initialIdeas={initialIdeas}
            initialRisks={initialRisks}
            initialDecisions={initialDecisions}
            initialExperiments={initialExperiments}
            initialOrchestrationRuns={initialOrchestrationRuns}
            initialArtifacts={initialArtifacts}
            activeTask={activeWorkbenchTask}
            onActiveTaskChange={handleWorkbenchTaskChange}
            showSidebar={false}
          />
        </div>
      </div>
    </section>
  );
}
