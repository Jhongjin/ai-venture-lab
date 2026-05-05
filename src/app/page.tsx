import { FlaskConical } from "lucide-react";

import { VentureConsoleShell } from "@/components/venture-console-shell";
import { getConsoleData } from "@/lib/venture-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { ideas, risks, decisions, experiments, orchestrationRuns, artifacts, source, error } = await getConsoleData();

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto grid w-full max-w-[1680px] gap-5 px-4 py-4 sm:px-6">
        <header className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                <FlaskConical size={16} />
                AI Venture Lab
              </div>
              <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                아이디어-MVP 실행 센터
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              앱 아이디어를 선별하고, 가능성이 높은 아이디어를 명세와 프로토타입으로 전환한 뒤 QA, 디버깅,
              개인정보, 보안 게이트를 통과시켜 출시 판단까지 이어가는 운영 하네스입니다.
            </p>
          </div>
        </header>

        {error ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase 읽기에 실패해 기본 예시 데이터를 표시합니다. 오류: {error}
          </section>
        ) : null}

        <VentureConsoleShell
          initialIdeas={ideas}
          initialRisks={risks}
          initialDecisions={decisions}
          initialExperiments={experiments}
          initialOrchestrationRuns={orchestrationRuns}
          initialArtifacts={artifacts}
          source={source}
        />
      </div>
    </main>
  );
}
