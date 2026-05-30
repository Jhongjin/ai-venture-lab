type IdeaExtractionReplaySummaryProps = {
  aiOnlyCount: number;
  consensusCount: number;
  note: string;
};

export function IdeaExtractionReplaySummary({
  aiOnlyCount,
  consensusCount,
  note,
}: IdeaExtractionReplaySummaryProps) {
  return (
    <details data-smoke="idea-extraction-replay-summary" className="border-t border-slate-200 pt-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">AI 정리 다시 보기 내역</summary>
      <div className="mt-3 border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">비교 결과</div>
            <p className="mt-1 text-sm leading-5 text-slate-700">추천이 어색할 때만 보면 됩니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="avl-pill avl-pill-neutral">공통 {consensusCount}</span>
            <span className="avl-pill avl-pill-neutral">AI만 {aiOnlyCount}</span>
          </div>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-600">{note}</p>
      </div>
    </details>
  );
}
