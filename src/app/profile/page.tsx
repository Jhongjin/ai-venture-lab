import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { UserCircle } from "@phosphor-icons/react/dist/ssr";

import { ProfileForm } from "@/components/auth-forms";
import { ProfileCreditSummary } from "@/components/profile-credit-summary";
import { ProfilePaymentReadiness } from "@/components/profile-payment-readiness";
import { ProfileUpgradeInterestSummary } from "@/components/profile-upgrade-interest-summary";
import { readAuthenticatedCreditSummary } from "@/lib/billing-server";
import { readStripeCheckoutReadiness } from "@/lib/payment-readiness";
import { readUpgradeInterestSummary } from "@/lib/upgrade-interest-server";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "마이페이지 | AI Venture Lab",
  description: "AI Venture Lab 프로필을 확인하고 수정합니다.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ProfilePage() {
  const paymentReadiness = readStripeCheckoutReadiness();
  const [creditResult, upgradeInterestSummary] = await Promise.all([
    readAuthenticatedCreditSummary(),
    readUpgradeInterestSummary(),
  ]);

  return (
    <main id="main-content" data-smoke="my-page" className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div className="mx-auto grid w-full max-w-[1320px] gap-px bg-slate-300 px-4 py-6 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <aside className="relative overflow-hidden bg-[#10141d] px-6 py-8 text-white sm:px-8 lg:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.34]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <div className="relative">
            <div className="avl-kicker !text-slate-300">마이페이지</div>
            <h1
              className="mt-6 max-w-[12ch] break-keep text-[42px] font-normal leading-[0.96] tracking-[-0.04em] text-white sm:text-[56px]"
              style={{ fontFamily: "var(--font-newsreader)" }}
            >
              작업자 정보를 정리합니다.
            </h1>
            <p className="mt-5 max-w-[38ch] break-keep text-sm leading-7 text-slate-300">
              표시 이름, 소속, 역할을 저장해 실행 보드에서 누가 진행 중인지 분명하게 남깁니다.
            </p>
          </div>
        </aside>

        <section className="bg-white px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[620px]">
            <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
              <UserCircle size={20} />
            </div>
            <h2 className="mt-6 text-[30px] font-semibold tracking-tight text-slate-950">프로필 수정</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              이메일은 계정 식별용으로 표시하고, 프로필 정보와 비밀번호는 이곳에서 수정합니다.
            </p>

            <ProfileCreditSummary error={creditResult.error} summary={creditResult.summary} />
            <ProfileUpgradeInterestSummary summary={upgradeInterestSummary} />
            <ProfilePaymentReadiness readiness={paymentReadiness} />

            <div className="mt-8">
              <ProfileForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
