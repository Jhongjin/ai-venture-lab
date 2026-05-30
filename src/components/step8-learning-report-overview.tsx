"use client";

import { Clipboard, Save } from "lucide-react";

type Step8LearningSignalCard = {
  label: string;
  value: string;
  detail: string;
};

type Step8LearningReportOverviewProps = {
  canSave: boolean;
  isBusy: boolean;
  learningSignalCards: ReadonlyArray<Step8LearningSignalCard>;
  learningTelemetryReportDraft: string;
  onCopyReport: () => void;
  onSaveReport: () => void;
};

const learningDecisionWindows = [
  ["Day 7", "첫 행동 완료율", "이벤트가 적으면 온보딩, 첫 화면, 핵심 액션을 더 짧게 만듭니다."],
  ["Day 14", "반복 사용과 지불 신호", "반복 이벤트와 실험 결과를 보고 세그먼트 축소 또는 가격 검증으로 이동합니다."],
  ["Day 30", "유지와 다음 제작", "충분한 사용/지불/추천 신호가 있으면 다음 제작 범위를 승인합니다."],
] as const;

export function Step8LearningReportOverview({
  canSave,
  isBusy,
  learningSignalCards,
  learningTelemetryReportDraft,
  onCopyReport,
  onSaveReport,
}: Step8LearningReportOverviewProps) {
  return (
    <>
      <div className="mt-4 flex flex-col gap-3 border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-600">
          실제 이벤트 수치와 리포트 저장은 출시 후 판단이 필요할 때만 확인합니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopyReport}
            disabled={!learningTelemetryReportDraft}
            className="avl-btn avl-btn-secondary px-3 disabled:opacity-50"
          >
            <Clipboard size={16} />
            리포트 복사
          </button>
          <button
            type="button"
            onClick={onSaveReport}
            disabled={isBusy || !canSave || !learningTelemetryReportDraft}
            className="avl-btn avl-btn-primary px-3 disabled:opacity-50"
          >
            <Save size={16} />
            리포트 저장
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {learningSignalCards.map((card) => (
          <div key={card.label} className="avl-surface-muted p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {learningDecisionWindows.map(([label, signal, action]) => (
          <div key={label} className="avl-surface-muted p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <h3 className="mt-2 text-sm font-semibold text-slate-950">{signal}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action}</p>
          </div>
        ))}
      </div>
    </>
  );
}
