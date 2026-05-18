import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { ArrowRight, Path, Sparkle } from "@phosphor-icons/react/dist/ssr";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 | AI Venture Lab",
  description: "요청한 경로를 찾을 수 없습니다. AI Venture Lab 홈이나 로그인 페이지로 이동하세요.",
};

const recoveryRoutes = [
  {
    label: "home",
    title: "랜딩으로 돌아가기",
    href: "/",
  },
  {
    label: "board",
    title: "로그인 후 시작",
    href: "/login",
  },
  {
    label: "flow",
    title: "사용 흐름 보기",
    href: "/guide",
  },
];

export default function NotFound() {
  return (
    <main id="main-content" className={`min-h-screen bg-[#f2f0eb] px-4 py-4 text-slate-950 sm:px-6 sm:py-6 ${newsreader.variable}`}>
      <section className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full max-w-[1600px] overflow-hidden border border-slate-950 bg-[#10141d] text-white xl:grid-cols-[0.48fr_0.52fr]">
        <div className="relative flex flex-col justify-between overflow-hidden px-6 py-8 sm:px-8 xl:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.34]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-48 bg-[radial-gradient(circle_at_20%_100%,rgba(188,211,255,0.22),transparent_42%)]" />
          <div className="relative">
            <div className="avl-kicker !text-slate-300">
              <Sparkle size={14} />
              route missing
            </div>
            <h1
              className="mt-8 max-w-[10ch] break-keep text-[48px] font-normal leading-[0.94] tracking-[-0.05em] text-white sm:text-[68px]"
              style={{ fontFamily: "var(--font-newsreader)" }}
            >
              이 경로에는 실행 보드가 없습니다.
            </h1>
            <p className="mt-6 max-w-[44ch] text-sm leading-7 text-slate-300">
              요청한 페이지를 찾지 못했습니다. 홈에서 다시 시작하거나, 로그인 후 저장된 후보를 계속 다룰 수 있습니다.
            </p>
          </div>

          <div className="relative mt-10 grid grid-cols-4 gap-px bg-white/10">
            {["idea", "validate", "build", "learn"].map((label, index) => (
              <div key={label} className={`${index === 0 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-3 py-4`}>
                <div className="font-mono text-[11px] uppercase tracking-[0.2em]">0{index + 1}</div>
                <div className="mt-8 text-[10px] font-semibold uppercase tracking-[0.16em]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#eef3ff] px-6 py-8 text-slate-950 sm:px-8 xl:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center border border-slate-300 bg-white">
              <Path size={20} />
            </div>
            <div className="mt-10 grid gap-px bg-slate-300">
              {recoveryRoutes.map((route, index) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`${index === 1 ? "bg-slate-950 text-white hover:bg-[#182233]" : "bg-white text-slate-950 hover:bg-[#f6f4ee]"} grid gap-px transition-colors sm:grid-cols-[0.24fr_0.76fr]`}
                >
                  <div className={`${index === 1 ? "bg-[#0f141f] text-[#bcd3ff]" : "bg-[#f8fafc] text-slate-500"} px-4 py-5 font-mono text-[11px] uppercase tracking-[0.2em]`}>
                    {route.label}
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-5">
                    <span className="text-sm font-semibold">{route.title}</span>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 border-y border-slate-300 py-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">recovery note</div>
              <p className="mt-3 max-w-[48ch] text-sm leading-6 text-slate-600">
                링크가 오래됐거나 주소가 잘못됐을 수 있습니다. 저장된 작업은 실행 보드에서 계속 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
