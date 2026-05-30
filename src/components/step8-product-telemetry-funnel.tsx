"use client";

import { Clipboard, Save } from "lucide-react";

export type Step8ProductTelemetryFunnelRow = {
  count: number;
  conversion: number | null;
  eventName: string;
  label: string;
  question: string;
};

type Step8ProductTelemetryFunnelProps = {
  canSave: boolean;
  isBusy: boolean;
  onCopyFunnel: () => void;
  onSaveFunnel: () => void;
  productTelemetryFunnelDraft: string;
  productTelemetryFunnelRows: ReadonlyArray<Step8ProductTelemetryFunnelRow>;
  productTelemetryMaxCount: number;
};

export function Step8ProductTelemetryFunnel({
  canSave,
  isBusy,
  onCopyFunnel,
  onSaveFunnel,
  productTelemetryFunnelDraft,
  productTelemetryFunnelRows,
  productTelemetryMaxCount,
}: Step8ProductTelemetryFunnelProps) {
  return (
    <div className="avl-card p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">제품 사용 퍼널</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            방문부터 결제 신호까지 실제 사용 행동이 어디서 끊기는지 봅니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopyFunnel}
            disabled={!productTelemetryFunnelDraft}
            className="avl-btn avl-btn-secondary h-9 px-3 text-xs disabled:opacity-50"
          >
            <Clipboard size={14} />
            퍼널 복사
          </button>
          <button
            type="button"
            onClick={onSaveFunnel}
            disabled={isBusy || !canSave || !productTelemetryFunnelDraft}
            className="avl-btn avl-btn-primary h-9 px-3 text-xs disabled:opacity-50"
          >
            <Save size={14} />
            퍼널 저장
          </button>
        </div>
      </div>
      <div className="grid gap-3">
        {productTelemetryFunnelRows.map((row, index) => {
          const width = Math.max(4, Math.round((row.count / productTelemetryMaxCount) * 100));

          return (
            <div key={row.eventName} className="avl-surface-muted p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="avl-step-dot h-7 w-7 border border-slate-200 bg-white text-xs text-slate-700">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{row.label}</div>
                    <div className="text-xs text-slate-500">{row.eventName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-950">{row.count}건</div>
                  <div className="text-xs text-slate-500">
                    {row.conversion === null ? "기준 단계" : `전 단계 대비 ${row.conversion}%`}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-[2px] bg-white">
                <div className="h-full rounded-[2px] bg-blue-600" style={{ width: `${width}%` }} />
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{row.question}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
