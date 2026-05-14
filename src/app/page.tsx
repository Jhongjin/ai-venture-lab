import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  FlaskConical,
  LayoutGrid,
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
    title: "원문에서 후보를 바로 뽑습니다",
    body: "회의 메모, 대화, 브레인스토밍 문장을 붙여넣으면 AI가 후보와 검증 방향을 먼저 구조화합니다.",
    icon: Sparkles,
  },
  {
    id: "02",
    title: "수요와 리스크를 한 화면에서 정리합니다",
    body: "점수, 리스크, 7일 실험, 진행 판단을 끊기지 않는 하나의 흐름으로 다룹니다.",
    icon: ShieldCheck,
  },
  {
    id: "03",
    title: "기획서와 MVP 실행까지 연결합니다",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단, 학습 리포트까지 같은 보드 안에서 이어집니다.",
    icon: Rocket,
  },
];

const stats = [
  ["AI 초안", "후보, 질문, 산출물 뼈대 자동 생성"],
  ["솔로 실행", "한 명이 끝까지 밀고 갈 수 있는 흐름"],
  ["팀 협업", "필요할 때만 워크스페이스 초대"],
  ["MVP 연결", "기획에서 출시 판단까지 같은 보드"],
];

const deliverables = [
  "아이디어 브리프",
  "검증 패키지",
  "리스크 로그",
  "7일 실험",
  "PRD / MVP 범위",
  "개발 태스크 보드",
  "출시 판단",
  "학습 리포트",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="avl-kicker">
              <FlaskConical size={15} />
              AI Venture Lab
            </div>
            <span className="avl-pill avl-pill-brand">landing</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="#workflow" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
              작동 방식
            </a>
            <Link href="/guide" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
              사용 가이드
            </Link>
            <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
              실행 보드 열기
              <ArrowRight size={15} />
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[32px] border border-slate-900 bg-slate-950 text-white">
          <Image
            src="/images/workspace-preview.png"
            alt="AI Venture Lab workspace preview"
            fill
            priority
            className="object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.78)_34%,rgba(2,6,23,0.35)_100%)]" />
          <div className="relative z-10 grid min-h-[580px] gap-6 px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,0.78fr)_minmax(320px,0.42fr)] xl:items-end">
            <div className="flex max-w-[760px] flex-col justify-between gap-10">
              <div className="space-y-5">
                <div className="avl-kicker !text-slate-200">
                  <LayoutGrid size={15} />
                  idea to mvp operating system
                </div>
                <h1 className="max-w-[10ch] text-[52px] font-semibold leading-[0.92] tracking-tight text-white sm:text-[78px]">
                  AI Venture Lab
                </h1>
                <p className="max-w-[60ch] text-[16px] leading-7 text-slate-200 sm:text-[18px]">
                  아이디어를 메모에서 꺼내 검증하고, 기획과 MVP 실행까지 한 사람이 끝까지 끌고 갈 수 있게 만든 실행형
                  워크스페이스입니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/workspace" className="avl-btn avl-btn-primary bg-white !text-slate-950 hover:bg-slate-100">
                    지금 시작
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#showcase"
                    className="avl-btn border border-white/20 bg-white/8 text-white hover:bg-white/14"
                  >
                    보드 미리 보기
                  </a>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                {stats.map(([label, body]) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-100">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden xl:block">
              <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                <div className="avl-kicker !text-slate-200">why it stays open</div>
                <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-white">설명서가 아니라, 실행을 앞으로 미는 보드</h2>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  AI가 후보와 산출물을 먼저 만들고, 사용자는 중요한 판단만 보완합니다. 팀 초대는 옵션이고, 기본은
                  솔로 실행입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="grid gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7"
        >
          <div className="flex flex-col gap-3">
            <div className="avl-kicker">workflow</div>
            <h2 className="text-[34px] font-semibold tracking-tight text-slate-950">한 줄 메모에서 MVP 실행까지, 한 흐름으로 갑니다.</h2>
            <p className="max-w-[68ch] text-sm leading-6 text-slate-600">
              홈은 시선을 끌고, 보드는 실제 일을 시작하게 해야 합니다. 그래서 안쪽 워크스페이스는 지금 무엇을 정해야
              하는지부터 보여줍니다.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <span className="avl-icon-frame">
                      <Icon size={18} />
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{step.id}</div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950">{step.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{step.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="showcase" className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <div className="avl-kicker">workspace preview</div>
                <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950">한 화면에서 후보, 판단, 실행까지</div>
              </div>
              <span className="avl-pill avl-pill-brand">live board</span>
            </div>
            <div className="bg-slate-950">
              <Image
                src="/images/workspace-preview.png"
                alt="AI Venture Lab workspace preview detail"
                width={1600}
                height={980}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[26px] border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
              <div className="avl-kicker">solo-first</div>
              <h3 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">기본은 혼자서 끝까지 가는 실행 흐름</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                아이디어 발굴, 검증, 기획, 제작 준비, 출시 후 학습까지 한 명이 계속 이어서 볼 수 있게 구성했습니다.
                워크스페이스 초대는 나중에 붙이면 됩니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
                <div className="avl-kicker">ai assists</div>
                <div className="mt-3 text-lg font-semibold text-slate-950">AI가 먼저 채웁니다</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">후보, 검증 질문, 리스크, 산출물 뼈대, 실행 패키지를 먼저 만듭니다.</p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
                <div className="avl-kicker">human decides</div>
                <div className="mt-3 text-lg font-semibold text-slate-950">사람은 결정에 집중합니다</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">지금 밀지, 보강할지, 전환할지, 중단할지 같은 판단만 보완하면 됩니다.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="deliverables"
          className="rounded-[28px] border border-slate-950 bg-slate-950 px-6 py-6 text-white shadow-[0_20px_48px_rgba(15,23,42,0.18)] sm:px-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <div className="avl-kicker !text-slate-300">outputs</div>
              <h2 className="mt-3 text-[34px] font-semibold tracking-tight text-white">결국 남는 건 읽는 문서가 아니라 실행 가능한 패키지입니다.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                홈에서는 제품을 이해하고, 보드에서는 바로 움직이게 만드는 산출물을 차곡차곡 쌓습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/workspace" className="avl-btn avl-btn-primary bg-white !text-slate-950 hover:bg-slate-100">
                실행 보드 열기
                <ArrowRight size={16} />
              </Link>
              <Link href="/guide" className="avl-btn border border-white/16 bg-white/8 text-white hover:bg-white/14">
                사용 가이드 보기
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {deliverables.map((item) => (
              <div key={item} className="rounded-[18px] border border-white/12 bg-white/8 px-4 py-4 text-sm font-medium text-slate-100">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
