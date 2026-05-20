import { ArrowRight, Trash, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { WorkspaceIdeaListActions } from "@/components/workspace-idea-list-actions";
import { getConsoleData } from "@/lib/venture-data";
import type { Idea } from "@/lib/venture-data";

type IdeaListMode = "active" | "deleted";
type IdeaProgress = {
  label: string;
  task: "score" | "risk" | "experiment" | "artifacts" | "development" | "launch" | "learning";
};
const adminRoles = new Set(["owner", "admin"]);

function getIdeaProgress(idea: Idea): IdeaProgress {
  switch (idea.stage) {
    case "prd":
      return { label: "STEP 4 AI 제작 자료 저장", task: "artifacts" };
    case "prototype":
    case "qa":
      return { label: "STEP 5 제작 준비", task: "development" };
    case "launch":
      return { label: "STEP 7 출시 판단", task: "launch" };
    case "paused":
      return { label: "STEP 2 사업성 평가", task: "score" };
    case "intake":
    case "research":
    case "score":
    default:
      return { label: "STEP 2 사업성 평가", task: "score" };
  }
}

function getIdeaHref(idea: Idea) {
  const progress = getIdeaProgress(idea);
  return `/workspace?task=${progress.task}&idea=${idea.id}`;
}

function canManageIdea({
  idea,
  viewerUserId,
  viewerMemberships,
}: {
  idea: Idea;
  viewerUserId: string | null;
  viewerMemberships: Awaited<ReturnType<typeof getConsoleData>>["viewerMemberships"];
}) {
  if (!viewerUserId) {
    return false;
  }

  if (idea.created_by === viewerUserId) {
    return true;
  }

  if (!idea.organization_id) {
    return false;
  }

  return viewerMemberships.some(
    (membership) =>
      membership.user_id === viewerUserId &&
      membership.organization_id === idea.organization_id &&
      adminRoles.has(membership.role),
  );
}

export async function WorkspaceIdeaListPage({ mode }: { mode: IdeaListMode }) {
  const { ideas, source, error, viewerUserId, viewerMemberships } = await getConsoleData();
  const activeIdeas = ideas.filter((idea) => idea.decision !== "kill");
  const deletedIdeas = ideas.filter((idea) => idea.decision === "kill");
  const records = mode === "deleted" ? deletedIdeas : activeIdeas;
  const title = mode === "deleted" ? "삭제한 아이디어" : "검토 아이디어";
  const description =
    mode === "deleted"
      ? "삭제 목록으로 옮긴 아이디어입니다. 여기서 되살리거나 완전히 삭제할 수 있습니다."
      : "진행 중인 아이디어입니다. 항목을 선택하면 저장된 다음 단계가 열립니다.";

  return (
    <main id="main-content" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 py-4 sm:px-6">
        <header className="border border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">실행 보드</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/workspace" className="avl-btn avl-btn-secondary px-4">
                실행 보드
              </Link>
              {mode === "deleted" ? (
                <Link href="/workspace/ideas" className="avl-btn avl-btn-secondary px-4">
                  검토 아이디어
                </Link>
              ) : (
                <Link href="/workspace/deleted" className="avl-btn avl-btn-secondary px-4">
                  삭제한 아이디어
                </Link>
              )}
            </div>
          </div>
        </header>

        {error ? (
          <section className="flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            <WarningCircle size={18} />
            <span>데이터 연결 상태를 모두 확인하지 못했습니다. 목록이 일부만 보일 수 있습니다.</span>
          </section>
        ) : null}

        <section className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2">
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">검토 아이디어</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">{activeIdeas.length}</div>
          </div>
          <div className="bg-white px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">삭제한 아이디어</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">{deletedIdeas.length}</div>
          </div>
        </section>

        <section className="grid gap-3">
          {records.length > 0 ? (
            records.map((idea) => {
              const progress = getIdeaProgress(idea);
              const href = mode === "deleted" ? "/workspace?task=archive" : getIdeaHref(idea);
              const canManage = canManageIdea({ idea, viewerUserId, viewerMemberships });

              return (
                <article
                  key={idea.id}
                  className="grid gap-4 border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={mode === "deleted" ? "avl-pill avl-pill-warning" : "avl-pill avl-pill-info"}>
                        {mode === "deleted" ? "삭제됨" : progress.label}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {source === "supabase" ? "저장됨" : "샘플"}
                      </span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{idea.name}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{idea.one_liner || idea.signal}</p>
                  </div>
                  <div className="grid justify-items-start gap-3 lg:justify-items-end">
                    {mode === "deleted" ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                        <Trash size={16} />
                        삭제 목록에서 관리
                      </div>
                    ) : (
                      <Link href={href} className="avl-btn avl-btn-secondary h-10 px-3 text-sm">
                        이어서 보기
                        <ArrowRight size={16} />
                      </Link>
                    )}
                    <WorkspaceIdeaListActions idea={idea} mode={mode} canManage={canManage} />
                  </div>
                </article>
              );
            })
          ) : (
            <div className="border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600">
              {mode === "deleted"
                ? "삭제한 아이디어가 없습니다."
                : "현재 검토 중인 아이디어가 없습니다. 실행 보드에서 새 아이디어를 도출해 주세요."}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
