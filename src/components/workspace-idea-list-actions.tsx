"use client";

import { useState } from "react";
import { ArrowCounterClockwise, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Idea } from "@/lib/venture-data";

const relatedIdeaTables = [
  "telemetry_events",
  "implementation_tasks",
  "venture_artifacts",
  "orchestration_runs",
  "experiments",
  "decisions",
  "risks",
] as const;

type WorkspaceIdeaListActionsProps = {
  idea: Pick<Idea, "id" | "name">;
  mode: "active" | "deleted";
  canManage: boolean;
};

export function WorkspaceIdeaListActions({ idea, mode, canManage }: WorkspaceIdeaListActionsProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function moveToDeleted() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    const confirmed = window.confirm(`"${idea.name}" 아이디어를 삭제한 아이디어로 옮길까요?\n나중에 다시 되살릴 수 있습니다.`);

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { error } = await supabase
      .from("ideas")
      .update({ decision: "kill", stage: "paused", updated_at: new Date().toISOString() })
      .eq("id", idea.id);

    setIsBusy(false);

    if (error) {
      setMessage(`삭제하지 못했습니다: ${error.message}`);
      return;
    }

    router.refresh();
  }

  async function restoreIdea() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { error } = await supabase
      .from("ideas")
      .update({ decision: "research_more", stage: "score", updated_at: new Date().toISOString() })
      .eq("id", idea.id);

    setIsBusy(false);

    if (error) {
      setMessage(`되살리지 못했습니다: ${error.message}`);
      return;
    }

    router.refresh();
  }

  async function permanentlyDeleteIdea() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    const confirmed = window.confirm(
      `"${idea.name}" 아이디어와 연결된 기록을 완전히 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    for (const table of relatedIdeaTables) {
      const { error } = await supabase.from(table).delete().eq("idea_id", idea.id);

      if (error) {
        setIsBusy(false);
        setMessage(`완전 삭제 중 ${table} 정리에서 막혔습니다: ${error.message}`);
        return;
      }
    }

    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);

    setIsBusy(false);

    if (error) {
      setMessage(`완전히 삭제하지 못했습니다: ${error.message}`);
      return;
    }

    router.refresh();
  }

  if (!canManage) {
    return (
      <div className="text-xs leading-5 text-slate-500">
        이 아이디어는 보기 권한만 있습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        {mode === "active" ? (
          <button
            type="button"
            onClick={() => void moveToDeleted()}
            disabled={isBusy}
            className="avl-btn avl-btn-danger h-10 px-3 text-sm disabled:opacity-50"
          >
            <Trash size={15} />
            삭제
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void restoreIdea()}
              disabled={isBusy}
              className="avl-btn avl-btn-secondary h-10 px-3 text-sm disabled:opacity-50"
            >
              <ArrowCounterClockwise size={15} />
              되살리기
            </button>
            <button
              type="button"
              onClick={() => void permanentlyDeleteIdea()}
              disabled={isBusy}
              className="avl-btn avl-btn-danger h-10 px-3 text-sm disabled:opacity-50"
            >
              <Trash size={15} />
              완전 삭제
            </button>
          </>
        )}
      </div>
      {message ? <p className="text-xs leading-5 text-red-700">{message}</p> : null}
    </div>
  );
}
