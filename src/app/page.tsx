import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ClipboardCheck,
  ClipboardList,
  FlaskConical,
  LayoutGrid,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Venture Lab",
  description: "아이디어를 구조화하고 검증한 뒤, 기획과 MVP 실행 패키지까지 이어가는 AI 워크스페이스입니다.",
};

const primarySteps = [
  {
    id: "01",
    title: "원문에서 후보 추출",
    body: "회의 메모, 대화, 브레인스토밍 문장을 넣으면 AI가 후보와 검증 방향을 먼저 정리합니다.",
    icon: Sparkles,
  },
  {
    id: "02",
    title: "증거와 리스크 정렬",
    body: "수요, 위험, 7일 실험, 진행 판단을 한 흐름으로 기록해 정말 밀 아이디어만 남깁니다.",
    icon: ShieldCheck,
  },
  {
    id: "03",
    title: "기획과 MVP 실행 연결",
    body: "PRD, MVP 범위, 개발 태스크, 출시 조건까지 같은 공간에서 이어집니다.",
    icon: Rocket,
  },
];

const featureCards = [
  {
    title: "AI가 먼저 채우는 보드",
    body: "모든 필드를 사람이 직접 쓰지 않아도 됩니다. AI가 초안, 비교 후보, 검증 질문과 산출물 뼈대를 먼저 만듭니다.",
    icon: WandSparkles,
  },
  {
    title: "솔로 실행에 최적화",
    body: "한 사람이 아이디어 발굴부터 출시 판단까지 끝까지 밀 수 있게 설계했습니다. 팀 초대는 필요할 때만 켭니다.",
    icon: Users,
  },
  {
    title: "문서가 아니라 실행 패키지",
    body: "브리프, 리스크 로그, 7일 실험, PRD, MVP 범위, 태스크 보드, 학습 리포트가 한 흐름으로 이어집니다.",
    icon: ClipboardCheck,
  },
];

const deliverables = [
  "아이디어 브리프",
  "검증 패키지",
  "리스크 로그",
  "7일 실험 계획",
  "PRD / MVP 범위",
  "개발 태스크 보드",
  "출시 판단 패킷",
  "성과 학습 리포트",
];

const workflowNotes = [
  "회의록에서 후보 추출",
  "비교 후보 큐 자동 정리",
  "점수 / 리스크 / 실험 묶음",
  "PRD와 MVP 실행 패키지 생성",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-4 sm:px-6 sm:py-6">
        <header className="avl-card px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="avl-kicker">
                <FlaskConical size={15} />
                AI Venture Lab
              </div>
              <span className="avl-pill avl-pill-brand">launchpad</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#workflow" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                작동 방식
              </a>
              <a href="#deliverables" className="avl-btn avl-btn-subtle h-9 px-3 text-xs">
                산출물
              </a>
              <Link href="/workspace" className="avl-btn avl-btn-primary h-9 px-4 text-sm">
                실행 보드 열기
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(460px,0.9fr)]">
          <div className="flex flex-col justify-between gap-6 rounded-[28px] border border-slate-200 bg-white px-6 py-7 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:px-8 sm:py-9">
            <div>
              <div className="avl-kicker">
                <LayoutGrid size={15} />
                idea to mvp workspace
              </div>
              <h1 className="mt-5 max-w-[11ch] text-[44px] font-semibold leading-[0.96] tracking-tight text-slate-950 sm:text-[64px]">
                아이디어를
                <br />
                검증하고
                <br />
                끝까지 실행하는
                <br />
                한 사람용 워크스페이스
              </h1>
              <p className="mt-5 max-w-[58ch] text-[16px] leading-7 text-slate-600">
                ChatGPT 대화, 회의 메모, 브레인스토밍 문장에서 시작해도 괜찮습니다. AI가 후보, 증거, 리스크, 기획
                초안, MVP 실행 패키지까지 먼저 만들고, 사용자는 필요한 판단만 보완하면 됩니다.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <Link href="/workspace" className="avl-btn avl-btn-primary">
                  지금 보드에서 시작
                  <ArrowRight size={16} />
                </Link>
                <a href="#workflow" className="avl-btn avl-btn-secondary">
                  흐름 먼저 보기
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="avl-pill avl-pill-neutral">솔로 실행 기본</span>
                <span className="avl-pill avl-pill-info">AI 초안 자동 생성</span>
                <span className="avl-pill avl-pill-neutral">팀 협업은 옵션</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_1px_1px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.5),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(224,231,255,0.55),transparent_36%)]" />
            <div className="relative z-10 flex items-center justify-between gap-3 px-2 pb-4">
              <div>
                <div className="avl-kicker">workspace preview</div>
                <div className="mt-2 text-xl font-semibold tracking-tight text-slate-950">한 화면에서 후보, 판단, 실행까지</div>
              </div>
              <span className="avl-pill avl-pill-brand">live board</span>
            </div>

            <div className="relative z-10 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950/95 shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
              <Image
                src="/images/workspace-preview.png"
                alt="AI Venture Lab workspace preview"
                width={1600}
                height={980}
                className="h-auto w-full object-cover"
                priority
              />
            </div>

            <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-3">
              <div className="avl-surface-subtle p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">from notes</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">원문에서 시작</div>
                <p className="mt-2 text-sm leading-5 text-slate-600">메모, 회의록, 채팅 내용을 그대로 넣고 검증 흐름을 엽니다.</p>
              </div>
              <div className="avl-surface-subtle p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">operator mode</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">사람은 결정만</div>
                <p className="mt-2 text-sm leading-5 text-slate-600">AI가 초안을 만들고, 사용자는 정말 중요한 판단만 보완합니다.</p>
              </div>
              <div className="avl-surface-subtle p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">outputs</div>
                <div className="mt-2 text-sm font-semibold text-slate-950">실행 패키지 생성</div>
                <p className="mt-2 text-sm leading-5 text-slate-600">PRD, MVP 범위, 태스크 보드, 출시 판단까지 같은 흐름으로 이어집니다.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="avl-card p-5 sm:p-6">
            <div className="avl-kicker">why teams keep this open</div>
            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-slate-950">아이디어 메모에서 끝나지 않게 만드는 실행 구조</h2>
            <p className="mt-3 max-w-[62ch] text-sm leading-6 text-slate-600">
              홈은 멋있게 보여야 하지만, 안쪽 보드는 실제로 써야 합니다. 그래서 이 제품은 예쁜 랜딩보다 중요한
              “지금 무엇을 결정해야 하는지”를 워크스페이스 안에서 바로 보여주는 데 집중합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="avl-surface-subtle p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">default mode</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">1명</div>
              <p className="mt-2 text-sm leading-5 text-slate-600">기본은 한 사람이 끝까지 보는 솔로 실행 구조</p>
            </div>
            <div className="avl-surface-subtle p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">fast proof</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">7일</div>
              <p className="mt-2 text-sm leading-5 text-slate-600">첫 실험과 중단/진행 판단까지 당기는 기본 템포</p>
            </div>
          </div>
        </section>

        <section id="workflow" className="grid gap-5">
          <div className="flex flex-col gap-3">
            <div className="avl-kicker">workflow</div>
            <h2 className="text-[34px] font-semibold tracking-tight text-slate-950">원문에서 MVP 실행까지, 끊기지 않는 3단 구조</h2>
            <p className="max-w-[68ch] text-sm leading-6 text-slate-600">
              멋진 말보다 중요한 건, 지금 어디까지 왔고 다음엔 무엇을 해야 하는지가 바로 보이는 흐름입니다.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {primarySteps.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className="avl-card p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="avl-icon-frame">
                      <Icon size={18} />
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.id}</div>
                      <h3 className="mt-1 text-lg font-semibold text-slate-950">{item.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="avl-card p-5 sm:p-6">
            <div className="avl-kicker">inside the board</div>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">AI가 하는 일과 사람이 하는 일이 분리됩니다.</h2>
            <div className="mt-5 grid gap-3">
              <div className="avl-surface-subtle p-4">
                <div className="text-sm font-semibold text-slate-950">AI가 먼저 하는 일</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  후보 정리, 점수 초안, 검증 질문, 산출물 구조, 다음 액션을 먼저 제안합니다.
                </p>
              </div>
              <div className="avl-surface-subtle p-4">
                <div className="text-sm font-semibold text-slate-950">사람이 판단하는 일</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  지금 밀 가치가 있는지, 리스크를 감수할지, 출시할지, 더 확인할지를 결정합니다.
                </p>
              </div>
              <div className="avl-surface-subtle p-4">
                <div className="text-sm font-semibold text-slate-950">협업이 필요한 순간</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  기본은 혼자 쓰지만, 필요하면 워크스페이스와 멤버를 연결해 검토와 승인만 나눌 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <div className="avl-card p-5 sm:p-6">
            <div className="avl-kicker">what the system hands you</div>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">결국 남는 건 실행 가능한 산출물입니다.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="avl-surface-subtle p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <span className="avl-icon-frame">
                        <Icon size={17} />
                      </span>
                      <h3 className="text-base font-semibold text-slate-950">{card.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{card.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="deliverables" className="avl-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <div className="avl-kicker">deliverables</div>
              <h2 className="mt-3 text-[32px] font-semibold tracking-tight text-slate-950">메모를 넣으면, 결국 이런 결과물로 이어집니다.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                설명만 길게 남는 문서가 아니라, 다음 실행을 바로 열 수 있는 패키지로 끝나야 합니다.
              </p>
            </div>
            <Link href="/workspace" className="avl-btn avl-btn-primary shrink-0">
              실행 보드로 이동
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {deliverables.map((item) => (
              <div key={item} className="avl-surface-subtle p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-slate-500" />
                  <div className="text-sm font-semibold text-slate-950">{item}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 px-6 py-6 text-white shadow-[0_20px_48px_rgba(15,23,42,0.18)] sm:px-7">
            <div className="avl-kicker !text-slate-300">for solo operators</div>
            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-white">AI스러운 과장보다, 계속 쓰고 싶은 실행 도구로</h2>
            <p className="mt-4 max-w-[56ch] text-sm leading-6 text-slate-300">
              이 홈은 멋있게 보이되, 보드는 실제로 일하게 만드는 제품이어야 합니다. 그래서 안쪽은 과한 AI 콘솔 느낌보다
              조용하고 단단한 작업공간에 가깝게 설계했습니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {workflowNotes.map((note) => (
                <span key={note} className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-200">
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="avl-card p-5 sm:p-6">
            <div className="avl-kicker">ready to start</div>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-slate-950">홈은 기대감을 만들고, 보드는 실제 일을 시작하게 합니다.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              지금 바로 아이디어를 넣고 AI 후보 발굴부터 시작해도 좋고, 기존 워크스페이스에서 이어서 작업해도 됩니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/workspace" className="avl-btn avl-btn-primary">
                실행 보드 열기
                <ArrowRight size={16} />
              </Link>
              <a href="#workflow" className="avl-btn avl-btn-secondary">
                흐름 다시 보기
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
