"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterClockwise, ArrowRight, Trash } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { WorkspaceIdeaListActions } from "@/components/workspace-idea-list-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Idea } from "@/lib/venture-data";

type IdeaListMode = "active" | "deleted";

type WorkspaceIdeaListItem = {
  idea: Idea;
  nextAction: string;
  progressLabel: string;
  href: string;
  canManage: boolean;
  sourceLabel: string;
};

type WorkspaceIdeaSelectableListProps = {
  mode: IdeaListMode;
  items: WorkspaceIdeaListItem[];
  emptyMessage: string;
};

export function WorkspaceIdeaSelectableList({ mode, items, emptyMessage }: WorkspaceIdeaSelectableListProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const selectableIds = useMemo(
    () => items.filter((item) => item.canManage).map((item) => item.idea.id),
    [items],
  );
  const selectedValidIds = useMemo(
    () => Array.from(selectedIds).filter((id) => selectableIds.includes(id)),
    [selectableIds, selectedIds],
  );
  const selectedCount = selectedValidIds.length;
  const hasSelectableIdeas = selectableIds.length > 0;
  const allSelected = hasSelectableIdeas && selectedCount === selectableIds.length;

  useEffect(() => {
    if (!selectAllRef.current) {
      return;
    }

    selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected;
  }, [allSelected, selectedCount]);

  function toggleSelection(ideaId: string) {
    setMessage(null);
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }

      return next;
    });
  }

  function toggleAll() {
    setMessage(null);
    setSelectedIds(() => {
      if (selectedValidIds.length === selectableIds.length) {
        return new Set();
      }

      return new Set(selectableIds);
    });
  }

  async function moveSelectedToDeleted() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    const ids = selectedValidIds;

    if (ids.length === 0) {
      setMessage("삭제할 아이디어를 선택해 주세요.");
      return;
    }

    const confirmed = window.confirm(
      `선택한 ${ids.length}개 아이디어를 삭제한 아이디어로 옮길까요?\n나중에 삭제한 아이디어 화면에서 다시 되살릴 수 있습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { error } = await supabase
      .from("ideas")
      .update({ decision: "kill", stage: "paused", updated_at: new Date().toISOString() })
      .in("id", ids)
      .neq("decision", "kill");

    setIsBusy(false);

    if (error) {
      setMessage(`선택한 아이디어를 삭제하지 못했습니다: ${error.message}`);
      return;
    }

    setSelectedIds(new Set());
    router.refresh();
  }

  async function restoreSelectedIdeas() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    const ids = selectedValidIds;

    if (ids.length === 0) {
      setMessage("되살릴 아이디어를 선택해 주세요.");
      return;
    }

    const confirmed = window.confirm(`선택한 ${ids.length}개 아이디어를 검토 아이디어로 되살릴까요?`);

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { error } = await supabase
      .from("ideas")
      .update({ decision: "research_more", stage: "score", updated_at: new Date().toISOString() })
      .in("id", ids)
      .eq("decision", "kill");

    setIsBusy(false);

    if (error) {
      setMessage(`선택한 아이디어를 되살리지 못했습니다: ${error.message}`);
      return;
    }

    setSelectedIds(new Set());
    router.refresh();
  }

  async function permanentlyDeleteSelectedIdeas() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    const ids = selectedValidIds;

    if (ids.length === 0) {
      setMessage("완전히 삭제할 아이디어를 선택해 주세요.");
      return;
    }

    const confirmed = window.confirm(
      `선택한 ${ids.length}개 아이디어와 연결된 기록을 완전히 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const relatedIdeaTables = [
      "telemetry_events",
      "implementation_tasks",
      "venture_artifacts",
      "orchestration_runs",
      "experiments",
      "decisions",
      "risks",
    ] as const;

    for (const table of relatedIdeaTables) {
      const { error } = await supabase.from(table).delete().in("idea_id", ids);

      if (error) {
        setIsBusy(false);
        setMessage(`완전 삭제 중 ${table} 정리에서 막혔습니다: ${error.message}`);
        return;
      }
    }

    const { error } = await supabase.from("ideas").delete().in("id", ids).eq("decision", "kill");

    setIsBusy(false);

    if (error) {
      setMessage(`선택한 아이디어를 완전히 삭제하지 못했습니다: ${error.message}`);
      return;
    }

    setSelectedIds(new Set());
    router.refresh();
  }

  if (items.length === 0) {
    return <div className="border border-dashed border-slate-300 bg-white p-8 text-sm leading-6 text-slate-600">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              disabled={!hasSelectableIdeas || isBusy}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            />
            {mode === "deleted" ? "삭제한 아이디어 전체 선택" : "검토 아이디어 전체 선택"}
          </label>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {mode === "active" ? (
                <button
                  type="button"
                  onClick={() => void moveSelectedToDeleted()}
                  disabled={selectedCount === 0 || isBusy}
                  className="avl-btn avl-btn-danger h-10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash size={15} />
                  {allSelected ? "검토 아이디어 전체 삭제" : "선택한 아이디어 삭제"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void restoreSelectedIdeas()}
                    disabled={selectedCount === 0 || isBusy}
                    className="avl-btn avl-btn-secondary h-10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowCounterClockwise size={15} />
                    선택한 아이디어 되살리기
                  </button>
                  <button
                    type="button"
                    onClick={() => void permanentlyDeleteSelectedIdeas()}
                    disabled={selectedCount === 0 || isBusy}
                    className="avl-btn avl-btn-danger h-10 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash size={15} />
                    {allSelected ? "삭제한 아이디어 전체 완전 삭제" : "선택한 아이디어 완전 삭제"}
                  </button>
                </>
              )}
            </div>
            <div className="text-xs leading-5 text-slate-500">
              {hasSelectableIdeas ? `${selectedCount}개 선택됨` : "관리 권한이 있는 아이디어가 없습니다."}
            </div>
          </div>
          {message ? <p className="text-xs leading-5 text-red-700 sm:basis-full">{message}</p> : null}
      </div>

      {items.map(({ idea, nextAction, progressLabel, href, canManage, sourceLabel }) => {
        const isSelected = selectedIds.has(idea.id);

        return (
          <article
            key={idea.id}
            className="grid gap-4 border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="flex lg:self-start">
              <input
                type="checkbox"
                aria-label={`${idea.name} 선택`}
                checked={isSelected}
                disabled={!canManage || isBusy}
                onChange={() => toggleSelection(idea.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={mode === "deleted" ? "avl-pill avl-pill-warning" : "avl-pill avl-pill-info"}>
                  {mode === "deleted" ? "삭제됨" : progressLabel}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{sourceLabel}</span>
              </div>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{idea.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{idea.one_liner || idea.signal}</p>
              <div className="mt-3 border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                <span className="font-semibold text-slate-950">다음 행동</span> {nextAction}
              </div>
            </div>
            <div className="grid justify-items-start gap-3 lg:justify-items-end">
              {mode === "deleted" ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Trash size={16} />
                  삭제 목록에서 관리
                </div>
              ) : (
                <Link href={href} className="avl-btn avl-btn-secondary h-10 px-3 text-sm">
                  다음 행동 열기
                  <ArrowRight size={16} />
                </Link>
              )}
              <WorkspaceIdeaListActions idea={idea} mode={mode} canManage={canManage} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
