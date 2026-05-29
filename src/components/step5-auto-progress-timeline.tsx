type Step5AutoProgressState = "idle" | "running" | "review" | "summary" | "saved";

type Step5AutoProgressStep = {
  detail: string;
  label: string;
};

type Step5AutoProgressTimelineProps = {
  activeStepIndex: number;
  flowState: Step5AutoProgressState;
  steps: ReadonlyArray<Step5AutoProgressStep>;
};

export function Step5AutoProgressTimeline({ activeStepIndex, flowState, steps }: Step5AutoProgressTimelineProps) {
  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-5">
      {steps.map((step, index) => {
        const isDone =
          flowState === "saved" ||
          flowState === "summary" ||
          flowState === "review" ||
          (flowState === "running" && index < activeStepIndex);
        const isRunning = flowState === "running" && index === activeStepIndex;
        const isActive = isDone || isRunning;

        return (
          <div
            key={step.label}
            className={`border p-4 ${
              isActive ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
            }`}
          >
            <div className={`text-xs font-semibold tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-500"}`}>
              {isDone ? "완료" : isRunning ? "진행 중" : `0${index + 1}`}
            </div>
            <div className="mt-2 text-sm font-semibold">{step.label}</div>
            <p className={`mt-2 text-sm leading-5 ${isActive ? "text-slate-200" : "text-slate-600"}`}>{step.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
