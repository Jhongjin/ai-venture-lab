type Step5BuildDirectionSummaryProps = {
  decisionSentence: string;
  deliveryLabel: string;
};

export function Step5BuildDirectionSummary({ decisionSentence, deliveryLabel }: Step5BuildDirectionSummaryProps) {
  return (
    <div className="mt-5 border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="avl-kicker">STEP 1에서 정한 방향</div>
          <h4 className="mt-2 text-base font-semibold text-slate-950">{decisionSentence}</h4>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            결과물 형태와 개발 방식은 분리해 저장됩니다. AI가 이 기준으로 기획서, 디자인, 기술 방향, 작업
            순서를 묶고, 실제 파일 받기와 외부 도구 연동은 마지막 단계에서 열립니다.
          </p>
        </div>
        <span className="avl-pill avl-pill-info">{deliveryLabel}</span>
      </div>
    </div>
  );
}
