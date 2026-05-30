"use client";

import type { TelemetryEvent } from "@/lib/venture-data";

type Step8TelemetryReportDraftProps = {
  categoryLabels: Record<string, string>;
  categoryTone: Record<string, string>;
  eventLabels: Record<string, string>;
  formatTelemetryProperties: (properties: TelemetryEvent["properties"]) => string;
  formatTelemetryTime: (value: string) => string;
  learningTelemetryReportDraft: string;
  selectedTelemetryEvents: ReadonlyArray<TelemetryEvent>;
};

export function Step8TelemetryReportDraft({
  categoryLabels,
  categoryTone,
  eventLabels,
  formatTelemetryProperties,
  formatTelemetryTime,
  learningTelemetryReportDraft,
  selectedTelemetryEvents,
}: Step8TelemetryReportDraftProps) {
  return (
    <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.65fr)]">
      <div className="border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">최근 이벤트</h3>
          <span className="avl-pill avl-pill-neutral">{selectedTelemetryEvents.length}개</span>
        </div>
        <div className="grid gap-2">
          {selectedTelemetryEvents.slice(0, 12).map((event) => {
            const propertiesSummary = formatTelemetryProperties(event.properties);

            return (
              <div key={event.id} className="border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">
                      {eventLabels[event.event_name] ?? event.event_name}
                    </span>
                    <span className={categoryTone[event.event_category] ?? "avl-pill avl-pill-neutral"}>
                      {categoryLabels[event.event_category] ?? event.event_category}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{formatTelemetryTime(event.occurred_at)}</span>
                </div>
                {propertiesSummary ? <p className="mt-2 text-xs leading-5 text-slate-500">{propertiesSummary}</p> : null}
              </div>
            );
          })}
          {selectedTelemetryEvents.length === 0 ? (
            <div className="border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-5 text-slate-600">
              아직 이 아이디어에 연결된 이벤트가 없습니다. 사업성 평가 저장, 리스크 추가, 검증 계획/제작 자료 저장 같은 행동을 하면
              자동으로 쌓입니다.
            </div>
          ) : null}
        </div>
      </div>

      <div className="border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-950">학습 리포트 초안</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">운영 이벤트를 다음 빌드 판단 언어로 바꿉니다.</p>
        </div>
        <textarea
          value={learningTelemetryReportDraft}
          readOnly
          rows={22}
          className="avl-textarea w-full resize-y bg-slate-50 font-mono text-sm leading-6 text-slate-700"
        />
      </div>
    </div>
  );
}
