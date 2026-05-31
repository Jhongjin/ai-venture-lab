import type { UpgradeInterestSummary } from "@/lib/upgrade-interest-server";
import {
  PRO_INTEREST_PAUSED_CHECKOUT_MESSAGE,
  getUpgradeInterestIntentLabel,
  getUpgradeInterestSourceLabel,
} from "@/lib/upgrade-interest";

type ProfileUpgradeInterestSummaryProps = {
  summary: UpgradeInterestSummary;
};

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

function getTopCountLabel(counts: Record<string, number>, getLabel: (key: string) => string, fallback: string) {
  const [topKey, topValue] =
    Object.entries(counts).sort(([, countA], [, countB]) => countB - countA)[0] ?? [];

  if (!topKey || !topValue) {
    return fallback;
  }

  return `${getLabel(topKey)} ${formatCount(topValue)}회`;
}

export function ProfileUpgradeInterestSummary({ summary }: ProfileUpgradeInterestSummaryProps) {
  const latestEvent = summary.latestEvents[0] ?? null;
  const topSourceLabel = getTopCountLabel(summary.sourceCounts, getUpgradeInterestSourceLabel, "아직 없음");
  const topIntentLabel = getTopCountLabel(summary.intentCounts, getUpgradeInterestIntentLabel, "아직 없음");
  const demandQualityLabel =
    summary.totalCount === 0
      ? "아직 관심을 남기지 않음"
      : summary.totalCount >= 2
        ? "반복 제작 필요가 보임"
        : "첫 관심 기록됨";
  const nextDemandAction =
    summary.totalCount === 0
      ? "제작 패스가 부족하거나 반복 제작이 필요할 때 Pro 관심만 먼저 남길 수 있습니다."
      : summary.totalCount >= 2
        ? "비슷한 순간에 Pro가 다시 필요해지면, 결제 오픈 전에 포함 범위를 더 명확히 정합니다."
        : "다음에도 크레딧 부족이나 반복 제작 상황이 생기는지 기록만 이어서 봅니다.";

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
          <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCount(summary.totalCount)}회</div>
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
        <p className="mt-1 text-xs leading-5 text-slate-600">
          기준: 관심 등록 {formatCount(summary.totalCount)}회, 계정 {formatCount(summary.uniqueActorCount)}개, 최근 주요 이유 {topIntentLabel}.
        </p>
        <p data-smoke="profile-upgrade-interest-dedupe-rule" className="mt-1 text-xs leading-5 text-slate-600">
          중복 기준: 같은 계정, 같은 위치, 같은 이유는 24시간 안에 한 번만 늘어납니다.
        </p>
      </div>

      <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">최근 기록</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {latestEvent
                ? `${getUpgradeInterestSourceLabel(latestEvent.source)} · ${getUpgradeInterestIntentLabel(
                    latestEvent.intent,
                  )} · ${latestEvent.occurredAt.slice(0, 10)}`
                : "아직 Pro 관심 등록이 없습니다."}
            </p>
          </div>
          <span className="avl-pill avl-pill-neutral shrink-0">저장 범위 {formatCount(summary.uniqueActorCount)}계정</span>
        </div>
        {summary.error ? <p className="mt-2 text-sm font-semibold text-amber-700">{summary.error}</p> : null}
      </div>
    </section>
  );
}
