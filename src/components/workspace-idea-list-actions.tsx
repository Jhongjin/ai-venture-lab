"use client";

import { useState } from "react";
import { ArrowCounterClockwise, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import {
  buildDiscardIdeaPatch,
  buildRestoreIdeaPatch,
  buildWorkbenchIdeaDiscardConfirmMessage,
  buildWorkbenchIdeaDiscardFailedMessage,
  buildWorkbenchIdeaPermanentDeleteConfirmMessage,
  buildWorkbenchIdeaPermanentDeleteFailedMessage,
  buildWorkbenchIdeaRelatedTableDeleteFailedMessage,
  buildWorkbenchIdeaRestoreFailedMessage,
  getIdeaDeletionRelatedTables,
} from "@/lib/workbench-list-utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Idea } from "@/lib/venture-data";

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

    const confirmed = window.confirm(buildWorkbenchIdeaDiscardConfirmMessage(idea.name));

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    const { error } = await supabase
      .from("ideas")
      .update(buildDiscardIdeaPatch())
      .eq("id", idea.id);

    setIsBusy(false);

    if (error) {
      setMessage(buildWorkbenchIdeaDiscardFailedMessage({ errorMessage: error.message, ideaName: idea.name }));
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
      .update(buildRestoreIdeaPatch())
      .eq("id", idea.id);

    setIsBusy(false);

    if (error) {
      setMessage(buildWorkbenchIdeaRestoreFailedMessage({ errorMessage: error.message, ideaName: idea.name }));
      return;
    }

    router.refresh();
  }

  async function permanentlyDeleteIdea() {
    if (!supabase) {
      setMessage("저장소 연결을 확인해 주세요.");
      return;
    }

    const confirmed = window.confirm(buildWorkbenchIdeaPermanentDeleteConfirmMessage(idea.name));

    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setMessage(null);

    for (const table of getIdeaDeletionRelatedTables()) {
      const { error } = await supabase.from(table).delete().eq("idea_id", idea.id);

      if (error) {
        setIsBusy(false);
        setMessage(
          buildWorkbenchIdeaRelatedTableDeleteFailedMessage({
            errorMessage: error.message,
            ideaName: idea.name,
            table,
          }),
        );
        return;
      }
    }

    const { error } = await supabase.from("ideas").delete().eq("id", idea.id);

    setIsBusy(false);

    if (error) {
      setMessage(buildWorkbenchIdeaPermanentDeleteFailedMessage({ errorMessage: error.message, ideaName: idea.name }));
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
