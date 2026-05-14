import Link from "next/link";
import { ArrowLeft, GridFour, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { VentureConsoleShell } from "@/components/venture-console-shell";
import { getConsoleData } from "@/lib/venture-data";

export async function WorkspaceBoardPage() {
  const {
    ideas,
    risks,
    decisions,
    experiments,
    orchestrationRuns,
    artifacts,
    implementationTasks,
    telemetryEvents,
    viewerUserId,
    viewerMemberships,
    source,
    error,
  } = await getConsoleData();

  const headerStats = [
    ["아이디어", String(ideas.length)],
    ["열린 리스크", String(risks.filter((risk) => risk.status.toLowerCase() === "open").length)],
    ["실험", String(experiments.length)],
    ["산출물", String(artifacts.length)],
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1460px] gap-3 px-4 py-4 sm:px-6">
        <header className="border border-slate-200 bg-white/96 px-4 py-3 backdrop-blur sm:px-5">
          <div className="grid gap-px bg-slate-200 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="avl-kicker text-slate-700">
                      <Sparkle size={14} />
                      AI Venture Lab
                    </div>
                    <span className="avl-pill avl-pill-neutral">workspace</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[15px] font-semibold tracking-tight text-slate-950 sm:text-[17px]">실행 보드</h1>
                    <span className="hidden text-sm text-slate-300 sm:inline">/</span>
                    <p className="text-[12px] leading-5 text-slate-500">후보, 판단, 실행 패키지를 같은 흐름에서 보는 작업 공간</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                    <ArrowLeft size={14} />
                    홈
                  </Link>
                  <Link href="/guide" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                    가이드
                  </Link>
                  <span className="avl-btn avl-btn-secondary h-8 px-3 text-xs">
                    <GridFour size={14} />
                    실행 보드
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
              {headerStats.map(([label, value]) => (
                <div key={label} className="bg-[#f7f6f2] px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-2 text-[22px] font-semibold tracking-tight text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {error ? (
          <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Supabase 데이터를 일부 불러오지 못했습니다. 현재 보드는 빈 상태 또는 제한된 상태로 표시될 수 있습니다.
            오류: {error}
          </section>
        ) : null}

        <section className="grid gap-px border border-slate-200 bg-slate-200 xl:grid-cols-[180px_minmax(0,1fr)]">
          <div className="bg-[#f7f6f2] px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">board mode</div>
            <div className="mt-1 text-[15px] font-semibold tracking-tight text-slate-950">세 단계만 먼저</div>
          </div>

          <div className="bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-700">
              {[
                ["01", "메모 붙여넣기"],
                ["02", "후보 1건 확인"],
                ["03", "아이디어 저장"],
              ].map(([step, label], index) => (
                <span key={step} className="inline-flex items-center gap-2">
                  <span className="avl-step-dot h-6 w-6 bg-slate-100 text-slate-700">{step}</span>
                  <span className="font-medium">{label}</span>
                  {index < 2 ? <span className="text-slate-300">/</span> : null}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">AI가 후보 1건과 다음 행동을 먼저 정리하고, 검증 단계는 저장 직후 이어집니다.</p>
          </div>
        </section>

        <VentureConsoleShell
          initialIdeas={ideas}
          initialRisks={risks}
          initialDecisions={decisions}
          initialExperiments={experiments}
          initialOrchestrationRuns={orchestrationRuns}
          initialArtifacts={artifacts}
          initialImplementationTasks={implementationTasks}
          initialTelemetryEvents={telemetryEvents}
          initialViewerUserId={viewerUserId}
          initialViewerMemberships={viewerMemberships}
          source={source}
        />
      </div>
    </main>
  );
}
