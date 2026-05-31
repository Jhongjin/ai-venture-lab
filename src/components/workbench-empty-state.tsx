type WorkbenchEmptyStateProps = {
  hasSelectableIdeas: boolean;
  onSelectIdeas: () => void;
};

export function WorkbenchEmptyState({ hasSelectableIdeas, onSelectIdeas }: WorkbenchEmptyStateProps) {
  return (
    <section className="avl-card p-6">
      <h2 className="text-xl font-semibold text-slate-950">
        {hasSelectableIdeas ? "이어갈 아이디어를 선택하세요" : "메모를 붙여넣으면 AI가 아이디어를 정리합니다"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {hasSelectableIdeas
          ? "저장된 아이디어가 있습니다. 검토 목록에서 한 건을 고르면 저장된 단계부터 이어집니다."
          : "회의 메모, GPT 대화, 자동화하고 싶은 업무를 그대로 넣으세요. 저장 전에는 다음 단계가 열리지 않습니다."}
      </p>
      <div className="mt-5">
        <button type="button" className="avl-btn avl-btn-primary px-4" onClick={onSelectIdeas}>
          {hasSelectableIdeas ? "검토 아이디어 보기" : "메모 붙여넣고 AI 정리하기"}
        </button>
      </div>
    </section>
  );
}
