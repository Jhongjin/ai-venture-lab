import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { ArrowRight, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { SignupForm } from "@/components/auth-forms";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "회원가입 | AI Venture Lab",
  description: "AI Venture Lab 실행 보드 계정을 만듭니다.",
};

export default function SignupPage() {
  return (
    <main id="main-content" data-smoke="signup-flow" className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div className="mx-auto grid w-full max-w-[1320px] gap-px bg-slate-300 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#eaf0fb] px-6 py-8 sm:px-8 lg:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
          <div className="relative flex min-h-[520px] flex-col justify-between">
            <div>
              <div className="avl-kicker">1인 작업</div>
              <h1
                className="mt-6 max-w-[12ch] break-keep text-[42px] font-normal leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-[58px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                혼자서도 기획부터 제작 패키지까지 이어갈 수 있습니다.
              </h1>
              <p className="mt-5 max-w-[42ch] break-keep text-sm leading-7 text-slate-600">
                아이디어 검토, 검증, 첫 제작 준비를 한 흐름으로 저장하고 다시 이어갈 수 있습니다.
              </p>
            </div>

            <div className="border-l border-slate-950 pl-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">가입 후 흐름</div>
              <p className="mt-3 max-w-[38ch] break-keep text-base font-semibold leading-7 text-slate-950">
                회원가입 후 기본 프로필을 설정하고 실행 보드에서 첫 아이디어를 정리합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[620px]">
            <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
              <Sparkle size={20} />
            </div>
            <h2 className="mt-6 text-[30px] font-semibold tracking-tight text-slate-950">계정 만들기</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              최소 정보만 받고, 자세한 프로필은 마이페이지에서 언제든 수정할 수 있습니다.
            </p>

            <div className="mt-8">
              <SignupForm />
            </div>

            <Link href="/" className="avl-btn avl-btn-subtle mt-8 h-11 px-4">
              홈으로 돌아가기
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
