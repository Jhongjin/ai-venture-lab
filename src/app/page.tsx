import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Blocks,
  FileText,
  FlaskConical,
  LayoutGrid,
  Layers3,
  MoveRight,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어를 검증하고, 기획과 MVP 실행까지 이어주는 AI venture workspace입니다.",
};

const workflowSteps = [
  {
    id: "01",
    title: "원문에서 후보를 뽑습니다",
    body: "회의 메모, 대화, 브레인스토밍 문장을 그대로 넣으면 AI가 후보와 검증 방향을 먼저 나눕니다.",
    icon: Sparkles,
  },
  {
    id: "02",
    title: "검증 판단을 한 화면에서 끝냅니다",
    body: "수요, 리스크, 7일 실험, 진행 판단을 다른 문서로 옮기지 않고 같은 작업면 안에서 이어갑니다.",
    icon: ShieldCheck,
  },
  {
    id: "03",
    title: "기획과 MVP 실행으로 바로 연결합니다",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단, 학습 리포트까지 한 흐름 안에서 이어집니다.",
    icon: Rocket,
  },
];

const operatingPrinciples = [
  {
    title: "AI가 먼저 채웁니다",
    body: "후보, 질문, 리스크, 산출물 뼈대, 실행 패키지를 먼저 만듭니다.",
  },
  {
    title: "사람은 판단에 집중합니다",
    body: "진행할지, 보강할지, 전환할지, 중단할지 같은 결론만 선명하게 정하면 됩니다.",
  },
  {
    title: "협업은 옵션입니다",
    body: "기본은 혼자 끝까지 가는 흐름이고, 필요할 때만 워크스페이스와 팀 초대를 붙입니다.",
  },
];

const deliverables = [
  { title: "아이디어 브리프", icon: FileText },
  { title: "검증 패키지", icon: ShieldCheck },
  { title: "MVP 범위", icon: Layers3 },
  { title: "실행 태스크", icon: LayoutGrid },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#eceff3] text-[var(--foreground)]">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6">
        <header className="border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="avl-kicker">
                <FlaskConical size={15} />
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
                가이드
              </Link>
              <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                실행 보드 열기
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <section className="overflow-hidden border border-slate-950 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1.2fr)_380px]">
            <div className="relative bg-slate-950 px-6 py-7 sm:px-8 sm:py-8">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "52px 52px",
                }}
              />
              <div className="relative z-10">
                <div className="avl-kicker !text-slate-300">
                  <Blocks size={15} />
                  idea to mvp operating system
                </div>
                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start">
                  <div>
                    <h1 className="max-w-[11ch] text-[56px] font-semibold leading-[0.92] tracking-tight text-white sm:text-[76px] xl:text-[88px]">
                      AI Venture Lab
                    </h1>
                    <p className="mt-5 max-w-[16ch] text-[26px] font-semibold leading-[1.05] tracking-tight text-slate-100 sm:text-[34px]">
                      아이디어를 읽히는 문서가 아니라 움직이는 실행 흐름으로 바꿉니다.
                    </p>
                    <p className="mt-5 max-w-[64ch] text-[15px] leading-7 text-slate-300">
                      메모에서 후보를 꺼내고, 검증하고, 기획과 MVP 실행까지 한 사람이 끝까지 끌고 갈 수 있게 만든
                      실행형 워크스페이스입니다.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link href="/workspace" className="avl-btn avl-btn-primary bg-white !text-slate-950 hover:bg-slate-100">
                        지금 시작
                        <ArrowRight size={16} />
                      </Link>
                      <a href="#preview" className="avl-btn border border-white/12 bg-white/6 text-white hover:bg-white/10">
                        보드 미리 보기
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-px border border-white/10 bg-white/10">
                    <div className="bg-slate-950/90 px-4 py-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">why it stays open</div>
                      <div className="mt-3 text-[28px] font-semibold leading-[1.05] tracking-tight text-white">
                        설명서가 아니라, 실행을 앞으로 미는 보드
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        AI가 먼저 초안을 만들고, 사람은 중요한 판단만 보완합니다. 팀 초대는 옵션이고 기본은 솔로
                        실행입니다.
                      </p>
                    </div>
                    <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                      <div className="bg-slate-950/90 px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">AI assists</div>
                        <p className="mt-2 text-sm leading-6 text-slate-200">후보, 질문, 산출물 뼈대, 실행 패키지를 먼저 만듭니다.</p>
                      </div>
                      <div className="bg-slate-950/90 px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Human decides</div>
                        <p className="mt-2 text-sm leading-6 text-slate-200">진행, 보강, 전환, 중단 같은 결론만 선명하게 고르면 됩니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10">
              <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-2">
                {[
                  ["아이디어", "후보를 실행 대상으로 올린 수"],
                  ["열린 리스크", "아직 닫지 않은 차단 요소"],
                  ["실험", "7일 안에 돌릴 검증 루프"],
                  ["산출물", "PRD, 브리프, 실행 패키지"],
                ].map(([label, body]) => (
                  <div key={label} className="bg-slate-950 px-4 py-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
                    <p className="mt-4 max-w-[20ch] text-sm leading-6 text-slate-200">{body}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-950 px-4 py-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">operating outputs</div>
                <div className="mt-4 grid gap-px border border-white/10 bg-white/10">
                  {deliverables.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-center gap-3 bg-slate-950 px-4 py-3">
                        <span className="avl-icon-frame border-white/10 bg-white/6 text-slate-100">
                          <Icon size={15} />
                        </span>
                        <span className="text-sm font-medium text-slate-100">{item.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-slate-950 p-3">
            <div className="overflow-hidden border border-white/10 bg-slate-900">
              <Image
                src="/images/workspace-preview.png"
                alt="AI Venture Lab workspace preview"
                width={1600}
                height={980}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="workflow" className="grid gap-px border border-slate-200 bg-slate-200 shadow-[0_1px_1px_rgba(15,23,42,0.03)] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="bg-white px-6 py-6 sm:px-7">
            <div className="avl-kicker">workflow</div>
            <h2 className="mt-4 max-w-[12ch] text-[34px] font-semibold tracking-tight text-slate-950 sm:text-[46px]">
              한 줄 메모에서 MVP 실행까지, 한 흐름으로 갑니다.
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-6 text-slate-600">
              홈은 시선을 끌고, 보드는 바로 일을 시작하게 해야 합니다. 그래서 안쪽 워크스페이스는 지금 무엇을 정해야
              하는지부터 보여줍니다.
            </p>
          </div>

          <div className="grid gap-px bg-slate-200">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.id} className="grid gap-4 bg-white px-6 py-6 md:grid-cols-[72px_minmax(0,1fr)_40px] md:items-start">
                  <span className="avl-icon-frame h-14 w-14 rounded-none border-slate-200 bg-slate-50">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="text-[24px] font-semibold tracking-tight text-slate-950">{step.title}</h3>
                    <p className="mt-3 max-w-[42ch] text-sm leading-6 text-slate-600">{step.body}</p>
                  </div>
                  <span className="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{step.id}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section id="preview" className="grid gap-px border border-slate-200 bg-slate-200 shadow-[0_1px_1px_rgba(15,23,42,0.03)] xl:grid-cols-[minmax(0,1.1fr)_420px]">
          <div className="bg-white">
            <div className="grid gap-px border-b border-slate-200 bg-slate-200 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-white px-6 py-5">
                <div className="avl-kicker">workspace preview</div>
                <div className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">한 화면에서 후보, 판단, 실행까지</div>
              </div>
              <div className="bg-white px-6 py-5 text-sm leading-6 text-slate-600">
                후보 발굴, 검증 판단, 실험과 출시 후 학습까지 같은 공간 안에서 이어집니다.
              </div>
            </div>
            <div className="border-t border-slate-200 bg-slate-950">
              <Image
                src="/images/workspace-preview.png"
                alt="AI Venture Lab workspace preview detail"
                width={1600}
                height={980}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="grid gap-px bg-slate-200">
            <div className="bg-white px-6 py-5">
              <div className="avl-kicker">solo-first</div>
              <h3 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-950">기본은 혼자서 끝까지 가는 실행 흐름</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                아이디어 발굴, 검증, 기획, 제작 준비, 출시 후 학습까지 한 명이 이어서 볼 수 있게 설계했습니다. 팀 초대는
                필요한 순간에만 붙입니다.
              </p>
            </div>
            {operatingPrinciples.map((block) => (
              <div key={block.title} className="bg-white px-6 py-5">
                <div className="avl-kicker">{block.title}</div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{block.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-px border border-slate-950 bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="bg-slate-950 px-6 py-6 sm:px-7">
            <div className="avl-kicker !text-slate-300">ready to move</div>
            <h2 className="mt-4 max-w-[14ch] text-[34px] font-semibold tracking-tight text-white sm:text-[42px]">
              읽는 문서보다 실행 가능한 패키지가 먼저 남습니다.
            </h2>
            <p className="mt-4 max-w-[60ch] text-sm leading-6 text-slate-300">
              보드 안에서는 후보, 질문, 리스크, 산출물, 실행 태스크, 출시 판단이 한 흐름으로 이어집니다.
            </p>
          </div>
          <div className="grid gap-px bg-white/10">
            <div className="bg-slate-950 px-6 py-5">
              <Link href="/workspace" className="avl-btn avl-btn-primary w-full bg-white !text-slate-950 hover:bg-slate-100">
                실행 보드 열기
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="bg-slate-950 px-6 py-5">
              <Link href="/guide" className="avl-btn w-full border border-white/12 bg-white/6 text-white hover:bg-white/10">
                기능 설명서는 가이드에서 보기
              </Link>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <MoveRight size={16} />
                시작은 랜딩에서, 실행은 보드에서 이어집니다.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
