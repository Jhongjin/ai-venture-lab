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
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 sm:px-6">
        <header className="rounded-[12px] border border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                <FlaskConical size={15} />
                AI Venture Lab
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[18px] font-semibold tracking-tight text-slate-950 sm:text-[22px]">
                  아이디어 실행 보드
                </h1>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  build mode
                </span>
              </div>
              <p className="mt-1 max-w-3xl text-[12px] leading-5 text-slate-600">
                아이디어를 발굴하고 검증한 뒤, 기획서와 실행 패키지까지 한 흐름으로 이어가는 작업 공간입니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 xl:min-w-[360px] xl:grid-cols-4">
              {headerStats.map(([label, value]) => (
                <div key={label} className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-1 text-[15px] font-semibold text-slate-950">{value}</div>
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
