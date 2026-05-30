export function IdeaExtractionSectionHeader() {
  return (
    <div
      data-smoke="idea-extraction-section-header"
      className="border border-slate-200 bg-white px-5 py-4 lg:flex lg:items-end lg:justify-between"
    >
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">아이디어 도출</div>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">아이디어를 붙이면 AI가 사업 후보를 정리합니다</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          메모를 넣으면 AI가 후보 아이디어, 결과물 형태, 개발 방식을 먼저 정리합니다.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 lg:mt-0">
        <span className="avl-pill avl-pill-info px-3 py-2">AI가 먼저 정리</span>
        <span className="avl-pill avl-pill-neutral px-3 py-2">저장 후 다음 단계</span>
      </div>
    </div>
  );
}
