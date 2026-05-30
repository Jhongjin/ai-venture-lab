"use client";

import { Step8TelemetryConnectionDetails } from "@/components/step8-telemetry-connection-details";
import { Step8TelemetryGuideActions } from "@/components/step8-telemetry-guide-actions";
import { Step8TelemetrySnippetCards } from "@/components/step8-telemetry-snippet-cards";

type Step8TelemetryAdapterGuideProps = {
  canSave: boolean;
  ideaId: string;
  isBusy: boolean;
  onCopyDraft: (body: string, label: string) => void;
  onSaveGuide: () => void;
  telemetryAdapterGuideDraft: string;
  telemetryClientHelperSnippet: string;
  telemetryEnvSnippet: string;
  telemetryNextRouteSnippet: string;
  telemetrySmokeCommandSnippet: string;
};

export function Step8TelemetryAdapterGuide({
  canSave,
  ideaId,
  isBusy,
  onCopyDraft,
  onSaveGuide,
  telemetryAdapterGuideDraft,
  telemetryClientHelperSnippet,
  telemetryEnvSnippet,
  telemetryNextRouteSnippet,
  telemetrySmokeCommandSnippet,
}: Step8TelemetryAdapterGuideProps) {
  return (
    <div className="mt-4 avl-card p-4 text-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">제작팀 전달</div>
          <h3 className="mt-2 text-base font-semibold text-slate-950">첫 버전 사용 신호 연결</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">출시된 앱의 사용자 행동을 받아오는 전달용 정보입니다.</p>
        </div>
        <Step8TelemetryGuideActions
          canSave={canSave}
          isBusy={isBusy}
          onCopyDraft={onCopyDraft}
          onSaveGuide={onSaveGuide}
          telemetryAdapterGuideDraft={telemetryAdapterGuideDraft}
        />
      </div>
      <details className="mt-4 border border-slate-200 bg-slate-50 p-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">연결 정보 열기</summary>
        <div className="mt-3 border border-slate-200 bg-white p-3">
          <p className="text-sm leading-6 text-slate-600">
            아래 값은 개발자나 Codex 작업 세션에 전달할 때만 확인합니다. 비밀값은 브라우저나 문서에 저장하지 않습니다.
          </p>
          <Step8TelemetryConnectionDetails ideaId={ideaId} />
          <Step8TelemetrySnippetCards
            onCopyDraft={onCopyDraft}
            telemetryClientHelperSnippet={telemetryClientHelperSnippet}
            telemetryEnvSnippet={telemetryEnvSnippet}
            telemetryNextRouteSnippet={telemetryNextRouteSnippet}
            telemetrySmokeCommandSnippet={telemetrySmokeCommandSnippet}
          />
        </div>
      </details>
    </div>
  );
}
