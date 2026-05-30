"use client";

import { withKoreanInstrumental } from "@/lib/product-surface";

type RecommendedIdeaDecisionBannerProps = {
  buildDeliveryPhrase: string;
  productSurfaceLabel: string;
};

export function RecommendedIdeaDecisionBanner({
  buildDeliveryPhrase,
  productSurfaceLabel,
}: RecommendedIdeaDecisionBannerProps) {
  return (
    <div data-smoke="recommended-idea-decision-banner" className="mt-4 border border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">결정 문장</div>
      <p className="mt-2 text-base font-semibold leading-6 text-slate-950">
        이 아이디어는 {withKoreanInstrumental(productSurfaceLabel)} 만들고, {buildDeliveryPhrase}.
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">
        결과물 형태와 개발 방식은 따로 저장됩니다. 실제 연결 파일은 STEP 7 최종 실행에서 받습니다.
      </p>
    </div>
  );
}
