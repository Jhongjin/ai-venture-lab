type RecommendedIdeaHeaderProps = {
  gateBadgeClassName?: string | null;
  gateLabel?: string | null;
  name: string;
  oneLiner: string;
};

export function RecommendedIdeaHeader({
  gateBadgeClassName,
  gateLabel,
  name,
  oneLiner,
}: RecommendedIdeaHeaderProps) {
  return (
    <>
      <div data-smoke="recommended-idea-header" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">AI가 먼저 고른 아이디어</div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{name}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            이 한 건만 확인하고 저장하면 다음 단계가 열립니다.
          </p>
        </div>
        {gateBadgeClassName && gateLabel ? <span className={gateBadgeClassName}>{gateLabel}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-700">{oneLiner}</p>
    </>
  );
}
