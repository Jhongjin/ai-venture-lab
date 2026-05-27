import { getBalanceAfterBuildPass, getBuildPassCapacity, type CreditSummary } from "@/lib/billing";

type ProfileCreditSummaryProps = {
  error: string | null;
  summary: CreditSummary | null;
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatCredits(value: number | null) {
  if (value === null) {
    return "확인 필요";
  }

  return `${numberFormatter.format(value)} 크레딧`;
}

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
  const balanceLabel = summary ? formatCredits(summary.balance) : "로그인 후 확인";
  const openedPassCount = summary?.buildPasses.length ?? 0;
  const latestPass = summary?.buildPasses[0] ?? null;
  const remainingBuildPassCount = summary ? getBuildPassCapacity(summary.balance, summary.buildPassCost) : null;
  const balanceAfterNextPass = summary ? getBalanceAfterBuildPass(summary.balance, summary.buildPassCost) : null;
  const remainingPassLabel = remainingBuildPassCount === null ? "확인 필요" : `${numberFormatter.format(remainingBuildPassCount)}개`;
  const remainingPassHeadline =
    remainingBuildPassCount === null
      ? "로그인 후 이번 달 열 수 있는 제작 패스 수가 표시됩니다."
      : `지금 잔여 크레딧으로 제작 패스 ${remainingPassLabel}를 열 수 있습니다.`;
  const nextPassDetail =
    balanceAfterNextPass === null
      ? "잔여 크레딧을 확인한 뒤 STEP 5에서 제작 패스를 열 수 있습니다."
      : `다음 패스를 열면 ${numberFormatter.format(balanceAfterNextPass)}크레딧이 남습니다.`;
  const visibleMessage =
    summary?.message ??
    (error && !summary ? "로그인 후 이번 달 제작 크레딧과 열린 제작 패스를 확인할 수 있습니다." : null);

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
            Free는 매월 {summary?.monthlyGrant ?? 100}크레딧을 받고, 한 아이디어를 전체 제작 패키지와 외부 개발 도구 연결까지 열 때{" "}
            {summary?.buildPassCost ?? 30}크레딧을 씁니다.
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">{remainingPassHeadline}</p>
        </div>

        <div className="min-w-48 border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">잔여 크레딧</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{balanceLabel}</div>
          <div className="mt-2 text-xs leading-5 text-slate-500">기간 {summary?.periodKey ?? "로그인 후 표시"}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">이번 달 가능</div>
          <div data-smoke="profile-credit-build-pass-capacity" className="mt-2 text-sm font-semibold text-slate-950">
            제작 패스 {remainingPassLabel}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{nextPassDetail}</p>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">제작 패스</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">
            {numberFormatter.format(summary?.buildPassCost ?? 30)} 크레딧 / 아이디어
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">Free 자료</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">
            {summary?.freeArtifactLimit ?? 4}/{summary?.fullArtifactCount ?? 10} 단계
          </div>
        </div>
        <div className="border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">열린 패스</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">{numberFormatter.format(openedPassCount)}개</div>
        </div>
      </div>

      <div className="mt-4 border border-blue-200 bg-blue-50 p-3">
        <div className="text-xs font-semibold text-blue-800">제작 패스를 쓰면 열리는 가치</div>
        <p className="mt-2 text-sm leading-6 text-blue-950">
          PRD, 화면 구조, 디자인 기준, 기술 방향, 작업 순서, 외부 개발 도구 전달 파일까지 한 번에 이어집니다.
        </p>
        <a href="/workspace" className="avl-btn avl-btn-secondary mt-3 h-9 px-3 text-xs">
          실행 보드에서 아이디어 이어가기
        </a>
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
