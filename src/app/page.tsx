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

const workflowSignalPositions = [
  "lg:left-0 lg:top-0 lg:w-[46%]",
  "lg:right-0 lg:top-[112px] lg:w-[47%]",
  "lg:bottom-0 lg:left-0 lg:w-[48%]",
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

const bestFitRoute = ["회의 메모", "후보 1건", "질문 초안", "실행 메모"];

const bestFitChecks = [
  ["fit", "다음 행동을 정해야 하는데 후보와 질문이 흩어져 있을 때"],
  ["skip", "이미 요구사항과 작업 범위가 확정돼 단순 보관만 필요할 때"],
  ["watch", "법무, 의료, 금융처럼 외부 검토가 먼저 필요한 아이디어일 때"],
];

const bestFitScan = [
  ["decision pressure", "다음 회의 전 움직일 후보가 필요한가"],
  ["proof gap", "검증 질문과 중단 기준이 비어 있는가"],
  ["operator load", "한 사람이 끝까지 밀어야 하는가"],
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

const artifactStack = [
  {
    label: "01",
    title: "brief",
    tone: "bg-[#eef3ff] text-slate-950",
    width: "w-[78%]",
  },
  {
    label: "02",
    title: "validation",
    tone: "bg-white text-slate-950",
    width: "ml-auto w-[72%]",
  },
  {
    label: "03",
    title: "scope",
    tone: "bg-[#bcd3ff] text-slate-950",
    width: "w-[64%]",
  },
  {
    label: "04",
    title: "launch",
    tone: "bg-white/8 text-white",
    width: "ml-auto w-[58%]",
  },
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
                    className="mt-6 max-w-[12ch] break-keep text-[34px] font-normal leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-[50px]"
                    style={{ fontFamily: "var(--font-newsreader)" }}
                  >
                    한 줄 아이디어에서 실행 판단까지, 같은 흐름으로 정리합니다.
                  </h2>
                  <p className="mt-6 max-w-[40ch] text-sm leading-7 text-slate-600">
                    단계 설명을 쌓기보다, AI가 먼저 만든 초안과 사람이 승인할 판단을 하나의 신호 흐름으로 연결합니다.
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
                      <p className="mt-6 text-sm font-semibold leading-6 text-slate-950">후보를 하나 앞으로 꺼내고 검증, 실행, 출시 판단까지 같은 보드에 남깁니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[560px] overflow-hidden bg-[#10141d] px-6 py-7 text-white sm:px-8">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.28]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div aria-hidden="true" className="absolute left-[8%] right-[10%] top-[48%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(188,211,255,0.72),rgba(255,255,255,0.22),transparent)] lg:block" />
                <div aria-hidden="true" className="absolute bottom-10 right-10 hidden h-28 w-28 border border-white/10 lg:block" />
                <div className="relative grid min-h-[506px] gap-8 lg:grid-cols-[0.38fr_0.62fr]">
                  <div className="flex flex-col justify-between gap-8">
                    <div>
                      <div className="avl-kicker !text-slate-400">signal route</div>
                      <h3 className="mt-5 max-w-[11ch] break-keep text-[32px] font-semibold leading-[1.02] tracking-tight text-white">
                        초안, 판단, 패키지가 한 신호로 이어집니다.
                      </h3>
                      <p className="mt-5 max-w-[32ch] text-sm leading-7 text-slate-300">
                        같은 높이의 설명 박스 대신, AI와 사람이 넘겨받는 지점을 하나의 경로로 보여줍니다.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-px bg-white/10">
                      {["draft", "decide", "package"].map((label, index) => (
                        <div key={label} className={`${index === 0 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-300"} px-3 py-4`}>
                          <div className="font-mono text-[11px] uppercase tracking-[0.2em]">{label}</div>
                          <div className="mt-7 h-px bg-current opacity-30" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative grid gap-5 lg:block">
                    {workflowOverview.map((item, index) => (
                      <article
                        key={item.eyebrow}
                        className={`relative border-l border-[#bcd3ff]/40 bg-white/[0.045] px-5 py-4 backdrop-blur lg:absolute ${workflowSignalPositions[index]}`}
                      >
                        <span className="absolute -left-[7px] top-6 h-3 w-3 border border-[#bcd3ff] bg-[#10141d]" />
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">0{index + 1}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.eyebrow}</div>
                        </div>
                        <h3 className="mt-3 max-w-[20ch] text-[22px] font-semibold leading-[1.04] tracking-tight text-white">{item.title}</h3>
                        <p className="mt-3 max-w-[42ch] text-sm leading-6 text-slate-300">{item.body}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {item.chips.map((chip, chipIndex) => (
                            <span
                              key={chip}
                              className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
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

            <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
              <article className="relative min-h-[560px] overflow-hidden bg-[#10141d] px-6 py-8 text-white sm:px-8 xl:px-10">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.3]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div aria-hidden="true" className="absolute left-10 top-28 h-[1px] w-[72%] bg-[linear-gradient(90deg,rgba(188,211,255,0.8),transparent)]" />
                <div aria-hidden="true" className="absolute bottom-20 right-10 h-[1px] w-[56%] bg-[linear-gradient(90deg,transparent,rgba(245,239,227,0.5))]" />
                <div aria-hidden="true" className="absolute right-12 top-16 h-36 w-36 border border-white/10" />
                <div className="relative">
                  <div className="avl-kicker !text-slate-300">execution field</div>
                  <h3 className="mt-5 max-w-[12ch] break-keep text-[34px] font-semibold leading-[1.02] tracking-tight text-white">
                    하나의 후보가 여러 문서로 흩어지지 않게 붙잡습니다.
                  </h3>
                  <p className="mt-5 max-w-[36ch] text-sm leading-7 text-slate-300">
                    수집, 선별, 검증, 실행 패키지가 한 보드 위에서 이어져서 다음 판단의 위치가 계속 보입니다.
                  </p>
                </div>

                <div className="relative mt-12 grid gap-5 sm:grid-cols-2">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className={`${index === 3 ? "sm:col-span-2" : ""}`}>
                      <div className="flex items-start gap-4">
                        <span className={`mt-1 h-3 w-3 border ${index === 0 ? "border-[#bcd3ff] bg-[#bcd3ff]" : "border-white/20 bg-white/6"}`} />
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">{step.id}</div>
                          <div className="mt-2 text-sm font-semibold text-white">{step.title}</div>
                          <div className="mt-2 h-px w-28 bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-8 left-6 right-6 border border-white/10 bg-white/[0.04] px-4 py-4 sm:left-8 sm:right-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">loop discipline</span>
                    <span className="text-sm font-semibold text-slate-200">draft - decide - package - learn</span>
                  </div>
                </div>
              </article>

              <div className="grid gap-px bg-slate-300 lg:grid-cols-[0.92fr_1.08fr]">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon;
                  const panelTone =
                    index === 0
                      ? "bg-[#fcfbf7] lg:col-span-2"
                      : index === 1
                        ? "bg-[#eef3ff] lg:min-h-[420px]"
                        : index === 2
                          ? "bg-[#fff8e9]"
                          : "bg-[#10141d] text-white lg:col-span-2";
                  const titleTone = index === 3 ? "text-white" : "text-slate-950";
                  const bodyTone = index === 3 ? "text-slate-300" : "text-slate-600";
                  const labelTone = index === 3 ? "text-slate-500" : "text-slate-400";
                  const artifactTone =
                    index === 3
                      ? "border-white/10 bg-white/[0.04] text-slate-200"
                      : index === 1
                        ? "border-[#d7e1f6] bg-white/70 text-slate-700"
                        : "border-slate-200 bg-white/80 text-slate-700";

                  return (
                    <article key={step.id} className={`relative overflow-hidden px-6 py-7 sm:px-8 ${panelTone}`}>
                      <div className="flex items-start justify-between gap-5">
                        <span className={`avl-icon-frame rounded-none ${index === 3 ? "border-white/10 bg-white/6 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
                          <Icon size={18} />
                        </span>
                        <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${index === 3 ? "text-[#bcd3ff]" : "text-slate-400"}`}>{step.id}</span>
                      </div>
                      <div className={`${index === 0 || index === 3 ? "mt-8 grid gap-8 lg:grid-cols-[0.52fr_0.48fr]" : "mt-8"}`}>
                        <div>
                          <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${labelTone}`}>
                            {index === 0 ? "source" : index === 1 ? "priority" : index === 2 ? "risk gate" : "handoff"}
                          </div>
                          <h3 className={`mt-4 max-w-[13ch] text-[30px] font-semibold leading-[1.02] tracking-tight ${titleTone}`}>{step.title}</h3>
                          <p className={`mt-4 max-w-[38ch] text-sm leading-6 ${bodyTone}`}>{step.ai}</p>
                        </div>
                        <div className={index === 0 || index === 3 ? "" : "mt-8"}>
                          <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${labelTone}`}>human check</div>
                          <p className={`mt-3 text-sm leading-6 ${index === 3 ? "text-slate-200" : "text-slate-700"}`}>{step.human}</p>
                          <div className={`mt-5 border px-4 py-4 ${artifactTone}`}>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">output</div>
                            <div className="mt-2 text-sm font-semibold">{step.result}</div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 overflow-hidden border-t border-slate-300 bg-[#eaf0fb]">
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
                  className="mt-5 max-w-[12ch] break-keep text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[50px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  지금 후보와 다음 행동이 막혀 있을 때 가장 잘 맞습니다.
                </h2>
                <p className="mt-5 max-w-[40ch] text-sm leading-7 text-slate-300">
                  기능을 익히는 제품이라기보다, 실행 직전 멈추는 지점을 빠르게 여는 작업면에 더 가깝습니다.
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

                <div className="mt-14 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">readiness scan</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">fit before feature</span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {bestFitScan.map(([label, body], index) => (
                      <div key={label} className="grid grid-cols-[0.34fr_0.66fr] gap-px bg-white/10">
                        <div className={`${index === 0 ? "bg-white/[0.09]" : "bg-white/[0.04]"} px-3 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400`}>
                          {label}
                        </div>
                        <div className="bg-[#0f141f] px-3 py-3 text-xs leading-5 text-slate-300">{body}</div>
                      </div>
                    ))}
                  </div>
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
                <div className="grid gap-8 lg:grid-cols-[0.58fr_0.42fr]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">where it works</div>
                    <h3 className="mt-5 max-w-[18ch] break-keep text-[34px] font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-[38px]">
                      설명서를 읽는 시간보다, 다음 판단을 꺼내는 시간이 더 중요할 때.
                    </h3>
                  </div>
                  <div className="border-l border-slate-300 pl-6">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">mini proof</div>
                    <div className="mt-5 grid gap-px bg-slate-300">
                      {bestFitRoute.slice(0, 3).map((label, index) => (
                        <div key={label} className={`${index === 0 ? "bg-slate-950 text-white" : index === 2 ? "bg-white" : "bg-[#f6f4ee]"} grid grid-cols-[0.28fr_0.72fr]`}>
                          <div className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">0{index + 1}</div>
                          <div className="px-4 py-4 text-sm font-semibold">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-5">
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
                      <article
                        key={item.title}
                        className={`relative overflow-hidden ${bandTone} ${
                          index === 1 ? "ml-auto lg:w-[82%]" : index === 2 ? "lg:w-[74%]" : "lg:w-[92%]"
                        }`}
                      >
                        <div className="grid gap-px bg-slate-300/80 md:grid-cols-[0.2fr_0.8fr]">
                          <div className={`${index === 2 ? "bg-[#0f141f]" : "bg-white/70"} px-5 py-5`}>
                            <span className={`flex h-10 w-10 items-center justify-center border ${index === 2 ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white"}`}>
                              <Icon size={18} />
                            </span>
                            <div className={`mt-8 font-mono text-[11px] uppercase tracking-[0.2em] ${labelTone}`}>0{index + 1}</div>
                          </div>
                          <div className={`${index === 2 ? "bg-[#10141d]" : index === 1 ? "bg-[#fff8e9]" : "bg-white"} px-5 py-5 sm:px-6`}>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${labelTone}`}>situation</span>
                              <span className={`${index === 2 ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-slate-300 bg-white/70 text-slate-600"} inline-flex border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]`}>
                                {item.tag}
                              </span>
                            </div>
                            <h3 className={`mt-5 max-w-[28ch] text-[26px] font-semibold leading-[1.04] tracking-tight ${index === 2 ? "text-white" : "text-slate-950"}`}>{item.title}</h3>
                            <p className={`mt-4 max-w-[60ch] text-sm leading-6 ${copyTone}`}>{item.body}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-10 grid gap-px bg-slate-300 lg:grid-cols-[0.38fr_0.62fr]">
                  <div className="bg-white px-5 py-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">decision map</div>
                    <p className="mt-4 max-w-[34ch] text-sm leading-6 text-slate-600">
                      이 섹션은 “누가 쓰나”보다 “언제 효과가 나나”를 먼저 보여줍니다.
                    </p>
                  </div>
                  <div className="grid gap-px bg-slate-300">
                    {bestFitSignals.map((item, index) => (
                      <div key={item.title} className={`${index === 0 ? "bg-[#10141d] text-white" : index === 1 ? "bg-[#f8fafc]" : "bg-[#eef3ff]"} grid gap-px sm:grid-cols-[0.22fr_0.78fr]`}>
                        <div className={`${index === 0 ? "bg-[#0f141f]" : "bg-white/70"} px-4 py-4 font-mono text-[11px] uppercase tracking-[0.2em] ${index === 0 ? "text-[#bcd3ff]" : "text-slate-400"}`}>0{index + 1}</div>
                        <div className="px-4 py-4">
                          <h3 className={`text-[18px] font-semibold tracking-tight ${index === 0 ? "text-white" : "text-slate-950"}`}>{item.title}</h3>
                          <p className={`mt-2 text-sm leading-6 ${index === 0 ? "text-slate-300" : "text-slate-600"}`}>{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  className="mt-5 max-w-[12ch] break-keep text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[50px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  AI 초안은 끝에 실행 패키지로 남습니다.
                </h2>
                <p className="mt-5 max-w-[42ch] text-sm leading-7 text-slate-300">
                  후보 정리부터 학습 리포트까지, 각 산출물은 다음 판단을 빨리 여는 작업 단위로 저장됩니다.
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
                <div className="mt-10">
                  <div className="flex items-center justify-between border-y border-white/10 py-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">artifact stack</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">6 deliverables</span>
                  </div>
                  <div className="relative mt-5 space-y-3">
                    <div aria-hidden="true" className="absolute bottom-3 left-7 top-3 w-px bg-[linear-gradient(180deg,rgba(188,211,255,0.62),transparent)]" />
                    {artifactStack.map((item) => (
                      <div key={item.title} className={`relative ${item.width}`}>
                        <div className={`${item.tone} border border-white/10 px-4 py-3 shadow-[0_14px_32px_rgba(2,6,23,0.22)]`}>
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">{item.label}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">ready</span>
                          </div>
                          <div className="mt-3 text-sm font-semibold uppercase tracking-[0.12em]">{item.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              <div className="relative overflow-hidden bg-[#11161f] px-6 py-7 sm:px-8">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-80"
                  style={{
                    background:
                      "radial-gradient(circle at 18% 32%, rgba(188,211,255,0.16), transparent 26%), linear-gradient(90deg, rgba(255,255,255,0.04), transparent 34%)",
                  }}
                />
                <div className="relative grid gap-8 lg:grid-cols-[0.46fr_0.54fr]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">before judgment</div>
                    <h3 className="mt-4 max-w-[13ch] break-keep text-[30px] font-semibold leading-[1.02] tracking-tight text-white">{outputColumns[0].title}</h3>
                    <p className="mt-4 max-w-[38ch] text-sm leading-6 text-slate-300">{outputColumns[0].body}</p>
                  </div>
                  <div className="grid gap-px bg-white/10">
                    {outputColumns[0].items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className={`${index === 0 ? "bg-[#182233]" : "bg-[#0d1118]"} grid gap-px sm:grid-cols-[0.2fr_0.8fr]`}>
                          <div className="flex items-center justify-center border-r border-white/10 px-4 py-4">
                            <Icon size={18} />
                          </div>
                          <div className="px-4 py-4">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{getOutputMeta(item)}</div>
                            <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-white/10 xl:grid-cols-[0.95fr_1.05fr]">
                {outputColumns.slice(1).map((column, columnIndex) => (
                  <div key={column.title} className={`${columnIndex === 0 ? "bg-[#182233]" : "bg-[#0d1118]"} px-6 py-7 sm:px-8`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{column.eyebrow}</div>
                    <h3 className="mt-4 max-w-[12ch] text-[28px] font-semibold leading-[1.02] tracking-tight text-white">{column.title}</h3>
                    <p className="mt-4 max-w-[36ch] text-sm leading-6 text-slate-300">{column.body}</p>
                    <div className="mt-7 border-y border-white/10">
                      {column.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="grid grid-cols-[2.75rem_1fr] border-b border-white/10 py-4 last:border-b-0">
                            <span className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/[0.04] text-slate-100">
                              <Icon size={16} />
                            </span>
                            <div>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{getOutputMeta(item)}</div>
                              <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{item.body}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-px bg-white/10 lg:grid-cols-[1fr_0.7fr]">
                <div className="bg-[#10141d] px-6 py-6 sm:px-8">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">final package</div>
                  <p className="mt-3 max-w-[62ch] text-sm leading-6 text-slate-300">
                    결과는 설명서가 아니라, 바로 검토하고 넘길 수 있는 실행 패키지로 남습니다.
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
                className="mt-3 max-w-[18ch] break-keep text-[30px] font-normal leading-[1] tracking-[-0.03em] text-slate-950 sm:text-[38px]"
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
