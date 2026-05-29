"use client";

import type { ImplementationTask } from "@/lib/venture-data";
import type { ImplementationTaskStatus } from "@/lib/supabase/types";

type FinalExecutionTaskPreview = Pick<ImplementationTask, "acceptance_criteria" | "id" | "status" | "title">;

type FinalExecutionFallbackTaskPreview = {
  acceptance_criteria: string;
  title: string;
};

type FinalExecutionTaskListProps = {
  description: string;
  fallbackTaskPreview: ReadonlyArray<FinalExecutionFallbackTaskPreview>;
  isLiveExternalDelivery: boolean;
  statusLabels: Record<ImplementationTaskStatus, string>;
  statusTone: Record<ImplementationTaskStatus, string>;
  taskPreview: ReadonlyArray<FinalExecutionTaskPreview>;
  visibleTaskCount: number;
};

function getTaskCode(index: number) {
  return `T-${String(index + 1).padStart(3, "0")}`;
}

export function FinalExecutionTaskList({
  description,
  fallbackTaskPreview,
  isLiveExternalDelivery,
  statusLabels,
  statusTone,
  taskPreview,
  visibleTaskCount,
}: FinalExecutionTaskListProps) {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">작업 목록</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">제작 작업 목록</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="avl-pill avl-pill-success">{visibleTaskCount}개 표시</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {taskPreview.length > 0 ? (
          taskPreview.map((task, index) => (
            <div key={task.id} className="border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-slate-950">
                  <span className="font-mono text-xs font-semibold text-slate-500">{getTaskCode(index)}</span> {task.title}
                </div>
                <span className={statusTone[task.status]}>{statusLabels[task.status]}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {task.acceptance_criteria || "수용 기준은 제작 패키지의 작업 순서를 따릅니다."}
              </p>
            </div>
          ))
        ) : fallbackTaskPreview.length > 0 ? (
          fallbackTaskPreview.map((task, index) => (
            <div key={`${task.title}-${index}`} className="border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-slate-950">
                  <span className="font-mono text-xs font-semibold text-slate-500">{getTaskCode(index)}</span> {task.title}
                </div>
                <span className="avl-pill avl-pill-info">
                  {isLiveExternalDelivery ? "연결 파일에 포함" : "패키지에 포함"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-700">
                {task.acceptance_criteria || "수용 기준은 제작 패키지의 작업 순서를 따릅니다."}
              </p>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600 md:col-span-3">
            저장된 제작 작업이 없습니다. STEP 6에서 작업 순서를 먼저 생성해야 최종 실행이 열립니다.
          </div>
        )}
      </div>
    </section>
  );
}
