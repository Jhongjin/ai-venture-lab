import {
  FREE_MONTHLY_CREDITS,
  FREE_PACKAGE_ARTIFACT_LIMIT,
  FULL_PACKAGE_ARTIFACT_COUNT,
  IDEA_BUILD_PASS_CREDITS,
  PRO_UPGRADE_SIGNAL_TEXTS,
  PRO_UPGRADE_VALUE_TEXT,
  formatBuildPassCount,
  formatCompactCreditAmount,
  formatCreditAmount,
  formatKoreanNumber,
  formatSignedCreditAmount,
  getBalanceAfterBuildPass,
  getBuildPassCapacity,
  getBuildPassShortfall,
  getMonthlyBuildPassCapacity,
  type CreditSummary,
} from "@/lib/billing";
import { UpgradeInterestButton } from "@/components/upgrade-interest-button";

type ProfileCreditSummaryProps = {
  error: string | null;
  summary: CreditSummary | null;
};

const ledgerTypeLabels: Record<string, string> = {
  adjustment: "조정",
  build_pass_spend: "제작 패스 사용",
  monthly_grant: "월 Free 지급",
  refund: "환불",
};

function getStatusLabel(summary: CreditSummary | null) {
  if (!summary) {
    return "로그인 필요";
  }

  if (summary.status === "ready") {
    return "사용 가능";
  }

  if (summary.status === "missing") {
    return "DB 준비 필요";
  }

  return "확인 필요";
}

function getStatusClassName(summary: CreditSummary | null) {
  if (summary?.status === "ready") {
    return "avl-pill avl-pill-success";
  }

  if (summary?.status === "missing") {
    return "avl-pill avl-pill-warning";
  }

  return "avl-pill avl-pill-neutral";
}

export function ProfileCreditSummary({ error, summary }: ProfileCreditSummaryProps) {
  const baselineMonthlyGrant = summary?.monthlyGrant ?? FREE_MONTHLY_CREDITS;
  const baselineBuildPassCost = summary?.buildPassCost ?? IDEA_BUILD_PASS_CREDITS;
  const freeMonthlyPassCapacity = getMonthlyBuildPassCapacity(baselineMonthlyGrant, baselineBuildPassCost);
  const balanceLabel = summary ? formatCreditAmount(summary.balance) : "로그인 후 확인";
  const openedPassCount = summary?.buildPasses.length ?? 0;
  const latestPass = summary?.buildPasses[0] ?? null;
  const ledgerEntries = summary?.ledgerEntries ?? [];
  const currentPeriodLedgerEntries = ledgerEntries.filter((entry) => entry.periodKey === summary?.periodKey);
  const currentPeriodGranted = currentPeriodLedgerEntries
    .filter((entry) => entry.amount > 0)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const currentPeriodSpent = Math.abs(
    currentPeriodLedgerEntries.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + entry.amount, 0),
  );
  const remainingBuildPassCount = summary ? getBuildPassCapacity(summary.balance, summary.buildPassCost) : null;
  const balanceAfterNextPass = summary ? getBalanceAfterBuildPass(summary.balance, summary.buildPassCost) : null;
  const nextBuildPassShortfall = summary ? getBuildPassShortfall(summary.balance, summary.buildPassCost) : null;
  const remainingPassLabel = formatBuildPassCount(remainingBuildPassCount);
  const remainingPassHeadline =
    remainingBuildPassCount === null
      ? "로그인 후 이번 달 열 수 있는 제작 패스 수가 표시됩니다."
      : `지금 잔여 크레딧으로 제작 패스 ${remainingPassLabel}를 열 수 있습니다.`;
  let nextPassDetail = "잔여 크레딧을 확인한 뒤 STEP 5에서 제작 패스를 열 수 있습니다.";
  if (nextBuildPassShortfall !== null) {
    nextPassDetail = `다음 제작 패스까지 ${formatCreditAmount(nextBuildPassShortfall)} 부족합니다.`;
  } else if (balanceAfterNextPass !== null) {
    nextPassDetail = `다음 패스를 열면 ${formatCompactCreditAmount(balanceAfterNextPass)}이 남습니다.`;
  }
  const visibleMessage =
    summary?.message ??
    (error && !summary ? "로그인 후 이번 달 제작 크레딧과 열린 제작 패스를 확인할 수 있습니다." : null);
  const planFitLabel =
    nextBuildPassShortfall !== null
      ? "Pro 관심을 남길 시점"
      : remainingBuildPassCount !== null && remainingBuildPassCount > 0
        ? "Free로 이어갈 수 있음"
        : "제작 패스 용량 확인";
  const planFitItems = [
    ["현재 Free", `월 ${baselineMonthlyGrant}크레딧, 제작 패스 최대 ${freeMonthlyPassCapacity}개 기준`],
    [
      "지금 상태",
      remainingBuildPassCount === null
        ? "로그인 후 남은 제작 패스 수를 확인합니다"
        : remainingBuildPassCount > 0
          ? `이번 달 제작 패스 ${remainingPassLabel} 가능`
          : "이번 달 제작 패스를 더 열려면 크레딧 보충이 필요",
    ],
    ["Pro 전환", "반복 제작, 외부 개발 도구 자동 반영, 출처 기반 시장 점검이 계속 필요할 때"],
  ] as const;
  const proConversionBoundaryItems = [
    ["현재 Free", `첫 아이디어 검증, 월 ${FREE_MONTHLY_CREDITS}크레딧, 제작 패키지 미리보기`],
    ["Pro 가치", PRO_UPGRADE_VALUE_TEXT],
    [
      "지금 행동",
      nextBuildPassShortfall !== null
        ? `${formatCreditAmount(nextBuildPassShortfall)} 부족합니다. Pro 관심 기록만 남깁니다`
        : "결제 전에는 Pro 관심만 남기고 실제 checkout은 열지 않습니다",
    ],
  ] as const;
  const creditNextActionTitle = !summary
    ? "로그인 후 크레딧을 확인하세요"
    : nextBuildPassShortfall !== null
      ? `다음 제작 패스까지 ${formatCreditAmount(nextBuildPassShortfall)} 부족합니다`
      : remainingBuildPassCount !== null && remainingBuildPassCount > 0
        ? "지금은 STEP 5에서 제작 패스를 열 수 있습니다"
        : "제작 패스 용량을 확인하세요";
  const creditNextActionDetail = !summary
    ? "잔여 크레딧과 이번 달 제작 가능 횟수를 먼저 확인합니다."
    : nextBuildPassShortfall !== null
      ? "결제는 아직 열지 않고 Pro 관심 기록만 남깁니다."
      : "전체 제작 패키지와 외부 개발 도구 연결이 필요할 때만 30크레딧을 씁니다.";

  return (
    <section data-smoke="profile-credit-summary" className="mt-8 border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="avl-kicker">Venture Credits</span>
            <span className={getStatusClassName(summary)}>{getStatusLabel(summary)}</span>
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">이번 달 제작 여력</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Free는 매월 {summary?.monthlyGrant ?? FREE_MONTHLY_CREDITS}크레딧을 받고, 한 아이디어를 전체 제작 패키지와 외부 개발 도구 연결까지 열 때{" "}
            {summary?.buildPassCost ?? IDEA_BUILD_PASS_CREDITS}크레딧을 씁니다.
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{remainingPassHeadline}</p>
        </div>

        <div className="min-w-48 border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">잔여 크레딧</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{balanceLabel}</div>
          <div className="mt-2 text-xs leading-5 text-slate-500">기간 {summary?.periodKey ?? "로그인 후 표시"}</div>
        </div>
      </div>

      <div data-smoke="profile-credit-next-action" className="mt-4 border border-blue-200 bg-blue-50 p-3">
        <div className="text-xs font-semibold text-blue-800">지금 할 일</div>
        <p className="mt-1 text-sm font-semibold leading-6 text-blue-950">{creditNextActionTitle}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{creditNextActionDetail}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">이번 달 지급</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{formatCreditAmount(summary ? currentPeriodGranted : null)}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">Free 월 지급과 조정 내역 기준입니다.</p>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">이번 달 사용</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{formatCreditAmount(summary ? currentPeriodSpent : null)}</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">제작 패스 사용분이 여기에 쌓입니다.</p>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">이번 달 가능</div>
          <div data-smoke="profile-credit-build-pass-capacity" className="mt-2 text-sm font-semibold text-slate-950">
            제작 패스 {remainingPassLabel}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{nextPassDetail}</p>
          {nextBuildPassShortfall !== null ? (
            <p data-smoke="profile-credit-shortfall" className="mt-2 text-xs font-semibold leading-5 text-amber-700">
              {formatCreditAmount(nextBuildPassShortfall)}만 더 있으면 다음 제작 패스를 열 수 있습니다.
            </p>
          ) : null}
        </div>
      </div>

      <div data-smoke="profile-credit-ledger" className="mt-4 border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">최근 크레딧 내역</div>
            <h4 className="mt-2 text-base font-semibold text-slate-950">지급과 사용을 바로 확인합니다</h4>
          </div>
          <span className="avl-pill avl-pill-neutral shrink-0">{summary?.periodKey ?? "로그인 후 표시"}</span>
        </div>
        <div className="mt-3 grid gap-2">
          {ledgerEntries.length > 0 ? (
            ledgerEntries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="grid gap-2 border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="text-sm font-semibold text-slate-950">
                    {ledgerTypeLabels[entry.entryType] ?? "크레딧 변경"}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {entry.createdAt.slice(0, 10)}
                    {entry.ideaId ? ` · 아이디어 ${entry.ideaId.slice(0, 8)}` : ""}
                  </p>
                </div>
                <div className={`text-sm font-semibold ${entry.amount < 0 ? "text-amber-700" : "text-emerald-700"}`}>
                  {formatSignedCreditAmount(entry.amount)}
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              로그인 후 월 지급이나 제작 패스 사용 내역이 여기에 표시됩니다.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">제작 패스</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">
            {formatKoreanNumber(summary?.buildPassCost ?? IDEA_BUILD_PASS_CREDITS)} 크레딧 / 아이디어
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">Free 자료</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">
            {summary?.freeArtifactLimit ?? FREE_PACKAGE_ARTIFACT_LIMIT}/{summary?.fullArtifactCount ?? FULL_PACKAGE_ARTIFACT_COUNT} 단계
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">열린 패스</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{formatKoreanNumber(openedPassCount)}개</div>
        </div>
      </div>

      <div data-smoke="profile-credit-execution-package-value" className="mt-4 border border-blue-200 bg-blue-50 p-3">
        <div className="text-xs font-semibold text-blue-800">제작 패스를 쓰면 열리는 가치</div>
        <p className="mt-2 text-sm leading-6 text-blue-950">
          제작 패스는 문서 묶음이 아니라 실행 패키지를 여는 비용입니다. 제품 기획서, 화면 구조, 디자인 기준, 기술 방향, 작업 순서,
          외부 개발 도구 전달 파일까지 한 번에 이어집니다.
        </p>
        <a href="/workspace" className="avl-btn avl-btn-secondary mt-3 h-9 px-3 text-xs">
          실행 보드에서 아이디어 이어가기
        </a>
      </div>

      <div className="mt-4 border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">업그레이드가 필요한 순간</div>
            <h4 className="mt-2 text-base font-semibold text-slate-950">Free로 검증하고, Pro는 반복 제작에 씁니다</h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              첫 아이디어를 이해하는 데는 Free가 충분해야 합니다. 결제 가치는 더 많은 제작 패키지, 더 깊은 시장 근거,
              외부 개발 도구 자동 반영이 필요해질 때 생깁니다.
            </p>
          </div>
          <span className="avl-pill avl-pill-info shrink-0">현재 Free</span>
        </div>
        <div data-smoke="profile-upgrade-signals" className="mt-3 grid gap-2">
          {PRO_UPGRADE_SIGNAL_TEXTS.map((signal) => (
            <div key={signal} className="flex gap-2 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-slate-950" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
        <div data-smoke="profile-pro-conversion-boundary" className="mt-4 grid gap-px bg-slate-200 sm:grid-cols-3">
          {proConversionBoundaryItems.map(([label, detail]) => (
            <div key={label} className="bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-500">{label}</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
            </div>
          ))}
        </div>
        <div data-smoke="profile-pro-plan-fit" className="mt-4 border border-blue-200 bg-blue-50 p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-800">내 플랜 판단</div>
              <h5 className="mt-1 text-sm font-semibold text-blue-950">{planFitLabel}</h5>
            </div>
            <span className="avl-pill avl-pill-info shrink-0">결제 전 수요 확인</span>
          </div>
          <div className="mt-3 grid gap-px bg-blue-200 sm:grid-cols-3">
            {planFitItems.map(([label, detail]) => (
              <div key={label} className="bg-white p-3">
                <div className="text-xs font-semibold text-blue-800">{label}</div>
                <p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <UpgradeInterestButton
          idleMessage={
            nextBuildPassShortfall !== null
              ? `${formatCreditAmount(nextBuildPassShortfall)} 부족한 상태를 Pro 관심 기록으로 남깁니다.`
              : "지금은 결제 없이 관심만 남깁니다."
          }
          intent={nextBuildPassShortfall !== null ? "insufficient_credits_for_build_pass" : "repeated_production_packages"}
        />
      </div>

      {latestPass ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          최근 제작 패스는 {latestPass.createdAt.slice(0, 10)}에 열렸습니다.
        </p>
      ) : null}
      {visibleMessage ? <p className="mt-3 text-sm font-semibold text-amber-700">{visibleMessage}</p> : null}
    </section>
  );
}
