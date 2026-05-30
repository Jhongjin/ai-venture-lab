export function RecommendedIdeaEmptyState() {
  return (
    <section data-smoke="recommended-idea-empty-state" className="border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">다음에 보이는 것</div>
      <h3 className="mt-2 text-base font-semibold text-slate-950">아직 추천 아이디어가 없습니다</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
        <li>1. 왼쪽 입력칸에 아이디어를 붙여넣습니다.</li>
        <li>2. AI가 아이디어 한 건과 결과물 형태를 정리합니다.</li>
        <li>3. 마음에 들면 저장하고 사업성 평가로 넘어갑니다.</li>
      </ul>
    </section>
  );
}
