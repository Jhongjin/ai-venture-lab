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
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 실제로 할 일</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{primaryActionText}</p>
      </div>
      <div data-smoke="step8-one-sentence-outcome" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">한 줄 결론</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{oneSentenceOutcome}</p>
      </div>
      <details data-smoke="step8-simple-review-details" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-blue-950">
          완료/다음/판단 설명 보기
        </summary>
        <div className="mt-3">
          <WorkbenchReviewGrid dataSmoke="step8-simple-review" detailTone="soft" rows={reviewRows} variant="blue" />
        </div>
      </details>
      <div data-smoke="step8-external-completion-bridge" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          외부 도구 완료 보고 후
        </div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
          이 화면에서 완료된 것, 다음 작업, 오늘 판단만 확인합니다.
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          자동 반영이 들어오면 아래 요약이 갱신되고, 자세한 진행표는 필요할 때만 엽니다.
        </p>
      </div>
      <div data-smoke="step8-next-judgment-brief" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 답할 질문</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{judgmentQuestion}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{nextJudgmentBrief}</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{primaryActionDetail}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">결정: {decisionSentence}</p>
    </>
  );
}
