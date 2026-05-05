"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Beaker, ClipboardList, Flag, Layers3, Rocket, Save, ShieldCheck, Sparkles, UserRound, Users } from "lucide-react";

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
    id: "console:extract",
    label: "아이디어 발굴",
    description: "후보와 검증 계획",
    group: "운영 준비",
    icon: Sparkles,
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

const taskGuidance: Record<ShellTask, { summary: string; checklist: string[] }> = {
  "console:auth": {
    summary: "매직 링크 또는 기존 비밀번호로 운영자 세션을 먼저 확보합니다.",
    checklist: ["로그인 상태가 표시되는지 확인", "이메일 제한 오류가 나면 기존 비밀번호 로그인 사용"],
  },
  "console:workspace": {
    summary: "개인 기록을 팀 단위 경계로 묶고, 함께 볼 사람의 권한을 정합니다.",
    checklist: ["워크스페이스 생성 또는 선택", "개인 기록 연결 여부 확인", "필요한 멤버만 추가"],
  },
  "console:extract": {
    summary: "흩어진 대화와 메모에서 앱 후보, 검증 점수, 핵심 가설, 7일 실험, 중단 기준을 함께 만듭니다.",
    checklist: ["대화 원문 붙여넣기", "후보 발굴 실행", "검증 점수와 리스크 확인", "좋은 후보를 입력 폼으로 보내기"],
  },
  "console:idea": {
    summary: "바로 개발하지 말고 문제, 구매자, 증거, 리스크를 먼저 원시 기록으로 남깁니다.",
    checklist: ["이름과 한 줄 설명 입력", "구매자와 대상 사용자 구분", "다음에 확인할 증거 기록"],
  },
  "workbench:select": {
    summary: "평가할 아이디어를 하나 고른 뒤 실행 단계를 진행합니다.",
    checklist: ["내 기록 또는 전체 필터 확인", "편집 가능 여부 확인", "점수화할 아이디어 선택"],
  },
  "workbench:score": {
    summary: "문제 강도, 빈도, 도달성, 지불 의향, MVP 속도, 차별성, 리스크 감점을 숫자로 맞춥니다.",
    checklist: ["단계와 판단 상태 선택", "증거 공백 제거", "점수 저장"],
  },
  "workbench:risk": {
    summary: "출시를 막을 수 있는 개인정보, 규제, 운영 책임, 보안 리스크를 먼저 밖으로 꺼냅니다.",
    checklist: ["리스크 제목과 영역 입력", "심각도 선택", "완화 방안 또는 수용 조건 기록"],
  },
  "workbench:decision": {
    summary: "점수만으로 결정하지 않고, 왜 진행/전환/중단하는지 근거를 남깁니다.",
    checklist: ["현재 판단이 맞는지 확인", "판단 근거 작성", "판단 기록 저장"],
  },
  "workbench:experiment": {
    summary: "가장 작은 검증 실험 하나를 만들고 성공 기준을 숫자나 관찰 조건으로 정합니다.",
    checklist: ["실험 이름 입력", "성공 지표 작성", "상태를 진행 중/완료로 업데이트"],
  },
  "workbench:orchestration": {
    summary: "전략, 리서치, 제품, 디자인, 개발, QA, 디버깅, 보안, 출시 역할을 실행 기록으로 남깁니다.",
    checklist: ["런북 만들기", "각 역할 산출물 작성", "완료된 단계 상태 변경"],
  },
  "workbench:artifacts": {
    summary: "브리프, PRD, MVP 명세, 출시 체크리스트를 저장하고 승인 상태를 관리합니다.",
    checklist: ["필요 산출물 저장", "PRD와 MVP 명세 승인", "상태 메모 작성"],
  },
  "workbench:launch": {
    summary: "출시 준비도에서 남은 차단 항목을 확인하고 최종 판단을 기록합니다.",
    checklist: ["100%가 아닌 항목 확인", "높은 리스크 종료 또는 수용", "최종 판단 기록"],
  },
};

function recommendNextTask({
  activeTask,
  ideaCount,
  openRisks,
  experimentCount,
  runCount,
  artifactCount,
}: {
  activeTask: ShellTask;
  ideaCount: number;
  openRisks: number;
  experimentCount: number;
  runCount: number;
  artifactCount: number;
}) {
  if (ideaCount === 0 && activeTask !== "console:idea") {
    return shellTasks.find((task) => task.id === "console:idea") ?? null;
  }

  const nextByTask: Partial<Record<ShellTask, ShellTask>> = {
    "console:auth": "console:workspace",
    "console:workspace": "console:extract",
    "console:extract": "console:idea",
    "console:idea": ideaCount > 0 ? "workbench:score" : "console:idea",
    "workbench:select": "workbench:score",
    "workbench:score": "workbench:risk",
    "workbench:risk": openRisks > 0 ? "workbench:decision" : "workbench:experiment",
    "workbench:decision": experimentCount > 0 ? "workbench:orchestration" : "workbench:experiment",
    "workbench:experiment": runCount > 0 ? "workbench:artifacts" : "workbench:orchestration",
    "workbench:orchestration": artifactCount > 0 ? "workbench:launch" : "workbench:artifacts",
    "workbench:artifacts": "workbench:launch",
    "workbench:launch": "console:idea",
  };
  const nextId = nextByTask[activeTask];

  return shellTasks.find((task) => task.id === nextId) ?? null;
}

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
  const experimentCount = initialExperiments.length;
  const runCount = initialOrchestrationRuns.length;
  const artifactCount = initialArtifacts.length;
  const activeWork = initialExperiments.filter((experiment) => experiment.status !== "done").length +
    initialOrchestrationRuns.filter((run) => ["planned", "running", "blocked"].includes(run.status)).length;
  const activeTaskIndex = shellTasks.findIndex((task) => task.id === activeTask);
  const activeTaskConfig = shellTasks[activeTaskIndex] ?? shellTasks[0];
  const ActiveIcon = activeTaskConfig.icon;
  const previousTask = activeTaskIndex > 0 ? shellTasks[activeTaskIndex - 1] : null;
  const recommendedTask = recommendNextTask({
    activeTask,
    ideaCount,
    openRisks,
    experimentCount,
    runCount,
    artifactCount,
  });
  const activeGuidance = taskGuidance[activeTask];
  const taskStatuses: Record<ShellTask, string> = {
    "console:auth": "접근",
    "console:workspace": "팀",
    "console:extract": "발굴",
    "console:idea": "입력",
    "workbench:select": `${ideaCount}개`,
    "workbench:score": "점수",
    "workbench:risk": `${openRisks}개`,
    "workbench:decision": "기록",
    "workbench:experiment": `${experimentCount}개`,
    "workbench:orchestration": `${runCount}개`,
    "workbench:artifacts": `${artifactCount}개`,
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
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">입력 가이드</div>
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
