import type { StripeCheckoutReadiness } from "@/lib/payment-readiness";

type ProfilePaymentReadinessProps = {
  readiness: StripeCheckoutReadiness;
};

export function ProfilePaymentReadiness({ readiness }: ProfilePaymentReadinessProps) {
  const statusLabel = readiness.isEnvReady ? "환경변수 준비됨" : "Checkout 준비 전";
  const statusDetail = readiness.isEnvReady
    ? "Stripe 환경변수 이름은 모두 설정되어 있습니다. checkout route, webhook 검증, 서버 entitlement 저장이 끝나기 전까지 버튼은 열지 않습니다."
    : "Stripe test mode 제품과 가격 ID를 만든 뒤 Vercel Preview/Production 환경변수에 아래 이름을 채워야 합니다.";

  return (
    <section data-smoke="profile-payment-readiness" className="mt-8 border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="avl-kicker">payment readiness</div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">결제 준비 상태</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{statusDetail}</p>
        </div>
        <span className={readiness.isEnvReady ? "avl-pill avl-pill-success shrink-0" : "avl-pill avl-pill-warning shrink-0"}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-px bg-slate-200 sm:grid-cols-3">
        <div className="bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">환경변수</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">
            {readiness.configuredCount}/{readiness.totalCount}개 준비
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">값은 표시하지 않고 설정 여부만 봅니다.</p>
        </div>
        <div className="bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">Checkout</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">아직 비활성</div>
          <p className="mt-1 text-xs leading-5 text-slate-500">결제는 webhook-backed entitlement 이후에만 엽니다.</p>
        </div>
        <div className="bg-white p-3">
          <div className="text-xs font-semibold text-slate-500">지금 행동</div>
          <div className="mt-2 text-sm font-semibold text-slate-950">
            {readiness.isEnvReady ? "테스트 checkout 구현 준비" : "누락 env 이름 확인"}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">비밀값은 채팅이나 문서에 남기지 않습니다.</p>
        </div>
      </div>

      {!readiness.isEnvReady ? (
        <div data-smoke="profile-payment-missing-env" className="mt-4 border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs font-semibold text-amber-800">아직 필요한 환경변수 이름</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {readiness.missingKeys.map((key) => (
              <span key={key} className="avl-pill avl-pill-warning font-mono text-[11px]">
                {key}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
