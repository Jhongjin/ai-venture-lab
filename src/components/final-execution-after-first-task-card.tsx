"use client";

export function FinalExecutionAfterFirstTaskCard() {
  return (
    <div data-smoke="final-execution-after-first-task" className="border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-sm font-semibold text-emerald-950">첫 작업 뒤에는 STEP 8만 확인</div>
      <p className="mt-1 text-sm leading-6 text-emerald-950">
        외부 도구가 완료 보고를 남기면 Venture Lab 작업표와 성과 확인에 자동 반영됩니다. 처음에는 완료된 것, 다음
        작업, 오늘 판단만 보면 됩니다.
      </p>
      <p className="mt-2 text-xs leading-5 text-emerald-800">
        자동 반영이 안 될 때만 진행 기록 JSON을 백업으로 붙여넣습니다.
      </p>
    </div>
  );
}
