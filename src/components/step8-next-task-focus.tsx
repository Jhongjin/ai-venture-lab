"use client";

type Step8NextTaskFocusProps = {
  nextTaskCode: string | null;
  nextTaskTitle: string | null;
};

export function Step8NextTaskFocus({ nextTaskCode, nextTaskTitle }: Step8NextTaskFocusProps) {
  if (!nextTaskTitle) {
    return null;
  }

  return (
    <div data-smoke="step8-next-task-focus" className="mt-4 border border-blue-200 bg-blue-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 끝낼 작업</div>
      <div className="mt-2 text-sm font-semibold text-slate-950">
        {nextTaskCode ? `${nextTaskCode} ` : ""}
        {nextTaskTitle}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        전체 진행표는 확인용입니다. 이 작업의 완료 보고만 반영하면 다음 판단으로 넘어갑니다.
      </p>
    </div>
  );
}
