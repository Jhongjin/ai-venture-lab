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
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto grid w-full max-w-[1680px] gap-6 px-4 py-4 sm:px-6">
        <header className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(187,166,255,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.18),transparent_24%),linear-gradient(135deg,#0a0a0f_0%,#141421_58%,#10131c_100%)] px-6 py-7 shadow-[0_35px_120px_rgba(0,0,0,0.42)] sm:px-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
                <FlaskConical size={16} />
                AI Venture Lab
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                아이디어 실행 보드
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-[15px]">
                AI가 아이디어를 구조화하고, 검증과 실행 패키지를 자동으로 만들고, 사용자는 필요한 판단만
                보완하는 단일 실행형 워크스페이스입니다.
              </p>
            </div>

            <div className="grid min-w-[320px] gap-3 sm:grid-cols-2 xl:w-[420px]">
              {headerStats.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {error ? (
          <section className="rounded-[22px] border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
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
