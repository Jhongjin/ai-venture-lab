"use client";

type Step8NextTaskFocusProps = {
  hasProgressItems: boolean;
  isAllTasksComplete: boolean;
  nextTaskCode: string | null;
  nextTaskTitle: string | null;
};

export function Step8NextTaskFocus({
  hasProgressItems,
  isAllTasksComplete,
  nextTaskCode,
  nextTaskTitle,
}: Step8NextTaskFocusProps) {
  if (!nextTaskTitle) {
    if (!hasProgressItems) {
      return null;
    }

    if (!isAllTasksComplete) {
      return (
        <div data-smoke="step8-no-next-task-review-focus" className="mt-4 border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">다음 제작 작업</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">상태 확인 필요</div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            다음 작업이 자동으로 잡히지 않았습니다. 막힘, 건너뜀, 상태 누락만 확인하고 STEP 7/외부 도구에서 이어가세요.
          </p>
        </div>
      );
    }

    return (
      <div data-smoke="step8-all-tasks-complete-focus" className="mt-4 border border-emerald-200 bg-emerald-50 p-3">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">다음 제작 작업</div>
        <div className="mt-2 text-sm font-semibold text-slate-950">남은 제작 작업 없음</div>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          새 작업보다 완료 근거와 오늘 판단만 확인합니다.
        </p>
      </div>
    );
  }

  return (
    <div data-smoke="step8-next-task-focus" className="mt-4 border border-blue-200 bg-blue-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 확인할 것</div>
      <div className="mt-2 text-sm font-semibold text-slate-950">
        {nextTaskCode ? `${nextTaskCode} ` : ""}
        {nextTaskTitle}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        실행은 STEP 7/외부 도구에서 계속합니다. 여기서는 완료 보고 반영만 봅니다.
      </p>
    </div>
  );
}
