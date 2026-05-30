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
          여기서는 리포트를 먼저 읽지 않습니다. 완료된 것, 남은 것, 지금 판단할 것만 먼저 봅니다.
        </p>
      </div>
    </div>
  );
}
