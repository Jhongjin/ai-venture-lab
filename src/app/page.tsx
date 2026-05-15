import Image from "next/image";
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

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어를 검증하고, 기획과 MVP 실행까지 이어주는 AI venture workspace입니다.",
};

const heroSignals = [
  {
    label: "raw note",
    body: "회의 메모나 대화를 그대로 넣고 시작합니다.",
  },
  {
    label: "one candidate",
    body: "지금 밀 후보 1건만 먼저 앞으로 꺼냅니다.",
  },
  {
    label: "ship path",
    body: "기획, MVP, 출시 판단을 같은 보드에 붙여 둡니다.",
  },
];

const heroStats = [
  { value: "01", label: "memo to candidate" },
  { value: "07d", label: "validation sprint" },
  { value: "1 board", label: "single execution surface" },
  { value: "solo-first", label: "team optional" },
];

const workflowSteps = [
  {
    id: "01",
    title: "메모에서 후보를 꺼냅니다",
    body: "회의 문장과 대화를 넣으면 후보 1건과 검증 질문을 먼저 분리합니다.",
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
              <a href="#preview" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                preview
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

        <section className="mt-4 border border-slate-950 bg-[#0d0f14] text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.16fr)_minmax(360px,0.84fr)]">
            <div className="relative overflow-hidden bg-[#0d0f14] px-6 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:84px_84px]" />
              <div aria-hidden="true" className="absolute inset-y-0 left-[58%] hidden w-px bg-white/8 xl:block" />
              <div aria-hidden="true" className="absolute inset-x-0 top-[120px] h-px bg-white/8" />
              <div aria-hidden="true" className="absolute left-12 top-12 h-24 w-24 border border-white/10" />
              <div aria-hidden="true" className="absolute right-12 top-20 h-16 w-16 border border-white/8" />
              <div aria-hidden="true" className="absolute bottom-12 right-12 h-28 w-28 border border-white/8" />
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_22%,rgba(148,163,184,0.16),transparent_30%),radial-gradient(circle_at_78%_68%,rgba(255,255,255,0.08),transparent_26%)]" />

              <div className="relative z-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_240px]">
                <div className="min-w-0">
                  <div className="avl-kicker !text-slate-300">
                    <ClipboardText size={14} />
                    idea to MVP operating system
                  </div>
                  <h1
                    className="mt-8 max-w-[8.9ch] text-[60px] font-normal leading-[0.88] tracking-[-0.06em] text-white sm:text-[88px] xl:text-[118px]"
                    style={{ fontFamily: "var(--font-newsreader)" }}
                  >
                    AI Venture Lab
                  </h1>
                  <p className="mt-6 max-w-[18ch] text-[28px] font-semibold leading-[1.03] tracking-tight text-white sm:text-[44px]">
                    메모를 후보로 꺼내 검증하고, 실행까지 같은 보드에서 밀어붙입니다.
                  </p>
                  <p className="mt-5 max-w-[50ch] text-[15px] leading-7 text-slate-300">
                    문서를 여러 개 만드는 대신, 지금 밀 후보 1건과 다음 행동 1개를 먼저 앞으로 꺼내는 실행형 워크스페이스입니다.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/workspace" className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100">
                      지금 시작
                      <ArrowRight size={16} />
                    </Link>
                    <a href="#preview" className="avl-btn h-11 border border-white/12 bg-white/6 px-5 text-sm text-white hover:bg-white/10">
                      화면 일부 보기
                    </a>
                  </div>
                </div>

                <div className="grid gap-px self-start border border-white/10 bg-white/10">
                  <div className="relative overflow-hidden bg-[#f3f1ea] px-5 py-5 text-slate-950">
                    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
                    <div aria-hidden="true" className="absolute right-5 top-5 h-16 w-16 border border-slate-300" />
                    <div className="relative z-10">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">why it stays open</div>
                      <div className="mt-3 max-w-[11ch] text-[28px] font-semibold leading-[1.02] tracking-tight">
                        설명서보다 먼저, 실행 후보를 전면에 둡니다
                      </div>
                      <p className="mt-5 max-w-[26ch] text-sm leading-6 text-slate-700">
                        전체 기능을 배우기보다, 지금 밀 후보 1건과 다음 행동만 먼저 보게 합니다.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                    {heroStats.map((stat) => (
                      <div key={stat.label} className="bg-white/5 px-4 py-4">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                        <div className="mt-2 text-[24px] font-semibold tracking-tight text-white">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              <div className="relative overflow-hidden bg-[#f3f1ea] px-5 py-5 text-slate-950">
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="relative z-10">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">execution field</div>
                  <div className="mt-3 max-w-[12ch] text-[32px] font-semibold leading-[1.02] tracking-tight">
                    복잡한 대시보드보다, 메모에서 다음 실행까지 한 선으로 읽히게 만듭니다.
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-white/10">
                {heroSignals.map((item, index) => (
                  <div key={item.label} className="grid gap-px bg-white/10 md:grid-cols-[76px_minmax(0,1fr)]">
                    <div className="bg-white/6 px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="bg-white/5 px-5 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[240px] overflow-hidden bg-[#0f1116]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_46%)]" />
                <Image
                  src="/images/workspace-preview.png"
                  alt="AI Venture Lab workspace preview"
                  width={1600}
                  height={980}
                  className="absolute -right-[8%] bottom-0 h-auto w-[122%] max-w-none translate-y-[18%] rotate-[-7deg] opacity-[0.9] shadow-[0_24px_80px_rgba(0,0,0,0.34)]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,22,0.22)_0%,#0f1116_92%)]" />
              </div>
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
                메모 → 후보 → 실행.
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

        <section id="preview" className="mt-4 border-t border-slate-300 bg-transparent">
          <div className="grid gap-px bg-slate-300 xl:grid-cols-[minmax(0,1.1fr)_420px]">
            <div className="bg-white">
              <div className="grid gap-px bg-slate-300 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="bg-white px-6 py-5 sm:px-7">
                  <div className="avl-kicker">workspace preview</div>
                  <div className="mt-3 max-w-[14ch] text-[34px] font-semibold leading-[1.04] tracking-tight text-slate-950">
                    한 화면에서 후보, 판단, 실행까지 이어집니다.
                  </div>
                </div>
                <div className="bg-[#f7f6f2] px-6 py-5 text-sm leading-6 text-slate-600">
                  실제 보드 화면은 아래처럼 보이고, 홈에서는 이 흐름의 인상만 먼저 줍니다.
                </div>
              </div>

              <div className="grid gap-px border-t border-slate-300 bg-slate-300 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="bg-[#f8f7f4] p-4 sm:p-5">
                  <div className="overflow-hidden border border-slate-300 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                    <Image
                      src="/images/workspace-preview.png"
                      alt="AI Venture Lab workspace preview detail"
                      width={1600}
                      height={980}
                      className="h-auto w-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="grid gap-px bg-slate-300">
                  <div className="bg-white px-5 py-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">01</div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">추천 1건과 다음 행동 1개를 앞에 둡니다.</p>
                  </div>
                  <div className="bg-[#f7f6f2] px-5 py-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">02</div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">브리프와 PRD, MVP 범위가 같은 실행 맥락으로 붙습니다.</p>
                  </div>
                  <div className="bg-white px-5 py-5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">03</div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">출시 후 신호도 다시 보드로 돌아와 다음 결정을 만듭니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-slate-300">
              <div className="bg-[#f7f6f2] px-6 py-5">
                <div className="avl-kicker">system notes</div>
                <div className="mt-3 max-w-[12ch] text-[30px] font-semibold leading-[1.02] tracking-tight text-slate-950">
                  한 사람이 끝까지 밀 수 있게 복잡도를 접어 둡니다.
                </div>
              </div>
              {principles.map((block) => {
                const Icon = block.icon;
                return (
                  <div key={block.title} className="bg-white px-6 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="avl-kicker">{block.title}</div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{block.body}</p>
                      </div>
                      <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                        <Icon size={18} />
                      </span>
                    </div>
                  </div>
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
