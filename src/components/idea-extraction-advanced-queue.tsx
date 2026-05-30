"use client";

import { ArrowsClockwise, ClipboardText, PlusCircle } from "@phosphor-icons/react";

type ExtractionGateId = "proceed" | "research" | "pivot" | "kill";

type ExtractionQueueItem = {
  candidate: {
    id: string;
    name: string;
    productSurface: {
      label: string;
      shortLabel: string;
    };
    validationScore: number;
  };
  gate: {
    id: ExtractionGateId;
    label: string;
    nextAction: string;
  };
  nextGap: string;
  readinessScore: number;
  similarIdea?: {
    idea: {
      name: string;
    };
    score: number;
  } | null;
};

type IdeaExtractionAdvancedQueueProps = {
  bulkSavableCount: number;
  canSave: boolean;
  extractionGateCounts: Record<ExtractionGateId, number>;
  extractionGateStyles: Record<ExtractionGateId, { badge: string }>;
  extractSaveKey: string | null;
  isSavingExtractionReport: boolean;
  onCopyPortfolio: () => void | Promise<void>;
  onLoadIdea: (candidateId: string) => void;
  onSaveBulk: () => void | Promise<void>;
  onSaveIdea: (candidateId: string) => void | Promise<void>;
  onSaveReport: () => void | Promise<void>;
  secondaryPortfolioItems: ExtractionQueueItem[];
  selectedBuildDeliveryShortLabel: string;
};

export function IdeaExtractionAdvancedQueue({
  bulkSavableCount,
  canSave,
  extractionGateCounts,
  extractionGateStyles,
  extractSaveKey,
  isSavingExtractionReport,
  onCopyPortfolio,
  onLoadIdea,
  onSaveBulk,
  onSaveIdea,
  onSaveReport,
  secondaryPortfolioItems,
  selectedBuildDeliveryShortLabel,
}: IdeaExtractionAdvancedQueueProps) {
  return (
    <details className="border border-slate-200 bg-white p-4 text-slate-900">
      <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <ClipboardText size={15} />
            비교 아이디어
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">비교 아이디어</h3>
          <p className="mt-2 text-sm leading-5 text-slate-600">추천 아이디어 한 건 외에는 필요할 때만 봅니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["proceed", "진행"],
            ["research", "추가 조사"],
            ["pivot", "전환 검토"],
            ["kill", "중단"],
          ] as Array<[ExtractionGateId, string]>).map(([gateId, label]) => (
            <span key={gateId} className="avl-pill avl-pill-neutral">
              {label} {extractionGateCounts[gateId]}
            </span>
          ))}
        </div>
      </summary>

      <div className="mt-4 grid gap-3">
        {secondaryPortfolioItems.length > 0 ? (
          secondaryPortfolioItems.map((item, index) => (
            <div
              key={`${item.candidate.id}-queue`}
              className="grid gap-3 border border-slate-200 bg-slate-50 p-4 xl:grid-cols-[44px_minmax(0,1fr)_auto]"
            >
              <div className="avl-step-dot h-11 w-11 bg-slate-950 text-sm text-white">{index + 2}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-slate-950">{item.candidate.name}</div>
                  <span className={extractionGateStyles[item.gate.id].badge}>{item.gate.label}</span>
                  <span className="avl-pill avl-pill-brand">{item.candidate.productSurface.shortLabel}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  검증 {item.candidate.validationScore}/100 · 준비 {item.readinessScore}% · 결과물 형태{" "}
                  {item.candidate.productSurface.label} · 개발 방식 {selectedBuildDeliveryShortLabel} · {item.nextGap}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.gate.nextAction}
                  {item.similarIdea ? ` / 중복: ${item.similarIdea.idea.name} ${item.similarIdea.score}%` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                <button
                  type="button"
                  onClick={() => onLoadIdea(item.candidate.id)}
                  className="avl-btn avl-btn-secondary h-9 px-3 text-sm"
                >
                  입력칸에 가져오기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onSaveIdea(item.candidate.id);
                  }}
                  disabled={Boolean(extractSaveKey) || !canSave}
                  className="avl-btn avl-btn-primary h-9 px-3 text-sm disabled:opacity-50"
                >
                  {extractSaveKey === item.candidate.id ? <ArrowsClockwise className="animate-spin" size={14} /> : <PlusCircle size={14} />}
                  이 아이디어 저장
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            추천 아이디어 외에 바로 비교할 아이디어가 많지 않습니다. 지금은 추천 아이디어 한 건을 먼저 저장하는 쪽이 더 자연스럽습니다.
          </div>
        )}
      </div>

      <details className="avl-surface-muted mt-4 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">추가 확인</summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void onCopyPortfolio();
            }}
            className="avl-btn avl-btn-secondary px-4"
          >
            요약 복사
          </button>
          <button
            type="button"
            onClick={() => {
              void onSaveReport();
            }}
            disabled={isSavingExtractionReport || !canSave}
            className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
          >
            {isSavingExtractionReport ? <ArrowsClockwise className="animate-spin" size={16} /> : <ClipboardText size={16} />}
            비교 리포트 저장
          </button>
          <button
            type="button"
            onClick={() => {
              void onSaveBulk();
            }}
            disabled={Boolean(extractSaveKey) || !canSave || bulkSavableCount === 0}
            className="avl-btn avl-btn-primary px-4 disabled:opacity-50"
          >
            {extractSaveKey === "bulk" ? <ArrowsClockwise className="animate-spin" size={16} /> : <PlusCircle size={16} />}
            추천 아이디어 {bulkSavableCount}개 저장
          </button>
        </div>
      </details>
    </details>
  );
}
