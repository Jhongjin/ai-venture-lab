"use client";

import { Activity } from "lucide-react";

export function Step8LearningHeader() {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Activity size={16} />
          실행 상태
        </div>
        <h2 className="text-lg font-semibold text-slate-950">성과 확인</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          먼저 세 가지만 확인합니다: 완료된 것, 이어 할 것, 지금 결정할 것. 리포트는 필요할 때만 엽니다.
        </p>
        <div
          data-smoke="step8-confirm-not-run-header"
          className="mt-3 border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
        >
          STEP 8은 새 실행을 시작하는 화면이 아닙니다. 완료 보고를 확인하고 다음 판단 하나만 고르는 화면입니다.
        </div>
      </div>
    </div>
  );
}
