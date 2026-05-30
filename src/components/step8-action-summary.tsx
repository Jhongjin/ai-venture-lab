"use client";

import type { ReactNode } from "react";

import { Step8ActionHighlights } from "@/components/step8-action-highlights";
import { Step8CurrentDecisionStrip } from "@/components/step8-current-decision-strip";
import { Step8DecisionGuidance } from "@/components/step8-decision-guidance";
import { Step8SyncBrief } from "@/components/step8-sync-brief";
import type { WorkbenchReviewGridRow } from "@/components/workbench-review-grid";

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
          <Step8CurrentDecisionStrip
            judgmentQuestion={learningJudgmentQuestion}
            nextActionText={learningPrimaryActionText}
            outcomeSentence={externalSyncOutcomeSentence}
          />
          <Step8ActionHighlights
            decisionSentence={finalExecutionDecisionSentence}
            judgmentQuestion={learningJudgmentQuestion}
            nextJudgmentBrief={learningNextJudgmentBrief}
            oneSentenceOutcome={learningOneSentenceOutcome}
            primaryActionDetail={learningPrimaryActionDetail}
            primaryActionText={learningPrimaryActionText}
            reviewRows={learningSimpleReviewRows}
          />
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
