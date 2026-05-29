"use client";

import type { ReactNode } from "react";

import { WorkbenchReviewGrid, type WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

type Step8ActionSummaryProps = {
  externalSyncCheckedText: string;
  externalSyncOutcomeSentence: string;
  externalSyncReviewRows: ReadonlyArray<WorkbenchReviewGridRow>;
  finalExecutionDecisionSentence: string;
  learningDecisionOptions: ReadonlyArray<string>;
  learningJudgmentQuestion: string;
  learningNextJudgmentBrief: string;
  learningOneSentenceOutcome: string;
  learningPrimaryActionDetail: string;
  learningPrimaryActionLabel: string;
  learningPrimaryActionText: string;
  learningSimpleReviewRows: ReadonlyArray<WorkbenchReviewGridRow>;
  primaryCtaSlot: ReactNode;
  step8ActionLadderItems: ReadonlyArray<readonly [label: string, detail: string]>;
};

export function Step8ActionSummary({
  externalSyncCheckedText,
  externalSyncOutcomeSentence,
  externalSyncReviewRows,
  finalExecutionDecisionSentence,
  learningDecisionOptions,
  learningJudgmentQuestion,
  learningNextJudgmentBrief,
  learningOneSentenceOutcome,
  learningPrimaryActionDetail,
  learningPrimaryActionLabel,
  learningPrimaryActionText,
  learningSimpleReviewRows,
  primaryCtaSlot,
  step8ActionLadderItems,
}: Step8ActionSummaryProps) {
  return (
    <div className="mb-4 border border-blue-200 bg-blue-50 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="text-sm font-semibold text-blue-950">지금 할 일</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">{learningPrimaryActionLabel}</h3>
          <div data-smoke="step8-one-sentence-outcome" className="mt-3 border border-blue-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">한 줄 결론</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{learningOneSentenceOutcome}</p>
          </div>
          <div className="mt-3">
            <WorkbenchReviewGrid
              dataSmoke="step8-simple-review"
              detailTone="soft"
              rows={learningSimpleReviewRows}
              variant="blue"
            />
          </div>
          <div data-smoke="step8-next-judgment-brief" className="mt-3 border border-blue-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 답할 질문</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{learningJudgmentQuestion}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{learningNextJudgmentBrief}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{learningPrimaryActionText}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{learningPrimaryActionDetail}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">결정: {finalExecutionDecisionSentence}</p>
          <div
            data-smoke="step8-single-decision-rule"
            className="mt-3 border border-blue-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-blue-950"
          >
            오늘은 아래 판단 후보 중 하나만 고르면 됩니다. 완료 근거가 없으면 다음 작업 하나만 유지하고, 상세 리포트는 필요할 때만 엽니다.
          </div>
          <div data-smoke="step8-decision-options" className="mt-3 border border-blue-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
              오늘 고를 판단 후보
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {learningDecisionOptions.map((option, index) => (
                <div key={option} className="flex min-h-11 items-center gap-2 border border-blue-100 bg-blue-50 px-2.5 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-blue-200 bg-white text-xs font-semibold text-blue-700">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold leading-5 text-blue-950">{option}</span>
                </div>
              ))}
            </div>
          </div>
          <details data-smoke="step8-action-ladder-details" className="mt-3 border border-blue-200 bg-white px-3 py-2">
            <summary className="cursor-pointer list-none text-sm font-semibold text-blue-950">확인 순서 보기</summary>
            <div data-smoke="step8-action-ladder" className="mt-3 grid gap-px bg-blue-200 sm:grid-cols-3">
              {step8ActionLadderItems.map(([label, detail]) => (
                <div key={label} className="bg-white px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </details>
          <div data-smoke="step8-sync-brief" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">자동 반영 요약</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{externalSyncOutcomeSentence}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">최근 확인: {externalSyncCheckedText}</p>
            <details
              data-smoke="step8-sync-review-details"
              className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-emerald-950">
                자동 반영 세부 보기
              </summary>
              <div className="mt-3">
                <WorkbenchReviewGrid dataSmoke="step8-sync-review" rows={externalSyncReviewRows} variant="emerald" />
              </div>
            </details>
          </div>
        </div>
        {primaryCtaSlot}
      </div>
    </div>
  );
}
