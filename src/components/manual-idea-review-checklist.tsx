export function ManualIdeaReviewChecklist() {
  return (
    <div data-smoke="manual-idea-review-checklist" className="avl-band p-4 text-slate-900">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">사람이 확인할 포인트</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        AI가 나머지를 채웠습니다. 저장 전에는 아래 3가지만 빠르게 보면 됩니다.
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
        <li>- 이름이 짧고 기억하기 쉬운지</li>
        <li>- 한 줄 설명에 누구의 어떤 문제를 어떻게 줄이는지가 보이는지</li>
        <li>- 추가 입력은 보완할 근거가 있을 때만 수정</li>
      </ul>
    </div>
  );
}
