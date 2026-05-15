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
    title: "초안 수집",
    ai: "회의 내용, 대화 기록, 브리프 초안을 읽고 후보와 첫 질문 뼈대를 만듭니다.",
    human: "지금 먼저 볼 후보 1건을 고릅니다.",
    result: "후보 1건 + 비교 후보 큐",
    icon: ClipboardText,
  },
  {
    id: "02",
    title: "후보 선별",
    ai: "후보를 바로 밀 것인지, 보강할 것인지, 접을 것인지 1차로 가릅니다.",
    human: "왜 이 후보가 지금 우선인지 짧게 확인합니다.",
    result: "우선순위 + 검토 메모",
    icon: Sparkle,
  },
  {
    id: "03",
    title: "검증 판단",
    ai: "리스크, 7일 실험, 질문과 중단 기준을 같은 흐름으로 정리합니다.",
    human: "리스크와 실험 조건을 승인하거나 수정합니다.",
    result: "검증 패키지",
    icon: ShieldCheck,
  },
  {
    id: "04",
    title: "실행 패키지",
    ai: "PRD, MVP 범위, 실행 태스크, 출시 판단 초안을 만듭니다.",
    human: "어디까지 만들고 언제 출발할지 결정합니다.",
    result: "바로 넘길 실행 패키지",
    icon: ShieldCheck,
  },
];

const workflowOverview = [
  {
    eyebrow: "AI가 먼저",
    title: "초안과 질문 뼈대를 먼저 세웁니다",
    body: "후보, 질문, 리스크, 실행 초안을 먼저 채워둡니다.",
    tone: "bg-white",
    border: "border-slate-200",
    chips: ["후보 1건", "질문 초안", "리스크 메모"],
  },
  {
    eyebrow: "사람이 보는 것",
    title: "지금 결정할 것만 앞으로 꺼냅니다",
    body: "후보 선택, 실험 조건, 출시 여부 같은 결정만 빠르게 확인합니다.",
    tone: "bg-[#f7f6f2]",
    border: "border-[#e7e0d5]",
    chips: ["우선 후보", "실험 조건", "진행/보강"],
  },
  {
    eyebrow: "한 보드에 남는 것",
    title: "패키지와 다음 행동이 같은 흐름에 남습니다",
    body: "검증 패키지, PRD, 실행 태스크, 학습 리포트가 이어집니다.",
    tone: "bg-[#eef3ff]",
    border: "border-[#d7e1f6]",
    chips: ["검증 패키지", "PRD", "학습 리포트"],
  },
];

const useCases = [
  {
    title: "회의는 많은데, 다음 행동이 남지 않을 때",
    body: "회의 메모와 대화는 쌓이는데 정작 지금 검토할 후보가 안 보일 때, 후보 1건과 질문 초안부터 앞으로 꺼냅니다.",
    tag: "운영 회의 직후",
    icon: ChatCircleText,
  },
  {
    title: "아이디어는 있는데 검증이 문서마다 흩어질 때",
    body: "후보 정리, 리스크, 7일 실험, 판단 기준을 여기저기 나누지 않고 한 보드에 남깁니다.",
    tag: "검증 단계",
    icon: FadersHorizontal,
  },
  {
    title: "기획부터 MVP 실행까지 한 사람이 끌고 가야 할 때",
    body: "팀 초대는 옵션으로 남기고, 기본은 혼자 시작해도 끝까지 밀 수 있게 실행 패키지까지 자동으로 이어갑니다.",
    tag: "solo-first",
    icon: UsersThree,
  },
];

const bestFitSignals = [
  {
    title: "회의 직후",
    body: "후보 하나와 질문 초안을 먼저 세워 다음 회의 전까지 바로 움직일 수 있게 합니다.",
    tone: "bg-[#f7f6f2]",
  },
  {
    title: "검증 초반",
    body: "리스크, 7일 실험, 판단 기준이 문서마다 흩어지기 전에 한곳에 묶습니다.",
    tone: "bg-white",
  },
  {
    title: "solo-first",
    body: "한 사람이 끌고 가다가 필요할 때만 팀을 붙이는 흐름에 맞게 설계했습니다.",
    tone: "bg-[#eef3ff]",
  },
];

const aiOutputs = [
  {
    title: "후보 정리",
    body: "지금 볼 후보 1건과 비교 후보를 먼저 분리합니다.",
    meta: "candidate queue",
    icon: Sparkle,
  },
  {
    title: "검증 질문",
    body: "사용자, 구매자, 문제 강도를 확인할 질문을 먼저 제안합니다.",
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
    body: "기간, 대상, 성공 기준, 중단 기준까지 함께 세웁니다.",
    meta: "validation sprint",
    icon: ChartLineUp,
  },
  {
    title: "PRD와 MVP 범위",
    body: "무엇을 만들고 무엇을 뒤로 미룰지 바로 정리합니다.",
    meta: "scope draft",
    icon: GridFour,
  },
  {
    title: "실행 태스크",
    body: "디자인, 개발, QA, 출시 판단에 필요한 실행 항목으로 바꿉니다.",
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
    body: "지금 만들 것과 나중에 미룰 것을 명확히 가릅니다.",
    icon: Target,
  },
  {
    title: "실행 태스크",
    body: "기획, 디자인, 개발, QA 착수 기준으로 바로 넘깁니다.",
    icon: Path,
  },
  {
    title: "출시 판단",
    body: "보강, 전환, 진행, 중단 중 어느 쪽으로 갈지 남깁니다.",
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
    title: "판단 전 먼저 채우는 초안",
    body: "후보를 세우고, 검증 질문과 초기 리스크를 함께 묶어 바로 판단 가능한 상태를 만듭니다.",
    items: [aiOutputs[0], aiOutputs[1], aiOutputs[2]],
  },
  {
    eyebrow: "build layer",
    title: "실행에 바로 붙는 구조",
    body: "실험 조건, MVP 범위, 실행 태스크까지 이어서 정리해 바로 넘길 수 있는 실행면으로 바꿉니다.",
    items: [aiOutputs[3], aiOutputs[4], aiOutputs[5]],
  },
  {
    eyebrow: "handoff pack",
    title: "끝에 남는 실전 패키지",
    body: "기획 문서가 아니라, 다음 결정을 계속 밀 수 있는 기록과 패키지가 보드 안에 남습니다.",
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
          <div className="grid gap-px bg-slate-300">
            <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
              <div className="bg-[#f7f6f2] px-6 py-8 sm:px-8">
                <div className="avl-kicker">workflow</div>
                <h2
                  className="mt-4 max-w-[13ch] text-[32px] font-normal leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-[46px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  한 줄 아이디어에서 실행 판단까지, 같은 흐름으로 정리합니다.
                </h2>
                <p className="mt-4 max-w-[42ch] text-sm leading-6 text-slate-600">
                  기능을 길게 설명하기보다, 단계마다 AI가 먼저 무엇을 만들고 사람은 어디서 결론을 내리는지 한눈에 읽히게 구성했습니다.
                </p>
              </div>

              <div className="grid gap-px bg-slate-300 md:grid-cols-3">
                {workflowOverview.map((item, index) => (
                  <article key={item.eyebrow} className={`${item.tone} ${item.border} flex min-h-[290px] flex-col border px-5 py-6`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.eyebrow}</div>
                    <h3 className="mt-4 max-w-[15ch] text-[22px] font-semibold leading-[1.08] tracking-tight text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-[26ch] text-sm leading-6 text-slate-700">{item.body}</p>

                    <div className="mt-auto pt-8">
                      <div className="rounded-none border border-slate-200/80 bg-slate-950/[0.03] px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.chips.map((chip) => (
                            <span key={chip} className="avl-pill avl-pill-neutral border-slate-300 bg-white/80 text-[10px] text-slate-600">
                              {chip}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {[0, 1, 2, 3].map((signalIndex) => (
                            <div
                              key={signalIndex}
                              className={`h-11 rounded-none border border-slate-200/80 ${
                                index === 0
                                  ? signalIndex === 1
                                    ? "bg-[#eef3ff]"
                                    : "bg-white/70"
                                  : index === 1
                                    ? signalIndex === 2
                                      ? "bg-[#fff5dd]"
                                      : "bg-white/70"
                                    : signalIndex === 0
                                      ? "bg-[#dfe8ff]"
                                      : "bg-white/80"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="bg-white px-4 py-4 sm:px-6 sm:py-6">
              <div className="grid gap-4 xl:grid-cols-12">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon;
                  const stepSurfaces = [
                    "bg-white",
                    "bg-[#f7f6f2]",
                    "bg-[#eef3ff]",
                    "bg-slate-950 text-white",
                  ];

                  return (
                    <article
                      key={step.id}
                      className={`xl:col-span-3 flex h-full flex-col border border-slate-200 px-5 py-5 ${stepSurfaces[index]}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className={`avl-icon-frame rounded-none ${index === 3 ? "border-white/10 bg-white/6 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                        >
                          <Icon size={18} />
                        </span>
                        <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${index === 3 ? "text-slate-500" : "text-slate-400"}`}>
                          {step.id}
                        </span>
                      </div>

                      <h3 className={`mt-7 max-w-[12ch] text-[26px] font-semibold leading-[1.02] tracking-tight ${index === 3 ? "text-white" : "text-slate-950"}`}>
                        {step.title}
                      </h3>

                      <p className={`mt-4 text-sm leading-6 ${index === 3 ? "text-slate-300" : "text-slate-600"}`}>{step.ai}</p>

                      <div className={`mt-6 grid gap-4 border-t pt-4 ${index === 3 ? "border-white/10" : "border-slate-200"}`}>
                        <div>
                          <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${index === 3 ? "text-slate-500" : "text-slate-400"}`}>사람이 결정</div>
                          <p className={`mt-2 text-sm leading-6 ${index === 3 ? "text-slate-200" : "text-slate-700"}`}>{step.human}</p>
                        </div>
                        <div className="mt-auto">
                          <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${index === 3 ? "text-slate-500" : "text-slate-400"}`}>남는 결과</div>
                          <p className={`mt-2 text-sm font-medium ${index === 3 ? "text-white" : "text-slate-900"}`}>{step.result}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 border-t border-slate-300 bg-transparent">
          <div className="grid gap-px bg-slate-300">
            <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
              <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
                <div className="avl-kicker !text-slate-300">best fit</div>
                <h2
                  className="mt-4 max-w-[11ch] text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[44px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  지금 후보와 다음 행동이 막혀 있을 때 가장 잘 맞습니다.
                </h2>
                <p className="mt-4 max-w-[42ch] text-sm leading-6 text-slate-300">
                  기능을 익히는 제품이라기보다, 아이디어가 실행 직전 멈추는 구간을 빠르게 여는 작업면에 가깝습니다.
                </p>
                <div className="mt-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
                  <div className="bg-slate-950/80 px-4 py-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">잘 맞는 경우</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">회의 직후, 검증 초반, 솔로 실행처럼 결정을 빨리 앞으로 꺼내야 할 때</p>
                  </div>
                  <div className="bg-slate-950/80 px-4 py-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">덜 맞는 경우</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">이미 요구사항이 확정돼 있고, 단순 문서 보관만 필요할 때</p>
                  </div>
                </div>
              </div>

              <div className="bg-white px-6 py-8 sm:px-8">
                <div className="grid gap-4 md:grid-cols-12">
                  {useCases.map((item, index) => {
                    const Icon = item.icon;
                    const spanClass = index === 0 ? "md:col-span-5" : index === 1 ? "md:col-span-4" : "md:col-span-3";

                    return (
                      <article key={item.title} className={`border border-slate-200 px-5 py-5 ${spanClass} ${index === 1 ? "bg-[#f7f6f2]" : "bg-white"}`}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="avl-icon-frame rounded-none border-slate-200 bg-white">
                            <Icon size={18} />
                          </span>
                          <span className={`avl-pill ${index === 1 ? "avl-pill-brand" : "avl-pill-neutral"}`}>{item.tag}</span>
                        </div>
                        <h3 className="mt-5 max-w-[16ch] text-[24px] font-semibold leading-[1.06] tracking-tight text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{item.body}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-3">
                  {bestFitSignals.map((item) => (
                    <article key={item.title} className={`${item.tone} px-5 py-5`}>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">signal</div>
                      <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="outputs" className="mt-4 border-t border-slate-950 bg-slate-950 text-white">
          <div className="grid gap-px bg-white/10">
            <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,0.66fr)_minmax(0,1.34fr)]">
              <div className="bg-slate-950 px-6 py-8 sm:px-8">
                <div className="avl-kicker !text-slate-300">AI outputs</div>
                <h2
                  className="mt-4 max-w-[13ch] text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[44px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  AI가 먼저 만들어두는 초안이 다음 결정을 훨씬 빠르게 만듭니다.
                </h2>
                <p className="mt-4 max-w-[54ch] text-sm leading-6 text-slate-300">
                  후보 정리부터 검증 질문, 실험안, PRD 초안, 실행 태스크까지 먼저 채워두고 사람은 지금 필요한 판단만 앞에서 이어갑니다.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {packageHighlights.map((label) => (
                    <div key={label} className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-px bg-white/10 xl:grid-cols-3">
                {outputColumns.map((column, index) => (
                  <div key={column.title} className={`px-5 py-6 ${index === 1 ? "bg-[#10141d]" : "bg-slate-950"}`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{column.eyebrow}</div>
                    <h3 className="mt-4 max-w-[12ch] text-[22px] font-semibold leading-[1.06] tracking-tight text-white">
                      {column.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{column.body}</p>

                    <div className="mt-6 grid gap-px bg-white/10">
                      {column.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="bg-[#0f131d] px-4 py-4">
                            <div className="flex items-center gap-3">
                              <span className="avl-icon-frame rounded-none border-white/10 bg-white/6 text-slate-100">
                                <Icon size={16} />
                              </span>
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                  {getOutputMeta(item)}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="avl-kicker !text-slate-300">final package</div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    결과는 설명서가 아니라, 바로 검토하고 넘길 수 있는 실행 패키지로 남습니다.
                  </p>
                </div>
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
