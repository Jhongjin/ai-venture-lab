const step5ExecutionPackageBriefItems = [
  ["첫 메시지", "도구가 읽을 시작 지시문과 제작 기준"],
  ["첫 작업", "T-001부터 처리할 작업 순서와 수용 기준"],
  ["완료 기준", "작업이 끝났는지 확인할 검수 조건"],
  ["연결 파일", "최종 실행에서 받을 도구별 설치 파일"],
] as const;

const step5SavedPackageUsageItems = [
  ["STEP 6", "작업 순서로 풀림"],
  ["STEP 7", "도구별 연결 파일 생성"],
  ["STEP 8", "진행 결과와 성과 확인 기준"],
] as const;

export function Step5ExecutionPackageBrief() {
  return (
    <div data-smoke="step5-execution-package-brief" className="mt-5 border border-blue-200 bg-blue-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">제작 시작 패키지</div>
          <h4 className="mt-2 text-base font-semibold text-slate-950">저장하면 개발자가 바로 읽을 실행 기준이 됩니다.</h4>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">
            이 단계의 결과는 보기 좋은 문서가 아니라, 첫 메시지, 첫 작업, 완료 기준을 외부/내부 개발 도구에
            넘기는 시작점입니다.
          </p>
        </div>
        <span className="avl-pill avl-pill-info">STEP 7 연결 준비</span>
      </div>
      <div
        data-smoke="step5-execution-package-focus"
        className="mt-3 border border-blue-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
      >
        처음에는 세 가지만 확인합니다: 첫 메시지가 맞는지, T-001이 첫 작업인지, 완료 기준이 검수 가능한지. 나머지 문서는
        도구가 읽습니다.
      </div>
      <div className="mt-3 grid gap-px bg-blue-200 md:grid-cols-2 xl:grid-cols-4">
        {step5ExecutionPackageBriefItems.map(([label, detail]) => (
          <div key={label} className="bg-white px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
          </div>
        ))}
      </div>
      <div data-smoke="step5-saved-package-usage" className="mt-3 grid gap-px bg-blue-200 md:grid-cols-3">
        {step5SavedPackageUsageItems.map(([label, detail]) => (
          <div key={label} className="bg-white px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
