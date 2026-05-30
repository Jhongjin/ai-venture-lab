type IdeaExtractionWorkAreaHeaderProps = {
  filledGeneratedIdeaCount: number;
  hasGeneratedIdeaSlots: boolean;
  hasIdeaSourceInput: boolean;
  keptGeneratedIdeaCount: number;
  trimmedIdeaSourceLength: number;
};

export function IdeaExtractionWorkAreaHeader({
  filledGeneratedIdeaCount,
  hasGeneratedIdeaSlots,
  hasIdeaSourceInput,
  keptGeneratedIdeaCount,
  trimmedIdeaSourceLength,
}: IdeaExtractionWorkAreaHeaderProps) {
  return (
    <div data-smoke="idea-extraction-work-area-header" className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-950">
          {hasGeneratedIdeaSlots ? "AI가 도출한 후보 3칸" : "입력칸에 내용 붙여넣기"}
        </h3>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          {hasGeneratedIdeaSlots
            ? "좋은 후보는 킵해두세요. 다른 후보를 더 확인하면 킵하지 않은 칸만 새로 채워집니다."
            : "여기만 채우면 됩니다. 회의 메모, 아이디어, GPT 대화, 자동화하고 싶은 업무를 그대로 넣으세요."}
        </p>
      </div>
      <div className="avl-pill avl-pill-neutral">
        {hasGeneratedIdeaSlots
          ? `킵 ${keptGeneratedIdeaCount}/${filledGeneratedIdeaCount}`
          : hasIdeaSourceInput
            ? `${trimmedIdeaSourceLength}자 입력됨`
            : "입력 대기"}
      </div>
    </div>
  );
}
