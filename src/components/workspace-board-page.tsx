import Link from "next/link";
import { ArrowLeft, FlaskConical, LayoutGrid } from "lucide-react";

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
        <header className="avl-card px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <div className="avl-kicker">
                  <FlaskConical size={15} />
                  AI Venture Lab
                </div>
                <span className="avl-pill avl-pill-neutral">workspace</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[15px] font-semibold tracking-tight text-slate-950 sm:text-[17px]">아이디어 실행 보드</h1>
                <span className="hidden text-sm text-slate-300 sm:inline">/</span>
                <p className="text-[12px] leading-5 text-slate-500">아이디어를 검증하고 실행 패키지까지 정리하는 작업 공간</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {headerStats.map(([label, value]) => (
                <div key={label} className="avl-surface-subtle flex min-w-[88px] items-center justify-between gap-3 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="text-sm font-semibold text-slate-950">{value}</div>
                </div>
              ))}
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                  <ArrowLeft size={14} />
                  홈
                </Link>
                <Link href="/guide" className="avl-btn avl-btn-subtle h-8 px-3 text-xs">
                  가이드
                </Link>
                <span className="avl-btn avl-btn-secondary h-8 px-3 text-xs">
                  <LayoutGrid size={14} />
                  실행 보드
                </span>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <section className="avl-surface-muted border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Supabase 데이터를 일부 불러오지 못했습니다. 현재 보드는 빈 상태 또는 제한된 상태로 표시될 수 있습니다.
            오류: {error}
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
