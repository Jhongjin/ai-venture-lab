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
        실제 실행은 STEP 7 또는 외부 도구에서 이어갑니다. 전체 진행표는 확인용이고, 여기서는 완료 보고 반영 여부만 봅니다.
      </p>
    </div>
  );
}
