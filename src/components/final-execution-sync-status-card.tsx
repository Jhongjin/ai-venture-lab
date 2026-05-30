"use client";

import { RefreshCw } from "lucide-react";

import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type FinalExecutionSyncStatusCardProps = {
  activeToolLabel: string;
  canUseActions: boolean;
  isBusy: boolean;
  isLiveExternalDelivery: boolean;
  isTaskSyncRefreshing: boolean;
  onRefreshTaskSync: () => void;
  reviewRows: ReadonlyArray<WorkbenchReviewGridRow>;
  taskSyncMessage: string | null;
  taskSyncUpdatedAt: string | null;
};

export function FinalExecutionSyncStatusCard({
  activeToolLabel,
  canUseActions,
  isBusy,
  isLiveExternalDelivery,
  isTaskSyncRefreshing,
  onRefreshTaskSync,
  reviewRows,
  taskSyncMessage,
  taskSyncUpdatedAt,
}: FinalExecutionSyncStatusCardProps) {
  return (
    <div className="border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="avl-kicker">{isLiveExternalDelivery ? "자동 반영" : "완료 보고"}</div>
          <h4 className="mt-2 text-base font-semibold text-emerald-950">
            {isLiveExternalDelivery ? `${activeToolLabel} 작업 상태를 자동으로 확인합니다` : "완료 보고를 작업표에 반영합니다"}
          </h4>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            {isLiveExternalDelivery
              ? `${activeToolLabel}가 완료 보고를 남기면 이 화면이 서버 상태를 다시 읽어 작업 목록과 성과 확인 화면에 반영합니다.`
              : `${activeToolLabel}는 현재 시작 패키지와 완료 보고 반영으로 연결합니다. 작업이 끝나면 보고 내용을 아래 영역에 붙여 Venture Lab 작업표를 업데이트합니다. 원격 자동 쓰기는 아직 제공하지 않습니다.`}
          </p>
          <p className="mt-2 text-sm leading-6 text-emerald-950" role="status">
            {isTaskSyncRefreshing
              ? "작업 상태 확인 중입니다..."
              : taskSyncMessage ?? "최종 실행 화면을 열면 저장된 작업 상태를 자동으로 확인합니다."}
          </p>
          {taskSyncUpdatedAt ? <p className="mt-1 text-xs leading-5 text-slate-500">마지막 확인 {taskSyncUpdatedAt}</p> : null}
          <div className="mt-3">
            <WorkbenchReviewGrid dataSmoke="final-execution-sync-result" density="roomy" rows={reviewRows} variant="emerald" />
          </div>
        </div>
        <button
          type="button"
          onClick={onRefreshTaskSync}
          disabled={isTaskSyncRefreshing || isBusy || !canUseActions}
          className="avl-btn avl-btn-secondary h-10 shrink-0 px-3 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          {isTaskSyncRefreshing ? "확인 중" : "지금 확인"}
        </button>
      </div>
    </div>
  );
}
