import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Database,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Radar,
  ShieldCheck,
} from "lucide-react";

import { getConsoleData, scoreIdea } from "@/lib/venture-data";
import type { DecisionStatus, IdeaStage, RiskSeverity } from "@/lib/supabase/types";
import { VentureConsoleActions } from "@/components/venture-console-actions";
import { IdeaWorkbench } from "@/components/idea-workbench";

export const dynamic = "force-dynamic";

const pipeline: Array<{ label: string; value: string; tone: string }> = [
  { label: "접수", value: "아이디어 브리프", tone: "bg-blue-50 text-blue-700" },
  { label: "조사", value: "시장 + 리스크", tone: "bg-emerald-50 text-emerald-700" },
  { label: "점수화", value: "중단 또는 승격", tone: "bg-amber-50 text-amber-700" },
  { label: "프로토타입", value: "MVP 화면", tone: "bg-rose-50 text-rose-700" },
  { label: "출시 게이트", value: "QA + 보안", tone: "bg-violet-50 text-violet-700" },
];

const gates = [
  "문제의 빈도와 강도가 명확함",
  "사용자와 구매자가 구분되어 있음",
  "14일 안에 검증 가능한 MVP 범위임",
  "규제와 개인정보 리스크가 기록됨",
  "프로토타입 검증 방법이 정의됨",
];

const stageLabels: Record<IdeaStage, string> = {
  intake: "접수",
  research: "조사",
  score: "점수화",
  prd: "PRD",
  prototype: "프로토타입",
  qa: "QA",
  launch: "출시",
  paused: "보류",
};

const decisionLabels: Record<DecisionStatus, string> = {
  ship: "진행",
  pivot: "전환",
  kill: "중단",
  research_more: "추가 조사",
  pending: "대기",
};

const severityTone: Record<RiskSeverity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
  critical: "bg-red-600 text-white",
};

export default async function Home() {
  const { ideas, risks, decisions, experiments, orchestrationRuns, artifacts, source, error } = await getConsoleData();
  const topIdea = [...ideas].sort((a, b) => scoreIdea(b) - scoreIdea(a))[0];
  const openRisks = risks.filter((risk) => risk.status.toLowerCase() === "open").length;
  const highRisks = risks.filter((risk) => ["high", "critical"].includes(risk.severity)).length;
  const activeExperiments = experiments.filter((experiment) => experiment.status !== "done").length;
  const activeRuns = orchestrationRuns.filter((run) => ["planned", "running", "blocked"].includes(run.status)).length;
  const workspaceIdeas = ideas.filter((idea) => idea.organization_id).length;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              <FlaskConical size={18} />
              AI Venture Lab
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
              아이디어-MVP 실행 센터
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              앱 아이디어를 선별하고, 가능성이 높은 아이디어를 명세와 프로토타입으로 전환한 뒤
              QA, 디버깅, 개인정보, 보안 게이트를 통과시켜 출시 판단까지 이어가는 운영 하네스입니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[660px]">
            {[
              ["아이디어", String(ideas.length)],
              ["워크스페이스", `${workspaceIdeas}/${ideas.length}`],
              ["열린 리스크", String(openRisks)],
              ["고위험", String(highRisks)],
              ["진행 작업", String(activeExperiments + activeRuns)],
              ["산출물", String(artifacts.length)],
              ["데이터", source === "supabase" ? "Supabase" : "시드"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-2xl font-semibold capitalize text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </header>

        {error ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase 읽기에 실패해 기본 예시 데이터를 표시합니다. 오류: {error}
          </section>
        ) : null}

        <VentureConsoleActions />

        <IdeaWorkbench
          initialIdeas={ideas}
          initialRisks={risks}
          initialDecisions={decisions}
          initialExperiments={experiments}
          initialOrchestrationRuns={orchestrationRuns}
          initialArtifacts={artifacts}
        />

        <section className="grid gap-4 lg:grid-cols-5">
          {pipeline.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${item.tone}`}>
                {item.label}
              </span>
              <p className="mt-4 text-lg font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">현재 포트폴리오</h2>
                <p className="mt-1 text-sm text-slate-500">모든 아이디어를 같은 증거 게이트로 이동시킵니다.</p>
              </div>
              <Radar className="text-blue-600" size={24} />
            </div>
            <div className="grid gap-3">
              {ideas.map((idea) => (
                <article
                  key={idea.id}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_132px]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">{idea.name}</h3>
                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {decisionLabels[idea.decision]}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm ${
                          idea.organization_id ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {idea.organization_id ? "워크스페이스" : "개인"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{idea.signal || idea.one_liner}</p>
                    <p className="mt-1 text-sm text-slate-500">리스크: {idea.risk_summary}</p>
                    <p className="mt-1 text-sm text-slate-500">다음 증거: {idea.next_evidence}</p>
                  </div>
                  <div className="flex items-start gap-2 md:flex-col md:items-end">
                    <span className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {stageLabels[idea.stage]}
                    </span>
                    <span className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm">
                      점수 {scoreIdea(idea)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">승격 게이트</h2>
                <p className="mt-1 text-sm text-slate-300">기본 증거를 통과하기 전에는 PRD로 넘기지 않습니다.</p>
              </div>
              <ClipboardCheck className="text-emerald-300" size={24} />
            </div>
            <div className="grid gap-3">
              {gates.map((gate) => (
                <div key={gate} className="flex items-start gap-3 rounded-lg bg-white/7 p-3">
                  <BadgeCheck className="mt-0.5 shrink-0 text-emerald-300" size={18} />
                  <span className="text-sm leading-6 text-slate-100">{gate}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-white/7 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                현재 선두 아이디어
              </div>
              <div className="mt-2 text-lg font-semibold">{topIdea?.name ?? "아직 아이디어 없음"}</div>
              <div className="mt-1 text-sm text-slate-300">
                {topIdea
                  ? `점수 ${scoreIdea(topIdea)} / 판단: ${decisionLabels[topIdea.decision]}`
                  : "아이디어를 추가하면 점수화가 시작됩니다."}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">데이터 연결</h2>
                <p className="mt-1 text-sm text-slate-500">환경변수와 스키마가 준비되면 Supabase 데이터를 읽습니다.</p>
              </div>
              <Database className={source === "supabase" ? "text-emerald-600" : "text-slate-500"} size={24} />
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-950">
                소스: <span className="capitalize">{source === "supabase" ? "Supabase" : "시드 데이터"}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                시드 데이터로 보이면 `supabase/bootstrap.sql` 실행 여부와 Vercel 환경변수를 확인하세요.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">리스크 등록부</h2>
                <p className="mt-1 text-sm text-slate-500">첫 프로토타입부터 출시 차단 요인을 계속 보이게 합니다.</p>
              </div>
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <div className="grid gap-3">
              {risks.map((risk) => (
                <div key={risk.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">{risk.title}</h3>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${severityTone[risk.severity]}`}>
                      {risk.severity}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                      {risk.status}
                    </span>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        risk.organization_id ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {risk.organization_id ? "워크스페이스" : "개인"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{risk.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <GitBranch className="text-blue-600" size={24} />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">저장소 하네스</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              AGENTS.md, 문서, 템플릿, 스킬, 훅, 스크립트가 에이전트 작업을 반복 가능하게 만듭니다.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <Activity className="text-amber-600" size={24} />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">품질 루프</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              의미 있는 변경을 배포하기 전 `pnpm quality`와 `pnpm harness:check`를 실행합니다.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="text-emerald-600" size={24} />
            <h2 className="mt-4 text-lg font-semibold text-slate-950">보안 우선</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              민감한 영역은 개인정보, 동의, 보관, 악용, 컴플라이언스 검토가 필요합니다.
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole size={18} className="text-slate-500" />
            비밀값은 git에 넣지 마세요. 클라이언트에 노출되는 값에는 Supabase public anon 값만 사용합니다.
          </div>
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            다음 단계: 첫 실제 아이디어 워크플로우 실행
            <ArrowRight size={16} />
          </div>
        </footer>
      </div>
    </main>
  );
}
