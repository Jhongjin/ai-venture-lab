"use client";

import { Step8LearningReportOverview } from "@/components/step8-learning-report-overview";
import {
  Step8ProductTelemetryFunnel,
  type Step8ProductTelemetryFunnelRow,
} from "@/components/step8-product-telemetry-funnel";
import { Step8TelemetryReportDraft } from "@/components/step8-telemetry-report-draft";
import {
  Step8TelemetryTaxonomyChecklist,
  type Step8TelemetryTaxonomyItem,
} from "@/components/step8-telemetry-taxonomy-checklist";
import type { TelemetryEvent } from "@/lib/venture-data";

type Step8LearningSignalCard = {
  label: string;
  value: string;
  detail: string;
};

type Step8OperatorReportProps = {
  canSave: boolean;
  categoryLabels: Record<string, string>;
  categoryTone: Record<string, string>;
  eventLabels: Record<string, string>;
  formatTelemetryProperties: (properties: TelemetryEvent["properties"]) => string;
  formatTelemetryTime: (value: string) => string;
  isBusy: boolean;
  learningSignalCards: ReadonlyArray<Step8LearningSignalCard>;
  learningTelemetryReportDraft: string;
  onCopyFunnel: () => void;
  onCopyReport: () => void;
  onSaveFunnel: () => void;
  onSaveReport: () => void;
  productTelemetryFunnelDraft: string;
  productTelemetryFunnelRows: ReadonlyArray<Step8ProductTelemetryFunnelRow>;
  productTelemetryMaxCount: number;
  productTelemetryTaxonomyRows: ReadonlyArray<Step8TelemetryTaxonomyItem>;
  selectedTelemetryEvents: ReadonlyArray<TelemetryEvent>;
};

export function Step8OperatorReport({
  canSave,
  categoryLabels,
  categoryTone,
  eventLabels,
  formatTelemetryProperties,
  formatTelemetryTime,
  isBusy,
  learningSignalCards,
  learningTelemetryReportDraft,
  onCopyFunnel,
  onCopyReport,
  onSaveFunnel,
  onSaveReport,
  productTelemetryFunnelDraft,
  productTelemetryFunnelRows,
  productTelemetryMaxCount,
  productTelemetryTaxonomyRows,
  selectedTelemetryEvents,
}: Step8OperatorReportProps) {
  return (
    <details className="mt-4 border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950">
        필요할 때만 여는 운영자용 리포트
      </summary>
      <Step8LearningReportOverview
        canSave={canSave}
        isBusy={isBusy}
        learningSignalCards={learningSignalCards}
        learningTelemetryReportDraft={learningTelemetryReportDraft}
        onCopyReport={onCopyReport}
        onSaveReport={onSaveReport}
      />

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.65fr)]">
        <Step8ProductTelemetryFunnel
          canSave={canSave}
          isBusy={isBusy}
          onCopyFunnel={onCopyFunnel}
          onSaveFunnel={onSaveFunnel}
          productTelemetryFunnelDraft={productTelemetryFunnelDraft}
          productTelemetryFunnelRows={productTelemetryFunnelRows}
          productTelemetryMaxCount={productTelemetryMaxCount}
        />

        <Step8TelemetryTaxonomyChecklist items={productTelemetryTaxonomyRows} />
      </div>

      <Step8TelemetryReportDraft
        categoryLabels={categoryLabels}
        categoryTone={categoryTone}
        eventLabels={eventLabels}
        formatTelemetryProperties={formatTelemetryProperties}
        formatTelemetryTime={formatTelemetryTime}
        learningTelemetryReportDraft={learningTelemetryReportDraft}
        selectedTelemetryEvents={selectedTelemetryEvents}
      />
    </details>
  );
}
