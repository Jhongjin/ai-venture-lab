type Step3ValidationGateBridgeProps = {
  hasSavedExperiment: boolean;
  hasMarketScanArtifact: boolean;
  isMarketScanLoading: boolean;
  isMarketScanOutdated: boolean;
};

function statusPillClass(isDone: boolean, isWarning = false) {
  if (isDone) {
    return "avl-pill avl-pill-success";
  }

  return isWarning ? "avl-pill avl-pill-warning" : "avl-pill avl-pill-neutral";
}

export function Step3ValidationGateBridge({
  hasSavedExperiment,
  hasMarketScanArtifact,
  isMarketScanLoading,
  isMarketScanOutdated,
}: Step3ValidationGateBridgeProps) {
  const marketScanDone = hasMarketScanArtifact && !isMarketScanOutdated;
  const marketScanStatus = isMarketScanLoading ? "정리 중" : marketScanDone ? "저장 완료" : isMarketScanOutdated ? "다시 필요" : "저장 전";

  return (
    <div className="mb-5 border border-slate-200 bg-slate-50 p-4" data-smoke="step3-validation-gate-bridge">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">다음 단계 열림 조건</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">검증 계획과 시장 근거가 저장되면 STEP 4가 열립니다</h3>
        </div>
        <span className={statusPillClass(hasSavedExperiment && marketScanDone, isMarketScanOutdated)}>
          {hasSavedExperiment && marketScanDone ? "다음 단계 준비" : "저장 필요"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-500">1. 검증 계획</div>
            <span className={statusPillClass(hasSavedExperiment)}>{hasSavedExperiment ? "저장 완료" : "저장 전"}</span>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-700">AI 추천 검증 계획을 저장하면 이번 주 확인할 행동이 고정됩니다.</p>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-500">2. 시장 근거</div>
            <span className={statusPillClass(marketScanDone, isMarketScanOutdated || isMarketScanLoading)}>
              {marketScanStatus}
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-slate-700">시장·경쟁 자동 점검이 저장되어야 제작 패키지 근거로 이어집니다.</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">3. 선택 기록</div>
          <p className="mt-2 text-sm leading-5 text-slate-700">직접 인터뷰나 테스트 결과는 실제 결과가 있을 때만 열어 저장합니다.</p>
        </div>
      </div>
    </div>
  );
}
