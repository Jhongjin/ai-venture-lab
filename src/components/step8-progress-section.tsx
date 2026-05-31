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
      <Step8NextTaskFocus nextTaskCode={nextTaskCode} nextTaskTitle={nextTaskTitle} />
      <Step8ProgressDetails items={items} />
    </section>
  );
}
