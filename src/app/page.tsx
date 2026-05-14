import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어를 구조화하고, 검증하고, 실행 패키지까지 만드는 AI 실행 워크스페이스입니다.",
};

const primaryFlow = [
  {
    step: "01",
    title: "아이디어 정리",
    detail: "대화, 메모, 브리프를 붙여 넣으면 AI가 후보와 검증 질문을 먼저 구조화합니다.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "검증 판단",
    detail: "수요, 리스크, 실험 계획을 한 흐름으로 맞추고 진행·보류·중단을 기록합니다.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "제작 준비",
    detail: "기획서, PRD, MVP 범위, 개발 태스크와 출시 조건을 한 묶음으로 정리합니다.",
    icon: ClipboardList,
  },
  {
    step: "04",
    title: "출시 후 학습",
    detail: "Day 7, 14, 30 행동 신호를 보고 다음 빌드와 보강 판단으로 연결합니다.",
    icon: Rocket,
  },
];

const capabilityCards = [
  {
    title: "AI가 먼저 채우는 실행 흐름",
    detail: "사용자가 모든 필드를 다 쓰지 않아도 됩니다. AI가 초안, 검증 질문, 산출물 골격을 먼저 만듭니다.",
  },
  {
    title: "한 사람이 끝까지 가는 구조",
    detail: "아이디어 발굴, 검증, 디자인·개발 준비, 출시 판단까지 한 사람이 이어서 처리할 수 있게 설계했습니다.",
  },
  {
    title: "협업은 필요할 때만",
    detail: "기본은 솔로 실행형입니다. 필요한 경우에만 워크스페이스와 멤버를 연결해 함께 검토할 수 있습니다.",
  },
];

const deliverables = [
  "아이디어 브리프",
  "검증 패키지",
  "리스크 로그",
  "7일 실험 계획",
  "PRD / MVP 범위",
  "개발 태스크 보드",
  "출시 판단 요약",
  "학습 리포트",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
        <header className="avl-card overflow-hidden">
          <div className="flex flex-col gap-8 px-5 py-5 lg:flex-row lg:items-start lg:justify-between lg:px-6 lg:py-6">
            <div className="max-w-[720px]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="avl-kicker">
                  <FlaskConical size={15} />
                  AI Venture Lab
                </div>
                <span className="avl-pill avl-pill-brand">home</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="avl-btn avl-btn-secondary h-8 px-3 text-xs">홈</span>
                  <Link href="/workspace" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                    실행 보드
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
              <h1 className="mt-4 max-w-[12ch] text-[34px] font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-[48px]">
                아이디어를 검증하고
                <br />
                실행까지 이어가는 AI 워크스페이스
              </h1>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-slate-600">
                회의 메모나 대화에서 후보를 구조화하고, 검증 패키지와 제작 준비물까지 한 흐름으로 정리합니다.
                사용자는 꼭 필요한 판단만 보완하면 됩니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/workspace" className="avl-btn avl-btn-primary">
                  실행 보드 열기
                  <ArrowRight size={16} />
                </Link>
                <a href="#flow" className="avl-btn avl-btn-secondary">
                  작동 방식 보기
                </a>
              </div>
            </div>

            <div className="avl-surface-muted grid w-full max-w-[420px] gap-3 p-3 sm:grid-cols-2">
              <div className="avl-surface-subtle p-4">
                <div className="avl-kicker">workspace</div>
                <div className="mt-3 text-lg font-semibold text-slate-950">한 사람이 끝까지</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">아이디어 발굴부터 출시 판단까지 끊기지 않는 단일 흐름</p>
              </div>
              <div className="avl-surface-subtle p-4">
                <div className="avl-kicker">ai first</div>
                <div className="mt-3 text-lg font-semibold text-slate-950">AI가 초안과 체크리스트를 먼저</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">검증 질문, 산출물 골격, 다음 액션을 자동 제안</p>
              </div>
              <div className="avl-surface-subtle p-4 sm:col-span-2">
                <div className="avl-kicker">outputs</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {deliverables.slice(0, 4).map((item) => (
                    <span key={item} className="avl-pill avl-pill-neutral">
                      {item}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  아이디어 브리프, 검증 패키지, PRD, MVP 범위, 실행 태스크, 학습 리포트까지 이어집니다.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section id="flow" className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="avl-card p-5 sm:p-6">
            <div className="avl-kicker">workflow</div>
            <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-slate-950">AI가 먼저 만들고, 사람은 결정만 보완합니다.</h2>
            <p className="mt-3 max-w-[62ch] text-sm leading-6 text-slate-600">
              이 제품은 랜딩 페이지보다 작업 흐름이 중요한 도구입니다. 한 단계에서 한 질문만 다루고, AI가 초안과 다음
              액션을 먼저 준비하는 구조로 설계했습니다.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {primaryFlow.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.step} className="avl-surface-subtle p-4">
                    <div className="flex items-center gap-3">
                      <span className="avl-icon-frame">
                        <Icon size={18} />
                      </span>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.step}</div>
                        <h3 className="mt-1 text-base font-semibold text-slate-950">{item.title}</h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="avl-card p-5 sm:p-6">
            <div className="avl-kicker">workspace snapshot</div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">한 화면에서 보는 현재 질문</h2>
            <div className="avl-surface-muted mt-5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Layers3 size={14} />
                step 2 / 13
              </div>
              <div className="mt-3 text-xl font-semibold leading-tight text-slate-950">
                대화나 메모에서 무엇을 제품 후보로 올릴지 정리되었나요?
              </div>
              <div className="mt-4 grid gap-2">
                <div className="avl-surface-subtle p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">AI가 먼저 하는 일</div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">후보, 문제 신호, 사용자, 검증 방향을 먼저 구조화합니다.</p>
                </div>
                <div className="avl-surface-subtle p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">이번 단계 결과</div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">추천 후보 1개와 비교 후보 큐를 바로 다음 단계로 넘길 수 있게 만듭니다.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="avl-pill avl-pill-info">아이디어 찾기</span>
              <span className="avl-pill avl-pill-neutral">후보 선택</span>
              <span className="avl-pill avl-pill-neutral">사업성 평가</span>
              <span className="avl-pill avl-pill-neutral">출시 판단</span>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {capabilityCards.map((card) => (
            <article key={card.title} className="avl-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <CheckCircle2 size={14} />
                why it works
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
            </article>
          ))}
        </section>

        <section className="avl-card p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[620px]">
              <div className="avl-kicker">deliverables</div>
              <h2 className="mt-3 text-[26px] font-semibold tracking-tight text-slate-950">실행에 필요한 문서와 판단을 한 번에 정리합니다.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                단순 아이디어 메모로 끝나지 않습니다. 검증 기록, 제작 준비물, 출시 전후 판단 근거까지 같은 제품 안에서 이어집니다.
              </p>
            </div>
            <Link href="/workspace" className="avl-btn avl-btn-secondary shrink-0">
              보드에서 바로 시작
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {deliverables.map((item) => (
              <div key={item} className="avl-surface-subtle p-4 text-sm font-semibold text-slate-900">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
