import type { UpgradeInterestSummary } from "@/lib/upgrade-interest-server";

type ProfileUpgradeInterestSummaryProps = {
  summary: UpgradeInterestSummary;
};

const sourceLabels: Record<string, string> = {
  profile_credit_summary: "마이페이지",
  step5_credit_panel: "STEP 5 크레딧 부족",
  unknown: "위치 미확인",
};

const intentLabels: Record<string, string> = {
  insufficient_credits_for_build_pass: "크레딧 부족",
  repeated_production_packages: "반복 제작",
  unknown: "의도 미확인",
};

function formatCount(value: number) {
  return value.toLocaleString("ko-KR");
}

function getTopCountLabel(counts: Record<string, number>, labels: Record<string, string>, fallback: string) {
  const [topKey, topValue] =
    Object.entries(counts).sort(([, countA], [, countB]) => countB - countA)[0] ?? [];

  if (!topKey || !topValue) {
    return fallback;
  }

  return `${labels[topKey] ?? topKey} ${formatCount(topValue)}회`;
}

export function ProfileUpgradeInterestSummary({ summary }: ProfileUpgradeInterestSummaryProps) {
  const latestEvent = summary.latestEvents[0] ?? null;
  const topSourceLabel = getTopCountLabel(summary.sourceCounts, sourceLabels, "아직 없음");
  const topIntentLabel = getTopCountLabel(summary.intentCounts, intentLabels, "아직 없음");

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

      <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">최근 신호</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {latestEvent
                ? `${sourceLabels[latestEvent.source] ?? latestEvent.source} · ${
                    intentLabels[latestEvent.intent] ?? latestEvent.intent
                  } · ${latestEvent.occurredAt.slice(0, 10)}`
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
