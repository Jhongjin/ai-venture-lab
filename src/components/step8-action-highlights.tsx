"use client";

import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type Step8ActionHighlightsProps = {
  decisionSentence: string;
  judgmentQuestion: string;
  nextJudgmentBrief: string;
  oneSentenceOutcome: string;
  primaryActionDetail: string;
  primaryActionText: string;
  reviewRows: ReadonlyArray<WorkbenchReviewGridRow>;
};

export function Step8ActionHighlights({
  decisionSentence,
  judgmentQuestion,
  nextJudgmentBrief,
  oneSentenceOutcome,
  primaryActionDetail,
  primaryActionText,
  reviewRows,
}: Step8ActionHighlightsProps) {
  return (
    <>
      <div data-smoke="step8-primary-action-now" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">지금 확인</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{primaryActionText}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{primaryActionDetail}</p>
      </div>
      <details data-smoke="step8-simple-review-details" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-blue-950">
          요약 보기
        </summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div data-smoke="step8-one-sentence-outcome" className="border border-blue-100 bg-blue-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">한 줄 결론</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{oneSentenceOutcome}</p>
          </div>
          <div data-smoke="step8-next-judgment-brief" className="border border-blue-100 bg-blue-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">판단 질문</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{judgmentQuestion}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{nextJudgmentBrief}</p>
          </div>
        </div>
        <div className="mt-3">
          <WorkbenchReviewGrid dataSmoke="step8-simple-review" detailTone="soft" rows={reviewRows} variant="blue" />
        </div>
        <div data-smoke="step8-external-completion-bridge" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
            완료 보고 후
          </div>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
            완료된 것, 이어 할 것, 지금 판단만 봅니다.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            완료 보고가 들어오면 요약이 갱신됩니다. 진행표는 필요할 때만 엽니다.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">결정: {decisionSentence}</p>
        </div>
      </details>
    </>
  );
}
