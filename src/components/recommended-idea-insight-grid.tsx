type RecommendedIdeaInsightGridProps = {
  productSurfaceLabel: string;
};

export function RecommendedIdeaInsightGrid({ productSurfaceLabel }: RecommendedIdeaInsightGridProps) {
  return (
    <div data-smoke="recommended-idea-insight-grid" className="mt-4 grid gap-px bg-slate-200 md:grid-cols-4">
      <div className="bg-slate-50 px-3 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">선택 이유</div>
        <p className="mt-1 text-xs leading-5 text-slate-700">
          AI가 수요, 실행 가능성, 리스크를 비교해 먼저 검토할 아이디어로 골랐습니다.
        </p>
      </div>
      <div className="bg-slate-50 px-3 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">저장하면 생기는 것</div>
        <p className="mt-1 text-xs leading-5 text-slate-700">
          아이디어, 리스크, 사업성 평가 초안이 한 묶음으로 만들어집니다.
        </p>
      </div>
      <div className="bg-slate-50 px-3 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">결과물 형태</div>
        <p className="mt-1 text-xs leading-5 text-slate-700">
          {productSurfaceLabel} 기준으로 이후 문서를 맞춥니다.
        </p>
      </div>
      <div className="bg-slate-50 px-3 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">다음 단계</div>
        <p className="mt-1 text-xs leading-5 text-slate-700">
          저장 후에는 이 아이디어를 검증할 만한지 먼저 판단합니다.
        </p>
      </div>
    </div>
  );
}
