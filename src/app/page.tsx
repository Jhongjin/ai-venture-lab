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
    label: "ingest",
    title: "원문 수집",
    body: "회의 메모, 대화, 브리프를 그대로 넣습니다.",
  },
  {
    label: "decide",
    title: "검증 판단",
    body: "수요, 리스크, 첫 실험 기준을 AI가 먼저 정리합니다.",
  },
  {
    label: "ship",
    title: "실행 패키지",
    body: "PRD, MVP 범위, 태스크, 출시 판단까지 이어집니다.",
  },
  {
    label: "learn",
    title: "학습 루프",
    body: "출시 후 행동 신호를 모아 다음 빌드 결정을 돕습니다.",
  },
];

const workflowSteps = [
  {
    id: "01",
    title: "메모에서 후보를 꺼냅니다",
    body: "회의 문장과 대화를 넣으면 AI가 제품 후보와 검증 질문을 먼저 분리합니다.",
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
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단, 학습 리포트가 같은 제품 맥락 안에 남습니다.",
    icon: RocketLaunch,
  },
];

const principles = [
  {
    title: "AI가 먼저 채웁니다",
    body: "후보, 질문, 리스크, 산출물 뼈대, 실행 패키지를 먼저 만듭니다.",
    icon: Sparkle,
  },
  {
    title: "사람은 결론에 집중합니다",
    body: "진행, 보강, 전환, 중단처럼 중요한 판단만 선명하게 정하면 됩니다.",
    icon: CheckCircle,
  },
  {
    title: "협업은 옵션으로 붙습니다",
    body: "기본은 혼자 끝까지 가는 흐름이고, 필요할 때만 워크스페이스와 팀 초대를 붙입니다.",
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
    <main className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto w-full max-w-[1560px] px-4 py-4 sm:px-6 sm:py-6">
        <header className="border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
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

        <section className="mt-4 border border-slate-950 bg-[#0f1118] text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.06fr)_420px]">
            <div className="relative overflow-hidden bg-[#11131a] px-6 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
              <div aria-hidden="true" className="absolute inset-y-0 right-[28%] w-px bg-white/8" />
              <div aria-hidden="true" className="absolute left-8 top-8 h-28 w-28 border border-white/8" />
              <div aria-hidden="true" className="absolute bottom-10 right-10 h-48 w-48 border border-white/6" />
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_82%_78%,rgba(148,163,184,0.15),transparent_36%)]" />

              <div className="relative z-10 max-w-[1060px]">
                <div className="avl-kicker !text-slate-300">
                  <ClipboardText size={14} />
                  idea to mvp operating system
                </div>

                <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
                  <div>
                    <h1
                      className="max-w-[9.2ch] text-[58px] font-normal leading-[0.9] tracking-[-0.05em] text-white sm:text-[84px] xl:text-[108px]"
                      style={{ fontFamily: "var(--font-newsreader)" }}
                    >
                      AI Venture Lab
                    </h1>
                    <p className="mt-6 max-w-[19ch] text-[26px] font-semibold leading-[1.06] tracking-tight text-white sm:text-[34px]">
                      메모에서 후보를 꺼내고, 검증과 실행까지 한 사람이 끝까지 밀 수 있게.
                    </p>
                    <p className="mt-5 max-w-[60ch] text-[15px] leading-7 text-slate-300">
                      읽는 문서를 더 만드는 대신, 후보를 정리하고 검증하고 PRD와 MVP 실행 패키지까지 잇는 작업면을 만듭니다.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link href="/workspace" className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100">
                        지금 시작
                        <ArrowRight size={16} />
                      </Link>
                      <a href="#preview" className="avl-btn h-11 border border-white/12 bg-white/6 px-5 text-sm text-white hover:bg-white/10">
                        보드 미리 보기
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-px border border-white/10 bg-white/10">
                    <div className="bg-black/30 px-5 py-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">why this works</div>
                      <div className="mt-3 max-w-[12ch] text-[32px] font-semibold leading-[1.02] tracking-tight text-white">
                        설명서보다 실행 흐름이 먼저 서는 제품.
                      </div>
                    </div>
                    <div className="bg-white/5 px-5 py-4 text-sm leading-6 text-slate-300">
                      AI가 먼저 초안과 검증 질문을 만들고, 사람은 진행·보강·전환·중단 같은 결론에 집중합니다.
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-px border border-white/10 bg-white/10 md:grid-cols-4">
                  {heroSignals.map((item) => (
                    <div key={item.title} className="bg-white/4 px-5 py-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                      <div className="mt-4 text-lg font-semibold text-white">{item.title}</div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              <div className="bg-[#f3f1ea] px-6 py-5 text-slate-950">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">single operator flow</div>
                <div className="mt-3 max-w-[12ch] text-[30px] font-semibold leading-[1.04] tracking-tight">
                  혼자 시작해도 끝까지 이어지는 실행 보드.
                </div>
              </div>
              <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                <div className="bg-white/5 px-5 py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">AI assists</div>
                  <p className="mt-4 text-sm leading-6 text-slate-200">후보, 질문, 리스크, 산출물 뼈대, 실행 패키지를 먼저 채웁니다.</p>
                </div>
                <div className="bg-white/5 px-5 py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">human decides</div>
                  <p className="mt-4 text-sm leading-6 text-slate-200">지금 밀지, 보강할지, 전환할지, 중단할지 같은 결론만 빠르게 정리합니다.</p>
                </div>
              </div>
              <div className="bg-white/5 px-6 py-5">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">workspace preview</div>
                    <div className="mt-2 text-sm leading-6 text-slate-200">실제 보드는 아래에서 필요한 만큼만 확인합니다.</div>
                  </div>
                  <span className="avl-pill border-white/12 bg-white/8 !text-slate-100">live board</span>
                </div>
                <div className="mt-5 overflow-hidden border border-white/10 bg-black/20">
                  <Image
                    src="/images/workspace-preview.png"
                    alt="AI Venture Lab workspace preview detail"
                    width={1600}
                    height={980}
                    className="h-auto w-full object-cover object-top opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="mt-4 border border-slate-200 bg-white">
          <div className="grid gap-px bg-slate-200 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="bg-[#f7f6f2] px-6 py-7 sm:px-7">
              <div className="avl-kicker">workflow</div>
              <h2
                className="mt-4 max-w-[9ch] text-[40px] font-normal leading-[0.98] tracking-[-0.035em] text-slate-950 sm:text-[52px]"
                style={{ fontFamily: "var(--font-newsreader)" }}
              >
                메모에서 실행까지 끊기지 않는 세 단계.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                홈은 제품의 인상을 만들고, 보드는 지금 무엇을 정해야 하는지부터 보여줍니다.
              </p>
            </div>

            <div className="grid gap-px bg-slate-200">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.id} className="grid gap-px bg-slate-200 md:grid-cols-[72px_minmax(0,1fr)_88px]">
                    <div className="bg-white px-6 py-6 sm:px-7">
                      <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                        <Icon size={20} />
                      </span>
                    </div>
                    <div className="bg-white px-6 py-6 sm:px-7">
                      <h3 className="text-[24px] font-semibold tracking-tight text-slate-950">{step.title}</h3>
                      <p className="mt-3 max-w-[44ch] text-sm leading-6 text-slate-600">{step.body}</p>
                    </div>
                    <div className="bg-[#f7f6f2] px-6 py-6 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:px-7">
                      {step.id}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="preview" className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_380px]">
          <div className="border border-slate-200 bg-white">
            <div className="grid gap-px bg-slate-200 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-white px-6 py-5 sm:px-7">
                <div className="avl-kicker">workspace preview</div>
                <div className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">
                  화면 전체를 히어로에 넣지 않고, 필요한 순간에만 실제 작업면을 보여줍니다.
                </div>
              </div>
              <div className="bg-[#f7f6f2] px-6 py-5 text-sm leading-6 text-slate-600">
                후보 발굴, 검증 판단, 실행 패키지, 출시 후 학습까지 한 보드에서 이어지는 구조를 미리 볼 수 있습니다.
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-950/95 p-4 sm:p-5">
              <div className="overflow-hidden border border-white/10 bg-slate-900">
                <Image
                  src="/images/workspace-preview.png"
                  alt="AI Venture Lab workspace preview detail"
                  width={1600}
                  height={980}
                  className="h-auto w-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-px border border-slate-200 bg-slate-200">
            {principles.map((block) => {
              const Icon = block.icon;
              return (
                <div key={block.title} className="bg-white px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                      <Icon size={18} />
                    </span>
                    <div className="avl-kicker">{block.title}</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{block.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-4 border border-slate-950 bg-slate-950 text-white">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="bg-slate-950 px-6 py-7 sm:px-7">
              <div className="avl-kicker !text-slate-300">outputs</div>
              <h2
                className="mt-4 max-w-[10ch] text-[38px] font-normal leading-[0.98] tracking-[-0.03em] text-white sm:text-[48px]"
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
