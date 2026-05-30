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
    <div data-smoke="recommended-idea-actions" className="mt-4 flex flex-wrap gap-2">
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
  );
}
