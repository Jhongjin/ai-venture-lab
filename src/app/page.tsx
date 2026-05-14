import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
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
    title: "대화나 메모를 원문 그대로 넣습니다",
    body: "회의 기록, 대화, 브레인스토밍 문장을 그대로 붙여넣으면 AI가 후보와 검증 방향을 먼저 구조화합니다.",
    icon: Sparkles,
  },
  {
    id: "02",
    title: "한 보드에서 수요와 리스크를 정리합니다",
    body: "점수, 리스크, 7일 실험, 진행 판단을 따로 옮기지 않고 하나의 작업면에서 계속 이어갑니다.",
    icon: ShieldCheck,
  },
  {
    id: "03",
    title: "기획과 MVP 실행까지 바로 연결합니다",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단, 학습 리포트까지 같은 흐름 안에서 정리합니다.",
    icon: Rocket,
  },
];

const proofBlocks = [
  {
    title: "AI가 먼저 채웁니다",
    body: "후보, 질문, 리스크, 산출물 뼈대, 실행 패키지를 먼저 만들어줍니다.",
  },
  {
    title: "사람은 결정에 집중합니다",
    body: "밀지, 보강할지, 전환할지, 중단할지만 분명하게 판단하면 됩니다.",
  },
  {
    title: "협업은 옵션입니다",
    body: "기본은 혼자 끝까지 가는 흐름이고, 필요할 때만 팀 공간을 붙이면 됩니다.",
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
    <main className="min-h-screen bg-[#eef1f5] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
        <header className="rounded-[16px] border border-slate-200/90 bg-white px-4 py-3 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:px-5">
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
                흐름 보기
              </a>
              <a href="#preview" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                보드 미리보기
              </a>
              <Link href="/guide" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                사용 가이드
              </Link>
              <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                실행 보드 열기
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[24px] border border-slate-950 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(circle at 18% 18%, rgba(148,163,184,0.35), transparent 34%), radial-gradient(circle at 82% 24%, rgba(51,65,85,0.4), transparent 32%)",
              backgroundSize: "56px 56px, 56px 56px, auto, auto",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.1)_0%,rgba(2,6,23,0)_35%,rgba(255,255,255,0.06)_100%)]" />

          <div className="relative z-10 grid gap-8 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="avl-kicker !text-slate-300">
                  <LayoutGrid size={15} />
                  execution workspace for founders and operators
                </div>
                <div className="max-w-[980px] space-y-4">
                  <h1 className="max-w-[10ch] text-[54px] font-semibold leading-[0.92] tracking-tight text-white sm:text-[76px] xl:text-[92px]">
                    AI Venture Lab
                  </h1>
                  <p className="max-w-[12ch] font-serif text-[28px] leading-[1.02] tracking-[-0.03em] text-slate-100 sm:text-[38px] xl:text-[46px]">
                    아이디어를 설명으로 남기지 않고 실행까지 끌고 갑니다.
                  </p>
                  <p className="max-w-[64ch] text-[15px] leading-7 text-slate-300 sm:text-[17px]">
                    메모에서 후보를 뽑고, 검증과 판단을 정리하고, 기획서와 MVP 실행까지 같은 보드 안에서 이어지는
                    실행형 워크스페이스입니다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/workspace" className="avl-btn avl-btn-primary bg-white !text-slate-950 hover:bg-slate-100">
                    지금 시작
                    <ArrowRight size={16} />
                  </Link>
                  <a href="#preview" className="avl-btn border border-white/15 bg-white/6 text-white hover:bg-white/10">
                    보드 미리 보기
                  </a>
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="border border-white/12 bg-white/6 px-4 py-4 backdrop-blur-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">AI 초안</div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">후보, 질문, 산출물 뼈대 자동 생성</p>
                  </div>
                  <div className="border border-white/12 bg-white/6 px-4 py-4 backdrop-blur-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Solo first</div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">한 사람이 끝까지 끌고 갈 수 있는 흐름</p>
                  </div>
                  <div className="border border-white/12 bg-white/6 px-4 py-4 backdrop-blur-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">MVP link</div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">기획에서 출시 판단까지 같은 보드</p>
                  </div>
                </div>

                <div className="border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-sm">
                  <div className="avl-kicker !text-slate-300">why it lands</div>
                  <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-white">설명서가 아니라 실행을 앞으로 미는 보드</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    AI는 먼저 만들고, 사람은 핵심 판단만 보완합니다. 협업은 옵션이고, 기본은 한 명이 끝까지 가는
                    흐름입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 xl:grid-rows-[minmax(0,1fr)_220px]">
              <div className="relative border border-white/12 bg-white/6 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 pb-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">live board view</div>
                    <div className="mt-1 text-sm text-slate-200">후보 발굴부터 판단까지 같은 화면에서 이어집니다.</div>
                  </div>
                  <span className="avl-pill border-white/12 bg-white/8 !text-slate-100">workspace</span>
                </div>
                <div className="relative mt-3 overflow-hidden border border-white/12 bg-slate-900">
                  <Image
                    src="/images/workspace-preview.png"
                    alt="AI Venture Lab workspace preview"
                    width={1200}
                    height={860}
                    priority
                    className="h-auto w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(2,6,23,0)_0%,rgba(2,6,23,0.92)_100%)]" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {proofBlocks.map((block) => (
                  <div key={block.title} className="border border-white/12 bg-white/6 px-4 py-4 backdrop-blur-sm">
                    <div className="text-[12px] font-semibold tracking-tight text-white">{block.title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{block.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="grid gap-4 border border-slate-200 bg-white px-5 py-6 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-end">
            <div>
              <div className="avl-kicker">workflow</div>
              <h2 className="mt-3 max-w-[13ch] text-[34px] font-semibold tracking-tight text-slate-950 sm:text-[42px]">
                한 줄 메모에서 MVP 실행까지, 한 흐름으로 갑니다.
              </h2>
            </div>
            <p className="max-w-[64ch] text-sm leading-6 text-slate-600">
              실행 보드는 매 단계마다 지금 무엇을 정해야 하는지 먼저 보여줍니다. 그래서 화면을 넘길 때마다 다시
              설명을 읽지 않아도, 다음 판단으로 이어질 수 있습니다.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 xl:grid-cols-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.id} className="bg-white px-5 py-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="avl-icon-frame">
                      <Icon size={18} />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{step.id}</span>
                  </div>
                  <h3 className="mt-6 text-[24px] font-semibold tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-4 max-w-[40ch] text-sm leading-6 text-slate-600">{step.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="preview" className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.78fr)] xl:items-start">
          <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
            <div className="grid gap-px border-b border-slate-200 bg-slate-200 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-white px-5 py-4">
                <div className="avl-kicker">workspace preview</div>
                <div className="mt-2 text-[26px] font-semibold tracking-tight text-slate-950">한 화면에서 후보, 판단, 실행까지</div>
              </div>
              <div className="bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                실제 보드는 후보 발굴, 검증 판단, 실험과 출시 후 학습까지 같은 공간 안에서 이어집니다.
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

          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200">
            <div className="bg-white px-5 py-5">
              <div className="avl-kicker">solo-first</div>
              <h3 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-950">기본은 혼자서 끝까지 가는 실행 흐름</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                아이디어 발굴, 검증, 기획, 제작 준비, 출시 후 학습까지 한 명이 계속 이어서 볼 수 있게 구성했습니다.
                팀 초대는 필요한 순간에만 붙입니다.
              </p>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              {proofBlocks.slice(0, 2).map((block) => (
                <div key={block.title} className="bg-white px-5 py-5">
                  <div className="avl-kicker">{block.title}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{block.body}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              {deliverables.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-3 bg-white px-5 py-4">
                    <span className="avl-icon-frame avl-icon-frame-sm">
                      <Icon size={14} />
                    </span>
                    <span className="text-sm font-medium text-slate-800">{item.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border border-slate-950 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="grid gap-px bg-white/10 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="bg-slate-950 px-6 py-6 sm:px-7">
              <div className="avl-kicker !text-slate-300">ready to move</div>
              <h2 className="mt-3 max-w-[14ch] text-[36px] font-semibold tracking-tight text-white">
                읽는 문서를 쌓는 대신, 실행 가능한 패키지를 남깁니다.
              </h2>
              <p className="mt-3 max-w-[62ch] text-sm leading-6 text-slate-300">
                보드 안에서는 후보, 질문, 리스크, 산출물, 실행 태스크, 출시 판단이 한 흐름으로 연결됩니다.
              </p>
            </div>
            <div className="bg-slate-950 px-6 py-6">
              <div className="space-y-3">
                <Link href="/workspace" className="avl-btn avl-btn-primary w-full bg-white !text-slate-950 hover:bg-slate-100">
                  실행 보드 열기
                  <ArrowRight size={16} />
                </Link>
                <Link href="/guide" className="avl-btn w-full border border-white/12 bg-white/6 text-white hover:bg-white/10">
                  사용 가이드 보기
                </Link>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                <MoveRight size={16} />
                시작은 홈에서, 실행은 보드에서 이어집니다.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
