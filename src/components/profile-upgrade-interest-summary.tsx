import type { UpgradeInterestSummary } from "@/lib/upgrade-interest-server";
import {
  PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE,
  buildUpgradeInterestSummaryDisplayState,
  formatUpgradeInterestCount,
} from "@/lib/upgrade-interest";

type ProfileUpgradeInterestSummaryProps = {
  summary: UpgradeInterestSummary;
};

export function ProfileUpgradeInterestSummary({ summary }: ProfileUpgradeInterestSummaryProps) {
  const { demandQualityLabel, latestEventLabel, nextDemandAction, topIntentLabel, topSourceLabel } =
    buildUpgradeInterestSummaryDisplayState(summary);

  return (
    <section data-smoke="profile-upgrade-interest-summary" className="mt-8 border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">Pro interest</div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">내 Pro 관심 기록</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            결제 화면을 열기 전에, 내가 언제 Pro가 필요해지는지 관심 기록만 남깁니다.
          </p>
        </div>
        <span className="avl-pill avl-pill-info shrink-0">결제 없이 기록</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">관심 등록</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">
            {formatUpgradeInterestCount(summary.totalCount)}회
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">결제 없이 남긴 Pro 필요 기록입니다.</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">관심이 생긴 위치</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{topSourceLabel}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">마이페이지인지, 제작 패키지 단계인지 확인합니다.</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">필요했던 이유</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{topIntentLabel}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">반복 제작인지, 크레딧 부족인지 봅니다.</p>
        </div>
      </div>

      <div data-smoke="profile-upgrade-interest-quality" className="mt-4 border border-blue-200 bg-blue-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-800">신호 품질</div>
            <h4 className="mt-1 text-sm font-semibold text-blue-950">{demandQualityLabel}</h4>
          </div>
          <span className="avl-pill avl-pill-info shrink-0">결제 전 기록</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-blue-950">{nextDemandAction}</p>
        <p
          data-smoke="profile-upgrade-interest-paused-boundary"
          className="mt-1 text-xs font-semibold leading-5 text-blue-950"
        >
          {PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE}
        </p>
        <p
          data-smoke="profile-upgrade-interest-not-payment"
          className="mt-1 text-xs font-semibold leading-5 text-blue-950"
        >
          이 기록은 결제 예약이나 구독 신청이 아니라 Pro가 필요한 순간을 모아 보는 신호입니다.
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          기준: 관심 등록 {formatUpgradeInterestCount(summary.totalCount)}회, 계정{" "}
          {formatUpgradeInterestCount(summary.uniqueActorCount)}개, 최근 주요 이유 {topIntentLabel}.
        </p>
        <p data-smoke="profile-upgrade-interest-dedupe-rule" className="mt-1 text-xs leading-5 text-slate-600">
          중복 기준: 같은 계정, 같은 위치, 같은 이유는 24시간 안에 한 번만 늘어납니다.
        </p>
      </div>

      <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">최근 기록</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{latestEventLabel}</p>
          </div>
          <span className="avl-pill avl-pill-neutral shrink-0">
            저장 범위 {formatUpgradeInterestCount(summary.uniqueActorCount)}계정
          </span>
        </div>
        {summary.error ? <p className="mt-2 text-sm font-semibold text-amber-700">{summary.error}</p> : null}
      </div>
    </section>
  );
}
