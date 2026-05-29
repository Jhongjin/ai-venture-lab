"use client";

import { Clipboard, Save } from "lucide-react";

type FinalExecutionLearningCriteriaProps = {
  isBusy: boolean;
  learningDraft: string;
  onCopyCriteria: () => void;
  onSaveCriteria: () => void;
  userCanSave: boolean;
};

const learningCriteriaItems = [
  ["Day 7", "핵심 행동 완료율과 반복 사용을 확인합니다."],
  ["Day 14", "구매 신호와 온보딩 병목을 분리합니다."],
  ["Day 30", "반복 사용과 지불 의향으로 다음 빌드를 결정합니다."],
] as const;

export function FinalExecutionLearningCriteria({
  isBusy,
  learningDraft,
  onCopyCriteria,
  onSaveCriteria,
  userCanSave,
}: FinalExecutionLearningCriteriaProps) {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">성과 기준</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">출시 후 성과 확인 기준</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Day 7, 14, 30에 무엇을 보고 판단할지 정리합니다.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopyCriteria}
            disabled={!learningDraft}
            className="avl-btn avl-btn-secondary px-3 disabled:opacity-50"
          >
            <Clipboard size={16} />
            기준 복사
          </button>
          <button
            type="button"
            onClick={onSaveCriteria}
            disabled={isBusy || !userCanSave || !learningDraft}
            className="avl-btn avl-btn-primary px-3 disabled:opacity-50"
          >
            <Save size={16} />
            기준 저장
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {learningCriteriaItems.map(([label, detail]) => (
          <div key={label} className="border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
