import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { ArrowLeft, ArrowRight, ClipboardText, FileDoc, Path, RocketLaunch, ShieldCheck, Sparkle, UsersThree } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "사용 가이드 | AI Venture Lab",
  description: "AI Venture Lab 사용 흐름과 산출물을 정리한 가이드 페이지입니다.",
};

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

const guideSteps = [
  {
    index: "01",
    title: "아이디어 찾기",
    body: "회의 메모나 AI 대화를 붙여넣으면 후보와 검증 질문을 먼저 구조화합니다.",
    icon: Sparkle,
  },
  {
    index: "02",
    title: "검증과 리스크 정리",
    body: "점수, 위험, 7일 실험, 진행 판단을 묶어 정말 밀 후보만 남깁니다.",
    icon: ShieldCheck,
  },
  {
    index: "03",
    title: "기획과 제작 준비",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단까지 같은 보드에서 이어집니다.",
    icon: ClipboardText,
  },
  {
    index: "04",
    title: "출시 후 학습",
    body: "Day 7/14/30 신호를 모아 다음 반복과 투자 판단으로 연결합니다.",
    icon: RocketLaunch,
  },
];

const artifacts = [
  { title: "아이디어 브리프", icon: FileDoc },
  { title: "검증 패키지", icon: ShieldCheck },
  { title: "MVP 범위", icon: Path },
  { title: "실행 태스크 보드", icon: UsersThree },
];

export default function GuidePage() {
  return (
    <main className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6">
        <header className="border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="avl-kicker text-slate-700">
                <Sparkle size={14} />
                AI Venture Lab
              </div>
              <span className="avl-pill avl-pill-neutral">guide</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                <ArrowLeft size={14} />
                홈
              </Link>
              <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                실행 보드 열기
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-4 border-t border-slate-300 bg-transparent">
          <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="bg-white px-6 py-8 sm:px-8 sm:py-10">
              <div className="avl-kicker">operator guide</div>
              <h1
                className="mt-5 max-w-[9ch] text-[44px] font-normal leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-[68px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                실행 보드를 이해하는 가장 짧은 문서.
              </h1>
              <p className="mt-5 max-w-[56ch] text-[15px] leading-7 text-slate-600">
                홈은 제품의 인상을 만들고, 보드는 실제 일을 시작하게 합니다. 이 페이지는 그 사이에서 전체 흐름과 산출물을 빠르게 이해하도록 돕습니다.
              </p>
            </div>

            <div className="grid gap-px bg-slate-300">
              <div className="bg-[#f7f6f2] px-6 py-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">what stays constant</div>
                <div className="mt-3 max-w-[11ch] text-[28px] font-semibold leading-[1.04] tracking-tight text-slate-950">
                  AI는 먼저 채우고, 사람은 결론을 정합니다.
                </div>
              </div>
              <div className="bg-white px-6 py-5 text-sm leading-6 text-slate-600">
                기본은 혼자 끝까지 가는 흐름이고, 필요할 때만 워크스페이스와 팀 초대를 붙입니다.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-px bg-slate-300 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="bg-white px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">guide map</div>
            <div className="mt-4 space-y-2">
              {guideSteps.map((step) => (
                <a
                  key={step.title}
                  href={`#step-${step.index}`}
                  className="flex items-start justify-between gap-3 border-l-2 border-slate-200 bg-[#f7f6f2] px-3 py-3 text-sm text-slate-700 transition hover:border-slate-950 hover:bg-white"
                >
                  <span>{step.title}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{step.index}</span>
                </a>
              ))}
            </div>
          </aside>

          <div className="grid gap-px border border-slate-200 bg-slate-200">
            {guideSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} id={`step-${step.index}`} className="grid gap-px bg-slate-200 md:grid-cols-[88px_minmax(0,1fr)_120px]">
                  <div className="bg-white px-6 py-6">
                    <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                      <Icon size={20} />
                    </span>
                  </div>
                  <div className="bg-white px-6 py-6">
                    <h2 className="text-[26px] font-semibold tracking-tight text-slate-950">{step.title}</h2>
                    <p className="mt-3 max-w-[48ch] text-sm leading-6 text-slate-600">{step.body}</p>
                  </div>
                  <div className="bg-[#f7f6f2] px-6 py-6 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {step.index}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-4 grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="bg-white">
            <div className="grid gap-px bg-slate-200 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-white px-6 py-5">
                <div className="avl-kicker">deliverables</div>
                <div className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">
                  보드 안에서 기본으로 쌓이는 산출물
                </div>
              </div>
              <div className="bg-[#f7f6f2] px-6 py-5 text-sm leading-6 text-slate-600">
                문서를 따로 조립하지 않아도, 후보부터 실행 패키지까지 바로 넘길 수 있는 형태로 남습니다.
              </div>
            </div>
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              {artifacts.map((artifact) => {
                const Icon = artifact.icon;
                return (
                  <div key={artifact.title} className="bg-white px-6 py-5">
                    <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                      <Icon size={18} />
                    </span>
                    <div className="mt-4 text-[18px] font-semibold tracking-tight text-slate-950">{artifact.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 text-white">
            <div className="grid gap-px bg-white/10">
              <div className="bg-slate-950 px-6 py-6">
                <div className="avl-kicker !text-slate-300">next step</div>
                <div className="mt-3 text-[30px] font-semibold leading-[1.04] tracking-tight">설명은 여기까지, 실제 흐름은 보드에서 시작합니다.</div>
              </div>
              <div className="bg-white/5 px-6 py-5 text-sm leading-6 text-slate-300">
                홈은 제품의 인상을 만들고, 이 페이지는 사용 흐름을 이해하게 돕습니다. 실제 판단과 기록은 실행 보드에서 이어집니다.
              </div>
              <div className="bg-slate-950 px-6 py-5">
                <div className="flex flex-wrap gap-3">
                  <Link href="/workspace" className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100">
                    실행 보드 열기
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/" className="avl-btn h-11 border border-white/12 bg-white/6 px-5 text-white hover:bg-white/10">
                    홈으로 돌아가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
