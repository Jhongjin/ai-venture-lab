import Link from "next/link";
import type { Metadata } from "next";
import {
  ChartLineUp,
  ClipboardText,
  FileDoc,
  ListChecks,
  Path,
  ShieldCheck,
  Sparkle,
  Target,
} from "@phosphor-icons/react/dist/ssr";

import { AuthAwareCta } from "@/components/auth-aware-cta";
import { VentureHeroMotion } from "@/components/venture-hero-motion";

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어를 넣으면 AI가 검증과 제작 패키지까지 정리하는 실행 보드입니다.",
};

const operatingLoop = [
  {
    id: "01",
    title: "입력",
    body: "회의 메모, 아이디어, GPT 대화를 그대로 붙여넣습니다.",
  },
  {
    id: "02",
    title: "AI 정리",
    body: "사업성, 리스크, 시장 질문, 결과물 형태를 먼저 정리합니다.",
  },
  {
    id: "03",
    title: "사람 확인",
    body: "중요한 판단만 수정하고 저장합니다.",
  },
  {
    id: "04",
    title: "제작 패키지",
    body: "기획서, 화면 구조, 디자인 방향, 기술 작업을 묶습니다.",
  },
  {
    id: "05",
    title: "기록",
    body: "검증 근거와 결정 이유를 다음 판단에 남깁니다.",
  },
];

const packageItems = [
  {
    title: "사업성 평가",
    body: "누가, 왜, 얼마만큼 필요로 하는지 먼저 정리합니다.",
    icon: ChartLineUp,
  },
  {
    title: "시장/경쟁 점검",
    body: "대체재, 포화도, 진입장벽, 첫 검증 질문을 묶습니다.",
    icon: Target,
  },
  {
    title: "검증 계획",
    body: "7일 안에 확인할 행동, 성공 기준, 중단 기준을 만듭니다.",
    icon: ShieldCheck,
  },
  {
    title: "제작 패키지",
    body: "PRD, IA, 디자인 방향, 기술 스택, 작업 순서를 넘길 수 있게 정리합니다.",
    icon: FileDoc,
  },
];

const deckRows = [
  {
    label: "검증 결과 읽는 중",
    status: "완료",
    tone: "bg-[#EFFAF4] text-[#177D4E]",
  },
  {
    label: "결과물 형태 확인 중",
    status: "완료",
    tone: "bg-[#EFFAF4] text-[#177D4E]",
  },
  {
    label: "제작 범위 정리 중",
    status: "진행",
    tone: "bg-[#FFF8EC] text-[#9E5700]",
  },
  {
    label: "외부 개발 도구 전달 자료 정리 중",
    status: "대기",
    tone: "bg-[#F4F4F4] text-[#5E5E5E]",
  },
];

const packageRows = [
  ["결과물 형태", "웹 서비스", "PRD와 화면 구조에 반영"],
  ["핵심 범위", "로그인, 아이디어 입력, AI 정리, 저장", "첫 제작 기준"],
  ["디자인 방향", "운영 콘솔, 짧은 문장, 저장 후 다음 단계", "사용자 판단 최소화"],
  ["개발 전달", "기술 스택, 작업 순서, 검증 근거", "외부 도구가 바로 읽는 자료"],
];

const planBoundaryRows = [
  {
    name: "Free",
    headline: "첫 아이디어를 이해하고 검증",
    detail: "월 100크레딧, 기본 4/10 제작 자료, 첫 검증 계획까지 확인합니다.",
    signal: "처음 시작",
  },
  {
    name: "Pro",
    headline: "반복 제작과 외부 개발 실행",
    detail: "여러 제작 패키지, 외부 개발 도구 자동 반영, 출처 기반 시장 점검을 반복합니다.",
    signal: "관심 등록",
  },
  {
    name: "Team",
    headline: "공유 작업 공간과 승인 기록",
    detail: "팀 워크스페이스, 작업 이력, 연결 관리, 재사용 가능한 제작 템플릿을 준비합니다.",
    signal: "준비 중",
  },
];

export default function HomePage() {
  return (
    <main id="main-content" data-smoke="landing-command-deck" className="min-h-screen bg-[#F7F7F7] text-[#0D0D0D]">
      <section className="relative isolate overflow-hidden bg-[#05070C] text-white">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[60vw] min-w-[760px] opacity-95 lg:block">
          <div className="h-full translate-x-[4%] [&>*]:h-full [&>*]:w-full">
            <VentureHeroMotion />
          </div>
        </div>
        <div aria-hidden="true" className="absolute inset-0 opacity-50 sm:opacity-65 lg:hidden [&>*]:h-full [&>*]:w-full">
          <VentureHeroMotion />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(159,229,193,0.28),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(72,177,255,0.22),transparent_28%),linear-gradient(180deg,rgba(5,7,12,0.18),rgba(5,7,12,0.96))]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,12,0.98)_0%,rgba(5,7,12,0.9)_42%,rgba(5,7,12,0.28)_66%,rgba(5,7,12,0.05)_100%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#F7F7F7]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-12rem)] w-full max-w-[1240px] flex-col px-4 py-6 sm:min-h-[calc(100svh-11rem)] sm:px-6 sm:py-8">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/62">
            <span>AI Venture Lab</span>
            <span>Package OS</span>
          </div>

          <div className="flex flex-1 items-end py-12 sm:py-14 lg:py-16">
            <div className="max-w-[860px]">
              <p className="inline-flex border border-white/16 bg-white/8 px-2.5 py-1 text-xs font-semibold text-[#9FE5C1] backdrop-blur">
                automation-first product OS
              </p>
              <h1 className="mt-7 max-w-[10ch] text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
                AI Venture Lab
              </h1>
              <p className="mt-6 max-w-[18ch] break-keep text-3xl font-semibold leading-tight text-[#DDFBEA] sm:text-4xl lg:text-5xl">
                아이디어는 메모로 들어오고, 제작 패키지로 나갑니다.
              </p>
              <p className="mt-6 max-w-[58ch] break-keep text-base leading-7 text-white/72 sm:text-lg">
                AI가 사업성, 시장성, 리스크, 검증 계획, 제작 범위를 먼저 정리합니다. 사용자는 중요한 판단만 확인합니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <AuthAwareCta className="avl-btn h-11 border border-[#9FE5C1] bg-[#9FE5C1] px-5 text-sm text-[#05070C] hover:bg-[#C9F4DA]" />
                <a href="#command-deck" className="avl-btn h-11 border border-white/18 bg-white/8 px-5 text-sm text-white hover:bg-white/14">
                  패키지 미리보기
                </a>
              </div>

              <dl className="mt-10 hidden max-w-[720px] grid-cols-1 gap-px bg-white/12 text-sm sm:grid sm:grid-cols-3">
                {[
                  ["입력", "메모, 회의록, 대화"],
                  ["정리", "시장성, 리스크, 범위"],
                  ["출력", "제작 패키지"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#05070C]/58 p-4 backdrop-blur">
                    <dt className="text-xs font-semibold text-white/48">{label}</dt>
                    <dd className="mt-2 break-keep text-sm font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section data-smoke="landing-credit-model" className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto grid w-full max-w-[1240px] gap-px bg-[#E5E5E5] px-4 py-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="bg-[#101820] p-5 text-white">
            <p className="text-xs font-semibold text-[#9FE5C1]">Venture Credits</p>
            <h2 className="mt-3 max-w-[18ch] text-2xl font-semibold leading-tight">
              Free로 검증하고, 제작 패스는 실행이 필요할 때 씁니다.
            </h2>
            <p className="mt-3 break-keep text-sm leading-6 text-slate-300">
              베타 기준 Free는 매월 100크레딧을 받고, 한 아이디어를 전체 제작 패키지와 외부 개발 도구 연결까지 열 때 30크레딧을 씁니다.
            </p>
          </div>
          <div className="bg-[#F7F7F7] p-5">
            <p className="text-xs font-semibold text-[#5E5E5E]">Free에서 확인</p>
            <div className="mt-3 text-xl font-semibold text-[#0D0D0D]">4/10 제작 자료</div>
            <p className="mt-2 break-keep text-sm leading-6 text-[#5E5E5E]">
              아이디어 요약, 조사 요약, 7일 검증 계획, 검증 완료 요약까지 먼저 확인합니다.
            </p>
          </div>
          <div className="bg-[#F7F7F7] p-5">
            <p className="text-xs font-semibold text-[#5E5E5E]">제작 패스 후</p>
            <div className="mt-3 text-xl font-semibold text-[#0D0D0D]">30크레딧 / 아이디어</div>
            <p className="mt-2 break-keep text-sm leading-6 text-[#5E5E5E]">
              PRD, 화면 구조, 디자인 기준, 기술 방향, 작업 순서, 외부 개발 도구 전달 파일을 엽니다.
            </p>
          </div>
        </div>
      </section>

      <section data-smoke="landing-plan-boundary" className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
        <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold text-[#5E5E5E]">Free / Pro 기준</p>
            <h2 className="mt-3 max-w-[18ch] break-keep text-3xl font-semibold leading-tight text-[#0D0D0D]">
              결제는 더 많이 만들기 시작할 때 자연스럽게 필요해집니다.
            </h2>
            <p className="mt-4 max-w-[44ch] break-keep text-sm leading-6 text-[#5E5E5E]">
              첫 아이디어 검증은 Free로 충분히 보여주고, Pro 가치는 반복 제작과 외부 개발 도구 연결에서 생기게 설계합니다.
            </p>
            <AuthAwareCta
              className="avl-btn mt-7 h-11 border border-[#0D0D0D] bg-[#0D0D0D] px-5 text-sm text-white hover:bg-[#262626]"
              signedInLabel="실행 보드 열기"
              signedOutLabel="Free로 시작하기"
            />
          </div>
          <div className="grid gap-px bg-[#DADADA] md:grid-cols-3">
            {planBoundaryRows.map((plan) => (
              <article key={plan.name} className="bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-[#0D0D0D]">{plan.name}</h3>
                  <span className="border border-[#E5E5E5] bg-[#F7F7F7] px-2 py-1 text-xs font-semibold text-[#5E5E5E]">
                    {plan.signal}
                  </span>
                </div>
                <p className="mt-5 min-h-12 break-keep text-base font-semibold leading-6 text-[#101820]">{plan.headline}</p>
                <p className="mt-3 break-keep text-sm leading-6 text-[#5E5E5E]">{plan.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="command-deck" className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="inline-flex border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs font-semibold text-[#5E5E5E]">
              automation-first product OS
            </p>
            <h1 className="mt-8 max-w-[10ch] text-5xl font-semibold leading-none text-[#0D0D0D] sm:text-6xl lg:text-7xl">
              AI Venture Lab
            </h1>
            <p className="mt-6 max-w-[19ch] break-keep text-3xl font-semibold leading-tight text-[#101820] sm:text-4xl">
              아이디어를 제작 가능한 패키지로 정리하는 AI 실행 보드
            </p>
            <p className="mt-5 max-w-[54ch] break-keep text-base leading-7 text-[#5E5E5E]">
              메모만 넣으면 AI가 사업성, 리스크, 시장성, 검증 계획, 제작 자료를 먼저 정리합니다. 사용자는 중요한 판단만 확인하고 저장합니다.
            </p>

            <dl className="mt-9 grid max-w-[520px] grid-cols-3 border-y border-[#E5E5E5] text-sm">
              {[
                ["사람의 일", "확인, 수정, 저장"],
                ["AI의 일", "정리, 조사, 묶기"],
                ["마지막 결과", "제작 패키지"],
              ].map(([label, value]) => (
                <div key={label} className="border-r border-[#E5E5E5] py-4 pr-3 last:border-r-0 sm:pr-5">
                  <dt className="text-xs font-semibold text-[#9A9A9A]">{label}</dt>
                  <dd className="mt-2 break-keep text-sm font-semibold text-[#0D0D0D]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-smoke="landing-package-preview" className="border border-[#DADADA] bg-white p-3 shadow-[0_18px_48px_rgba(13,13,13,0.08)]">
            <div className="border border-[#202938] bg-[#101820] text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-[#9FE5C1]">실행 보드</p>
                  <p className="mt-1 text-sm font-semibold text-white">AI 제작 패키지 만들기</p>
                </div>
                <span className="border border-[#9FE5C1]/40 bg-[#9FE5C1]/10 px-2 py-1 text-xs font-semibold text-[#9FE5C1]">
                  저장 전
                </span>
              </div>

              <div className="grid gap-px bg-white/10 md:grid-cols-[0.36fr_0.64fr]">
                <aside className="bg-[#101820] p-4">
                  <p className="text-xs font-semibold text-[#A9B1BA]">진행 순서</p>
                  <div className="mt-4 space-y-2">
                    {["아이디어 도출", "사업성 평가", "검증 계획", "실행 문서", "제작 패키지"].map((step, index) => (
                      <div
                        key={step}
                        className={`flex items-center gap-3 border px-3 py-2 text-sm ${
                          index === 4
                            ? "border-[#9FE5C1] bg-[#9FE5C1]/10 text-white"
                            : "border-white/10 bg-white/[0.03] text-[#A9B1BA]"
                        }`}
                      >
                        <span className={`flex h-6 w-6 items-center justify-center text-xs font-semibold ${index === 4 ? "bg-[#9FE5C1] text-[#101820]" : "bg-white/10 text-white"}`}>
                          {index + 1}
                        </span>
                        <span className="break-keep">{step}</span>
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="bg-[#FAFAFA] p-4 text-[#0D0D0D]">
                  <div className="border border-[#E5E5E5] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 items-center justify-center bg-[#ECEDF9] text-[#5E6AD2]">
                        <Sparkle size={18} />
                      </span>
                      <div>
                        <p className="text-lg font-semibold leading-tight">AI가 제작 자료를 자동으로 정리합니다.</p>
                        <p className="mt-2 break-keep text-sm leading-6 text-[#5E5E5E]">
                          사용자는 결과 요약을 확인하고 보완 메모가 있을 때만 추가합니다.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {deckRows.map((row) => (
                        <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-3 border border-[#E5E5E5] bg-[#F7F7F7] px-3 py-2">
                          <span className="break-keep text-sm font-medium">{row.label}</span>
                          <span className={`px-2 py-1 text-xs font-semibold ${row.tone}`}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 border border-[#E5E5E5] bg-white p-4">
                    <p className="text-xs font-semibold text-[#5E5E5E]">결과 요약</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {["웹 서비스", "첫 범위 4개", "검증 근거 연결", "외부 전달 가능"].map((item) => (
                        <span key={item} className="border border-[#E5E5E5] bg-[#F7F7F7] px-3 py-2 text-sm font-semibold">
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex h-10 items-center justify-center border border-[#0D0D0D] bg-[#0D0D0D] px-4 text-sm font-semibold text-white">
                      제작 패키지 저장
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="flow" className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 sm:py-12">
          <div className="grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
            <div>
              <p className="text-xs font-semibold text-[#5E5E5E]">작동 원칙</p>
              <h2 className="mt-3 max-w-[16ch] break-keep text-3xl font-semibold leading-tight text-[#0D0D0D]">
                AI가 먼저 정리하고, 사람은 판단만 보완합니다.
              </h2>
            </div>
            <div className="grid gap-px bg-[#E5E5E5] sm:grid-cols-2 xl:grid-cols-5">
              {operatingLoop.map((item) => (
                <article key={item.id} className="min-h-[178px] bg-[#F7F7F7] p-4">
                  <p className="font-mono text-xs font-semibold text-[#9A9A9A]">{item.id}</p>
                  <h3 className="mt-8 text-lg font-semibold text-[#0D0D0D]">{item.title}</h3>
                  <p className="mt-3 break-keep text-sm leading-6 text-[#5E5E5E]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E5E5] bg-[#F7F7F7]">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold text-[#5E5E5E]">보드가 준비하는 것</p>
            <h2 className="mt-3 max-w-[18ch] break-keep text-3xl font-semibold leading-tight text-[#0D0D0D]">
              사용자가 직접 운영하던 체크리스트를 제작 자료로 바꿉니다.
            </h2>
            <p className="mt-4 max-w-[50ch] break-keep text-base leading-7 text-[#5E5E5E]">
              깊은 정보는 남기되 처음부터 다 읽게 만들지 않습니다. 화면에는 다음에 확인할 한 문장과 저장 상태가 먼저 보여야 합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {packageItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="border border-[#E5E5E5] bg-white p-5">
                  <span className="flex h-10 w-10 items-center justify-center bg-[#F4F4F4] text-[#101820]">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[#0D0D0D]">{item.title}</h3>
                  <p className="mt-3 break-keep text-sm leading-6 text-[#5E5E5E]">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold text-[#5E5E5E]">최종 산출물</p>
            <h2 className="mt-3 max-w-[16ch] break-keep text-3xl font-semibold leading-tight text-[#0D0D0D]">
              문서가 아니라 바로 제작 가능한 패키지입니다.
            </h2>
            <p className="mt-4 max-w-[46ch] break-keep text-base leading-7 text-[#5E5E5E]">
              Cursor, Codex, Claude Code 같은 외부 개발 도구가 읽을 수 있도록 판단 근거와 작업 순서를 함께 묶습니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/guide" className="avl-btn h-11 border border-[#D6D6D6] bg-white px-5 text-sm text-[#0D0D0D] hover:bg-[#F4F4F4]">
                가이드 보기
              </Link>
            </div>
          </div>

          <div data-smoke="landing-package-table" className="border border-[#DADADA] bg-[#FAFAFA] p-3">
            <div className="grid gap-px bg-[#E5E5E5]">
              <div className="grid grid-cols-[0.28fr_0.34fr_0.38fr] bg-[#101820] px-4 py-3 text-xs font-semibold text-white">
                <span>항목</span>
                <span>정리 내용</span>
                <span>쓰임</span>
              </div>
              {packageRows.map(([label, value, note]) => (
                <div key={label} className="grid grid-cols-1 gap-3 bg-white px-4 py-4 text-sm sm:grid-cols-[0.28fr_0.34fr_0.38fr]">
                  <span className="font-semibold text-[#0D0D0D]">{label}</span>
                  <span className="break-keep text-[#0D0D0D]">{value}</span>
                  <span className="break-keep text-[#5E5E5E]">{note}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                [ClipboardText, "기획서"],
                [Path, "작업 순서"],
                [ListChecks, "검증 자료"],
              ].map(([Icon, label]) => (
                <div key={label as string} className="flex items-center gap-3 border border-[#E5E5E5] bg-white px-3 py-3 text-sm font-semibold text-[#0D0D0D]">
                  <span className="flex h-8 w-8 items-center justify-center bg-[#EFFAF4] text-[#177D4E]">
                    <Icon size={17} />
                  </span>
                  {label as string}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
