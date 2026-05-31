"use client";

import type { FormEvent } from "react";
import { Layers3 } from "lucide-react";

import type { OrchestrationPhase } from "@/lib/supabase/types";

type Step6ManualRunDraft = {
  objective: string;
  owner_role: string;
  phase: OrchestrationPhase;
};

type Step6ManualRunFormProps = {
  canSubmit: boolean;
  isBusy: boolean;
  onObjectiveChange: (value: string) => void;
  onOwnerRoleChange: (value: string) => void;
  onPhaseChange: (value: OrchestrationPhase) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  phaseLabels: Record<string, string>;
  phaseOptions: ReadonlyArray<OrchestrationPhase>;
  runDraft: Step6ManualRunDraft;
};

export function Step6ManualRunForm({
  canSubmit,
  isBusy,
  onObjectiveChange,
  onOwnerRoleChange,
  onPhaseChange,
  onSubmit,
  phaseLabels,
  phaseOptions,
  runDraft,
}: Step6ManualRunFormProps) {
  return (
    <details data-smoke="step6-manual-run-form" className="mt-4 border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
        <span>필요할 때만 직접 단계 추가</span>
        <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
          보조 추가는 작업표에만 반영되고, 다음 단계는 하단 다음 버튼으로 이동합니다.
        </span>
      </summary>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <div className="grid gap-3 md:grid-cols-[0.75fr_1fr]">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            단계
            <select
              value={runDraft.phase}
              disabled={!canSubmit}
              onChange={(event) => onPhaseChange(event.target.value as OrchestrationPhase)}
              className="avl-select"
            >
              {phaseOptions.map((option) => (
                <option key={option} value={option}>
                  {phaseLabels[option] ?? option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            담당 역할
            <input value={runDraft.owner_role} onChange={(event) => onOwnerRoleChange(event.target.value)} className="avl-input" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          목표
          <textarea
            value={runDraft.objective}
            disabled={!canSubmit}
            rows={4}
            onChange={(event) => onObjectiveChange(event.target.value)}
            className="avl-textarea min-h-28"
          />
        </label>
        <button type="submit" disabled={isBusy || !canSubmit} className="avl-btn avl-btn-secondary px-4 disabled:opacity-50">
          <Layers3 size={18} />
          단계 추가
        </button>
      </form>
    </details>
  );
}
