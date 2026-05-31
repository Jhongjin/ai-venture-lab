"use client";

import { Clipboard } from "lucide-react";

type Step8PrimaryCtaProps = {
  canCopyReport: boolean;
  ctaLabel: string;
  navigationHintDetail: string;
  navigationHintTitle: string;
  onCopyReport: () => Promise<void> | void;
  reportDraft: string;
};

export function Step8PrimaryCta({
  canCopyReport,
  ctaLabel,
  navigationHintDetail,
  navigationHintTitle,
  onCopyReport,
  reportDraft,
}: Step8PrimaryCtaProps) {
  if (canCopyReport) {
    return (
      <button
        type="button"
        onClick={() => void onCopyReport()}
        disabled={!reportDraft}
        data-smoke="step8-primary-cta"
        className="avl-btn avl-btn-primary h-10 px-4 disabled:opacity-50"
      >
        <Clipboard size={16} />
        {ctaLabel}
      </button>
    );
  }

  return (
    <div
      data-smoke="step8-primary-cta"
      className="max-w-xs border border-blue-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700"
    >
      <div className="font-semibold text-slate-950">{navigationHintTitle}</div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{navigationHintDetail}</p>
      <p data-smoke="step8-primary-cta-confirm-only" className="mt-2 text-xs font-semibold leading-5 text-blue-950">
        지금은 이 화면에서 확인만 하고, 실제 실행은 STEP 7에서 계속합니다.
      </p>
    </div>
  );
}
