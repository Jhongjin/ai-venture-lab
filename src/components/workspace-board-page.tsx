import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { VentureConsoleShell } from "@/components/venture-console-shell";
import type { WorkbenchTask } from "@/components/idea-workbench";
import { formatBuildPassCount, formatCreditAmount, getBuildPassCapacity } from "@/lib/billing";
import { readAuthenticatedCreditSummary } from "@/lib/billing-server";
import { getConsoleData } from "@/lib/venture-data";

export type WorkspaceInitialView = "ideas" | "deleted" | undefined;
export type WorkspaceInitialTask = WorkbenchTask | undefined;

export async function WorkspaceBoardPage({
  initialView,
  initialTask,
  initialIdeaId,
}: {
  initialView?: WorkspaceInitialView;
  initialTask?: WorkspaceInitialTask;
  initialIdeaId?: string;
}) {
  const [consoleData, creditResult] = await Promise.all([getConsoleData(), readAuthenticatedCreditSummary()]);
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
  } = consoleData;

  const activeIdeas = ideas.filter((idea) => idea.decision !== "kill");
  const deletedIdeas = ideas.filter((idea) => idea.decision === "kill");
  const creditSummary = creditResult.summary;
  const remainingBuildPassCount = creditSummary
    ? getBuildPassCapacity(creditSummary.balance, creditSummary.buildPassCost)
    : null;
  const creditStatValue =
    creditSummary?.status === "ready"
      ? formatCreditAmount(creditSummary.balance)
      : creditSummary?.status === "missing"
        ? "DB 준비 필요"
        : creditSummary
          ? "확인 필요"
          : "로그인 후 확인";
  const creditStatDetail =
    creditSummary?.status === "ready"
      ? `제작 패스 ${formatBuildPassCount(remainingBuildPassCount)} 가능`
      : creditSummary?.message ?? "프로필에서 Free 크레딧과 제작 패스를 확인";
  const headerStats: Array<{ label: string; value: string; href: string; detail?: string }> = [
    { label: "검토 아이디어", value: String(activeIdeas.length), href: "/workspace/ideas" },
    { label: "삭제한 아이디어", value: String(deletedIdeas.length), href: "/workspace/deleted" },
    { label: "제작 크레딧", value: creditStatValue, href: "/profile", detail: creditStatDetail },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1460px] gap-3 px-4 py-4 sm:px-6">
        <header className="border-b border-slate-200 bg-white/96 px-4 py-3 backdrop-blur sm:px-5">
          <div className="grid gap-px bg-slate-200 xl:grid-cols-[minmax(0,1fr)_660px]">
            <div className="flex items-center bg-white px-4 py-4 sm:px-5">
              <h1 className="text-[16px] font-semibold tracking-tight text-slate-950 sm:text-[18px]">실행 보드</h1>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
              {headerStats.map(({ label, value, href, detail }) => (
                <Link
                  key={label}
                  href={href}
                  data-smoke={label === "제작 크레딧" ? "workspace-credit-summary" : undefined}
                  className="bg-white px-4 py-3 transition hover:bg-slate-50"
                >
                  <div className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
                  <div className="mt-1 text-[20px] font-semibold tracking-tight text-slate-950">{value}</div>
                  {detail ? <div className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</div> : null}
                </Link>
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
          key={`${initialView ?? "default"}:${initialTask ?? "none"}:${initialIdeaId ?? "none"}`}
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
          initialCreditSummary={creditSummary}
          source={source}
          initialView={initialView}
          initialTask={initialTask}
          initialIdeaId={initialIdeaId}
        />
      </div>
    </main>
  );
}
