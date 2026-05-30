type RecommendedIdeaRationaleProps = {
  nextAction?: string | null;
  summary: string;
};

export function RecommendedIdeaRationale({ nextAction, summary }: RecommendedIdeaRationaleProps) {
  return (
    <div data-smoke="recommended-idea-rationale" className="mt-4 border-t border-slate-200 pt-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">선정 이유</div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{summary}</p>
      {nextAction ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-900">다음:</span> {nextAction}
        </p>
      ) : null}
    </div>
  );
}
