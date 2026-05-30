"use client";

import type { BuildDeliveryPreference } from "@/lib/build-delivery";
import type { ProductSurfaceKey, ProductSurfaceProfile } from "@/lib/product-surface";
import { IdeaExtractionReplaySummary } from "@/components/idea-extraction-replay-summary";
import { IdeaExtractionStatusGrid } from "@/components/idea-extraction-status-grid";
import { RecommendedIdeaCard } from "@/components/recommended-idea-card";
import { RecommendedIdeaEmptyState } from "@/components/recommended-idea-empty-state";

type IdeaExtractionRightPanelIdea = {
  id: string;
  name: string;
  one_liner: string;
  productSurface: ProductSurfaceProfile;
  validationRationale: string;
  validationScore: number;
};

type IdeaExtractionRightPanelProps = {
  buildDeliveryLabel: string;
  buildDeliveryPhrase: string;
  buildDeliveryPreference: BuildDeliveryPreference;
  canSave: boolean;
  extractionRunEngine?: "openai" | "rules" | "fallback" | null;
  extractionRunNote?: string | null;
  gateBadgeClassName?: string | null;
  gateLabel?: string | null;
  gateNextAction?: string | null;
  gateSummary?: string | null;
  hasGeneratedIdeaSlots: boolean;
  hasReplaySummary: boolean;
  idea: IdeaExtractionRightPanelIdea | null;
  isSaveLocked: boolean;
  isSaving: boolean;
  onBuildDeliveryPreferenceChange: (preference: BuildDeliveryPreference) => void;
  onEdit: () => void;
  onProductSurfaceChange: (value: ProductSurfaceKey) => void;
  onSave: () => void;
  readinessScore: number;
  replayAiOnlyCount?: number | null;
  replayConsensusCount?: number | null;
  replayNote?: string | null;
  strategyScore: number;
};

export function IdeaExtractionRightPanel({
  buildDeliveryLabel,
  buildDeliveryPhrase,
  buildDeliveryPreference,
  canSave,
  extractionRunEngine,
  extractionRunNote,
  gateBadgeClassName,
  gateLabel,
  gateNextAction,
  gateSummary,
  hasGeneratedIdeaSlots,
  hasReplaySummary,
  idea,
  isSaveLocked,
  isSaving,
  onBuildDeliveryPreferenceChange,
  onEdit,
  onProductSurfaceChange,
  onSave,
  readinessScore,
  replayAiOnlyCount,
  replayConsensusCount,
  replayNote,
  strategyScore,
}: IdeaExtractionRightPanelProps) {
  return (
    <div data-smoke="idea-extraction-right-panel" className="grid min-w-0 gap-3">
      {idea ? (
        <RecommendedIdeaCard
          buildDeliveryLabel={buildDeliveryLabel}
          buildDeliveryPhrase={buildDeliveryPhrase}
          buildDeliveryPreference={buildDeliveryPreference}
          canSave={canSave}
          gateBadgeClassName={gateBadgeClassName}
          gateLabel={gateLabel}
          gateNextAction={gateNextAction}
          gateSummary={gateSummary}
          idea={idea}
          isSaveLocked={isSaveLocked}
          isSaving={isSaving}
          onBuildDeliveryPreferenceChange={onBuildDeliveryPreferenceChange}
          onEdit={onEdit}
          onProductSurfaceChange={onProductSurfaceChange}
          onSave={onSave}
          readinessScore={readinessScore}
          strategyScore={strategyScore}
        />
      ) : (
        <RecommendedIdeaEmptyState />
      )}

      <IdeaExtractionStatusGrid
        extractionRunEngine={extractionRunEngine}
        extractionRunNote={extractionRunNote}
        hasGeneratedIdeaSlots={hasGeneratedIdeaSlots}
      />
      {hasReplaySummary ? (
        <IdeaExtractionReplaySummary
          aiOnlyCount={replayAiOnlyCount ?? 0}
          consensusCount={replayConsensusCount ?? 0}
          note={replayNote ?? ""}
        />
      ) : null}
    </div>
  );
}
