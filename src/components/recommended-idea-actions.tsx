"use client";

import { ArrowsClockwise, PlusCircle } from "@phosphor-icons/react";

type RecommendedIdeaActionsProps = {
  canSave: boolean;
  isSaving: boolean;
  isSaveLocked: boolean;
  onEdit: () => void;
  onSave: () => void;
};

export function RecommendedIdeaActions({
  canSave,
  isSaving,
  isSaveLocked,
  onEdit,
  onSave,
}: RecommendedIdeaActionsProps) {
  return (
    <div data-smoke="recommended-idea-actions" className="mt-4 grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onEdit} className="avl-btn avl-btn-secondary px-4">
          필요할 때만 수정
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaveLocked || !canSave}
          className="avl-btn avl-btn-primary px-4"
        >
          {isSaving ? <ArrowsClockwise className="animate-spin" size={16} /> : <PlusCircle size={16} />}
          이 아이디어 저장하고 검증 시작
        </button>
      </div>
      <p data-smoke="recommended-edit-does-not-save" className="text-xs font-semibold leading-5 text-slate-600">
        수정은 내용만 바꾸는 보조 행동입니다. 저장과 다음 단계 시작은 이 아이디어 저장하고 검증 시작 버튼에서만 진행됩니다.
      </p>
    </div>
  );
}
