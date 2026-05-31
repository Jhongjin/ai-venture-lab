type Step2ScoreHandoffBridgeProps = {
  activeProductSurfaceLabel: string;
  currentScore: number;
  isScoreEvaluationSaved: boolean;
  scoreDecisionLabel: string;
};

export function Step2ScoreHandoffBridge({
  activeProductSurfaceLabel,
  currentScore,
  isScoreEvaluationSaved,
  scoreDecisionLabel,
}: Step2ScoreHandoffBridgeProps) {
  return (
    <div className="mt-5 border border-slate-200 bg-slate-50 p-4" data-smoke="step2-score-handoff-bridge">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">저장 후 쓰임</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">사업성 평가는 STEP 3 검증 계획의 기준입니다</h3>
        </div>
        <span className={`avl-pill ${isScoreEvaluationSaved ? "avl-pill-success" : "avl-pill-neutral"}`}>
          {isScoreEvaluationSaved ? "저장 완료" : "저장 전"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">결과물 형태</div>
          <p className="mt-1 text-sm leading-5 text-slate-700">{activeProductSurfaceLabel}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">AI 평가 기준</div>
          <p className="mt-1 text-sm leading-5 text-slate-700">
            {currentScore}점 · {scoreDecisionLabel}
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">다음 사용처</div>
          <p className="mt-1 text-sm leading-5 text-slate-700">저장한 평가를 바탕으로 검증 계획과 시장 점검 기준을 잡습니다.</p>
        </div>
      </div>
    </div>
  );
}
