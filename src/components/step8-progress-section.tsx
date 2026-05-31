"use client";

import { Step8NextTaskFocus } from "@/components/step8-next-task-focus";
import { Step8ProgressDetails, type Step8ProgressItem } from "@/components/step8-progress-details";

export type { Step8ProgressItem };

type Step8ProgressSectionProps = {
  completedCount: number;
  items: ReadonlyArray<Step8ProgressItem>;
  nextTaskCode: string | null;
  nextTaskTitle: string | null;
  progressDetail: string;
  progressTitle: string;
  totalCount: number;
};

export function Step8ProgressSection({
  completedCount,
  items,
  nextTaskCode,
  nextTaskTitle,
  progressDetail,
  progressTitle,
  totalCount,
}: Step8ProgressSectionProps) {
  const hasProgressItems = items.length > 0;
  const isAllTasksComplete = totalCount > 0 && completedCount >= totalCount;
  const nextTaskSummary =
    nextTaskCode && nextTaskTitle
      ? `${nextTaskCode} ${nextTaskTitle}`
      : hasProgressItems
        ? isAllTasksComplete
          ? "남은 제작 작업 없음"
          : "상태 확인 필요"
        : "STEP 7에서 첫 작업 시작";

  return (
    <section data-smoke="step8-progress-section" className="mt-4 border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">진행 신호</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">{progressTitle}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{progressDetail}</p>
        </div>
        <span className="avl-pill avl-pill-success">
          완료 {completedCount}/{totalCount || 0}
        </span>
      </div>
      <div
        data-smoke="step8-progress-one-line-summary"
        className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
      >
        완료 {completedCount}/{totalCount || 0} · 다음 {nextTaskSummary}
      </div>
      {items.length === 0 ? (
        <div data-smoke="step8-empty-primary-action" className="mt-4 border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">아직 성과 없음</div>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
            먼저 STEP 7에서 연결 파일로 첫 제작 작업을 시작하세요.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            완료 보고가 들어온 뒤 이 화면은 완료된 것, 다음 작업, 오늘 판단만 보여줍니다.
          </p>
        </div>
      ) : null}
      <Step8NextTaskFocus
        hasProgressItems={hasProgressItems}
        isAllTasksComplete={isAllTasksComplete}
        nextTaskCode={nextTaskCode}
        nextTaskTitle={nextTaskTitle}
      />
      <Step8ProgressDetails items={items} />
    </section>
  );
}
