const step5PackageCurrentActionItems = [
  ["1. 만들기", "AI 제작 패키지 만들기"],
  ["2. 확인", "요약만 보고 필요한 메모 추가"],
  ["3. 저장 후 이동", "저장 완료 후 하단 다음 단계 버튼으로 STEP 6 이동"],
] as const;

type Step5PackageCurrentActionProps = {
  canUseFullProductionPackage: boolean;
  isCreditSystemChecking: boolean;
};

export function Step5PackageCurrentAction({
  canUseFullProductionPackage,
  isCreditSystemChecking,
}: Step5PackageCurrentActionProps) {
  return (
    <section data-smoke="step5-package-current-action" className="mb-5 border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">지금 할 일</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">
            AI가 개발 시작 기준을 만들면 요약만 확인하고 저장합니다.
          </h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">
            저장된 패키지는 STEP 6 작업 순서와 STEP 7 연결 파일의 기준이 됩니다. 문서 보관용이 아니라 외부 개발
            도구나 내부 개발을 시작하기 위한 실행 패키지입니다. 파일 받기와 도구 연결은 최종 실행에서만 열립니다.
          </p>
          <p data-smoke="step5-ai-prepares-user-confirms" className="mt-2 text-xs font-semibold leading-5 text-emerald-950">
            AI가 먼저 기획서, 제작 범위, 첫 작업을 정리합니다. 사용자는 요약을 확인하고 저장만 하면 됩니다.
          </p>
        </div>
        <span className="avl-pill avl-pill-success w-fit">다음: 작업 순서</span>
      </div>
      <div className="mt-3 grid gap-px bg-emerald-200 md:grid-cols-3">
        {step5PackageCurrentActionItems.map(([label, detail]) => (
          <div key={label} className="bg-white px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{label}</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
          </div>
        ))}
      </div>
      <div data-smoke="step5-first-click-cue" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">먼저 할 일</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
          {canUseFullProductionPackage
            ? "아래 AI 제작 패키지 만들기만 누르면 AI가 요약까지 자동으로 정리합니다."
            : isCreditSystemChecking
              ? "크레딧 상태를 확인한 뒤 AI 제작 패키지 만들기 버튼이 열립니다."
              : "먼저 제작 패스를 열면 아래 AI 제작 패키지 만들기 버튼이 활성화됩니다."}
        </p>
      </div>
      <div data-smoke="step5-save-to-execution-path" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">저장 후 열림</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
          STEP 6 작업 순서 확인 후, STEP 7에서 연결 파일을 받습니다.
        </p>
      </div>
    </section>
  );
}
