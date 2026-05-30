"use client";

type Step8CurrentDecisionStripProps = {
  judgmentQuestion: string;
  nextActionText: string;
  outcomeSentence: string;
};

export function Step8CurrentDecisionStrip({
  judgmentQuestion,
  nextActionText,
  outcomeSentence,
}: Step8CurrentDecisionStripProps) {
  const items = [
    ["완료 상태", outcomeSentence],
    ["다음 행동", nextActionText],
    ["오늘 판단", judgmentQuestion],
  ] as const;

  return (
    <div data-smoke="step8-current-decision-strip" className="mt-3 grid gap-px bg-blue-200 md:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-white px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">{label}</div>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-950">{value}</p>
        </div>
      ))}
    </div>
  );
}
