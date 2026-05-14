import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Flask, Sparkle } from "@phosphor-icons/react/dist/ssr";

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
        <header className="border border-slate-200 bg-white/96 px-4 py-3.5 backdrop-blur sm:px-5">
          <div className="grid gap-px bg-slate-200 xl:grid-cols-[minmax(0,1fr)_440px]">
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
                    <h1 className="text-[16px] font-semibold tracking-tight text-slate-950 sm:text-[18px]">실행 보드</h1>
                    <span className="hidden text-sm text-slate-300 sm:inline">/</span>
                    <p className="text-[12px] leading-5 text-slate-500">아이디어를 검증하고 실행 패키지까지 정리하는 작업 공간</p>
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
                    <LayoutGrid size={14} />
                    실행 보드
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
              {headerStats.map(([label, value]) => (
                <div key={label} className="bg-[#f7f6f2] px-4 py-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <div className="mt-3 text-[24px] font-semibold tracking-tight text-slate-950">{value}</div>
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

        <section className="grid gap-px border border-slate-200 bg-slate-200 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
          <div className="bg-[#f7f6f2] px-4 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">operating lens</div>
            <div className="mt-3 text-[18px] font-semibold tracking-tight text-slate-950">오늘의 워크플로</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              후보 발굴, 검증 판단, 실행 패키지, 학습 루프까지 현재 열린 단계만 앞에 두고 진행합니다.
            </p>
          </div>

          <div className="bg-white px-4 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">single board</div>
            <div className="mt-3 text-[24px] font-semibold tracking-tight text-slate-950">
              지금 필요한 판단만 앞에 남기고, 나머지는 보조 패널로 뒤에 둡니다.
            </div>
          </div>

          <div className="grid gap-px bg-slate-200">
            <div className="bg-white px-4 py-5">
              <div className="flex items-center gap-3">
                <span className="avl-icon-frame rounded-none border-slate-200 bg-slate-50">
                  <Flask size={18} />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">execution mode</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">solo-first workflow</div>
                </div>
              </div>
            </div>
            <div className="bg-[#f7f6f2] px-4 py-4 text-sm leading-6 text-slate-600">
              필요한 순간에만 팀 초대를 붙이고, 기본은 한 사람이 끝까지 이어서 보는 흐름입니다.
            </div>
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
