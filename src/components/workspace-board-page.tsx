import Link from "next/link";
import { ArrowLeft, GridFour, Sparkle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

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
    <main id="main-content" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1460px] gap-3 px-4 py-4 sm:px-6">
        <header className="border-b border-slate-200 bg-white/96 px-4 py-3 backdrop-blur sm:px-5">
          <div className="grid gap-px bg-slate-200 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="avl-kicker text-slate-700">
                      <Sparkle size={14} />
                      AI Venture Lab
                    </div>
                    <span className="avl-pill avl-pill-neutral">실행 공간</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[15px] font-semibold tracking-tight text-slate-950 sm:text-[17px]">실행 보드</h1>
                    <span className="hidden text-sm text-slate-300 sm:inline">/</span>
                    <p className="text-[12px] leading-5 text-slate-500">후보, 판단, 실행 패키지를 한 보드에서 이어서 다루는 작업 공간</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                    <ArrowLeft size={14} />
                    홈
                  </Link>
                  <Link href="/guide" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                    사용 흐름
                  </Link>
                  <span className="avl-btn avl-btn-secondary h-8 px-3 text-xs">
                    <GridFour size={14} />
                    실행 보드
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-slate-200 xl:grid-cols-4">
              {headerStats.map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-1 text-[20px] font-semibold tracking-tight text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {error ? (
          <section className="grid gap-px border border-amber-200 bg-amber-200 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="flex items-center gap-3 bg-amber-50 px-4 py-3 text-amber-900">
              <WarningCircle size={18} />
              <span className="text-[11px] font-semibold tracking-[0.14em]">데이터 확인 필요</span>
            </div>
            <div className="bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              데이터 연결 상태를 모두 확인하지 못했습니다. 현재 보드는 비어 있거나 일부 기능이 제한될 수 있습니다.
              <span className="mt-1 block font-semibold sm:ml-2 sm:mt-0 sm:inline">관리자에게 연결 상태 확인을 요청해 주세요.</span>
            </div>
          </section>
        ) : null}

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
