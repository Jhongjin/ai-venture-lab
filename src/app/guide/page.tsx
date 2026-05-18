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
  description: "AI Venture Lab의 메뉴, 로그인, 실행 보드 사용 방법을 정리한 가이드입니다.",
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
    body: "현재 페이지입니다. 메뉴 구성, 로그인 상태별 버튼, 실행 보드에서 하는 일을 확인합니다.",
    icon: FileDoc,
  },
  {
    title: "로그인 / 회원가입",
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
    body: "아이디어 접수, 후보 선별, 검증 패키지 저장, PRD와 실행 태스크 준비를 이어서 진행합니다.",
    icon: GridFour,
  },
];

const boardSteps = [
  {
    title: "워크스페이스 확인",
    body: "처음 들어오면 개인 작업 공간을 확인합니다. 팀 협업은 필요할 때만 연결합니다.",
    icon: GridFour,
  },
  {
    title: "아이디어 찾기",
    body: "회의 메모, 대화 기록, 브리프 초안을 붙여넣거나 직접 후보를 작성합니다.",
    icon: Sparkle,
  },
  {
    title: "검증 패키지 저장",
    body: "후보, 질문, 리스크, 7일 실험, 중단 기준을 한 번에 정리해 저장합니다.",
    icon: ShieldCheck,
  },
  {
    title: "기획과 실행 준비",
    body: "PRD, MVP 범위, 실행 태스크, 출시 판단까지 다음 작업자가 볼 수 있는 형태로 남깁니다.",
    icon: ClipboardText,
  },
];

const quickAnswers = [
  ["실행 보드 버튼이 안 보여요", "로그인 전에는 숨겨집니다. 상단의 로그인 / 회원가입으로 먼저 계정에 들어가세요."],
  ["회원가입 후 어디로 가나요", "프로필을 확인한 뒤 실행 보드에서 첫 후보를 정리하면 됩니다."],
  ["가이드와 홈은 무엇이 다른가요", "홈은 제품 소개 페이지이고, 가이드는 실제 메뉴와 사용 방법을 확인하는 페이지입니다."],
  ["팀 초대가 꼭 필요한가요", "아닙니다. 기본은 혼자 진행하는 방식이고, 협업은 필요할 때만 붙이면 됩니다."],
];

export default function GuidePage() {
  return (
    <main id="main-content" className={`min-h-screen bg-[#f2f0eb] text-slate-950 ${newsreader.variable}`}>
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
            <div className="avl-kicker">operator guide</div>
            <h1
              className="mt-5 max-w-[13ch] break-keep text-[42px] font-normal leading-[0.94] tracking-[-0.05em] text-slate-950 sm:text-[68px]"
              style={{ fontFamily: "var(--font-newsreader)" }}
            >
              AI Venture Lab 이용 가이드.
            </h1>
            <p className="mt-5 max-w-[62ch] break-keep text-[15px] leading-7 text-slate-600">
              이 페이지는 제품 소개가 아니라 실제 사용 방법을 정리한 안내입니다. 상단 메뉴가 무엇을 뜻하는지, 로그인 후 어떤 버튼이 보이는지, 실행 보드에서 어떤 순서로 작업하는지 확인할 수 있습니다.
            </p>
          </div>

          <aside className="grid gap-px bg-slate-300">
            <div className="bg-[#10141d] px-6 py-6 text-white">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">start here</div>
              <div className="mt-4 text-[26px] font-semibold leading-[1.05] tracking-tight">처음이라면 로그인 후 실행 보드로 들어가세요.</div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                홈은 둘러보기용이고, 실제 기록과 저장은 실행 보드에서 진행합니다.
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
              로그인 상태에 따라 상단 메뉴가 달라집니다. 비로그인 사용자는 가이드와 로그인 메뉴만 보고, 로그인한 사용자는 마이페이지와 실행 보드를 볼 수 있습니다.
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
              <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-slate-950">실행 보드에서 하는 일</h2>
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
                <h2 className="mt-4 text-[28px] font-semibold leading-[1.05] tracking-tight">설명은 여기까지, 실제 작업은 보드에서 이어갑니다.</h2>
                <p className="mt-4 break-keep text-sm leading-6 text-slate-300">
                  계정이 있으면 바로 실행 보드로 이동하고, 아직 없다면 로그인 화면에서 회원가입을 진행하세요.
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
