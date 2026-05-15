import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import {
  ArrowRight,
  FileDoc,
  GridFour,
  Path,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { LandingHeroVisual } from "@/components/landing-hero-visual";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어를 검증하고, 기획과 MVP 실행까지 이어주는 AI venture workspace입니다.",
};

const heroStats = [
  { value: "01", label: "지금 검토할 후보" },
  { value: "07d", label: "첫 검증 스프린트" },
  { value: "1 board", label: "하나의 실행 보드" },
  { value: "solo-first", label: "필요할 때만 협업" },
];

const workflowSteps = [
  {
    id: "01",
    title: "아이디어 초안에서 후보를 꺼냅니다",
    body: "회의 내용과 대화를 넣으면 후보 1건과 검증 질문을 먼저 분리합니다.",
    icon: Sparkle,
  },
  {
    id: "02",
    title: "검증과 판단을 같은 보드에서 끝냅니다",
    body: "수요, 리스크, 7일 실험, 전환 판단을 여러 문서로 나누지 않고 한 흐름으로 이어갑니다.",
    icon: ShieldCheck,
  },
  {
    id: "03",
    title: "기획과 MVP 실행으로 넘깁니다",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단이 같은 맥락 안에 남습니다.",
    icon: RocketLaunch,
  },
];

const outputs = [
  { title: "아이디어 브리프", icon: FileDoc },
  { title: "검증 패키지", icon: ShieldCheck },
  { title: "MVP 범위", icon: GridFour },
  { title: "실행 태스크", icon: Path },
];

export default function HomePage() {
  return (
    <main className={`min-h-screen overflow-x-hidden bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
        <header className="border-b border-slate-300 bg-white/92 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="avl-kicker text-slate-700">
                <Sparkle size={14} />
                AI Venture Lab
              </div>
              <span className="avl-pill avl-pill-neutral">landing</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a href="#workflow" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                workflow
              </a>
              <a href="#outputs" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                outputs
              </a>
              <Link href="/guide" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                guide
              </Link>
              <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                실행 보드 열기
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-4 overflow-hidden border border-slate-950 bg-[#0d0f14] text-white">
          <div className="grid gap-px bg-white/8 xl:grid-cols-[minmax(360px,0.72fr)_minmax(0,1.28fr)]">
            <div className="relative overflow-hidden flex flex-col justify-between bg-[#0d0f14] px-6 py-8 sm:px-8 sm:py-10 xl:px-12 xl:py-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 82% 16%, rgba(245,239,227,0.14), transparent 28%), radial-gradient(circle at 18% 74%, rgba(188,211,255,0.12), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 38%)",
                }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(245,239,227,0.3),transparent)]" />
              <div>
                <div className="avl-kicker !text-slate-400">
                  <Sparkle size={14} />
                  idea to MVP operating system
                </div>
                <h1
                  className="relative mt-8 text-[42px] font-normal leading-[0.94] tracking-[-0.05em] text-white md:whitespace-nowrap md:text-[58px] xl:text-[78px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  <span className="text-[#bcd3ff]">AI</span>{" "}
                  <span>Venture Lab</span>
                </h1>
                <p className="relative mt-8 max-w-[12ch] text-[24px] font-semibold leading-[1.04] tracking-tight text-white sm:text-[32px] xl:text-[38px]">
                  아이디어를 실행 후보로 정리하고, 검증과 실행을 한 흐름으로 이어갑니다.
                </p>
                <p className="relative mt-5 max-w-[48ch] text-[15px] leading-7 text-slate-300">
                  회의 내용이나 브리프 초안만 있어도 충분합니다. AI가 후보와 질문, 실행 초안을 먼저 정리하면 사람은 중요한 판단만 이어가면 됩니다.
                </p>
              </div>

              <div className="relative mt-10">
                <div className="flex flex-wrap gap-3">
                  <Link href="/workspace" className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100">
                    지금 시작
                    <ArrowRight size={16} />
                  </Link>
                  <a href="#workflow" className="avl-btn h-11 border border-white/14 bg-white/6 px-5 text-sm text-white hover:bg-white/10">
                    작동 흐름 보기
                  </a>
                </div>

                <div className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="bg-[#11151f] px-4 py-4">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                      <div className="mt-2 text-[24px] font-semibold tracking-tight text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <LandingHeroVisual variant="hero" />
          </div>
        </section>

        <section id="workflow" className="mt-4 border-t border-slate-300 bg-transparent">
          <div className="grid gap-px bg-slate-300 xl:grid-cols-[300px_minmax(0,1fr)]">
            <div className="bg-[#f7f6f2] px-6 py-7 sm:px-7">
              <div className="avl-kicker">workflow</div>
              <h2
                className="mt-4 max-w-[7ch] text-[42px] font-normal leading-[0.94] tracking-[-0.04em] text-slate-950 sm:text-[58px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                아이디어 → 후보 → 실행.
              </h2>
              <p className="mt-4 max-w-[28ch] text-sm leading-6 text-slate-600">
                큰 설명보다, 지금 어디까지 밀었는지 바로 읽히는 흐름으로 구성합니다.
              </p>
            </div>

            <div className="grid gap-px bg-slate-300 md:grid-cols-2">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.id}
                    className={`grid grid-rows-[72px_minmax(0,1fr)] gap-px bg-slate-200 ${step.id === "01" ? "md:col-span-2" : ""}`}
                  >
                    <div className="bg-[#f7f6f2] px-6 py-5 sm:px-7">
                      <div className="flex items-center justify-between gap-3">
                        <span className="avl-icon-frame rounded-none border-slate-200 bg-white">
                          <Icon size={18} />
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {step.id}
                        </span>
                      </div>
                    </div>
                    <div className={`bg-white px-6 py-6 sm:px-7 ${step.id === "01" ? "md:grid md:grid-cols-[minmax(0,1.15fr)_220px] md:items-end md:gap-8" : ""}`}>
                      <h3 className={`text-[28px] font-semibold leading-[1.02] tracking-tight text-slate-950 ${step.id === "01" ? "max-w-[11ch]" : "max-w-[12ch]"}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm leading-6 text-slate-600 ${step.id === "01" ? "mt-5 max-w-[24ch] md:mt-0" : "mt-4 max-w-[28ch]"}`}>{step.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="outputs" className="mt-4 border-t border-slate-950 bg-slate-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="bg-slate-950 px-6 py-7 sm:px-7">
              <div className="avl-kicker !text-slate-300">outputs</div>
              <h2
                className="mt-4 max-w-[12ch] text-[38px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[46px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                결국 남는 건 읽는 문서가 아니라 바로 넘길 수 있는 실행 패키지입니다.
              </h2>
              <p className="mt-4 max-w-[60ch] text-sm leading-6 text-slate-300">
                후보, 질문, 리스크, 실행 태스크, 출시 판단, 학습 리포트가 끊기지 않는 하나의 흐름으로 남습니다.
              </p>
            </div>

            <div className="grid gap-px bg-white/10">
              <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                {outputs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="bg-slate-950 px-5 py-5">
                      <span className="avl-icon-frame rounded-none border-white/10 bg-white/6 text-slate-100">
                        <Icon size={18} />
                      </span>
                      <div className="mt-4 text-sm font-semibold text-slate-100">{item.title}</div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-950 px-6 py-5">
                <div className="flex flex-wrap gap-3">
                  <Link href="/workspace" className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100">
                    실행 보드 열기
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/guide" className="avl-btn h-11 border border-white/12 bg-white/6 px-5 text-white hover:bg-white/10">
                    기능 설명서는 가이드에서 보기
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
