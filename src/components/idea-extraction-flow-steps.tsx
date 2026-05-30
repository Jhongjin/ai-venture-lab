type IdeaExtractionFlowStepsProps = {
  hasGeneratedIdeaSlots: boolean;
};

export function IdeaExtractionFlowSteps({ hasGeneratedIdeaSlots }: IdeaExtractionFlowStepsProps) {
  return (
    <div
      data-smoke="idea-extraction-flow-steps"
      className="grid gap-2 border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 md:grid-cols-3"
    >
      <span>
        <strong className="text-slate-950">1.</strong>{" "}
        {hasGeneratedIdeaSlots ? "좋은 후보를 킵합니다." : "정리 안 된 메모를 넣습니다."}
      </span>
      <span>
        <strong className="text-slate-950">2.</strong>{" "}
        {hasGeneratedIdeaSlots ? "나머지 후보만 새로 확인합니다." : "AI가 후보 3개와 만들 방식까지 정리합니다."}
      </span>
      <span>
        <strong className="text-slate-950">3.</strong> 저장하면 사업성 평가로 이어집니다.
      </span>
    </div>
  );
}
