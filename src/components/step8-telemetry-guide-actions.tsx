"use client";

import { Clipboard, Save } from "lucide-react";

type Step8TelemetryGuideActionsProps = {
  canSave: boolean;
  isBusy: boolean;
  onCopyDraft: (body: string, label: string) => void;
  onSaveGuide: () => void;
  telemetryAdapterGuideDraft: string;
};

export function Step8TelemetryGuideActions({
  canSave,
  isBusy,
  onCopyDraft,
  onSaveGuide,
  telemetryAdapterGuideDraft,
}: Step8TelemetryGuideActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onCopyDraft(telemetryAdapterGuideDraft, "성과 신호 연결 가이드")}
        disabled={!telemetryAdapterGuideDraft}
        className="avl-btn avl-btn-secondary h-10 px-3 disabled:opacity-50"
      >
        <Clipboard size={16} />
        연결 가이드 복사
      </button>
      <button
        type="button"
        onClick={onSaveGuide}
        disabled={isBusy || !canSave || !telemetryAdapterGuideDraft}
        className="avl-btn avl-btn-primary h-10 px-3 disabled:opacity-50"
      >
        <Save size={16} />
        연결 가이드 저장
      </button>
    </div>
  );
}
