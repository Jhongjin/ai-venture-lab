import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

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
    ["검토 후보", String(ideas.length)],
    ["확인할 리스크", String(risks.filter((risk) => risk.status.toLowerCase() === "open").length)],
    ["검증 계획", String(experiments.length)],
    ["실행 문서", String(artifacts.length)],
  ];

  return (
    <main id="main-content" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1460px] gap-3 px-4 py-4 sm:px-6">
        <header className="border-b border-slate-200 bg-white/96 px-4 py-3 backdrop-blur sm:px-5">
          <div className="grid gap-px bg-slate-200 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="flex items-center bg-white px-4 py-4 sm:px-5">
              <h1 className="text-[16px] font-semibold tracking-tight text-slate-950 sm:text-[18px]">실행 보드</h1>
            </div>

            <div className="grid grid-cols-2 gap-px bg-slate-200 xl:grid-cols-4">
              {headerStats.map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3">
                  <div className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
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
