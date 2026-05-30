"use client";

import { ClipboardList, Save, Trash2 } from "lucide-react";

import type { OrchestrationRun } from "@/lib/venture-data";
import type { OrchestrationStatus } from "@/lib/supabase/types";

type Step6RunListProps = {
  canManageRun: (run: OrchestrationRun) => boolean;
  isBusy: boolean;
  onDeleteRun: (run: OrchestrationRun) => void;
  onFillRunOutput: (run: OrchestrationRun) => void;
  onRunOutputChange: (runId: string, value: string) => void;
  onSaveRunOutput: (run: OrchestrationRun) => void;
  onUpdateRunStatus: (run: OrchestrationRun, status: OrchestrationStatus) => void;
  orchestrationStatuses: ReadonlyArray<OrchestrationStatus>;
  phaseLabels: Record<string, string>;
  runOutputs: Record<string, string>;
  runStatusLabels: Record<string, string>;
  runStatusTone: Record<string, string>;
  selectedRuns: ReadonlyArray<OrchestrationRun>;
};

export function Step6RunList({
  canManageRun,
  isBusy,
  onDeleteRun,
  onFillRunOutput,
  onRunOutputChange,
  onSaveRunOutput,
  onUpdateRunStatus,
  orchestrationStatuses,
  phaseLabels,
  runOutputs,
  runStatusLabels,
  runStatusTone,
  selectedRuns,
}: Step6RunListProps) {
  return (
    <div className="mt-4 grid gap-3">
      {selectedRuns.length > 0 ? (
        selectedRuns.map((run) => {
          const canManage = canManageRun(run);
          const currentOutput = runOutputs[run.id] ?? run.output;

          return (
            <div key={run.id} className="avl-surface-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{phaseLabels[run.phase]}</span>
                    <span className={`avl-pill ${runStatusTone[run.status]}`}>{runStatusLabels[run.status]}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{run.objective || "목표 미정"}</p>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {run.owner_role || "담당 미정"}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="text-xs font-semibold text-slate-500">상태는 필요할 때만 바꿉니다</div>
                  <div className="flex flex-wrap gap-2">
                    {orchestrationStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => onUpdateRunStatus(run, status)}
                        disabled={isBusy || !canManage || run.status === status}
                        className="avl-btn avl-btn-secondary h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                      >
                        {runStatusLabels[status]}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => onDeleteRun(run)}
                      disabled={isBusy || !canManage}
                      className="avl-btn avl-btn-danger h-8 px-2.5 text-xs shadow-none disabled:opacity-45"
                    >
                      <Trash2 size={14} />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  단계 결과
                  <textarea
                    value={currentOutput}
                    disabled={!canManage}
                    onChange={(event) => onRunOutputChange(run.id, event.target.value)}
                    className="avl-textarea min-h-28"
                  />
                </label>
                <p className="text-xs leading-5 text-slate-500">
                  초안 채우기는 입력칸만 채웁니다. 저장하려면 단계 결과 저장을 눌러야 합니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onFillRunOutput(run)}
                    disabled={isBusy || !canManage}
                    className="avl-btn avl-btn-secondary px-4 shadow-none disabled:opacity-45"
                  >
                    <ClipboardList size={16} />
                    초안 채우기
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveRunOutput(run)}
                    disabled={isBusy || !canManage || currentOutput === run.output}
                    className="avl-btn avl-btn-secondary px-4 shadow-none disabled:opacity-45"
                  >
                    <Save size={16} />
                    단계 결과 저장
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="avl-surface-muted p-4 text-sm text-slate-600">아직 연결된 실행 단계가 없습니다.</div>
      )}
    </div>
  );
}
