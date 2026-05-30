"use client";

import type { ReactNode } from "react";

import { Step8DecisionGuidance } from "@/components/step8-decision-guidance";
import { Step8SyncBrief } from "@/components/step8-sync-brief";
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
          <div data-smoke="step8-primary-action-now" className="mt-3 border border-blue-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 실제로 할 일</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{learningPrimaryActionText}</p>
          </div>
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
          <div data-smoke="step8-external-completion-bridge" className="mt-3 border border-emerald-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              외부 도구 완료 보고 후
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">
              이 화면에서 완료된 것, 다음 작업, 오늘 판단만 확인합니다.
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              자동 반영이 들어오면 아래 요약이 갱신되고, 자세한 진행표는 필요할 때만 엽니다.
            </p>
          </div>
          <div data-smoke="step8-next-judgment-brief" className="mt-3 border border-blue-200 bg-white px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">오늘 답할 질문</div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{learningJudgmentQuestion}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{learningNextJudgmentBrief}</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{learningPrimaryActionDetail}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">결정: {finalExecutionDecisionSentence}</p>
          <Step8DecisionGuidance decisionOptions={learningDecisionOptions} ladderItems={step8ActionLadderItems} />
          <Step8SyncBrief
            checkedText={externalSyncCheckedText}
            outcomeSentence={externalSyncOutcomeSentence}
            reviewRows={externalSyncReviewRows}
          />
        </div>
        {primaryCtaSlot}
      </div>
    </div>
  );
}
