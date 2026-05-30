"use client";

type Step8OutcomeCard = {
  label: string;
  value: string;
  detail: string;
};

type Step8OutcomeDetailsProps = {
  learningDecisionCards: ReadonlyArray<Step8OutcomeCard>;
};

export function Step8OutcomeDetails({ learningDecisionCards }: Step8OutcomeDetailsProps) {
  return (
    <details data-smoke="step8-outcome-details" className="border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
        판단 근거 자세히 보기
      </summary>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        처음에는 위의 한눈 요약만 보면 됩니다. 숫자와 근거를 비교해야 할 때만 아래 카드를 엽니다.
      </p>
      <div data-smoke="step8-outcome-summary" className="mt-3 grid gap-3 md:grid-cols-3">
        {learningDecisionCards.map((card) => (
          <div key={card.label} className="avl-surface-muted p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">{card.value}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
