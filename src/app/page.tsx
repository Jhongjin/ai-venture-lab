import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import {
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
import { AuthAwareCta } from "@/components/auth-aware-cta";
import { LandingHeroVisual } from "@/components/landing-hero-visual";
import { LandingMiddleMotion } from "@/components/landing-middle-motion";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어 검증, 기획, 제작 패키지까지 한 흐름으로 이어가는 AI 실행 워크스페이스입니다.",
};

const heroStats = [
  { value: "01", label: "우선 검토 후보" },
  { value: "7 day", label: "7일 검증" },
  { value: "1 worksheet", label: "실행 워크시트" },
  { value: "team-ready", label: "협업 전환" },
];

const workflowSteps = [
  {
    id: "01",
    title: "메모 정리",
    ai: "회의 메모와 브리프를 살펴보고 후보와 첫 질문을 뽑아냅니다.",
    human: "오늘 먼저 볼 후보를 고릅니다.",
    result: "후보 한 건 + 비교 후보 큐",
    icon: ClipboardText,
  },
  {
    id: "02",
    title: "후보 고르기",
    ai: "바로 검증할지, 더 보완할지, 접어둘지 먼저 나눕니다.",
    human: "왜 이 후보를 먼저 볼지 짧게 확인합니다.",
    result: "우선순위 + 검토 메모",
    icon: Sparkle,
  },
  {
    id: "03",
    title: "검증 판단",
    ai: "리스크, 질문, 7일 검증 계획, 중단 기준을 한 번에 묶습니다.",
    human: "리스크와 검증 조건을 확인하고 조정합니다.",
    result: "검증 자료",
    icon: ShieldCheck,
  },
  {
    id: "04",
    title: "제작 자료",
    ai: "기획서, 첫 제작 범위, 실행 작업, 출시 판단 초안을 한 번에 묶습니다.",
    human: "어디까지 만들고 언제 시작할지 결정합니다.",
    result: "바로 이어갈 제작 자료",
    icon: ShieldCheck,
  },
];

const workflowOverview = [
  {
    eyebrow: "AI 초안",
    title: "초안과 질문을 잡습니다",
    body: "후보, 질문, 리스크, 실행 초안을 정리합니다.",
    chips: ["후보 한 건", "질문 초안", "리스크 메모"],
  },
  {
    eyebrow: "사람의 판단",
    title: "지금 볼 것만 앞으로 꺼냅니다",
    body: "후보 선택, 검증 조건, 진행 여부만 빠르게 확인합니다.",
    chips: ["우선 후보", "검증 조건", "진행/보완"],
  },
  {
    eyebrow: "보드에 남는 것",
    title: "다음 실행으로 이어집니다",
    body: "검증 자료, 기획서, 실행 작업, 학습 리포트가 이어집니다.",
    chips: ["검증 자료", "기획서", "학습 리포트"],
  },
];

const useCases = [
  {
    title: "회의는 많은데 할 일이 남지 않을 때",
    body: "회의 메모와 대화는 쌓이는데 검토할 후보가 보이지 않을 때, 후보 한 건과 첫 질문부터 꺼냅니다.",
    tag: "운영 회의 직후",
    icon: ChatCircleText,
  },
  {
    title: "아이디어는 있는데 검증 자료가 흩어질 때",
    body: "후보, 리스크, 7일 검증 계획, 판단 기준을 한 보드에 모아둡니다.",
    tag: "검증 단계",
    icon: FadersHorizontal,
  },
  {
    title: "기획부터 첫 제작까지 1인으로 이어가야 할 때",
    body: "팀이 없어도 아이디어 검토부터 첫 제작 준비까지 한 흐름으로 정리할 수 있습니다.",
    tag: "1인 시작",
    icon: UsersThree,
  },
];

const bestFitRoute = ["회의 메모", "후보 한 건", "질문 초안", "실행 메모"];

const bestFitChecks = [
  ["fit", "다음 할 일을 정해야 하는데 후보와 질문이 흩어져 있을 때"],
  ["skip", "요구사항과 작업 범위가 이미 정해져 보관만 하면 될 때"],
  ["watch", "법무, 의료, 금융처럼 외부 검토가 먼저 필요한 아이디어일 때"],
];

const aiOutputs = [
  {
    title: "후보 정리",
    body: "먼저 검토할 후보와 비교 후보를 나눕니다.",
    meta: "candidate queue",
    icon: Sparkle,
  },
  {
    title: "검증 질문",
    body: "사용자, 구매자, 문제의 강도를 확인할 질문을 제안합니다.",
    meta: "question pack",
    icon: Brain,
  },
  {
    title: "리스크 초안",
    body: "개인정보, 운영, 법무, 신뢰 리스크를 먼저 정리합니다.",
    meta: "risk frame",
    icon: ShieldCheck,
  },
  {
    title: "7일 검증 계획",
    body: "기간, 대상, 성공 기준, 중단 기준을 함께 세웁니다.",
    meta: "validation sprint",
    icon: ChartLineUp,
  },
  {
    title: "기획서와 첫 제작 범위",
    body: "무엇을 만들고 무엇을 뒤로 미룰지 정리합니다.",
    meta: "scope draft",
    icon: GridFour,
  },
  {
    title: "실행 작업",
    body: "디자인, 제작, 품질 점검, 출시 판단에 필요한 작업으로 나눕니다.",
    meta: "task board",
    icon: ListChecks,
  },
];

const outputs = [
  {
    title: "아이디어 브리프",
    body: "배경, 문제, 대상, 구매 맥락을 한 장에 정리합니다.",
    icon: FileDoc,
  },
  {
    title: "검증 자료",
    body: "질문, 리스크, 검증 계획, 중단 기준까지 함께 남깁니다.",
    icon: ShieldCheck,
  },
  {
    title: "첫 제작 범위",
    body: "지금 만들 것과 나중에 미룰 것을 나눕니다.",
    icon: Target,
  },
  {
    title: "실행 작업",
    body: "기획, 디자인, 제작, 품질 점검 담당자가 바로 볼 수 있게 정리합니다.",
    icon: Path,
  },
  {
    title: "출시 판단",
    body: "보완, 전환, 진행, 중단 중 다음 방향을 남깁니다.",
    icon: RocketLaunch,
  },
  {
    title: "학습 리포트",
    body: "출시 후 신호를 다시 보드에 가져와 다음 판단에 씁니다.",
    icon: ChartLineUp,
  },
];

const outputColumns = [
  {
    eyebrow: "candidate layer",
    title: "판단 전에 갖춰둘 초안",
    body: "후보, 검증 질문, 초기 리스크를 묶어 바로 판단할 수 있게 만듭니다.",
    items: [aiOutputs[0], aiOutputs[1], aiOutputs[2]],
  },
  {
    eyebrow: "build layer",
    title: "실행으로 넘기는 구조",
    body: "검증 조건, 첫 제작 범위, 실행 작업을 이어서 정리하고 바로 넘겨줄 수 있게 만듭니다.",
    items: [aiOutputs[3], aiOutputs[4], aiOutputs[5]],
  },
  {
    eyebrow: "handoff pack",
    title: "마지막에 남는 제작 패키지",
    body: "기획 문서로 끝나지 않고, 바로 만들거나 외부 제작 도구에 넘길 수 있는 실행 묶음으로 남습니다.",
    items: [outputs[0], outputs[1], outputs[4], outputs[5]],
  },
];

const packageHighlights = [
  "아이디어 브리프",
  "검증 자료",
  "첫 제작 범위",
  "실행 작업",
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
        <section className="overflow-hidden border border-slate-950 bg-[#0d0f14] text-white">
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
                  idea to first build operating system
                </div>
                <h1
                  className="relative mt-8 text-[42px] font-normal leading-[0.94] tracking-[-0.05em] text-white md:whitespace-nowrap md:text-[58px] xl:text-[60px] 2xl:text-[78px]"
                  style={{ fontFamily: "var(--font-newsreader)" }}
                >
                  <span className="text-[#bcd3ff]">AI</span>{" "}
                  <span>Venture Lab</span>
                </h1>
                <p className="relative mt-8 max-w-[16ch] break-keep text-[24px] font-semibold leading-[1.04] tracking-tight text-white sm:text-[32px] xl:text-[38px]">
                  정리한 아이디어의 사업성을 검토하고, 제작까지 이어갑니다.
                </p>
                <p className="relative mt-5 max-w-[48ch] break-keep text-[15px] leading-7 text-slate-300">
                  회의 메모나 브리프 초안만 있어도 시작할 수 있습니다. AI가 후보, 질문, 실행 초안을 먼저 정리하고 사용자는 중요한 판단만 더하면 됩니다.
                </p>
              </div>

              <div className="relative mt-10">
                <div className="flex flex-wrap gap-3">
                  <AuthAwareCta className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100" />
                  <a href="#workflow" className="avl-btn h-11 border border-white/14 bg-white/6 px-5 text-sm text-white hover:bg-white/10">
                    진행 흐름 보기
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

        <section id="workflow" className="relative mt-6 overflow-hidden bg-[#f6f4ee]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 8% 18%, rgba(255,255,255,0.95), transparent 18%), radial-gradient(circle at 78% 76%, rgba(188,211,255,0.24), transparent 28%)",
            }}
          />
          <div className="relative grid gap-8 px-6 py-10 sm:px-8 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] xl:px-10 xl:py-12">
            <div className="relative">
              <div className="avl-kicker">workflow</div>
              <h2
                className="mt-6 max-w-[17ch] break-keep text-[34px] font-normal leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-[50px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                <span className="block">아이디어에서</span>
                <span className="block">실행 판단까지</span>
                <span className="block">한 흐름으로.</span>
              </h2>
              <p className="mt-6 max-w-[40ch] break-keep text-sm leading-7 text-slate-600">
                길게 설명하기보다 흐름을 먼저 보여줍니다. AI가 초안을 정리하고, 사람은 필요한 판단만 고릅니다.
              </p>

              <div className="mt-12 max-w-[560px]">
                <div className="grid grid-cols-4 gap-2">
                  {workflowSteps.map((step, index) => (
                    <span
                      key={step.id}
                      className={`h-1.5 ${index === 0 ? "bg-slate-950" : index === 1 ? "bg-[#c9b47a]" : index === 2 ? "bg-[#bcd3ff]" : "bg-slate-500"}`}
                      aria-label={step.title}
                    />
                  ))}
                </div>
                <div className="mt-5 border-l border-slate-950 pl-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">current candidate</div>
                  <p className="mt-3 max-w-[42ch] break-keep text-base font-semibold leading-7 text-slate-950">
                    후보 하나를 앞으로 꺼내 검증, 실행, 출시 판단을 같은 보드에 남깁니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[560px] overflow-hidden bg-[#10141d] px-6 py-7 text-white sm:px-8 xl:-mr-10 xl:px-10">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.28]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div aria-hidden="true" className="absolute left-0 right-0 top-[48%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(188,211,255,0.72),rgba(255,255,255,0.22),transparent)] lg:block" />
              <div aria-hidden="true" className="absolute bottom-10 right-10 hidden h-28 w-28 border border-white/10 lg:block" />

              <div className="relative grid min-h-[504px] gap-10 lg:grid-cols-[0.34fr_0.66fr]">
                <div className="flex flex-col justify-between gap-10">
                  <div>
                    <div className="avl-kicker !text-slate-400">signal route</div>
                    <h3 className="mt-5 max-w-[16ch] break-keep text-[32px] font-semibold leading-[1.02] tracking-tight text-white">
                        AI 초안이 검토를 거쳐 제작 자료가 됩니다.
                    </h3>
                    <p className="mt-5 max-w-[34ch] break-keep text-sm leading-7 text-slate-300">
                      후보, 질문, 리스크가 정리되고 확인할 지점만 남습니다.
                    </p>
                  </div>

                  <div className="space-y-5 border-l border-white/16 pl-5">
                    {["AI 초안", "판단 확인", "제작 자료"].map((label, index) => (
                      <div key={label} className="relative">
                        <span className={`absolute -left-[27px] top-1.5 h-3 w-3 ${index === 0 ? "bg-[#bcd3ff]" : "border border-white/30 bg-[#10141d]"}`} />
                        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">0{index + 1}</div>
                        <div className="mt-2 text-sm font-semibold text-slate-100">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div aria-hidden="true" className="absolute left-[14%] top-10 bottom-10 hidden w-px bg-white/10 lg:block" />
                  <div aria-hidden="true" className="absolute left-[48%] top-0 bottom-8 hidden w-px bg-white/8 lg:block" />
                  <div className="grid gap-8 lg:absolute lg:inset-0">
                    {workflowOverview.map((item, index) => (
                      <article
                        key={item.eyebrow}
                        className={`relative border-t border-white/14 pt-5 ${
                          index === 0
                            ? "lg:absolute lg:left-[6%] lg:top-[4%] lg:w-[62%]"
                            : index === 1
                              ? "lg:absolute lg:right-[7%] lg:top-[35%] lg:w-[48%]"
                              : "lg:absolute lg:left-[34%] lg:bottom-[12%] lg:w-[34%]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">0{index + 1}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.eyebrow}</div>
                        </div>
                        <h3 className="mt-3 max-w-[22ch] break-keep text-[22px] font-semibold leading-[1.04] tracking-tight text-white">{item.title}</h3>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="best-fit" className="relative mt-4 overflow-hidden bg-[#eaf0fb]">
          <div className="grid xl:grid-cols-[minmax(0,0.52fr)_minmax(0,1.48fr)]">
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
                  <span className="block">다음 할 일이</span>
                  <span className="block">막혀 있을 때.</span>
                </h2>
                <p className="mt-5 max-w-[40ch] break-keep text-sm leading-7 text-slate-300">
                  사용법을 오래 익히는 도구보다, 실행 직전에 막힌 지점을 빨리 풀어주는 작업 화면에 가깝습니다.
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

            <div className="relative overflow-hidden bg-[#eaf0fb] px-6 py-8 sm:px-8 xl:px-10">
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
                <div className="grid gap-8 xl:grid-cols-[0.28fr_0.72fr]">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">where it works</div>
                    <h3 className="mt-5 max-w-[20ch] break-keep text-[34px] font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-[38px]">
                      설명을 더 듣고 있기보다, 다음 결정을 바로 내려야 할 때.
                    </h3>
                    <p className="mt-5 max-w-[32ch] break-keep text-sm leading-7 text-slate-600">
                      오른쪽은 카드 모음이 아니라 판단 흐름을 보여주는 작업 화면입니다. 입력, 선별, 실행 조건이 한 번에 이어집니다.
                    </p>
                  </div>
                  <div className="xl:-mr-10">
                    <LandingMiddleMotion />
                  </div>
                </div>

                <div className="relative mt-10 border-l border-slate-300/80 pl-7">
                  <div aria-hidden="true" className="absolute left-[-1px] top-0 h-16 w-px bg-slate-950" />
                  {useCases.map((item, index) => {
                    const Icon = item.icon;
                    const fieldTone =
                      index === 0
                        ? "border-slate-300/70 bg-white/[0.86] text-slate-950"
                        : index === 1
                          ? "border-[#dccb9b]/70 bg-[#fff7e8]/[0.9] text-slate-950"
                          : "border-[#bcd3ff]/30 bg-[#10141d] text-white";
                    const labelTone = index === 2 ? "text-[#bcd3ff]" : "text-slate-500";
                    const copyTone = index === 2 ? "text-slate-300" : "text-slate-600";
                    const iconTone = index === 2 ? "text-slate-300" : "text-slate-600";
                    const titleTone = index === 2 ? "text-white" : "text-slate-950";
                    const nodeTone = index === 2 ? "bg-[#bcd3ff]" : "bg-slate-950";
                    return (
                      <article
                        key={item.title}
                        className={`relative grid gap-5 border-l px-5 py-5 sm:grid-cols-[4.75rem_1fr] sm:px-6 ${fieldTone} ${
                          index === 0
                            ? "lg:w-full"
                          : index === 1
                              ? "lg:ml-[9%] lg:w-[78%]"
                              : "lg:ml-[18%] lg:w-[58%]"
                        }`}
                      >
                        <span aria-hidden="true" className={`absolute -left-[34px] top-6 h-2.5 w-2.5 ${nodeTone}`} />
                        <div className="flex items-start justify-between gap-4 sm:block">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center ${iconTone}`}>
                            <Icon size={17} />
                          </span>
                          <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${labelTone} sm:mt-8 sm:block`}>0{index + 1}</span>
                        </div>
                        <div>
                          <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${labelTone}`}>{item.tag}</div>
                          <h3 className={`mt-3 max-w-[34ch] break-keep text-[22px] font-semibold leading-[1.05] tracking-tight ${titleTone}`}>{item.title}</h3>
                          <p className={`mt-3 max-w-[58ch] break-keep text-sm leading-6 ${copyTone}`}>{item.body}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="outputs" className="relative mt-8 overflow-hidden bg-[#0b1019] text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(188,211,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(188,211,255,0.08) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(188,211,255,0.7),transparent)]" />
          <div className="relative grid xl:grid-cols-[minmax(320px,0.42fr)_minmax(0,1.58fr)]">
            <aside className="relative min-h-[700px] overflow-hidden bg-[#070b14] px-6 py-9 sm:px-8 xl:px-10 xl:py-10">
              <div aria-hidden="true" className="absolute bottom-[-10%] left-[-12%] h-80 w-80 bg-[radial-gradient(circle,rgba(188,211,255,0.18),transparent_62%)]" />
              <div className="relative flex min-h-[620px] flex-col justify-between">
                <div>
                  <div className="avl-kicker !text-slate-300">artifact library</div>
                  <h2
                    className="mt-5 max-w-[15ch] break-keep text-[34px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[46px]"
                    style={{ fontFamily: "var(--font-newsreader)" }}
                  >
                    <span className="block">AI 초안은</span>
                    <span className="block">제작 자료로</span>
                    <span className="block">남습니다.</span>
                  </h2>
                  <p className="mt-5 max-w-[42ch] break-keep text-sm leading-7 text-slate-300">
                    후보 정리부터 학습 리포트까지, 다음 판단에 바로 쓰는 작업 단위로 남깁니다.
                  </p>
                </div>

                <div className="relative mt-12 border-l border-white/12 pl-5">
                  {packageHighlights.map((label, index) => (
                    <div key={label} className="relative pb-5 last:pb-0">
                      <span className={`absolute -left-[26px] top-0 h-2.5 w-2.5 ${index === 1 ? "bg-[#bcd3ff]" : "border border-white/24 bg-[#070b14]"}`} />
                      <div className="grid grid-cols-[3rem_1fr_auto] items-start gap-3 border-t border-white/10 pt-4">
                        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bcd3ff]">0{index + 1}</span>
                        <span className="break-keep text-sm font-semibold text-slate-100">{label}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="relative px-6 py-9 sm:px-8 xl:px-10 xl:py-10">
              <div className="grid gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <article className="relative border-t border-[#bcd3ff]/40 pt-6">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bcd3ff]">{outputColumns[0].eyebrow}</div>
                  <h3 className="mt-4 max-w-[15ch] break-keep text-[30px] font-semibold leading-[1.02] tracking-tight text-white sm:text-[36px]">
                    {outputColumns[0].title}
                  </h3>
                  <p className="mt-4 max-w-[42ch] break-keep text-sm leading-7 text-slate-300">{outputColumns[0].body}</p>

                  <div className="mt-9 space-y-5">
                    {outputColumns[0].items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="grid grid-cols-[2.75rem_1fr] gap-4 border-t border-white/10 pt-5">
                          <span className={`${index === 0 ? "bg-[#bcd3ff] text-slate-950" : "bg-white/[0.04] text-slate-200"} flex h-9 w-9 items-center justify-center border border-white/10`}>
                            <Icon size={16} />
                          </span>
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{getOutputMeta(item)}</div>
                            <div className="mt-1 break-keep text-base font-semibold text-white">{item.title}</div>
                            <p className="mt-2 max-w-[42ch] break-keep text-sm leading-6 text-slate-400">{item.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <div className="relative min-h-[420px] overflow-hidden border-l border-white/10 pl-6">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">artifact runway</div>
                  <p className="mt-3 max-w-[36ch] break-keep text-sm leading-6 text-slate-300">
                    판단 전 초안이 실행 범위와 제작 전달 자료로 이어지며, 다음 작업자가 바로 볼 수 있는 단위로 정리됩니다.
                  </p>
                  <div className="relative mt-10 min-h-[300px]">
                    {[
                      { label: "brief", tone: "bg-white text-slate-950", pos: "left-0 top-0 w-[72%]" },
                      { label: "validation", tone: "bg-[#fff7e8] text-slate-950", pos: "left-[18%] top-[76px] w-[68%]" },
                      { label: "scope", tone: "bg-[#bcd3ff] text-slate-950", pos: "left-[6%] top-[154px] w-[58%]" },
                      { label: "launch", tone: "bg-[#151b28] text-white", pos: "left-[30%] top-[218px] w-[58%] border border-white/12" },
                    ].map((item, index) => (
                      <div key={item.label} className={`absolute ${item.pos} ${item.tone} px-5 py-4 shadow-[0_28px_70px_rgba(2,6,23,0.22)]`}>
                        <div className="flex items-start justify-between gap-4">
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-70">0{index + 1}</span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-55">ready</span>
                        </div>
                        <div className="mt-8 text-sm font-semibold uppercase tracking-[0.12em]">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 grid gap-px bg-white/10 lg:grid-cols-[0.92fr_1.08fr]">
                {outputColumns.slice(1).map((column, columnIndex) => (
                  <article key={column.title} className={`${columnIndex === 0 ? "bg-[#182233]/92" : "bg-[#0d1118]/92"} px-6 py-7 sm:px-8`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{column.eyebrow}</div>
                    <h3 className="mt-4 max-w-[18ch] break-keep text-[26px] font-semibold leading-[1.02] tracking-tight text-white">{column.title}</h3>
                    <p className="mt-4 max-w-[44ch] break-keep text-sm leading-6 text-slate-300">{column.body}</p>
                    <div className="mt-7 grid gap-4 sm:grid-cols-2">
                      {column.items.slice(0, 2).map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.title} className="border-t border-white/10 pt-4">
                            <span className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.04] text-slate-100">
                              <Icon size={15} />
                            </span>
                            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{getOutputMeta(item)}</div>
                            <div className="mt-1 break-keep text-sm font-semibold text-white">{item.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>

              <div className="relative mt-10 border-t border-white/10 pt-6">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">final package</div>
                  <p className="mt-3 max-w-[62ch] break-keep text-sm leading-6 text-slate-300">
                    결과는 설명서가 아니라 바로 검토하고 넘겨줄 수 있는 제작 패키지입니다.
                  </p>
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
                AI가 준비하고, 사람이 판단하고, 제작 패키지로 넘깁니다.
              </p>
            </div>
            <nav aria-label="landing footer" className="flex flex-wrap gap-2">
              <AuthAwareCta className="avl-btn avl-btn-primary h-11 px-5" />
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
