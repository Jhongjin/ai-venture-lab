"use client";

type Step8DecisionGuidanceProps = {
  decisionOptions: ReadonlyArray<string>;
  ladderItems: ReadonlyArray<readonly [label: string, detail: string]>;
};

export function Step8DecisionGuidance({ decisionOptions, ladderItems }: Step8DecisionGuidanceProps) {
  return (
    <>
      <div
        data-smoke="step8-single-decision-rule"
        className="mt-3 border border-blue-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
      >
        오늘은 아래 판단 후보 중 하나만 고르면 됩니다. 완료 근거가 없으면 다음 작업 하나만 유지하고, 상세 리포트는 필요할 때만 엽니다.
      </div>
      <div data-smoke="step8-decision-options" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 고를 판단 후보</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {decisionOptions.map((option, index) => (
            <div key={option} className="flex min-h-11 items-center gap-2 border border-blue-100 bg-blue-50 px-2.5 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-blue-200 bg-white text-xs font-semibold text-blue-700">
                {index + 1}
              </span>
              <span className="text-sm font-semibold leading-5 text-blue-950">{option}</span>
            </div>
          ))}
        </div>
      </div>
      <details data-smoke="step8-action-ladder-details" className="mt-3 border border-blue-200 bg-white px-3 py-2">
        <summary className="cursor-pointer list-none text-sm font-semibold text-blue-950">확인 순서 보기</summary>
        <div data-smoke="step8-action-ladder" className="mt-3 grid gap-px bg-blue-200 sm:grid-cols-3">
          {ladderItems.map(([label, detail]) => (
            <div key={label} className="bg-white px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
