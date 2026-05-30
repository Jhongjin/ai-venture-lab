"use client";

import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type Step8SyncBriefProps = {
  checkedText: string;
  outcomeSentence: string;
  reviewRows: ReadonlyArray<WorkbenchReviewGridRow>;
};

export function Step8SyncBrief({ checkedText, outcomeSentence, reviewRows }: Step8SyncBriefProps) {
  return (
    <div data-smoke="step8-sync-brief" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">자동 반영 요약</div>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{outcomeSentence}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">최근 확인: {checkedText}</p>
      <details data-smoke="step8-sync-review-details" className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-emerald-950">자동 반영 세부 보기</summary>
        <div className="mt-3">
          <WorkbenchReviewGrid dataSmoke="step8-sync-review" rows={reviewRows} variant="emerald" />
        </div>
      </details>
    </div>
  );
}
