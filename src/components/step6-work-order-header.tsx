"use client";

import { Layers3 } from "lucide-react";

type Step6WorkOrderHeaderProps = {
  canCreateRunbook: boolean;
  isBusy: boolean;
  onCreateRunbook: () => void;
};

export function Step6WorkOrderHeader({ canCreateRunbook, isBusy, onCreateRunbook }: Step6WorkOrderHeaderProps) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">작업 순서 보드</h2>
          <p className="mt-1 text-sm text-slate-500">AI가 만든 작업 순서를 확인하고 필요한 단계만 보완합니다.</p>
        </div>
        <button
          type="button"
          onClick={onCreateRunbook}
          disabled={isBusy || !canCreateRunbook}
          className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
        >
          <Layers3 size={18} />
          작업 순서 자동 만들기
        </button>
      </div>

      <div className="border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        기본 흐름은 작업 순서 자동 만들기, 필요한 단계 결과 확인/저장, 다음 단계입니다. 상태 버튼은 실제 실행 추적이 필요할 때만
        바꾸면 됩니다.
      </div>
    </>
  );
}
