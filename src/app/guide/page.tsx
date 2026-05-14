import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ClipboardCheck, ClipboardList, FlaskConical, Rocket, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "사용 가이드 | AI Venture Lab",
  description: "AI Venture Lab 사용 흐름과 산출물을 정리한 가이드 페이지입니다.",
};

const guideSteps = [
  {
    title: "아이디어 찾기",
    body: "회의 메모나 AI 대화를 붙여넣으면 후보와 검증 방향을 먼저 구조화합니다.",
    icon: Sparkles,
  },
  {
    title: "검증과 리스크 정리",
    body: "점수, 위험, 7일 실험, 진행 판단을 묶어 정말 밀 후보만 남깁니다.",
    icon: ShieldCheck,
  },
  {
    title: "기획과 제작 준비",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단까지 한 흐름으로 이어집니다.",
    icon: ClipboardList,
  },
  {
    title: "출시 후 학습",
    body: "Day 7/14/30 신호를 모아 다음 반복과 투자 판단으로 연결합니다.",
    icon: Rocket,
  },
];

const artifacts = [
  "아이디어 브리프",
  "검증 패키지",
  "리스크 로그",
  "7일 실험 계획",
  "PRD / MVP 명세",
  "개발 태스크 보드",
  "출시 판단 패킷",
  "학습 리포트",
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <header className="avl-card px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="avl-kicker">
                <FlaskConical size={15} />
                AI Venture Lab
              </div>
              <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-slate-950">사용 가이드</h1>
              <p className="mt-2 max-w-[62ch] text-sm leading-6 text-slate-600">
                메인 홈은 제품 소개에 집중하고, 실제 사용 흐름과 산출물 설명은 이 페이지에 모아둡니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="avl-btn avl-btn-secondary">
                홈으로
              </Link>
              <Link href="/workspace" className="avl-btn avl-btn-primary">
                실행 보드 열기
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-4">
          {guideSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="avl-card p-5">
                <span className="avl-icon-frame">
                  <Icon size={18} />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-950">{step.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
              </article>
            );
          })}
        </section>

        <section className="avl-card p-5 sm:p-6">
          <div className="avl-kicker">
            <ClipboardCheck size={15} />
            deliverables
          </div>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">보드 안에서 쌓이는 기본 산출물</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {artifacts.map((item) => (
              <div key={item} className="avl-surface-subtle p-4 text-sm font-medium text-slate-900">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
