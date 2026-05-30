"use client";

type VentureConsoleStartTaskId = "auth" | "workspace" | "extract" | "idea";

export type VentureConsoleStartGuideTask = {
  id: VentureConsoleStartTaskId;
  label: string;
  description: string;
  status: string;
};

type VentureConsoleStartGuideProps = {
  activeTask: VentureConsoleStartTaskId;
  onTaskSelect: (task: VentureConsoleStartTaskId) => void;
  tasks: VentureConsoleStartGuideTask[];
};

export function VentureConsoleStartGuide({ activeTask, onTaskSelect, tasks }: VentureConsoleStartGuideProps) {
  return (
    <aside className="avl-card p-5 lg:sticky lg:top-6 lg:self-start">
      <div className="mb-4">
        <div className="avl-kicker mb-3">시작 안내</div>
        <h2 className="text-lg font-semibold text-slate-950">시작 준비</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">AI가 초안을 만들고, 필요한 순간에만 사용자가 보완합니다.</p>
      </div>
      <div className="grid gap-2">
        {tasks.map((task, index) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onTaskSelect(task.id)}
            aria-current={activeTask === task.id ? "step" : undefined}
            className={`grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border p-3 text-left transition ${
              activeTask === task.id
                ? "border-slate-950 bg-slate-950 text-white shadow-none"
                : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className={`avl-step-dot h-8 w-8 text-sm ${activeTask === task.id ? "bg-white text-slate-950" : ""}`}>
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{task.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.description}</span>
            </span>
            <span className={`avl-pill ${activeTask === task.id ? "bg-white/10 text-white" : "avl-pill-neutral"}`}>
              {task.status}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
