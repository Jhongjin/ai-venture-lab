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
  description: "아이디어 입력부터 검증, 제작 자료, 제작 패키지까지 이어지는 AI Venture Lab 사용 가이드입니다.",
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
    body: "아이디어 입력, 결과물 형태 선택, 사업성 검토, 검증 계획, 제작 자료와 제작 패키지를 한 흐름으로 진행합니다.",
    icon: GridFour,
  },
];

const boardSteps = [
  {
    title: "아이디어와 결과물 형태 정리",
    body: "회의 메모, 대화 기록, 떠오른 아이디어를 붙여넣으면 AI가 먼저 볼 아이디어 한 건과 웹 서비스, 모바일 앱, 랜딩/웹사이트, 자동화 같은 결과물 형태를 함께 잡습니다.",
    icon: Sparkle,
  },
  {
    title: "사업성과 리스크 자동 검토",
    body: "수요, 지불 의향, 구현 속도, 차별성, 개인정보나 운영 리스크를 AI가 먼저 평가합니다. 사용자는 값이 어색할 때만 고치면 됩니다.",
    icon: ShieldCheck,
  },
  {
    title: "작은 검증 계획 만들기",
    body: "AI 추천 검증 계획을 저장하면 시장성, 경쟁도, 포화도, 진입장벽 점검이 자동으로 정리됩니다. 직접 확인한 결과는 있을 때만 추가로 남깁니다.",
    icon: ClipboardText,
  },
  {
    title: "제작 패키지로 넘기기",
    body: "AI 제작 패키지 만들기 한 번으로 기획서, 디자인 방향, 기술 스택, 첫 제작 범위, 외부 제작 도구 전달 자료를 묶습니다.",
    icon: GridFour,
  },
];

const quickAnswers = [
  ["실행 보드 버튼이 안 보여요", "로그인 전에는 숨겨집니다. 상단의 로그인·회원가입으로 먼저 계정에 들어가세요."],
  ["처음에 무엇을 준비해야 하나요", "정리된 기획서가 없어도 됩니다. 회의 메모, GPT와 나눈 대화, 평소 적어둔 자동화 아이디어처럼 거친 내용을 그대로 넣으면 됩니다."],
  ["모든 항목을 직접 채워야 하나요", "아닙니다. 기본은 AI가 먼저 채우고, 사용자는 어색한 판단만 고치거나 그대로 저장합니다."],
  ["마지막에 무엇을 얻나요", "아이디어 설명서가 아니라 제품 기획서, 검증 계획, 제작 범위, 기술 방향, 제작에 필요한 작업 순서와 확인 기준이 묶인 제작 패키지를 얻습니다."],
  ["Cursor와 어떻게 연결하나요", "최종 실행 단계에서 Cursor 연결 파일을 받은 뒤 실제 개발할 프로젝트 루트에서 PowerShell 파일을 실행합니다. 그러면 Cursor 규칙, MCP 설정, 제작 패키지, 작업 목록이 프로젝트 안에 생성됩니다. 작업 후에는 Cursor 완료 보고나 .cursor/venture-lab-progress.json을 최종 실행 화면에 붙여넣어 Venture Lab 작업 상태를 반영합니다."],
];

const externalToolGuide = [
  ["1", "Cursor 연결 파일 받기", "최종 실행 단계에서 제작 방식이 외부 제작 도구이고 도구가 Cursor인지 확인한 뒤 연결 파일을 받습니다."],
  ["2", "프로젝트 루트에서 실행", "받은 PowerShell 파일을 실제 개발할 Cursor 프로젝트 루트에 두고 실행하면 .cursor/rules, .cursor/mcp.json, 제작 문서가 생성됩니다."],
  ["3", "Cursor에서 시작", "Cursor를 다시 열고 AI_VENTURE_CURSOR_START.md 내용을 Composer에 붙여 넣으면 첫 작업부터 진행할 수 있습니다."],
  ["4", "진행 결과 반영", "작업을 마친 뒤 완료 보고 또는 .cursor/venture-lab-progress.json 내용을 Venture Lab 최종 실행 화면의 Cursor 진행 결과 가져오기에 붙여넣습니다."],
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
            <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-500">가이드 목차</div>
            <div className="mt-5 grid gap-px bg-slate-200">
              {["상단 메뉴", "실행 보드", "외부 도구 연결", "자주 묻는 질문"].map((item, index) => (
                <a key={item} href={`#guide-${index + 1}`} className="grid grid-cols-[3.5rem_1fr] bg-[#f7f6f2] text-sm font-semibold text-slate-700 transition hover:bg-white">
                  <span className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">0{index + 1}</span>
                  <span className="px-4 py-4">{item}</span>
                </a>
              ))}
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
              1인으로 시작해도 됩니다. 팀 협업은 필수가 아니라, 아이디어가 구체화된 뒤 필요한 시점에 붙이는 옵션입니다.
            </div>
          </aside>

          <div className="grid gap-px bg-slate-300">
            <section id="guide-1" className="scroll-mt-28 bg-white px-6 py-7 sm:px-8">
              <div className="avl-kicker">상단 메뉴</div>
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

            <section id="guide-2" className="scroll-mt-28 bg-[#eef3ff] px-6 py-7 sm:px-8">
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

            <section id="guide-3" className="grid scroll-mt-28 gap-px bg-slate-300 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="bg-white px-6 py-7 sm:px-8 lg:col-span-2">
                <div className="avl-kicker">external tool</div>
                <h2 className="mt-4 text-[30px] font-semibold tracking-tight text-slate-950">Cursor로 제작을 시작하는 법</h2>
                <p className="mt-4 max-w-[72ch] break-keep text-sm leading-6 text-slate-600">
                  최종 패키지는 단순 확인용 문서가 아닙니다. Cursor를 선택하면 프로젝트 안에 규칙, MCP 설정, 로컬 MCP 브리지, 제작 패키지, 작업 목록을 설치하는 파일을 받을 수 있습니다.
                </p>
                <div className="mt-6 grid gap-px bg-slate-200 lg:grid-cols-3">
                  {externalToolGuide.map(([number, title, body]) => (
                    <article key={title} className="bg-[#f7f6f2] px-5 py-5">
                      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{number}</div>
                      <h3 className="mt-4 text-[19px] font-semibold tracking-tight text-slate-950">{title}</h3>
                      <p className="mt-3 break-keep text-sm leading-6 text-slate-600">{body}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-6 grid gap-px bg-slate-200 lg:grid-cols-[0.48fr_0.52fr]">
                  <div className="bg-white px-5 py-5">
                    <div className="text-sm font-semibold text-slate-950">생성되는 핵심 파일</div>
                    <div className="mt-3 grid gap-2 font-mono text-xs text-slate-600">
                      <span>.cursor/rules/ai-venture-lab.mdc</span>
                      <span>.cursor/mcp.json</span>
                      <span>AI_VENTURE_PACKAGE.md</span>
                      <span>AI_VENTURE_TASKS.md</span>
                    </div>
                  </div>
                  <div className="bg-white px-5 py-5">
                    <div className="text-sm font-semibold text-slate-950">현재 연결 범위</div>
                    <p className="mt-3 break-keep text-sm leading-6 text-slate-600">
                      Cursor는 패키지와 작업 목록을 로컬 MCP 리소스로 읽고, 진행 기록을 프로젝트 안의 .cursor/venture-lab-progress.json에 남깁니다. Venture Lab 서버 상태 자동 업데이트는 인증과 권한 설계가 끝난 뒤 추가됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="guide-4" className="grid scroll-mt-28 gap-px bg-slate-300 lg:grid-cols-[minmax(0,1fr)_340px]">
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
