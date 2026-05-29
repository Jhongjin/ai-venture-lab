import type { UpgradeInterestSummary } from "@/lib/upgrade-interest-server";
import { getUpgradeInterestIntentLabel, getUpgradeInterestSourceLabel } from "@/lib/upgrade-interest";

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
      ? "아직 결제 실험 전"
      : summary.uniqueActorCount >= 3
        ? "가격 제안 테스트 가능"
        : "더 많은 관심 신호 필요";
  const nextDemandAction =
    summary.totalCount === 0
      ? "STEP 5와 마이페이지에서 관심 등록 위치가 잘 보이는지 먼저 확인합니다."
      : summary.uniqueActorCount >= 3
        ? "반복 제작 사용자에게 Pro 가격과 포함 범위를 안내하는 실험을 준비합니다."
        : "크레딧 부족이나 반복 제작 상황에서 관심 등록이 더 쌓이는지 봅니다.";

  return (
    <section data-smoke="profile-upgrade-interest-summary" className="mt-8 border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">Pro interest</div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">Pro 관심 신호</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            결제 화면을 열기 전에, 반복 제작이나 크레딧 부족 상황에서 생긴 관심 신호를 먼저 봅니다.
          </p>
        </div>
        <span className="avl-pill avl-pill-info shrink-0">사전 결제 검증</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">관심 등록</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCount(summary.totalCount)}회</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">현재 계정 권한으로 볼 수 있는 신호입니다.</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">주요 위치</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{topSourceLabel}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">어디에서 관심이 생겼는지 봅니다.</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-500">주요 이유</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{topIntentLabel}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">왜 업그레이드가 필요해졌는지 봅니다.</p>
        </div>
      </div>

      <div data-smoke="profile-upgrade-interest-quality" className="mt-4 border border-blue-200 bg-blue-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-blue-800">신호 품질</div>
            <h4 className="mt-1 text-sm font-semibold text-blue-950">{demandQualityLabel}</h4>
          </div>
          <span className="avl-pill avl-pill-info shrink-0">전환 전 점검</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-blue-950">{nextDemandAction}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          기준: 관심 등록 {formatCount(summary.totalCount)}회, 계정 {formatCount(summary.uniqueActorCount)}개, 주요 이유 {topIntentLabel}.
        </p>
        <p data-smoke="profile-upgrade-interest-dedupe-rule" className="mt-1 text-xs leading-5 text-slate-600">
          중복 기준: 같은 계정, 같은 위치, 같은 이유는 24시간 안에 한 번만 늘어납니다.
        </p>
      </div>

      <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">최근 신호</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {latestEvent
                ? `${getUpgradeInterestSourceLabel(latestEvent.source)} · ${getUpgradeInterestIntentLabel(
                    latestEvent.intent,
                  )} · ${latestEvent.occurredAt.slice(0, 10)}`
                : "아직 Pro 관심 등록이 없습니다."}
            </p>
          </div>
          <span className="avl-pill avl-pill-neutral shrink-0">계정 {formatCount(summary.uniqueActorCount)}개</span>
        </div>
        {summary.error ? <p className="mt-2 text-sm font-semibold text-amber-700">{summary.error}</p> : null}
      </div>
    </section>
  );
}
