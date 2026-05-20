import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { ArrowRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { LoginForm } from "@/components/auth-forms";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "로그인 | AI Venture Lab",
  description: "AI Venture Lab 대시보드에 로그인합니다.",
};

export default function LoginPage() {
  return (
    <main id="main-content" className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div className="mx-auto grid w-full max-w-[1320px] gap-px bg-slate-300 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#10141d] px-6 py-8 text-white sm:px-8 lg:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.34]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <div className="relative flex min-h-[520px] flex-col justify-between">
            <div>
              <div className="avl-kicker !text-slate-300">계정 접속</div>
              <h1
                className="mt-6 max-w-[12ch] break-keep text-[42px] font-normal leading-[0.96] tracking-[-0.04em] text-white sm:text-[58px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                로그인 후 대시보드로 이동합니다.
              </h1>
              <p className="mt-5 max-w-[42ch] break-keep text-sm leading-7 text-slate-300">
                아이디어, 검증 자료, 실행 준비 기록을 대시보드에서 이어서 관리합니다.
              </p>
            </div>

            <div className="grid gap-px bg-white/10 sm:grid-cols-3">
              {["아이디어", "검증", "실행"].map((item, index) => (
                <div key={item} className={`${index === 0 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-4 py-4`}>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em]">0{index + 1}</div>
                  <div className="mt-8 text-xs font-semibold">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[560px]">
            <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-50 text-slate-700">
              <ShieldCheck size={20} />
            </div>
            <h2 className="mt-6 text-[30px] font-semibold tracking-tight text-slate-950">로그인</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              로그인 후 대시보드에서 진행 중인 아이디어, 검증 기록, 실행 문서를 이어서 확인합니다.
            </p>

            <div className="mt-8">
              <LoginForm />
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
