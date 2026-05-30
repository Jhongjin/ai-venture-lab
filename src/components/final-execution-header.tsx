"use client";

type LaunchReadinessBlocker = {
  detail: string;
  label: string;
} | null;

type FinalExecutionHeaderProps = {
  canEnterLaunch: boolean;
  nextLaunchBlocker: LaunchReadinessBlocker;
  passedReadinessCount: number;
  readinessScore: number;
  totalReadinessCount: number;
};

export function FinalExecutionHeader({
  canEnterLaunch,
  nextLaunchBlocker,
  passedReadinessCount,
  readinessScore,
  totalReadinessCount,
}: FinalExecutionHeaderProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">최종 전달</div>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">최종 실행</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            모든 검증과 제작 패키지가 끝난 뒤, 선택한 방식으로 실제 제작 환경에 넘깁니다.
          </p>
        </div>
        <div className="border border-slate-200 bg-white px-4 py-3 text-right text-slate-950">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            준비 {passedReadinessCount}/{totalReadinessCount}
          </div>
          <div className="mt-1 text-2xl font-semibold">{readinessScore}%</div>
        </div>
      </div>

      {canEnterLaunch ? null : (
        <div className="border border-amber-200 bg-amber-50 p-5">
          <div className="text-sm font-semibold text-amber-950">아직 최종 실행 단계가 아닙니다.</div>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            이 화면은 파일 받기나 외부 도구 연동을 시작하는 마지막 단계입니다. 아래 항목을 먼저 끝내야 열립니다.
          </p>
          <div className="mt-4 border border-amber-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">다음 해소 항목</div>
            <div className="mt-2 text-base font-semibold text-slate-950">
              {nextLaunchBlocker?.label ?? "준비 항목 확인"}
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {nextLaunchBlocker?.detail ?? "제작 패키지와 작업 순서를 먼저 준비해야 합니다."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
