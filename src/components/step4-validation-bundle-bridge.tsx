type Step4ValidationBundleBridgeProps = {
  isValidationBundleSaved: boolean;
};

export function Step4ValidationBundleBridge({ isValidationBundleSaved }: Step4ValidationBundleBridgeProps) {
  const statusLabel = isValidationBundleSaved ? "저장 완료" : "저장 전";
  const actionLabel = isValidationBundleSaved ? "하단 다음 단계 버튼" : "검증 자료 한 번에 저장";
  const actionDetail = isValidationBundleSaved
    ? "저장된 자료를 기준으로 STEP 5 제작 패키지를 열 수 있습니다."
    : "개별 문서를 다 열지 않아도 AI가 필요한 4개 자료를 같은 기준으로 묶습니다.";

  return (
    <div className="mt-4 border border-slate-200 bg-slate-50 p-4" data-smoke="step4-validation-bundle-bridge">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">저장 후 쓰임</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">검증 자료는 STEP 5 제작 패키지의 입력 근거입니다</h3>
        </div>
        <span className={`avl-pill ${isValidationBundleSaved ? "avl-pill-success" : "avl-pill-neutral"}`}>{statusLabel}</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">저장되는 자료</div>
          <p className="mt-1 text-sm leading-5 text-slate-700">아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">사용자 행동</div>
          <p className="mt-1 text-sm leading-5 text-slate-700">{actionLabel}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">다음 사용처</div>
          <p className="mt-1 text-sm leading-5 text-slate-700">{actionDetail}</p>
        </div>
      </div>
    </div>
  );
}
