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
      <Step8NextTaskFocus nextTaskCode={nextTaskCode} nextTaskTitle={nextTaskTitle} />
      <Step8ProgressDetails items={items} />
    </section>
  );
}
