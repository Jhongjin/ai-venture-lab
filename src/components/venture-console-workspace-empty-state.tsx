"use client";

import { ArrowsClockwise, Buildings } from "@phosphor-icons/react";

type VentureConsoleWorkspaceEmptyStateProps = {
  isWorkspaceBusy: boolean;
  mode: "login" | "create";
  onCreateWorkspace: () => void | Promise<void>;
  personalRecordCount: number;
};

export function VentureConsoleWorkspaceEmptyState({
  isWorkspaceBusy,
  mode,
  onCreateWorkspace,
  personalRecordCount,
}: VentureConsoleWorkspaceEmptyStateProps) {
  if (mode === "login") {
    return (
      <div className="avl-surface-muted p-4 text-sm leading-6 text-slate-600">
        워크스페이스 멤버십을 불러오려면 로그인하세요.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="avl-surface-muted border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        아직 연결된 협업 공간이 없습니다.
        {personalRecordCount > 0 ? ` 필요하면 협업 공간을 만든 뒤 ${personalRecordCount}개의 개인 기록을 연결할 수 있습니다.` : ""}
      </div>
      <button
        type="button"
        onClick={() => {
          void onCreateWorkspace();
        }}
        disabled={isWorkspaceBusy}
        className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-60"
      >
        {isWorkspaceBusy ? <ArrowsClockwise className="animate-spin" size={18} /> : <Buildings size={18} />}
        협업 공간 만들기
      </button>
    </div>
  );
}
