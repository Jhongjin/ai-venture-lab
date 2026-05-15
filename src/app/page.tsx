import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import {
  ArrowRight,
  CheckCircle,
  ClipboardText,
  FileDoc,
  GridFour,
  Path,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
  UsersThree,
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

const principles = [
  {
    title: "AI가 먼저 채웁니다",
    body: "후보와 질문, 산출물 뼈대를 먼저 만듭니다.",
    icon: Sparkle,
  },
  {
    title: "사람은 결론에 집중합니다",
    body: "진행과 보강, 전환 같은 결론만 빠르게 정하면 됩니다.",
    icon: CheckCircle,
  },
  {
    title: "협업은 옵션으로 붙습니다",
    body: "기본은 혼자 끝까지 가고, 필요할 때만 팀 초대를 붙입니다.",
    icon: UsersThree,
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
              <a href="#principles" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                principles
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

        <section className="mt-4 border border-slate-950 bg-white">
          <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,0.78fr)_minmax(620px,1.22fr)]">
            <div className="bg-[#f7f6f2] px-6 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
              <div className="avl-kicker text-slate-700">
                <ClipboardText size={14} />
                idea to MVP operating system
              </div>
              <h1
                className="mt-8 max-w-[10ch] text-[42px] font-normal leading-[0.94] tracking-[-0.05em] text-slate-950 md:max-w-none md:whitespace-nowrap md:text-[58px] xl:text-[72px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                AI Venture Lab
              </h1>
              <p className="mt-6 max-w-[15ch] text-[24px] font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-[30px] xl:text-[34px]">
                흩어진 아이디어를 실행할 후보로 정리하고, 검증부터 실행까지 한 흐름으로 이어갑니다.
              </p>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-7 text-slate-600">
                회의 기록, 대화 초안, 브리프 메모처럼 거칠게 시작해도 됩니다. AI가 후보와 질문, 실행 패키지의 첫 버전을 만들고,
                사용자는 중요한 판단만 이어가면 됩니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/workspace" className="avl-btn avl-btn-primary h-11 px-5 text-sm">
                  지금 시작
                  <ArrowRight size={16} />
                </Link>
                <a href="#workflow" className="avl-btn avl-btn-secondary h-11 px-5 text-sm">
                  어떻게 작동하나
                </a>
              </div>

              <div className="mt-10 grid gap-px border border-slate-300 bg-slate-300 sm:grid-cols-2">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="bg-white px-4 py-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
                    <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d0f14] p-4 sm:p-5">
              <LandingHeroVisual />
            </div>
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

        <section id="principles" className="mt-4 border-t border-slate-300 bg-transparent">
          <div className="grid gap-px bg-slate-300 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="bg-[#f7f6f2] px-6 py-6 sm:px-7">
              <div className="avl-kicker">principles</div>
              <div className="mt-3 max-w-[10ch] text-[34px] font-semibold leading-[1.02] tracking-tight text-slate-950">
                한 사람이 끝까지 밀 수 있게 구조를 단순하게 접습니다.
              </div>
              <p className="mt-4 max-w-[28ch] text-sm leading-6 text-slate-600">
                제품을 이해시키는 데서 멈추지 않고, 지금 검토할 후보와 다음 행동을 먼저 전면에 꺼내는 방식으로 설계했습니다.
              </p>
            </div>

            <div className="grid gap-px bg-slate-300 md:grid-cols-3">
              {principles.map((block) => {
                const Icon = block.icon;
                return (
                  <article key={block.title} className="grid grid-rows-[78px_minmax(0,1fr)] gap-px bg-slate-200">
                    <div className="bg-white px-6 py-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="avl-kicker">{block.title}</div>
                        <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                          <Icon size={18} />
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#fbfbf8] px-6 py-6 text-sm leading-6 text-slate-700">{block.body}</div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-4 border-t border-slate-950 bg-slate-950 text-white">
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
