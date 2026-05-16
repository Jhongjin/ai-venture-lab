import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import {
  ArrowRight,
  Brain,
  ChartLineUp,
  ChatCircleText,
  ClipboardText,
  FadersHorizontal,
  FileDoc,
  GridFour,
  ListChecks,
  Path,
  RocketLaunch,
  ShieldCheck,
  Sparkle,
  Target,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { LandingHeroVisual } from "@/components/landing-hero-visual";
import { LandingMiddleMotion } from "@/components/landing-middle-motion";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어 검증부터 기획, MVP 실행까지 한 흐름으로 이어주는 AI 실행 워크스페이스입니다.",
};

const heroStats = [
  { value: "01", label: "오늘 볼 후보" },
  { value: "07d", label: "첫 검증 기간" },
  { value: "1 board", label: "하나의 작업 보드" },
  { value: "solo-first", label: "필요할 때만 협업" },
];

const workflowSteps = [
  {
    id: "01",
    title: "초안 수집",
    ai: "회의 메모, 대화 기록, 브리프 초안을 읽고 후보와 첫 질문의 뼈대를 잡습니다.",
    human: "오늘 볼 후보 한 건을 고릅니다.",
    result: "후보 한 건 + 비교 후보 큐",
    icon: ClipboardText,
  },
  {
    id: "02",
    title: "후보 선별",
    ai: "이 후보를 바로 검증할지, 더 보강할지, 접을지 1차로 가릅니다.",
    human: "왜 지금 이 후보를 먼저 봐야 하는지 짧게 확인합니다.",
    result: "우선순위 + 검토 메모",
    icon: Sparkle,
  },
  {
    id: "03",
    title: "검증 판단",
    ai: "리스크, 7일 실험, 질문과 중단 기준을 한 흐름으로 정리합니다.",
    human: "리스크와 실험 조건을 승인하거나 수정합니다.",
    result: "검증 패키지",
    icon: ShieldCheck,
  },
  {
    id: "04",
    title: "실행 패키지",
    ai: "PRD, MVP 범위, 실행 태스크, 출시 판단 초안을 묶어 만듭니다.",
    human: "어디까지 만들고 언제 시작할지 결정합니다.",
    result: "바로 넘길 실행 패키지",
    icon: ShieldCheck,
  },
];

const workflowOverview = [
  {
    eyebrow: "AI 초안",
    title: "초안과 질문의 뼈대를 잡습니다",
    body: "후보, 질문, 리스크, 실행 초안을 정리해 둡니다.",
    chips: ["후보 한 건", "질문 초안", "리스크 메모"],
  },
  {
    eyebrow: "사람의 판단",
    title: "지금 정해야 할 것만 앞에 둡니다",
    body: "후보 선택, 실험 조건, 진행 여부만 빠르게 확인합니다.",
    chips: ["우선 후보", "실험 조건", "진행/보강"],
  },
  {
    eyebrow: "보드에 남는 것",
    title: "실행 패키지와 다음 액션이 이어집니다",
    body: "검증 패키지, PRD, 실행 태스크, 학습 리포트가 이어집니다.",
    chips: ["검증 패키지", "PRD", "학습 리포트"],
  },
];

const useCases = [
  {
    title: "회의는 많은데 다음 행동이 남지 않을 때",
    body: "회의 메모와 대화는 쌓이는데 정작 검토할 후보가 보이지 않을 때, 후보 한 건과 질문 초안부터 꺼냅니다.",
    tag: "운영 회의 직후",
    icon: ChatCircleText,
  },
  {
    title: "아이디어는 있는데 검증이 문서마다 흩어질 때",
    body: "후보 정리, 리스크, 7일 실험, 판단 기준을 나누지 않고 한 보드에 남깁니다.",
    tag: "검증 단계",
    icon: FadersHorizontal,
  },
  {
    title: "기획부터 MVP 실행까지 한 사람이 끌고 가야 할 때",
    body: "팀 초대는 옵션으로 두고, 혼자 시작해도 실행 패키지까지 이어지도록 정리합니다.",
    tag: "solo-first",
    icon: UsersThree,
  },
];

const bestFitRoute = ["회의 메모", "후보 한 건", "질문 초안", "실행 메모"];

const bestFitChecks = [
  ["fit", "다음 행동을 정해야 하는데 후보와 질문이 흩어져 있을 때"],
  ["skip", "요구사항과 작업 범위가 이미 정해져 보관만 하면 될 때"],
  ["watch", "법무, 의료, 금융처럼 외부 검토가 먼저 필요한 아이디어일 때"],
];

const aiOutputs = [
  {
    title: "후보 정리",
    body: "오늘 볼 후보 한 건과 비교 후보를 분리합니다.",
    meta: "candidate queue",
    icon: Sparkle,
  },
  {
    title: "검증 질문",
    body: "사용자, 구매자, 문제 강도를 확인할 질문을 제안합니다.",
    meta: "question pack",
    icon: Brain,
  },
  {
    title: "리스크 초안",
    body: "개인정보, 운영, 법무, 신뢰 리스크를 초기에 정리합니다.",
    meta: "risk frame",
    icon: ShieldCheck,
  },
  {
    title: "7일 실험안",
    body: "기간, 대상, 성공 기준, 중단 기준을 함께 세웁니다.",
    meta: "validation sprint",
    icon: ChartLineUp,
  },
  {
    title: "PRD와 MVP 범위",
    body: "무엇을 만들고 무엇을 뒤로 미룰지 정리합니다.",
    meta: "scope draft",
    icon: GridFour,
  },
  {
    title: "실행 태스크",
    body: "디자인, 개발, QA, 출시 판단에 필요한 작업으로 바꿉니다.",
    meta: "task board",
    icon: ListChecks,
  },
];

const outputs = [
  {
    title: "아이디어 브리프",
    body: "배경, 문제, 대상, 구매 맥락을 한 장으로 정리합니다.",
    icon: FileDoc,
  },
  {
    title: "검증 패키지",
    body: "질문, 리스크, 실험, 중단 기준까지 같이 남깁니다.",
    icon: ShieldCheck,
  },
  {
    title: "MVP 범위",
    body: "지금 만들 것과 나중에 미룰 것을 가릅니다.",
    icon: Target,
  },
  {
    title: "실행 태스크",
    body: "기획, 디자인, 개발, QA가 바로 시작할 기준으로 넘깁니다.",
    icon: Path,
  },
  {
    title: "출시 판단",
    body: "보강, 전환, 진행, 중단 중 어디로 갈지 남깁니다.",
    icon: RocketLaunch,
  },
  {
    title: "학습 리포트",
    body: "출시 후 신호를 다시 보드로 가져와 다음 판단에 씁니다.",
    icon: ChartLineUp,
  },
];

const outputColumns = [
  {
    eyebrow: "candidate layer",
    title: "판단 전에 채우는 초안",
    body: "후보와 검증 질문, 초기 리스크를 함께 묶어 바로 판단할 수 있는 상태로 만듭니다.",
    items: [aiOutputs[0], aiOutputs[1], aiOutputs[2]],
  },
  {
    eyebrow: "build layer",
    title: "실행으로 바로 넘어가는 구조",
    body: "실험 조건, MVP 범위, 실행 태스크를 이어서 정리해 바로 넘길 수 있게 만듭니다.",
    items: [aiOutputs[3], aiOutputs[4], aiOutputs[5]],
  },
  {
    eyebrow: "handoff pack",
    title: "끝에 남는 실전 패키지",
    body: "기획 문서가 아니라 다음 결정을 계속 밀어주는 기록과 패키지가 보드에 남습니다.",
    items: [outputs[0], outputs[1], outputs[4], outputs[5]],
  },
];

const packageHighlights = [
  "아이디어 브리프",
  "검증 패키지",
  "MVP 범위",
  "실행 태스크",
  "출시 판단",
  "학습 리포트",
];

type MixedOutputItem = (typeof aiOutputs)[number] | (typeof outputs)[number];

function getOutputMeta(item: MixedOutputItem) {
  return "meta" in item ? item.meta : "deliverable";
}

export default function HomePage() {
  return (
    <main id="main-content" className={`min-h-screen overflow-x-hidden bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
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
              <a href="#best-fit" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                best fit
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
                    "radial-gradient(circle at 84% 14%, rgba(245,239,227,0.18), transparent 26%), radial-gradient(circle at 18% 76%, rgba(188,211,255,0.16), transparent 22%), radial-gradient(circle at 42% 42%, rgba(96,165,250,0.08), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 38%)",
                }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(245,239,227,0.3),transparent)]" />
              <div>
                <div className="avl-kicker !text-slate-400">
                  <Sparkle size={14} />
                  idea to MVP operating system
                </div>
                <h1
                  className="relative mt-8 text-[42px] font-normal leading-[0.94] tracking-[-0.05em] text-white md:whitespace-nowrap md:text-[58px] xl:text-[60px] 2xl:text-[78px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  <span className="text-[#bcd3ff]">AI</span>{" "}
                  <span>Venture Lab</span>
                </h1>
                <p className="relative mt-8 max-w-[16ch] break-keep text-[24px] font-semibold leading-[1.04] tracking-tight text-white sm:text-[32px] xl:text-[38px]">
                  흩어진 아이디어를 실행 후보로 묶고, 검증과 실행까지 이어갑니다.
                </p>
                <p className="relative mt-5 max-w-[48ch] text-[15px] leading-7 text-slate-300">
                  회의 메모나 브리프 초안만 있어도 시작할 수 있습니다. AI가 후보와 질문, 실행 초안을 먼저 정리하고 사용자는 중요한 판단만 보태면 됩니다.
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

        <section id="workflow" className="mt-4 overflow-hidden border-t border-slate-300 bg-[#f6f4ee]">
          <div className="grid gap-px bg-slate-300">
            <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]">
              <div className="relative min-h-[440px] overflow-hidden bg-[#f6f4ee] px-6 py-8 sm:px-8 xl:px-10 xl:py-10">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-70"
                  style={{
                    background:
                      "radial-gradient(circle at 12% 16%, rgba(255,255,255,0.9), transparent 20%), radial-gradient(circle at 82% 78%, rgba(188,211,255,0.32), transparent 26%)",
                  }}
                />
                <div aria-hidden="true" className="absolute bottom-8 right-8 h-44 w-44 border border-slate-300/70" />
                <div aria-hidden="true" className="absolute bottom-16 right-16 h-20 w-20 bg-[#10141d]" />
                <div className="relative">
                  <div className="avl-kicker">workflow</div>
                  <h2
                    className="mt-6 max-w-[18ch] break-keep text-[34px] font-normal leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-[50px]"
                    style={{ fontFamily: "var(--font-newsreader)" }}
                  >
                    <span className="block">아이디어에서</span>
                    <span className="block">실행 판단까지</span>
                    <span className="block">한 흐름으로.</span>
                  </h2>
                  <p className="mt-6 max-w-[40ch] text-sm leading-7 text-slate-600">
                    단계를 길게 설명하기보다, AI 초안과 사람의 판단이 어디서 만나는지 선명하게 보여줍니다.
                  </p>

                  <div className="mt-12 grid max-w-[520px] grid-cols-[0.3fr_1fr] gap-px bg-slate-300">
                    <div className="bg-slate-950 px-4 py-5 text-white">
                      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">01</div>
                      <div className="mt-12 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">current candidate</div>
                    </div>
                    <div className="bg-white/80 px-4 py-5">
                      <div className="grid grid-cols-4 gap-2">
                        {workflowSteps.map((step, index) => (
                          <span
                            key={step.id}
                            className={`h-2 ${index === 0 ? "bg-slate-950" : index === 1 ? "bg-[#c9b47a]" : index === 2 ? "bg-[#bcd3ff]" : "bg-slate-500"}`}
                            aria-label={step.title}
                          />
                        ))}
                      </div>
                      <p className="mt-6 text-sm font-semibold leading-6 text-slate-950">후보 하나를 앞으로 꺼내고 검증, 실행, 출시 판단을 같은 보드에 남깁니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[560px] overflow-hidden bg-[#10141d] px-6 py-7 text-white sm:px-8">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.26]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div aria-hidden="true" className="absolute bottom-8 right-8 hidden h-28 w-28 border border-white/10 lg:block" />
                <div aria-hidden="true" className="absolute left-[7%] right-[8%] top-[48%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(188,211,255,0.72),rgba(255,255,255,0.22),transparent)] lg:block" />
                <div className="relative grid min-h-[506px] gap-8 lg:grid-cols-[0.36fr_0.64fr]">
                  <div className="flex flex-col justify-between gap-8">
                    <div>
                      <div className="avl-kicker !text-slate-400">signal route</div>
                      <h3 className="mt-5 max-w-[16ch] break-keep text-[32px] font-semibold leading-[1.02] tracking-tight text-white">
                        <span className="block">AI 초안이</span>
                        <span className="block">판단을 거쳐</span>
                        <span className="block">실행 패키지로</span>
                        <span className="block">바뀝니다.</span>
                      </h3>
                      <p className="mt-5 max-w-[32ch] text-sm leading-7 text-slate-300">
                        후보, 질문, 리스크가 흘러가고 사용자가 확인할 지점만 선명하게 남습니다.
                      </p>
                    </div>
                    <div className="grid gap-px bg-white/10">
                      {["AI 초안", "판단 확인", "실행 패키지"].map((label, index) => (
                        <div key={label} className={`${index === 0 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-3 py-4`}>
                          <div className="font-mono text-[11px] uppercase tracking-[0.2em]">0{index + 1}</div>
                          <div className="mt-7 text-xs font-semibold">{label}</div>
                          <div className="mt-3 h-px bg-current opacity-30" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative grid gap-5 lg:block">
                    {workflowOverview.map((item, index) => (
                      <article
                        key={item.eyebrow}
                        className={`relative border-l border-[#bcd3ff]/40 bg-white/[0.052] px-5 py-4 backdrop-blur lg:absolute ${
                          index === 0
                            ? "lg:left-0 lg:top-0 lg:w-[46%]"
                            : index === 1
                              ? "lg:right-0 lg:top-[118px] lg:w-[47%]"
                              : "lg:bottom-0 lg:left-0 lg:w-[48%]"
                        }`}
                      >
                        <span className="absolute -left-[7px] top-6 h-3 w-3 border border-[#bcd3ff] bg-[#10141d]" />
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">0{index + 1}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.eyebrow}</div>
                        </div>
                        <h3 className="mt-3 max-w-[22ch] break-keep text-[22px] font-semibold leading-[1.04] tracking-tight text-white">{item.title}</h3>
                        <p className="mt-3 max-w-[42ch] text-sm leading-6 text-slate-300">{item.body}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {item.chips.map((chip, chipIndex) => (
                            <span
                              key={chip}
                              className={`border px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em] ${
                                chipIndex === 0
                                  ? "border-[#bcd3ff]/30 bg-[#bcd3ff]/10 text-[#dbe8ff]"
                                  : "border-white/10 bg-white/[0.04] text-slate-400"
                              }`}
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="best-fit" className="mt-4 overflow-hidden border-t border-slate-300 bg-[#eaf0fb]">
          <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,1.42fr)]">
            <div className="relative overflow-hidden bg-[#10141d] px-6 py-8 text-white sm:px-8 xl:px-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.34]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />
              <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-32 bg-[radial-gradient(circle_at_18%_100%,rgba(188,211,255,0.22),transparent_42%)]" />
              <div aria-hidden="true" className="absolute right-8 top-8 h-28 w-28 border border-white/10" />
              <div className="relative">
                <div className="avl-kicker !text-slate-300">best fit</div>
                <h2
                  className="mt-5 max-w-[15ch] break-keep text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[50px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  <span className="block">후보는 있는데</span>
                  <span className="block">다음 행동이</span>
                  <span className="block">막혀 있을 때.</span>
                </h2>
                <p className="mt-5 max-w-[40ch] text-sm leading-7 text-slate-300">
                  사용법을 익혀야 하는 도구라기보다, 실행 직전에 멈춘 지점을 빨리 여는 작업 화면에 가깝습니다.
                </p>

                <div className="mt-10 border-y border-white/10">
                  {bestFitChecks.map(([label, body], index) => (
                    <div key={label} className="grid gap-4 border-b border-white/10 py-4 last:border-b-0 sm:grid-cols-[0.22fr_0.78fr]">
                      <div className={`font-mono text-[11px] uppercase tracking-[0.2em] ${index === 0 ? "text-[#bcd3ff]" : index === 1 ? "text-slate-500" : "text-[#c9b47a]"}`}>{label}</div>
                      <div className="text-sm leading-6 text-slate-200">{body}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 grid grid-cols-4 gap-px bg-white/10">
                  {bestFitRoute.map((label, index) => (
                    <div key={label} className={`${index === 1 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-3 py-4`}>
                      <div className="font-mono text-[11px] uppercase tracking-[0.2em]">0{index + 1}</div>
                      <div className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em]">{label}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            <div className="relative overflow-hidden bg-[#eaf0fb] px-6 py-7 sm:px-8 xl:px-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />
              <div aria-hidden="true" className="absolute right-0 top-0 h-56 w-56 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.86),transparent_60%)]" />
              <div className="relative">
                <div className="grid gap-8 xl:grid-cols-[0.26fr_0.74fr]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">where it works</div>
                    <h3 className="mt-5 max-w-[20ch] break-keep text-[34px] font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-[38px]">
                      설명을 더 읽기보다, 다음 판단을 바로 꺼내야 할 때.
                    </h3>
                  </div>
                  <LandingMiddleMotion />
                </div>

                <div className="mt-8 grid gap-px bg-slate-300 lg:grid-cols-[1.1fr_0.95fr_0.95fr]">
                  {useCases.map((item, index) => {
                    const Icon = item.icon;
                    const bandTone =
                      index === 0
                        ? "bg-white"
                        : index === 1
                          ? "bg-[#fff8e9]"
                          : "bg-[#10141d] text-white";
                    const copyTone = index === 2 ? "text-slate-300" : "text-slate-600";
                    const labelTone = index === 2 ? "text-[#bcd3ff]" : "text-slate-500";
                    return (
                      <article key={item.title} className={`relative overflow-hidden px-5 py-5 sm:px-6 ${bandTone}`}>
                        <div className="flex items-start justify-between gap-4">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${index === 2 ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white/70"}`}>
                            <Icon size={17} />
                          </span>
                          <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${labelTone}`}>0{index + 1}</span>
                        </div>
                        <div className={`mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] ${labelTone}`}>{item.tag}</div>
                        <h3 className={`mt-3 max-w-[24ch] break-keep text-[21px] font-semibold leading-[1.05] tracking-tight ${index === 2 ? "text-white" : "text-slate-950"}`}>{item.title}</h3>
                        <p className={`mt-3 max-w-[42ch] text-sm leading-6 ${copyTone}`}>{item.body}</p>
                      </article>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="outputs" className="mt-4 overflow-hidden border-t border-slate-950 bg-slate-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,1.42fr)]">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-8 sm:px-8 xl:px-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.24]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-48 bg-[radial-gradient(circle_at_24%_100%,rgba(188,211,255,0.18),transparent_42%)]" />
              <div className="relative">
                <div className="avl-kicker !text-slate-300">artifact library</div>
                <h2
                  className="mt-5 max-w-[15ch] break-keep text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[46px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  <span className="block">AI 초안은</span>
                  <span className="block">실전 패키지로</span>
                  <span className="block">남습니다.</span>
                </h2>
                <p className="mt-5 max-w-[42ch] text-sm leading-7 text-slate-300">
                  후보 정리부터 학습 리포트까지, 각 산출물은 다음 판단을 빠르게 여는 작업 단위로 남습니다.
                </p>

                <div className="mt-10 border-y border-white/10">
                  {packageHighlights.map((label, index) => (
                    <div key={label} className="grid grid-cols-[0.18fr_0.62fr_0.2fr] border-b border-white/10 py-4 last:border-b-0">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">0{index + 1}</span>
                      <span className="text-sm font-semibold text-slate-100">{label}</span>
                      <span className="text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">ready</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">handoff rule</div>
                  <p className="mt-3 max-w-[38ch] text-sm leading-6 text-slate-300">
                    모든 산출물은 다음 판단을 바로 열 수 있는 짧은 작업 단위로 남깁니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              <div className="grid gap-px bg-white/10 xl:grid-cols-[1.08fr_0.94fr_1fr]">
                {outputColumns.map((column, columnIndex) => (
                  <article key={column.title} className={`${columnIndex === 0 ? "bg-[#11161f]" : columnIndex === 1 ? "bg-[#182233]" : "bg-[#0d1118]"} px-6 py-7 sm:px-8`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{column.eyebrow}</div>
                    <h3 className="mt-4 max-w-[16ch] break-keep text-[26px] font-semibold leading-[1.02] tracking-tight text-white">{column.title}</h3>
                    <p className="mt-4 max-w-[36ch] text-sm leading-6 text-slate-300">{column.body}</p>
                    <div className="mt-6 grid gap-px bg-white/10">
                      {column.items.slice(0, columnIndex === 2 ? 3 : 2).map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="grid grid-cols-[2.5rem_1fr] bg-[#0f141f] px-3 py-3">
                            <span className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.04] text-slate-100">
                              <Icon size={15} />
                            </span>
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{getOutputMeta(item)}</div>
                              <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>

              <div className="grid gap-px bg-white/10 lg:grid-cols-[1fr_0.7fr]">
                <div className="bg-[#10141d] px-6 py-6 sm:px-8">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">final package</div>
                  <p className="mt-3 max-w-[62ch] text-sm leading-6 text-slate-300">
                    결과는 설명서가 아니라 바로 검토하고 넘길 수 있는 실행 패키지로 남습니다.
                  </p>
                </div>
                <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                  <Link href="/workspace" className="avl-btn flex h-14 justify-center border-0 bg-white px-5 text-sm text-slate-950 hover:bg-slate-100">
                    실행 보드 열기
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/guide" className="avl-btn flex h-14 justify-center border-0 bg-white/6 px-5 text-white hover:bg-white/10">
                    가이드 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-4 border-t border-slate-300 bg-[#f6f4ee] px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="avl-kicker">handoff</div>
              <p
                className="mt-3 max-w-[22ch] break-keep text-[30px] font-normal leading-[1] tracking-[-0.03em] text-slate-950 sm:text-[38px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                AI가 준비하고, 사람이 판단하고, 보드는 기억합니다.
              </p>
            </div>
            <nav aria-label="landing footer" className="flex flex-wrap gap-2">
              <Link href="/workspace" className="avl-btn avl-btn-primary h-11 px-5">
                실행 보드 열기
                <ArrowRight size={16} />
              </Link>
              <Link href="/guide" className="avl-btn avl-btn-secondary h-11 px-5">
                가이드 보기
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
