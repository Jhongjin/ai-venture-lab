"use client";

import { ArrowsClockwise, PlusCircle } from "@phosphor-icons/react";

type ManualIdeaSaveHeaderProps = {
  activeOrganizationName: string | null;
  canSave: boolean;
  embedded: boolean;
  isSaving: boolean;
};

export function ManualIdeaSaveHeader({
  activeOrganizationName,
  canSave,
  embedded,
  isSaving,
}: ManualIdeaSaveHeaderProps) {
  const description = activeOrganizationName
    ? `${activeOrganizationName}에 저장할 초안을 확인합니다. 이름과 한 줄 설명만 확정하면 STEP 2 사업성 평가로 이어갈 수 있습니다.`
    : "AI가 만든 초안을 확인하고 꼭 필요한 의견만 보완합니다. 여기서는 필수 두 줄만 먼저 확정하면 충분합니다.";
  const saveButton = (
    <button
      data-smoke="manual-idea-save-action"
      type="submit"
      disabled={isSaving || !canSave}
      className="avl-btn avl-btn-primary h-11 px-4 disabled:opacity-50"
    >
      {isSaving ? <ArrowsClockwise className="animate-spin" size={18} /> : <PlusCircle size={18} />}
      아이디어 저장
    </button>
  );

  if (embedded) {
    return (
      <div
        data-smoke="manual-idea-save-header"
        className="mb-5 grid gap-3 border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      >
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">초안 확인</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {saveButton}
      </div>
    );
  }

  return (
    <div data-smoke="manual-idea-save-header" className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="mb-2 inline-flex avl-pill avl-pill-neutral px-2.5 py-1 text-[10px] tracking-[0.14em]">
          초안 확인
        </div>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">아이디어 저장</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      </div>
      {saveButton}
    </div>
  );
}
