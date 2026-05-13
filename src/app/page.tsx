import { FlaskConical } from "lucide-react";

import { VentureConsoleShell } from "@/components/venture-console-shell";
import { getConsoleData } from "@/lib/venture-data";

export const dynamic = "force-dynamic";

export default async function Home() {
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
  } =
    await getConsoleData();

  const headerStats = [
    ["아이디어", String(ideas.length)],
    ["열린 리스크", String(risks.filter((risk) => risk.status.toLowerCase() === "open").length)],
    ["실험", String(experiments.length)],
    ["산출물", String(artifacts.length)],
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1760px] gap-6 px-4 py-4 sm:px-6">
        <header className="avl-card overflow-hidden px-6 py-5 sm:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-center">
            <div className="max-w-4xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                <FlaskConical size={16} />
                AI Venture Lab
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[44px] sm:leading-[46px]">
                  아이디어 실행 보드
                </h1>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  Solo-first workspace
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                AI가 초안을 만들고, 사용자는 필요한 판단만 보완하는 실행형 작업공간입니다. 아이디어 발굴부터
                검증, 제작, 출시 판단까지 한 흐름으로 이어갑니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {headerStats.map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {error ? (
          <section className="rounded-[20px] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
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
