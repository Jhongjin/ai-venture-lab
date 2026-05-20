import Link from "next/link";
import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import {
  ArrowRight,
  ClipboardText,
  FileDoc,
  GridFour,
  ShieldCheck,
  SignIn,
  Sparkle,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";

import { AuthAwareCta } from "@/components/auth-aware-cta";

export const metadata: Metadata = {
  title: "가이드 | AI Venture Lab",
  description: "아이디어 입력부터 검증, 실행 문서, 제작 패키지까지 이어지는 AI Venture Lab 사용 가이드입니다.",
};

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-newsreader",
});

const menuGuide = [
  {
    title: "가이드",
    route: "/guide",
    body: "현재 페이지입니다. 아이디어를 넣은 뒤 어떤 결과물이 만들어지는지, 각 메뉴가 어디에 쓰이는지 확인합니다.",
    icon: FileDoc,
  },
  {
    title: "로그인·회원가입",
    route: "/login, /signup",
    body: "계정을 만들거나 기존 계정으로 로그인합니다. 로그인 전에는 실행 보드 버튼이 보이지 않습니다.",
    icon: SignIn,
  },
  {
    title: "마이페이지",
    route: "/profile",
    body: "표시 이름, 소속, 역할, 비밀번호를 수정합니다. 로그인한 사용자에게만 상단 메뉴에 표시됩니다.",
    icon: UserCircle,
  },
  {
    title: "실행 보드",
    route: "/workspace",
    body: "아이디어 입력, 결과물 형태 선택, 사업성 검토, 검증 계획, 실행 문서와 제작 패키지를 한 흐름으로 진행합니다.",
    icon: GridFour,
  },
];

const boardSteps = [
  {
    title: "아이디어와 결과물 형태 정리",
    body: "회의 메모, 대화 기록, 떠오른 아이디어를 붙여넣으면 AI가 먼저 볼 아이디어 한 건과 웹 서비스, 모바일앱, 랜딩/웹사이트, 자동화 같은 결과물 형태를 함께 잡습니다.",
    icon: Sparkle,
  },
  {
    title: "사업성과 리스크 자동 검토",
    body: "수요, 지불 의향, 구현 속도, 차별성, 개인정보나 운영 리스크를 AI가 먼저 평가합니다. 사용자는 값이 어색할 때만 고치면 됩니다.",
    icon: ShieldCheck,
  },
  {
    title: "작은 검증 계획 만들기",
    body: "시장조사만 길게 하지 않고 7일 안에 확인할 행동, 성공 기준, 중단 기준을 정합니다. 필요하면 사용자가 조사한 근거만 추가로 남깁니다.",
    icon: ClipboardText,
  },
  {
    title: "제작 패키지로 넘기기",
    body: "검증된 아이디어를 제품 기획서, 디자인 방향, 기술 스택, 첫 제작 범위, 개발 도구에 바로 넘길 제작 패키지로 묶습니다. 직접 만들거나 외부 개발 도구로 이어갈 수 있습니다.",
    icon: GridFour,
  },
];

const quickAnswers = [
  ["실행 보드 버튼이 안 보여요", "로그인 전에는 숨겨집니다. 상단의 로그인·회원가입으로 먼저 계정에 들어가세요."],
  ["처음에 무엇을 준비해야 하나요", "정리된 기획서가 없어도 됩니다. 회의 메모, GPT와 나눈 대화, 평소 적어둔 자동화 아이디어처럼 거친 내용을 그대로 넣으면 됩니다."],
  ["모든 항목을 직접 채워야 하나요", "아닙니다. 기본은 AI가 먼저 채우고, 사용자는 어색한 판단만 고치거나 그대로 저장합니다."],
  ["마지막에 무엇을 얻나요", "아이디어 설명서가 아니라 제품 기획서, 검증 계획, 제작 범위, 기술 방향, 개발 도구 전달용 실행 지시가 묶인 제작 패키지를 얻습니다."],
];

export default function GuidePage() {
  return (
    <main id="main-content" data-smoke="operator-guide" className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6 sm:py-6">
        <section className="grid gap-px bg-slate-300 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="bg-white px-6 py-8 sm:px-8 sm:py-10">
            <div className="avl-kicker">사용 가이드</div>
            <h1
              className="mt-5 max-w-[13ch] break-keep text-[42px] font-normal leading-[0.94] tracking-[-0.05em] text-slate-950 sm:text-[68px]"
              style={{ fontFamily: "var(--font-newsreader)" }}
            >
              AI Venture Lab 이용 가이드.
            </h1>
            <p className="mt-5 max-w-[62ch] break-keep text-[15px] leading-7 text-slate-600">
              AI Venture Lab은 사용자가 모든 문서를 직접 채우는 도구가 아닙니다. 아이디어나 메모를 넣으면 AI가 사업성, 리스크, 검증 계획, 결과물 형태를 먼저 정리하고, 사용자는 중요한 판단만 확인합니다.
            </p>
          </div>

          <aside className="grid gap-px bg-slate-300">
            <div className="bg-[#10141d] px-6 py-6 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">처음 안내</div>
              <div className="mt-4 text-[26px] font-semibold leading-[1.05] tracking-tight">처음이라면 로그인 후 실행 보드로 들어가세요.</div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                홈은 둘러보기용입니다. 실제 아이디어 검토와 제작 패키지 생성은 실행 보드에서 진행합니다.
              </p>
            </div>
            <div className="bg-white px-6 py-5">
              <AuthAwareCta className="avl-btn avl-btn-primary h-11 px-5" />
            </div>
          </aside>
        </section>

        <section className="mt-4 grid gap-px bg-slate-300 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="bg-white px-6 py-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">guide map</div>
            <div className="mt-5 grid gap-px bg-slate-200">
              {["상단 메뉴", "실행 보드", "자주 묻는 질문"].map((item, index) => (
                <a key={item} href={`#guide-${index + 1}`} className="grid grid-cols-[3.5rem_1fr] bg-[#f7f6f2] text-sm font-semibold text-slate-700 transition hover:bg-white">
                  <span className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">0{index + 1}</span>
                  <span className="px-4 py-4">{item}</span>
                </a>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
              혼자 시작해도 됩니다. 팀 협업은 필수가 아니라, 아이디어가 구체화된 뒤 필요한 시점에 붙이는 옵션입니다.
            </div>
          </aside>

          <div className="grid gap-px bg-slate-300">
            <section id="guide-1" className="bg-white px-6 py-7 sm:px-8">
              <div className="avl-kicker">top navigation</div>
              <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-slate-950">상단 메뉴</h2>
              <div className="mt-6 grid gap-px bg-slate-200 lg:grid-cols-2">
                {menuGuide.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="bg-white px-5 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                          <Icon size={18} />
                        </span>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.route}</span>
                      </div>
                      <h3 className="mt-5 text-[20px] font-semibold tracking-tight text-slate-950">{item.title}</h3>
                      <p className="mt-3 break-keep text-sm leading-6 text-slate-600">{item.body}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="guide-2" className="bg-[#eef3ff] px-6 py-7 sm:px-8">
              <div className="avl-kicker">workspace guide</div>
              <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-slate-950">실행 보드에서 이어지는 흐름</h2>
              <div className="mt-6 grid gap-px bg-slate-300">
                {boardSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <article key={step.title} className="grid gap-px bg-slate-300 md:grid-cols-[86px_minmax(0,1fr)_120px]">
                      <div className="bg-white px-5 py-5">
                        <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                          <Icon size={18} />
                        </span>
                      </div>
                      <div className="bg-white px-5 py-5">
                        <h3 className="text-[20px] font-semibold tracking-tight text-slate-950">{step.title}</h3>
                        <p className="mt-3 break-keep text-sm leading-6 text-slate-600">{step.body}</p>
                      </div>
                      <div className="bg-[#f7f6f2] px-5 py-5 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        0{index + 1}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="guide-3" className="grid gap-px bg-slate-300 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="bg-white px-6 py-7 sm:px-8">
                <div className="avl-kicker">common questions</div>
                <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-slate-950">자주 묻는 질문</h2>
                <div className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
                  {quickAnswers.map(([question, answer]) => (
                    <div key={question} className="grid gap-3 py-5 md:grid-cols-[0.35fr_0.65fr]">
                      <div className="break-keep text-sm font-semibold text-slate-950">{question}</div>
                      <div className="break-keep text-sm leading-6 text-slate-600">{answer}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#10141d] px-6 py-7 text-white sm:px-8">
                <div className="avl-kicker !text-slate-300">next action</div>
                <h2 className="mt-4 text-[28px] font-semibold leading-[1.05] tracking-tight">아이디어를 넣으면 AI가 먼저 구조를 잡습니다.</h2>
                <p className="mt-4 break-keep text-sm leading-6 text-slate-300">
                  계정이 있으면 실행 보드로 이동하세요. 아직 없다면 로그인 화면에서 회원가입 후 바로 첫 아이디어를 정리할 수 있습니다.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <AuthAwareCta className="avl-btn h-11 border border-white bg-white px-5 text-sm text-slate-950 hover:bg-slate-100" />
                  <Link href="/" className="avl-btn h-11 border border-white/12 bg-white/6 px-5 text-white hover:bg-white/10">
                    홈으로 돌아가기
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
